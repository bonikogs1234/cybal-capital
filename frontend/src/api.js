import axios from "axios";

const API = axios.create({ 
  baseURL: "http://localhost:5000/api" 
});

// Attach token to every request
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("cybal_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// ── Auth ──────────────────────────────────────────────────
export const login        = (data) => API.post("/auth/login", data);
export const getMe        = ()     => API.get("/auth/me");

// ── Properties ────────────────────────────────────────────
export const getProperties  = (params) => API.get("/properties", { params });
export const getFeatured    = ()       => API.get("/properties/featured");
export const getProperty    = (id)     => API.get(`/properties/${id}`);
export const createProperty = (data)   => API.post("/properties", data);
export const updateProperty = (id, data) => API.put(`/properties/${id}`, data);
export const deleteProperty = (id)     => API.delete(`/properties/${id}`);

// ── Enquiries ─────────────────────────────────────────────
export const submitEnquiry      = (data)         => API.post("/enquiries", data);
export const getEnquiries       = (params)       => API.get("/enquiries", { params });
export const updateEnquiryStatus = (id, status)  => API.put(`/enquiries/${id}/status`, { status });

// ── Admin ─────────────────────────────────────────────────
export const getAdminStats    = ()           => API.get("/admin/stats");
export const featureProperty  = (id, val)    => API.put(`/admin/properties/${id}/feature`, { isFeatured: val });