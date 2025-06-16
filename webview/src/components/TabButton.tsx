import React from "react";
import { LucideIcon } from "lucide-react";

type TabButtonProps = {
    id: string | number;
    label: string;
    icon: LucideIcon;
    isActive: boolean;
    onClick: any;
};

const TabButton: React.FC<TabButtonProps> = ({ id, label, icon: Icon, isActive, onClick }) => {
    return (
        <button
            onClick={() => onClick(id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                isActive
                    ? "bg-blue-600 text-white shadow-md"
                    : "text-gray-300 hover:bg-gray-700 hover:text-white"
            }`}
        >
            <Icon size={16} />
            {label}
        </button>
    );
};

export default TabButton;
