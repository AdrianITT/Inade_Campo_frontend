import { createHojaDistribucionLuz, createTableDistribucionLuz, createPuntoIluminacion } from "../../../../apis/ApiCampo/IluminacionApi";
import { message } from "antd"


export const insertDataC = async ({rows, id, observacion}) =>{
try{
     // console.log("insertDataC - rows: ",rows, "ID: ",id, "obs: ", observacion);
     const safeRows = Array.isArray(rows) ? rows : [];

     let datahd = {
     "observaciones": observacion ?? "",
     "iluminacion": id
     };
     // console.log("datahd: ",datahd);
     const hd = await createHojaDistribucionLuz(datahd); 
     const hdId = hd?.data?.id;

     if (!hdId) throw new Error("No se pudo obtener el ID de HojaReconocimiento.");

     let datatd={};
     for (let i = 0; i < safeRows.length; i++){
          const row = safeRows[i];


          datatd ={
               "punto":row.punto,
               "distribucionlamparas":row.distribucionlamparas,
               "hileraLamparas":row.hileraLamparas,
               "ilum_artificial":row.ilum_artificial,
               "ilum_natural":row.ilum_natural,
               "lamparaporhilera":row.lamparaporhilera,
               "potenciaLampara":row.potenciaLampara,
               "tipoLampara":row.tipoLampara,
               "distribucionIluminacion": hdId,
               "totalLamparas":row.totalLamparas,
          };
          await createTableDistribucionLuz(datatd);
          // console.log("datatd: ",datatd);
     }

     // console.log(rows.observacion);

     message.success("Reconocomiento guardado correctamente.");
     return false;
}catch(error){
     // console.log(error);
     message.error(error?.message ?? "Error al Guardar");
}
}