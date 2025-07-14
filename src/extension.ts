import * as vscode from 'vscode';
import { LedgerDocumentFormatter } from './formatter';

export function activate(context: vscode.ExtensionContext) {
  const formatterRegistration = vscode.languages.registerDocumentFormattingEditProvider('ledger', new LedgerDocumentFormatter());
  context.subscriptions.push(formatterRegistration);
}