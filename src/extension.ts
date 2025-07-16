import * as vscode from 'vscode';
import { LedgerDocumentFormatter } from './formatter';

export function activate(context: vscode.ExtensionContext) {

	console.log('Extension "ledger-cli" is now active!');

	const formatterRegistration = vscode.languages.registerDocumentFormattingEditProvider('ledger', new LedgerDocumentFormatter());
	context.subscriptions.push(formatterRegistration);
}

export function deactivate() { }
