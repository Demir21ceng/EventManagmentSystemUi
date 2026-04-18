import React, { useEffect, useState } from "react";
import {
    Dialog, DialogTitle, DialogContent, DialogActions,
    Button, TextField, Box, Typography, IconButton,
    Table, TableBody, TableCell, TableHead, TableRow,
    Alert, CircularProgress, Divider, Chip, Tooltip,
    Select, MenuItem, InputLabel, FormControl,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import { ticketTierService } from "../api/ticketTierService";

const EMPTY_FORM = {
    ticketType: "",
    price: "",
    totalQuantity: "",
    saleStartDate: "",
    saleEndDate: "",
};

const TicketTierModal = ({ open, onClose, event }) => {
    const [tiers, setTiers] = useState([]);
    const [form, setForm] = useState(EMPTY_FORM);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    // Modal açıldığında biletleri yükle
    useEffect(() => {
        if (open && event?.id) {
            fetchTiers();
        }
    }, [open, event?.id]);

    const fetchTiers = async () => {
        setLoading(true);
        setError("");
        try {
            const data = await ticketTierService.getTiersByEvent(event.id);
            setTiers(data);
        } catch {
            setError("Biletler yüklenemedi.");
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleAdd = async () => {
        if (!form.ticketType || !form.price || !form.totalQuantity || !form.saleStartDate || !form.saleEndDate)  {
            setError("Tüm alanları doldurun.");
            return;
        }
        setSaving(true);
        setError("");
        try {
            const payload = {
                ticketType: form.ticketType,  // ← zaten doğru
                price: parseFloat(form.price),
                totalQuantity: parseInt(form.totalQuantity),
                saleStartDate: form.saleStartDate + ":00",
                saleEndDate: form.saleEndDate + ":00",
            };
            const newTier = await ticketTierService.createTier(event.id, payload);
            setTiers((prev) => [...prev, newTier]);
            setForm(EMPTY_FORM);
            setSuccess("Bilet türü eklendi!");
            setTimeout(() => setSuccess(""), 3000);
        } catch (err) {
            setError(err.response?.data?.error || "Bilet eklenemedi.");
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (tierId) => {
        try {
            await ticketTierService.deleteTier(event.id, tierId);
            setTiers((prev) => prev.filter((t) => t.id !== tierId));
        } catch (err) {
            setError(err.response?.data?.error || "Bilet silinemedi.");
        }
    };

    const handleClose = () => {
        setForm(EMPTY_FORM);
        setError("");
        setSuccess("");
        onClose();
    };

    // Toplam kapasite hesapla
    const totalAllocated = tiers.reduce((sum, t) => sum + t.totalQuantity, 0);
    const remaining = (event?.maxCapacity || 0) - totalAllocated;

    return (
        <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth
                PaperProps={{ sx: { borderRadius: "16px" } }}>
            <DialogTitle sx={{ fontWeight: 700, pb: 1 }}>
                🎟️ Bilet Yönetimi
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                    {event?.title}
                </Typography>
            </DialogTitle>

            <DialogContent>
                {/* Kapasite göstergesi */}
                <Box sx={{ display: "flex", gap: 2, mb: 3, flexWrap: "wrap" }}>
                    <Chip label={`Toplam Kapasite: ${event?.maxCapacity}`} variant="outlined" />
                    <Chip label={`Dağıtılan: ${totalAllocated}`} sx={{ bgcolor: "#e0e7ff", color: "#4338ca" }} />
                    <Chip
                        label={`Kalan: ${remaining}`}
                        sx={{ bgcolor: remaining >= 0 ? "#dcfce7" : "#fee2e2", color: remaining >= 0 ? "#15803d" : "#b91c1c" }}
                    />
                </Box>

                {error && <Alert severity="error" sx={{ mb: 2, borderRadius: "8px" }}>{error}</Alert>}
                {success && <Alert severity="success" sx={{ mb: 2, borderRadius: "8px" }}>{success}</Alert>}

                {/* Mevcut bilet türleri */}
                {loading ? (
                    <Box sx={{ display: "flex", justifyContent: "center", py: 3 }}>
                        <CircularProgress size={28} sx={{ color: "#e94560" }} />
                    </Box>
                ) : tiers.length > 0 ? (
                    <Table size="small" sx={{ mb: 3 }}>
                        <TableHead>
                            <TableRow sx={{ bgcolor: "#fafafa" }}>
                                <TableCell sx={{ fontWeight: 600 }}>Ad</TableCell>
                                <TableCell sx={{ fontWeight: 600 }}>Fiyat</TableCell>
                                <TableCell sx={{ fontWeight: 600 }}>Adet</TableCell>
                                <TableCell sx={{ fontWeight: 600 }}>Satılan</TableCell>
                                <TableCell sx={{ fontWeight: 600 }}>Satış Tarihi</TableCell>
                                <TableCell />
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {tiers.map((tier) => (
                                <TableRow key={tier.id}>
                                    <TableCell>{tier.name}</TableCell>
                                    <TableCell>{tier.price} ₺</TableCell>
                                    <TableCell>{tier.totalQuantity}</TableCell>
                                    <TableCell>{tier.soldCount}</TableCell>
                                    <TableCell sx={{ fontSize: "0.75rem", color: "text.secondary" }}>
                                        {new Date(tier.saleStartDate).toLocaleDateString("tr-TR")} -{" "}
                                        {new Date(tier.saleEndDate).toLocaleDateString("tr-TR")}
                                    </TableCell>
                                    <TableCell>
                                        <Tooltip title={tier.soldCount > 0 ? "Satış yapılmış, silinemez" : "Sil"}>
                                            <span>
                                                <IconButton
                                                    size="small"
                                                    disabled={tier.soldCount > 0}
                                                    onClick={() => handleDelete(tier.id)}
                                                    sx={{ color: "#e94560" }}
                                                >
                                                    <DeleteIcon fontSize="small" />
                                                </IconButton>
                                            </span>
                                        </Tooltip>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                ) : (
                    <Typography color="text.secondary" sx={{ mb: 3, textAlign: "center" }}>
                        Henüz bilet türü eklenmemiş.
                    </Typography>
                )}

                <Divider sx={{ mb: 3 }} />

                {/* Yeni bilet türü ekleme formu */}
                <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2 }}>
                    Yeni Bilet Türü Ekle
                </Typography>

                <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 2, mb: 2 }}>
                    <FormControl size="small" fullWidth>
                        <InputLabel>Bilet Türü</InputLabel>
                        <Select
                            name="ticketType"
                            value={form.ticketType}
                            label="Bilet Türü"
                            onChange={handleChange}
                        >
                            <MenuItem value="VIP">VIP</MenuItem>
                            <MenuItem value="NORMAL">Normal</MenuItem>
                        </Select>
                    </FormControl>
                    <TextField
                        label="Fiyat (₺)"
                        name="price"
                        type="number"
                        inputProps={{ min: 0, step: 0.01 }}
                        value={form.price}
                        onChange={handleChange}
                        size="small"
                        fullWidth
                    />
                    <TextField
                        label="Adet"
                        name="totalQuantity"
                        type="number"
                        inputProps={{ min: 1 }}
                        value={form.totalQuantity}
                        onChange={handleChange}
                        size="small"
                        fullWidth
                    />
                </Box>

                <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}>
                    <TextField
                        label="Satış Başlangıç"
                        name="saleStartDate"
                        type="datetime-local"
                        value={form.saleStartDate}
                        onChange={handleChange}
                        size="small"
                        fullWidth
                        InputLabelProps={{ shrink: true }}
                    />
                    <TextField
                        label="Satış Bitiş"
                        name="saleEndDate"
                        type="datetime-local"
                        value={form.saleEndDate}
                        onChange={handleChange}
                        size="small"
                        fullWidth
                        InputLabelProps={{ shrink: true }}
                    />
                </Box>
            </DialogContent>

            <DialogActions sx={{ p: 2, gap: 1 }}>
                <Button onClick={handleClose} sx={{ textTransform: "none" }}>
                    Kapat
                </Button>
                <Button
                    onClick={handleAdd}
                    variant="contained"
                    disabled={saving}
                    startIcon={saving ? <CircularProgress size={16} color="inherit" /> : <AddIcon />}
                    sx={{ background: "#e94560", textTransform: "none", "&:hover": { background: "#c73652" } }}
                >
                    {saving ? "Ekleniyor..." : "Bilet Ekle"}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default TicketTierModal;