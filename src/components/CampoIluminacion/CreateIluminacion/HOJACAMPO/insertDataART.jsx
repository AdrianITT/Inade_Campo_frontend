import { message } from "antd"
import { 
     createHojaCampoIlum, 
     creaeteDataIluminacion,
     createTableHojaIlum,
     createE2,
     createE1, 
} from "../../../../apis/ApiCampo/IluminacionApi";

export const insertDataLuzART = async ({payload, id}) => {
     try{
          console.log("payload: ",payload, "ID: ",id);
          console.log("tipo: ", payload.tipo);
          for (let c = 0; c < payload.bloques.length; c++){
               const data = payload.bloques[c];
               console.log("datos de array: ",data);
               let chci = {
                    "observacion": data.observaciones,
                    "iluminacion": id,
                    "influenciaLuz": data?.influenciaLuz ?? null,
               }
               const r = await createHojaCampoIlum(chci);
               
               // console.log("chci: ",chci);
               let cdi = {
                    "fechaMonitoreo":data.fechaMonitoreo,
                    "horaFinal": data.horaFinal,
                    "horaInicio": data.horaInicio,
                    "turno": data.turno,
                    "tipo": payload.tipo,
                    "hoja": r.data.id,
               };
               const cr = await creaeteDataIluminacion(cdi);
               console.log("cr : ",cr );
               //
               const areaRows = Array.isArray(data?.puntos) ? data?.puntos : [];
               console.log("areaRows: ",areaRows);
               for (let i =0 ; i<areaRows.length; i++){
                    // console.log( "data: ",areaRows[i]);
                    const row = areaRows[i];
                    let layetdata = {
                         "numeroPunto": row?.numeroPunto ?? i+1,
                         "areaMonitoreo":row?.areaMonitoreo ?? "Area no Asignado",
                         "posicionTrabajo":row?.posicionTrabajo ?? "N/A",
                         "descripcionPunto":row?.descripcionPunto ?? "N/A",
                         "nivelMinimo": row?.nivelMinimo ?? "0",
                         "refl_paredes": row?.refl_paredes ?? false,
                         "refl_plano_trabajo": row?.refl_plano_trabajo ?? false, 
                         "hojaCampo": r.data.id,
                    };
                    const rth = await createTableHojaIlum(layetdata);
                    console.log("rth: ",rth);
                    let lux ={
                         "lux1E2": row?.lux1E2 ?? "0",
                         "lux2E2": row?.lux2E2 ?? "0",
                         "lux3E2": row?.lux3E2 ?? "0",
                         "punto": rth.data.id,
                    }
                    const luxE2 = await createE2(lux)
                    console.log("lux: ",lux);
                    let lux1 ={
                         "lux1E1": row?.lux1E1 ?? "0",
                         "lux2E1": row?.lux2E1 ?? "0",
                         "lux3E1": row?.lux3E1 ?? "0",
                         "punto": rth.data.id,
                    }
                    const luxE1 = await createE1(lux1)
                    console.log("lux1: ",lux1);
               }
          };

          return false;
     }catch(error){
          message.error("error: ", error);
          // console.log("error: ",error);
          throw error;
     }
}