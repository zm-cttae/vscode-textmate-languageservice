'use strict';

import * as path from 'node:path';
import { runTests as runTestsInBrowser } from '@vscode/test-web';

import type { BrowserType } from '@vscode/test-web';

async function main() {
	try {
		const extensionDevelopmentPath = path.resolve(__dirname, '../../../..');
		const extensionTestsPath = path.resolve(__dirname, './runner-web.test.js');
		const browserType: BrowserType = 'chromium';
		const port = 8080;
		const headless = true;
		const devTools = true;
		// Web environment.
		await runTestsInBrowser({
				extensionTestsPath,
				extensionDevelopmentPath,
				browserType, port, headless, devTools
		});
	} catch (err) {
		console.error('Failed to run tests');
		process.exit(1);
	}
}

main();