import * as vscode from "vscode";
import { FromWebview, ToWebview } from "../constants/messageTypes";
import logger from "../utils/logger";
import { initiateJiraAuth } from "../services/initiateJiraAuth";
import { fetchJiraAndExtract } from "../services/fetchJiraTicketDetails";

export async function handleWebviewMessage(
    message: any,
    panel: vscode.WebviewPanel,
    context: vscode.ExtensionContext
) {
    logger.info("✅ Received from Webview:", message);

    switch (message.type) {
        case FromWebview.SendJiraUrl:
            const jiraUrl = message.payload.jiraUrl;
            const token = await context.secrets.get("jira_access_token");

            // context.secrets.delete("jira_access_token");
            // context.secrets.delete("jira_refresh_token");
            if (!jiraUrl) {
                vscode.window.showErrorMessage("❌ Jira URL is missing.");
                return;
            }

            if (!token) {
                vscode.window.showWarningMessage("🔐 Please authenticate with Jira first.");
                initiateJiraAuth();
                return;
            }

            try {
                vscode.window.showInformationMessage(
                    "🧾 Fetching Jira issue and extracting insights..."
                );

                const result = await fetchJiraAndExtract(jiraUrl, token);

                panel.webview.postMessage({
                    type: ToWebview.JiraDetailsFetched,
                    payload: result,
                });
            } catch (err: any) {
                console.error("❌ Failed to fetch Jira ticket or extract requirements:", err);
                vscode.window.showErrorMessage("❌ Failed to fetch Jira ticket or analyze it.");
            }

            break;

        default:
            logger.warn("⚠️ Unknown message type:", message.type);
    }
}
