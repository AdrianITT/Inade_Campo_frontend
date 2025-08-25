// src/pages/AguasResiduales/GenerarOrden/utils/filters.js
export const unique = (arr) => [...new Set(arr.filter((x) => x != null && x !== ""))];

export function buildAntdFilters(values = []) {
  return unique(values).map((v) => ({ text: v, value: v }));
}

// Filtro de búsqueda global
export function filterData(data, text) {
  const q = (text || "").trim().toLowerCase();
  if (!q) return data;

  return data.filter((item) =>
    [
      item.numero,
      item.OTcodigo,
      item.contacto,
      item.receptor,
      item.direccion,
      item.nombreEmpresa,
      item.estado,
    ]
      .filter((v) => v !== null && v !== undefined)
      .some((v) => String(v).toLowerCase().includes(q))
  );
}
