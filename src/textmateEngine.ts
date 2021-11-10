'use strict';
import * as pkgUp from 'pkg-up';
import * as path from 'path';
import * as vscode from 'vscode';
import * as loadJsonFile from 'load-json-file';
import * as delay from 'delay';
import { IGrammarRegistration, ILanguageRegistration, Resolver } from './util/registryResolver';
import { ScopeSelector } from 'first-mate';

import getCoreNodeModule from './util/getCoreNodeModule';
import * as vsctm from 'vscode-textmate';
const vsctmModule = getCoreNodeModule<typeof vsctm>('vscode-textmate');
import * as vscodeOniguruma from 'vscode-oniguruma';
const vscodeOnigurumaModule = getCoreNodeModule<typeof vscodeOniguruma>('vscode-oniguruma');

const extensionPath = path.resolve(pkgUp.sync({ cwd: __dirname }), '../../..');
export const configurationData = loadJsonFile.sync(path.resolve(extensionPath, './textmate-configuration.json')) as any;

export interface SkinnyTextLine {
	text: string;
}

export interface SkinnyTextDocument {
	readonly uri: vscode.Uri;
	readonly version: number;
	readonly lineCount: number;

	lineAt(line: number): SkinnyTextLine;
	getText(): string;
}

type Mutable<T> = {
	-readonly[P in keyof T]: T[P]
};

export interface ITextmateToken extends Mutable<vsctm.IToken> {
	level: number;
	line: number;
	text: string;
	type: string;
}

export interface ITextmateTokenizeLineResult extends Omit<vsctm.ITokenizeLineResult, 'tokens'> {
	readonly tokens: ITextmateToken[]
}

interface ITextmateTokenizerState {
	context: boolean;
	continuation: boolean;
	declaration: boolean;
	line: number;
	rule: vsctm.StackElement;
	stack: number;
}

export const packageJSON = loadJsonFile.sync(path.resolve(extensionPath, './package.json')) as any;

export class TextmateEngine {
	constructor(
		public language: string,
		public scope: string
	) {}

	public scopes?: string[] = [];

	private _state?: ITextmateTokenizerState = {
		context: false,
		continuation: false,
		declaration: false,
		line: 0,
		rule: vsctmModule.INITIAL,
		stack: 0
	};

	private _queue: Record<string, boolean> = {};

	private _cache: Record<string, ITextmateToken[] | undefined> = {};

	private _grammars?: vsctm.IGrammar[] = [];

	public async tokenize(scope: string, document: SkinnyTextDocument): Promise<ITextmateToken[]> {
		if (!this.scopes.includes(scope)) {
			await this.load(scope);
		}

		const grammar = this._grammars[this.scopes.indexOf(scope)];

		const text = document.getText();
		const tokens: ITextmateToken[] = [];

		if (this._queue[text]) {
			while (!this._cache[text]) {
				await delay(100);
			}
			return this._cache[text];
		} else {
			this._queue[text] = true;
		}

		for (let lineNumber = 0; lineNumber < document.lineCount; lineNumber++) {
			let line: SkinnyTextLine = document.lineAt(lineNumber);
			const lineTokens = grammar.tokenizeLine(line.text, this._state.rule) as ITextmateTokenizeLineResult;

			for (const token of lineTokens.tokens) {
				token.type = token.scopes[token.scopes.length - 1];
				token.text = line.text.substring(token.startIndex, token.endIndex);
				token.line = lineNumber;
			}

			const singleAssignmentSelector = new TextmateScopeSelector(configurationData.assignment.single);
			const multipleAssignmentSelector = new TextmateScopeSelector(configurationData.assignment.multiple);
			const assignmentSeparatorSelector = new TextmateScopeSelector(configurationData.assignment.separator);

			for (let i = 0; i < (lineTokens.tokens.length - 1); i++) {
				const token = lineTokens.tokens[i];
				const nextToken = lineTokens.tokens[i + 1];

				if (typeof configurationData.assignment === 'object') {
					if (
						(
							singleAssignmentSelector.match(token.scopes)
							&& singleAssignmentSelector.match(nextToken.scopes)
						)
						|| (
							multipleAssignmentSelector.match(token.scopes)
							&& multipleAssignmentSelector.match(nextToken.scopes)
							&& !assignmentSeparatorSelector.match(nextToken.scopes)
						)
					) {
						token.endIndex = nextToken.endIndex;
						token.text += nextToken.text;
						lineTokens.tokens.splice(i + 1, 1);
						i--;
					}
				}
			}

			const continuationSelector = new TextmateScopeSelector(configurationData.punctuation.continuaton);
			const indentationSelectorMap = new TextmateScopeSelectorMap(configurationData.indentation);
			const dedentationSelector = new TextmateScopeSelector(configurationData.dedentation);

			for (const token of lineTokens.tokens) {
				this._state.declaration = (
					indentationSelectorMap.value(token.scopes) === 1
					|| dedentationSelector.match(token.scopes)
					|| this._state.declaration
				);

				if (this._state.declaration) {
					if (continuationSelector.match(token.scopes)) {
						this._state.continuation = true;
					}

					if (
						!indentationSelectorMap.has(token.scopes)
						&& !this._state.continuation
						&& lineNumber > this._state.line
					) {
						this._state.declaration = false;
						this._state.stack++;
					}
				}

				if (
					indentationSelectorMap.has(token.scopes)
					&& (!this._state.declaration || dedentationSelector.match(token.scopes))
				) {
					this._state.stack += indentationSelectorMap.value(token.scopes);
				}

				token.level = this._state.stack;
				tokens.push(token);

				this._state.line = lineNumber;
				this._state.rule = lineTokens.ruleStack;
			}
		}

		this._cache[text] = tokens;
		return tokens;
	}

	async load(scope: string): Promise<void> {
		const grammar = configurationData.grammar as IGrammarRegistration;
		grammar.path = path.resolve(extensionPath, grammar.path);
		const language = configurationData.language as ILanguageRegistration;
		const onigLibPromise = new Promise<vsctm.IOnigLib>(function(resolve, reject) {
			if (vscodeOnigurumaModule) {
				resolve({
					createOnigScanner: vscodeOnigurumaModule.createOnigScanner,
					createOnigString: vscodeOnigurumaModule.createOnigString
				});
			} else {
				reject(new TypeError('Cannot find module \'vscode-textmate\''));
			}
		});
		const resolver = new Resolver([grammar], [language], onigLibPromise);
		const registry = new vsctmModule.Registry(resolver);
		this._grammars.push(await registry.loadGrammar(grammar.scopeName));
		this.scopes.push(scope);
	}
}

export class TextmateScopeSelector {
	selectors?: ScopeSelector[];
	selector?: ScopeSelector;
	constructor(selector: string[] | string) {
		if (Array.isArray(selector)) {
			this.selectors = selector.map(function(s) {
				return new ScopeSelector(s);
			});
		} else {
			this.selector = new ScopeSelector(selector);
		}
	}
	match(scopes: string[]): boolean {
		if (!this.selectors && !this.selector) {
			return false;
		}
		if (this.selectors) {
			return this.selectors.some(function(s) {
				return s.matches(scopes);
			});
		}
		if (this.selector) {
			return this.selector.matches(scopes);
		}
	}
	include(scopes: string[][]): boolean {
		if (!this.selectors && !this.selector) {
			return false;
		}
		return scopes.some(this.match.bind(this));
	}
}

export class TextmateScopeSelectorMap {
	selectors: object;
	constructor(selectors: Record<string, number>) {
		if (typeof selectors === 'object' && selectors) {
			this.selectors = selectors;
		}
	}
	key(scopes: string[]): string {
		if (!this.selectors) {
			return;
		}
		return Object.keys(this.selectors).filter(function(s) {
			return new ScopeSelector(s).matches(scopes);
		})[0];
	}
	has(scopes: string[]): boolean {
		return typeof this.key(scopes) === 'string';
	}
	value(scopes: string[]): number {
		if (!this.selectors) {
			return;
		}
		return this.selectors[this.key(scopes)];
	}
}