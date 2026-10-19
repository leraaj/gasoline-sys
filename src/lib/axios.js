// src/lib/axios.js
import axios from "axios";

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  // NEW UPDATE
});

export default API;
