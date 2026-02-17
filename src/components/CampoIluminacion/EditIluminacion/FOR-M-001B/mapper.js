// FOR-M-001B/mapper.js

export const buildRowsByIndex = ({ areas = [], existingRows = [], puntos =[] }) => {
  const a = Array.isArray(areas) ? areas : [];
  const ex = Array.isArray(existingRows) ? existingRows : [];

  return a.map((area, idx) => {
    const found = ex[idx]; // ✅ match por orden

    return {
      id: found?.id ?? null,
      areaTrabajo: String(area ?? "").trim(),
      punto: puntos[idx],
      tareas_visuales: found?.descripcionTareasVisuales ?? "",
      puestos_trabajo: found?.descripcionPunto ?? "",
      color_superficie: found?.superficieColor ?? "",
      tipo_superficie: found?.superficieTipo ?? "",
      color_pared: found?.paredColor ?? "",
      tipo_pared: found?.paredTipo ?? "",
    };
  });
};

export const rowHasAnyData = (row) => {
  return [
    row?.tareas_visuales,
    row?.puestos_trabajo,
    row?.color_superficie,
    row?.tipo_superficie,
    row?.color_pared,
    row?.tipo_pared,
  ].some((v) => String(v ?? "").trim() !== "");
};
