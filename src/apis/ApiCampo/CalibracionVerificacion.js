import { Api_Host } from "../Api";
export const createCalibracionVerificacion = (data) => Api_Host.post('/campo/calibracionverificacion/',data);

export const deleteCalibracionVerificacion = (id) => Api_Host.delete(`/campo/calibracionverificacion/${id}/`);