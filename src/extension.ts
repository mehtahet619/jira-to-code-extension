import * as vscode from "vscode";

export async function activate(context: vscode.ExtensionContext) {
  console.log('Congratulations, your extension "jira-to-code" is now active!');

  const disposable = vscode.commands.registerCommand("jira-to-code.ai", () => {
    vscode.window.showInformationMessage("Hello World from Jira-to-Code!");
  });

  context.subscriptions.push(disposable);
}

export function deactivate() {}
