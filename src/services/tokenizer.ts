'use strict';

import vscodeTextmate = require('vscode-textmate');
import sha1 = require('git-sha1');
import delay = require('delay');

import type { SkinnyTextDocument, SkinnyTextLine } from './document';
import type { LSP } from '..';

type Mutable<T> = {
	-readonly[P in keyof T]: T[P]
};

export interface TextmateToken extends Mutable<vscodeTextmate.IToken> {
	level: number;
	line: number;
	text: string;
	type: string;
}

export interface TextmateTokenizeLineResult extends Omit<vscodeTextmate.ITokenizeLineResult, 'tokens'> {
	readonly tokens: TextmateToken[]
}

interface TextmateTokenizerState {
	delta: number;
	continuation: boolean;
	declaration: boolean;
	line: number;
	rule: vscodeTextmate.StackElement;
	stack: number;
}

export class TextmateTokenizerService {
	constructor(private _lsp: LSP) {}

	private _state: TextmateTokenizerState = {
		delta: 0,
		continuation: false,
		declaration: false,
		line: 0,
		rule: vscodeTextmate.INITIAL,
		stack: 0
	};

	private _queue: Record<string, boolean> = {};

	private _cache: Record<string, TextmateToken[] | undefined> = {};

	public async tokenize(document: SkinnyTextDocument): Promise<TextmateToken[]> {
		const grammar = await this._lsp.grammarPromise;
		const config = await this._lsp.configPromise;

		const text = document.getText();
		const hash = sha1(text);
		const tokens: TextmateToken[] = [];

		if (this._queue[hash]) {
			while (!this._cache[hash]) {
				await delay(100);
			}
			return this._cache[hash];
		}

		if (this._cache[hash]) {
			return this._cache[hash];
		}

		this._queue[hash] = true;
		this._state.delta = 0;
		this._state.continuation = false;
		this._state.declaration = false;
		this._state.line = 0;
		this._state.rule = vscodeTextmate.INITIAL;
		this._state.stack = 0;

		for (let lineNumber = 0; lineNumber < document.lineCount; lineNumber++) {
			let line: SkinnyTextLine = document.lineAt(lineNumber);
			const lineResult = grammar.tokenizeLine(line.text, this._state.rule) as TextmateTokenizeLineResult;

			for (const token of lineResult.tokens) {
				token.type = token.scopes[token.scopes.length - 1];
				token.text = line.text.substring(token.startIndex, token.endIndex);
				token.line = lineNumber;
			}

			for (let index = 0; index < (lineResult.tokens.length - 1); index++) {
				const token = lineResult.tokens[index];
				const nextToken = lineResult.tokens[index + 1];

				if (
					(
						config.selectors.assignment.single.match(token.scopes)
						&& config.selectors.assignment.single.match(nextToken.scopes)
					)
					|| (
						config.selectors.assignment.multiple.match(token.scopes)
						&& config.selectors.assignment.multiple.match(nextToken.scopes)
						&& !config.selectors.assignment.separator.match(nextToken.scopes)
					)
				) {
					token.endIndex = nextToken.endIndex;
					token.text += nextToken.text;
					lineResult.tokens.splice(index + 1, 1);
					index--;
				}
			}

			for (let index = 0; index < lineResult.tokens.length; index++) {
				const token = lineResult.tokens[index];
				const delta = config.selectors.indentation.value(token.scopes) || 0;
				const isIndentToken = delta > 0;
				const isDedentToken = delta < 0;
				const isRedentToken = config.selectors.dedentation.match(token.scopes);
				const isDeclarationToken = isIndentToken || isRedentToken;
				const isContinuationToken = config.selectors.punctuation.continuation.match(token.scopes);

				if (!this._state.declaration) {
					if (isDedentToken) {
						this._state.stack += delta;
						let subindex =  index - 1;
						while (subindex >= 0) {
							lineResult.tokens[subindex].level += delta;
							subindex -= 1;
						}
					}
					if (isDeclarationToken) {
						this._state.delta += Math.abs(delta);
					}
				}

				if (this._state.declaration && !isRedentToken) { // handle redent e.g. ELSE-IF clause
					this._state.delta += delta;
				}

				this._state.declaration = this._state.declaration || isDeclarationToken;
				this._state.continuation = this._state.continuation || isContinuationToken;

				if (this._state.declaration && lineNumber > this._state.line) {
					if (!this._state.continuation) {
						this._state.stack += this._state.delta;
						this._state.delta = 0;
						this._state.declaration = false;
					} else {
						this._state.continuation = false;
					}
				}

				token.level = this._state.stack;
				this._state.line = lineNumber;
			}

			this._state.rule = lineResult.ruleStack;

			for (const token of lineResult.tokens) tokens.push(token);
		}

		this._cache[hash] = tokens;
		delete this._queue[hash];
		return tokens;
	}
}