import { Api_Host } from "../Api";

export const getAllCustodiaExterna = () => Api_Host.get('/campo/allcustodiaexterna/');
export const createCustodiaExterna = (data) => Api_Host.post('/campo/custodiaexterna/', data);
export const getCustodiaExternaById = (id) => Api_Host.get(`/campo/custodiaexterna/${id}/`);
export const updateCustodiaExterna = (id, data) => Api_Host.put(`/campo/custodiaexterna/${id}/`, data);
export const updateOneCustodiaExterna = (id, data) => Api_Host.patch(`/campo/custodiaexterna/${id}/`, data);
//allcustodiaexterna/
//export const getAllCustodiaExterna = () => Api_Host.get('/campo/custodiaexterna/');
// export const getAllCustodiaExternaEntregados = (organizacion_id) => Api_Host.get(`/campo/allcustodiaExternaEntregados/${organizacion_id}/`);
// //allcustodiaExternaFinalizados
// export const getAllCustodiaExternaFinalizados = (organizacion_id) => Api_Host.get(`/campo/allcustodiaExternaFinalizados/${organizacion_id}/`);

// apis/ApiCustodiaExterna/ApiCustodiaExtern.js
export const getCustodiasExternasPaged = ({ page = 1, pageSize = 10, q = "" } = {}) =>
  Api_Host.get("/custodias-externas/", {
    params: {
      page,
      page_size: pageSize,
      q, // si tu backend soporta búsqueda
    },
  });

  // api
export async function fetchCustodias({ q="", page=1, limit=50, organizacion_id, ordering }){
  const params = { q, page, limit };
  if (organizacion_id) params.organizacion_id = organizacion_id;
  if (ordering) params.ordering = ordering;
  const { data } = await Api_Host.get("/campo/allcustodiaexterna/", { params });
  return data; // { results, count, page, limit, num_pages }
}



// Entregadas (estado_id=3)
export async function fetchCustodiasEntregadas({
  q = "",
  page = 1,
  limit = 50,
  organizacion_id,
  ordering,
  signal,
}) {
  const params = { q, page, limit };
  if (ordering) params.ordering = ordering;
  // asumiendo url: /campo/custodiaexterna/entregados/<org_id>/
  const url = `/campo/allcustodiaExternaEntregados/${organizacion_id}/`;
  const { data } = await Api_Host.get(url, { params, signal });
  return data; // { results, count, page, limit, num_pages }
}

// Finalizados (estado_id=4)
export async function fetchCustodiasFinalizados({
  q = "",
  page = 1,
  limit = 50,
  organizacion_id,
  ordering,
  signal,
}) {
  const params = { q, page, limit };
  if (ordering) params.ordering = ordering;
  // asumiendo url: /campo/custodiaexterna/entregados/<org_id>/
  const url = `/campo/allcustodiaExternaFinalizados/${organizacion_id}/`;
  const { data } = await Api_Host.get(url, { params, signal });
  return data; // { results, count, page, limit, num_pages }
}

