import { Api_Host } from "../Api";

export const getAllCustodiaExterna = () => Api_Host.get('/campo/allcustodiaexterna/');
export const createCustodiaExterna = (data) => Api_Host.post('/campo/custodiaexterna/', data);
export const getCustodiaExternaById = (id) => Api_Host.get(`/campo/custodiaexterna/${id}/`);
export const updateCustodiaExterna = (id, data) => Api_Host.put(`/campo/custodiaexterna/${id}/`, data);
//allcustodiaexterna/
//export const getAllCustodiaExterna = () => Api_Host.get('/campo/custodiaexterna/');