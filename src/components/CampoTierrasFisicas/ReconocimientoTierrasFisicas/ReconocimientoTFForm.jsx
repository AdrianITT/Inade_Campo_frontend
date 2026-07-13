import React, { useEffect } from "react";
import { Form, Card, Button, Space, message } from "antd";
import { useParams, useNavigate } from "react-router-dom";

// Hooks personalizados
import { useReconocimientoTF } from "./hooks/useReconocimientoTF.js";
import { useUbicacionesTF } from "./hooks/useUbicacionesTF.js";

// Componentes
import DatosGenerales from "./components/DatosGenerales.jsx";
import UbicacionesSection from "./components/UbicacionesSection.jsx";

// Modales
import ModalExito from "../ModalTierrasFisicas/ModalCreacion";

/**
 * Componente Principal: ReconocimientoTFForm
 *
 * Gestiona:
 * - Creación y edición de Reconocimiento TF
 * - Gestión de ubicaciones (crear, actualizar, eliminar)
 * - Validación y envío de datos
 */
const ReconocimientoTFForm = () => {
  const [form] = Form.useForm();
  const { id } = useParams();
  const navigate = useNavigate();
  const [modalOpen, setModalOpen] = React.useState(false);
  const [submitting, setSubmitting] = React.useState(false);

  // ===================================
  // HOOKS PERSONALIZADOS
  // ===================================
  const {
    isEdit,
    reconocimientoId,
    loading,
    error,
    obtenerReconocimiento,
    guardarReconocimiento,
  } = useReconocimientoTF(id);

  const {
    ubicacionesEliminadas,
    eliminarUbicacion,
    guardarUbicaciones,
    eliminarUbicacionesMarcadas,
    agregarUbicacion,
  } = useUbicacionesTF();

  // ===================================
  // EFECTO: Cargar datos iniciales
  // ===================================
  useEffect(() => {
    const cargarDatos = async () => {
      const datos = await obtenerReconocimiento();
      if (datos) {
        form.setFieldsValue(datos);
      }
    };
    cargarDatos();
  }, [id]);

  // ===================================
  // HANDLERS
  // ===================================

  /**
   * Manejar eliminación de ubicación
   */
  const handleEliminarUbicacion = (field, remove) => {
    eliminarUbicacion(field, form, remove);
  };

  /**
   * Manejar envío del formulario
   */
  const handleFinish = async (values) => {
    try {
      setSubmitting(true);

      // 1. Guardar Reconocimiento
      const reconocimientoID = await guardarReconocimiento(values);

      // 2. Guardar Ubicaciones
      await guardarUbicaciones(values, reconocimientoID);

      // 3. Eliminar Ubicaciones marcadas
      await eliminarUbicacionesMarcadas();

      // 4. Reset formulario si es creación
      if (!isEdit) {
        form.resetFields();
      }

      // 5. Mostrar modal de éxito
      setModalOpen(true);

      // 6. Redirigir después de 400ms
      setTimeout(() => {
        navigate(`/DetallesTierrasFisicas/${id}`);
      }, 400);
    } catch (err) {
      console.error("Error:", err);
      message.error("Error al guardar los datos");
    } finally {
      setSubmitting(false);
    }
  };

  // ===================================
  // RENDERIZADO
  // ===================================

  if (loading) {
    return (
      <Card>
        <p style={{ textAlign: "center" }}>Cargando...</p>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <p style={{ textAlign: "center", color: "red" }}>
          Error: {error}
        </p>
      </Card>
    );
  }

  return (
    <>
      <Card
        title={
          isEdit
            ? "Editar Reconocimiento Tierras Físicas"
            : "Crear Reconocimiento Tierras Físicas"
        }
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleFinish}
        >
          {/* DATOS PRINCIPALES */}
          <DatosGenerales />

          {/* UBICACIONES */}
          <UbicacionesSection
            agregarUbicacion={agregarUbicacion}
            eliminarUbicacion={handleEliminarUbicacion}
          />

          {/* BOTONES */}
          <Space
            style={{
              marginTop: 20,
              width: "100%",
              justifyContent: "flex-end",
            }}
          >
            <Button
              type="primary"
              htmlType="submit"
              loading={submitting}
            >
              {isEdit ? "Actualizar" : "Guardar"}
            </Button>
          </Space>
        </Form>
      </Card>

      {/* MODAL DE ÉXITO */}
      <ModalExito
        visible={modalOpen}
        onClose={() => setModalOpen(false)}
      />
    </>
  );
};

export default ReconocimientoTFForm;