import { Api_Host } from "../Api";
// existe_ot_for_ilum/<int:ot_id>/
export const existe = (id) => Api_Host.get(`/campo/existe_ot_for_ilum/${id}/`);

export const downloadExcel = (id) => Api_Host.get(`/campo/hoja_campo_iluminacion/${id}/`,{responseType:"blob",});

export const searchIluminacion = (data_ot) => Api_Host.get(`/campo/orden_trabajo_iluminacion/${data_ot}/`);
export const showIluminacion = () => Api_Host.get('/campo/machineLight/');
export const createIluminacion = (data_ot) => Api_Host.get(`/campo/get_iluminacion_ot/${data_ot}/`);

//detalles Iluminacion
export const getDetallesIluminacion = (id) => Api_Host.get(`/campo/get_daetails_iluminacion/${id}/`);

export const createIlum = (data) => Api_Host.post("/campo/iluminacion/",data);
export const updateIlumnacionMachine = (id, data) => Api_Host.patch(`/campo/iluminacion/${id}/`, data);
//PuntoIluminacion
export const createPuntoIluminacion = (data) => Api_Host.post("/campo/PuntoIluminacion/",data);

//getAll
export const getAllDataCalculoZona = (id) => Api_Host.get(`/campo/get_all_data_calcula_zona/${id}/`)
//Crear Zona de Iluminacion 
export const createZonaIlum = (data) => Api_Host.post("/campo/zonaIluminacion/",data);
export const createTablaCalZona = (data) => Api_Host.post("/campo/tableCalculoZonas/",data);
export const deleteTablaCalZona = (id) => Api_Host.delete(`/campo/delete_calculo_zona/${id}/delete_punto/`);
// Update Zona de Iluminacion
export const updateZonaIlum = (id ,data) => Api_Host.patch(`/campo/zonaIluminacion/${id}/`, data);
export const updateTablaCalZona = (id ,data) => Api_Host.patch(`/campo/tableCalculoZonas/${id}/`, data);

export const getAreaTrabajo = (id) => Api_Host.get(`/campo/get_area_trabajo_iluminacion/${id}/`);

export const getExisces = (id) => Api_Host.get(`/campo/get_existence/${id}/`);

//insert data reconocimiento
export const createHojaReconocimiento = (data) => Api_Host.post('/campo/reconocimientoIluminacion/',data);
export const createTableReconocimiento = (data) => Api_Host.post('/campo/tableReconocimiento/',data);
// Update Hoja de Reconocimiento
export const updateHojaReconocimiento = (id, data) => Api_Host.patch(`/campo/reconocimientoIluminacion/${id}/`,data);
export const updateTableReconocimiento = (id ,data) => Api_Host.patch(`/campo/tableReconocimiento/${id}/`,data);
// all data Hoja de reconocimiento
export const getReconocimientoB = (ilumId) => Api_Host.get(`/campo/get_all_data_reconocimiento_iluminacion/${ilumId}/`)

//Distribución de Luz
export const createHojaDistribucionLuz = (data) => Api_Host.post('/campo/distribucionIluminacion/',data);
export const createTableDistribucionLuz = (data) => Api_Host.post('/campo/tableDistribucion/',data);

//Update Distribucion de Luz
export const updateHojaDistribucionLuz = (id, data) => Api_Host.patch(`/campo/distribucionIluminacion/${id}/`,data);
export const updateTableDistribucionLuz = (id, data) => Api_Host.patch(`/campo/tableDistribucion/${id}/`,data);

export const getDistribucionC = (ilumId) => Api_Host.get(`/campo/get_all_data_distribucion_ilum/${ilumId}`);

//Hoja de campo
export const createHojaCampoIlum = ( data ) => Api_Host.post('/campo/hojaCampoIluminacion/',data);
export const updateHojaCampoIlum = (id, data) => Api_Host.patch(`/campo/hojaCampoIluminacion/${id}/`,data);
export const deleteHojaCampoIlum = (id) => Api_Host.delete(`/campo/hojaCampoIluminacion/${id}/`);

//fechas y hora de iluminacion
export const creaeteDataIluminacion = (data) => Api_Host.post('/campo/dataMonitoreo/',data);
export const updateDataIluminacion = (id, data) => Api_Host.patch(`/campo/dataMonitoreo/${id}/`,data);


//tabla de hoja de campo
export const createTableHojaIlum = (data) => Api_Host.post('/campo/tableHojaCampoIluminacion/',data);
export const updateTableHojaIlum = (id, data) => Api_Host.patch(`/campo/tableHojaCampoIluminacion/${id}/`,data);
export const deleteTableHojaIlum = (id) => Api_Host.delete(`/campo/tableHojaCampoIluminacion/${id}/`);

//data e2
export const createE2 = (data) => Api_Host.post('/campo/iluminacionE2/',data);
export const updateE2 = (id, data) => Api_Host.patch(`/campo/iluminacionE2/${id}/`,data);

//data e1
export const createE1 = (data) => Api_Host.post('/campo/iluminacionE1/',data);
export const updateE1 = (id, data) => Api_Host.patch(`/campo/iluminacionE1/${id}/`,data);

//get data Hojas de campo Iluminacion
export const getAllDataHojaIlum = (id) => Api_Host.get(`/campo/get_data_hoja_iluminacion/${id}/`);
export const getAllDataAreaTrabajo = (id) => Api_Host.get(`/campo/nat_or_nart_lightning/${id}/`);


// Lista máquinas
export const getAllMachineLight = () => Api_Host.get("/campo/machineLight/");
export const getcalibracionesLightforMachineLight = (id) => Api_Host.get(`/campo/get_data_calibracion/${id}/`);

// Crear máquina
export const createMachineLight = (payload) => Api_Host.post("/campo/machineLight/", payload);

// Crear calibración (1 registro)
export const createCalibracionLight = (payload) => Api_Host.post("/campo/calibracionesLight/", payload);
export const updateMachineLight = (id, payload) => Api_Host.patch(`/campo/machineLight/${id}/`, payload);

export const updateCalibracionLight = (id, payload) => Api_Host.patch(`/campo/calibracionesLight/${id}/`, payload);
export const deleteCalibracionLight = (id) => Api_Host.delete(`/campo/calibracionesLight/${id}/`);