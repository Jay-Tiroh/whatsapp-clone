// lib/api.ts
import axios from "axios";

export const api = axios.create({
  baseURL: "https://your-api-url.com",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// attach auth token if needed
api.interceptors.request.use(async (config) => {
  const token = await getToken(); // your token retrieval logic
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});
