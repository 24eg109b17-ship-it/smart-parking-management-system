/**
 * api.js - Axios configuration and API call functions
 *
 * Axios is a library that makes HTTP requests easy.
 * Instead of writing fetch() calls everywhere, we configure
 * Axios once here and use it throughout the app.
 *
 * BASE_URL: The address of our Spring Boot backend.
 * All API calls will start with http://localhost:8080/api/...
 */
import axios from 'axios';

// Base URL for all API calls - points to our Spring Boot backend
const BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

// Create an Axios instance with default configuration
const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json', // We send and receive JSON data
  },
});

api.interceptors.request.use(config => {
  try {
    const user = JSON.parse(localStorage.getItem('parkingUser'));
    if (user?.token) config.headers.Authorization = `Bearer ${user.token}`;
  } catch {
    localStorage.removeItem('parkingUser');
  }
  return config;
});

api.interceptors.response.use(response => response, error => {
  if (error.response?.status === 401 && !error.config?.url?.startsWith('/auth/')) {
    localStorage.removeItem('parkingUser');
    window.dispatchEvent(new Event('parking:unauthorized'));
  }
  return Promise.reject(error);
});

// =====================================================================
// AUTH API CALLS
// =====================================================================

export const registerUser = (data) => api.post('/auth/register', data);
export const loginUser = (data) => api.post('/auth/login', data);

// =====================================================================
// VEHICLE API CALLS
// =====================================================================

export const getVehiclesByUser = (userId) => api.get(`/vehicles/user/${userId}`);
export const getAllVehicles = () => api.get('/vehicles');
export const addVehicle = (data) => api.post('/vehicles', data);
export const updateVehicle = (id, data) => api.put(`/vehicles/${id}`, data);
export const deleteVehicle = (id) => api.delete(`/vehicles/${id}`);

// =====================================================================
// PARKING AREA API CALLS
// =====================================================================

export const getAllParkingAreas = () => api.get('/parking-areas');
export const getParkingAreaById = (id) => api.get(`/parking-areas/${id}`);
export const addParkingArea = (data) => api.post('/parking-areas', data);
export const updateParkingArea = (id, data) => api.put(`/parking-areas/${id}`, data);
export const deleteParkingArea = (id) => api.delete(`/parking-areas/${id}`);

// =====================================================================
// PARKING SLOT API CALLS
// =====================================================================

export const getSlotsByArea = (areaId) => api.get(`/parking-slots/area/${areaId}`);
export const getAvailableSlots = (areaId) => api.get(`/parking-slots/available/${areaId}`);
export const getAllSlots = () => api.get('/parking-slots');
export const addParkingSlot = (areaId, data) => api.post(`/parking-slots/area/${areaId}`, data);
export const updateParkingSlot = (slotId, data) => api.put(`/parking-slots/${slotId}`, data);
export const deleteParkingSlot = (slotId) => api.delete(`/parking-slots/${slotId}`);

// =====================================================================
// RESERVATION API CALLS
// =====================================================================

export const createReservation = (data) => api.post('/reservations', data);
export const getReservationsByUser = (userId) => api.get(`/reservations/user/${userId}`);
export const getAllReservations = () => api.get('/reservations');
export const cancelReservation = (id) => api.put(`/reservations/${id}/cancel`);

// =====================================================================
// PARKING SESSION API CALLS
// =====================================================================

export const recordEntry = (data) => api.post('/parking/entry', data);
export const recordExit = (sessionId) => api.post(`/parking/exit/${sessionId}`);
export const getActiveSession = (userId) => api.get(`/parking/active/${userId}`);
export const getParkingHistory = (userId) => api.get(`/parking/history/${userId}`);
export const getAllActiveSessions = () => api.get('/parking/sessions/active');
export const getAllCompletedSessions = () => api.get('/parking/sessions/completed');

// =====================================================================
// ADMIN API CALLS
// =====================================================================

export const getDashboardStats = () => api.get('/admin/dashboard');
export const getAllUsers = () => api.get('/admin/users');

export default api;
