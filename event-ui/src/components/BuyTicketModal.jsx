import React, { useEffect, useState } from "react";
import {
    Dialog, DialogTitle, DialogContent, DialogActions,
    Button, Typography, Box, CircularProgress, Alert,
    Radio, RadioGroup, Chip, Divider,
} from "@mui/material";
import ConfirmationNumberIcon from "@mui/icons-material/ConfirmationNumber";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import { ticketTierService } from "../api/ticketTierService";
import { registrationService } from "../api/registrationService";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

const BuyTicketModal = ({ open, onClose, event }) => {
    const { user } = useAuth();
    const navigate = useNavigate();

    const [tiers, setTiers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(null); // başarılı kayıt verisi
    const [selectedTierId, setSelectedTierId] = useState("");

    useEffect(() => {
        if (open && event?.id) {
            setSelectedTierId("");
            setError("");
            setSuccess(null);
            fetchTiers();
        }
    }, [open, event?.id]);

    const fetchTiers = async () => {
        setLoading(true);
        try {
            const data = await ticketTierService.getTiersByEvent(event.id);
            setTiers(data);
        } catch {
            setError("Biletler yüklenemedi.");
        } finally {
            setLoading(false);
        }
    };

    const selectedTier = tiers.find((t) => String(t.id) === String(selectedTierId));

    const handleClose = () => {
        setSelectedTierId("");
        setError("");
        setSuccess(null);
        onClose();
    };

    const handleRegister = async () => {
        if (!selectedTierId) return;

        // Giriş yapılmamışsa login'e yönlendir
        if (!user) {
            onClose();
            navigate("/login", { state: { from: `/events/${event.id}` } });
            return;
        }

        // ATTENDEE değilse uyar
        const role = user.role;
        if (role === "ORGANIZER" || role === "ROLE_ORGANIZER") {
            setError("Organizatörler etkinliğe kayıt olamaz.");
            return;
        }

        setSubmitting(true);
        setError("");

        try {
            const result = await registrationService.register(event.id, Number(selectedTierId));
            setSuccess(result);
        } catch (err) {
            const msg = err.response?.data?.message || "Kayıt sırasında bir hata oluştu.";
            setError(msg);
        } finally {
            setSubmitting(false);
        }
    };

    // ── Başarı ekranı
    if (success) {
        return (
            <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth
                    PaperProps={{ sx: { borderRadius: "16px" } }}>
                <DialogContent sx={{ textAlign: "center", py: 5 }}>
                    <CheckCircleOutlineIcon sx={{ fontSize: 64, color: "#22c55e", mb: 2 }} />
                    <Typography variant="h6" fontWeight={700} mb={1}>
                        Kaydınız Tamamlandı! 🎉
                    </Typography>
                    <Typography color="text.secondary" mb={2}>
                        Onay emaili gönderildi. QR kodunuzu emailinizden kontrol edebilirsiniz.
                    </Typography>
                    <Box sx={{ bgcolor: "#f0fdf4", borderRadius: "10px", p: 2, mb: 3 }}>
                        <Typography variant="body2" color="text.secondary" mb={0.5}>
                            Bilet Referans No
                        </Typography>
                        <Typography fontWeight={700} sx={{ fontFamily: "monospace", fontSize: "0.85rem", wordBreak: "break-all" }}>
                            {success.qrCodeUuid}
                        </Typography>
                    </Box>
                    <Box sx={{ display: "flex", gap: 1, justifyContent: "center" }}>
                        <Button
                            variant="outlined"
                            onClick={() => { handleClose(); navigate("/my-tickets"); }}
                            sx={{ textTransform: "none", borderColor: "#e94560", color: "#e94560" }}
                        >
                            Biletlerim
                        </Button>
                        <Button
                            variant="contained"
                            onClick={handleClose}
                            sx={{ background: "#e94560", textTransform: "none", "&:hover": { background: "#c73652" } }}
                        >
                            Tamam
                        </Button>
                    </Box>
                </DialogContent>
            </Dialog>
        );
    }

    // ── Normal bilet seçim ekranı
    return (
        <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth
                PaperProps={{ sx: { borderRadius: "16px" } }}>
            <DialogTitle sx={{ fontWeight: 700, pb: 0 }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <ConfirmationNumberIcon sx={{ color: "#e94560" }} />
                    Bilet Seç
                </Box>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, fontWeight: 400 }}>
                    {event?.title}
                </Typography>
            </DialogTitle>

            <DialogContent sx={{ pt: 2 }}>
                {error && <Alert severity="error" sx={{ mb: 2, borderRadius: "8px" }}>{error}</Alert>}

                {/* Giriş yapılmamışsa uyarı */}
                {!user && (
                    <Alert severity="info" sx={{ mb: 2, borderRadius: "8px" }}>
                        Kayıt olmak için <strong>giriş yapmanız</strong> gerekiyor.
                    </Alert>
                )}

                {loading ? (
                    <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
                        <CircularProgress size={28} sx={{ color: "#e94560" }} />
                    </Box>
                ) : tiers.length === 0 ? (
                    <Typography color="text.secondary" sx={{ textAlign: "center", py: 4 }}>
                        Bu etkinlik için henüz bilet tanımlanmamış.
                    </Typography>
                ) : (
                    <RadioGroup
                        value={selectedTierId}
                        onChange={(e) => setSelectedTierId(e.target.value)}
                    >
                        {tiers.map((tier) => {
                            const available = tier.availableCount;
                            const isActive = tier.saleActive;
                            const isSoldOut = available <= 0;
                            const disabled = !isActive || isSoldOut;

                            return (
                                <Box
                                    key={tier.id}
                                    onClick={() => !disabled && setSelectedTierId(String(tier.id))}
                                    sx={{
                                        border: "2px solid",
                                        borderColor: String(selectedTierId) === String(tier.id)
                                            ? "#e94560" : "#f0f0f0",
                                        borderRadius: "12px",
                                        p: 2,
                                        mb: 1.5,
                                        cursor: disabled ? "not-allowed" : "pointer",
                                        opacity: disabled ? 0.5 : 1,
                                        bgcolor: String(selectedTierId) === String(tier.id)
                                            ? "#fff5f7" : "#fff",
                                        transition: "all 0.15s ease",
                                        "&:hover": !disabled ? {
                                            borderColor: "#e94560",
                                            bgcolor: "#fff5f7",
                                        } : {},
                                    }}
                                >
                                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                            <Radio
                                                value={String(tier.id)}
                                                disabled={disabled}
                                                sx={{ p: 0, color: "#e94560", "&.Mui-checked": { color: "#e94560" } }}
                                            />
                                            <Box>
                                                <Typography fontWeight={700}>
                                                    {/* ticketType enum → okunabilir */}
                                                    {tier.ticketType === "VIP" ? "VIP" : tier.ticketType === "NORMAL" ? "Normal" : tier.ticketType}
                                                </Typography>
                                                <Typography variant="caption" color="text.secondary">
                                                    {new Date(tier.saleStartDate).toLocaleDateString("tr-TR")} —{" "}
                                                    {new Date(tier.saleEndDate).toLocaleDateString("tr-TR")}
                                                </Typography>
                                            </Box>
                                        </Box>
                                        <Box sx={{ textAlign: "right" }}>
                                            <Typography fontWeight={700} sx={{ color: "#e94560", fontSize: "1.1rem" }}>
                                                {tier.price === 0 ? "Ücretsiz" : `${tier.price} ₺`}
                                            </Typography>
                                            <Chip
                                                label={
                                                    isSoldOut ? "Tükendi" :
                                                        !isActive ? "Satış Kapalı" :
                                                            `${available} kaldı`
                                                }
                                                size="small"
                                                sx={{
                                                    fontSize: "0.65rem",
                                                    bgcolor: isSoldOut || !isActive ? "#fee2e2" : "#dcfce7",
                                                    color: isSoldOut || !isActive ? "#b91c1c" : "#15803d",
                                                    fontWeight: 600,
                                                }}
                                            />
                                        </Box>
                                    </Box>
                                </Box>
                            );
                        })}
                    </RadioGroup>
                )}

                {/* Seçili bilet özeti */}
                {selectedTier && (
                    <>
                        <Divider sx={{ my: 2 }} />
                        <Box sx={{ bgcolor: "#f8f9fc", borderRadius: "10px", p: 2 }}>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                                Seçilen bilet
                            </Typography>
                            <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                                <Typography fontWeight={600}>{selectedTier.ticketType}</Typography>
                                <Typography fontWeight={700} sx={{ color: "#e94560" }}>
                                    {selectedTier.price === 0 ? "Ücretsiz" : `${selectedTier.price} ₺`}
                                </Typography>
                            </Box>
                        </Box>
                    </>
                )}
            </DialogContent>

            <DialogActions sx={{ p: 2, gap: 1 }}>
                <Button onClick={handleClose} sx={{ textTransform: "none" }}>
                    Vazgeç
                </Button>
                <Button
                    onClick={handleRegister}
                    variant="contained"
                    disabled={!selectedTierId || submitting}
                    sx={{
                        background: "#e94560",
                        textTransform: "none",
                        fontWeight: 600,
                        px: 3,
                        "&:hover": { background: "#c73652" },
                        "&.Mui-disabled": { bgcolor: "#ccc" },
                    }}
                >
                    {submitting ? <CircularProgress size={20} sx={{ color: "#fff" }} /> :
                        !user ? "Giriş Yap & Kayıt Ol" : "Kayıt Ol"}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default BuyTicketModal;