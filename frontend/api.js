import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API = axios.create({
  baseURL: 'http://192.168.176.117:5000/api',
  timeout: 60000,
});

API.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('token');
    if (token) {
      const updatedConfig = {
        ...config,
        headers: { ...config.headers, Authorization: `Bearer ${token}` },
      };
      return updatedConfig;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

API.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API error:', {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message,
    });
    return Promise.reject(error);
  },
);

export const fetchDocuments = () =>
  API.get('/documents')
    .then((res) => res.data)
    .catch((error) => {
      throw new Error(
        error.response?.data?.error ||
          error.message ||
          'Błąd pobierania dokumentów',
      );
    });

export const fetchTemplates = (category) =>
  API.get('/templates', { params: { category } })
    .then((res) => res.data)
    .catch((error) => {
      throw new Error(
        error.response?.data?.error ||
          error.message ||
          'Błąd pobierania szablonów',
      );
    });

export const fetchTemplateById = (id) =>
  API.get(`/templates/${id}`)
    .then((res) => res.data)
    .catch((error) => {
      throw new Error(
        error.response?.data?.error ||
          error.message ||
          `Błąd pobierania szablonu o ID ${id}`,
      );
    });

export const fetchTemplateContent = (id) =>
  API.get(`/templates/${id}/content`)
    .then((res) => res.data)
    .catch((error) => {
      throw new Error(
        error.response?.data?.error ||
          error.message ||
          `Błąd pobierania treści szablonu o ID ${id}`,
      );
    });

export const uploadDocument = (formData) =>
  API.post('/documents', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
    .then((res) => res.data)
    .catch((error) => {
      throw new Error(
        error.response?.data?.error ||
          error.message ||
          'Błąd przesyłania dokumentu',
      );
    });

export const updateDocument = (documentId, formData) =>
  API.put(`/documents/${documentId}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
    .then((res) => res.data)
    .catch((error) => {
      throw new Error(
        error.response?.data?.error ||
          error.message ||
          'Błąd aktualizacji dokumentu',
      );
    });

export const uploadImage = (formData) =>
  API.post('/documents/upload-image', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
    .then((res) => res.data)
    .catch((error) => {
      throw new Error(
        error.response?.data?.error || error.message || 'Błąd wgrywania obrazu',
      );
    });

export const deleteDocument = (documentId) => {
  if (!documentId) {
    return Promise.reject(new Error('Brak ID dokumentu'));
  }
  return API.delete(`/documents/${documentId}`)
    .then((res) => res.data)
    .catch((error) => {
      throw new Error(
        error.response?.data?.error ||
          error.message ||
          'Błąd podczas usuwania dokumentu',
      );
    });
};

export const updateUserProfile = (data) =>
  API.put('/auth/me', data)
    .then((res) => res.data)
    .catch((error) => {
      throw new Error(
        error.response?.data?.error ||
          error.message ||
          'Błąd aktualizacji profilu',
      );
    });

export const deleteUserAccount = () =>
  API.delete('/auth/me')
    .then((res) => res.data)
    .catch((error) => {
      throw new Error(
        error.response?.data?.error || error.message || 'Błąd usuwania konta',
      );
    });

export const changePassword = (data) =>
  API.post('/auth/change-password', data)
    .then((res) => res.data)
    .catch((error) => {
      throw new Error(
        error.response?.data?.error || error.message || 'Błąd zmiany hasła',
      );
    });

export default API;
