import { Api_Host } from "../Api";

/**
 * ==========================================
 * SERVICIOS PARA LA GESTIÓN DE ÁREAS
 * ==========================================
 */

// Obtiene la lista completa de todas las áreas registradas en el sistema.
export const obtenerAreas = () => {
    return Api_Host.get("/campo/areas/");
};

// Crea una nueva área en el servidor (ej: "Tierras Físicas", "Iluminación").
// Recibe un objeto con los datos, por ejemplo: { nombre: "Nombre del Área" }
export const crearArea = (datosArea) => {
    return Api_Host.post("/campo/areas/", datosArea);
};

// Actualiza los datos de un área existente identificada por su ID.
export const actualizarArea = (idArea, datosArea) => {
    return Api_Host.put(`/campo/areas/${idArea}/`, datosArea);
};

// Elimina un área del sistema usando su ID.
export const eliminarArea = (idArea) => {
    return Api_Host.delete(`/campo/areas/${idArea}/`);
};


/**
 * ==========================================
 * SERVICIOS PARA LA GESTIÓN DE MÁQUINAS
 * ==========================================
 */

// Obtiene la lista completa de todas las máquinas físicas en el sistema.
export const obtenerMaquinas = () => {
    return Api_Host.get("/campo/maquina/");
};

// Crea una máquina nueva en el catálogo global de máquinas.
// Recibe: { equipoId, marca, modelo, serie, estado }
export const crearMaquina = (datosMaquina) => {
    return Api_Host.post("/campo/maquina/", datosMaquina);
};

// Actualiza los datos de una máquina específica identificada por su ID.
export const actualizarMaquina = (idMaquina, datosMaquina) => {
    return Api_Host.put(`/campo/maquina/${idMaquina}/`, datosMaquina);
};

// Elimina una máquina del catálogo global de máquinas usando su ID.
export const eliminarMaquina = (idMaquina) => {
    return Api_Host.delete(`/campo/maquina/${idMaquina}/`);
};


/**
 * ==========================================
 * SERVICIOS PARA EL INVENTARIO DE MÁQUINAS
 * (Relación entre Máquina y Área con datos del Certificado)
 * ==========================================
 */

// Obtiene todos los registros del inventario de máquinas (maquina + certificado + area + proveedor).
export const obtenerInventarioMaquinas = () => {
    return Api_Host.get("/campo/get_inventario_maquinas/");
};

// Registra la asignación de una máquina a un área junto con sus datos de certificación.
// Recibe: { maquina (ID), area (ID), fechaCertificado, noCertificado, provedor }
export const crearInventarioMaquina = (datosInventario) => {
    return Api_Host.post("/campo/inventariomaquinas/", datosInventario);
};

// Actualiza el registro de inventario (por ejemplo cambiar la fecha del certificado o el proveedor).
export const actualizarInventarioMaquina = (idInventario, datosInventario) => {
    return Api_Host.put(`/campo/inventariomaquinas/${idInventario}/`, datosInventario);
};

// Elimina el registro de inventario, quitando la máquina del área.
export const eliminarInventarioMaquina = (idInventario) => {
    return Api_Host.delete(`/campo/inventariomaquinas/${idInventario}/`);
};
