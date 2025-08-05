import { Api_Host } from "../Api";

export const getAllMuestra = () => Api_Host.get('/campo/muestra/');

export const createMuestra = (data) => Api_Host.post('/campo/muestra/', data);

export const getMuestraById = (id) => Api_Host.get(`/campo/muestra/${id}/`);

export const updateMuestra = (id, data) => Api_Host.put(`/campo/muestra/${id}/`, data);