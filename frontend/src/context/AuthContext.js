import { createContext, useState, useEffect } from "react";
import { setAuthToken } from "../httpCommon";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    // Initializing user from localStorage if available
    const [user, setUser] = useState(() => {
        const storedUser = localStorage.getItem("chat_user");
        return storedUser ? JSON.parse(storedUser) : null;
    });

    // Initializing token from localStorage
    const [token, setToken] = useState(() => {
        return localStorage.getItem("chat_token") || null;
    });

    // Initialize Auth Token on startup
    useEffect(() => {
        if (token) {
            setAuthToken(token);
        }
    }, []);

    // Sync state with localStorage
    useEffect(() => {
        if (user && token) {
            localStorage.setItem("chat_user", JSON.stringify(user));
            localStorage.setItem("chat_token", token);
            setAuthToken(token); // Ensure headers are always fresh
        } else {
            localStorage.removeItem("chat_user");
            localStorage.removeItem("chat_token");
            setAuthToken(null);
        }
    }, [user, token]);

    return (
        <AuthContext.Provider value={{ user, setUser, token, setToken }}>
            {children}
        </AuthContext.Provider>
    )
}