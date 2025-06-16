import * as vscode from "vscode";
import { FromWebview } from "../constants/messageTypes";
import { log } from "../utils/logger";
import dotenv from "dotenv";
import { initiateJiraAuth } from "../services/initiateJiraAuth";

dotenv.config();

const CLIENT_ID = process.env.ATLASSIAN_CLIENT_ID! || "yO4sa3yAvRP3pHJSFIHoPsYaorOlbI7q";
const REDIRECT_URI =
    process.env.ATLASSIAN_REDIRECT_URI! || "vscode://umangdalvadi.jira-to-code/receive-jira-token";

export async function handleWebviewMessage(
    message: any,
    panel: vscode.WebviewPanel,
    context: vscode.ExtensionContext
) {
    log("✅ Received from Webview:", message);

    switch (message.type) {
        case FromWebview.SendJiraUrl:
            log("🔗 Processing Jira URL:", message.payload.jiraUrl);

            const secretStorage = context.secrets;
            const token = await secretStorage.get("jira_access_token");

            if (token) {
                vscode.window.showInformationMessage("✅ Already authenticated with Jira.");
                log("🔑 Found existing Jira token in secret storage:", token);
                // You can now send token back to Webview or continue with Jira API calls
            } else {
                initiateJiraAuth();
            }

            break;

        default:
            log("⚠️ Unknown message type:", message.type);
    }
}
