import { useEffect, useState } from "react";

const Callback = () => {
    const [vscodeUri, setVscodeUri] = useState("");

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const code = params.get("code");
        const state = params.get("state");

        if (code && state) {
            const uri = `vscode://umangdalvadi.jira-to-code/receive-jira-token?code=${code}&state=${state}`;
            setVscodeUri(uri);

            // Auto redirect after short delay
            setTimeout(() => {
                window.location.href = uri;
            }, 2000);
        }
    }, []);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 p-6">
            <div className="bg-white shadow-lg rounded-xl p-8 max-w-md text-center">
                <h1 className="text-2xl font-bold text-gray-800 mb-2">
                    Authenticating with Jira...
                </h1>
                <p className="text-gray-600 mb-6">
                    Redirecting to VS Code. If it doesn’t happen automatically, click the button
                    below.
                </p>

                <div className="flex justify-center mb-4">
                    <svg
                        className="animate-spin h-6 w-6 text-blue-500"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                    >
                        <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                        />
                        <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8h4z"
                        />
                    </svg>
                </div>

                {vscodeUri && (
                    <a
                        href={vscodeUri}
                        className="inline-block bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
                    >
                        Open in VS Code
                    </a>
                )}
            </div>
        </div>
    );
};

export default Callback;
