import "./App.css";
import { useEffect, useState } from "react";
import { postMessage, subscribeMessage } from "./lib/vscodeBridge";
import { FromWebview, ToWebview } from "../../src/constants/messageTypes";

type User = { name: string; status: string };

export default function App() {
    const [user, setUser] = useState<User | null>(null);

    useEffect(() => {
        postMessage(FromWebview.GetData);
        const unsub = subscribeMessage(msg => {
            if (msg.type === ToWebview.DataResponse) {
                setUser(msg.payload);
            }
        });
        return () => unsub();
    }, []);

    return (
        <div className="p-4 text-center">
            <h1 className="text-2xl font-bold mb-4">Jira-to-Code</h1>
            {user ? (
                <p>
                    {user.name} — <span>{user.status}</span>
                </p>
            ) : (
                <p>Loading...</p>
            )}
        </div>
    );
}
