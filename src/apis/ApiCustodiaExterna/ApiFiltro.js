import { Api_Host } from "../Api";

export const getAllFiltro = () => Api_Host.get('/campo/filtro/');

export const createFiltro = (data) => Api_Host.post('/campo/filtro/', data);
export const updateFiltro = (id,data) => Api_Host.patch(`/campo/filtro/${id}/`, data);