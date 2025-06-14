import * as vscode from "vscode";
import { FromWebview, ToWebview } from "../constants/messageTypes";
import { log } from "../utils/logger";

export function handleWebviewMessage(message: any, panel: vscode.WebviewPanel) {
    log("✅ Received from Webview:", message);
    switch (message.type) {
        case FromWebview.GetData:
            const user = { name: "Umang Dalvadi", status: "Pro Developer 🚀" };
            panel.webview.postMessage({ type: ToWebview.DataResponse, payload: user });
            break;
        default:
            log("⚠️ Unknown message type:", message.type);
    }
}
