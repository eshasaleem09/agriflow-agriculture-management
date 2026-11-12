import axios from "axios";

const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";

// Axios instance for backend communication
export const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Automatically attach JWT token to requests
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("agriflow_token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Authentication API
export const authApi = {
  login: (credentials) =>
    apiClient.post("/auth/login", credentials),

  register: (userData) =>
    apiClient.post("/auth/register", userData),

  profile: () =>
    apiClient.get("/auth/profile"),
};

// CRUD API
export const resourceApi = {
  getAll: (resource) =>
    apiClient.get(`/${resource}`),

  getOne: (resource, id) =>
    apiClient.get(`/${resource}/${id}`),

  create: (resource, data) =>
    apiClient.post(`/${resource}`, data),

  update: (resource, id, data) =>
    apiClient.put(`/${resource}/${id}`, data),

  remove: (resource, id) =>
    apiClient.delete(`/${resource}/${id}`),
};

// Preserve existing localStorage functionality
const createResponse = (succeeded, message, data = null) => ({
  data: {
    succeeded,
    message,
    data,
  },
});

const isStorageAvailable = () => {
  try {
    return (
      typeof window !== "undefined" &&
      !!window.localStorage
    );
  } catch {
    return false;
  }
};

export const storageApi = {
  getItem: async (key, fallback = null) => {
    try {
      if (!isStorageAvailable()) {
        throw new Error("Local storage is unavailable.");
      }

      const savedData = localStorage.getItem(key);

      if (savedData === null) {
        return createResponse(
          true,
          "No saved data found.",
          fallback
        );
      }

      return createResponse(
        true,
        "Data retrieved successfully.",
        JSON.parse(savedData)
      );
    } catch (error) {
      return createResponse(
        false,
        error.message || "Unable to retrieve data.",
        fallback
      );
    }
  },

  setItem: async (key, value) => {
    try {
      if (!isStorageAvailable()) {
        throw new Error("Local storage is unavailable.");
      }

      localStorage.setItem(key, JSON.stringify(value));

      return createResponse(
        true,
        "Data saved successfully.",
        value
      );
    } catch (error) {
      return createResponse(
        false,
        error.message || "Unable to save data."
      );
    }
  },

  removeItem: async (key) => {
    try {
      if (!isStorageAvailable()) {
        throw new Error("Local storage is unavailable.");
      }

      localStorage.removeItem(key);

      return createResponse(
        true,
        "Data removed successfully."
      );
    } catch (error) {
      return createResponse(
        false,
        error.message || "Unable to remove data."
      );
    }
  },
};