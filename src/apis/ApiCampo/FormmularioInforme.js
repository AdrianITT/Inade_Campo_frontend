import { Api_Host } from "../Api";
//protocolomuestreo/
///campo/sitiomuestreo/
//campo/puntomuestreo/
//campo/procedimientomuestreo/
//campo/planmuestreo/
//campo/intermediario/
export const createProtocoloMuestreo = (data) => Api_Host.post('/campo/protocolomuestreo/',data);
export const createIntermediario = (data) => Api_Host.post('/campo/intermediario/',data);

export const createSitioMuestreo = (data) => Api_Host.post('/campo/sitiomuestreo/',data);
export const createPuntoMuestreo = (data) => Api_Host.post('/campo/puntomuestreo/',data);
export const createProcedimientoMuestreo = (data) => Api_Host.post('/campo/procedimientomuestreo/',data);
export const createPlanMuestreo = (data) => Api_Host.post('/campo/planmuestreo/',data);

export const updateProtocoloMuestreo = (id,data) => Api_Host.patch(`/campo/protocolomuestreo/${id}/`, data);


export const updateSitioMuestreo = (id,data) => Api_Host.patch(`/campo/sitiomuestreo/${id}/`,data);
export const updatePuntoMuestreo = (id,data) => Api_Host.patch(`/campo/puntomuestreo/${id}/`,data);
export const updateProcedimientoMuestreo = (id,data) => Api_Host.patch(`/campo/procedimientomuestreo/${id}/`,data);
export const updatePlanMuestreo = (id,data) => Api_Host.patch(`/campo/planmuestreo/${id}/`,data);

export const fetchProtocolo = async (id) => {
  const { data } = await Api_Host.get(`/campo/protocolomuestreo/${id}/`);
  return data;                 //  <-- sólo el cuerpo JSON
};
// export const updateOrdenTrabajo = (id,data) => Api_Host.patch(`/ordentrabajo/${id}/`, data);