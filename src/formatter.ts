import * as vscode from 'vscode';

export class LedgerDocumentFormatter implements vscode.DocumentFormattingEditProvider {
  provideDocumentFormattingEdits(
    document: vscode.TextDocument
  ): vscode.TextEdit[] {
    const edits: vscode.TextEdit[] = [];

    for (let i = 0; i < document.lineCount; i++) {
      const line = document.lineAt(i);

      const trimmed = line.text.replace(/\s+$/, '');
      if (trimmed !== line.text) {
        edits.push(vscode.TextEdit.replace(line.range, trimmed));
      }

    }

    return edits;
  }
}