import { useState, useEffect } from "react";
import { getTierrasFisicas } from "../../../../apis/ApiCampo/TierrasFisicasApi";

/**
 * Hook personalizado para gestionar el estado de Tierras Físicas
 * @param {string} id - ID de la tierra física
 * @returns {Object} Estado y datos de tierras físicas
 */
export const useTierrasFisicas = (id) => {
  const [reconocimientoTF, setReconocimientoTF] = useState(false);
  const [verificacionTF, setVerificacionTF] = useState(false);
  const [hojaCampoTF, setHojaCampoTF] = useState(false);
  const [genericData, setGenericData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const dataTF = await getTierrasFisicas(id);

        setReconocimientoTF(dataTF.data.reconocimiento);
        setVerificacionTF(dataTF.data.verificacion);
        setHojaCampoTF(dataTF.data.hojacampo);
        setGenericData(dataTF.data);
      } catch (err) {
        setError(err.message);
        console.error("Error al cargar datos:", err);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchData();
    }
  }, [id]);

  return {
    reconocimientoTF,
    verificacionTF,
    hojaCampoTF,
    genericData,
    loading,
    error,
  };
};