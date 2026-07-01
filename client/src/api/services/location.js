import api from "../axios";

export const locationService = {
  list: async () => {
    const response = await api.get("/location/list");
    return response.data;
  },

  get: async (locationId) => {
    const response = await api.get(`/location/get/${locationId}`);
    return response.data;
  },

  create: async (data) => {
    const response = await api.post("/location/create", data);
    return response.data;
  },

  update: async (locationId, data) => {
    const response = await api.put(`/location/update/${locationId}`, data);
    return response.data;
  },

  delete: async (locationId) => {
    const response = await api.delete(`/location/delete/${locationId}`);
    return response.data;
  },

  invite: async (locationId, email) => {
    const response = await api.post(`/location/invite/${locationId}`, { email });
    return response.data;
  },

  kick: async (locationId, userId) => {
    const response = await api.delete(`/location/kick/${locationId}/${userId}`);
    return response.data;
  },

  listInvitations: async () => {
    const response = await api.get("/location/invitations");
    return response.data;
  },

  acceptInvite: async (locationId) => {
    const response = await api.post(`/location/invitations/${locationId}/accept`);
    return response.data;
  },

  declineInvite: async (locationId) => {
    const response = await api.post(`/location/invitations/${locationId}/decline`);
    return response.data;
  },
};
