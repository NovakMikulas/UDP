import api from "../axios";

export const roomService = {
  list: async (locationId) => {
    const response = await api.get(`/room/list/${locationId}`);
    return response.data;
  },

  get: async (roomId, locationId) => {
    const response = await api.get(`/room/get/${roomId}`, {
      headers: { "x-location-id": locationId },
    });
    return response.data;
  },

  create: async (locationId, data) => {
    const response = await api.post("/room/create", { ...data, locationId });
    return response.data;
  },

  update: async (roomId, locationId, data) => {
    const response = await api.put(`/room/update/${roomId}`, data, {
      headers: { "x-location-id": locationId },
    });
    return response.data;
  },

  delete: async (roomId, locationId) => {
    const response = await api.delete(`/room/delete/${roomId}`, {
      headers: { "x-location-id": locationId },
    });
    return response.data;
  },
};
