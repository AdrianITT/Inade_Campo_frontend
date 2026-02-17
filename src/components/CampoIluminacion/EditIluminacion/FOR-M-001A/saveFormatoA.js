import { message } from "antd";
import {
  createZonaIlum,
  updateZonaIlum,
  createTablaCalZona,
  updateTablaCalZona,
  deleteTablaCalZona,
  createPuntoIluminacion
} from "../../../../apis/ApiCampo/IluminacionApi";

const rowHasData = (r) =>
  [r?.areaTrabajo, r?.largo, r?.ancho, r?.alto].some((v) => String(v ?? "").trim() !== "");

export const saveFormatoA = async ({ cards, iluminacionId, carded }) => {
  try {
    const list = Array.isArray(cards) ? cards : [];
    
    for (const card of list) {
      const rows = Array.isArray(card?.rows) ? card.rows : [];
      
      const rowsConDatos = rows.filter(rowHasData);

      // ✅ IDs actuales (solo los que ya existen en BD)
      const currentIds = rowsConDatos.map(r => r?.id).filter(Boolean);

      // ✅ IDs originales (esto lo tienes que setear al cargar)
      //console.log("card: ",card); //new data
      //console.log("carded: ",carded);// old data

      const oldCard = Array.isArray(carded)
      ? carded.find((c) => String(c?.id) === String(card?.id))
      : null;
      
      const originalIds = Array.isArray(oldCard?.rows)
      ? oldCard.rows.map((r) => r?.id).filter(Boolean)
      : [];

      //console.log("originalIdso: ",originalIds);
      // ✅ los que estaban antes y ya no están -> borrar punto (cascade)
      const toDelete = originalIds.filter((id) => !currentIds.includes(id));
      //console.log("toDelete: ",toDelete);

      // 0) Borrar primero (recomendado para evitar conflictos)
      for (const rowId of toDelete) {
        await deleteTablaCalZona(rowId);
      }

      // si card está vacío total, saltar
      if (!card?.fechaMonitoreo && !card?.fechaPreliminar && rowsConDatos.length === 0) continue;

      // 1) UPSERT ZONA
      const zonaPayload = {
        fechaMonitoreo: card?.fechaMonitoreo ?? "",
        // fechaPreliminar: card?.fechaPreliminar ?? "",
        iluminacion: iluminacionId,
      };

      let zonaId = card?.id;

      if (zonaId) {
        await updateZonaIlum(zonaId, zonaPayload);
      } else {
        const created = await createZonaIlum(zonaPayload);
        zonaId = created?.data?.id;
        if (!zonaId) throw new Error("No se pudo crear zonaIluminacion (zonaId vacío)");
      }

      // 2) UPSERT ROWS
      for (const r of rowsConDatos) {
        const isNew = !r?.id;
        let puntoId = r?.punto


        if (isNew){
          const respPunto = await createPuntoIluminacion({ iluminacion: iluminacionId });
          puntoId = respPunto?.data?.id;
          if (!puntoId) throw new Error("No se pudo crear PuntoIluminacion");
        }
        const rowPayload = {
          areaTrabajo: String(r?.areaTrabajo ?? "").trim() || "Area No Asignada",
          largo: String(r?.largo ?? "").trim(),
          ancho: String(r?.ancho ?? "").trim(),
          alto: String(r?.alto ?? "").trim(),
          puntoFocal: r?.coincide ? "SI" : "NO",
          zonaIluminacion: zonaId,
          punto: puntoId,
        };

        if (r?.id) {
          await updateTablaCalZona(r.id, rowPayload);
        } else {
          await createTablaCalZona(rowPayload);
          // await createPuntoIluminacion(puntoIlum);
        }
      }

      // ✅ Actualiza originalRowIds para futuras ediciones (opcional)
      // card.originalRowIds = rowsConDatos.map(r => r.id).filter(Boolean);
    }

    message.success("Cambios guardados correctamente");
    return true;
  } catch (error) {
    console.error(error);
    message.error(error?.message ?? "Error al guardar cambios");
    return false;
  }
};
