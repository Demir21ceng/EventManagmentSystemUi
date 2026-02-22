import React, { useState } from "react";
import {
    Box,
    Card,
    CardContent,
    TextField,
    Button,
    Typography,
    Alert,
    InputAdornment,
    IconButton,
    Link,
    Divider,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import EventNoteIcon from "@mui/icons-material/EventNote";

const LoginPage = () => {
    const { login } = useAuth();
    const navigate = useNavigate();

    const [form, setForm] = useState({ identifier: "", password: "" });
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);
        try {
            const user = await login(form.identifier, form.password);
            const isOrg = user?.role === "ROLE_ORGANIZER" || user?.role === "ORGANIZER";
            navigate(isOrg ? "/dashboard" : "/events");
        } catch (err) {
            setError(err.response?.data?.message || "Giriş bilgileri hatalı.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box
            sx={{
                minHeight: "100vh",
                background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                p: 2,
            }}
        >
            <Card
                sx={{
                    width: "100%",
                    maxWidth: 420,
                    borderRadius: "20px",
                    boxShadow: "0 24px 64px rgba(0,0,0,0.5)",
                    overflow: "hidden",
                }}
            >
                <Box
                    sx={{
                        background: "linear-gradient(135deg, #e94560, #c73652)",
                        p: 3,
                        display: "flex",
                        alignItems: "center",
                        gap: 1.5,
                    }}
                >
                    <EventNoteIcon sx={{ color: "#fff", fontSize: 32 }} />
                    <Box>
                        <Typography variant="h5" sx={{ color: "#fff", fontFamily: "'Playfair Display', serif", fontWeight: 700 }}>
                            EventHub
                        </Typography>
                        <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.8)" }}>
                            Hesabınıza giriş yapın
                        </Typography>
                    </Box>
                </Box>

                <CardContent sx={{ p: 3 }}>
                    {error && <Alert severity="error" sx={{ mb: 2, borderRadius: "8px" }}>{error}</Alert>}

                    <form onSubmit={handleSubmit}>
                        <TextField
                            fullWidth
                            label="E-posta veya Kullanıcı Adı"
                            name="identifier"
                            value={form.identifier}
                            onChange={handleChange}
                            required
                            sx={{ mb: 2 }}
                            variant="outlined"
                        />

                        <TextField
                            fullWidth
                            label="Şifre"
                            name="password"
                            type={showPassword ? "text" : "password"}
                            value={form.password}
                            onChange={handleChange}
                            required
                            sx={{ mb: 3 }}
                            InputProps={{
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                                            {showPassword ? <VisibilityOff /> : <Visibility />}
                                        </IconButton>
                                    </InputAdornment>
                                ),
                            }}
                        />

                        <Button
                            type="submit"
                            fullWidth
                            variant="contained"
                            disabled={loading}
                            sx={{
                                py: 1.5,
                                background: "#e94560",
                                borderRadius: "10px",
                                fontWeight: 600,
                                fontSize: "1rem",
                                textTransform: "none",
                                "&:hover": { background: "#c73652" },
                                "&:disabled": { background: "#f8a5b3" },
                            }}
                        >
                            {loading ? "Giriş yapılıyor..." : "Giriş Yap"}
                        </Button>
                    </form>

                    <Divider sx={{ my: 2.5 }} />

                    <Typography variant="body2" align="center" color="text.secondary">
                        Hesabınız yok mu?{" "}
                        <Link
                            component="button"
                            onClick={() => navigate("/register")}
                            sx={{ color: "#e94560", fontWeight: 600, textDecoration: "none", cursor: "pointer" }}
                        >
                            Kayıt Ol
                        </Link>
                    </Typography>
                </CardContent>
            </Card>
        </Box>
    );
};

export default LoginPage;
