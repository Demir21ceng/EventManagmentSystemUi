import React, { createContext, useContext, useState, useEffect } from "react";
import { authService } from "../api/AuthService";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const currentUser = authService.getCurrentUser();
        if (currentUser && authService.isAuthenticated()) {
            setUser(currentUser);
        }
        setLoading(false);
    }, []);

    const login = async (identifier, password) => {
        const { user: loggedInUser } = await authService.login(identifier, password);
        setUser(loggedInUser);
        return loggedInUser;
    };

    const register = async (userData) => {
        return await authService.register(userData);
    };

    const logout = () => {
        authService.logout();
        setUser(null);
    };

    const isOrganizer = () => {
        return user?.role === "ROLE_ORGANIZER" || user?.role === "ORGANIZER";
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, logout, register, isOrganizer }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error("useAuth must be used within AuthProvider");
    return context;
};
