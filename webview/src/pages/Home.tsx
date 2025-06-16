// import { useEffect, useState } from "react";
// import { postMessage, subscribeMessage } from "../lib/vscodeBridge";
// import { FromWebview, ToWebview } from "../../../src/constants/messageTypes";

import Header from "../components/Header";
import Tabs from "../components/Tabs";
import { useAppContext } from "../context/AppContext";
import Workflow from "./Workflow";

const Home = () => {
    const { activeTab } = useAppContext();

    return (
        <div className="min-h-screen bg-gray-900 text-white">
            {/* Header */}
            <Header />
            {/* Tabs */}
            <Tabs />
            {/* Content */}
            <div className="p-6">
                {/* {activeTab === "dashboard" && <div>Dashboard Content</div>} */}
                {activeTab === "workflow" && <Workflow />}
                {activeTab === "settings" && <div>Settings Content</div>}
            </div>
        </div>
    );
};

export default Home;
