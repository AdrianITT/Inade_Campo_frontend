// FOR-M-001A/cardFactory.js
const makeEmptyRow = () => ({
  id: null, // ← id de tableCalculoZonas (si existe)
  areaTrabajo: "",
  largo: "",
  ancho: "",
  alto: "",
  coincide: false,
});

export const createEmptyCard = () => ({
  id: null, // ← id de zonaIluminacion (si existe)
  fechaMonitoreo: "",
  fechaPreliminar: "",
  rows: Array.from({ length: 15 }, () => makeEmptyRow()),
});

export const normalizeCardsFromApi = (apiData) => {
  // Soporta: {dataTabla:[...], calculoZona:{...}} o lista de cards o un solo card
  if (!apiData) return [];

  // ✅ Si tu API devuelve lista directa:
  if (Array.isArray(apiData)) return apiData;

  // ✅ Si tu API devuelve { cards: [...] }
  if (Array.isArray(apiData.cards)) return apiData.cards;

  // ✅ Si tu API devuelve un solo bloque:
  // { calculoZona: {id, fechaMonitoreo, fechaPreliminar}, dataTabla: [...] }
  if (apiData.calculoZona && Array.isArray(apiData.dataTabla)) {
    return [
      {
        id: apiData.calculoZona.id ?? null,
        fechaMonitoreo: apiData.calculoZona.fechaMonitoreo ?? "",
        fechaPreliminar: apiData.calculoZona.fechaPreliminar ?? "",
        rows: apiData.dataTabla.map((r) => ({
          id: r.id ?? null,
          areaTrabajo: r.areaTrabajo ?? "",
          largo: r.largo ?? "",
          ancho: r.ancho ?? "",
          alto: r.alto ?? "",
          coincide: String(r.puntoFocal ?? "").toUpperCase() === "SI",
        })),
      },
    ];
  }

  return [];
};
