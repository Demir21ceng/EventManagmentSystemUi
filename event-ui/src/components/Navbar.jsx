import React, { useState } from "react";
import {
    AppBar,
    Toolbar,
    Typography,
    Button,
    IconButton,
    Menu,
    MenuItem,
    Avatar,
    Box,
    Chip,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import EventNoteIcon from "@mui/icons-material/EventNote";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";

const Navbar = () => {
    const { user, logout, isOrganizer, isAdmin } = useAuth();
    const navigate = useNavigate();
    const [anchorEl, setAnchorEl] = useState(null);

    const handleMenuOpen = (e) => setAnchorEl(e.currentTarget);
    const handleMenuClose = () => setAnchorEl(null);

    const handleLogout = () => {
        logout();
        handleMenuClose();
        navigate("/login");
    };

    const roleLabel = isAdmin() ? "Admin" : isOrganizer() ? "Organizatör" : "Kullanıcı";
    const roleColor = isAdmin() ? "#a855f7" : isOrganizer() ? "#e94560" : "rgba(255,255,255,0.7)";
    const roleBg = isAdmin() ? "rgba(168,85,247,0.2)" : isOrganizer() ? "rgba(233,69,96,0.2)" : "rgba(255,255,255,0.1)";
    const roleBorder = isAdmin() ? "#a855f7" : isOrganizer() ? "#e94560" : "rgba(255,255,255,0.2)";

    return (
        <AppBar
            position="sticky"
            elevation={0}
            sx={{
                background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)",
                borderBottom: "1px solid rgba(255,255,255,0.08)",
            }}
        >
            <Toolbar sx={{ px: { xs: 2, md: 4 } }}>
                {/* Logo */}
                <Box
                    sx={{ display: "flex", alignItems: "center", gap: 1, cursor: "pointer", flexGrow: 1 }}
                    onClick={() => navigate("/")}
                >
                    <EventNoteIcon sx={{ color: "#e94560", fontSize: 28 }} />
                    <Typography
                        variant="h6"
                        sx={{
                            fontFamily: "'Playfair Display', serif",
                            fontWeight: 700,
                            letterSpacing: "0.05em",
                            color: "#fff",
                        }}
                    >
                        EventHub
                    </Typography>
                </Box>

                {/* Nav Links */}
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Button
                        onClick={() => navigate("/events")}
                        sx={{ color: "rgba(255,255,255,0.8)", textTransform: "none", fontWeight: 500 }}
                    >
                        Etkinlikler
                    </Button>

                    {user ? (
                        <>
                            {isAdmin() && (
                                <Button
                                    variant="contained"
                                    onClick={() => navigate("/admin")}
                                    sx={{
                                        background: "linear-gradient(135deg,#7c3aed,#a855f7)",
                                        textTransform: "none",
                                        fontWeight: 600,
                                        borderRadius: "8px",
                                        "&:hover": { background: "linear-gradient(135deg,#6d28d9,#9333ea)" },
                                        mr: 1
                                    }}
                                >
                                    ⚙️ Admin Paneli
                                </Button>
                            )}

                            {(isAdmin() || isOrganizer()) && !isOrganizer() && (
                                <Button
                                    onClick={() => navigate("/check-in")}
                                    sx={{ color: "rgba(255,255,255,0.8)", textTransform: "none", fontWeight: 500 }}
                                >
                                    Bilet Check-in
                                </Button>
                            )}

                            {isOrganizer() && (
                                <>
                                    <Button
                                        onClick={() => navigate("/dashboard")}
                                        sx={{ color: "rgba(255,255,255,0.8)", textTransform: "none", fontWeight: 500 }}
                                    >
                                        Dashboard
                                    </Button>
                                    <Button
                                        onClick={() => navigate("/check-in")}
                                        sx={{ color: "rgba(255,255,255,0.8)", textTransform: "none", fontWeight: 500 }}
                                    >
                                        Bilet Check-in
                                    </Button>
                                    <Button
                                        variant="contained"
                                        onClick={() => navigate("/events/create")}
                                        sx={{
                                            background: "#e94560",
                                            textTransform: "none",
                                            fontWeight: 600,
                                            borderRadius: "8px",
                                            "&:hover": { background: "#c73652" },
                                        }}
                                    >
                                        + Etkinlik Oluştur
                                    </Button>

                                </>
                            )}

                            {!isAdmin() && !isOrganizer() && (
                                <Button
                                    onClick={() => navigate("/my-tickets")}
                                    sx={{ color: "rgba(255,255,255,0.8)", textTransform: "none", fontWeight: 500 }}
                                >
                                    🎫 Biletlerim
                                </Button>
                            )}

                            <Chip
                                label={roleLabel}
                                size="small"
                                sx={{
                                    ml: 1,
                                    background: roleBg,
                                    color: roleColor,
                                    border: `1px solid ${roleBorder}`,
                                    fontSize: "0.7rem",
                                }}
                            />

                            <IconButton onClick={handleMenuOpen} sx={{ ml: 0.5 }}>
                                <Avatar sx={{ width: 34, height: 34, bgcolor: isAdmin() ? "#7c3aed" : "#e94560", fontSize: "0.9rem" }}>
                                    <AccountCircleIcon fontSize="small" />
                                </Avatar>
                            </IconButton>

                            <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
                                <MenuItem disabled>
                                    <Typography variant="caption" color="text.secondary">
                                        ID: {user?.id}
                                    </Typography>
                                </MenuItem>
                                <MenuItem onClick={handleLogout}>Çıkış Yap</MenuItem>
                            </Menu>
                        </>
                    ) : (
                        <>
                            <Button
                                onClick={() => navigate("/login")}
                                sx={{ color: "rgba(255,255,255,0.8)", textTransform: "none" }}
                            >
                                Giriş Yap
                            </Button>
                            <Button
                                variant="outlined"
                                onClick={() => navigate("/register")}
                                sx={{
                                    color: "#e94560",
                                    borderColor: "#e94560",
                                    textTransform: "none",
                                    borderRadius: "8px",
                                    "&:hover": { borderColor: "#c73652", background: "rgba(233,69,96,0.08)" },
                                }}
                            >
                                Kayıt Ol
                            </Button>
                        </>
                    )}
                </Box>
            </Toolbar>
        </AppBar>
    );
};

export default Navbar;
