import { useState } from 'react';
import { MessageSquare, X, Send, CheckCircle, AlertCircle } from 'lucide-react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { firestore } from '../firebase';
import { useAuth } from '../contexts/AuthContext';
import { useStore } from '../store';

export const FeedbackButton = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [message, setMessage] = useState('');
    const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');
    const { user } = useAuth();
    const theme = useStore((state) => state.theme);

    const handleSubmit = async () => {
        if (!message.trim()) return;

        setStatus('sending');

        try {
            const deviceInfo = {
                userAgent: navigator.userAgent,
                screenSize: `${window.innerWidth}x${window.innerHeight}`,
                theme,
                language: navigator.language,
                platform: navigator.platform
            };

            await addDoc(collection(firestore, 'feedback'), {
                userId: user?.uid || 'anonymous',
                email: user?.email || 'unknown',
                message: message.trim(),
                timestamp: serverTimestamp(),
                deviceInfo
            });

            setStatus('success');
            setTimeout(() => {
                setIsOpen(false);
                setMessage('');
                setStatus('idle');
            }, 2000);
        } catch (error) {
            console.error('Failed to submit feedback:', error);
            setStatus('error');
        }
    };

    return (
        <>
            {/* Floating Button */}
            <button
                id="feedback-button"
                onClick={() => setIsOpen(true)}
                className="glass"
                style={{
                    position: 'fixed',
                    bottom: '20px',
                    left: '20px',
                    width: '48px',
                    height: '48px',
                    borderRadius: '50%',
                    zIndex: 'var(--z-popover)',
                    border: 'none',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: 'var(--shadow-lg)',
                    transition: 'transform 0.2s, box-shadow 0.2s',
                    color: 'var(--neutral-600)'
                }}
                onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'scale(1.05)';
                    e.currentTarget.style.boxShadow = 'var(--shadow-xl)';
                }}
                onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'scale(1)';
                    e.currentTarget.style.boxShadow = 'var(--shadow-lg)';
                }}
                title="Send Feedback"
            >
                <MessageSquare size={20} />
            </button>

            {/* Modal */}
            {isOpen && (
                <div
                    className="fade-in"
                    style={{
                        position: 'fixed',
                        inset: 0,
                        backgroundColor: 'rgba(0, 0, 0, 0.4)',
                        backdropFilter: 'blur(4px)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 'var(--z-modal)',
                        padding: '20px'
                    }}
                    onClick={() => setIsOpen(false)}
                >
                    <div
                        className="glass scale-in"
                        style={{
                            width: '400px',
                            maxWidth: '100%',
                            borderRadius: '16px',
                            padding: '24px',
                            backgroundColor: 'var(--bg)',
                            boxShadow: 'var(--shadow-2xl)'
                        }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Header */}
                        <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            marginBottom: '20px'
                        }}>
                            <h2 style={{
                                fontSize: '18px',
                                fontWeight: 600,
                                margin: 0,
                                color: 'var(--text)'
                            }}>
                                Send Feedback
                            </h2>
                            <button
                                onClick={() => setIsOpen(false)}
                                style={{
                                    background: 'transparent',
                                    border: 'none',
                                    cursor: 'pointer',
                                    padding: '4px',
                                    color: 'var(--neutral-500)'
                                }}
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* Content */}
                        {status === 'success' ? (
                            <div style={{
                                textAlign: 'center',
                                padding: '40px 20px',
                                color: 'var(--permanent-main)'
                            }}>
                                <CheckCircle size={48} style={{ marginBottom: '16px' }} />
                                <p style={{ fontSize: '16px', fontWeight: 500 }}>
                                    Thank you for your feedback!
                                </p>
                            </div>
                        ) : status === 'error' ? (
                            <div style={{
                                textAlign: 'center',
                                padding: '40px 20px',
                                color: '#DC2626'
                            }}>
                                <AlertCircle size={48} style={{ marginBottom: '16px' }} />
                                <p style={{ fontSize: '16px', fontWeight: 500 }}>
                                    Failed to send. Please try again.
                                </p>
                                <button
                                    onClick={() => setStatus('idle')}
                                    style={{
                                        marginTop: '16px',
                                        padding: '8px 16px',
                                        backgroundColor: 'var(--neutral-100)',
                                        border: 'none',
                                        borderRadius: '8px',
                                        cursor: 'pointer'
                                    }}
                                >
                                    Try Again
                                </button>
                            </div>
                        ) : (
                            <>
                                <textarea
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    placeholder="Describe your issue, suggestion, or what you love about the app..."
                                    style={{
                                        width: '100%',
                                        minHeight: '120px',
                                        padding: '12px',
                                        borderRadius: '8px',
                                        border: '1px solid var(--border)',
                                        backgroundColor: 'var(--neutral-50)',
                                        color: 'var(--text)',
                                        fontSize: '14px',
                                        resize: 'vertical',
                                        outline: 'none',
                                        fontFamily: 'inherit',
                                        boxSizing: 'border-box'
                                    }}
                                    onFocus={(e) => e.currentTarget.style.borderColor = 'var(--primary-500)'}
                                    onBlur={(e) => e.currentTarget.style.borderColor = 'var(--border)'}
                                />

                                <p style={{
                                    fontSize: '12px',
                                    color: 'var(--neutral-500)',
                                    marginTop: '12px',
                                    marginBottom: '20px'
                                }}>
                                    Your feedback helps us improve! Device info will be included automatically.
                                </p>

                                <button
                                    onClick={handleSubmit}
                                    disabled={!message.trim() || status === 'sending'}
                                    style={{
                                        width: '100%',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '8px',
                                        padding: '12px',
                                        backgroundColor: message.trim() ? 'var(--primary-600)' : 'var(--neutral-300)',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '8px',
                                        fontSize: '14px',
                                        fontWeight: 600,
                                        cursor: message.trim() ? 'pointer' : 'not-allowed',
                                        transition: 'background-color 0.2s'
                                    }}
                                >
                                    {status === 'sending' ? (
                                        'Sending...'
                                    ) : (
                                        <>
                                            <Send size={16} />
                                            Send Feedback
                                        </>
                                    )}
                                </button>
                            </>
                        )}
                    </div>
                </div>
            )}
        </>
    );
};
