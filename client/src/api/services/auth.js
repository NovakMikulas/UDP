import api from "../axios";

export const authService = {
  login: async (username, password) => {
    const response = await api.post("/user/login", { username, password });
    if (response.data.user) {
      localStorage.setItem("user", JSON.stringify(response.data.user));
    }
    return response.data;
  },

  logout: async () => {
    try {
      await api.post("/user/logout");
    } finally {
      // Remove user from localStorage regardless of logout success to ensure client state is cleared
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
  },

  register: async (username, email, password) => {
    const response = await api.post("/user/register", {
      username,
      email,
      password,
    });
    return response.data;
  },
};
