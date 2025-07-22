import { Api_Host } from "../Api";

export const createVerificacionConductiva = (data) => Api_Host.post('/campo/calibracionconductiva/',data);
export const createConductividadMcAceptacion =(data) => Api_Host.post('/campo/conductividadaceptacionmc/',data);
export const createConductividadMrAceptacion =(data) => Api_Host.post('/campo/conductividadaceptacionmr/',data);
export const createConductividadCampo = (data)=> Api_Host.post('/campo/conductividadcampo/', data);
export const createConductividadLaboratorio=(data)=> Api_Host.post('/campo/conductividadlaboratorio/',data);
//conductividadlaboratorio/

export const updateVerificacionConductiva = (id,data) => Api_Host.patch(`/campo/calibracionconductiva/${id}/`,data);
export const updateConductividadMcAceptacion =(id,data) => Api_Host.patch(`/campo/conductividadaceptacionmc/${id}/`,data);
export const updateConductividadMrAceptacion =(id,data) => Api_Host.patch(`/campo/conductividadaceptacionmr/${id}/`,data);
export const updateConductividadCampo = (id,data)=> Api_Host.patch(`/campo/conductividadcampo/${id}/`, data);
export const updateConductividadLaboratorio=(id,data)=> Api_Host.patch(`/campo/conductividadlaboratorio/${id}/`,data);
export const updateCalibracionVerificacion=(id,data)=> Api_Host.patch(`/campo/calibracionverificacion/${id}/`,data);

//detalles de Calibración y verificación de Conductividad

export const conductividadInfoData =(id)=>Api_Host.get(`/campo/detalles_clibracion_verificacion_conductividad/${id}`);