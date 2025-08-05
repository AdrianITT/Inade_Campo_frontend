// logic/enviarSeccionProtocolo.js
import { message } from "antd";
import dayjs from "dayjs";
import {
     createSitioMuestreo,
     createPuntoMuestreo,
     createProcedimientoMuestreo,
     createPlanMuestreo,
     updateProtocoloMuestreo,
     updateSitioMuestreo,
     fetchProtocolo,
     updatePuntoMuestreo ,
     updateProcedimientoMuestreo,
     updatePlanMuestreo,
} from "../../../apis/ApiCampo/FormmularioInforme";

function cleanPayload(obj) {
  return Object.fromEntries(
    Object.entries(obj).filter(
      ([_, v]) => v !== null && v !== undefined && v !== ""
    )
  );
}

/**
 * Envía una sección del protocolo de muestreo.
 * @param {string} punto        - 'punto1' | 'punto2' | 'punto3' | 'punto4'
 * @param {object} values       - Values completos del form (o subset)
 * @param {number|string} id - ID del AguaResidualInforme
 */
export async function sendProtocolSections(punto, values, id, protocoloId) {
  try {
     const protocolo = await fetchProtocolo(protocoloId);
    let data = {};
   let payload= {};

    switch (punto) {
      case "punto1": {
        console.log("Enviando punto 1", values.giroActividad);
         payload = {
          protocoloMuestreo: protocoloId,
          domicilio: values.domicilioUbicacion,
          giroEmpresa: values.giroActividad,
        };
        // payload = cleanPayload(payload);
        console.log("Payload para sitio de muestreo:", payload);
        if (protocolo.sitioMuestreo) {
          // actualizar
          await updateSitioMuestreo(protocolo.sitioMuestreo, payload);
        } else {
          // crear y enlazar
          const { data: sitio } = await createSitioMuestreo(payload);
          await updateProtocoloMuestreo(protocoloId, { sitioMuestreo: sitio.id });
        }
        break;
     }
      case "punto2":
        data = {
          identificacionPunto: values.identificacionCampo,
          descripcionProceso: values.descripcionProceso,
          origenMuestra: values.origenMuestra,
          aguaResidualOtro: values.tratamientoAntesDescargaOtro,
          horasOperacion:values.horasOpera,
          horasDescarga: values.horasDescarga,
          frecuenciaDescarga: values.modalidadDescarga,
          informacionProporcionada: (values?.nombreResponsable || "")+"."+(values?.puestoResponsable || ""),
          aguaResidualTratamiento:values.tratamientoAntesDescarga,
          tipoDescarga: values.modalidadDescarga,
        };
        // data = cleanPayload(data);
        console.log("data2 para sitio de muestreo:", data);
        if (protocolo.puntoMuestreo) {
          await updatePuntoMuestreo(protocolo.puntoMuestreo, data);
        } else {
          const { data: punto } = await createPuntoMuestreo(data);
          await updateProtocoloMuestreo(protocoloId, { puntoMuestreo: punto.id });
        }
        break;

      case "punto3":
        data = {
          parametroADeterminar: values.parametroDeterminado,
          materialUso: values.instrumentoMedicion,
          recipiente: values.recipiente,
          preservadorUtilizado: values.reactivoUtilizado,
          tipoMuestreo: values.tipoMuestreo,
          frecuenciaMuestreo: values.frecuenciaMuestreo,
          tipoAgua: values.tipoAgua,
          tipoAguaOtro: values.tipoAguaOtro,
          cuerpoReceptor: values.cuerpoReceptor,
          cuerpoReceptorOtro: values.cuerpoReceptorOtro
        };
        //  data = cleanPayload(data);
        console.log("data3 para sitio de muestreo:", data);
        if(protocolo.procedimientoMuestreo){
          await updateProcedimientoMuestreo(protocolo.procedimientoMuestreo,data);
        }else{
          const {data:proc}= await createProcedimientoMuestreo(data);
          await updateProtocoloMuestreo(protocoloId,{procedimientoMuestreo: proc.id});
        }
     //    await createProcedimientoMuestreo(data);
        break;

      case "punto4":
        data = {
          inicial: values.inicial,
          final: values.final,
          horaInicial: values.horaInicio && dayjs(values.horaInicio).format("HH:mm"),
          horaFinal: values.horaTermino && dayjs(values.horaTermino).format("HH:mm"),
          observacion: values.Observaciones,
        };
        //  data = cleanPayload(data);
        console.log("data4 para sitio de muestreo:", data);
        if(protocolo.planMuestreo){
          await updatePlanMuestreo(protocolo.planMuestreo,data);
        }else{
          const {data: plan} = await createPlanMuestreo(data);
          await updateProtocoloMuestreo(protocoloId,{planMuestreo:plan.id})
        }
     //    await createPlanMuestreo(data);
        break;

      default:
        throw new Error("Punto no reconocido");
    }

    message.success(`Datos de ${punto} enviados correctamente`);
    return true;
  } catch (err) {
    console.error(err);
    console.error(err.response?.data);
    message.error("Error al enviar los datos");
    return false;
  }
}

function inserId(idProtocoloMuestreo, idIntermediario){

}
