// Firebase implementation of AuthService
import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged as firebaseOnAuthStateChanged,
    sendPasswordResetEmail,
    User as FirebaseUser
} from 'firebase/auth';
import { auth } from '../firebase';
import type { AuthService, User } from './authService';

// Convert Firebase user to our User type
const mapFirebaseUser = (firebaseUser: FirebaseUser): User => ({
    uid: firebaseUser.uid,
    email: firebaseUser.email,
    displayName: firebaseUser.displayName
});

class FirebaseAuthService implements AuthService {
    async signup(email: string, password: string): Promise<User> {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        return mapFirebaseUser(userCredential.user);
    }

    async login(email: string, password: string): Promise<User> {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        return mapFirebaseUser(userCredential.user);
    }

    async logout(): Promise<void> {
        await signOut(auth);
    }

    getCurrentUser(): User | null {
        const firebaseUser = auth.currentUser;
        return firebaseUser ? mapFirebaseUser(firebaseUser) : null;
    }

    onAuthStateChanged(callback: (user: User | null) => void): () => void {
        return firebaseOnAuthStateChanged(auth, (firebaseUser) => {
            callback(firebaseUser ? mapFirebaseUser(firebaseUser) : null);
        });
    }

    async sendPasswordReset(email: string): Promise<void> {
        await sendPasswordResetEmail(auth, email);
    }
}

// Export singleton instance
export const authService = new FirebaseAuthService();
