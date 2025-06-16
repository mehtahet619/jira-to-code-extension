// src/handlers/jiraOAuthCallbackHandler.ts
import * as vscode from "vscode";
import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

export async function handleJiraOAuthCallback(uri: vscode.Uri, context: vscode.ExtensionContext) {
    const query = new URLSearchParams(uri.query);
    const code = query.get("code");
    const state = query.get("state");

    if (!code) {
        vscode.window.showErrorMessage("❌ Authorization code is missing.");
        return;
    }

    try {
        const CLIENT_ID = process.env.ATLASSIAN_CLIENT_ID! || "yO4sa3yAvRP3pHJSFIHoPsYaorOlbI7q";
        const CLIENT_SECRET =
            process.env.ATLASSIAN_CLIENT_SECRET! ||
            "ATOAS8SVqDLRpUZFr_f7ZSN8GzddCmc12C1rt3qk7vxz8lAQkEhAOTDAqTivPQsQcVtU0B0238EE";
        const REDIRECT_URI =
            process.env.ATLASSIAN_REDIRECT_URI! || "http://localhost:5173/callback";

        const tokenResponse = await axios.post("https://auth.atlassian.com/oauth/token", {
            grant_type: "authorization_code",
            client_id: CLIENT_ID,
            client_secret: CLIENT_SECRET,
            code,
            redirect_uri: REDIRECT_URI,
        });

        const { access_token, refresh_token } = tokenResponse.data;

        await context.secrets.store("jira_access_token", access_token);
        await context.secrets.store("jira_refresh_token", refresh_token);

        vscode.window.showInformationMessage("✅ Successfully authenticated with Jira.");
    } catch (err: any) {
        console.error("❌ Token exchange failed:", err?.response?.data || err.message);
        vscode.window.showErrorMessage("❌ Failed to authenticate with Jira.");
    }
}
