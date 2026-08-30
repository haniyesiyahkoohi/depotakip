import axios from "axios";

// Django backend'in adresi. Backend'i "python manage.py runserver" ile
// çalıştırdığında varsayılan olarak bu adreste açılır.
export const API_ROOT = "http://127.0.0.1:8000";
const API_BASE_URL = `${API_ROOT}/api`;

export const api = axios.create({
    baseURL: API_BASE_URL,
});

export async function fetchProducts(params = {}) {
    const { data } = await api.get("/products/", { params });
    return data;
}

export async function fetchProduct(id) {
    const { data } = await api.get(`/products/${id}/`);
    return data;
}

export async function fetchCategories() {
    const { data } = await api.get("/categories/");
    return data;
}

export async function fetchMovements(productId) {
    const { data } = await api.get("/movements/", { params: { product: productId, ordering: "-created_at" } });
    return data;
}

export async function createMovement(payload) {
    const { data } = await api.post("/movements/", payload);
    return data;
}

export async function fetchForecast(productId) {
    const { data } = await api.get(`/products/${productId}/forecast/`);
    return data;
}

export async function fetchDashboard() {
    const { data } = await api.get("/dashboard/");
    return data;
}

export async function lookupByBarcode(code) {
    const { data } = await api.get("/products/lookup/", { params: { code } });
    return data;
}

export async function fetchLots(productId) {
    const { data } = await api.get("/lots/", { params: { product: productId, ordering: "-received_date" } });
    return data;
}