import { useState } from "react";
import {
  createUbicacionTF,
  updateUbicacionTF,
  deleteUbicacionTF,
} from "../../../../apis/ApiCampo/TierrasFisicasApi";

/**
 * Hook personalizado para gestionar Ubicaciones
 * Maneja: crear, actualizar, eliminar ubicaciones
 */
export const useUbicacionesTF = () => {
  const [ubicacionesEliminadas, setUbicacionesEliminadas] = useState([]);

  /**
   * Eliminar una ubicación (marcar para eliminación o eliminar visualmente)
   */
  const eliminarUbicacion = (field, form, remove) => {
    // Obtener ubicaciones actuales
    const ubicaciones = form.getFieldValue("ubicaciones");
    const ubicacion = ubicaciones[field.name];

    // Si tiene id significa que existe en DB
    if (ubicacion?.id) {
      setUbicacionesEliminadas((prev) => [...prev, ubicacion.id]);
    }

    // Eliminar visualmente
    remove(field.name);
  };

  /**
   * Guardar todas las ubicaciones (create/update)
   */
  const guardarUbicaciones = async (values, reconocimientoID) => {
    if (!values.ubicaciones || values.ubicaciones.length === 0) {
      return;
    }

    const promesasUbicacion = values.ubicaciones.map(async (ubicacion) => {
      const payloadUbicacion = {
        reconocimientoTF: reconocimientoID,
        numeroPunto: ubicacion.numeroPunto,
        area: ubicacion.area,
        proceso: ubicacion.proceso,
        maquinaUbicacion: ubicacion.maquinaUbicacion,
        actividad: ubicacion.actividad,
        conexion: ubicacion.conexion,
      };

      // Si existe -> Update
      if (ubicacion.id) {
        return updateUbicacionTF(ubicacion.id, payloadUbicacion);
      }

      // Si no existe -> Create
      return createUbicacionTF(payloadUbicacion);
    });

    await Promise.all(promesasUbicacion);
  };

  /**
   * Eliminar ubicaciones marcadas para eliminación
   */
  const eliminarUbicacionesMarcadas = async () => {
    if (ubicacionesEliminadas.length === 0) {
      return;
    }

    const promesasEliminar = ubicacionesEliminadas.map((id) =>
      deleteUbicacionTF(id)
    );

    await Promise.all(promesasEliminar);
    setUbicacionesEliminadas([]);
  };

  /**
   * Agregar una nueva ubicación vacía
   */
  const agregarUbicacion = () => {
    return {
      conexion: false,
    };
  };

  return {
    ubicacionesEliminadas,
    eliminarUbicacion,
    guardarUbicaciones,
    eliminarUbicacionesMarcadas,
    agregarUbicacion,
  };
};