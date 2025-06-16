import React, { useState, useEffect } from 'react';
import {
    Settings,
    Play,
    GitBranch,
    FileCode,
    TestTube,
    CheckCircle,
    AlertCircle,
    Clock,
    ExternalLink,
    Github,
    Zap,
    Code,
    Database,
    Users,
    Target,
    Activity,
    Loader
} from 'lucide-react';

const JiraToCodeExtension = () => {
    const [activeTab, setActiveTab] = useState('dashboard');
    const [jiraUrl, setJiraUrl] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const [progress, setProgress] = useState(0);
    const [logs, setLogs] = useState([]);
    const [config, setConfig] = useState({
        testCoverage: 80,
        autoCreatePR: true,
        updateJiraStatus: true,
        llmModel: 'gpt-4',
        codeLanguage: 'typescript'
    });

    const [jiraAuth, setJiraAuth] = useState({
        isConnected: false,
        userInfo: null,
        isLoading: false,
        error: null
    });

    const [recentTasks, setRecentTasks] = useState([
        { id: 'DEV-123', title: 'Add user authentication', status: 'completed', timestamp: '2 hours ago' },
        { id: 'DEV-124', title: 'Create payment gateway', status: 'in-progress', timestamp: '30 minutes ago' },
        { id: 'DEV-125', title: 'Implement email service', status: 'failed', timestamp: '1 hour ago' }
    ]);

    const addLog = (message, type = 'info') => {
        const timestamp = new Date().toLocaleTimeString();
        setLogs(prev => [...prev, { message, type, timestamp }]);
    };

    // OAuth Authentication Functions
    const handleJiraConnect = async () => {
        setJiraAuth(prev => ({ ...prev, isLoading: true, error: null }));

        try {
            // Send message to VS Code extension to handle OAuth
            if (typeof vscode !== 'undefined') {
                vscode.postMessage({
                    type: 'startJiraOAuth',
                    payload: {}
                });
            } else {
                // Fallback for development
                window.open('http://localhost:3000/api/auth/jira', '_blank');
            }
        } catch (error) {
            setJiraAuth(prev => ({
                ...prev,
                isLoading: false,
                error: 'Failed to initiate OAuth flow'
            }));
        }
    };

    const handleJiraDisconnect = async () => {
        try {
            if (typeof vscode !== 'undefined') {
                vscode.postMessage({
                    type: 'disconnectJira',
                    payload: {}
                });
            }
            setJiraAuth({
                isConnected: false,
                userInfo: null,
                isLoading: false,
                error: null
            });
            addLog('Disconnected from Jira', 'info');
        } catch (error) {
            addLog('Failed to disconnect from Jira', 'error');
        }
    };

    // Listen for messages from VS Code extension
    useEffect(() => {
        if (typeof vscode !== 'undefined') {
            const handleMessage = (event) => {
                const message = event.data;

                switch (message.type) {
                    case 'jiraAuthSuccess':
                        setJiraAuth({
                            isConnected: true,
                            userInfo: message.payload.userInfo,
                            isLoading: false,
                            error: null
                        });
                        addLog('Successfully connected to Jira!', 'success');
                        break;

                    case 'jiraAuthError':
                        setJiraAuth(prev => ({
                            ...prev,
                            isLoading: false,
                            error: message.payload.error
                        }));
                        addLog(`Jira authentication failed: ${message.payload.error}`, 'error');
                        break;

                    case 'jiraAuthStatus':
                        setJiraAuth(prev => ({
                            ...prev,
                            isConnected: message.payload.isConnected,
                            userInfo: message.payload.userInfo
                        }));
                        break;

                    case 'jiraTokenExpired':
                        addLog('Jira token expired. Redirecting to authentication...', 'warning');
                        setJiraAuth(prev => ({ ...prev, isConnected: false, userInfo: null }));
                        handleJiraConnect();
                        break;

                    case 'jiraProcessingComplete':
                        processJiraWorkflow();
                        break;

                    case 'jiraProcessingError':
                        addLog(`Error: ${message.payload.error}`, 'error');
                        setIsProcessing(false);
                        break;
                }
            };

            window.addEventListener('message', handleMessage);

            // Check initial auth status
            vscode.postMessage({ type: 'checkJiraAuthStatus' });

            return () => window.removeEventListener('message', handleMessage);
        }
    }, []);

    const handleJiraSubmit = async () => {
        if (!jiraUrl.trim()) {
            addLog('Please enter a valid Jira ticket URL', 'error');
            return;
        }

        setIsProcessing(true);
        setProgress(0);

        // First, check if we have valid tokens
        addLog('Checking authentication status...', 'info');

        try {
            // Send message to extension to check token validity
            if (typeof vscode !== 'undefined') {
                vscode.postMessage({
                    type: 'checkAndProcessJira',
                    payload: { jiraUrl }
                });
            } else {
                // Fallback for development - simulate token check
                await new Promise(resolve => setTimeout(resolve, 1000));

                if (!jiraAuth.isConnected) {
                    addLog('No valid authentication found. Redirecting to OAuth...', 'warning');
                    await new Promise(resolve => setTimeout(resolve, 500));
                    handleJiraConnect();
                    setIsProcessing(false);
                    return;
                }

                // Continue with normal workflow if authenticated
                await processJiraWorkflow();
            }
        } catch (error) {
            addLog('Failed to process Jira ticket', 'error');
            setIsProcessing(false);
        }
    };

    const processJiraWorkflow = async () => {
        // Simulate workflow steps
        const steps = [
            'Fetching Jira ticket details...',
            'Parsing requirements with LLM...',
            'Generating production-ready code...',
            'Creating unit tests...',
            'Running test coverage validation...',
            'Creating Git branch and PR...',
            'Updating Jira ticket status...'
        ];

        for (let i = 0; i < steps.length; i++) {
            addLog(steps[i], 'info');
            setProgress(((i + 1) / steps.length) * 100);
            await new Promise(resolve => setTimeout(resolve, 1500));
        }

        addLog('✅ Workflow completed successfully!', 'success');
        setIsProcessing(false);
        setJiraUrl('');
    };

    const TabButton = ({ id, label, icon: Icon, isActive, onClick }) => (
        <button
            onClick={() => onClick(id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${isActive
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                }`}
        >
            <Icon size={16} />
            {label}
        </button>
    );

    const StatusBadge = ({ status }) => {
        const statusConfig = {
            completed: { color: 'bg-green-500', text: 'Completed' },
            'in-progress': { color: 'bg-yellow-500', text: 'In Progress' },
            failed: { color: 'bg-red-500', text: 'Failed' }
        };

        const config = statusConfig[status] || statusConfig.failed;

        return (
            <span className={`px-2 py-1 rounded-full text-xs text-white ${config.color}`}>
                {config.text}
            </span>
        );
    };

    const LogEntry = ({ log }) => {
        const typeColors = {
            info: 'text-blue-400',
            success: 'text-green-400',
            error: 'text-red-400',
            warning: 'text-yellow-400'
        };

        return (
            <div className="flex gap-3 py-2 border-b border-gray-700">
                <span className="text-gray-500 text-sm font-mono">{log.timestamp}</span>
                <span className={`${typeColors[log.type]} flex-1`}>{log.message}</span>
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-gray-900 text-white">
            {/* Header */}
            <div className="bg-gray-800 border-b border-gray-700 px-6 py-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-600 rounded-lg">
                            <Zap size={20} />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold">Jira to Code</h1>
                            <p className="text-gray-400 text-sm">Automated workflow from tickets to production</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-400">v1.0.0</span>
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    </div>
                </div>
            </div>

            {/* Navigation */}
            <div className="bg-gray-800 px-6 py-3 border-b border-gray-700">
                <div className="flex gap-2">
                    <TabButton
                        id="dashboard"
                        label="Dashboard"
                        icon={Activity}
                        isActive={activeTab === 'dashboard'}
                        onClick={setActiveTab}
                    />
                    <TabButton
                        id="workflow"
                        label="Workflow"
                        icon={Play}
                        isActive={activeTab === 'workflow'}
                        onClick={setActiveTab}
                    />
                    <TabButton
                        id="settings"
                        label="Settings"
                        icon={Settings}
                        isActive={activeTab === 'settings'}
                        onClick={setActiveTab}
                    />
                </div>
            </div>

            {/* Content */}
            <div className="p-6">
                {activeTab === 'dashboard' && (
                    <div className="space-y-6">
                        {/* Stats Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-blue-600 rounded-lg">
                                        <FileCode size={20} />
                                    </div>
                                    <div>
                                        <p className="text-gray-400 text-sm">Code Generated</p>
                                        <p className="text-2xl font-bold">47</p>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-green-600 rounded-lg">
                                        <TestTube size={20} />
                                    </div>
                                    <div>
                                        <p className="text-gray-400 text-sm">Tests Created</p>
                                        <p className="text-2xl font-bold">156</p>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-purple-600 rounded-lg">
                                        <GitBranch size={20} />
                                    </div>
                                    <div>
                                        <p className="text-gray-400 text-sm">PRs Created</p>
                                        <p className="text-2xl font-bold">23</p>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-yellow-600 rounded-lg">
                                        <Target size={20} />
                                    </div>
                                    <div>
                                        <p className="text-gray-400 text-sm">Coverage</p>
                                        <p className="text-2xl font-bold">94%</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Recent Tasks */}
                        <div className="bg-gray-800 rounded-lg border border-gray-700">
                            <div className="p-4 border-b border-gray-700">
                                <h2 className="text-lg font-semibold flex items-center gap-2">
                                    <Clock size={18} />
                                    Recent Tasks
                                </h2>
                            </div>
                            <div className="p-4 space-y-3">
                                {recentTasks.map((task, index) => (
                                    <div key={index} className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
                                        <div className="flex items-center gap-3">
                                            <span className="font-mono text-blue-400">{task.id}</span>
                                            <span>{task.title}</span>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <StatusBadge status={task.status} />
                                            <span className="text-gray-400 text-sm">{task.timestamp}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'workflow' && (
                    <div className="space-y-6">
                        {/* Quick Start */}
                        <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
                            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                                <Play size={20} />
                                Start New Workflow
                            </h2>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium mb-2">Jira Ticket URL</label>
                                    <div className="flex gap-3">
                                        <input
                                            type="text"
                                            value={jiraUrl}
                                            onChange={(e) => setJiraUrl(e.target.value)}
                                            placeholder="https://yourcompany.atlassian.net/browse/DEV-123"
                                            className="flex-1 bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            disabled={isProcessing}
                                        />
                                        <button
                                            onClick={handleJiraSubmit}
                                            disabled={isProcessing}
                                            className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 px-6 py-2 rounded-lg flex items-center gap-2 transition-colors"
                                        >
                                            {isProcessing ? <Loader className="animate-spin" size={16} /> : <Play size={16} />}
                                            {isProcessing ? 'Processing...' : 'Start'}
                                        </button>
                                    </div>
                                    <p className="text-gray-400 text-sm mt-2">
                                        🚀 Just paste your Jira URL and hit start! We'll handle authentication automatically.
                                    </p>
                                </div>

                                {/* Progress Bar */}
                                {isProcessing && (
                                    <div className="space-y-2">
                                        <div className="flex justify-between text-sm">
                                            <span>Progress</span>
                                            <span>{Math.round(progress)}%</span>
                                        </div>
                                        <div className="w-full bg-gray-700 rounded-full h-2">
                                            <div
                                                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                                style={{ width: `${progress}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Workflow Steps */}
                        <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
                            <h2 className="text-xl font-semibold mb-4">Workflow Steps</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {[
                                    { icon: Database, title: 'Fetch & Parse', desc: 'Extract requirements from Jira' },
                                    { icon: Code, title: 'Generate Code', desc: 'AI-powered code generation' },
                                    { icon: TestTube, title: 'Create Tests', desc: 'Automated test creation' },
                                    { icon: CheckCircle, title: 'Validate Coverage', desc: 'Ensure quality standards' },
                                    { icon: GitBranch, title: 'Git Automation', desc: 'Branch and PR creation' },
                                    { icon: ExternalLink, title: 'Update Jira', desc: 'Status and progress tracking' }
                                ].map((step, index) => (
                                    <div key={index} className="p-4 bg-gray-700 rounded-lg">
                                        <div className="flex items-center gap-3 mb-2">
                                            <div className="p-2 bg-blue-600 rounded-lg">
                                                <step.icon size={16} />
                                            </div>
                                            <h3 className="font-medium">{step.title}</h3>
                                        </div>
                                        <p className="text-gray-400 text-sm">{step.desc}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Live Logs */}
                        <div className="bg-gray-800 rounded-lg border border-gray-700">
                            <div className="p-4 border-b border-gray-700">
                                <h2 className="text-lg font-semibold flex items-center gap-2">
                                    <Activity size={18} />
                                    Live Logs
                                </h2>
                            </div>
                            <div className="p-4 max-h-64 overflow-y-auto">
                                {logs.length === 0 ? (
                                    <p className="text-gray-500 text-center py-4">No logs yet. Start a workflow to see activity.</p>
                                ) : (
                                    <div className="space-y-1">
                                        {logs.map((log, index) => (
                                            <LogEntry key={index} log={log} />
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'settings' && (
                    <div className="space-y-6">
                        {/* Jira Authentication */}
                        <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
                            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                                <ExternalLink size={20} />
                                Jira Authentication
                            </h2>

                            {!jiraAuth.isConnected ? (
                                <div className="space-y-4">
                                    <div className="bg-blue-900/20 border border-blue-600 rounded-lg p-4">
                                        <h3 className="font-medium text-blue-400 mb-2">Smart Authentication</h3>
                                        <p className="text-gray-300 text-sm mb-3">
                                            You can work in two ways:
                                        </p>
                                        <div className="space-y-2 text-sm">
                                            <div className="flex items-start gap-2">
                                                <span className="text-blue-400 font-bold">1.</span>
                                                <span className="text-gray-300">
                                                    <strong>Automatic:</strong> Just paste a Jira URL in the workflow tab - we'll handle authentication automatically
                                                </span>
                                            </div>
                                            <div className="flex items-start gap-2">
                                                <span className="text-blue-400 font-bold">2.</span>
                                                <span className="text-gray-300">
                                                    <strong>Manual:</strong> Connect now using the button below for immediate access
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {jiraAuth.error && (
                                        <div className="bg-red-900/20 border border-red-700 rounded-lg p-3">
                                            <div className="flex items-center gap-2">
                                                <AlertCircle size={16} className="text-red-400" />
                                                <span className="text-red-400 text-sm">{jiraAuth.error}</span>
                                            </div>
                                        </div>
                                    )}

                                    <div className="flex flex-col sm:flex-row gap-3">
                                        <button
                                            onClick={handleJiraConnect}
                                            disabled={jiraAuth.isLoading}
                                            className="flex items-center justify-center gap-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 px-6 py-3 rounded-lg transition-colors font-medium flex-1"
                                        >
                                            {jiraAuth.isLoading ? (
                                                <>
                                                    <Loader className="animate-spin" size={20} />
                                                    Connecting...
                                                </>
                                            ) : (
                                                <>
                                                    <ExternalLink size={20} />
                                                    Connect Manually
                                                </>
                                            )}
                                        </button>
                                        <div className="flex items-center justify-center px-4 py-3 bg-gray-700 rounded-lg text-sm text-gray-400">
                                            <span>or paste URL in Workflow tab</span>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    <div className="bg-green-900/20 border border-green-700 rounded-lg p-4">
                                        <div className="flex items-center gap-3 mb-3">
                                            <CheckCircle size={20} className="text-green-400" />
                                            <h3 className="font-medium text-green-400">Connected to Jira</h3>
                                        </div>
                                        {jiraAuth.userInfo && (
                                            <div className="space-y-2">
                                                <div className="flex items-center gap-2">
                                                    <Users size={16} className="text-gray-400" />
                                                    <span className="text-gray-300">{jiraAuth.userInfo.displayName || 'User'}</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <ExternalLink size={16} className="text-gray-400" />
                                                    <span className="text-gray-300">{jiraAuth.userInfo.accountId || 'Connected'}</span>
                                                </div>
                                            </div>
                                        )}
                                        <div className="mt-3 p-2 bg-green-800/30 rounded text-sm text-green-300">
                                            ✅ You're all set! You can now process Jira tickets seamlessly.
                                        </div>
                                    </div>

                                    <div className="flex gap-3">
                                        <button
                                            onClick={() => {
                                                if (typeof vscode !== 'undefined') {
                                                    vscode.postMessage({ type: 'testJiraConnection' });
                                                }
                                                addLog('Testing Jira connection...', 'info');
                                            }}
                                            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors text-sm"
                                        >
                                            Test Connection
                                        </button>
                                        <button
                                            onClick={handleJiraDisconnect}
                                            className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg transition-colors text-sm"
                                        >
                                            Disconnect
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Code Generation Settings */}
                        <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
                            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                                <Code size={20} />
                                Code Generation
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-2">Primary Language</label>
                                    <select
                                        value={config.codeLanguage}
                                        onChange={(e) => setConfig({ ...config, codeLanguage: e.target.value })}
                                        className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option value="typescript">TypeScript</option>
                                        <option value="javascript">JavaScript</option>
                                        <option value="python">Python</option>
                                        <option value="java">Java</option>
                                        <option value="csharp">C#</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-2">LLM Model</label>
                                    <select
                                        value={config.llmModel}
                                        onChange={(e) => setConfig({ ...config, llmModel: e.target.value })}
                                        className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option value="gpt-4">GPT-4</option>
                                        <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
                                        <option value="claude-3">Claude 3</option>
                                        <option value="gemini-pro">Gemini Pro</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-2">Test Coverage Threshold</label>
                                    <div className="flex items-center gap-3">
                                        <input
                                            type="range"
                                            min="60"
                                            max="100"
                                            value={config.testCoverage}
                                            onChange={(e) => setConfig({ ...config, testCoverage: parseInt(e.target.value) })}
                                            className="flex-1"
                                        />
                                        <span className="text-sm font-mono w-12">{config.testCoverage}%</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Automation Settings */}
                        <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
                            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                                <Zap size={20} />
                                Automation
                            </h2>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h3 className="font-medium">Auto-create Pull Requests</h3>
                                        <p className="text-gray-400 text-sm">Automatically create PRs when code is generated</p>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={config.autoCreatePR}
                                            onChange={(e) => setConfig({ ...config, autoCreatePR: e.target.checked })}
                                            className="sr-only peer"
                                        />
                                        <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                    </label>
                                </div>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h3 className="font-medium">Update Jira Status</h3>
                                        <p className="text-gray-400 text-sm">Automatically update ticket status after completion</p>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={config.updateJiraStatus}
                                            onChange={(e) => setConfig({ ...config, updateJiraStatus: e.target.checked })}
                                            className="sr-only peer"
                                        />
                                        <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                    </label>
                                </div>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex justify-end gap-3">
                            <button className="px-6 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors">
                                Reset to Defaults
                            </button>
                            <button className="px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors">
                                Save Configuration
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default JiraToCodeExtension;