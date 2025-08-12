// src/services/api.js
import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080';

// Create axios instance
const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor to add auth header
api.interceptors.request.use(
    (config) => {
        const auth = localStorage.getItem('auth');
        if (auth) {
            config.headers.Authorization = auth;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor for error handling
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('auth');
            localStorage.removeItem('user');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

// Auth Services
export const authService = {
    login: async (email, password) => {
        const credentials = btoa(`${email}:${password}`);
        const response = await api.post('/api/users/login',
            { email, password },
            {
                headers: {
                    'Authorization': `Basic ${credentials}`
                }
            }
        );
        return response.data;
    },

    logout: () => {
        localStorage.removeItem('auth');
        localStorage.removeItem('user');
    }
};

// Hotel Services
export const hotelService = {
    getAll: () => api.get('/api/hotels').then(res => res.data),
    getById: (id) => api.get(`/api/hotels/${id}`).then(res => res.data),
    create: (hotel) => api.post('/api/hotels', hotel).then(res => res.data),
    update: (id, hotel) => api.put(`/api/hotels/${id}`, hotel).then(res => res.data),
    delete: (id) => api.delete(`/api/hotels/${id}`).then(res => res.data),
    search: (params) => api.get('/api/hotels/search', { params }).then(res => res.data),
};

// Room Services
export const roomService = {
    getAll: () => api.get('/api/rooms').then(res => res.data),
    getByHotel: (hotelId) => api.get(`/api/hotels/${hotelId}/rooms`).then(res => res.data),
    getAvailableByHotel: (hotelId) => api.get(`/api/hotels/${hotelId}/rooms/available`).then(res => res.data),
    getById: (id) => api.get(`/api/rooms/${id}`).then(res => res.data),
    create: (room) => api.post('/api/rooms', room).then(res => res.data),
    update: (id, room) => api.put(`/api/rooms/${id}`, room).then(res => res.data),
    delete: (id) => api.delete(`/api/rooms/${id}`).then(res => res.data),
};

// Room Type Services
export const roomTypeService = {
    getAll: () => api.get('/api/room-types').then(res => res.data),
    getByHotel: (hotelId) => api.get(`/api/hotels/${hotelId}/room-types`).then(res => res.data),
    getById: (id) => api.get(`/api/room-types/${id}`).then(res => res.data),
    create: (roomType) => api.post('/api/room-types', roomType).then(res => res.data),
    update: (id, roomType) => api.put(`/api/room-types/${id}`, roomType).then(res => res.data),
    delete: (id) => api.delete(`/api/room-types/${id}`).then(res => res.data),
};

// Booking Services
export const bookingService = {
    getAll: () => api.get('/api/bookings').then(res => res.data),
    getById: (id) => api.get(`/api/bookings/${id}`).then(res => res.data),
    getByUser: (userId) => api.get('/api/bookings', { params: { userId } }).then(res => res.data),
    getByHotel: (hotelId) => api.get('/api/bookings', { params: { hotelId } }).then(res => res.data),
    getByDateRange: (hotelId, startDate, endDate) =>
        api.get(`/api/bookings/hotel/${hotelId}/date-range`, {
            params: { startDate, endDate }
        }).then(res => res.data),
    create: (booking) => api.post('/api/bookings', booking).then(res => res.data),
    update: (id, booking) => api.put(`/api/bookings/${id}`, booking).then(res => res.data),
    updateStatus: (id, status, changedBy, reason) =>
        api.put(`/api/bookings/${id}/status`, { status, changedBy, reason }).then(res => res.data),
    cancel: (id, changedBy, reason) =>
        api.put(`/api/bookings/${id}/cancel`, { changedBy, reason }).then(res => res.data),
    getHistory: (id) => api.get(`/api/bookings/${id}/history`).then(res => res.data),
    checkAvailability: (roomId, checkIn, checkOut) =>
        api.get(`/api/bookings/room/${roomId}/availability`, {
            params: { checkIn, checkOut }
        }).then(res => res.data),
};

export default api;