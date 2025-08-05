import { useCallback, useRef } from "react";
import dayjs from "dayjs";
import {
  conductividadInfoData,
  updateVerificacionConductiva,
  updateConductividadLaboratorio,
  updateConductividadCampo,
  updateConductividadMrAceptacion,
  updateConductividadMcAceptacion,
  updateCalibracionVerificacion,
} from "../../../apis/ApiCampo/VerificacionConductividad";

const toIso     = (d) => (dayjs.isDayjs(d) ? d.format("YYYY-MM-DD") : d);
const toIsoTime = (d) => (dayjs.isDayjs(d) ? d.format("HH:mm:ss")  : d);

/**
 * Recibe los IDs de cada bloque y devuelve un handler
 * que envía las cinco peticiones en paralelo.
 */
export function useActualizarConductividad(ids) {
  const save = useCallback(
    async (values) => {
      await Promise.all([

        updateVerificacionConductiva(values.conducid,{
          observacion: values.observacion,
          realizo: values.realizado,
          supervisor: values.supervisor,
        }),
        /* 1. Cabecera */
        updateCalibracionVerificacion(values.verifId, {
          equipoUtilizado: values.equipoUtilizado,
          idEquipo:        values.idEquipo,
          marcaEquipo:     values.marcaEquipo,
          modeloEquipo:    values.modeloEquipo,
          serialEquipo:    values.serialEquipo,
        }),

        /* 2. Laboratorio */
        updateConductividadLaboratorio(values.labId, {
          usCmLaboratorio: values.usCmLaboratorio,
          estandarMr:      values.estandarMr,
          marcaMr:         values.marcaMr,
          loteMr:          values.loteMr,
          fechaMrCaducidad: toIso(values.fechaMrCaducidad),
          estandarMc:      values.estandarMc,
          marcaMc:         values.marcaMc,
          loteMc:          values.loteMc,
          fechaMcCaducidad: toIso(values.fechaMcCaducidad),
        }),

        /* 3. Campo */
        updateConductividadCampo(values.campoId, {
          usCmCampo:      values.usCmCampo,
          usCmCampoRango: values.usCmCampoRango,
        }),

        /* 4. Aceptaciones MR */
        updateConductividadMrAceptacion(values.mrLabId, {
          horaMr: toIsoTime(values.horaMr),
          l1Mr:   values.l1Mr,
          t1Mr:   values.t1Mr,
          l2Mr:   values.l2Mr,
          t2Mr:   values.t2Mr,
          l3Mr:   values.l3Mr,
          t3Mr:   values.t3Mr,
          criterioMr: values.criterioMr,
          seAceptaMr: values.seAceptaMr,
        }),
        updateConductividadMrAceptacion(values.mrCampoId, {
          horaMr: toIsoTime(values.horaMrCampo),
          l1Mr:   values.l1MrCampo,
          t1Mr:   values.t1MrCampo,
          l2Mr:   values.l2MrCampo,
          t2Mr:   values.t2MrCampo,
          l3Mr:   values.l3MrCampo,
          t3Mr:   values.t3MrCampo,
          criterioMr: values.criterioMrCampo,
          seAceptaMr: values.seAceptaMrCampo,
        }),

        /* 5. Aceptaciones MC */
        updateConductividadMcAceptacion(values.mcLabId, {
          horaMc: toIsoTime(values.horaMc),
          l1Mc:   values.l1Mc,
          t1Mc:   values.t1Mc,
          l2Mc:   values.l2Mc,
          t2Mc:   values.t2Mc,
          l3Mc:   values.l3Mc,
          t3Mc:   values.t3Mc,
          criterioMc: values.criterioMcL,
          seAceptaMc: values.seAceptaMcL,
        }),
        updateConductividadMcAceptacion(values.mcCampoId, {
          horaMc: toIsoTime(values.horaMcCampo),
          l1Mc:   values.l1McCampo,
          t1Mc:   values.t1McCampo,
          l2Mc:   values.l2McCampo,
          t2Mc:   values.t2McCampo,
          l3Mc:   values.l3McCampo,
          t3Mc:   values.t3McCampo,
          criterioMc: values.criterioMcCampo,
          seAceptaMc: values.seAceptaMcCampo,
        }),
      ]);
    },
    [ids]
  );

  return save;
}
