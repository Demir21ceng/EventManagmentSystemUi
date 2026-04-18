import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { createTheme, ThemeProvider, CssBaseline } from "@mui/material";
import { AuthProvider } from "./context/AuthContext";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import EventListPage from "./pages/EventListPage";
import EventDetailPage from "./pages/EventDetailPage";
import EventFormPage from "./pages/EventFormPage";
import DashboardPage from "./pages/DashboardPage";
import MyTicketsPage from "./pages/MyTicketsPage";

const theme = createTheme({
    palette: {
        primary: { main: "#e94560" },
        secondary: { main: "#0f3460" },
    },
    typography: {
        fontFamily: "'DM Sans', sans-serif",
    },
    components: {
        MuiTextField: {
            defaultProps: { variant: "outlined" },
            styleOverrides: {
                root: {
                    "& .MuiOutlinedInput-root": {
                        borderRadius: "10px",
                    },
                },
            },
        },
        MuiButton: {
            styleOverrides: {
                root: {
                    borderRadius: "10px",
                },
            },
        },
    },
});

const AppRoutes = () => (
    <>
        <Navbar />
        <Routes>
            <Route path="/" element={<Navigate to="/events" replace />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/events" element={<EventListPage />} />

            {/* Sabit path'ler /:id'den ÖNCE gelmeli */}
            <Route
                path="/events/create"
                element={
                    <ProtectedRoute organizerOnly>
                        <EventFormPage />
                    </ProtectedRoute>
                }
            />

            {/* Dinamik path'ler en sona */}
            <Route path="/events/:id" element={<EventDetailPage />} />
            <Route
                path="/events/:id/edit"
                element={
                    <ProtectedRoute organizerOnly>
                        <EventFormPage />
                    </ProtectedRoute>
                }
            />

            <Route
                path="/dashboard"
                element={
                    <ProtectedRoute organizerOnly>
                        <DashboardPage />
                    </ProtectedRoute>
                }
            />

            {/* ATTENDEE — Biletlerim */}
            <Route
                path="/my-tickets"
                element={
                    <ProtectedRoute>
                        <MyTicketsPage />
                    </ProtectedRoute>
                }
            />

            <Route path="*" element={<Navigate to="/events" replace />} />
        </Routes>
    </>
);

const App = () => (
    <ThemeProvider theme={theme}>
        <CssBaseline />
        <AuthProvider>
            <Router>
                <AppRoutes />
            </Router>
        </AuthProvider>
    </ThemeProvider>
);

export default App;