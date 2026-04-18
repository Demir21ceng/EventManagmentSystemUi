import api from "./api";

export const CategoryService = {
    getAllCategories: async () => {
        const response = await api.get("/categories");
        return response.data;
    },
};