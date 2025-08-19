// src/utils/handleSubmitConductividad.js
import {
  createVerificacionConductiva,
  createConductividadMcAceptacion,
  createConductividadMrAceptacion,
  createConductividadCampo,
  createConductividadLaboratorio
} from "../../../apis/ApiCampo/VerificacionConductividad"; // Ajusta el path si es necesario
import {
     createCalibracionVerificacion
} from "../../../apis/ApiCampo/CalibracionVerificacion";
import dayjs from "dayjs";


import { message } from "antd";

export const handleSubmitConductividad = async (values, id, navigate) => {
  try {
     console.log("values: ",values)
     console.log("ids: ",id);
     const { data: calibracionverificacion } = await createCalibracionVerificacion({
      fechaCalibracion:  dayjs().format("YYYY-MM-DD"),
      equipoUtilizado: values.equipoUtilizado,
      idEquipo: values.idEquipo,
      marcaEquipo: values.marcaEquipo,
      modeloEquipo: values.modeloEquipo,
      serialEquipo:values.serialEquipo,
      aguaResidualInforme: id,
      // calibracionConductiva: idVerificacion
    });

    const { data: verificacion } = await createVerificacionConductiva({
      observacion: values.observacion,
      realizo: values.realizado,
      supervisor: values.supervisor,
      calibracionVerificacion:calibracionverificacion.id
      // conductividadLaboratorio: lab.id,
      // conductividadCampo: campo.id
    });

    const {data : primerMr }=await createConductividadMrAceptacion({
      horaMr: values.horaMr?.format("HH:mm"),
      l1Mr: values.l1Mr,
      t1Mr: values.t1Mr,
      l2Mr: values.l2Mr,
      t2Mr: values.t2Mr,
      l3Mr: values.l3Mr,
      t3Mr: values.t3Mr,
      criterioMr: values.criterioMr,
      seAceptaMr: values?.seAceptaMr || false
    });

    const {data : primerMc}=await createConductividadMcAceptacion({
      horaMc: values.horaMc?.format("HH:mm"),
      l1Mc: values.l1Mc,
      t1Mc: values.t1Mc,
      l2Mc: values.l2Mc,
      t2Mc: values.t2Mc,
      l3Mc: values.l3Mc,
      t3Mc: values.t3Mc,
      criterioMc: values.criterioMcL,
      seAceptaMc: values?.seAceptaMcL || false
    });

    // 3️⃣ Crear lecturas de campo
    

    const {data: segundoMr}=await createConductividadMrAceptacion({
      horaMr: values.horaMrCampo?.format("HH:mm"),
      l1Mr: values.l1MrCampo,
      t1Mr: values.t1MrCampo,
      l2Mr: values.l2MrCampo,
      t2Mr: values.t2MrCampo,
      l3Mr: values.l3MrCampo,
      t3Mr: values.t3MrCampo,
      criterioMr: values.criterioMrCampo,
      seAceptaMr: values?.seAceptaMrCampo || false
    });

    const {data: segundoMc}=await createConductividadMcAceptacion({
      horaMc: values.horaMcCampo?.format("HH:mm"),
      l1Mc: values.l1McCampo,
      t1Mc: values.t1McCampo,
      l2Mc: values.l2McCampo,
      t2Mc: values.t2McCampo,
      l3Mc: values.l3McCampo,
      t3Mc: values.t3McCampo,
      criterioMc: values.criterioMcCampo,
      seAceptaMc: values?.seAceptaMcCampo || false
    });

    
    const {data: lab}=await createConductividadLaboratorio({
         usCmLaboratorio: values.usCmLaboratorio,
         estandarMr: values.estandarMr,
         marcaMr: values.marcaMr,
         loteMr: values.loteMr,
         fechaMrCaducidad: values.fechaMrCaducidad?.format("YYYY-MM-DD"),
         estandarMc: values.estandarMc,
         marcaMc: values.marcaMc,
         loteMc: values.loteMc,
         fechaMcCaducidad: values.fechaMcCaducidad?.format("YYYY-MM-DD"),
         conductividadAceptacionMr: primerMr.id,
         conductividadAceptacionMc: primerMc.id,
         calibracionConductiva:verificacion.id,
     });

     const {data: campo}=await createConductividadCampo({
       usCmCampo: values.usCmCampo,
       usCmCampoRango: values.usCmCampoRango,
       conductividadAceptacionMr: segundoMr.id,
       conductividadAceptacionMc:segundoMc.id,
       calibracionConductiva:verificacion.id,
     });

     
    console.log("verificacion",verificacion);

    const idVerificacion = verificacion.id;
    console.log("values.equipoUtilizado", values.equipoUtilizado)
    console.log("values.idEquipo", values.idEquipo)
    console.log("values.equipoUtilizado", values.equipoUtilizado)
    console.log("values.equipoUtilizado", values.equipoUtilizado)
    
    console.log("calibracionverificacion", calibracionverificacion)

    message.success("Verificación de conductividad guardada correctamente");
  } catch (error) {
    console.error(error);
    message.error("Error al guardar la verificación de conductividad");
  }finally {
     message.success("Todos los puntos guardados ✅");
     setTimeout(() => {
     navigate(`/DetallesAguasResiduales/${id}`); // regresar a la página anterior
     }, 1000);
     }
};
