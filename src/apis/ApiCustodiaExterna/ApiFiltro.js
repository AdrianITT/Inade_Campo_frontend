import { Api_Host } from "../Api";

export const getAllFiltro = () => Api_Host.get('/campo/filtro/');

export const createFiltro = (data) => Api_Host.post('/campo/filtro/', data);
export const updateFiltro = (id,data) => Api_Host.patch(`/campo/filtro/${id}/`, data);

export const getAllFiltroById = (
  q = "",
  { page = 1, limit = 5, signal } = {}
) => {
  return Api_Host.get("/campo/filtro_list/", {
    params: { q, page, limit },
    signal,
  });
};