"use client";
import React, { createContext, useContext, useState, useEffect } from "react";

interface User {
    userId: string;
    name: string;
    email: string;
    role: string;
}

interface UserContextType {
    user: User | null;
    loading: boolean;
    isAdmin: boolean;
    refetch: () => void;
}

const UserContext = createContext<UserContextType>({
    user: null,
    loading: true,
    isAdmin: false,
    refetch: () => { },
});

export const useUser = () => useContext(UserContext);

export function UserProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    const fetchUser = async () => {
        try {
            const res = await fetch("/api/me");
            if (res.ok) {
                const data = await res.json();
                setUser(data);
            }
        } catch (error) {
            console.error("Failed to fetch user:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUser();
    }, []);

    return (
        <UserContext.Provider value={{
            user,
            loading,
            isAdmin: user?.role === "admin",
            refetch: fetchUser,
        }}>
            {children}
        </UserContext.Provider>
    );
}
