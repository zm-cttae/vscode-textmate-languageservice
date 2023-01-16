/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
'use strict';

import path from 'path';
import fs from 'fs';

import getCoreNodeModule from './getCoreNodeModule';
import vscodeTextmate from 'vscode-textmate';
const vscodeTextmateModule = getCoreNodeModule<typeof vscodeTextmate>('vscode-textmate');

export interface LanguageRegistration {
	id: string;
	extensions?: string[];
	filenames?: string[]
}

export interface GrammarRegistration {
	language: string;
	scopeName: string;
	path: string;
	embeddedLanguages?: { [scopeName: string]: string; };
	grammar?: Promise<vscodeTextmate.IRawGrammar>;
}

export class Resolver implements vscodeTextmate.RegistryOptions {
	public readonly language2id: { [languages: string]: number; };
	private _lastLanguageId: number;
	private _id2language: string[];
	private readonly _grammars: GrammarRegistration[];
	private readonly _languages: LanguageRegistration[];
	public readonly onigLib: Promise<vscodeTextmate.IOnigLib>;

	constructor(grammars: GrammarRegistration[], languages: LanguageRegistration[], onigLibPromise: Promise<vscodeTextmate.IOnigLib>) {
		this._grammars = grammars;
		this._languages = languages;
		this.onigLib = onigLibPromise;

		this.language2id = Object.create(null);
		this._lastLanguageId = 0;
		this._id2language = [];

		for (let i = 0; i < this._languages.length; i++) {
			let languageId = ++this._lastLanguageId;
			this.language2id[this._languages[i].id] = languageId;
			this._id2language[languageId] = this._languages[i].id;
		}
	}

	public findLanguageByExtension(fileExtension: string): string | null {
		for (let i = 0; i < this._languages.length; i++) {
			let language = this._languages[i];

			if (!language.extensions) {
				continue;
			}

			for (let j = 0; j < language.extensions.length; j++) {
				let extension = language.extensions[j];

				if (extension === fileExtension) {
					return language.id;
				}
			}
		}

		return null;
	}

	public findLanguageByFilename(filename: string): string | null {
		for (let i = 0; i < this._languages.length; i++) {
			let language = this._languages[i];

			if (!language.filenames) {
				continue;
			}

			for (let j = 0; j < language.filenames.length; j++) {
				let lFilename = language.filenames[j];

				if (filename === lFilename) {
					return language.id;
				}
			}
		}

		return null;
	}

	public findScopeByFilename(filename: string): string | null {
		let language = this.findLanguageByExtension(path.extname(filename)) || this.findLanguageByFilename(filename);
		if (language) {
			let grammar = this.findGrammarByLanguage(language);
			if (grammar) {
				return grammar.scopeName;
			}
		}
		return null;
	}

	public findGrammarByLanguage(language: string): GrammarRegistration {
		for (let i = 0; i < this._grammars.length; i++) {
			let grammar = this._grammars[i];

			if (grammar.language === language) {
				return grammar;
			}
		}

		throw new Error('Could not findGrammarByLanguage for ' + language);
	}

	public async loadGrammar(scopeName: string): Promise<vscodeTextmate.IRawGrammar | null> {
		for (let i = 0; i < this._grammars.length; i++) {
			let grammar = this._grammars[i];
			if (grammar.scopeName === scopeName) {
				if (!grammar.grammar) {
					grammar.grammar = readGrammarFromPath(grammar.path);
				}
				return grammar.grammar;
			}
		}
		//console.warn('test resolver: missing grammar for ' + scopeName);
		return null;
	}
}

function readGrammarFromPath(path: string) : Promise<vscodeTextmate.IRawGrammar> {
	return new Promise(function(c,e) {
		fs.readFile(path, function(error, content) {
			if (error) {
				e(error);
			} else {
				c(vscodeTextmateModule.parseRawGrammar(content.toString(), path));
			}
		});
	});
}