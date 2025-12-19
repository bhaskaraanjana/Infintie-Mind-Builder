import { useState } from 'react';
import { useAuth } from './contexts/AuthContext';
import { Mail, RefreshCw, LogOut, CheckCircle } from 'lucide-react';

export const EmailVerificationModal = () => {
    const { user, reloadUser, sendVerificationEmail, logout } = useAuth();
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    const handleCheckVerification = async () => {
        setLoading(true);
        setError('');
        setMessage('');
        try {
            await reloadUser();
            // If verified, App.tsx will automatically unmount this component
        } catch (err: any) {
            setError('Failed to check verification status.');
        } finally {
            setLoading(false);
        }
    };

    const handleResendEmail = async () => {
        setLoading(true);
        setError('');
        setMessage('');
        try {
            await sendVerificationEmail();
            setMessage('Verification email sent! Please check your inbox.');
        } catch (err: any) {
            setError(err.message || 'Failed to send email.');
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
            {/* Ambient Background */}
            <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
                <div style={{
                    position: 'absolute',
                    top: '-20%',
                    left: '-10%',
                    width: '60%',
                    height: '60%',
                    borderRadius: '9999px',
                    backgroundColor: 'rgba(234, 179, 8, 0.2)', // Yellow-500 (Warning/Action)
                    filter: 'blur(100px)'
                }} />
                <div style={{
                    position: 'absolute',
                    bottom: '-20%',
                    right: '-10%',
                    width: '60%',
                    height: '60%',
                    borderRadius: '9999px',
                    backgroundColor: 'rgba(59, 130, 246, 0.2)', // Blue-500
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
                boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
            }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '24px', textAlign: 'center' }}>
                    <div style={{
                        width: '64px',
                        height: '64px',
                        marginBottom: '16px',
                        borderRadius: '16px',
                        background: 'linear-gradient(135deg, var(--primary-100), var(--primary-200))',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'var(--primary-600)'
                    }}>
                        <Mail size={32} />
                    </div>
                    <h1 style={{
                        fontSize: '24px',
                        fontWeight: 700,
                        color: 'var(--neutral-900)',
                        marginBottom: '8px'
                    }}>
                        Verify your email
                    </h1>
                    <p style={{ color: 'var(--neutral-500)', fontSize: '14px', lineHeight: '1.5' }}>
                        We sent a verification email to<br />
                        <span style={{ fontWeight: 600, color: 'var(--neutral-900)' }}>{user?.email}</span>
                    </p>
                    <p style={{ color: 'var(--neutral-500)', fontSize: '14px', marginTop: '8px' }}>
                        Please check your inbox and click the link to continue.
                    </p>
                </div>

                {/* Status Messages */}
                {message && (
                    <div style={{
                        marginBottom: '16px',
                        padding: '12px',
                        borderRadius: '8px',
                        backgroundColor: '#f0fdf4',
                        border: '1px solid #dcfce7',
                        color: '#15803d',
                        fontSize: '14px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                    }}>
                        <CheckCircle size={16} />
                        {message}
                    </div>
                )}

                {error && (
                    <div style={{
                        marginBottom: '16px',
                        padding: '12px',
                        borderRadius: '8px',
                        backgroundColor: '#fef2f2',
                        border: '1px solid #fee2e2',
                        color: '#dc2626',
                        fontSize: '14px'
                    }}>
                        {error}
                    </div>
                )}

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <button
                        onClick={handleCheckVerification}
                        disabled={loading}
                        style={{
                            width: '100%',
                            padding: '12px',
                            background: 'linear-gradient(to right, var(--primary-600), #2563eb)',
                            color: 'white',
                            fontWeight: 600,
                            borderRadius: '12px',
                            border: 'none',
                            cursor: loading ? 'not-allowed' : 'pointer',
                            opacity: loading ? 0.7 : 1,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px',
                            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
                        }}
                    >
                        {loading ? <RefreshCw className="animate-spin" size={18} /> : <CheckCircle size={18} />}
                        <span>I've Verified My Email</span>
                    </button>

                    <button
                        onClick={handleResendEmail}
                        disabled={loading}
                        style={{
                            width: '100%',
                            padding: '12px',
                            background: 'white',
                            color: 'var(--neutral-700)',
                            fontWeight: 600,
                            borderRadius: '12px',
                            border: '1px solid var(--neutral-200)',
                            cursor: loading ? 'not-allowed' : 'pointer',
                            transition: 'background-color 0.2s'
                        }}
                    >
                        Resend Email
                    </button>

                    <button
                        onClick={logout}
                        style={{
                            marginTop: '8px',
                            width: '100%',
                            background: 'none',
                            border: 'none',
                            color: 'var(--neutral-500)',
                            fontSize: '14px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '6px'
                        }}
                    >
                        <LogOut size={16} />
                        Sign Out
                    </button>
                </div>
            </div>

            <style>{`
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
                .animate-spin {
                    animation: spin 1s linear infinite;
                }
            `}</style>
        </div>
    );
};
