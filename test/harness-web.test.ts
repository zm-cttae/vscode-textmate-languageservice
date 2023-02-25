'use strict';

import * as path from 'path';
import { runTests as runTestsInBrowser } from '@vscode/test-web';

import type { BrowserType } from '@vscode/test-web';

async function main() {
	try {
		const extensionDevelopmentPath = path.resolve(__dirname, path.normalize('../../../..'));
		const extensionTestsPath = path.resolve(__dirname, path.normalize('./runner-web.test.js'));
		const extensionPaths = [];
		const browserType: BrowserType = 'chromium';
		const port = 8080;
		const headless = true;
		const devTools = false;
		// Web environment.
		await runTestsInBrowser({
				extensionDevelopmentPath,
				extensionTestsPath,
				extensionPaths,
				browserType, port, headless, devTools
		});
	} catch (e) {
		console.error('Failed to run tests');
		throw e;
	}
}

main();
