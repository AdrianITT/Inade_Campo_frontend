import { searchIluminacion, showIluminacion, createIluminacion } from "../../../apis/ApiCampo/IluminacionApi";

export const searchOTData = async (data) => {
  try {
    // Ejecuta en paralelo (más rápido)
    const [otRes, ilumRes] = await Promise.all([
      searchIluminacion(data),
      showIluminacion(),
    ]);

    const otData = otRes?.data ?? null;
    const iluminaciones = ilumRes?.data ?? [];

    // Si no existe la OT
    if (!otData) {
      return {
        ok: false,
        message: "No se encontró la OT",
        ot: null,
        iluminacion: iluminaciones,
      };
    }

    return {
      ok: true,
      message: "OT encontrada",
      ot: otData,
      iluminacion: iluminaciones,
    };
  } catch (error) {
    // Si la API responde 404 o error
    const status = error?.response?.status;
    if (status === 404) {
      // OT no encontrada (pero igual damos lista de iluminaciones si se pudo)
      return {
        ok: false,
        message: "No se encontró la OT (404)",
        ot: null,
        iluminacion: [],
      };
    }

    console.error("Error al buscar la OT de Iluminación:", error);
    return {
      ok: false,
      message: "Error consultando datos",
      ot: null,
      iluminacion: [],
      error,
    };
  }
};

export const getAllIluminacion = async (data) => {
  try {
    const res = await createIluminacion(data);
    return res;
  } catch (error) {
    console.error("Error al obtener todas las iluminaciones:", error);
    return [];
  }
};
