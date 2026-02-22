import React, { useEffect, useState } from "react";
import {
    Box,
    Container,
    Typography,
    Chip,
    Button,
    CircularProgress,
    Alert,
    Divider,
    Paper,
} from "@mui/material";
import { useParams, useNavigate } from "react-router-dom";
import { eventService } from "../api/eventService";
import { useAuth } from "../context/AuthContext";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import EditIcon from "@mui/icons-material/Edit";

const STATUS_COLORS = {
    PUBLISHED: { bg: "#dcfce7", color: "#15803d", label: "Yayında" },
    DRAFT: { bg: "#fef9c3", color: "#854d0e", label: "Taslak" },
    CANCELLED: { bg: "#fee2e2", color: "#b91c1c", label: "İptal" },
    COMPLETED: { bg: "#e0e7ff", color: "#4338ca", label: "Tamamlandı" },
};

const EventDetailPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user, isOrganizer } = useAuth();
    const [event, setEvent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetch = async () => {
            try {
                const data = await eventService.getEventById(id);
                setEvent(data);
            } catch {
                setError("Etkinlik yüklenirken bir hata oluştu.");
            } finally {
                setLoading(false);
            }
        };
        fetch();
    }, [id]);

    if (loading)
        return (
            <Box sx={{ display: "flex", justifyContent: "center", mt: 10 }}>
                <CircularProgress sx={{ color: "#e94560" }} />
            </Box>
        );

    if (error) return <Alert severity="error" sx={{ m: 4 }}>{error}</Alert>;
    if (!event) return null;

    const status = STATUS_COLORS[event.eventStatus] || { bg: "#f3f4f6", color: "#6b7280", label: event.eventStatus };
    const imageUrl = event.imageUrl
        ? `${process.env.REACT_APP_API_URL?.replace("/api", "") || "http://localhost:8080"}/images/${event.imageUrl}`
        : null;

    const isOwner = isOrganizer() && String(event.organizerId) === String(user?.id);

    return (
        <Box sx={{ minHeight: "100vh", bgcolor: "#f8f9fc" }}>
            {/* Banner */}
            <Box
                sx={{
                    height: { xs: 220, md: 360 },
                    background: imageUrl
                        ? `url(${imageUrl}) center/cover no-repeat`
                        : "linear-gradient(135deg, #1a1a2e 0%, #e94560 100%)",
                    position: "relative",
                }}
            >
                <Box
                    sx={{
                        position: "absolute",
                        inset: 0,
                        background: "linear-gradient(to bottom, rgba(0,0,0,0.2), rgba(0,0,0,0.6))",
                    }}
                />
                <Box sx={{ position: "absolute", top: 16, left: 16 }}>
                    <Button
                        startIcon={<ArrowBackIcon />}
                        onClick={() => navigate(-1)}
                        sx={{
                            color: "#fff",
                            background: "rgba(0,0,0,0.4)",
                            backdropFilter: "blur(8px)",
                            textTransform: "none",
                            borderRadius: "10px",
                            "&:hover": { background: "rgba(0,0,0,0.6)" },
                        }}
                    >
                        Geri
                    </Button>
                </Box>
            </Box>

            <Container maxWidth="md" sx={{ mt: -4, pb: 8, position: "relative" }}>
                <Paper sx={{ borderRadius: "20px", p: { xs: 3, md: 5 }, boxShadow: "0 8px 40px rgba(0,0,0,0.12)" }}>
                    {/* Başlık + Durum */}
                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 2, flexWrap: "wrap", gap: 1 }}>
                        <Chip label={status.label} sx={{ bgcolor: status.bg, color: status.color, fontWeight: 600 }} />
                        {isOwner && (
                            <Button
                                startIcon={<EditIcon />}
                                variant="outlined"
                                onClick={() => navigate(`/events/${id}/edit`)}
                                sx={{ color: "#e94560", borderColor: "#e94560", textTransform: "none", borderRadius: "10px" }}
                            >
                                Düzenle
                            </Button>
                        )}
                    </Box>

                    <Typography
                        variant="h4"
                        sx={{ fontFamily: "'Playfair Display', serif", fontWeight: 700, mb: 3, lineHeight: 1.2 }}
                    >
                        {event.title}
                    </Typography>

                    <Divider sx={{ mb: 3 }} />

                    {/* Meta bilgiler */}
                    <Box sx={{ display: "flex", gap: 4, flexWrap: "wrap", mb: 3 }}>
                        {event.startDate && (
                            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                <CalendarMonthIcon sx={{ color: "#e94560" }} />
                                <Box>
                                    <Typography variant="caption" color="text.secondary" display="block">Başlangıç</Typography>
                                    <Typography variant="body2" fontWeight={600}>
                                        {new Date(event.startDate).toLocaleDateString("tr-TR", {
                                            day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit",
                                        })}
                                    </Typography>
                                </Box>
                            </Box>
                        )}
                        {event.endDate && (
                            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                <CalendarMonthIcon sx={{ color: "#e94560" }} />
                                <Box>
                                    <Typography variant="caption" color="text.secondary" display="block">Bitiş</Typography>
                                    <Typography variant="body2" fontWeight={600}>
                                        {new Date(event.endDate).toLocaleDateString("tr-TR", {
                                            day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit",
                                        })}
                                    </Typography>
                                </Box>
                            </Box>
                        )}
                        {event.location && (
                            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                <LocationOnIcon sx={{ color: "#e94560" }} />
                                <Box>
                                    <Typography variant="caption" color="text.secondary" display="block">Konum</Typography>
                                    <Typography variant="body2" fontWeight={600}>{event.location}</Typography>
                                </Box>
                            </Box>
                        )}
                    </Box>

                    {/* Açıklama */}
                    {event.description && (
                        <>
                            <Divider sx={{ mb: 3 }} />
                            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>Etkinlik Hakkında</Typography>
                            <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.8 }}>
                                {event.description}
                            </Typography>
                        </>
                    )}
                </Paper>
            </Container>
        </Box>
    );
};

export default EventDetailPage;
