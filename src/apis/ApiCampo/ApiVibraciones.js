import { Api_Host } from "../Api";

export const uploadExcels = (data) => Api_Host.post('/campo/upload-excels/',data,{
     responseType: "blob",
    //  headers: {
    //       "Content-Type": "multipart/form-data",
    //  }
});

export const getVibracionesPuntos = (id) => Api_Host.get(`/campo/get_reconicimiento_id_vibraciones/${id}/`);

export const deleteVibracionPunto = (id) => Api_Host.delete(`/campo/reconocimiento/${id}/`);

export const submitVibracionesPuntos = (data) =>
  Api_Host.post("/campo/vibraciones/", data, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

// --- GetOrCreate Vibraciones (paralelo a IluminacionApi; ajusta paths si tu backend difiere) ---

export const existeOTparaVibraciones = (ordenTrabajoId) =>
  Api_Host.get(`/campo/existe_ot_for_vibraciones/${ordenTrabajoId}/`);

export const searchOrdenTrabajoVibraciones = (codigoOT) =>
  Api_Host.get(`/campo/orden_trabajo_vibraciones/${codigoOT}/`);



export const getVibracionRegistroPorOT = (codigoOT) =>
  Api_Host.get(`/campo/get_vibraciones_ot/${codigoOT}/`);

export const createVibracionesCampo = (data) =>
  Api_Host.post("/campo/vibraciones/", data);

export const getDetallesVibraciones =(id) =>
  Api_Host.get(`/campo/get_detalles_vibraciones/${id}/`);

//update

export const updateVibracionesCampo = (id, data) =>
  Api_Host.patch(`/campo/vibraciones/${id}/`, data);

// --- Calibracion ---

export const getCalibracion = (id) =>
  Api_Host.get(`/campo/calibracion/${id}/`);

export const createCalibracion = (data) =>
  Api_Host.post('/campo/calibracion/',data);

export const updateCalibracion = (id, data) =>
  Api_Host.patch(`/campo/calibracion/${id}/`,data);

//Obtener Maquinas de Vibraciones
export const getMachineVibracion = () =>
  Api_Host.get('/campo/get_all_machine_vibraciones/');
