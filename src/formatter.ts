import * as vscode from 'vscode';

export class LedgerDocumentFormatter implements vscode.DocumentFormattingEditProvider {
  provideDocumentFormattingEdits(
    document: vscode.TextDocument
  ): vscode.TextEdit[] {
    const edits: vscode.TextEdit[] = [];

    let longestAccountName = "";
    let longestAccountAmount = "";
    for (let i = 0; i < document.lineCount; i++) {
      const line = document.lineAt(i);

      if (this.isAccountLine(line.text)) {
        const [account, amount, comment] = this.extractAccountLineEntry(line.text);
        if (account.length > longestAccountName.length) {
          longestAccountName = account;
        }
        if (amount.length > longestAccountAmount.length) {
          longestAccountAmount = amount;
        }
      }
    }

    let emptyPreviousLine = false;

    for (let i = 0; i < document.lineCount; i++) {
      const line = document.lineAt(i);

      if (line.isEmptyOrWhitespace) {
        if (emptyPreviousLine) {
          edits.push(vscode.TextEdit.delete(line.rangeIncludingLineBreak));
        }
        emptyPreviousLine = true;
      } else {
        emptyPreviousLine = false;
      }

      if (!this.isAccountLine(line.text)) {
        continue;
      }

      const [account, amount, comment] = this.extractAccountLineEntry(line.text);

      const paddedAccount = account.padEnd(longestAccountName.length);
      let formattedLine = `  ${paddedAccount}`;
      if (amount) {
        const paddedAmount = amount.padStart(longestAccountAmount.length);
        formattedLine += `  ${paddedAmount}`;
      }
      if (comment) {
        formattedLine += `  ${comment}`;
      }
      formattedLine = formattedLine.trimEnd();
      edits.push(vscode.TextEdit.replace(line.range, formattedLine));
    }

    return edits;
  }

  private isAccountLine(text: string): boolean {
    return this.getAccountLinePattern().test(text);
  }

  private extractAccountLineEntry(text: string): [string, string, string] {
    const pattern = this.getAccountLinePattern();
    const match = text.match(pattern);
    if (match) {
      const account = match.groups?.account || '';
      const amount = match.groups?.amount || '';
      const comment = match.groups?.comment || '';
      return [account, amount, comment];
    }
    return ['', '', ''];
  }

  private getAccountLinePattern() {
    const whitespacePattern = /\s{2,}/;
    const accountNamePattern = /(?<account>[\[\(]?[A-Za-z0-9:_\-]+)[\]\)]?/;
    const amountPattern = /(?<amount>[\-+]?[\$]?[0-9,]+(?:\.[0-9]{2})?\s+[A-Z]{3})?/;
    const commentPattern = /\s*(?<comment>[;#%\|\*].*)?/;
    return new RegExp(
      "^" +
      whitespacePattern.source +
      accountNamePattern.source +
      "(" + whitespacePattern.source +
      amountPattern.source +
      ")?" +
      commentPattern.source +
      "$"
    );
  }
}