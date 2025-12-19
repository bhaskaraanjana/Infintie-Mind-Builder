// Abstraction layer for authentication
// This allows us to switch backends later without changing component code

export interface User {
    uid: string;
    email: string | null;
    displayName: string | null;
    emailVerified: boolean;
}

export interface AuthService {
    // Sign up
    signup(email: string, password: string): Promise<User>;

    // Sign in
    login(email: string, password: string): Promise<User>;

    // Sign out
    logout(): Promise<void>;

    // Get current user
    getCurrentUser(): User | null;

    // Listen to auth state changes
    onAuthStateChanged(callback: (user: User | null) => void): () => void;

    // Password reset
    sendPasswordReset(email: string): Promise<void>;

    // Refresh user data (for email verification check)
    reloadUser(): Promise<User | null>;

    // Send verification email
    sendVerificationEmail(): Promise<void>;

    // Google sign-in (optional for later)
    loginWithGoogle?(): Promise<User>;
}
