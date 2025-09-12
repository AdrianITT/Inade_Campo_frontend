import { Api_Host } from "../Api";

// Obtener todos los roles
export const getAllRol = () => Api_Host.get('/rol/');
