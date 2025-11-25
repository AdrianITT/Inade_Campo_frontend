import { Api_Host } from "../Api";
export const createCalibracionVerificacion = (data) => Api_Host.post('/campo/calibracionverificacion/',data);

export const deleteCalibracionVerificacion = (id) => Api_Host.delete(`/campo/calibracionverificacion/${id}/`);

export const getexcelcalibracionverificacion = (id) => Api_Host.get(`/campo/llenar_excel_aguas_calibracion_verificacion_c/${id}/`, {
    responseType: "blob", // ⬅️ esto es obligatorio
  });

export const getexcelcalibracionverificacionph = (id) => Api_Host.get(`/campo/llenar_calibracion_verificacion_ph/${id}/`, {
  responseType: "blob", // ⬅️ esto es obligatorio
});