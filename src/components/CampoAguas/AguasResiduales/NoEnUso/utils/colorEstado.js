// src/pages/AguasResiduales/GenerarOrden/utils/colorEstado.js
export function colorEstado(estado) {
  const e = (estado || "").toLowerCase();
  if (e.includes("inici")) return "processing";
  if (e.includes("complet")) return "green";
  if (e.includes("pend") || e.includes("espera")) return "warning";
  if (e.includes("cancel")) return "red";
  return "default";
}
