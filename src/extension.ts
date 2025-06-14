import * as vscode from "vscode";
import { getHtmlForWebview } from "./getHtmlForWebview";
import { handleWebviewMessage } from "./handlers/webviewMessageHandler";
import { log } from "./utils/logger";

export function activate(context: vscode.ExtensionContext) {
    log("Extension activated");
    const disposable = vscode.commands.registerCommand("jira-to-code.ai", () => {
        const panel = vscode.window.createWebviewPanel(
            "jiraToCode",
            "Jira to Code",
            vscode.ViewColumn.One,
            {
                enableScripts: true,
                localResourceRoots: [vscode.Uri.joinPath(context.extensionUri, "webview", "dist")],
            }
        );

        panel.webview.html = getHtmlForWebview(panel.webview, context.extensionUri);

        panel.webview.onDidReceiveMessage(message => handleWebviewMessage(message, panel));
    });

    context.subscriptions.push(disposable);
}

export function deactivate() {
    log("Extension deactivated");
}
