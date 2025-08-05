import { Api_Host } from "../Api";


export const getDataClienteById = (id) => Api_Host.get(`/cliente-por-cotizacion/${id}/`);
