import { useState } from 'react';
import { Globe2, Settings, Database, Menu, X } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Navbar() {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    return (
        <>
            {/* Navbar */}
            <header className="h-16 border-b border-[#2A2A2A] p-4 sticky top-0 bg-transparent backdrop-blur-lg z-50">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    {/* Left side - Branding */}
                    <Link to="/" className="flex items-center gap-1 bg-opacity-40 hover:opacity-80 transition-opacity">
                        <h1 className="text-3xl font-extrabold">Terrier</h1>
                        <img
                            src='white-dog-logo.png'
                            className="h-8 w-8 ml-1"
                            alt="Terrier logo"
                        />
                        <h2 className="sm:block hidden text-md italic ml-2 ">Your Web Scraping Companion</h2>
                    </Link>

                    {/* Right side - Hamburger Menu */}
                    <button 
                        className="p-2 rounded-lg hover:bg-[#2A2A2A] transition-colors"
                        onClick={() => setSidebarOpen(true)}
                    >
                        <Menu className="w-6 h-6" />
                    </button>
                </div>
            </header>

            {/* Sidebar */}
            <div 
                className={`fixed top-0 right-0 h-full w-64 bg-[#1A1A1A] shadow-lg transform ${sidebarOpen ? 'translate-x-0' : 'translate-x-full'} transition-transform duration-300 z-50`}
            >
                {/* Close Button */}
                <button 
                    className="absolute top-4 right-4 p-2 rounded-lg hover:bg-[#2A2A2A] transition-colors"
                    onClick={() => setSidebarOpen(false)}
                >
                    <X className="w-6 h-6" />
                </button>

                {/* Sidebar Content */}
                <div className="mt-16 flex flex-col space-y-4 p-6">
                    <Link to="/settings" className="flex items-center gap-3 p-3 rounded-lg hover:bg-[#2A2A2A] transition-colors">
                        <Settings className="w-6 h-6" />
                        <span className="text-lg">Settings</span>
                    </Link>
                    <Link to="/tools" className="flex items-center gap-3 p-3 rounded-lg hover:bg-[#2A2A2A] transition-colors">
                        <Database className="w-6 h-6" />
                        <span className="text-lg">Tools</span>
                    </Link>
                </div>
            </div>

            {/* Sidebar Backdrop */}
            {sidebarOpen && (
                <div 
                    className="fixed inset-0 bg-black/50 z-40"
                    onClick={() => setSidebarOpen(false)}
                />
            )}
        </>
    );
}