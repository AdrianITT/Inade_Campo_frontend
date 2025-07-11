import { Api_Host } from "../Api";
export const getProtocoloCompleto = (id) => Api_Host.get(`/campo/protocolosInformeCompleto/${id}/`);