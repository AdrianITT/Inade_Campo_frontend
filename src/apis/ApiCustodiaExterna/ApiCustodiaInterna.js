import { Api_Host } from "../Api";
export const getllenar_excel_custodia_interna = (id) => Api_Host.get(`/campo/llenar_excel_custodia_interna/${id}/`, {
    responseType: "arraybuffer",          // ← clave
    transformResponse: [(data) => data],  // ← no intentes parsear a JSON
  });
//allcustodiaExternaFinalizados