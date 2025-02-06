import React, { useState } from "react";
import { useNavigate } from 'react-router-dom';
import { BookOpen, Code2, Network, Rocket, ChevronRight, Info, FlaskConical, LayoutTemplate } from 'lucide-react';

export default function DocumentationPage() {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('introduction');

    const tabs = [
        { id: 'introduction', label: 'Introduction', icon: Info },
        { id: 'getting-started', label: 'Getting Started', icon: Rocket },
        { id: 'tools', label: 'Tools', icon: Code2 },
        { id: 'examples', label: 'Examples', icon: BookOpen },
    ];

    const renderTabContent = () => {
        switch (activeTab) {
            case 'introduction':
                return (
                    <div className="space-y-6">
                        <div className="p-6 rounded-xl bg-[#393E46] border border-[#393E46]">
                            <h3 className="text-xl font-semibold mb-4 flex items-center">
                                <Info className="mr-2 text-[#00ADB5]" size={20} />
                                About Terrier
                            </h3>
                            <div className="space-y-4 text-gray-300">
                                <p>
                                    Hi there – thanks for checking out Terrier!
                                </p>
                                <p>
                                    Just to make things clear - this isn't another web scraping framework/service trying to solve all your problems.
                                </p>
                                <div className="space-y-4">
                                    <div className="pt-2">
                                        <h4 className="text-lg text-gray-200 mb-2">
                                            Problem:
                                        </h4>
                                        <p className="text-md mb-2">
                                            We've all been there – spending hours reverse-engineering website layouts,
                                            writing fragile selectors, updating scripts when sites change...etc
                                        </p>
                                        <p className="text-md">
                                            Don't get me wrong, it works, and there are many services that can help you do these really well, but it feels like you're always playing catch-up.
                                        </p>
                                    </div>

                                    <div className="pt-2">
                                        <h4 className="text-lg font-medium text-gray-200 mb-2">
                                            What we do differently
                                        </h4>
                                        <p className="text-md mb-3">
                                            Terrier focuses on the network layer instead of HTML elements.
                                            Many modern websites load data through APIs anyway – why not work with
                                            that structured data directly?
                                        </p>
                                        <ul className="space-y-2 text-md pl-4 border-l-2 border-[#00ADB5]">
                                            <li>• Capture API requests made by pages</li>
                                            <li>• Inspect JSON(-like) responses for ready-to-use data</li>
                                        </ul>
                                    </div>

                                    <div className="pt-4 border-t border-gray-700">
                                        <p className="text-lg">
                                            Think of Terrier as your hunting companion that sniffs out web data before you proceed. We give you the tools to:
                                        </p>
                                        <div className="mt-3 grid gap-2 text-md">
                                            <div className="flex items-start">
                                                <ChevronRight className="flex-shrink-0 mt-1 mr-2 text-[#00ADB5]" size={14} />
                                                <span>Find data sources faster</span>
                                            </div>
                                            <div className="flex items-start">
                                                <ChevronRight className="flex-shrink-0 mt-1 mr-2 text-[#00ADB5]" size={14} />
                                                <span>Work with structured APIs instead of HTML</span>
                                            </div>
                                            <div className="flex items-start">
                                                <ChevronRight className="flex-shrink-0 mt-1 mr-2 text-[#00ADB5]" size={14} />
                                                <span>Reduce maintenance headaches</span>
                                            </div>
                                        </div>
                                    </div>

                                    <p className="pt-4 text-sm text-gray-400">
                                        No magic bullets – just practical tools for developers who prefer
                                        working with clean data over parsing markup. Let's get started.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                );
            case 'getting-started':
                return (
                    <div className="space-y-6">
                        <div className="p-6 rounded-xl bg-[#393E46] border border-[#393E46]">
                            <h3 className="text-xl font-semibold mb-4 flex items-center">
                                <Rocket className="mr-2 text-[#00ADB5]" size={20} />
                                Initial Setup
                            </h3>
                            <div className="space-y-6">
                                <div>
                                    <h4 className="text-lg font-medium mb-2">1. Obtain API Keys</h4>
                                    <p className="text-gray-300 mb-4">
                                        Terrier supports multiple AI providers:
                                    </p>
                                    <ul className="list-disc pl-6 space-y-2 text-gray-300">
                                        <li>OpenAI - <a href="https://platform.openai.com/api-keys"
                                            className="text-[#00ADB5] hover:underline" target="_blank">Get keys</a></li>
                                        <li>DeepSeek - <a href="https://platform.deepseek.com/api-keys"
                                            className="text-[#00ADB5] hover:underline" target="_blank">Account dashboard</a></li>
                                        <li>Gemini - <a href="https://ai.google.dev/gemini-api/docs/api-key"
                                            className="text-[#00ADB5] hover:underline" target="_blank">Google API console</a></li>
                                    </ul>
                                    <p className="my-2">
                                        (We recommend getting started with Gemini-2.0-flash-exp for its long context window)
                                    </p>
                                </div>

                                <div>
                                    <h4 className="text-lg font-medium mb-2">2. Configure Settings</h4>
                                    <p className="text-gray-300">
                                        Add your API keys in the <button
                                            onClick={() => navigate('/settings')}
                                            className="text-[#00ADB5] hover:underline"
                                        >
                                            Settings page
                                        </button>
                                    </p>
                                </div>

                                <div>
                                    <h4 className="text-lg font-medium mb-2">3. Start Hunting!</h4>
                                    <p className="text-gray-300">
                                        Try out one of the tools on the <button
                                            onClick={() => navigate('/tools')}
                                            className="text-[#00ADB5] hover:underline"
                                        >
                                            Tools page
                                        </button>
                                        
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                );
            case 'tools':
                return (
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Network Tool */}
                            <div className="p-6 rounded-xl bg-[#393E46] border border-[#393E46]">
                                <div className="flex items-center mb-4">
                                    <Network className="mr-2 text-[#00ADB5]" size={20} />
                                    <h3 className="text-xl font-semibold">Request Capture</h3>
                                </div>
                                <div className="space-y-4">
                                    <p className="text-gray-300 text-sm">
                                        Monitor all network activity from visited pages and filter for valuable data sources
                                    </p>
                                    <ul className="list-disc pl-6 space-y-2 text-gray-300 text-sm">
                                        <li>Capture XHR/fetch requests in real-time</li>
                                        <li>Filter by endpoint patterns or response types</li>
                                        <li>Export successful requests as templates</li>
                                    </ul>
                                    <button
                                        onClick={() => navigate('/tools')}
                                        className="px-4 py-2 bg-[#00ADB5]/20 hover:bg-[#00ADB5]/30 text-[#00ADB5] rounded-lg transition-colors flex items-center text-sm"
                                    >
                                        Open Network Tool
                                        <ChevronRight className="ml-2" size={16} />
                                    </button>
                                </div>
                            </div>

                            {/* API Testing */}
                            <div className="p-6 rounded-xl bg-[#393E46] border border-[#393E46]">
                                <div className="flex items-center mb-4">
                                    <FlaskConical className="mr-2 text-[#00ADB5]" size={20} />
                                    <h3 className="text-xl font-semibold">API Workshop</h3>
                                </div>
                                <div className="space-y-4">
                                    <p className="text-gray-300 text-sm">
                                        Experiment with discovered endpoints using our built-in API client
                                    </p>
                                    <ul className="list-disc pl-6 space-y-2 text-gray-300 text-sm">
                                        <li>Automatic parameter detection</li>
                                        <li>Save and organize request collections</li>
                                        <li>Generate code snippets in multiple languages</li>
                                    </ul>
                                    <button
                                        onClick={() => navigate('/tools')}
                                        className="px-4 py-2 bg-[#00ADB5]/20 hover:bg-[#00ADB5]/30 text-[#00ADB5] rounded-lg transition-colors flex items-center text-sm"
                                    >
                                        Open API Workshop
                                        <ChevronRight className="ml-2" size={16} />
                                    </button>
                                </div>
                            </div>

                            {/* HTML Parsing */}
                            <div className="p-6 rounded-xl bg-[#393E46] border border-[#393E46]">
                                <div className="flex items-center mb-4">
                                    <LayoutTemplate className="mr-2 text-[#00ADB5]" size={20} />
                                    <h3 className="text-xl font-semibold">DOM Explorer</h3>
                                </div>
                                <div className="space-y-4">
                                    <p className="text-gray-300 text-sm">
                                        Analyze page content and extract structured data from HTML
                                    </p>
                                    <ul className="list-disc pl-6 space-y-2 text-gray-300 text-sm">
                                        <li>Detect embedded JSON data</li>
                                        <li>Extract JavaScript variables</li>
                                        <li>Generate CSS selector suggestions</li>
                                    </ul>
                                    <button
                                        onClick={() => navigate('/tools')}
                                        className="px-4 py-2 bg-[#00ADB5]/20 hover:bg-[#00ADB5]/30 text-[#00ADB5] rounded-lg transition-colors flex items-center text-sm"
                                    >
                                        Launch DOM Explorer
                                        <ChevronRight className="ml-2" size={16} />
                                    </button>
                                </div>
                            </div>

                            {/* Browser Automation */}
                            <div className="p-6 rounded-xl bg-[#393E46] border border-[#393E46]">
                                <div className="flex items-center mb-4">
                                    <Code2 className="mr-2 text-[#00ADB5]" size={20} />
                                    <h3 className="text-xl font-semibold">AI Automation</h3>
                                    <span className="ml-2 px-2 py-1 text-xs bg-gray-600 text-[#00ADB5] rounded-full">Beta</span>
                                </div>
                                <div className="space-y-4">
                                    <p className="text-gray-300 text-sm">
                                        Describe your workflow in plain English and let our agent handle the automation
                                    </p>
                                    <ul className="list-disc pl-6 space-y-2 text-gray-300 text-sm">
                                        <li>Natural language to automation scripts</li>
                                        <li>Multi-step workflow support</li>
                                        <li>Interactive execution monitoring</li>
                                    </ul>
                                    <button
                                        onClick={() => navigate('/tools')}
                                        className="px-4 py-2 bg-[#00ADB5]/20 hover:bg-[#00ADB5]/30 text-[#00ADB5] rounded-lg transition-colors flex items-center text-sm"
                                    >
                                        Try AI Automation
                                        <ChevronRight className="ml-2" size={16} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                );

            case 'examples':
                return (
                    <div className="space-y-6">
                        <div className="p-6 rounded-xl bg-[#393E46] border border-[#393E46]">
                            <h3 className="text-xl font-semibold mb-4 flex items-center">
                                <BookOpen className="mr-2 text-[#00ADB5]" size={20} />
                                Example Use Cases
                            </h3>
                            <div className="space-y-4">
                                <div>
                                    <h4 className="text-lg font-medium text-[#00ADB5] mb-2">E-commerce Scraping</h4>
                                    <code className="block p-4 bg-gray-900 rounded-md text-sm font-mono text-gray-300">
                                        {`terrier.scrape({
    url: "https://example.com/products",
    fields: ["name", "price", "description"]
})`}
                                    </code>
                                </div>
                            </div>
                        </div>
                    </div>
                );
        }
    };

    return (
        <div className="min-h-screen bg-[#222831] text-white">
            <div className="max-w-7xl mx-auto px-4 py-12 flex flex-col md:flex-row gap-8">
                {/* Sidebar Navigation */}
                <div className="w-full md:w-64 flex-shrink-0">
                    <div className="sticky top-20 space-y-2">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`w-full flex items-center p-3 rounded-lg transition-colors ${activeTab === tab.id
                                    ? 'bg-gray-700 text-[#00ADB5]'
                                    : 'text-gray-400 hover:bg-[#393E46]'
                                    }`}
                            >
                                <tab.icon className="mr-2" size={18} />
                                <span className="text-sm font-medium">{tab.label}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Main Content */}
                <div className="flex-1">
                    <div className="prose prose-invert max-w-none">
                        <h1 className="text-4xl font-bold mb-8 bg-clip-text text-transparent bg-gradient-to-r from-[#00ADB5] to-[#EEEEEE]">
                            Welcome!
                        </h1>

                        <p></p>
                        {renderTabContent()}
                    </div>
                </div>
            </div>
        </div>
    );
}