/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
'use strict';

import glob from 'glob';
import path from 'path';
import vscode from 'vscode';
import fs from 'fs';

import getCoreNodeModule from './getCoreNodeModule';
import vscodeTextmate from 'vscode-textmate';
import vscodeOniguruma from 'vscode-oniguruma';
const vscodeOnigurumaModule = getCoreNodeModule<typeof vscodeOniguruma>('vscode-oniguruma');

const wasmPath = glob.sync(path.resolve(vscode.env.appRoot, '+(node_modules|node_modules.asar|node_modules.asar.unpacked)/vscode-oniguruma/release/onig.wasm'))[0];

let onigurumaLib: Promise<vscodeTextmate.IOnigLib> | null = null;

export function getOniguruma(): Promise<vscodeTextmate.IOnigLib> {
	if (!onigurumaLib) {
		const wasmBin = fs.readFileSync(wasmPath).buffer;
		onigurumaLib = (<Promise<any>>vscodeOnigurumaModule.loadWASM(wasmBin)).then(function(_: any) {
			return {
				createOnigScanner(patterns: string[]) { return new vscodeOnigurumaModule.OnigScanner(patterns); },
				createOnigString(s: string) { return new vscodeOnigurumaModule.OnigString(s); }
			};
		});
	}
	return onigurumaLib;
}