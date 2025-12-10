import axios from "axios";

// Create reusable Axios instance for all backend requests
export const api = axios.create({
  baseURL: "http://localhost:4000/api",
  withCredentials: true,
});

// ============================
// 🛍️ CATALOG (FINAL MERGED VERSION)
// ============================
export const Catalog = {
  // Species
  species: () => api.get("/species").then((r) => r.data),

  // Categories
  categories: () => api.get("/categories").then((r) => r.data),

  // Items
  items: (params) => api.get("/items", { params }).then((r) => r.data),
};

// ============================
// 🐾 SPECIES (optional helper)
// ============================
export const Species = {
  list: () => api.get("/species").then((r) => r.data),
};

// ============================
// 🔐 AUTH
// ============================
export const Auth = {
  me: () => api.get("/account/me").then((r) => r.data),
  register: (p) =>
  api
    .post("/auth/register", {
      name: p.name,
      email: p.email,
      password: p.password,
      city: p.city,
      postcode: p.postcode,   // REQUIRED
      latitude: p.latitude,   // passed from browser
      longitude: p.longitude, // passed from browser
    })
    .then((r) => r.data),

  login: (p) => api.post("/auth/login", p).then((r) => r.data),
  logout: () => api.post("/auth/logout").then((r) => r.data),
};

// ============================
// 📦 ORDERS
// ============================
export const Orders = {
  list: () => api.get("/orders").then((r) => r.data),
  create: (p) => api.post("/orders", p).then((r) => r.data),
  save: (p) => api.post("/orders/save", p).then((r) => r.data),
  cancel: (id) => api.put(`/orders/${id}/cancel`).then((r) => r.data),
};

// ============================
// ⚙️ ADMIN PANEL
// ============================
export const Admin = {
  upsertUser: (p) => api.post("/admin/users", p).then((r) => r.data),

  // Items
  upsertItem: (p) => api.post("/admin/items", p).then((r) => r.data),
  deleteItem: (id) => api.delete(`/admin/items/${id}`).then((r) => r.data),

  // Categories
  createCategory: (p) => api.post("/admin/categories", p).then((r) => r.data),
  deleteCategory: (id) =>
    api.delete(`/admin/categories/${id}`).then((r) => r.data),

  // Species
  createSpecies: (p) => api.post("/admin/species", p).then((r) => r.data),
  deleteSpecies: (id) =>
    api.delete(`/admin/species/${id}`).then((r) => r.data),
};

// ============================
// 💳 STRIPE CHECKOUT
// ============================
// 🔥 ONLY CHANGE: we now forward the whole payload instead of just items
export const Checkout = {
createSession: ({ items, delivery_method }) =>
  api.post("/checkout", { items, delivery_method }).then((r) => r.data),
};
