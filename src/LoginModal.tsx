import { useState } from 'react';
import { useAuth } from './contexts/AuthContext';

export const LoginModal = () => {
    const [isSignup, setIsSignup] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

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
            backgroundColor: 'var(--theme-canvas-bg)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999
        }}>
            <div className="glass" style={{
                width: '400px',
                maxWidth: '90vw',
                padding: 'var(--spacing-8)',
                borderRadius: 'var(--radius-2xl)',
                boxShadow: 'var(--shadow-2xl)'
            }}>


                {/* Header */}
                <div style={{ textAlign: 'center', marginBottom: 'var(--spacing-6)' }}>
                    <h1 style={{
                        fontSize: 'var(--text-3xl)',
                        fontWeight: 700,
                        margin: 0,
                        marginBottom: 'var(--spacing-2)',
                        background: 'linear-gradient(135deg, var(--primary-600), var(--accent-500))',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent'
                    }}>
                        Infinite Mind
                    </h1>
                    <p style={{
                        fontSize: 'var(--text-sm)',
                        color: 'var(--neutral-600)',
                        margin: 0
                    }}>
                        {isSignup ? 'Create your account' : 'Welcome back'}
                    </p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-4)' }}>
                    <div>
                        <label style={{
                            display: 'block',
                            fontSize: 'var(--text-sm)',
                            fontWeight: 600,
                            marginBottom: 'var(--spacing-2)',
                            color: 'var(--neutral-700)'
                        }}>
                            Email
                        </label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            style={{
                                width: '100%',
                                padding: 'var(--spacing-3)',
                                borderRadius: 'var(--radius-lg)',
                                border: '2px solid var(--neutral-300)',
                                fontSize: 'var(--text-base)',
                                outline: 'none',
                                transition: 'border-color var(--transition-base)'
                            }}
                            onFocus={(e) => e.target.style.borderColor = 'var(--primary-500)'}
                            onBlur={(e) => e.target.style.borderColor = 'var(--neutral-300)'}
                        />
                    </div>

                    <div>
                        <label style={{
                            display: 'block',
                            fontSize: 'var(--text-sm)',
                            fontWeight: 600,
                            marginBottom: 'var(--spacing-2)',
                            color: 'var(--neutral-700)'
                        }}>
                            Password
                        </label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            minLength={6}
                            style={{
                                width: '100%',
                                padding: 'var(--spacing-3)',
                                borderRadius: 'var(--radius-lg)',
                                border: '2px solid var(--neutral-300)',
                                fontSize: 'var(--text-base)',
                                outline: 'none',
                                transition: 'border-color var(--transition-base)'
                            }}
                            onFocus={(e) => e.target.style.borderColor = 'var(--primary-500)'}
                            onBlur={(e) => e.target.style.borderColor = 'var(--neutral-300)'}
                        />
                    </div>

                    {error && (
                        <div style={{
                            padding: 'var(--spacing-3)',
                            backgroundColor: 'rgba(239, 68, 68, 0.1)',
                            border: '1px solid rgb(239, 68, 68)',
                            borderRadius: 'var(--radius-lg)',
                            color: 'rgb(239, 68, 68)',
                            fontSize: 'var(--text-sm)'
                        }}>
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        style={{
                            width: '100%',
                            padding: 'var(--spacing-3)',
                            borderRadius: 'var(--radius-lg)',
                            border: 'none',
                            background: 'linear-gradient(135deg, var(--primary-600), var(--accent-500))',
                            color: 'white',
                            fontSize: 'var(--text-base)',
                            fontWeight: 600,
                            cursor: loading ? 'not-allowed' : 'pointer',
                            opacity: loading ? 0.6 : 1,
                            transition: 'all var(--transition-base)'
                        }}
                    >
                        {loading ? 'Please wait...' : (isSignup ? 'Sign Up' : 'Log In')}
                    </button>

                    <div style={{ textAlign: 'center' }}>
                        <button
                            type="button"
                            onClick={() => {
                                setIsSignup(!isSignup);
                                setError('');
                            }}
                            style={{
                                background: 'none',
                                border: 'none',
                                color: 'var(--primary-600)',
                                fontSize: 'var(--text-sm)',
                                cursor: 'pointer',
                                fontWeight: 600
                            }}
                        >
                            {isSignup ? 'Already have an account? Log in' : "Don't have an account? Sign up"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
