import { message } from "antd";
import { createZonaIlum, createTablaCalZona, createPuntoIluminacion } from "../../../../apis/ApiCampo/IluminacionApi";

export const InsertData = async ({ cards, id }) => {
  try {
    console.log("cards:", cards);

    const list = Array.isArray(cards) ? cards : [];

    for(const card of list ){
      const rows = Array.isArray(card?.row)
      ? card.rows
      : Array.isArray(card?.rows)
      ? card.rows
      : [];

      const rowsConDatos = rows.filter((r)=>
      [r?.areaTrabajo, r?.largo, r?.ancho, r?.alto].some(
        (v)=> String(v ?? "").trim() !==""
        )
      );
      console.log("rowsConDatos: ",rowsConDatos);
      if( rowsConDatos.length === 0 ) continue;

      const zona = await createZonaIlum({
        fechaMonitoreo: card?.fechaMonitoreo ?? "",
        // fechaPreliminar: card?.fechaPreliminar ?? "",
        iluminacion: id,
      });



      const zonaId = zona?.data?.id;
      if (!zonaId) throw new Error("No se pudo crear la zona (zonaId vacío)");
      for (const r of rowsConDatos) {
        const puntoIlum = await createPuntoIluminacion ({
        iluminacion: id
        });
        const puntoId = puntoIlum?.data?.id;
        if (!puntoId) throw new Error("No se pudo crear PuntoIluminacion (puntoId vacío)")
        await createTablaCalZona({
          punto: puntoId,
          areaTrabajo: String(r?.areaTrabajo ?? "").trim() || "Area No Asignada",
          largo: String(r?.largo ?? "").trim(),
          ancho: String(r?.ancho ?? "").trim(),
          alto: String(r?.alto ?? "").trim(),
          puntoFocal: r?.coincide === false ? "NO" : "SI",
          zonaIluminacion: zonaId,
        });
      }
    }
    
    message.success("InsertData terminó correctamente");
    return true;
  } catch (error) {
     message.error(`Error: ${error?.response?.data ?? String(error?.response?.data)}`);
     message.error(`Error: ${error?.message ?? String(error)}`);
     console.error(error?.response?.data);
     return false;
  }
};
