type VSCodeMessage = { type: string; payload?: any };
const vscode = acquireVsCodeApi();

export function postMessage(type: string, payload?: any) {
    vscode.postMessage({ type, payload });
}

export function subscribeMessage(handler: (msg: VSCodeMessage) => void) {
    const cb = (ev: MessageEvent) => handler(ev.data);
    window.addEventListener("message", cb);
    return () => window.removeEventListener("message", cb);
}
