import api from "../axios";

export const userService = {
  update: async (data) => {
    const response = await api.put("/user/update", data);
    return response.data;
  },
  changePassword: async (data) => {
    const response = await api.put("/user/change-password", data);
    return response.data;
  },
};
