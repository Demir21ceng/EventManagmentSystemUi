import React, { useEffect, useState } from "react";
import {
    Box,
    Container,
    Typography,
    TextField,
    Button,
    Paper,
    Alert,
    CircularProgress,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Grid,
    Divider,
} from "@mui/material";
import { useNavigate, useParams } from "react-router-dom";
import { eventService } from "../api/eventService";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import SaveIcon from "@mui/icons-material/Save";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

const EMPTY_FORM = {
    title: "",
    description: "",
    location: "",
    startTime: "",
    endTime: "",
    maxCapacity: "",   // ✅ capacity → maxCapacity
    eventType: "",     // ✅ zorunlu
    categoryId: "",    // ✅ zorunlu
    // eventStatus kaldırıldı — backend DTO'sunda yok
};

const EventFormPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEdit = Boolean(id);

    const [form, setForm] = useState(EMPTY_FORM);
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [loading, setLoading] = useState(false);
    const [fetchLoading, setFetchLoading] = useState(isEdit);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    useEffect(() => {
        if (!isEdit) return;
        const fetchEvent = async () => {
            try {
                const data = await eventService.getEventById(id);
                setForm({
                    title: data.title || "",
                    description: data.description || "",
                    location: data.location || "",
                    startTime: data.startTime ? data.startTime.substring(0, 16) : "",
                    endTime: data.endTime ? data.endTime.substring(0, 16) : "",
                    maxCapacity: data.maxCapacity || "",
                    eventType: data.eventType || "",
                    categoryId: data.categoryId || "",
                });
                if (data.imageUrl) {
                    setImagePreview(
                        `${process.env.REACT_APP_API_URL?.replace("/api", "") || "http://localhost:9090"}/images/${data.imageUrl}`
                    );
                }
            } catch {
                setError("Etkinlik bilgileri yüklenemedi.");
            } finally {
                setFetchLoading(false);
            }
        };
        fetchEvent();
    }, [id, isEdit]);

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImageFile(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setSuccess("");
        setLoading(true);

        try {
            // Backend EventRequestDto ile birebir eşleşen payload
            const payload = {
                title: form.title,
                description: form.description,
                location: form.location,
                startTime: form.startTime ? form.startTime + ":00" : null,  // "2026-03-01T10:00" → "2026-03-01T10:00:00"
                endTime: form.endTime ? form.endTime + ":00" : null,
                maxCapacity: form.maxCapacity ? parseInt(form.maxCapacity) : 0,
                eventType: form.eventType,
                categoryId: form.categoryId ? parseInt(form.categoryId) : null,
            };

            let savedEvent;
            if (isEdit) {
                savedEvent = await eventService.updateEvent(id, payload);
            } else {
                savedEvent = await eventService.createEvent(payload);
            }

            const eventId = savedEvent?.id || id;

            if (imageFile && eventId) {
                await eventService.uploadEventImage(eventId, imageFile);
            }

            setSuccess(isEdit ? "Etkinlik başarıyla güncellendi!" : "Etkinlik başarıyla oluşturuldu!");
            setTimeout(() => navigate(`/events/${eventId}`), 1500);
        } catch (err) {
            setError(err.response?.data?.message || "İşlem sırasında bir hata oluştu.");
        } finally {
            setLoading(false);
        }
    };

    if (fetchLoading)
        return (
            <Box sx={{ display: "flex", justifyContent: "center", mt: 10 }}>
                <CircularProgress sx={{ color: "#e94560" }} />
            </Box>
        );

    return (
        <Box sx={{ minHeight: "100vh", bgcolor: "#f8f9fc", py: 6 }}>
            <Container maxWidth="md">
                <Button
                    startIcon={<ArrowBackIcon />}
                    onClick={() => navigate(-1)}
                    sx={{ mb: 3, textTransform: "none", color: "#666" }}
                >
                    Geri Dön
                </Button>

                <Paper sx={{ borderRadius: "20px", p: { xs: 3, md: 5 }, boxShadow: "0 8px 40px rgba(0,0,0,0.1)" }}>
                    <Typography
                        variant="h4"
                        sx={{ fontFamily: "'Playfair Display', serif", fontWeight: 700, mb: 1 }}
                    >
                        {isEdit ? "Etkinliği Düzenle" : "Yeni Etkinlik Oluştur"}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
                        {isEdit
                            ? "Etkinlik bilgilerini güncelleyin."
                            : "Yeni bir etkinlik oluşturmak için formu doldurun."}
                    </Typography>

                    {error && <Alert severity="error" sx={{ mb: 3, borderRadius: "8px" }}>{error}</Alert>}
                    {success && <Alert severity="success" sx={{ mb: 3, borderRadius: "8px" }}>{success}</Alert>}

                    <form onSubmit={handleSubmit}>
                        <Grid container spacing={3}>

                            {/* Başlık */}
                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    label="Etkinlik Başlığı *"
                                    name="title"
                                    value={form.title}
                                    onChange={handleChange}
                                    required
                                />
                            </Grid>

                            {/* Açıklama */}
                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    label="Açıklama *"
                                    name="description"
                                    value={form.description}
                                    onChange={handleChange}
                                    multiline
                                    rows={4}
                                    required
                                />
                            </Grid>

                            {/* Konum */}
                            <Grid item xs={12} sm={8}>
                                <TextField
                                    fullWidth
                                    label="Konum *"
                                    name="location"
                                    value={form.location}
                                    onChange={handleChange}
                                    required
                                />
                            </Grid>

                            {/* Kapasite */}
                            <Grid item xs={12} sm={4}>
                                <TextField
                                    fullWidth
                                    label="Maksimum Kapasite *"
                                    name="maxCapacity"
                                    type="number"
                                    value={form.maxCapacity}
                                    onChange={handleChange}
                                    inputProps={{ min: 1 }}
                                    required
                                />
                            </Grid>

                            {/* Başlangıç tarihi */}
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                    label="Başlangıç Tarihi *"
                                    name="startTime"
                                    type="datetime-local"
                                    value={form.startTime}
                                    onChange={handleChange}
                                    InputLabelProps={{ shrink: true }}
                                    required
                                />
                            </Grid>

                            {/* Bitiş tarihi */}
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                    label="Bitiş Tarihi *"
                                    name="endTime"
                                    type="datetime-local"
                                    value={form.endTime}
                                    onChange={handleChange}
                                    InputLabelProps={{ shrink: true }}
                                    required
                                />
                            </Grid>

                            {/* Etkinlik Türü */}
                            <Grid item xs={12} sm={6}>
                                <FormControl fullWidth required>
                                    <InputLabel>Etkinlik Türü *</InputLabel>
                                    <Select
                                        name="eventType"
                                        value={form.eventType}
                                        onChange={handleChange}
                                        label="Etkinlik Türü *"
                                    >
                                        <MenuItem value="ONLINE">Online</MenuItem>
                                        <MenuItem value="PHYSICAL">Yüz Yüze</MenuItem>
                                        <MenuItem value="HYBRID">Hibrit</MenuItem>
                                    </Select>
                                </FormControl>
                            </Grid>

                            {/* Kategori ID */}
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                    required
                                    label="Kategori ID *"
                                    name="categoryId"
                                    type="number"
                                    value={form.categoryId}
                                    onChange={handleChange}
                                    inputProps={{ min: 1 }}
                                    helperText="Kategori numarasını girin"
                                />
                            </Grid>

                            {/* Resim yükleme */}
                            <Grid item xs={12}>
                                <Divider sx={{ mb: 2 }} />
                                <Typography variant="subtitle2" sx={{ mb: 1.5, fontWeight: 600 }}>
                                    Etkinlik Görseli
                                </Typography>

                                {imagePreview && (
                                    <Box
                                        sx={{
                                            mb: 2,
                                            borderRadius: "12px",
                                            overflow: "hidden",
                                            maxHeight: 200,
                                            "& img": { width: "100%", height: 200, objectFit: "cover" },
                                        }}
                                    >
                                        <img src={imagePreview} alt="Preview" />
                                    </Box>
                                )}

                                <Button
                                    component="label"
                                    variant="outlined"
                                    startIcon={<CloudUploadIcon />}
                                    sx={{
                                        textTransform: "none",
                                        borderRadius: "10px",
                                        borderColor: "#e94560",
                                        color: "#e94560",
                                        "&:hover": { borderColor: "#c73652", bgcolor: "rgba(233,69,96,0.04)" },
                                    }}
                                >
                                    {imagePreview ? "Görseli Değiştir" : "Görsel Yükle"}
                                    <input type="file" accept="image/*" hidden onChange={handleImageChange} />
                                </Button>
                            </Grid>

                            {/* Submit */}
                            <Grid item xs={12}>
                                <Button
                                    type="submit"
                                    fullWidth
                                    variant="contained"
                                    disabled={loading}
                                    startIcon={
                                        loading ? <CircularProgress size={18} color="inherit" /> : <SaveIcon />
                                    }
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
                                    {loading
                                        ? "Kaydediliyor..."
                                        : isEdit
                                            ? "Değişiklikleri Kaydet"
                                            : "Etkinlik Oluştur"}
                                </Button>
                            </Grid>

                        </Grid>
                    </form>
                </Paper>
            </Container>
        </Box>
    );
};

export default EventFormPage;