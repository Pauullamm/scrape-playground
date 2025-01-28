import { Globe2, Settings, Database } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Navbar() {
    return (
        <header className="h-16 border-b border-[#2A2A2A] p-4 sticky top-0 bg-[#1A1A1A]/90 backdrop-blur-sm z-50">
            <div className="max-w-7xl mx-auto flex items-center justify-between">
                {/* Left side - Branding */}
                <Link to="/" className="flex items-center gap-1 hover:opacity-80 transition-opacity">
                    <h1 className="text-3xl font-extrabold">Terrier</h1>
                    <img
                        src='white-dog-logo.png'
                        className="h-8 w-8 ml-1"
                        alt="Terrier logo"
                    />
                    <h2 className="sm:block hidden text-md italic ml-2 ">Your Web Scraping Companion</h2>
                </Link>

                {/* Right side - Navigation */}
                <div className="flex items-center space-x-4">
                    <Link to="/settings">
                        <button className="p-2 rounded-lg hover:bg-[#2A2A2A] transition-colors">
                            <Settings className="w-5 h-5" />
                        </button>
                    </Link>
                    <button className="p-2 rounded-lg hover:bg-[#2A2A2A] transition-colors">
                        <Database className="w-5 h-5" />
                    </button>
                </div>
            </div>
        </header>
    )
}