import { apiClient } from "./index.js";

export async function getResources(resource) {
  const response = await apiClient.get(`/${resource}`);
  return response.data.data || [];
}

export async function createResource(resource, data) {
  const response = await apiClient.post(`/${resource}`, data);
  return response.data.data;
}

export async function updateResource(resource, id, data) {
  const response = await apiClient.put(`/${resource}/${id}`, data);
  return response.data.data;
}

export async function deleteResource(resource, id) {
  const response = await apiClient.delete(`/${resource}/${id}`);
  return response.data;
}