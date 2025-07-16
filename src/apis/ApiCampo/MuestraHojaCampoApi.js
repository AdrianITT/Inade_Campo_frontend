import { Api_Host } from "../Api";

export const deleteMuestraHojaCampo = (id) => Api_Host.delete(`/campo/deleteMuestraHojaCampo/${id}/`);