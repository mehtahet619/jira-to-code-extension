import * as vscode from "vscode";
import { getHtmlForWebview } from "./getHtmlForWebview";
import { handleWebviewMessage } from "./handlers/webviewMessageHandler";
import { IntegrationService } from "./services/IntegrationService";
import logger from "./utils/logger";
import axios from "axios";
import dotenv from "dotenv";
import { handleJiraOAuthCallback } from "./services/jiraOAuthCallbackHandler";

dotenv.config();

export function activate(context: vscode.ExtensionContext) {
    logger.info("🚀 Extension activated");

    // Initialize integration service
    const integrationService = new IntegrationService();
    logger.info(`Initialized with support for: ${integrationService.getSupportedPlatforms().join(', ')}`);

    // Register command to open the webview panel
    const disposable = vscode.commands.registerCommand("jira-to-code.ai", () => {
        const panel = vscode.window.createWebviewPanel(
            "ticketToCode",
            "Ticket to Code",
            vscode.ViewColumn.One,
            {
                enableScripts: true,
                localResourceRoots: [vscode.Uri.joinPath(context.extensionUri, "webview", "dist")],
            }
        );

        panel.webview.html = getHtmlForWebview(panel.webview, context.extensionUri);

        panel.webview.onDidReceiveMessage(message => handleWebviewMessage(message, panel, context));
    });

    // ✅ Handle OAuth callback (vscode:// URI)
    const uriHandlerDisposable = vscode.window.registerUriHandler({
        async handleUri(uri: vscode.Uri) {
            await handleJiraOAuthCallback(uri, context);
        },
    });

    context.subscriptions.push(disposable, uriHandlerDisposable);
}

export function deactivate() {
    logger.info("🛑 Extension deactivated");
}
