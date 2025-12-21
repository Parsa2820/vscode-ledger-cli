import * as vscode from 'vscode';

export class LedgerAccountCompletion implements vscode.CompletionItemProvider {
  accounts: string[] = [];

  constructor() {
    const defaultAccountsFile = vscode.Uri.joinPath(vscode.extensions.getExtension('parsa2820.ledger-cli')!.extensionUri, 'examples', 'accounts.ledger').fsPath;
    const accountFiles = vscode.workspace.getConfiguration('ledger').get<string[]>('accountFiles', []);
    if (accountFiles.length === 0) {
      accountFiles.push(defaultAccountsFile);
    }
    accountFiles.forEach(file => {
      this.loadAccountFile(this.resolveFilePath(file)).then(accounts => {
        this.accounts.push(...accounts);
      });
    });
  }

  provideCompletionItems(document: vscode.TextDocument, position: vscode.Position, token: vscode.CancellationToken, context: vscode.CompletionContext): vscode.ProviderResult<vscode.CompletionList<vscode.CompletionItem> | vscode.CompletionItem[]> {
    return this.accounts.map(account => new vscode.CompletionItem(account, vscode.CompletionItemKind.Variable));
  }

  resolveCompletionItem?(item: vscode.CompletionItem, token: vscode.CancellationToken): vscode.ProviderResult<vscode.CompletionItem> {
    throw new Error('Method not implemented.');
  }

  private resolveFilePath(file: string) {
    if (file.startsWith('~')) {
      const homeDir = process.env.HOME || process.env.USERPROFILE || '';
      return file.replace('~', homeDir);
    } else if (!file.startsWith('/') && !file.match(/^[a-zA-Z]:\\/)) {
      const workspaceFolders = vscode.workspace.workspaceFolders;
      if (workspaceFolders && workspaceFolders.length > 0) {
        return vscode.Uri.joinPath(workspaceFolders[0].uri, file).fsPath;
      }
    }
    return file;
  }

  private async loadAccountFile(filePath: string): Promise<string[]> {
    try {
      const fileUri = vscode.Uri.file(filePath);
      const fileData = await vscode.workspace.fs.readFile(fileUri);
      const fileText = Buffer.from(fileData).toString('utf8');
      return this.loadAccounts(fileText);
    } catch (error) {
      console.error(`Error reading account file ${filePath}:`, error);
      return [];
    }
  }

  private loadAccounts(fileText: string): string[] {
    const accounts: string[] = [];
    const lines = fileText.split(/\r?\n/);
    for (const line of lines) {
      if (this.isAccountDeclarationLine(line)) {
        const account = this.extractAccountDeclarationLineEntry(line);
        if (account) {
          accounts.push(account);
        }
      }
    }
    return accounts;
  }

  private isAccountDeclarationLine(text: string): boolean {
    return this.getAccountDeclarationPattern().test(text);
  }

  private extractAccountDeclarationLineEntry(text: string): string | null {
    const pattern = this.getAccountDeclarationPattern();
    const match = pattern.exec(text);
    if (match && match.groups) {
      return match.groups['account'].trim();
    }
    return null;
  }

  private getAccountDeclarationPattern(): RegExp {
    const accountNamePattern = /(?<account>[\[\(]?[A-Za-z0-9:_\-]+)[\]\)]?/;
    const commentPattern = /\s*(?<comment>[;#%\|\*].*)?/;
    return new RegExp(
      "^account\\s" +
      accountNamePattern.source +
      commentPattern.source +
      "$"
    );
  }
}