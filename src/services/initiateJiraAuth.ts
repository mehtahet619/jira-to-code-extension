import * as vscode from "vscode";
import dotenv from "dotenv";

dotenv.config();

const CLIENT_ID = process.env.ATLASSIAN_CLIENT_ID!;
const REDIRECT_URI = process.env.ATLASSIAN_REDIRECT_URI!;

export async function initiateJiraAuth() {
    const scopes = ["read:me", "read:jira-work", "read:account", "offline_access"];
    const scopeStr = scopes.join(" ");

    const stateObj = {
        vscode: true,
        timestamp: Date.now(),
    };
    const state = encodeURIComponent(JSON.stringify(stateObj));

    const authUrl = `https://auth.atlassian.com/authorize?audience=api.atlassian.com&client_id=${CLIENT_ID}&scope=${encodeURIComponent(
        scopeStr
    )}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&state=${state}&response_type=code&prompt=consent`;

    vscode.env.openExternal(vscode.Uri.parse(authUrl));
}
