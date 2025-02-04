import { Auth } from '@supabase/auth-ui-react';
import { customTheme } from './authTheme.js';


export default function AuthPage({ supabaseClient }) {
    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center p-4 text-white">
            <div className="w-full max-w-md">
                <Auth
                    supabaseClient={supabaseClient}
                    appearance={{
                        theme: customTheme,
                        style: {
                            button: {
                                borderRadius: '8px',
                                border: 'none',
                                fontWeight: '600',
                                transition: 'all 0.2s ease',
                                height: '1.875rem'
                            },
                            anchor: {
                                fontSize: '14px',
                                '&:hover': {
                                    textDecoration: 'underline',
                                }
                            },
                            input: {
                                background: '',
                                color: 'white',
                                height: "2rem",
                                padding: '0.5em'
                            },
                            // Add more element styles as needed
                        },
                        variables: {
                            default: {
                                fonts: {
                                    bodyFontFamily: 'Arial, sans-serif',
                                    buttonFontFamily: 'Arial, sans-serif',
                                }
                            }
                        }
                    }}
                    theme="dark"
                    providers={['github', 'google']} // Add any providers you want
                />
            </div>
        </div>
    )
}