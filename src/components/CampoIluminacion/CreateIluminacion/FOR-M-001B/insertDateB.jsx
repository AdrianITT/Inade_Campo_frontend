import { message } from "antd"
import { createHojaReconocimiento, createTableReconocimiento, createPuntoIluminacion } from "../../../../apis/ApiCampo/IluminacionApi";

export const insertDataB = async ({rows, id, observacion}) =>{
try{
     const safeRows = Array.isArray(rows) ? rows : [];
     // console.log(safeRows);
     let datahr = {
     "observaciones": observacion ?? "",
     "iluminacion": id
     };
     // console.log("datahr: ",datahr);
     const hr = await createHojaReconocimiento(datahr);
     const hrId = hr?.data?.id;
     
     if (!hrId) throw new Error("No se pudo obtener el ID de HojaReconocimiento.");
     // console.log("hoala");
     let datatr={};
     // console.log("safeRows: ",safeRows);
     for (let i = 0; i < safeRows.length; i++){
          const row = safeRows[i];
          // console.log("row: ",row);


          datatr={
               "punto": row.punto,
               "descripcionTareasVisuales":row.tareas_visuales,
               "descripcionPunto":row.puestos_trabajo,
               "superficieColor":row.color_superficie,
               "superficieTipo":row.tipo_superficie,
               "paredColor":row.color_pared,
               "paredTipo":row.tipo_pared,
               "reconocimientoIluminacion": hrId,
          };
          await createTableReconocimiento(datatr);
          // console.log("datatr: ",i+1,datatr);
     }

     // console.log(rows.observacion);

     message.success("Reconocimiento guardado correctamente.");
     return true;
}catch(error){
     // console.log(error);
     message.error(error?.message ?? "Error al Guardar");
}
}