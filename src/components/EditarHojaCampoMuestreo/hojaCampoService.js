
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

async function createOrUpdate(submodelo, values, registro, fieldName, payloadBuilder) {
  if (registro[fieldName]) {
    await submodelo.update(registro[fieldName], payloadBuilder(registro));
    return registro[fieldName];
  } else {
    const { data } = await submodelo.create(payloadBuilder(registro));
    registro[fieldName] = data.id;
    return data.id;
  }
}
export async function saveHojaCampo(values, hojaId, form) {
  console.log("→ ID de cada registro:");
(values.registros || []).forEach((r, i) =>
  console.log(`Registro ${i + 1}: ID = ${r.id}`)
);

  console.log("Valores a guardar:", values);
  for (const registro of values.registros || []) {
    try {
      const phId = await createOrUpdate(
        { create: createPhMuestra, update: updatePhMuestra },
        values,
        registro,
        "phId",
        r => ({ ph1: r.ph1 || 0, ph2: r.ph2 || 0, ph3: r.ph3 || 0 })
      );

      const temperaturaId = await createOrUpdate(
        { create: createTemperaturaMuestra, update: updateTemperaturaMuestra },
        values,
        registro,
        "temperaturaId",
        r => ({ temp1: r.temperatura1 || 0, temp2: r.temperatura2 || 0, temp3: r.temperatura3 || 0 })
      );

      const conductividadId = await createOrUpdate(
        { create: createConductividadMuestra, update: updateConductividadMuestra },
        values,
        registro,
        "conductividadId",
        r => ({ cond1: r.conductividad1 || 0, cond2: r.conductividad2 || 0, cond3: r.conductividad3 || 0 })
      );

      const temperaturaAireId = await createOrUpdate(
        { create: createTemperaturaAire, update: updateTemperaturaAire },
        values,
        registro,
        "temperaturaAireId",
        r => ({
          tempAire1: r.temperaturaAmbiente1 || 0,
          tempAire2: r.temperaturaAmbiente2 || 0,
          tempAire3: r.temperaturaAmbiente3 || 0,
        })
      );

      const tiempoId = await createOrUpdate(
        { create: createTiempoMuestra, update: updateTiempoMuestra },
        values,
        registro,
        "tiempoId",
        r => ({ tiempo1: r.tiempo1 || 0, tiempo2: r.tiempo2 || 0, tiempo3: r.tiempo3 || 0 })
      );

      const volumenId = await createOrUpdate(
        { create: createVolumenMuestra, update: updateVolumenMuestra },
        values,
        registro,
        "volumenId",
        r => ({ volumen1: r.volumen1 || 0, volumen2: r.volumen2 || 0, volumen3: r.volumen3 || 0 })
      );
      console.log("registro", registro)
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
      console.log("payload:", payload);
      console.log("Registro:", registro);
      console.log("Registro ID:", registro.id);
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

