import { Api_Host } from "../Api";

export const getAguaResidualInforme = () => Api_Host.get('/campo/aguaresidualinforme/');
export const createAguaResidualInforme = (data) => Api_Host.post('/campo/aguaresidualinforme/',data);

export const ByIdAguaResidualInforme = (id) => Api_Host.get(`/campo/obtenerDatosAguas/${id}/`);

export const updateAguaResidualInforme = (id,data) => Api_Host.patch(`/campo/aguaresidualinforme/${id}/`,data);


// GET /campo/obtenerDatosAguas/<org_id>/?q=&page=&limit=&ordering=
export const fetchAguasOrg = ({
  organizacion_id,
  q = "",
  page = 1,
  limit = 10,
  ordering,
  signal,
}) =>
  Api_Host.get(`/campo/obtenerDatosAguas/${organizacion_id}/`, {
    params: { q, page, limit, ordering },
    signal,
  });