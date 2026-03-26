import api from "../axios";

export const deviceService = {
  list: async (roomId, locationId) => {
    const response = await api.get(`/device/list/${roomId}`, {
      headers: { "x-location-id": locationId },
    });
    return response.data;
  },

  get: async (deviceId, locationId) => {
    const response = await api.get(`/device/get/${deviceId}`, {
      headers: { "x-location-id": locationId },
    });
    return response.data;
  },

  create: async (locationId, data) => {
    const response = await api.post("/device/create", data, {
      headers: { "x-location-id": locationId },
    });
    return response.data;
  },

  update: async (deviceId, locationId, data) => {
    const response = await api.put(`/device/update/${deviceId}`, data, {
      headers: { "x-location-id": locationId },
    });
    return response.data;
  },

  delete: async (deviceId, locationId) => {
    const response = await api.delete(`/device/delete/${deviceId}`, {
      headers: { "x-location-id": locationId },
    });
    return response.data;
  },
};
