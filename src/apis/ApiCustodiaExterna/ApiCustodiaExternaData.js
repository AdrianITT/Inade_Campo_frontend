import { Api_Host } from "../Api";


export const getCustodiaExternaDataById = (id) => Api_Host.get(`/campo/custodiaexternadata/${id}/`);