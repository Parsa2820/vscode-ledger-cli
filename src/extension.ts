import * as vscode from 'vscode';
import { LedgerDocumentFormatter } from './formatter';
import { registerCommands } from './commands';

export function activate(context: vscode.ExtensionContext) {

	console.log('Extension "ledger-cli" is now active!');

	const formatterRegistration = vscode.languages.registerDocumentFormattingEditProvider('ledger', new LedgerDocumentFormatter());
	context.subscriptions.push(formatterRegistration);

	registerCommands(context);
}

export function deactivate() { }
