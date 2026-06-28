import api from "../axios";

export const messageService = {
  list: async (deviceId, locationId, page, limit) => {
    const response = await api.get(`/message/list/${deviceId}`, {
      headers: { "x-location-id": locationId },
      params: { page, limit },
    });
    return response.data;
  },
};
