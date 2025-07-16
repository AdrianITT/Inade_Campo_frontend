import { Api_Host } from "../Api";

export const getAguaResidualInforme = () => Api_Host.get('/campo/aguaresidualinforme/');
export const createAguaResidualInforme = (data) => Api_Host.post('/campo/aguaresidualinforme/',data);

export const ByIdAguaResidualInforme = (id) => Api_Host.get(`/campo/obtenerDatosAguas/${id}/`);

export const updateAguaResidualInforme = (id,data) => Api_Host.patch(`/campo/aguaresidualinforme/${id}/`,data);