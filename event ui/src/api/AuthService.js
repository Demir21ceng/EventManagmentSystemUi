import api from "./api";
import { jwtDecode } from "jwt-decode";

export const authService = {
    register: async (userData) => {
        const response = await api.post("/auth/register", userData);
        return response.data;
    },

    login: async (identifier, password) => {
        const response = await api.post("/auth/login", { identifier, password });
        const { token } = response.data;

        localStorage.setItem("token", token);

        // Token'ı decode ederek kullanıcı bilgisini çıkar
        try {
            const decoded = jwtDecode(token);
            const user = {
                id: decoded.sub,
                role: decoded.role || decoded.roles?.[0] || "",
                email: decoded.email || "",
                username: decoded.username || "",
            };
            localStorage.setItem("user", JSON.stringify(user));
            return { token, user };
        } catch {
            return { token, user: null };
        }
    },

    logout: () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
    },

    getCurrentUser: () => {
        try {
            const user = localStorage.getItem("user");
            return user ? JSON.parse(user) : null;
        } catch {
            return null;
        }
    },

    getToken: () => localStorage.getItem("token"),

    isAuthenticated: () => !!localStorage.getItem("token"),

    isOrganizer: () => {
        const user = authService.getCurrentUser();
        return user?.role === "ROLE_ORGANIZER" || user?.role === "ORGANIZER";
    },
};