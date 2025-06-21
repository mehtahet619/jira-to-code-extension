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
        const CLIENT_ID = process.env.ATLASSIAN_CLIENT_ID!;
        const CLIENT_SECRET = process.env.ATLASSIAN_CLIENT_SECRET!;
        const REDIRECT_URI = process.env.ATLASSIAN_REDIRECT_URI!;

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
