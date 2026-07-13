import { Api_Host } from "../Api";

export const getCreateTierrasFisicas=(OT)=>Api_Host.get(`/campo/get_create_tierras_fisicas/${OT}/`);

export const getEditTierrasFisicas=(OT)=>Api_Host.get(`/campo/get_edit_tierras_fisicas/${OT}/`);

export const getMaquinasTF = () => Api_Host.get('/campo/get_all_machine_tierra_fisica/');

export const createTierrasFisicas = (data) => Api_Host.post('/campo/tierrasfisicas/', data);

export const getTierrasFisicas = (id)=> Api_Host.get(`/campo/get_detalle_TF/${id}/`);

//Reconocimiento

export const createReconocimientoTF = (data) => Api_Host.post('/campo/reconocimientotf/',data);

export const createUbicacionTF = (data) => Api_Host.post('/campo/ubicaciontf/', data);

export const updateReconocimientoTF = (id, data) => Api_Host.put(`/campo/reconocimientotf/${id}/`,data);

export const updateUbicacionTF = (id, data) => Api_Host.put(`/campo/ubicaciontf/${id}/`, data);

export const getReconocimientoTF = (id) => Api_Host.get(`campo/get_reconocimiento_tf/${id}/`);

export const deleteUbicacionTF = (id) => Api_Host.delete(`/campo/ubicaciontf/${id}/`);

//Verificacion

export const createVerificacionTF = ( data ) => Api_Host.post('/campo/verificaciontf/',data);

export const updateVerificacionTF = ( id, data ) => Api_Host.put(`/campo/verificaciontf/${id}/`,data);

export const getExistsVerificacionTF = ( id ) => Api_Host.get(`/campo/get_exists_verificacion/${id}`);

//Hoja de Campo

export const createHojaCampoTF = ( data ) => Api_Host.post( '/campo/hojacampotf/', data );

export const createValoresResistencia = ( data ) => Api_Host.post('/campo/valoresresistencia/', data);

export const createOhmsTF = ( data ) => Api_Host.post('/campo/ohmstf/', data);

export const updateHojaCampoTF = (id, data ) => Api_Host.put(`/campo/hojacampotf/${id}/`, data);

export const updateValoresResistencia = (id, data ) => Api_Host.put(`/campo/valoresresistencia/${id}/`, data);

export const updateOhmsTF = (id, data ) => Api_Host.put(`/campo/ohmstf/${id}/`, data);

export const getExistsHojaCampoTF = ( id ) => Api_Host.get(`/campo/get_exists_hoja_campo_tf/${id}`);

export const deleteValoresResistencia = (id) => Api_Host.delete(`/campo/valoresresistencia/${id}/`);

export const deletehojacampotf = (id) => Api_Host.delete(`/campo/hojacampotf/${id}/`);

//Download Excel
export const getDownloadExcel=(id) => Api_Host.get(
    `/campo/get_tierras_fisicas_data/${id}/?export=excel`,
    {responseType:"blob",});