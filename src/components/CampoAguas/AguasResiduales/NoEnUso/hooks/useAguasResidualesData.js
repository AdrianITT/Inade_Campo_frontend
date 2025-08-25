// src/pages/AguasResiduales/GenerarOrden/hooks/useAguasResidualesData.js
import { useEffect, useState } from "react";
import { ByIdAguaResidualInforme } from "../../../../../apis/ApiCampo/AguaResidualInforme";
import { filterData } from "../utils/filters";

export default function useAguasResidualesData(organizationId, initialSearch = "") {
  const [ordenes, setOrdenes] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function fetchOrdenes() {
      try {
        setIsLoading(true);
        const response = await ByIdAguaResidualInforme(organizationId);
        const lista = (response?.data ?? []).map((item) => ({
          numero: item?.informe?.numero,
          id: item?.informe?.id,
          OTcodigo: item?.orden_trabajo?.codigo || "",
          contacto: item?.cliente?.nombre || "",
          receptor: item?.orden_trabajo?.receptor || "",
          direccion: item?.cliente?.direccion || "",
          nombreEmpresa: item?.empresa?.nombre || "",
          estado: item?.informe?.estado || "",
        }));

        if (!mounted) return;
        setOrdenes(lista);
        setFilteredData(filterData(lista, initialSearch));
      } catch (err) {
        console.error("Error al cargar las órdenes de trabajo:", err);
      } finally {
        if (mounted) setIsLoading(false);
      }
    }

    if (organizationId) fetchOrdenes();
    return () => { mounted = false; };
  }, [organizationId, initialSearch]);

  return { ordenes, filteredData, setFilteredData, isLoading };
}
