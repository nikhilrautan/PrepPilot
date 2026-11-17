import { createContext, useEffect, useState } from "react";
import { getMe } from "./services/auth.api";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true); // true until first check finishes

    useEffect(() => {
        let cancelled = false;

        const getAndSetUser = async () => {
            try {
                const data = await getMe();
                if (!cancelled) setUser(data.user);
            } catch (err) {
                if (!cancelled) setUser(null); // 401 just means "not logged in"
            } finally {
                if (!cancelled) setLoading(false);
            }
        };

        getAndSetUser();
        return () => { cancelled = true; };
    }, []);

    return (
        <AuthContext.Provider value={{ user, setUser, loading, setLoading }}>
            {children}
        </AuthContext.Provider>
    );
};