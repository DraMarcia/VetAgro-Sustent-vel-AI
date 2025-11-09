
import React, { createContext, useState, useContext, ReactNode, useCallback, useMemo, useEffect } from 'react';
import { User } from '../types.ts';

// Mock user data for simulation purposes
const MOCK_USER: User = {
    uid: '12345-mock',
    name: 'Usuário Convidado',
    email: 'convidado@vetagro.ai',
};

interface AuthContextType {
    user: User | null;
    login: (email: string, pass: string) => Promise<void>;
    signup: (name: string, email: string, pass: string) => Promise<void>;
    loginWithGoogle: () => Promise<void>;
    logout: () => void;
    loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Simulate checking for a logged-in user in localStorage
        try {
            const storedUser = localStorage.getItem('authUser');
            if (storedUser) {
                setUser(JSON.parse(storedUser));
            }
        } catch (error) {
            console.error("Failed to load user from localStorage", error);
        } finally {
            setLoading(false);
        }
    }, []);

    const updateUserSession = (userData: User | null) => {
        if (userData) {
            localStorage.setItem('authUser', JSON.stringify(userData));
            setUser(userData);
        } else {
            localStorage.removeItem('authUser');
            setUser(null);
        }
    };

    const login = useCallback(async (email: string, pass: string) => {
        console.log("Simulating login for:", email, pass);
        // Simulate API call
        await new Promise(res => setTimeout(res, 500));
        const loggedInUser = { ...MOCK_USER, email, name: email.split('@')[0] };
        updateUserSession(loggedInUser);
    }, []);

    const signup = useCallback(async (name: string, email: string, pass: string) => {
        console.log("Simulating signup for:", name, email, pass);
        // Simulate API call
        await new Promise(res => setTimeout(res, 500));
        const newUser = { ...MOCK_USER, email, name };
        updateUserSession(newUser);
    }, []);

    const loginWithGoogle = useCallback(async () => {
        console.log("Simulating login with Google");
        // Simulate API call
        await new Promise(res => setTimeout(res, 500));
        const googleUser = { ...MOCK_USER, name: 'Usuário Google', email: 'user.google@example.com' };
        updateUserSession(googleUser);
    }, []);

    const logout = useCallback(() => {
        console.log("Simulating logout");
        updateUserSession(null);
    }, []);

    const value = useMemo(() => ({
        user,
        login,
        signup,
        loginWithGoogle,
        logout,
        loading,
    }), [user, login, signup, loginWithGoogle, logout, loading]);

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};
