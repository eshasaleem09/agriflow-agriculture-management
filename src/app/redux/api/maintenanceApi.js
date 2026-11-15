import { apiClient } from "./index.js";

// Create maintenance with linked expense
export const createMaintenanceApi = async (data) => {
  const response = await apiClient.post("/maintenance", data);
  return response.data;
};

// Update maintenance with linked expense
export const updateMaintenanceApi = async (id, data) => {
  const response = await apiClient.put(`/maintenance/${id}`, data);
  return response.data;
};

// Delete maintenance with linked expense
export const deleteMaintenanceApi = async (id) => {
  const response = await apiClient.delete(`/maintenance/${id}`);
  return response.data;
};