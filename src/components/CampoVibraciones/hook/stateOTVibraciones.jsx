import {
  getVibracionRegistroPorOT,
  searchOrdenTrabajoVibraciones,
} from "../../../apis/ApiCampo/ApiVibraciones";

export const searchOTDataVibraciones = async (data_ot) => {
  try {
    const otRes = await searchOrdenTrabajoVibraciones(data_ot);
    const otData = otRes?.data ?? null;

    if (!otData) {
      return { ok: false, message: "No se encontró la OT", ot: null };
    }

    return { ok: true, message: "OT encontrada", ot: otData };
  } catch (error) {
    const status = error?.response?.status;
    if (status === 404) {
      return { ok: false, message: "No se encontró la OT (404)", ot: null };
    }

    console.error("Error al buscar la OT de Vibraciones:", error);
    return { ok: false, message: "Error consultando datos", ot: null, error };
  }
};

export const getRegistroVibracionesPorOT = async (data_ot) => {
  try {
    return await getVibracionRegistroPorOT(data_ot);
  } catch (error) {
    console.error("Error al obtener registro de vibraciones:", error);
    return { data: null };
  }
};
