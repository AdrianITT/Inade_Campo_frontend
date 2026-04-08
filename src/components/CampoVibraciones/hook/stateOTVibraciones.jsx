import {
  getMaquinasParaVibraciones,
  getVibracionRegistroPorOT,
  searchOrdenTrabajoVibraciones,
} from "../../../apis/ApiCampo/ApiVibraciones";

export const searchOTDataVibraciones = async (data_ot) => {
  try {
    const [otRes] = await Promise.all([
      searchOrdenTrabajoVibraciones(data_ot),
      // getMaquinasParaVibraciones(),
    ]);

    const otData = otRes?.data ?? null;
    // const maquinas = maqRes?.data ?? [];

    if (!otData) {
      return {
        ok: false,
        message: "No se encontró la OT",
        ot: null,
        // maquinas,
      };
    }

    return {
      ok: true,
      message: "OT encontrada",
      ot: otData,
      // maquinas,
    };
  } catch (error) {
    const status = error?.response?.status;
    if (status === 404) {
      return {
        ok: false,
        message: "No se encontró la OT (404)",
        ot: null,
        // maquinas: [],
      };
    }

    console.error("Error al buscar la OT de Vibraciones:", error);
    return {
      ok: false,
      message: "Error consultando datos",
      ot: null,
      // maquinas: [],
      error,
    };
  }
};

export const getRegistroVibracionesPorOT = async (data_ot) => {
  try {
    const res = await getVibracionRegistroPorOT(data_ot);
    return res;
  } catch (error) {
    console.error("Error al obtener registro de vibraciones:", error);
    return { data: null };
  }
};
