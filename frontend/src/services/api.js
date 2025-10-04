import axios from 'axios';

const baseURL = 'http://127.0.0.1:8000/api/';

const api = axios.create({
  baseURL,
});

api.interceptors.request.use(
  (config) => {
    const tokens = localStorage.getItem('authTokens');
    if (tokens) {
      const accessToken = JSON.parse(tokens).access;
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Add a response interceptor to handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const tokens = JSON.parse(localStorage.getItem('authTokens'));
      const refreshToken = tokens?.refresh;

      if (refreshToken) {
        try {
          const response = await axios.post(`${baseURL}users/login/refresh/`, {
            refresh: refreshToken,
          });
          const newTokens = { access: response.data.access, refresh: refreshToken };
          localStorage.setItem('authTokens', JSON.stringify(newTokens));
          api.defaults.headers.common['Authorization'] = 'Bearer ' + response.data.access;
          originalRequest.headers['Authorization'] = 'Bearer ' + response.data.access;
          return api(originalRequest);
        } catch (refreshError) {
          // Handle refresh token failure (e.g., logout user)
          console.error("Token refresh failed", refreshError);
          localStorage.removeItem('authTokens');
          window.location.href = '/login';
          return Promise.reject(refreshError);
        }
      }
    }
    return Promise.reject(error);
  }
);


export default api;
