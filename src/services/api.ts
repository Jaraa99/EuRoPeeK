// src/services/api.ts
import axios from 'axios';

export const api = axios.create({
  baseURL: 'http://localhost:3000',
});

const apiService = {
  get: async () => {
    return await api.get<string>("/user");
  },

  post: async () => {
    return await api.post<string>("/user");
  },

  patch: async () => {
    return await api.patch<string>("/user");
  },

  delete: async () => {
    return await api.delete<string>("/user");
  }
};

export default apiService;
