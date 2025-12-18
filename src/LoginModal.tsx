import { useState } from 'react';
import { useAuth } from './contexts/AuthContext';
import { Mail, Lock, ArrowRight, Loader2 } from 'lucide-react';

export const LoginModal = () => {
    const [isSignup, setIsSignup] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [focusedInput, setFocusedInput] = useState<string | null>(null);

    const { login, signup } = useAuth();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            if (isSignup) {
                await signup(email, password);
            } else {
                await login(email, password);
            }
        } catch (err: any) {
            setError(err.message || 'Authentication failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            position: 'fixed',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            backgroundColor: 'var(--neutral-50)',
            overflow: 'hidden'
        }}>
            {/* Ambient Background - Using inline styles for complex gradients/positions to ensure they render */}
            <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
                <div style={{
                    position: 'absolute',
                    top: '-20%',
                    left: '-10%',
                    width: '60%',
                    height: '60%',
                    borderRadius: '9999px',
                    backgroundColor: 'rgba(14, 165, 233, 0.2)', // Primary-500 equivalent
                    filter: 'blur(100px)'
                }} />
                <div style={{
                    position: 'absolute',
                    bottom: '-20%',
                    right: '-10%',
                    width: '60%',
                    height: '60%',
                    borderRadius: '9999px',
                    backgroundColor: 'rgba(96, 165, 250, 0.2)', // Blue-400 equivalent
                    filter: 'blur(100px)'
                }} />
            </div>

            {/* Main Card */}
            <div className="glass" style={{
                position: 'relative',
                zIndex: 10,
                width: '100%',
                maxWidth: '400px',
                padding: '32px',
                borderRadius: '24px',
                margin: '16px',
                border: '1px solid rgba(255, 255, 255, 0.5)',
                boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)' // Shadow-xl
            }}>
                {/* Header */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '32px' }}>
                    <div style={{
                        width: '64px',
                        height: '64px',
                        marginBottom: '16px',
                        borderRadius: '16px',
                        background: 'linear-gradient(135deg, var(--primary-500), #2563eb)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 10px 15px -3px rgba(14, 165, 233, 0.3)'
                    }}>
                        <img src="/pwa-192x192.png" alt="Logo" style={{ width: '48px', height: '48px', objectFit: 'contain' }} />
                    </div>
                    <h1 style={{
                        fontSize: '24px',
                        fontWeight: 700,
                        background: 'linear-gradient(to right, #171717, #525252)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        marginBottom: '8px',
                        textAlign: 'center'
                    }}>
                        Infinite Mind
                    </h1>
                    <p style={{
                        color: 'var(--neutral-500)',
                        fontSize: '14px',
                        textAlign: 'center',
                        margin: 0
                    }}>
                        {isSignup
                            ? "Create your space for infinite thinking."
                            : "Welcome back to your second brain."}
                    </p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        {/* Email Input */}
                        <div style={{ position: 'relative' }}>
                            <div style={{
                                position: 'absolute',
                                left: '12px',
                                top: '50%',
                                transform: 'translateY(-50%)',
                                color: focusedInput === 'email' ? 'var(--primary-600)' : 'var(--neutral-400)',
                                transition: 'color 0.2s',
                                pointerEvents: 'none'
                            }}>
                                <Mail size={18} />
                            </div>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                placeholder="Email address"
                                onFocus={() => setFocusedInput('email')}
                                onBlur={() => setFocusedInput(null)}
                                style={{
                                    width: '100%',
                                    boxSizing: 'border-box',
                                    paddingLeft: '40px',
                                    paddingRight: '16px',
                                    paddingTop: '12px',
                                    paddingBottom: '12px',
                                    backgroundColor: 'rgba(255, 255, 255, 0.5)',
                                    border: `1px solid ${focusedInput === 'email' ? 'var(--primary-500)' : 'var(--neutral-200)'}`,
                                    borderRadius: '12px',
                                    color: 'var(--neutral-900)',
                                    fontSize: '16px',
                                    outline: 'none',
                                    boxShadow: focusedInput === 'email' ? '0 0 0 2px rgba(14, 165, 233, 0.2)' : 'none',
                                    transition: 'all 0.2s'
                                }}
                            />
                        </div>

                        {/* Password Input */}
                        <div style={{ position: 'relative' }}>
                            <div style={{
                                position: 'absolute',
                                left: '12px',
                                top: '50%',
                                transform: 'translateY(-50%)',
                                color: focusedInput === 'password' ? 'var(--primary-600)' : 'var(--neutral-400)',
                                transition: 'color 0.2s',
                                pointerEvents: 'none'
                            }}>
                                <Lock size={18} />
                            </div>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                minLength={6}
                                placeholder="Password"
                                onFocus={() => setFocusedInput('password')}
                                onBlur={() => setFocusedInput(null)}
                                style={{
                                    width: '100%',
                                    boxSizing: 'border-box',
                                    paddingLeft: '40px',
                                    paddingRight: '16px',
                                    paddingTop: '12px',
                                    paddingBottom: '12px',
                                    backgroundColor: 'rgba(255, 255, 255, 0.5)',
                                    border: `1px solid ${focusedInput === 'password' ? 'var(--primary-500)' : 'var(--neutral-200)'}`,
                                    borderRadius: '12px',
                                    color: 'var(--neutral-900)',
                                    fontSize: '16px',
                                    outline: 'none',
                                    boxShadow: focusedInput === 'password' ? '0 0 0 2px rgba(14, 165, 233, 0.2)' : 'none',
                                    transition: 'all 0.2s'
                                }}
                            />
                        </div>
                    </div>

                    {error && (
                        <div style={{
                            padding: '12px',
                            backgroundColor: '#fef2f2',
                            border: '1px solid #fee2e2',
                            borderRadius: '8px',
                            display: 'flex',
                            alignItems: 'start',
                            gap: '8px',
                            color: '#dc2626',
                            fontSize: '14px'
                        }}>
                            <span>•</span>
                            <span>{error}</span>
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        style={{
                            position: 'relative',
                            width: '100%',
                            padding: '12px',
                            background: 'linear-gradient(to right, var(--primary-600), #2563eb)',
                            color: 'white',
                            fontWeight: 600,
                            borderRadius: '12px',
                            border: 'none',
                            boxShadow: '0 10px 15px -3px rgba(14, 165, 233, 0.3)',
                            cursor: loading ? 'not-allowed' : 'pointer',
                            opacity: loading ? 0.7 : 1,
                            transform: loading ? 'none' : 'translateY(0)',
                            transition: 'all 0.2s',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px'
                        }}
                        onMouseEnter={(e) => {
                            if (!loading) {
                                e.currentTarget.style.transform = 'translateY(-2px)';
                                e.currentTarget.style.boxShadow = '0 20px 25px -5px rgba(14, 165, 233, 0.4)';
                            }
                        }}
                        onMouseLeave={(e) => {
                            if (!loading) {
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(14, 165, 233, 0.3)';
                            }
                        }}
                    >
                        {loading ? (
                            <>
                                <Loader2 size={18} className="animate-spin" style={{ animation: 'spin 1s linear infinite' }} />
                                <span>Please wait...</span>
                            </>
                        ) : (
                            <>
                                <span>{isSignup ? 'Create Account' : 'Sign In'}</span>
                                <ArrowRight size={18} />
                            </>
                        )}
                    </button>

                    <div style={{ position: 'relative', margin: '16px 0' }}>
                        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center' }}>
                            <div style={{ width: '100%', borderTop: '1px solid var(--neutral-200)' }}></div>
                        </div>
                        <div style={{ position: 'relative', display: 'flex', justifyContent: 'center', fontSize: '12px', textTransform: 'uppercase' }}>
                            <span style={{ backgroundColor: 'rgba(255,255,255,0.7)', padding: '0 8px', color: 'var(--neutral-400)' }}>Or</span>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={() => {
                            setIsSignup(!isSignup);
                            setError('');
                        }}
                        style={{
                            background: 'none',
                            border: 'none',
                            color: 'var(--neutral-500)',
                            fontSize: '14px',
                            fontWeight: 500,
                            cursor: 'pointer',
                            textAlign: 'center',
                            width: '100%'
                        }}
                    >
                        {isSignup ? (
                            <span>Already have an account? <span style={{ color: 'var(--primary-600)', fontWeight: 600 }}>Log in</span></span>
                        ) : (
                            <span>Don't have an account? <span style={{ color: 'var(--primary-600)', fontWeight: 600 }}>Sign up</span></span>
                        )}
                    </button>
                </form>
            </div>

            {/* Footer */}
            <div style={{
                position: 'absolute',
                bottom: '24px',
                textAlign: 'center',
                color: 'var(--neutral-400)',
                fontSize: '12px',
                width: '100%'
            }}>
                © {new Date().getFullYear()} Infinite Mind. All rights reserved.
            </div>

            {/* Inline Keyframes for Loader */}
            <style>{`
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
};
