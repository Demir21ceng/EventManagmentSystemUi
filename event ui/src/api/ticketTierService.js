import api from "./api";

export const ticketTierService = {
    // Etkinliğin bilet türlerini getir
    getTiersByEvent: async (eventId) => {
        const res = await api.get(`/events/${eventId}/ticket-tiers`);
        return res.data;
    },

    // Yeni bilet türü oluştur (Organizatör)
    createTier: async (eventId, data) => {
        const res = await api.post(`/events/${eventId}/ticket-tiers`, data);
        return res.data;
    },

    // Bilet türü güncelle
    updateTier: async (eventId, tierId, data) => {
        const res = await api.put(`/events/${eventId}/ticket-tiers/${tierId}`, data);
        return res.data;
    },

    // Bilet türü sil
    deleteTier: async (eventId, tierId) => {
        await api.delete(`/events/${eventId}/ticket-tiers/${tierId}`);
    },
};