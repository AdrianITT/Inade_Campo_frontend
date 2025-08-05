import { message } from "antd";
import {
  createSitioMuestreo, updateSitioMuestreo,
  createPuntoMuestreo, updatePuntoMuestreo,
  createProcedimientoMuestreo, updateProcedimientoMuestreo,
  createPlanMuestreo, updatePlanMuestreo,
  updateProtocoloMuestreo
} from "../../../apis/ApiCampo/FormmularioInforme";
import { upsert } from "../../../apis/ApiCampo/helper";   // helper del paso 3

export const sendDataProtocolSections = async (
  punto, values,id, protocoloId,
  { sitioIdRef, puntoIdRef, procIdRef, planIdRef }
) => {
  function normalize(values) {
  return {
    /* punto 1 -------------- */
    sitio: {
      domicilio   : values.domicilioUbicacion,
      giroEmpresa : values.giroActividad
    },
    /* punto 2 -------------- */
    punto: {
      identificacionPunto : values.identificacionCampo,
      descripcionProceso  : values.descripcionProceso,
      origenMuestra       : values.origenMuestra,
      horasOperacion      : values.horasOpera,
      horasDescarga       : values.horasDescarga,
      frecuenciaDescarga  : values.frecuenciaDescarga,
      tipoDescarga        : values.modalidadDescarga,
      aguaResidualTratamiento: values.tratamientoAntesDescarga,
      aguaResidualOtro    : values.tratamientoAntesDescargaOtro,
      informacionProporcionada:
        `${values.nombreResponsable}.${values.puestoResponsable}`
    },
    /* punto 3 -------------- */
    proc: {
      parametroADeterminar : values.parametroDeterminado,
      materialUso          : values.instrumentoMedicion,   // [1,9]
      recipiente          : values.recipiente,
      preservadorUtilizado : values.reactivoUtilizado,
      tipoMuestreo         : values.tipoMuestreo,
      frecuenciaMuestreo   : values.frecuenciaMuestreo,
      tipoAgua             : values.tipoAgua,
      tipoAguaOtro         : values.tipoAguaOtro,
      cuerpoReceptor       : values.cuerpoReceptor,
      cuerpoReceptorOtro   : values.cuerpoReceptorOtro
    },
    /* punto 4 -------------- */
    plan: {
      inicial      : values.inicial,
      final        : values.final,
      horaInicial  : values.horaInicio && values.horaInicio.format("HH:mm"),
      horaFinal    : values.horaTermino && values.horaTermino.format("HH:mm"),
      observacion  : values.Observaciones
    }
  };
}

  const { sitio, punto: p2, proc, plan } = normalize(values);

  try {
    switch (punto) {
      case "punto1": {
        const newId = await upsert(
          sitioIdRef.current,
          createSitioMuestreo,
          updateSitioMuestreo,
          sitio
        );
        // console.log("Nuevo ID de sitio:", sitioIdRef.current);
        // sitioIdRef.current = newId;
        // await updateProtocoloMuestreo(protocoloId, { sitioMuestreo: newId });
        break;
      }

      case "punto2": {
        const newId = await upsert(
          puntoIdRef.current,
          createPuntoMuestreo,
          updatePuntoMuestreo,
          p2
        );
        // puntoIdRef.current = newId;
        // await updateProtocoloMuestreo(protocoloId, { puntoMuestreo: newId });
        break;
      }

      case "punto3": {
        const newId = await upsert(
          procIdRef.current,
          createProcedimientoMuestreo,
          updateProcedimientoMuestreo,
          proc
        );
        // procIdRef.current = newId;
        // await updateProtocoloMuestreo(protocoloId, { procedimientoMuestreo: newId });
        break;
      }

      case "punto4": {
        const newId = await upsert(
          planIdRef.current,
          createPlanMuestreo,
          updatePlanMuestreo,
          plan
        );
        // planIdRef.current = newId;
        // await updateProtocoloMuestreo(protocoloId, { planMuestreo: newId });
        break;
      }
      default:
        throw new Error("punto no reconocido");
    }

    message.success(`Datos de ${punto} guardados`);
    return true;
  } catch (err) {
    console.error(err);
    message.error("Error al guardar");
    return false;
  }
};
