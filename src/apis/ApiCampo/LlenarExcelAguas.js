import { Api_Host } from "../Api";

export const getLlenarExcelAguas=(id)=>Api_Host.get(`/campo/llenarExcelAguas/${id}/`, {
    responseType: "blob", // ⬅️ esto es obligatorio
  });