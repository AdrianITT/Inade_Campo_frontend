// FOR-M-001C/mapperC.js

export const buildRowsCByIndex = ({ areas = [], existingRows = [], puntos=[] }) => {
  const a = Array.isArray(areas) ? areas : [];
  const ex = Array.isArray(existingRows) ? existingRows : [];

  return a.map((area, idx) => {
    const found = ex[idx];

    return {
      id: found?.id ?? null,
      areaTrabajo: String(area ?? "").trim(),
      punto: puntos[idx],
      hileraLamparas: found?.hileraLamparas ?? "",
      lamparaporhilera: found?.lamparaporhilera ?? "",
      distribucionlamparas: found?.distribucionlamparas ?? "",
      potenciaLampara: found?.potenciaLampara ?? "",
      tipoLampara: found?.tipoLampara ?? "",
      ilum_natural: !!found?.ilum_natural,
      ilum_artificial: !!found?.ilum_artificial,
      totalLamparas: found?.totalLamparas ?? "",
    };
  });
};

export const rowCHasAnyData = (row) => {
  return [
    row?.hileraLamparas,
    row?.lamparaporhilera,
    row?.distribucionlamparas,
    row?.potenciaLampara,
    row?.tipoLampara,
  ].some((v) => String(v ?? "").trim() !== "") || row?.ilum_natural || row?.ilum_artificial;
};
