import React, { useEffect, useState } from "react";
import {
    Dialog, DialogTitle, DialogContent, DialogActions,
    Button, Typography, Box, CircularProgress, Alert,
    Radio, RadioGroup, FormControlLabel, Chip, Divider,
} from "@mui/material";
import ConfirmationNumberIcon from "@mui/icons-material/ConfirmationNumber";
import { ticketTierService } from "../api/ticketTierService";

const BuyTicketModal = ({ open, onClose, event }) => {
    const [tiers, setTiers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [selectedTierId, setSelectedTierId] = useState("");

    useEffect(() => {
        if (open && event?.id) {
            setSelectedTierId("");
            setError("");
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
        onClose();
    };

    // Phase 2'de buraya registration API çağrısı gelecek
    const handleRegister = () => {
        if (!selectedTierId) return;
        // TODO: registrationService.register(event.id, selectedTierId)
        alert(`"${selectedTier?.name}" bileti seçildi — kayıt sistemi Phase 2'de eklenecek!`);
    };

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
                                                <Typography fontWeight={700}>{tier.name}</Typography>
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
                                <Typography fontWeight={600}>{selectedTier.name}</Typography>
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
                    disabled={!selectedTierId}
                    sx={{
                        background: "#e94560",
                        textTransform: "none",
                        fontWeight: 600,
                        px: 3,
                        "&:hover": { background: "#c73652" },
                        "&.Mui-disabled": { bgcolor: "#ccc" },
                    }}
                >
                    Kayıt Ol
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default BuyTicketModal;