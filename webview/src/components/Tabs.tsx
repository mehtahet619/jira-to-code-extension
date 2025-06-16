import { Play, Settings } from "lucide-react";
import TabButton from "./TabButton";
import { useAppContext } from "../context/AppContext";

const Tabs = () => {
    const { activeTab, setActiveTab } = useAppContext();

    return (
        <div>
            <div className="bg-gray-800 px-6 py-3 border-b border-gray-700">
                <div className="flex gap-2">
                    {/* <TabButton
                        id="dashboard"
                        label="Dashboard"
                        icon={Activity}
                        isActive={activeTab === "dashboard"}
                        onClick={setActiveTab}
                    /> */}
                    <TabButton
                        id="workflow"
                        label="Workflow"
                        icon={Play}
                        isActive={activeTab === "workflow"}
                        onClick={setActiveTab}
                    />
                    <TabButton
                        id="settings"
                        label="Settings"
                        icon={Settings}
                        isActive={activeTab === "settings"}
                        onClick={setActiveTab}
                    />
                </div>
            </div>
        </div>
    );
};

export default Tabs;
