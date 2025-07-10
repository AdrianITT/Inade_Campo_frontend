import { Api_Host } from "../Api";

/*  Hoja Campo  ----------------------------------------------------------*/
export const createHojaCampo   = (payload)           =>
  Api_Host.post ("/campo/hojacampo/", payload);
export const updateHojaCampo   = (id, payload)       =>
  Api_Host.patch(`/campo/hojacampo/${id}/`, payload);
export const fetchHojaCampo    = (id)                =>
  Api_Host.get  (`/campo/hojacampo/${id}/`).then(r => r.data);
export const fetchHojaCampoFromIntermediario = (intermediarioId) =>
  Api_Host.get(`/campo/intermediario/${intermediarioId}/`)
    .then(r => r.data.hojaCampo );

/*  Sub-modelos (Ph, Temperatura, …)  -----------------------------------*/
export const createPhMuestra           = (p) => Api_Host.post("/campo/phmuestra/", p);
export const createTemperaturaMuestra  = (p) => Api_Host.post("/campo/temperaturamuestra/", p);
export const createConductividadMuestra= (p) => Api_Host.post("/campo/conductividadmuestra/", p);
export const createTemperaturaAire     = (p) => Api_Host.post("/campo/temperaturaairemuestra/", p);
export const createTiempoMuestra       = (p) => Api_Host.post("/campo/tiempomuestra/", p);
export const createVolumenMuestra      = (p) => Api_Host.post("/campo/volumenmuestra/", p);

/*Sub-modelos por Muestra  -----------------------------------*/
export const updatePhMuestra           = (id,data) => Api_Host.patch(`/campo/phmuestra/${id}/`, data);
export const updateTemperaturaMuestra  = (id,data) => Api_Host.patch(`/campo/temperaturamuestra/${id}/`, data);
export const updateConductividadMuestra= (id,data) => Api_Host.patch(`/campo/conductividadmuestra/${id}/`, data);
export const updateTemperaturaAire     = (id,data) => Api_Host.patch(`/campo/temperaturaairemuestra/${id}/`, data);
export const updateTiempoMuestra       = (id,data) => Api_Host.patch(`/campo/tiempomuestra/${id}/`, data);
export const updateVolumenMuestra      = (id,data) => Api_Host.patch(`/campo/volumenmuestra/${id}/`, data);

/*  Muestra por Hoja Campo  ---------------------------------------------*/
export const createMuestraHojaCampo = (p) =>
  Api_Host.post("/campo/muestrahojacampo/", p);
export const updateMuestraHojaCampo = (id,data) =>
  Api_Host.patch(`/campo/muestrahojacampo/${id}/`, data);

/*  Intermediario  -------------------------------------------------------*/
export const updateIntermediario = (id, payload) =>
  Api_Host.patch(`/campo/intermediario/${id}/`, payload);
