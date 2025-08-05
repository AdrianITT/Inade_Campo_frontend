import { Api_Host } from "../Api";
export const getAlldataordentrabajo = async (id) => Api_Host.get(`/dataordentrabajo/${id}/`);