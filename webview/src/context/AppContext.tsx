import React, { createContext, useContext, useState } from "react";

// Add more global states here as needed
type Tab = "dashboard" | "workflow" | "settings";

const AppContext = createContext<any | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [activeTab, setActiveTab] = useState<Tab>("workflow");

    const value: any = {
        activeTab,
        setActiveTab,
    };

    return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

// Custom hook
export const useAppContext = () => {
    const context = useContext(AppContext);
    if (!context) {
        throw new Error("useAppContext must be used within an AppProvider");
    }
    return context;
};
