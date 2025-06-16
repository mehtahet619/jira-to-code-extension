import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { MemoryRouter } from "react-router-dom";
import { AppProvider } from "./context/AppContext.tsx";

createRoot(document.getElementById("root")!).render(
    <StrictMode>
        <AppProvider>
            <MemoryRouter>
                <App />
            </MemoryRouter>
        </AppProvider>
    </StrictMode>
);
