import { message } from "antd";
import {
  createHojaReconocimiento,
  updateHojaReconocimiento,
  createTableReconocimiento,
  updateTableReconocimiento,
  createPuntoIluminacion
} from "../../../../apis/ApiCampo/IluminacionApi";
import { rowHasAnyData } from "./mapper";

export const saveReconocimientoB = async ({ iluminacionId, rows, observacion, initialData }) => {
  try {
    const safeRows = Array.isArray(rows) ? rows : [];

    // hojaId si existe
    const hojaId =
      initialData?.reconocimiento_ilum?.id ??
      initialData?.["reconocimiento_ilum "]?.id ??
      null;

    let hrId = hojaId;

    // 1) UPSERT HojaReconocimiento
    if (hrId) {
      await updateHojaReconocimiento(hrId, { observaciones: observacion ?? "" });
    } else {
      const created = await createHojaReconocimiento({
        observaciones: observacion ?? "",
        iluminacion: iluminacionId,
      });
      hrId = created?.data?.id;
      if (!hrId) throw new Error("No se pudo crear HojaReconocimiento (id vacío).");
    }

    // 2) UPSERT rows
    for (const row of safeRows) {
      // si no tiene nada escrito, no la insertes
      if (!rowHasAnyData(row)) continue;


      const payload = {
        descripcionTareasVisuales: row?.tareas_visuales ?? "",
        descripcionPunto: row?.puestos_trabajo ?? "",
        superficieColor: row?.color_superficie ?? "",
        superficieTipo: row?.tipo_superficie ?? "",
        paredColor: row?.color_pared ?? "",
        paredTipo: row?.tipo_pared ?? "",
        reconocimientoIluminacion: hrId,
        areaTrabajo: row?.areaTrabajo ?? "", // ✅ si tu backend lo maneja, si no, quítalo
        punto: row.punto,
      };

      if (row?.id) {
        await updateTableReconocimiento(row.id, payload);
      } else {
        await createTableReconocimiento(payload);
      }
    }

    return true;
  } catch (error) {
    console.error(error);
    message.error(error?.message ?? "Error al guardar Reconocimiento B");
    return false;
  }
};
