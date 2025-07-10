
import {
  createPhMuestra, createTemperaturaMuestra, createConductividadMuestra,
  createTemperaturaAire, createTiempoMuestra, createVolumenMuestra,
  createMuestraHojaCampo, updateIntermediario, fetchHojaCampoFromIntermediario,
  updatePhMuestra,updateTemperaturaMuestra, updateConductividadMuestra,
  updateTemperaturaAire, updateTiempoMuestra, updateVolumenMuestra,updateMuestraHojaCampo
} from "../../apis/ApiCampo/HojaCampo";

/**
 * Crea o actualiza la Hoja de Campo completa, incluyendo sus muestras,
 * y enlaza el id en Intermediario.
 *
 * @param {object} values                 datos del Form
 * @param {number} informeId              fk AguaResidualInforme
 * @param {number} intermediarioId        id del Intermediario existente
*/
export async function saveHojaCampo(values, hojaId, form) {
  for (const registro of values.registros || []) {
    try {
      let phId, temperaturaId, conductividadId, temperaturaAireId, tiempoId, volumenId;
      console.log("phId:", phId, temperaturaId, conductividadId, temperaturaAireId, tiempoId, volumenId);
      console.log("registro:", registro);
      // 🔄 Submodelos: crear o actualizar
      if (registro.phId) {
        console.log("Procesando registro:", registro.phId);
        await updatePhMuestra(registro.phId, {
          ph1: registro.ph1 || 0, ph2: registro.ph2 || 0, ph3: registro.ph3 || 0,
        });
        phId = registro.phId;
      } else {
        console.log("Procesando registro1:", registro.phId);
        const { data } = await createPhMuestra({
          ph1: registro.ph1 || 0, ph2: registro.ph2 || 0, ph3: registro.ph3 || 0,
        });
        phId = data.id;
        registro.phId = phId; // Actualizar el registro con el nuevo ID
      }

      if (registro.temperaturaId) {
        await updateTemperaturaMuestra(registro.temperaturaId, {
          temp1: registro.temperatura1 || 0,
          temp2: registro.temperatura2 || 0,
          temp3: registro.temperatura3 || 0,
        });
        console.log("Procesando registro2:", registro.temperaturaId);
        temperaturaId = registro.temperaturaId;
      } else {
        const { data } = await createTemperaturaMuestra({
          temp1: registro.temperatura1 || 0,
          temp2: registro.temperatura2 || 0,
          temp3: registro.temperatura3 || 0,
        });
        console.log("Procesando registro3:", data.id);
        temperaturaId = data.id;
        registro.temperaturaId = temperaturaId; // Actualizar el registro con el nuevo ID
      }

      if (registro.conductividadId) {
        await updateConductividadMuestra(registro.conductividadId, {
          cond1: registro.conductividad1 || 0,
          cond2: registro.conductividad2 || 0,
          cond3: registro.conductividad3 || 0,
        });
        console.log("Procesando registro4:", registro.conductividadId);
        conductividadId = registro.conductividadId;
      } else {
        const { data } = await createConductividadMuestra({
          cond1: registro.conductividad1 || 0,
          cond2: registro.conductividad2 || 0,
          cond3: registro.conductividad3 || 0,
        });
        console.log("Procesando registro5:", data.id);
        conductividadId = data.id;
        registro.conductividadId = conductividadId; // Actualizar el registro con el nuevo ID
      }

      if (registro.temperaturaAireId) {
        await updateTemperaturaAire(registro.temperaturaAireId, {
          tempAire1: registro.temperaturaAmbiente1 || 0,
          tempAire2: registro.temperaturaAmbiente2 || 0,
          tempAire3: registro.temperaturaAmbiente3 || 0,
        });
        console.log("Procesando registro6:", registro.temperaturaAireId);
        temperaturaAireId = registro.temperaturaAireId;
      } else {
        const { data } = await createTemperaturaAire({
          tempAire1: registro.temperaturaAmbiente1 || 0,
          tempAire2: registro.temperaturaAmbiente2 || 0,
          tempAire3: registro.temperaturaAmbiente3 || 0,
        });
        console.log("Procesando registro7:", data.id);
        temperaturaAireId = data.id;
        registro.temperaturaAireId = temperaturaAireId; // Actualizar el registro con el nuevo ID
      }

      if (registro.tiempoId) {
        await updateTiempoMuestra(registro.tiempoId, {
          tiempo1: registro.tiempo1 || 0,
          tiempo2: registro.tiempo2 || 0,
          tiempo3: registro.tiempo3 || 0,
        });
        console.log("Procesando registro8:", registro.tiempoId);
        tiempoId = registro.tiempoId;
      } else {
        const { data } = await createTiempoMuestra({
          tiempo1: registro.tiempo1 || 0,
          tiempo2: registro.tiempo2 || 0,
          tiempo3: registro.tiempo3 || 0,
        });
        console.log("Procesando registro9:", data.id);
        tiempoId = data.id;
        registro.tiempoId = tiempoId; // Actualizar el registro con el nuevo ID
      }

      if (registro.volumenId) {
        await updateVolumenMuestra(registro.volumenId, {
          volumen1: registro.volumen1 || 0,
          volumen2: registro.volumen2 || 0,
          volumen3: registro.volumen3 || 0,
        });
        console.log("Procesando registro10:", registro.volumenId);
        volumenId = registro.volumenId;
      } else {
        const { data } = await createVolumenMuestra({
          volumen1: registro.volumen1 || 0,
          volumen2: registro.volumen2 || 0,
          volumen3: registro.volumen3 || 0,
        });
        console.log("Procesando registro11:", data.id);
        volumenId = data.id;
        registro.volumenId = volumenId; // Actualizar el registro con el nuevo ID
      }

      // 📌 Finalmente: Crear o actualizar la muestra principal
      const payload = {
        numero: registro.numero,
        hora: registro.hora?.format("HH:mm:ss") || "00:00:00",
        ph: phId,
        temperatura: temperaturaId,
        conductividad: conductividadId,
        temperaturaAire: temperaturaAireId,
        tiempoMuestra: tiempoId,
        volumenMuestra: volumenId,
        color: registro.color || "",
        olor: registro.olor || "",
        materiaFlotante: registro.materiaFlotante?.includes("PRESENTE"),
        solido: registro.solidos === "Sí",
        lluvia: registro.lluvia === "Sí",
        condicion: registro.condiciones,
        hojaCampo: hojaId,
      };
      console.log("registro:", registro);
      if (registro.id) {
        await updateMuestraHojaCampo(registro.id, payload);
      } else {
        await createMuestraHojaCampo(payload);
      }

    } catch (error) {
      console.error("Error procesando muestra:", registro, error);
    }
  }
  form.setFieldsValue({ registros: values.registros });
  return hojaId;
}


/* Helper opcional para leer el intermediario */

