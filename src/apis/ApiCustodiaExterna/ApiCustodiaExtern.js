import { Api_Host } from "../Api";

export const getAllCustodiaExterna = () => Api_Host.get('/campo/allcustodiaexterna/');
export const createCustodiaExterna = (data) => Api_Host.post('/campo/custodiaexterna/', data);
export const getCustodiaExternaById = (id) => Api_Host.get(`/campo/custodiaexterna/${id}/`);
export const updateCustodiaExterna = (id, data) => Api_Host.put(`/campo/custodiaexterna/${id}/`, data);
export const updateOneCustodiaExterna = (id, data) => Api_Host.patch(`/campo/custodiaexterna/${id}/`, data);
//allcustodiaexterna/
//export const getAllCustodiaExterna = () => Api_Host.get('/campo/custodiaexterna/');
export const getAllCustodiaExternaEntregados = (organizacion_id) => Api_Host.get(`/campo/allcustodiaExternaEntregados/${organizacion_id}/`);
//allcustodiaExternaFinalizados
export const getAllCustodiaExternaFinalizados = (organizacion_id) => Api_Host.get(`/campo/allcustodiaExternaFinalizados/${organizacion_id}/`);
