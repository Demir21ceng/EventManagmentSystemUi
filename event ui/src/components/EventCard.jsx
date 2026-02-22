import React from "react";
import {
    Card,
    CardContent,
    CardMedia,
    CardActionArea,
    Typography,
    Chip,
    Box,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import LocationOnIcon from "@mui/icons-material/LocationOn";

const STATUS_COLORS = {
    PUBLISHED: { bg: "#dcfce7", color: "#15803d", label: "Yayında" },
    DRAFT: { bg: "#fef9c3", color: "#854d0e", label: "Taslak" },
    CANCELLED: { bg: "#fee2e2", color: "#b91c1c", label: "İptal" },
    COMPLETED: { bg: "#e0e7ff", color: "#4338ca", label: "Tamamlandı" },
};

const EventCard = ({ event }) => {
    const navigate = useNavigate();
    const status = STATUS_COLORS[event.eventStatus] || { bg: "#f3f4f6", color: "#6b7280", label: event.eventStatus };

    const imageUrl = event.imagePath
        ? `${import.meta.env.VITE_API_URL?.replace("/api", "") || "http://localhost:9090"}/images/${event.imagePath}`
        : null;

    return (
        <Card
            sx={{
                borderRadius: "16px",
                overflow: "hidden",
                boxShadow: "0 2px 16px rgba(0,0,0,0.08)",
                transition: "transform 0.2s ease, box-shadow 0.2s ease",
                "&:hover": {
                    transform: "translateY(-4px)",
                    boxShadow: "0 8px 32px rgba(0,0,0,0.15)",
                },
                height: "100%",
                display: "flex",
                flexDirection: "column",
            }}
        >
            <CardActionArea onClick={() => navigate(`/events/${event.id}`)} sx={{ flexGrow: 1 }}>
                {imageUrl ? (
                    <CardMedia component="img" height="180" image={imageUrl} alt={event.title} />
                ) : (
                    <Box
                        sx={{
                            height: 180,
                            background: "linear-gradient(135deg, #1a1a2e 0%, #e94560 100%)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                        }}
                    >
                        <Typography sx={{ color: "rgba(255,255,255,0.4)", fontSize: "3rem" }}>📅</Typography>
                    </Box>
                )}

                <CardContent sx={{ p: 2.5 }}>
                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 1 }}>
                        <Chip
                            label={status.label}
                            size="small"
                            sx={{ bgcolor: status.bg, color: status.color, fontWeight: 600, fontSize: "0.7rem" }}
                        />
                    </Box>

                    <Typography
                        variant="h6"
                        sx={{ fontWeight: 700, fontSize: "1rem", mb: 1, lineHeight: 1.3, fontFamily: "'Playfair Display', serif" }}
                    >
                        {event.title}
                    </Typography>

                    <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
                        {event.startTime && (
                            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                                <CalendarMonthIcon sx={{ fontSize: 14, color: "#e94560" }} />
                                <Typography variant="caption" color="text.secondary">
                                    {new Date(event.startTime).toLocaleDateString("tr-TR", {
                                        day: "numeric",
                                        month: "long",
                                        year: "numeric",
                                    })}
                                </Typography>
                            </Box>
                        )}
                        {event.location && (
                            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                                <LocationOnIcon sx={{ fontSize: 14, color: "#e94560" }} />
                                <Typography variant="caption" color="text.secondary">
                                    {event.location}
                                </Typography>
                            </Box>
                        )}
                    </Box>
                </CardContent>
            </CardActionArea>
        </Card>
    );
};

export default EventCard;