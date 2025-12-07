import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { authService } from '../services/firebaseAuthService';
import type { User } from '../services/authService';

interface AuthContextType {
    user: User | null;
    loading: boolean;
    signup: (email: string, password: string) => Promise<void>;
    login: (email: string, password: string) => Promise<void>;
    logout: () => Promise<void>;
    sendPasswordReset: (email: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
};

interface AuthProviderProps {
    children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Listen for auth state changes
        const unsubscribe = authService.onAuthStateChanged((user) => {
            setUser(user);
            setLoading(false);
        });

        return unsubscribe;
    }, []);

    const signup = async (email: string, password: string) => {
        const user = await authService.signup(email, password);
        setUser(user);
    };

    const login = async (email: string, password: string) => {
        const user = await authService.login(email, password);
        setUser(user);
    };

    const logout = async () => {
        await authService.logout();
        setUser(null);
    };

    const sendPasswordReset = async (email: string) => {
        await authService.sendPasswordReset(email);
    };

    const value = {
        user,
        loading,
        signup,
        login,
        logout,
        sendPasswordReset
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};
