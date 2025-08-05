import { Api_Host } from "../Api";
export const createCalibracionPh = (data) => Api_Host.post('/campo/calibracionph/',data);
export const createCalibracionPhCampo =(data) => Api_Host.post('/campo/calibracionphcampo/',data);
export const createCalibraionPhLaboratorio =(data) => Api_Host.post('/campo/calibraionphlaboratorio/',data);

export const createPrimerPuntoLaboratorio = (data)=> Api_Host.post('/campo/primerpuntolaboratorio/', data);
export const createSegundoPuntoLaboratorio =(data)=> Api_Host.post('/campo/segundopuntolaboratorio/',data);
export const createPrimerPuntoCampo = (data)=> Api_Host.post('/campo/primerpuntocampo/', data);
export const createSegundoPuntoCampo =(data)=> Api_Host.post('/campo/segundopuntocampo/',data);
export const createLecturaVerificacion =(data)=> Api_Host.post('/campo/lecturaverificacion/',data);

export const updateCalibracionPh = (id, data) => Api_Host.put(`/campo/calibracionph/${id}/`,data);
export const updateCalibracionPhCampo =(id,data) => Api_Host.put(`/campo/calibracionphcampo/${id}/`,data);
export const updateCalibraionPhLaboratorio =(id, data) => Api_Host.put(`/campo/calibraionphlaboratorio/${id}/`,data);

export const updatePrimerPuntoLaboratorio = (id, data,)=> Api_Host.put(`/campo/primerpuntolaboratorio/${id}/`, data);
export const updateSegundoPuntoLaboratorio =(id, data,)=> Api_Host.put(`/campo/segundopuntolaboratorio/${id}/`,data);
export const updatePrimerPuntoCampo = (id, data)=> Api_Host.put(`/campo/primerpuntocampo/${id}/`,data);
export const updateSegundoPuntoCampo =(id, data)=> Api_Host.put(`/campo/segundopuntocampo/${id}/`,data);
export const updateLecturaVerificacion =(id,data)=> Api_Host.put(`/campo/lecturaverificacion/${id}/`,data);

export const verificacionPhData =(id)=> Api_Host.get(`/campo/calibracion_ph_data/${id}/`);

export const createLecturaVerificacionBulk=(data) => Api_Host.post('/campo/bulk_create_lecturas/',data);