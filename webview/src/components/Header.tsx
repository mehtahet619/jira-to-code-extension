import { Zap } from "lucide-react";

const Header = () => {
    return (
        <div>
            <div className="bg-gray-800 border-b border-gray-700 px-6 py-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-600 rounded-lg">
                            <Zap size={20} />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold">Jira to Code</h1>
                            <p className="text-gray-400 text-sm">
                                Automated workflow from tickets to production
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-400">v1.0.0</span>
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Header;
