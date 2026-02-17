import { message } from "antd";
import {
  createHojaDistribucionLuz,
  updateHojaDistribucionLuz,
  createTableDistribucionLuz,
  updateTableDistribucionLuz,
  createPuntoIluminacion,
} from "../../../../apis/ApiCampo/IluminacionApi";
import { rowCHasAnyData } from "./mapperC";

export const saveDistribucionC = async ({ iluminacionId, rows, observacion, initialData }) => {
  try {
    const safeRows = Array.isArray(rows) ? rows : [];

    // ✅ hojaId si existe (ajusta keys según tu API real)
    const hojaId =
      initialData?.hoja_distribucion?.id ??
      initialData?.["hoja_distribucion "]?.id ??
      initialData?.distribucion_ilum?.id ??
      initialData?.["distribucion_ilum "]?.id ??
      null;

    let hdId = hojaId;

    // 1) UPSERT HojaDistribucion
    if (hdId) {
      await updateHojaDistribucionLuz(hdId, { observaciones: observacion ?? "" });
    } else {
      const created = await createHojaDistribucionLuz({
        observaciones: observacion ?? "",
        iluminacion: iluminacionId,
      });
      hdId = created?.data?.id;
      if (!hdId) throw new Error("No se pudo crear HojaDistribucion (id vacío).");
    }

    // 2) UPSERT filas
    for (const row of safeRows) {
      if (!rowCHasAnyData(row)) continue;


      const payload = {
        punto: row?.punto,
        distribucionlamparas: row?.distribucionlamparas ?? "",
        hileraLamparas: row?.hileraLamparas ?? "",
        lamparaporhilera: row?.lamparaporhilera ?? "",
        potenciaLampara: row?.potenciaLampara ?? "",
        tipoLampara: row?.tipoLampara ?? "",
        ilum_natural: !!row?.ilum_natural,
        ilum_artificial: !!row?.ilum_artificial,
        distribucionIluminacion: hdId,
        totalLamparas: row?.totalLamparas ?? "",
      };

      if (row?.id) {
        await updateTableDistribucionLuz(row.id, payload);
      } else {
        await createTableDistribucionLuz(payload);
      }
    }

    return true;
  } catch (err) {
    console.error(err);
    message.error(err?.message ?? "Error al guardar FOR-M-001C");
    return false;
  }
};
