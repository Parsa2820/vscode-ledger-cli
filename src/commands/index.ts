import * as vscode from 'vscode';
import { transactionStatusCycleHandler } from './transactionCommands';

export function registerCommands(context: vscode.ExtensionContext) {
	const transactionStatusCycleCommand = vscode.commands.registerCommand(
		'ledger.transactionStatusCycle', 
		transactionStatusCycleHandler
	);
	context.subscriptions.push(transactionStatusCycleCommand);
}
