import { Api_Host } from "../Api";

export const deleteConductividadAceptacionmr = (id) => Api_Host.delete(`/campo/conductividadaceptacionmr/${id}/`);
export const deleteConductividadAceptacionmc= (id) => Api_Host.delete(`/campo/conductividadaceptacionmc/${id}/`);
export const deleteLecturaVerificacion = (id) => Api_Host.delete(`/campo/lecturaverificacion/${id}/`);
export const deleteHojaCampoEnd = (id) => Api_Host.delete(`/campo/eliminar_hoja_campo/${id}/`);
// export const deleteCalibracionVerificacion = (id) => Api_Host.delete(`/campo/calibracionverificacion/${id}/`);
// export const deleteCalibracionVerificacion = (id) => Api_Host.delete(`/campo/calibracionverificacion/${id}/`);