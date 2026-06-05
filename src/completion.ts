import * as vscode from 'vscode';

export class LedgerAccountCompletion implements vscode.CompletionItemProvider {
  private accounts: Set<string> = new Set();
  private disposables: vscode.Disposable[] = [];

  constructor(context: vscode.ExtensionContext) {
    // Initial load
    this.loadAllAccounts();

    // Watch for configuration changes
    const configWatcher = vscode.workspace.onDidChangeConfiguration((event) => {
      if (event.affectsConfiguration('ledger.accountFiles')) {
        this.loadAllAccounts();
      }
    });
    this.disposables.push(configWatcher);

    // Watch for .ledger file changes in workspace
    const fileWatcher = vscode.workspace.createFileSystemWatcher('**/*.ledger', false, false, false);
    fileWatcher.onDidChange(() => this.loadAllAccounts());
    fileWatcher.onDidCreate(() => this.loadAllAccounts());
    fileWatcher.onDidDelete(() => this.loadAllAccounts());
    this.disposables.push(fileWatcher);

    context.subscriptions.push(...this.disposables);
  }

  private async loadAllAccounts(): Promise<void> {
    const newAccounts = new Set<string>();

    // Find all .ledger files in workspace
    const ledgerFiles = await vscode.workspace.findFiles('**/*.ledger', '**/node_modules/**', 1000);

    // Load from found files
    for (const fileUri of ledgerFiles) {
      const accounts = await this.loadAccountFile(fileUri.fsPath);
      accounts.forEach(account => newAccounts.add(account));
    }

    // Also load from configured account files
    const configuredFiles = vscode.workspace.getConfiguration('ledger').get<string[]>('accountFiles', []);
    for (const file of configuredFiles) {
      const resolvedPath = this.resolveFilePath(file);
      const accounts = await this.loadAccountFile(resolvedPath);
      accounts.forEach(account => newAccounts.add(account));
    }

    // Load default accounts file if no files found
    if (newAccounts.size === 0 && ledgerFiles.length === 0 && configuredFiles.length === 0) {
      const extension = vscode.extensions.getExtension('parsa2820.ledger-cli');
      if (extension) {
        const defaultAccountsFile = vscode.Uri.joinPath(extension.extensionUri, 'examples', 'accounts.ledger').fsPath;
        const accounts = await this.loadAccountFile(defaultAccountsFile);
        accounts.forEach(account => newAccounts.add(account));
      }
    }

    this.accounts = newAccounts;
    console.log(`Ledger: Loaded ${this.accounts.size} accounts`);
  }

  provideCompletionItems(document: vscode.TextDocument, position: vscode.Position, token: vscode.CancellationToken, context: vscode.CompletionContext): vscode.ProviderResult<vscode.CompletionList<vscode.CompletionItem> | vscode.CompletionItem[]> {
    if (!this.isAccountCompletionContext(document, position)) {
      return [];
    }

    return Array.from(this.accounts).map(account => new vscode.CompletionItem(account, vscode.CompletionItemKind.Variable));
  }

  resolveCompletionItem?(item: vscode.CompletionItem, token: vscode.CancellationToken): vscode.ProviderResult<vscode.CompletionItem> {
    throw new Error('Method not implemented.');
  }

  private resolveFilePath(file: string): string {
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
      return this.parseAccounts(fileText);
    } catch (error) {
      console.debug(`Error reading account file ${filePath}:`, error);
      return [];
    }
  }

  private isAccountCompletionContext(document: vscode.TextDocument, position: vscode.Position): boolean {
    const lineText = document.lineAt(position.line).text;
    const prefix = lineText.slice(0, position.character);

    if (!prefix.trim()) {
      return false;
    }

    const trimmedPrefix = prefix.trimStart();
    if (
      trimmedPrefix.startsWith(';') ||
      trimmedPrefix.startsWith('#') ||
      trimmedPrefix.startsWith('%') ||
      trimmedPrefix.startsWith('|') ||
      trimmedPrefix.startsWith('*')
    ) {
      return false;
    }

    const directiveMatch = trimmedPrefix.match(/^(?:[@!]?(?:A|account|apply account|bucket|capture))\s+(.+)$/);
    if (directiveMatch) {
      return !/\s/.test(directiveMatch[1]);
    }

    if (!/^\s+/.test(prefix)) {
      return false;
    }

    const postingPrefix = prefix.replace(/^\s+/, '');
    return !/\s/.test(postingPrefix);
  }

  private parseAccounts(fileText: string): string[] {
    const accounts: string[] = [];
    const lines = fileText.split(/\r?\n/);
    for (const line of lines) {
      if (this.isAccountDeclarationLine(line)) {
        const account = this.extractAccountName(line);
        if (account) {
          accounts.push(account);
        }
      }
    }
    return accounts;
  }

  private isAccountDeclarationLine(text: string): boolean {
    return this.getAccountPattern().test(text);
  }

  private extractAccountName(text: string): string | null {
    const pattern = this.getAccountPattern();
    const match = pattern.exec(text);
    if (match && match.groups) {
      return match.groups['account'].trim();
    }
    return null;
  }

  private getAccountPattern(): RegExp {
    const accountNamePattern = /(?<account>[\[\(]?[A-Za-z0-9:_\-]+)[\]\)]?/;
    const commentPattern = /\s*(?<comment>[;#%\|\*].*)?/;
    return new RegExp(
      "^account\\s" +
      accountNamePattern.source +
      commentPattern.source +
      "$"
    );
  }

  dispose(): void {
    this.disposables.forEach(d => d.dispose());
  }
}