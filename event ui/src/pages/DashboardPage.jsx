import React, { useEffect, useState } from "react";
import {
    Box,
    Container,
    Typography,
    Grid,
    Paper,
    Button,
    Chip,
    IconButton,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Alert,
    CircularProgress,
    Tooltip,
    Select,
    MenuItem,
    FormControl,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { eventService } from "../api/eventService";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import VisibilityIcon from "@mui/icons-material/Visibility";
import PublishIcon from "@mui/icons-material/Publish";

const STATUS_COLORS = {
    PUBLISHED: { bg: "#dcfce7", color: "#15803d", label: "Yayında" },
    DRAFT: { bg: "#fef9c3", color: "#854d0e", label: "Taslak" },
    CANCELLED: { bg: "#fee2e2", color: "#b91c1c", label: "İptal" },
    COMPLETED: { bg: "#e0e7ff", color: "#4338ca", label: "Tamamlandı" },
};

const StatCard = ({ label, value, color }) => (
    <Paper
        sx={{
            p: 3,
            borderRadius: "16px",
            borderLeft: `4px solid ${color}`,
            boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
        }}
    >
        <Typography variant="h4" sx={{ fontWeight: 700, color }}>
            {value}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            {label}
        </Typography>
    </Paper>
);

const DashboardPage = () => {
    const navigate = useNavigate();
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [deleteDialog, setDeleteDialog] = useState({ open: false, id: null });
    const [statusDialog, setStatusDialog] = useState({ open: false, id: null, current: "" });
    const [newStatus, setNewStatus] = useState("");
    const [actionLoading, setActionLoading] = useState(false);

    const fetchEvents = async () => {
        try {
            const data = await eventService.getMyEvents();
            setEvents(data);
        } catch {
            setError("Etkinlikler yüklenemedi.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchEvents();
    }, []);

    const handleDelete = async () => {
        setActionLoading(true);
        try {
            await eventService.deleteEvent(deleteDialog.id);
            setEvents((prev) => prev.filter((e) => e.id !== deleteDialog.id));
            setDeleteDialog({ open: false, id: null });
        } catch {
            setError("Etkinlik silinirken hata oluştu.");
        } finally {
            setActionLoading(false);
        }
    };

    const handleStatusChange = async () => {
        setActionLoading(true);
        try {
            await eventService.updateEventStatus(statusDialog.id, newStatus);
            setEvents((prev) =>
                prev.map((e) => (e.id === statusDialog.id ? { ...e, eventStatus: newStatus } : e))
            );
            setStatusDialog({ open: false, id: null, current: "" });
        } catch {
            setError("Durum güncellenirken hata oluştu.");
        } finally {
            setActionLoading(false);
        }
    };

    const stats = {
        total: events.length,
        published: events.filter((e) => e.eventStatus === "PUBLISHED").length,
        draft: events.filter((e) => e.eventStatus === "DRAFT").length,
        cancelled: events.filter((e) => e.eventStatus === "CANCELLED").length,
    };

    return (
        <Box sx={{ minHeight: "100vh", bgcolor: "#f8f9fc" }}>
            {/* Header */}
            <Box sx={{ background: "linear-gradient(135deg, #1a1a2e 0%, #0f3460 100%)", py: 5, px: 2 }}>
                <Container maxWidth="lg">
                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 2 }}>
                        <Box>
                            <Typography
                                variant="h4"
                                sx={{ color: "#fff", fontFamily: "'Playfair Display', serif", fontWeight: 700 }}
                            >
                                Organizatör Paneli
                            </Typography>
                            <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.6)", mt: 0.5 }}>
                                Etkinliklerinizi buradan yönetin
                            </Typography>
                        </Box>
                        <Button
                            variant="contained"
                            startIcon={<AddIcon />}
                            onClick={() => navigate("/events/create")}
                            sx={{
                                background: "#e94560",
                                textTransform: "none",
                                fontWeight: 600,
                                borderRadius: "10px",
                                px: 3,
                                py: 1.2,
                                "&:hover": { background: "#c73652" },
                            }}
                        >
                            Yeni Etkinlik
                        </Button>
                    </Box>
                </Container>
            </Box>

            <Container maxWidth="lg" sx={{ py: 5 }}>
                {error && <Alert severity="error" sx={{ mb: 3, borderRadius: "8px" }}>{error}</Alert>}

                {/* Stats */}
                <Grid container spacing={3} sx={{ mb: 5 }}>
                    <Grid item xs={6} sm={3}>
                        <StatCard label="Toplam Etkinlik" value={stats.total} color="#0f3460" />
                    </Grid>
                    <Grid item xs={6} sm={3}>
                        <StatCard label="Yayında" value={stats.published} color="#15803d" />
                    </Grid>
                    <Grid item xs={6} sm={3}>
                        <StatCard label="Taslak" value={stats.draft} color="#854d0e" />
                    </Grid>
                    <Grid item xs={6} sm={3}>
                        <StatCard label="İptal" value={stats.cancelled} color="#b91c1c" />
                    </Grid>
                </Grid>

                {/* Table */}
                <Paper sx={{ borderRadius: "16px", overflow: "hidden", boxShadow: "0 2px 16px rgba(0,0,0,0.08)" }}>
                    <Box sx={{ p: 3, borderBottom: "1px solid #f0f0f0" }}>
                        <Typography variant="h6" sx={{ fontWeight: 700 }}>
                            Etkinliklerim
                        </Typography>
                    </Box>

                    {loading ? (
                        <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
                            <CircularProgress sx={{ color: "#e94560" }} />
                        </Box>
                    ) : events.length === 0 ? (
                        <Box sx={{ textAlign: "center", py: 8 }}>
                            <Typography color="text.secondary" sx={{ mb: 2 }}>
                                Henüz etkinlik oluşturmadınız.
                            </Typography>
                            <Button
                                variant="contained"
                                onClick={() => navigate("/events/create")}
                                sx={{ background: "#e94560", textTransform: "none", "&:hover": { background: "#c73652" } }}
                            >
                                İlk Etkinliğini Oluştur
                            </Button>
                        </Box>
                    ) : (
                        <TableContainer>
                            <Table>
                                <TableHead>
                                    <TableRow sx={{ bgcolor: "#fafafa" }}>
                                        <TableCell sx={{ fontWeight: 600 }}>Başlık</TableCell>
                                        <TableCell sx={{ fontWeight: 600 }}>Konum</TableCell>
                                        <TableCell sx={{ fontWeight: 600 }}>Tarih</TableCell>
                                        <TableCell sx={{ fontWeight: 600 }}>Durum</TableCell>
                                        <TableCell sx={{ fontWeight: 600, textAlign: "right" }}>İşlemler</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {events.map((event) => {
                                        const status = STATUS_COLORS[event.eventStatus] || { bg: "#f3f4f6", color: "#6b7280", label: event.eventStatus };
                                        return (
                                            <TableRow
                                                key={event.id}
                                                hover
                                                sx={{ "&:last-child td": { border: 0 } }}
                                            >
                                                <TableCell>
                                                    <Typography variant="body2" fontWeight={600}>
                                                        {event.title}
                                                    </Typography>
                                                </TableCell>
                                                <TableCell>
                                                    <Typography variant="body2" color="text.secondary">
                                                        {event.location || "-"}
                                                    </Typography>
                                                </TableCell>
                                                <TableCell>
                                                    <Typography variant="body2" color="text.secondary">
                                                        {event.startTime
                                                            ? new Date(event.startTime).toLocaleDateString("tr-TR")
                                                            : "-"}
                                                    </Typography>
                                                </TableCell>
                                                <TableCell>
                                                    <Chip
                                                        label={status.label}
                                                        size="small"
                                                        sx={{ bgcolor: status.bg, color: status.color, fontWeight: 600, fontSize: "0.7rem" }}
                                                    />
                                                </TableCell>
                                                <TableCell align="right">
                                                    <Tooltip title="Görüntüle">
                                                        <IconButton size="small" onClick={() => navigate(`/events/${event.id}`)}>
                                                            <VisibilityIcon fontSize="small" />
                                                        </IconButton>
                                                    </Tooltip>
                                                    <Tooltip title="Düzenle">
                                                        <IconButton size="small" onClick={() => navigate(`/events/${event.id}/edit`)}>
                                                            <EditIcon fontSize="small" />
                                                        </IconButton>
                                                    </Tooltip>
                                                    <Tooltip title="Durum Değiştir">
                                                        <IconButton
                                                            size="small"
                                                            onClick={() => {
                                                                setStatusDialog({ open: true, id: event.id, current: event.eventStatus });
                                                                setNewStatus(event.eventStatus);
                                                            }}
                                                        >
                                                            <PublishIcon fontSize="small" />
                                                        </IconButton>
                                                    </Tooltip>
                                                    <Tooltip title="Sil">
                                                        <IconButton
                                                            size="small"
                                                            sx={{ color: "#e94560" }}
                                                            onClick={() => setDeleteDialog({ open: true, id: event.id })}
                                                        >
                                                            <DeleteIcon fontSize="small" />
                                                        </IconButton>
                                                    </Tooltip>
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    )}
                </Paper>
            </Container>

            {/* Delete Dialog */}
            <Dialog open={deleteDialog.open} onClose={() => setDeleteDialog({ open: false, id: null })} PaperProps={{ sx: { borderRadius: "16px" } }}>
                <DialogTitle sx={{ fontWeight: 700 }}>Etkinliği Sil</DialogTitle>
                <DialogContent>
                    <Typography>Bu etkinliği silmek istediğinize emin misiniz? Bu işlem geri alınamaz.</Typography>
                </DialogContent>
                <DialogActions sx={{ p: 2, gap: 1 }}>
                    <Button onClick={() => setDeleteDialog({ open: false, id: null })} sx={{ textTransform: "none" }}>
                        Vazgeç
                    </Button>
                    <Button
                        onClick={handleDelete}
                        variant="contained"
                        disabled={actionLoading}
                        sx={{ background: "#e94560", textTransform: "none", "&:hover": { background: "#c73652" } }}
                    >
                        {actionLoading ? "Siliniyor..." : "Evet, Sil"}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Status Dialog */}
            <Dialog open={statusDialog.open} onClose={() => setStatusDialog({ open: false, id: null, current: "" })} PaperProps={{ sx: { borderRadius: "16px" } }}>
                <DialogTitle sx={{ fontWeight: 700 }}>Durum Değiştir</DialogTitle>
                <DialogContent sx={{ pt: 2 }}>
                    <FormControl fullWidth>
                        <Select value={newStatus} onChange={(e) => setNewStatus(e.target.value)}>
                            <MenuItem value="DRAFT">Taslak</MenuItem>
                            <MenuItem value="PUBLISHED">Yayında</MenuItem>
                            <MenuItem value="CANCELLED">İptal</MenuItem>
                            <MenuItem value="COMPLETED">Tamamlandı</MenuItem>
                        </Select>
                    </FormControl>
                </DialogContent>
                <DialogActions sx={{ p: 2, gap: 1 }}>
                    <Button onClick={() => setStatusDialog({ open: false, id: null, current: "" })} sx={{ textTransform: "none" }}>
                        Vazgeç
                    </Button>
                    <Button
                        onClick={handleStatusChange}
                        variant="contained"
                        disabled={actionLoading}
                        sx={{ background: "#e94560", textTransform: "none", "&:hover": { background: "#c73652" } }}
                    >
                        {actionLoading ? "Güncelleniyor..." : "Güncelle"}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default DashboardPage;