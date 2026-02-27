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
    FormControl,
    InputLabel,
    Select,
    MenuItem,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import EventNoteIcon from "@mui/icons-material/EventNote";

const RegisterPage = () => {
    const { register } = useAuth();
    const navigate = useNavigate();

    const [form, setForm] = useState({
        userName: "",
        email: "",
        password: "",
        role: "USER",
    });
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setSuccess("");
        setLoading(true);
        try {
            const result = await register(form);
            setSuccess(typeof result === "string" ? result : "Kayıt başarılı! Giriş yapabilirsiniz.");
            setTimeout(() => navigate("/login"), 2000);
        } catch (err) {
            setError(err.response?.data?.message || "Kayıt sırasında bir hata oluştu.");
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
            <Card sx={{ width: "100%", maxWidth: 440, borderRadius: "20px", boxShadow: "0 24px 64px rgba(0,0,0,0.5)" }}>
                <Box
                    sx={{
                        background: "linear-gradient(135deg, #0f3460, #16213e)",
                        p: 3,
                        display: "flex",
                        alignItems: "center",
                        gap: 1.5,
                    }}
                >
                    <EventNoteIcon sx={{ color: "#e94560", fontSize: 32 }} />
                    <Box>
                        <Typography variant="h5" sx={{ color: "#fff", fontFamily: "'Playfair Display', serif", fontWeight: 700 }}>
                            EventHub
                        </Typography>
                        <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.7)" }}>
                            Yeni hesap oluşturun
                        </Typography>
                    </Box>
                </Box>

                <CardContent sx={{ p: 3 }}>
                    {error && <Alert severity="error" sx={{ mb: 2, borderRadius: "8px" }}>{error}</Alert>}
                    {success && <Alert severity="success" sx={{ mb: 2, borderRadius: "8px" }}>{success}</Alert>}

                    <form onSubmit={handleSubmit}>
                        <TextField
                            fullWidth
                            label="Kullanıcı Adı"
                            name="userName"
                            value={form.userName}
                            onChange={handleChange}
                            required
                            sx={{ mb: 2 }}
                        />

                        <TextField
                            fullWidth
                            label="E-posta"
                            name="email"
                            type="email"
                            value={form.email}
                            onChange={handleChange}
                            required
                            sx={{ mb: 2 }}
                        />

                        <TextField
                            fullWidth
                            label="Şifre"
                            name="password"
                            type={showPassword ? "text" : "password"}
                            value={form.password}
                            onChange={handleChange}
                            required
                            sx={{ mb: 2 }}
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

                        <FormControl fullWidth sx={{ mb: 3 }}>
                            <InputLabel>Hesap Türü</InputLabel>
                            <Select name="role" value={form.role} onChange={handleChange} label="Hesap Türü">
                                <MenuItem value="USER">Kullanıcı</MenuItem>
                                <MenuItem value="ORGANIZER">Organizatör</MenuItem>
                            </Select>
                        </FormControl>

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
                            }}
                        >
                            {loading ? "Kayıt yapılıyor..." : "Kayıt Ol"}
                        </Button>
                    </form>

                    <Divider sx={{ my: 2.5 }} />

                    <Typography variant="body2" align="center" color="text.secondary">
                        Zaten hesabınız var mı?{" "}
                        <Link
                            component="button"
                            onClick={() => navigate("/login")}
                            sx={{ color: "#e94560", fontWeight: 600, textDecoration: "none", cursor: "pointer" }}
                        >
                            Giriş Yap
                        </Link>
                    </Typography>
                </CardContent>
            </Card>
        </Box>
    );
};

export default RegisterPage;
