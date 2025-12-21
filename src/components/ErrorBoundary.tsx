import { Component } from 'react';
import type { ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Trash2 } from 'lucide-react';

interface Props {
    children: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
    errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
        error: null,
        errorInfo: null
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error, errorInfo: null };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('Uncaught error:', error, errorInfo);
        this.setState({ errorInfo });
    }

    private handleReload = () => {
        window.location.reload();
    };

    private handleReset = async () => {
        if (confirm('This will clear all local data and reload. Are you sure?')) {
            try {
                localStorage.clear();
                // Clear IndexedDB if possible, though strict mode usually handles this via cache clear
                // We can attempt to delete the DBs used
                const dbs = await window.indexedDB.databases();
                dbs.forEach(db => {
                    if (db.name) window.indexedDB.deleteDatabase(db.name);
                });
            } catch (e) {
                console.error('Failed to clear data', e);
            }
            window.location.reload();
        }
    };

    public render() {
        if (this.state.hasError) {
            return (
                <div style={{
                    height: '100vh',
                    width: '100vw',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: '#f9fafb',
                    fontFamily: 'system-ui, -apple-system, sans-serif',
                    padding: '20px',
                    boxSizing: 'border-box'
                }}>
                    <div style={{
                        maxWidth: '500px',
                        width: '100%',
                        backgroundColor: 'white',
                        padding: '40px',
                        borderRadius: '16px',
                        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
                        textAlign: 'center'
                    }}>
                        <div style={{
                            width: '64px',
                            height: '64px',
                            backgroundColor: '#FEF2F2',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            margin: '0 auto 24px auto',
                            color: '#DC2626'
                        }}>
                            <AlertTriangle size={32} />
                        </div>

                        <h1 style={{
                            fontSize: '24px',
                            fontWeight: 700,
                            color: '#111827',
                            marginBottom: '12px'
                        }}>
                            Something went wrong
                        </h1>

                        <p style={{
                            color: '#6B7280',
                            marginBottom: '32px',
                            lineHeight: 1.5
                        }}>
                            The application encountered an unexpected error.
                            You can try reloading the page, or perform an emergency reset if the issue persists.
                        </p>

                        <div style={{
                            textAlign: 'left',
                            backgroundColor: '#F3F4F6',
                            padding: '16px',
                            borderRadius: '8px',
                            marginBottom: '32px',
                            fontSize: '12px',
                            color: '#EF4444',
                            fontFamily: 'monospace',
                            overflowX: 'auto'
                        }}>
                            {this.state.error?.toString()}
                        </div>

                        <div style={{ display: 'flex', gap: '12px', flexDirection: 'column' }}>
                            <button
                                onClick={this.handleReload}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '8px',
                                    width: '100%',
                                    padding: '12px',
                                    backgroundColor: '#3B82F6',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '8px',
                                    fontWeight: 600,
                                    cursor: 'pointer',
                                    fontSize: '16px',
                                    transition: 'background-color 0.2s'
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#2563EB'}
                                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#3B82F6'}
                            >
                                <RefreshCw size={18} />
                                Reload Application
                            </button>

                            <button
                                onClick={this.handleReset}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '8px',
                                    width: '100%',
                                    padding: '12px',
                                    backgroundColor: 'white',
                                    color: '#DC2626',
                                    border: '1px solid #FECACA',
                                    borderRadius: '8px',
                                    fontWeight: 600,
                                    cursor: 'pointer',
                                    fontSize: '14px',
                                    transition: 'all 0.2s'
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.backgroundColor = '#FEF2F2';
                                    e.currentTarget.style.borderColor = '#DC2626';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.backgroundColor = 'white';
                                    e.currentTarget.style.borderColor = '#FECACA';
                                }}
                            >
                                <Trash2 size={16} />
                                Emergency Reset (Clear Data)
                            </button>
                        </div>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}
