import api from "./api";

export const eventService = {
    // Tüm etkinlikleri getir (summary) - eski, gerekirse kullanılır
    getAllEvents: async () => {
        const response = await api.get("/events");
        return response.data;
    },

    // Arama + filtre + pagination (backend destekli)
    searchEvents: async ({ search, categoryId, startDate, endDate, page = 0, size = 12 } = {}) => {
        const params = {};
        if (search) params.search = search;
        if (categoryId) params.categoryId = categoryId;
        if (startDate) params.startDate = startDate;
        if (endDate) params.endDate = endDate;
        params.page = page;
        params.size = size;

        const response = await api.get("/events/search", { params });
        return response.data;
    },

    // Organizatörün kendi etkinlikleri
    getMyEvents: async () => {
        const response = await api.get("/events/my-events");
        return response.data;
    },

    // Tek etkinlik detayı
    getEventById: async (id) => {
        const response = await api.get(`/events/${id}`);
        return response.data;
    },

    // Yeni etkinlik oluştur (ORGANIZER)
    createEvent: async (eventData) => {
        const response = await api.post("/events", eventData);
        return response.data;
    },

    // Etkinlik güncelle (ORGANIZER)
    updateEvent: async (id, eventData) => {
        const response = await api.put(`/events/${id}`, eventData);
        return response.data;
    },

    // Etkinlik durumu güncelle (ORGANIZER)
    updateEventStatus: async (id, eventStatus) => {
        const response = await api.patch(`/events/${id}/status`, { eventStatus });
        return response.data;
    },

    // Etkinlik sil (ORGANIZER)
    deleteEvent: async (id) => {
        await api.delete(`/events/${id}`);
    },

    // Etkinlik resmi yükle (ORGANIZER)
    uploadEventImage: async (id, file) => {
        const formData = new FormData();
        formData.append("file", file);
        const response = await api.post(`/events/${id}/image`, formData, {
            headers: { "Content-Type": "multipart/form-data" },
        });
        return response.data;
    },
};