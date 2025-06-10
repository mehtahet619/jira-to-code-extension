import * as vscode from "vscode";
import { getHtmlForWebview } from "./getHtmlForWebview";

export async function activate(context: vscode.ExtensionContext) {
  console.log('Congratulations, your extension "jira-to-code" is now active!');

  const disposable = vscode.commands.registerCommand("jira-to-code.ai", () => {
    vscode.window.showInformationMessage("Hello World from Jira-to-Code!");
    const panel = vscode.window.createWebviewPanel(
      "jiraToCode",
      "Jira to Code",
      vscode.ViewColumn.One,
      {
        enableScripts: true,
        localResourceRoots: [
          vscode.Uri.joinPath(context.extensionUri, "webview", "dist"),
        ],
      }
    );

    panel.webview.html = getHtmlForWebview(panel.webview, context.extensionUri);

    // panel.webview.html = getWebviewContent();

    // panel.webview.onDidReceiveMessage(async (message) => {
    //   if (message.command === "run") {
    //     const url = message.url;
    //     vscode.window.showInformationMessage(
    //       `Starting Jira to Code for ${url}`
    //     );
    //     panel.webview.postMessage({ status: "✅ Code generated" });
    //     // Call your logic here: auth → fetch ticket → GPT → git → PR
    //   }
    // });
  });

  context.subscriptions.push(disposable);
}

export function deactivate() {}

// function getWebviewContent(): string {
//   return `
//   <!DOCTYPE html>
//   <html lang="en">
//   <head>
//     <meta charset="UTF-8">
//     <meta name="viewport" content="width=device-width, initial-scale=1.0">
//     <title>Jira to Code</title>
//     <style>
//       body { font-family: sans-serif; padding: 16px; }
//       input { width: 100%; padding: 8px; margin-top: 8px; }
//       button { margin-top: 12px; padding: 8px 16px; background: #007acc; color: white; border: none; }
//     </style>
//   </head>
//   <body>
//     <h2>Jira → Code Automation</h2>
//     <label for="url">Enter Jira Ticket URL:</label>
//     <input type="text" id="url" placeholder="https://yourorg.atlassian.net/browse/DEV-123" />
//     <button onclick="send()">Run</button>
//     <script>

//       const vscode = acquireVsCodeApi();
//       function send() {
//         const url = document.getElementById('url').value;
//         vscode.postMessage({ command: 'run', url });
//       }
//     </script>
//   </body>
//   </html>
//   `;
// }
