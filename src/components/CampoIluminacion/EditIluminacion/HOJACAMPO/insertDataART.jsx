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

// -------------------- Helpers --------------------
const cleanStr = (v) => {
  if (v === undefined || v === null) return "";
  return String(v).trim();
};

const toHHmmss = (t) => {
  if (!t) return null;
  if (typeof t === "string") return t.length === 5 ? `${t}:00` : t;
  if (dayjs.isDayjs(t)) return t.format("HH:mm:ss");

  const d = new Date(t);
  if (isNaN(d.getTime())) return null;
  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  const ss = String(d.getSeconds()).padStart(2, "0");
  return `${hh}:${mm}:${ss}`;
};

const toYYYYMMDD = (v) => {
  if (!v) return null;
  if (typeof v === "string") return v;
  if (dayjs.isDayjs(v)) return v.format("YYYY-MM-DD");
  const d = new Date(v);
  if (isNaN(d.getTime())) return null;
  return dayjs(d).format("YYYY-MM-DD");
};

const hasAny = (...vals) => vals.some((v) => cleanStr(v) !== "");

const isPuntoVacio = (p) => {
  const base =
    hasAny(p?.numeroPunto, p?.areaMonitoreo, p?.posicionTrabajo, p?.descripcionPunto, p?.nivelMinimo) ||
    !!p?.refl_paredes ||
    !!p?.refl_plano_trabajo;

  const lux =
    hasAny(p?.lux1E2, p?.lux2E2, p?.lux3E2, p?.lux1E1, p?.lux2E1, p?.lux3E1);

  return !(base || lux);
};

const shallowEqual = (a, b) => JSON.stringify(a ?? {}) === JSON.stringify(b ?? {});

const buildE2Payload = (p, puntoId) => {
  const a = cleanStr(p?.lux1E2);
  const b = cleanStr(p?.lux2E2);
  const c = cleanStr(p?.lux3E2);
  if (!hasAny(a, b, c)) return null;
  return { lux1E2: a || "0", lux2E2: b || "0", lux3E2: c || "0", punto: puntoId };
};

const buildE1Payload = (p, puntoId) => {
  const a = cleanStr(p?.lux1E1);
  const b = cleanStr(p?.lux2E1);
  const c = cleanStr(p?.lux3E1);
  if (!hasAny(a, b, c)) return null;
  return { lux1E1: a || "0", lux2E1: b || "0", lux3E1: c || "0", punto: puntoId };
};

// -------------------- MAIN --------------------
export const insertDataLuzART = async ({ payload, id, saveDataInitial }) => {
  try {
    // console.log("insertDataLuzART - payload:", payload, "id:", id, "saveDataInitial:", saveDataInitial);

    if (!payload || payload?.tipo !== "ART") {
      throw new Error("payload inválido (tipo ART requerido)");
    }

    const currentBlocks = Array.isArray(payload?.bloques) ? payload.bloques : [];
    const initialBlocks =
      Array.isArray(saveDataInitial?.bloquesART)
        ? saveDataInitial.bloquesART
        : (Array.isArray(saveDataInitial) ? saveDataInitial : []);

    // -------------------------------------------------
    // 1) DELETE bloques eliminados (por idHoja)
    // -------------------------------------------------
    const currentHojaIds = currentBlocks.map(b => b?.idHoja).filter(Boolean);
    const initialHojaIds = initialBlocks.map(b => b?.idHoja).filter(Boolean);

    const deletedHojaIds = initialHojaIds.filter(idHoja => !currentHojaIds.includes(idHoja));

    for (const idHojaDel of deletedHojaIds) {
      try {
        await deleteHojaCampoIlum(idHojaDel);
      } catch (err) {
        console.warn("⚠️ No se pudo borrar idHoja:", idHojaDel, err);
      }
    }

    // maps para lookup del bloque anterior
    const initialByIdHoja = new Map(initialBlocks.map(b => [b?.idHoja, b]));

    // -------------------------------------------------
    // helper: procesa un bloque (nuevo o existente)
    // -------------------------------------------------
    const processOneBlock = async ({ block, oldBlock }) => {
      const puntos = Array.isArray(block?.puntos) ? block.puntos : [];
      const oldPuntos = Array.isArray(oldBlock?.puntos) ? oldBlock.puntos : [];

      const horaIni = toHHmmss(block?.horaInicio);
      const horaFin = toHHmmss(block?.horaFinal);
      const fechaMon = toYYYYMMDD(block?.fechaMonitoreo);

      const hayPuntoConDatos = puntos.some((p) => !isPuntoVacio(p));
      const hayAlgo =
        hasAny(block?.observaciones, block?.turno) ||
        !!block?.influenciaLuz ||
        !!fechaMon ||
        !!horaIni ||
        !!horaFin ||
        hayPuntoConDatos;

      const existedIdHoja = block?.idHoja ?? oldBlock?.idHoja ?? null;
      const existedIdData = block?.id ?? oldBlock?.id ?? null;
      const yaExistia = !!(existedIdHoja || existedIdData);

      // ✅ CASO CLAVE: si existía y el usuario lo dejó vacío -> BORRAR hoja completa
      if (yaExistia && !hayAlgo && existedIdHoja) {
        await deleteHojaCampoIlum(existedIdHoja);
        return;
      }

      // si es nuevo y no hay nada -> no crear nada
      if (!yaExistia && !hayAlgo) return;

      // -------------------------------------------------
      // 1) HOJA CAMPO (create / update)
      // -------------------------------------------------
      const hojaPayload = {
        observacion: block?.observaciones ?? "",
        iluminacion: id,
        influenciaLuz: !!block?.influenciaLuz,
      };

      let idHoja = existedIdHoja;

      const hojaBefore = {
        observacion: oldBlock?.observaciones ?? oldBlock?.observacion ?? "",
        influenciaLuz: !!oldBlock?.influenciaLuz,
      };
      const hojaAfter = {
        observacion: hojaPayload.observacion,
        influenciaLuz: hojaPayload.influenciaLuz,
      };

      if (idHoja) {
        if (!shallowEqual(hojaBefore, hojaAfter)) {
          await updateHojaCampoIlum(idHoja, hojaPayload);
        }
      } else {
        const r = await createHojaCampoIlum(hojaPayload);
        idHoja = r?.data?.id;
      }

      if (!idHoja) throw new Error("No se pudo obtener idHoja");

      // -------------------------------------------------
      // 2) DATAMONITOREO ART (create / update)
      // -------------------------------------------------
      let idDataMonitoreo = block?.id ?? oldBlock?.id ?? null;

      const dataPayload = {
        tipo: "ART",
        hoja: idHoja,
        fechaMonitoreo: fechaMon,
        horaInicio: horaIni,
        horaFinal: horaFin,
        turno: block?.turno ?? "",
      };

      const dataBefore = {
        fechaMonitoreo: toYYYYMMDD(oldBlock?.fechaMonitoreo),
        horaInicio: toHHmmss(oldBlock?.horaInicio),
        horaFinal: toHHmmss(oldBlock?.horaFinal),
        turno: oldBlock?.turno ?? "",
      };
      const dataAfterCmp = {
        fechaMonitoreo: dataPayload.fechaMonitoreo,
        horaInicio: dataPayload.horaInicio,
        horaFinal: dataPayload.horaFinal,
        turno: dataPayload.turno,
      };

      if (idDataMonitoreo) {
        if (!shallowEqual(dataBefore, dataAfterCmp)) {
          await updateDataIluminacion(idDataMonitoreo, dataPayload);
        }
      } else {
        // regla: solo crear data si hay horas (si no, no hay dónde colgar puntos)
        if (horaIni && horaFin) {
          const cr = await creaeteDataIluminacion(dataPayload);
          idDataMonitoreo = cr?.data?.id;
        } else {
          // PERO si el usuario solo editó hoja (observación/influye) sin horas, ya quedó guardado arriba.
          return;
        }
      }

      if (!idDataMonitoreo) throw new Error("No se pudo obtener idDataMonitoreo");

      // -------------------------------------------------
      // 3) DELETE puntos borrados (diff por idrowtabla)
      // -------------------------------------------------
      const oldPointIds = oldPuntos.map(p => p?.idrowtabla).filter(Boolean);
      const newPointIds = puntos.map(p => p?.idrowtabla).filter(Boolean);

      const deletedPointIds = oldPointIds.filter(pid => !newPointIds.includes(pid));
      for (const pid of deletedPointIds) {
        await deleteTableHojaIlum(pid);
      }

      // -------------------------------------------------
      // 4) UPSERT puntos + lux
      // -------------------------------------------------
      for (let pi = 0; pi < puntos.length; pi++) {
        const p = puntos[pi] ?? {};
        if (!p?.idrowtabla && isPuntoVacio(p)) continue;

        const tablePayload = {
          numeroPunto: p?.numeroPunto ?? pi + 1,
          areaMonitoreo: p?.areaMonitoreo ?? "Area no Asignado",
          posicionTrabajo: p?.posicionTrabajo ?? "N/A",
          descripcionPunto: p?.descripcionPunto ?? "N/A",
          nivelMinimo: p?.nivelMinimo ?? "0",
          refl_paredes: !!p?.refl_paredes,
          refl_plano_trabajo: !!p?.refl_plano_trabajo,
          hojaCampo: idHoja,
        };

        let idrowtabla = p?.idrowtabla ?? null;
        const old = idrowtabla ? oldPuntos.find(x => x?.idrowtabla === idrowtabla) : null;

        const tableBefore = old
          ? {
              numeroPunto: old?.numeroPunto,
              areaMonitoreo: old?.areaMonitoreo,
              posicionTrabajo: old?.posicionTrabajo,
              descripcionPunto: old?.descripcionPunto,
              nivelMinimo: old?.nivelMinimo,
              refl_paredes: !!old?.refl_paredes,
              refl_plano_trabajo: !!old?.refl_plano_trabajo,
            }
          : null;

        const tableAfterCmp = {
          numeroPunto: tablePayload.numeroPunto,
          areaMonitoreo: tablePayload.areaMonitoreo,
          posicionTrabajo: tablePayload.posicionTrabajo,
          descripcionPunto: tablePayload.descripcionPunto,
          nivelMinimo: tablePayload.nivelMinimo,
          refl_paredes: tablePayload.refl_paredes,
          refl_plano_trabajo: tablePayload.refl_plano_trabajo,
        };

        if (idrowtabla) {
          if (!tableBefore || !shallowEqual(tableBefore, tableAfterCmp)) {
            await updateTableHojaIlum(idrowtabla, tablePayload);
          }
        } else {
          const rth = await createTableHojaIlum(tablePayload);
          idrowtabla = rth?.data?.id;
        }

        if (!idrowtabla) continue;

        // Lux E2
        const e2Payload = buildE2Payload(p, idrowtabla);
        if (e2Payload) {
          const beforeE2 = old
            ? { lux1E2: cleanStr(old?.lux1E2), lux2E2: cleanStr(old?.lux2E2), lux3E2: cleanStr(old?.lux3E2) }
            : null;
          const afterE2 = { lux1E2: String(e2Payload.lux1E2), lux2E2: String(e2Payload.lux2E2), lux3E2: String(e2Payload.lux3E2) };

          if (p?.idluxE2) {
            if (!beforeE2 || !shallowEqual(beforeE2, afterE2)) {
              await updateE2(p.idluxE2, e2Payload);
            }
          } else {
            await createE2(e2Payload);
          }
        }

        // Lux E1
        const e1Payload = buildE1Payload(p, idrowtabla);
        if (e1Payload) {
          const beforeE1 = old
            ? { lux1E1: cleanStr(old?.lux1E1), lux2E1: cleanStr(old?.lux2E1), lux3E1: cleanStr(old?.lux3E1) }
            : null;
          const afterE1 = { lux1E1: String(e1Payload.lux1E1), lux2E1: String(e1Payload.lux2E1), lux3E1: String(e1Payload.lux3E1) };

          if (p?.idluxE1) {
            if (!beforeE1 || !shallowEqual(beforeE1, afterE1)) {
              await updateE1(p.idluxE1, e1Payload);
            }
          } else {
            await createE1(e1Payload);
          }
        }
      }
    };

    // -------------------------------------------------
    // 2) Procesar TODOS los bloques actuales (edit + create)
    // -------------------------------------------------
    for (const block of currentBlocks) {
      const oldBlock = block?.idHoja ? (initialByIdHoja.get(block.idHoja) ?? {}) : {};
      await processOneBlock({ block, oldBlock });
    }

    message.success("ART guardado correctamente (delete + update + create)");
    return true;
  } catch (error) {
    console.error(error);
    message.error("Error al guardar ART");
    throw error;
  }
};
