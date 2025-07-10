import { Api_Host } from "../Api";

export const getDetallesAguaResidualInforme = (id) => Api_Host.get(`/campo/datosInformeAR/${id}/`);