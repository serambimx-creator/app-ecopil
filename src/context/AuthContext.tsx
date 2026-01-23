'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabase } from '@/lib/supabase';
import { Profile } from '@/types/database';

interface AuthContextType {
    user: Profile | null; // Our custom profile type
    isLoading: boolean;
    signIn: (profile: Profile) => void;
    signOut: () => void;
    userId: string | undefined; // Helper for DB operations (uuid)
    isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<Profile | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // 1. Check LocalStorage (Prototype Persistence)
        const storedSession = localStorage.getItem('ecopil_session');
        if (storedSession) {
            try {
                const parsedProfile = JSON.parse(storedSession);
                setUser(parsedProfile);
            } catch (e) {
                console.error("Failed to parse stored session", e);
                localStorage.removeItem('ecopil_session');
            }
        }

        // 2. Check Supabase Session (Future Proofing / Security)
        const checkSupabaseSession = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (session) {
                // In a real app, we would fetch the profile here if not in local storage
                // For this prototype, if we have a supabase session but no local profile, 
                // we might want to fetch it. But let's rely on 'signIn' logic primarily for now.
            }
            setIsLoading(false);
        };

        checkSupabaseSession();
    }, []);

    const signIn = (profile: Profile) => {
        setUser(profile);
        localStorage.setItem('ecopil_session', JSON.stringify(profile));
    };

    const signOut = async () => {
        setUser(null);
        localStorage.removeItem('ecopil_session');
        await supabase.auth.signOut();
    };

    const userId = user?.id; // Or fetch from real auth if we had it fully linked

    return (
        <AuthContext.Provider value={{
            user,
            isLoading,
            signIn,
            signOut,
            userId,
            isAuthenticated: !!user
        }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
