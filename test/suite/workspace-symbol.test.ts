'use strict';

import * as vscode from 'vscode';

import { isWebRuntime, matlabContext, matlabWorkspaceSymbolProviderPromise } from '../util/factory';
import { runSamplePass } from '../util/bench';

suite('test/suite/workspace-symbol.test.ts - TextmateWorkspaceSymbolProvider class (src/workspace-symbol.ts)', async function() {
	this.timeout(10000);
	test('TextmateWorkspaceSymbolProvider.provideWorkspaceSymbols(): Promise<vscode.SymbolInformation[]>', async function() {
		// Early exit + pass if we are in web runtime.
		if (isWebRuntime) {
			this.skip();
		}

		vscode.window.showInformationMessage('TextmateWorkspaceSymbolProvider class (src/workspace-symbol.ts)');
		const symbols = await workspaceSymbolProviderResult();
		await runSamplePass(matlabContext, 'workspace-symbol', 'index', symbols);
	});
});

async function workspaceSymbolProviderResult() {
	const workspaceSymbolProvider = await matlabWorkspaceSymbolProviderPromise;
	const symbols = await workspaceSymbolProvider.provideWorkspaceSymbols('obj.');
	return symbols;
}
