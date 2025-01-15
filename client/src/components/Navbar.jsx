import { Globe2, Settings, Database, FlaskConical } from 'lucide-react';
import { Link } from 'react-router';


export default function Navbar() {
    return (
        <nav className="border-b border-gray-700 bg-gray-800/50 backdrop-blur-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    <Link to={'/'}>
                        <div className="flex items-center">
                            <Globe2 className="w-8 h-8 text-blue-400" />
                            <span className="ml-2 text-xl font-bold">WebScrape Dashboard</span>
                        </div>
                    </Link>
                    <div className="flex items-center space-x-4">
                        <Link to={'/api-test'}>
                            <button className="p-2 rounded-lg hover:bg-gray-700 flex items-center gap-2">
                                <FlaskConical className="w-5 h-5" />
                                <span className="hidden sm:inline">API Test</span>
                            </button>
                        </Link>
                        <Link to={'/settings'}>
                            <button className="p-2 rounded-lg hover:bg-gray-700">
                                <Settings className="w-5 h-5" />
                            </button>
                        </Link>
                        <button className="p-2 rounded-lg hover:bg-gray-700">
                            <Database className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </div>
        </nav>
    )
}