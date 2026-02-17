import { message } from "antd";
import dayjs from "dayjs";
import {
  createHojaCampoIlum,
  creaeteDataIluminacion,
  createTableHojaIlum,
  createE2,
  createE1,
  updateHojaCampoIlum,
  updateDataIluminacion,
  updateTableHojaIlum,
  updateE2,
  updateE1,
  deleteTableHojaIlum,
  deleteHojaCampoIlum,
} from "../../../../apis/ApiCampo/IluminacionApi";

const ALLOW_NULL_TIME = true; // <- pon false si tu backend NO permite hora null

// -------------------- Helpers --------------------
const toHHmmss = (t) => {
  if (!t) return null;
  if (typeof t === "string") return t.length === 5 ? `${t}:00` : t;
  if (dayjs.isDayjs(t)) return t.format("HH:mm:ss");
  const d = new Date(t);
  if (isNaN(d.getTime())) return null;
  return dayjs(d).format("HH:mm:ss");
};

const timeFieldByIndex = (i) => {
  if (i === 0) return "horaInicio";
  if (i === 1) return "horaIntermediario";
  return "horaFinal";
};

const toYYYYMMDD = (v) => {
  if (!v) return null;

  // por si llega como [valor]
  if (Array.isArray(v)) v = v[0];

  if (dayjs.isDayjs(v)) return v.isValid() ? v.format("YYYY-MM-DD") : null;

  if (v instanceof Date) {
    if (isNaN(v.getTime())) return null;
    return dayjs(v).format("YYYY-MM-DD");
  }

  if (typeof v === "string") {
    // acepta varios formatos comunes + ISO
    const d = dayjs(v, ["YYYY-MM-DD", "DD-MM-YYYY", "DD/MM/YYYY", dayjs.ISO_8601], true);
    return d.isValid() ? d.format("YYYY-MM-DD") : null;
  }

  return null;
};


// ✅ IMPORTANTE: si llegan 6, 9, 12... usa index%3
const horaFieldFromIndex = (index) => timeFieldByIndex(index % 3);

const cleanStr = (v) => {
  if (v === undefined || v === null) return null;
  const s = String(v).trim();
  return s === "" ? null : s;
};
const hasAny = (...vals) => vals.some((v) => cleanStr(v) !== null);

const isPuntoVacio = (p) => {
  const baseHas =
    hasAny(p?.numeroPunto, p?.areaMonitoreo, p?.posicionTrabajo, p?.descripcionPunto, p?.nivelMinimo) ||
    !!p?.refl_paredes ||
    !!p?.refl_plano_trabajo;

  const luxHas =
    hasAny(p?.lux1E2, p?.lux2E2, p?.lux3E2, p?.lux1E1, p?.lux2E1, p?.lux3E1);

  return !(baseHas || luxHas);
};

const normBool = (v) => !!v;
const normStr = (v) => (cleanStr(v) ?? "");
const normNum = (v) => (v === null || v === undefined || v === "" ? "" : String(v));
const equalObj = (a, b) => JSON.stringify(a ?? {}) === JSON.stringify(b ?? {});
const findOldPoint = (blockInitial, idrowtabla) => {
  const arr = Array.isArray(blockInitial?.puntos) ? blockInitial.puntos : [];
  return arr.find((x) => x?.idrowtabla === idrowtabla) || null;
};

const buildLuxE2Payload = (p, puntoId) => {
  const a = cleanStr(p?.lux1E2);
  const b = cleanStr(p?.lux2E2);
  const c = cleanStr(p?.lux3E2);
  if (!hasAny(a, b, c)) return null;
  return { lux1E2: a ?? "0", lux2E2: b ?? "0", lux3E2: c ?? "0", punto: puntoId };
};

const buildLuxE1Payload = (p, puntoId) => {
  const a = cleanStr(p?.lux1E1);
  const b = cleanStr(p?.lux2E1);
  const c = cleanStr(p?.lux3E1);
  if (!hasAny(a, b, c)) return null;
  return { lux1E1: a ?? "0", lux2E1: b ?? "0", lux3E1: c ?? "0", punto: puntoId };
};

const luxE2Changed = (p, oldPoint) => {
  const after = { lux1E2: normStr(p?.lux1E2), lux2E2: normStr(p?.lux2E2), lux3E2: normStr(p?.lux3E2) };
  const before = { lux1E2: normStr(oldPoint?.lux1E2), lux2E2: normStr(oldPoint?.lux2E2), lux3E2: normStr(oldPoint?.lux3E2) };
  return !equalObj(before, after);
};

const luxE1Changed = (p, oldPoint) => {
  const after = { lux1E1: normStr(p?.lux1E1), lux2E1: normStr(p?.lux2E1), lux3E1: normStr(p?.lux3E1) };
  const before = { lux1E1: normStr(oldPoint?.lux1E1), lux2E1: normStr(oldPoint?.lux2E1), lux3E1: normStr(oldPoint?.lux3E1) };
  return !equalObj(before, after);
};

// -------------------- MAIN --------------------
export const insertDataIluminacionNAT = async ({ values, id, saveDataInitial }) => {
  try {
    // console.log("NAT values:", values, "id:", id, "saveDataInitial:", saveDataInitial);

    const currentBlocks = Array.isArray(values) ? values : [];
    const initialBlocks = Array.isArray(saveDataInitial) ? saveDataInitial : [];

    // 1) DELETE hojas eliminadas
    const currentHojaIds = currentBlocks.map(b => b?.idHoja).filter(Boolean);
    const initialHojaIds = initialBlocks.map(b => b?.idHoja).filter(Boolean);
    const deletedHojaIds = initialHojaIds.filter(idHoja => !currentHojaIds.includes(idHoja));

    for (const idHojaDel of deletedHojaIds) {
      try {
        await deleteHojaCampoIlum(idHojaDel);
      } catch (err) {
        console.warn("⚠️ NAT no se pudo borrar idHoja:", idHojaDel, err);
      }
    }

    const initialByIdHoja = new Map(initialBlocks.map(b => [b?.idHoja, b]));

    const processOneBlock = async ({ block, oldBlock, index }) => {
      // ✅ FIX: horaField con index%3
      const horaField = horaFieldFromIndex(index);
      const horaValor = toHHmmss(block?.[horaField]);

      const puntos = Array.isArray(block?.puntos) ? block.puntos : [];
      const oldPuntos = Array.isArray(oldBlock?.puntos) ? oldBlock.puntos : [];

      const hayPuntoConDatos = puntos.some(p => !isPuntoVacio(p));
      const hayAlgo =
        hasAny(block?.observaciones) ||
        !!block?.influenciaLuz ||
        !!horaValor ||
        hayPuntoConDatos;

      const existedIdHoja = block?.idHoja ?? oldBlock?.idHoja ?? null;
      const existedIdData = block?.idDataMonitoreo ?? oldBlock?.idDataMonitoreo ?? null;
      const yaExistia = !!(existedIdHoja || existedIdData);

      // existía y lo vaciaron -> borrar hoja completa
      if (yaExistia && !hayAlgo && existedIdHoja) {
        await deleteHojaCampoIlum(existedIdHoja);
        return;
      }
      if (!yaExistia && !hayAlgo) return;

      // 1) HOJA
      const hojaPayload = {
        observacion: block?.observaciones ?? "",
        iluminacion: id,
        influenciaLuz: !!block?.influenciaLuz,
      };

      let idHoja = existedIdHoja;

      const hojaBefore = {
        observacion: normStr(oldBlock?.observaciones ?? oldBlock?.observacion),
        influenciaLuz: normBool(oldBlock?.influenciaLuz),
      };
      const hojaAfter = {
        observacion: normStr(hojaPayload.observacion),
        influenciaLuz: normBool(hojaPayload.influenciaLuz),
      };

      if (idHoja) {
        if (!equalObj(hojaBefore, hojaAfter)) {
          await updateHojaCampoIlum(idHoja, hojaPayload);
        }
      } else {
        const r = await createHojaCampoIlum(hojaPayload);
        idHoja = r?.data?.id;
      }
      if (!idHoja) throw new Error("NAT: No se pudo obtener idHoja");

      // 2) DATAMONITOREO
      let idDataMonitoreo = existedIdData;
      const fechaValor = toYYYYMMDD(block?.fechaMonitoreo) ?? null;
      const fechaOld   = toYYYYMMDD(oldBlock?.fechaMonitoreo) ?? null;

      const dataBefore = { 
        fechaMonitoreo: fechaOld ?? null,
        [horaField]: toHHmmss(oldBlock?.[horaField]) ?? null,
      };
      const dataAfter = {
         [horaField]: horaValor ?? null,
         fechaMonitoreo: fechaValor ?? null,
        };

      // ✅ FIX: si hay puntos/observaciones/influencia y NO existe data, CREARLA
      const mustHaveData = !!idDataMonitoreo || !!horaValor || hayPuntoConDatos || hasAny(block?.observaciones) || !!block?.influenciaLuz;

      if (mustHaveData) {
        // si backend no permite null, mete default si hay puntos
        const finalHoraValor =
          horaValor ??
          (!ALLOW_NULL_TIME && hayPuntoConDatos ? "00:00:00" : null);

        const dataPayload = {
          tipo: "NAT",
          hoja: idHoja,
          fechaMonitoreo: fechaValor ??  fechaOld ?? null,
          ...(finalHoraValor ? { [horaField]: finalHoraValor } : {}),
        };

        if (idDataMonitoreo) {
          // update solo si cambió (ojo: si usas default, compáralo también)
          const cmpAfter = { [horaField]: finalHoraValor ?? null };
          if (!equalObj(dataBefore, cmpAfter)) {
            await updateDataIluminacion(idDataMonitoreo, dataPayload);
          }
        } else {
          const cr = await creaeteDataIluminacion(dataPayload);
          idDataMonitoreo = cr?.data?.id;
        }
      }

      // si no hay dataMonitoreo, no hay dónde colgar puntos
      if (!idDataMonitoreo) return;

      // 3) DELETE puntos borrados
      const oldIds = oldPuntos.map(p => p?.idrowtabla).filter(Boolean);
      const newIds = puntos.map(p => p?.idrowtabla).filter(Boolean);
      const deletedPointIds = oldIds.filter(pid => !newIds.includes(pid));
      for (const pid of deletedPointIds) await deleteTableHojaIlum(pid);

      // 4) UPSERT puntos + lux
      for (let idx = 0; idx < puntos.length; idx++) {
        const p = puntos[idx] ?? {};
        const idrowtablaExistente = p?.idrowtabla ?? null;
        if (!idrowtablaExistente && isPuntoVacio(p)) continue;

        const tablePayload = {
          numeroPunto: p?.numeroPunto ?? idx + 1,
          areaMonitoreo: p?.areaMonitoreo ?? "Area no asignada",
          posicionTrabajo: p?.posicionTrabajo ?? "N/A",
          descripcionPunto: p?.descripcionPunto ?? "N/A",
          nivelMinimo: p?.nivelMinimo ?? "0",
          refl_paredes: !!p?.refl_paredes,
          refl_plano_trabajo: !!p?.refl_plano_trabajo,
          hojaCampo: idHoja,
        };

        let idrowtabla = idrowtablaExistente;
        const oldPoint = idrowtabla ? findOldPoint(oldBlock, idrowtabla) : null;

        const tableBefore = oldPoint
          ? {
              numeroPunto: normNum(oldPoint?.numeroPunto),
              areaMonitoreo: normStr(oldPoint?.areaMonitoreo),
              posicionTrabajo: normStr(oldPoint?.posicionTrabajo),
              descripcionPunto: normStr(oldPoint?.descripcionPunto),
              nivelMinimo: normNum(oldPoint?.nivelMinimo),
              refl_paredes: normBool(oldPoint?.refl_paredes),
              refl_plano_trabajo: normBool(oldPoint?.refl_plano_trabajo),
            }
          : null;

        const tableAfter = {
          numeroPunto: normNum(tablePayload.numeroPunto),
          areaMonitoreo: normStr(tablePayload.areaMonitoreo),
          posicionTrabajo: normStr(tablePayload.posicionTrabajo),
          descripcionPunto: normStr(tablePayload.descripcionPunto),
          nivelMinimo: normNum(tablePayload.nivelMinimo),
          refl_paredes: normBool(tablePayload.refl_paredes),
          refl_plano_trabajo: normBool(tablePayload.refl_plano_trabajo),
        };

        if (idrowtabla) {
          if (!tableBefore || !equalObj(tableBefore, tableAfter)) {
            await updateTableHojaIlum(idrowtabla, tablePayload);
          }
        } else {
          const rth = await createTableHojaIlum(tablePayload);
          idrowtabla = rth?.data?.id;
        }

        if (!idrowtabla) continue;

        const e2Payload = buildLuxE2Payload(p, idrowtabla);
        if (e2Payload) {
          if (p?.idluxE2) {
            if (!oldPoint || luxE2Changed(p, oldPoint)) await updateE2(p.idluxE2, e2Payload);
          } else {
            await createE2(e2Payload);
          }
        }

        const e1Payload = buildLuxE1Payload(p, idrowtabla);
        if (e1Payload) {
          if (p?.idluxE1) {
            if (!oldPoint || luxE1Changed(p, oldPoint)) await updateE1(p.idluxE1, e1Payload);
          } else {
            await createE1(e1Payload);
          }
        }
      }
    };

    // Procesar todos los bloques actuales
    for (let i = 0; i < currentBlocks.length; i++) {
      const block = currentBlocks[i] ?? {};
      const oldBlock = block?.idHoja ? (initialByIdHoja.get(block.idHoja) ?? {}) : {};
      await processOneBlock({ block, oldBlock, index: i });
    }

    message.success("NAT guardado correctamente (delete + update + create)");
    return true;
  } catch (error) {
    console.error(error);
    message.error("Error al guardar NAT");
    throw error;
  }
};
