import api from "../axios";

export const messageService = {
  list: async (deviceId, locationId) => {
    const response = await api.get(`/message/list/${deviceId}`, {
      headers: { "x-location-id": locationId },
    });
    return response.data;
  },
};
