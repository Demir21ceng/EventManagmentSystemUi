import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Box, CircularProgress } from "@mui/material";

const ProtectedRoute = ({ children, organizerOnly = false, adminOnly = false }) => {
    const { user, loading } = useAuth();

    if (loading) {
        return (
            <Box sx={{ display: "flex", justifyContent: "center", mt: 10 }}>
                <CircularProgress sx={{ color: "#e94560" }} />
            </Box>
        );
    }

    if (!user) return <Navigate to="/login" replace />;

    if (adminOnly) {
        const isAdm = user?.role === "ROLE_ADMIN" || user?.role === "ADMIN";
        if (!isAdm) return <Navigate to="/events" replace />;
    }

    if (organizerOnly) {
        const isOrg = user?.role === "ROLE_ORGANIZER" || user?.role === "ORGANIZER";
        if (!isOrg) return <Navigate to="/" replace />;
    }

    return children;
};

export default ProtectedRoute;
