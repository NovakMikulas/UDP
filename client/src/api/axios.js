import axios from "axios";

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL,
  withCredentials: true,
});

api.interceptors.request.use(
  (config) => config,
  (error) => Promise.reject(error),
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const is401 = error.response?.status === 401;
    const isAuthRoute = ["/user/login", "/user/register"].some((path) =>
      error.config?.url?.includes(path)
    );

    if (is401 && !isAuthRoute) {
      localStorage.removeItem("user");
      window.location.href = "/login";
    }

    return Promise.reject(error);
  }
);

export default api;
