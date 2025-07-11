import { Api_Host } from "../Api";

export const getCroquisUbicacion = () => Api_Host.get('/campo/croquisubicacion/');

export const createCroquisUbicacion = (data) => Api_Host.post('/campo/croquisubicacion/',data).then(response => response.data);

export const updateCroquisUbicacion = (id,data) => Api_Host.patch(`/campo/croquisubicacion/${id}/`,data);