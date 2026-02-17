import { message } from "antd"
import { 
     createHojaCampoIlum, 
     creaeteDataIluminacion, 
     createTableHojaIlum, 
     createE2, 
     createE1,
 } from "../../../../apis/ApiCampo/IluminacionApi";

export const insertDataIluminacionNAT = async ({values, id}) => {
     try{
          //ciclo de dos for anidados
          console.log("datos de ART: ",values.length, "Id Ilum: ", id);
          
          for ( let i = 0 ; i < values.length ; i++){
               const block = values[i];
               //console.log("block: ",block);
               let timeStr = null;
               if (block?.hora?.format){
                    timeStr = block.hora.format("HH:mm:ss");
               }else if (block?.hora){
                    const hora = new Date(block.hora)
                    // //console.log("hora: ", hora);
                    const hh = String(hora.getHours()).padStart(2, "0");
                    const mm = String(hora.getMinutes()).padStart(2, "0");
                    const ss = String(hora.getSeconds()).padStart(2, "0");
                    timeStr = `${hh}:${mm}:${ss}`;
               }else{
                    message.error(`Bloque #${i + 1}: hora inválida`);
               }
               //console.log(`${hh}:${mm}:${ss}`);

               let chci ={
                    "observacion": block.observaciones,
                    "iluminacion": id,
                    "influenciaLuz": block?.InfluyeLuz ?? null,
               };
               console.log("chci: ",chci);
               //console.log("container : ",i);
               const r = await createHojaCampoIlum(chci);
               const fechaStr = block.fechaMonitoreo?.format("YYYY-MM-DD") ?? null;
               let cdi = {
                    "fechaMonitoreo":fechaStr,
                    "tipo":block.tipo,
                    "hoja": r.data.id,
                    // "fechaMonitoreo":
               };
               const pos = i % 3;
               console.log("pos: ", pos);

               if ( pos === 0 ){
                    cdi.horaInicio = timeStr;
               }else if ( pos === 1 ) {
                    // cdi = {
                    //      "tipo":block.tipo,
                    //      "horaIntermediario": `${hh}:${mm}:${ss}`,
                    //      "hoja": r.data.id,
                    // };
                    cdi.horaIntermediario = timeStr;
               }else if ( pos === 2 ){
                    // cdi = {
                    //      "tipo":block.tipo,
                    //      "horaFinal": `${hh}:${mm}:${ss}`,
                    //      "hoja": r.data.id,
                    // };
                    cdi.horaFinal = timeStr;
               }
               else{
                     message.error("Algo salio mal") ;
                     continue;
               }
               const cr = await creaeteDataIluminacion(cdi);
               //console.log(cdi);
               const puntos =Array.isArray(block?.puntos) ? block.puntos : [];
               for( let c = 0; c < puntos.length ; c++ ){
                    const pout = puntos[c];
                    //console.log("pout: ",pout);
                    let data = {
                         "numeroPunto": pout?.numeroPunto ?? (c+1),
                         "areaMonitoreo":pout?.areaMonitoreo ?? "Area no Asignado",
                         "posicionTrabajo":pout?.posicionTrabajo ?? "N/A",
                         "descripcionPunto":pout?.descripcionPunto ?? "N/A",
                         "nivelMinimo": pout?.nivelMinimo ?? "0",
                         "refl_paredes": pout?.refl_paredes ?? false,
                         "refl_plano_trabajo": pout?.refl_plano_trabajo ?? false, 
                         "hojaCampo": r.data.id,
                    };
                    //console.log("data: ",data);
                    const rth = await createTableHojaIlum(data);
                    //console.log("rth: ",rth);
                    let lux ={
                         "lux1E2": pout?.lux1E2 ?? "0",
                         "lux2E2": pout?.lux2E2 ?? "0",
                         "lux3E2": pout?.lux3E2 ?? "0",
                         "punto": rth.data.id,
                    }
                    const luxE2 = await createE2(lux)
                    //console.log("lux: ",lux);
                    let lux1 ={
                         "lux1E1": pout?.lux1E1 ?? "0",
                         "lux2E1": pout?.lux2E1 ?? "0",
                         "lux3E1": pout?.lux3E1 ?? "0",
                         "punto": rth.data.id,
                    }
                    const luxE1 = await createE1(lux1)
                    //console.log("lux1: ",lux1);
               }
          }
          console.log("Fin del ciclo total")
          return false;

     }catch(error)
     {
          message.error("error: ",error);
          throw error;
          // return false;
     }
}