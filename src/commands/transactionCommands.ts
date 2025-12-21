import * as vscode from 'vscode';

export function transactionStatusCycleHandler() {
	const editor = vscode.window.activeTextEditor;
	if (editor) {
		const currentLine = editor.document.lineAt(editor.selection.active.line);

		if (currentLine.text.includes("!")) {
			editor.edit(editBuilder => {
				editBuilder.replace(currentLine.range, currentLine.text.replace("!", "*"));
			});
		} else if (currentLine.text.includes("*")) {
			editor.edit(editBuilder => {
				editBuilder.replace(currentLine.range, currentLine.text.replace("*", "!"));
			});
		}
	}
}
