import axios from 'axios';
import type { Orden, EstadoSeguridad, PuntoSeguridadCatalogo, PuntoSeguridadOrden } from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

console.log('🔧 API Configuration:', {
  API_URL,
  env: import.meta.env.VITE_API_URL,
  mode: import.meta.env.MODE
});

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para agregar el token a todas las peticiones
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor para manejar errores de autenticación
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Solo redirigir a login si NO estamos ya en la página de login
      const currentPath = window.location.pathname;
      if (!currentPath.includes('/login')) {
        localStorage.removeItem('token');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  login: async (username: string, password: string) => {
    console.log('🔐 LOGIN REQUEST:', { username, API_URL });
    try {
      const response = await api.post('/auth/login', { username, password });
      console.log('✅ LOGIN SUCCESS:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ LOGIN ERROR:', error);
      throw error;
    }
  },

  verify: async () => {
    const response = await api.get('/auth/verify');
    return response.data;
  },

  logout: async () => {
    const response = await api.post('/auth/logout');
    localStorage.removeItem('token');
    return response.data;
  },
};

export const ordenesAPI = {
  getAll: async () => {
    console.log('📋 FETCHING ALL ORDENES from:', API_URL);
    try {
      const response = await api.get<Orden[]>('/ordenes');
      console.log('✅ ORDENES FETCHED:', response.data.length, 'ordenes');
      return response.data;
    } catch (error) {
      console.error('❌ ERROR FETCHING ORDENES:', error);
      throw error;
    }
  },

  getById: async (id: string) => {
    console.log('📄 FETCHING ORDEN:', id);
    try {
      const response = await api.get<Orden>(`/ordenes/${id}`);
      console.log('✅ ORDEN FETCHED:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ ERROR FETCHING ORDEN:', error);
      throw error;
    }
  },

  search: async (filters: {
    folio?: string;
    cliente?: string;
    placa?: string;
    estado?: string;
    fechaDesde?: string;
    fechaHasta?: string;
  }) => {
    const response = await api.get<Orden[]>('/ordenes/search', { params: filters });
    return response.data;
  },

  create: async (orden: Omit<Orden, 'id' | 'folio' | 'estado' | 'fechaCreacion' | 'fechaActualizacion'>) => {
    console.log('➕ CREATING ORDEN:', orden);
    try {
      const response = await api.post<Orden>('/ordenes', orden);
      console.log('✅ ORDEN CREATED:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ ERROR CREATING ORDEN:', error);
      throw error;
    }
  },

  update: async (id: string, orden: Partial<Orden>) => {
    console.log('✏️ UPDATING ORDEN:', id, orden);
    try {
      const response = await api.put<Orden>(`/ordenes/${id}`, orden);
      console.log('✅ ORDEN UPDATED:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ ERROR UPDATING ORDEN:', error);
      throw error;
    }
  },

  updateEstado: async (id: string, estado: string) => {
    const response = await api.patch<Orden>(`/ordenes/${id}/estado`, { estado });
    return response.data;
  },

  delete: async (id: string) => {
    const response = await api.delete(`/ordenes/${id}`);
    return response.data;
  },

  getStats: async () => {
    const response = await api.get('/ordenes/stats');
    return response.data;
  },
};

export const estadosSeguridadAPI = {
  getAll: async () => {
    const response = await api.get<EstadoSeguridad[]>('/estados-seguridad');
    return response.data;
  },

  getById: async (id: number) => {
    const response = await api.get<EstadoSeguridad>(`/estados-seguridad/${id}`);
    return response.data;
  },

  create: async (estado: Omit<EstadoSeguridad, 'id'>) => {
    const response = await api.post<EstadoSeguridad>('/admin/estados-seguridad', estado);
    return response.data;
  },

  update: async (id: number, estado: Partial<EstadoSeguridad>) => {
    const response = await api.put<EstadoSeguridad>(`/admin/estados-seguridad/${id}`, estado);
    return response.data;
  },

  delete: async (id: number) => {
    const response = await api.delete(`/admin/estados-seguridad/${id}`);
    return response.data;
  },
};

export const puntosSeguridadAPI = {
  getCatalogo: async () => {
    const response = await api.get<PuntoSeguridadCatalogo[]>('/puntos-seguridad/catalogo');
    return response.data;
  },

  getPuntoById: async (id: number) => {
    const response = await api.get<PuntoSeguridadCatalogo>(`/puntos-seguridad/catalogo/${id}`);
    return response.data;
  },

  getPuntosByOrden: async (ordenId: string) => {
    const response = await api.get<PuntoSeguridadOrden[]>(`/ordenes/${ordenId}/puntos-seguridad`);
    return response.data;
  },

  savePuntosByOrden: async (ordenId: string, puntos: Omit<PuntoSeguridadOrden, 'id' | 'fechaRevision'>[]) => {
    const response = await api.post<{ success: boolean; message: string }>(`/ordenes/${ordenId}/puntos-seguridad`, { puntos });
    return response.data;
  },

  createPunto: async (punto: Omit<PuntoSeguridadCatalogo, 'id'>) => {
    const response = await api.post<PuntoSeguridadCatalogo>('/admin/puntos-seguridad/catalogo', punto);
    return response.data;
  },

  updatePunto: async (id: number, punto: Partial<PuntoSeguridadCatalogo>) => {
    const response = await api.put<PuntoSeguridadCatalogo>(`/admin/puntos-seguridad/catalogo/${id}`, punto);
    return response.data;
  },

  deletePunto: async (id: number) => {
    const response = await api.delete(`/admin/puntos-seguridad/catalogo/${id}`);
    return response.data;
  },
};

export default api;
