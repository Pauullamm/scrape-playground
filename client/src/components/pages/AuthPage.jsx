import { Auth } from '@supabase/auth-ui-react';
import { customTheme } from './authTheme.js';
import { useNavigate } from 'react-router';
import { useEffect } from 'react';

export default function AuthPage({ supabaseClient, setSession }) {
    const navigate = useNavigate();

    // Handle user login status
    // setSession and client is passed in from App.jsx
    useEffect(() => {
        supabaseClient.auth.getSession()
            .then(({ data: { session } }) => {
                setSession(session);
                if (session) {
                    navigate('/home')
                }
            })

        const { data: { subscription } } = supabaseClient.auth.onAuthStateChange((event, session) => {
            if (event == "SIGNED_OUT") {
                
                setSession(session)

            } else if (event === "SIGNED_IN") {
                
                navigate('/home', { replace: true })

            }
        })

        return () => subscription.unsubscribe()
    }, [supabaseClient, setSession, navigate])

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