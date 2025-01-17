/// <reference path="../../../typings/token-information.api.d.ts" />
/// <reference path="../../../typings/context.d.ts" />

'use strict';

import * as vscode from 'vscode';

import { strictEqual } from '../../util/assert';
import TextmateLanguageService from '../../../src/main';
import { documentServicePromise, tokenServicePromise } from '../../util/factory';
import { BASENAMES, getSampleFileUri } from '../../util/files';
import { TextmateScopeSelector } from '../../util/common';

const {
	getScopeInformationAtPosition,
	getScopeRangeAtPosition,
	getTokenInformationAtPosition
} = TextmateLanguageService.api;
let titleData: Awaited<ReturnType<typeof getTitleData>>;

type TextmateScopeSelectorType = typeof TextmateScopeSelector.prototype;

const languageScopeMap: Record<string, string> = {
	matlab: 'entity.name.type.class.matlab',
	mediawiki: 'string.quoted.other.heading.mediawiki',
	typescript: 'entity.name.type.class.ts',
	vue: 'entity.name.type.class.ts',
};

const languageSelectorMap: Record<string, TextmateScopeSelectorType> =
	Object.fromEntries(
		Object.entries(languageScopeMap)
			.map(([k, v]) => [k, new TextmateScopeSelector(v)])
	);

const languageStandardTypeMap = {
	matlab: vscode.StandardTokenType.Other,
	mediawiki: vscode.StandardTokenType.String,
	typescript: vscode.StandardTokenType.Other,
	vue: vscode.StandardTokenType.Other,
};

suite('test/api/token-information.test.ts (src/api.ts)', function() {
	this.timeout(5000);

	this.beforeAll(async function() {
		titleData = await getTitleData();
	});

	test('getScopeInformationAtPosition(): Promise<TextmateToken>', async function() {
		void vscode.window.showInformationMessage('API `getScopeInformationAtPosition` method (src/api.ts)');

		const scopeInformation = await getScopeInformationAtPosition(titleData.document, titleData.position);

		if (globalThis.languageId === 'mediawiki') {
			this.skip();
		}

		strictEqual(scopeInformation.line, 0);
		strictEqual(scopeInformation.text, titleData.basename);

		strictEqual(scopeInformation.startIndex, titleData.token.startIndex);
		strictEqual(scopeInformation.endIndex, titleData.token.endIndex);

		strictEqual(scopeInformation.level, 0);

		const scopeType = languageScopeMap[globalThis.languageId];
		strictEqual(scopeInformation.type, scopeType);
	});

	test('getScopeRangeAtPosition(): Promise<TextmateToken>', async function() {
		void vscode.window.showInformationMessage('API `getScopeRangeAtPosition` method (src/api.ts)');

		const scopeRange = await getScopeRangeAtPosition(titleData.document, titleData.position);

		if (globalThis.languageId === 'mediawiki') {
			this.skip();
		}

		strictEqual(scopeRange.isEqual(titleData.range), true);
	});

	test('getScopeInformationAtPosition(): Promise<TextmateToken>', async function() {
		void vscode.window.showInformationMessage('API `getScopeInformationAtPosition` method (src/api.ts)');

		const tokenInformation = await getTokenInformationAtPosition(titleData.document, titleData.position);

		if (globalThis.languageId === 'mediawiki') {
			this.skip();
		}

		strictEqual(tokenInformation.range.isEqual(titleData.range), true);

		const standardType = languageStandardTypeMap[globalThis.languageId];
		strictEqual(tokenInformation.type, standardType);
	});
});

async function getTitleData() {
	const documentService = await documentServicePromise;
	const tokenService = await tokenServicePromise;

	const basename = BASENAMES[globalThis.languageId][0];
	const resource = getSampleFileUri(basename);

	const document = await documentService.getDocument(resource);
	const tokens = await tokenService.fetch(document);

	const selector = languageSelectorMap[globalThis.languageId];
	const token = tokens.find(t => t.line === 0 && selector.match(t.scopes));

	const position = new vscode.Position(token.line, token.startIndex);
	const range = new vscode.Range(token.line, token.startIndex, token.line, token.endIndex);

	return { basename, document, position, range, token };
}
