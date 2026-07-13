import { useState, useEffect } from "react";
import dayjs from "dayjs";
import {
  getReconocimientoTF,
  updateReconocimientoTF,
  createReconocimientoTF,
} from "../../../../apis/ApiCampo/TierrasFisicasApi";

/**
 * Hook personalizado para gestionar Reconocimiento TF
 * Maneja: cargar datos, edición, creación
 */
export const useReconocimientoTF = (id) => {
  const [isEdit, setIsEdit] = useState(false);
  const [reconocimientoId, setReconocimientoId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const obtenerReconocimiento = async () => {
    try {
      setLoading(true);
      const response = await getReconocimientoTF(id);
      const data = response.data.ubicacion;

      // Activar modo edición
      setIsEdit(true);
      setReconocimientoId(data.id);

      return {
        fechaMonitoreo: data.fechaMonitoreo
          ? dayjs(data.fechaMonitoreo)
          : null,
        direccion: data.direccon,
        observacion: data.observacion,
        ubicaciones: data.ubicacion?.map((item) => ({
          id: item.id,
          numeroPunto: item.numeroPunto,
          area: item.area,
          proceso: item.proceso,
          maquinaUbicacion: item.maquinaUbicacion,
          actividad: item.actividad,
          conexion: item.conexion,
        })),
      };
    } catch (err) {
      // Si es 404 significa que no existe
      if (err.response?.status === 404) {
        setIsEdit(false);
      } else {
        setError(err.message);
        console.error("Error al cargar datos:", err);
      }
      return null;
    } finally {
      setLoading(false);
    }
  };

  const guardarReconocimiento = async (values) => {
    try {
      const payloadReconocimiento = {
        tierraFisica: id,
        fechaMonitoreo: values.fechaMonitoreo
          ? values.fechaMonitoreo.format("YYYY-MM-DD")
          : null,
        observacion: values.observacion,
        direccion: values.direccion,
      };

      let reconocimientoID = reconocimientoId;

      if (isEdit) {
        await updateReconocimientoTF(
          reconocimientoID,
          payloadReconocimiento
        );
      } else {
        const responseReconocimiento = await createReconocimientoTF(
          payloadReconocimiento
        );
        reconocimientoID = responseReconocimiento.data.id;
      }

      return reconocimientoID;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  useEffect(() => {
    if (id) {
      obtenerReconocimiento();
    }
  }, [id]);

  return {
    isEdit,
    reconocimientoId,
    loading,
    error,
    obtenerReconocimiento,
    guardarReconocimiento,
  };
};