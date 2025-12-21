import * as vscode from 'vscode';
import { LedgerDocumentFormatter } from './formatter';
import { registerCommands } from './commands';
import { LedgerAccountCompletion } from './completion';

export function activate(context: vscode.ExtensionContext) {

	console.log('Extension "ledger-cli" is now active!');

	const formatterRegistration = vscode.languages.registerDocumentFormattingEditProvider('ledger', new LedgerDocumentFormatter());
	context.subscriptions.push(formatterRegistration);

	const completionRegistration = vscode.languages.registerCompletionItemProvider('ledger', new LedgerAccountCompletion());
	context.subscriptions.push(completionRegistration);

	registerCommands(context);
}

export function deactivate() { }
