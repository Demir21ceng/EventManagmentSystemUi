import React, { useEffect, useState, useCallback } from "react";
import {
    Box, Typography, Grid, CircularProgress, Alert, TextField,
    InputAdornment, Container, Select, MenuItem, FormControl,
    InputLabel, Button, Pagination, Chip, Stack,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import FilterListIcon from "@mui/icons-material/FilterList";
import ClearIcon from "@mui/icons-material/Clear";
import { eventService } from "../api/eventService";
import { categoryService } from "../api/categoryService";
import EventCard from "../components/EventCard";

const EMPTY_FILTERS = {
    search: "",
    categoryId: "",
    startDate: "",
    endDate: "",
};

const EventListPage = () => {
    const [events, setEvents] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // Filtre state'leri
    const [filters, setFilters] = useState(EMPTY_FILTERS);
    const [appliedFilters, setAppliedFilters] = useState(EMPTY_FILTERS);

    // Pagination
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [totalElements, setTotalElements] = useState(0);
    const PAGE_SIZE = 12;

    // Kategorileri bir kez çek
    useEffect(() => {
        categoryService.getAllCategories()
            .then(setCategories)
            .catch(() => {});
    }, []);

    // Etkinlikleri çek — appliedFilters veya page değişince
    const fetchEvents = useCallback(async () => {
        setLoading(true);
        setError("");
        try {
            const data = await eventService.searchEvents({
                search: appliedFilters.search || undefined,
                categoryId: appliedFilters.categoryId || undefined,
                startDate: appliedFilters.startDate
                    ? `${appliedFilters.startDate}T00:00:00`
                    : undefined,
                endDate: appliedFilters.endDate
                    ? `${appliedFilters.endDate}T23:59:59`
                    : undefined,
                page,
                size: PAGE_SIZE,
            });
            setEvents(data.content || []);
            setTotalPages(data.totalPages || 0);
            setTotalElements(data.totalElements || 0);
        } catch {
            setError("Etkinlikler yüklenirken bir hata oluştu.");
        } finally {
            setLoading(false);
        }
    }, [appliedFilters, page]);

    useEffect(() => {
        fetchEvents();
    }, [fetchEvents]);

    const handleFilterChange = (e) => {
        setFilters({ ...filters, [e.target.name]: e.target.value });
    };

    const handleApplyFilters = () => {
        setPage(0);
        setAppliedFilters({ ...filters });
    };

    const handleClearFilters = () => {
        setFilters(EMPTY_FILTERS);
        setAppliedFilters(EMPTY_FILTERS);
        setPage(0);
    };

    const hasActiveFilters =
        appliedFilters.search || appliedFilters.categoryId ||
        appliedFilters.startDate || appliedFilters.endDate;

    return (
        <Box sx={{ minHeight: "100vh", bgcolor: "#f8f9fc" }}>
            {/* Hero + Arama */}
            <Box
                sx={{
                    background: "linear-gradient(135deg, #1a1a2e 0%, #0f3460 100%)",
                    py: { xs: 6, md: 8 },
                    px: 2,
                    textAlign: "center",
                }}
            >
                <Typography
                    variant="h3"
                    sx={{ color: "#fff", fontFamily: "'Playfair Display', serif", fontWeight: 700, mb: 1 }}
                >
                    Tüm Etkinlikler
                </Typography>
                <Typography variant="body1" sx={{ color: "rgba(255,255,255,0.6)", mb: 4 }}>
                    Seni bekleyen etkinlikleri keşfet
                </Typography>

                {/* Arama */}
                <Box sx={{ maxWidth: 520, mx: "auto", mb: 3 }}>
                    <TextField
                        fullWidth
                        name="search"
                        placeholder="Etkinlik veya anahtar kelime ara..."
                        value={filters.search}
                        onChange={handleFilterChange}
                        onKeyDown={(e) => e.key === "Enter" && handleApplyFilters()}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <SearchIcon sx={{ color: "rgba(0,0,0,0.4)" }} />
                                </InputAdornment>
                            ),
                        }}
                        sx={{
                            bgcolor: "#fff",
                            borderRadius: "12px",
                            "& .MuiOutlinedInput-root": {
                                borderRadius: "12px",
                                "& fieldset": { border: "none" },
                            },
                        }}
                    />
                </Box>

                {/* Filtreler */}
                <Box
                    sx={{
                        maxWidth: 760,
                        mx: "auto",
                        display: "flex",
                        gap: 2,
                        flexWrap: "wrap",
                        justifyContent: "center",
                    }}
                >
                    {/* Kategori */}
                    <FormControl size="small" sx={{ minWidth: 160 }}>
                        <Select
                            name="categoryId"
                            value={filters.categoryId}
                            onChange={handleFilterChange}
                            displayEmpty
                            sx={{
                                bgcolor: "#fff",
                                borderRadius: "10px",
                                "& fieldset": { border: "none" },
                            }}
                        >
                            <MenuItem value="">Tüm Kategoriler</MenuItem>
                            {categories.map((c) => (
                                <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    {/* Başlangıç tarihi */}
                    <TextField
                        size="small"
                        name="startDate"
                        type="date"
                        value={filters.startDate}
                        onChange={handleFilterChange}
                        InputLabelProps={{ shrink: true }}
                        placeholder="Başlangıç"
                        sx={{
                            bgcolor: "#fff",
                            borderRadius: "10px",
                            "& .MuiOutlinedInput-root": {
                                borderRadius: "10px",
                                "& fieldset": { border: "none" },
                            },
                        }}
                    />

                    {/* Bitiş tarihi */}
                    <TextField
                        size="small"
                        name="endDate"
                        type="date"
                        value={filters.endDate}
                        onChange={handleFilterChange}
                        InputLabelProps={{ shrink: true }}
                        sx={{
                            bgcolor: "#fff",
                            borderRadius: "10px",
                            "& .MuiOutlinedInput-root": {
                                borderRadius: "10px",
                                "& fieldset": { border: "none" },
                            },
                        }}
                    />

                    {/* Uygula butonu */}
                    <Button
                        variant="contained"
                        startIcon={<FilterListIcon />}
                        onClick={handleApplyFilters}
                        sx={{
                            background: "#e94560",
                            borderRadius: "10px",
                            textTransform: "none",
                            fontWeight: 600,
                            "&:hover": { background: "#c73652" },
                        }}
                    >
                        Filtrele
                    </Button>

                    {hasActiveFilters && (
                        <Button
                            variant="outlined"
                            startIcon={<ClearIcon />}
                            onClick={handleClearFilters}
                            sx={{
                                borderColor: "rgba(255,255,255,0.4)",
                                color: "#fff",
                                borderRadius: "10px",
                                textTransform: "none",
                                "&:hover": { borderColor: "#fff", bgcolor: "rgba(255,255,255,0.1)" },
                            }}
                        >
                            Temizle
                        </Button>
                    )}
                </Box>
            </Box>

            {/* İçerik */}
            <Container maxWidth="lg" sx={{ py: 6 }}>
                {/* Aktif filtre etiketleri */}
                {hasActiveFilters && (
                    <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ mb: 3 }}>
                        {appliedFilters.search && (
                            <Chip label={`Arama: "${appliedFilters.search}"`} size="small"
                                  onDelete={() => { setAppliedFilters(f => ({ ...f, search: "" })); setFilters(f => ({ ...f, search: "" })); }}
                            />
                        )}
                        {appliedFilters.categoryId && (
                            <Chip
                                label={`Kategori: ${categories.find(c => String(c.id) === String(appliedFilters.categoryId))?.name || ""}`}
                                size="small"
                                onDelete={() => { setAppliedFilters(f => ({ ...f, categoryId: "" })); setFilters(f => ({ ...f, categoryId: "" })); }}
                            />
                        )}
                        {appliedFilters.startDate && (
                            <Chip label={`Başlangıç: ${appliedFilters.startDate}`} size="small"
                                  onDelete={() => { setAppliedFilters(f => ({ ...f, startDate: "" })); setFilters(f => ({ ...f, startDate: "" })); }}
                            />
                        )}
                        {appliedFilters.endDate && (
                            <Chip label={`Bitiş: ${appliedFilters.endDate}`} size="small"
                                  onDelete={() => { setAppliedFilters(f => ({ ...f, endDate: "" })); setFilters(f => ({ ...f, endDate: "" })); }}
                            />
                        )}
                    </Stack>
                )}

                {loading ? (
                    <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
                        <CircularProgress sx={{ color: "#e94560" }} />
                    </Box>
                ) : error ? (
                    <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>
                ) : (
                    <>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                            {totalElements} etkinlik bulundu
                        </Typography>

                        {events.length === 0 ? (
                            <Box sx={{ textAlign: "center", py: 8 }}>
                                <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
                                    Aradığınız kriterlere uygun etkinlik bulunamadı.
                                </Typography>
                                {hasActiveFilters && (
                                    <Button onClick={handleClearFilters} sx={{ color: "#e94560", textTransform: "none" }}>
                                        Filtreleri temizle
                                    </Button>
                                )}
                            </Box>
                        ) : (
                            <>
                                <Grid container spacing={3}>
                                    {events.map((event) => (
                                        <Grid item xs={12} sm={6} md={4} key={event.id}>
                                            <EventCard event={event} />
                                        </Grid>
                                    ))}
                                </Grid>

                                {/* Pagination */}
                                {totalPages > 1 && (
                                    <Box sx={{ display: "flex", justifyContent: "center", mt: 6 }}>
                                        <Pagination
                                            count={totalPages}
                                            page={page + 1}
                                            onChange={(_, val) => setPage(val - 1)}
                                            sx={{
                                                "& .MuiPaginationItem-root.Mui-selected": {
                                                    bgcolor: "#e94560",
                                                    color: "#fff",
                                                    "&:hover": { bgcolor: "#c73652" },
                                                },
                                            }}
                                        />
                                    </Box>
                                )}
                            </>
                        )}
                    </>
                )}
            </Container>
        </Box>
    );
};

export default EventListPage;