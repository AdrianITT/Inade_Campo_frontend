import React, { useState } from "react";
import { message, Button, Spin } from "antd";
import { DownloadOutlined, ArrowLeftOutlined } from "@ant-design/icons";
import { useParams, useNavigate } from "react-router-dom";

// Hooks personalizados
import { useTierrasFisicas } from "./hooks/useTierrasFisicas.js";
import { useDownloadExcel } from "./hooks/useDownloadExcel.js";

// Componentes
import FasesGrid from "./components/FasesGrid.jsx";

// Constantes
import { FASES_CONFIG } from "./constants.js";

import "./DetallesTF.css";

/**
 * Componente Principal: DetallesTierrasFisicas
 * 
 * Gestiona el flujo de trabajo de Tierras Físicas
 */
const DetallesTierrasFisicas = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [downloading, setDownloading] = useState(false);

  // Hooks personalizados
  const {
    reconocimientoTF,
    verificacionTF,
    hojaCampoTF,
    genericData,
    loading,
    error,
  } = useTierrasFisicas(id);

  const { downloadExcel } = useDownloadExcel();

  // Configuración de fases
  const fases = FASES_CONFIG(
    id,
    reconocimientoTF,
    verificacionTF,
    hojaCampoTF
  );

  // Handlers
  const handleNavigate = (fase) => {
    if (!fase.desbloqueado) {
      message.warning("Debes completar la fase anterior.");
      return;
    }
    navigate(fase.ruta);
  };

  const handleDownloadExcel = async () => {
    setDownloading(true);
    try {
      await downloadExcel(id);
      message.success("Descarga completada");
    } catch (err) {
      message.error("Error en la descarga");
    } finally {
      setDownloading(false);
    }
  };

  // Estados
  if (error) {
    return (
      <div className="detalles-layout">
        <div className="detalles-content">
          <div
            style={{
              textAlign: "center",
              padding: "60px 20px",
              color: "#d32f2f",
            }}
          >
            <h2>Error al cargar los datos</h2>
            <p>{error}</p>
            <Button onClick={() => navigate("/homeAguas")} type="primary">
              Volver atrás
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="detalles-layout">
        <div
          className="detalles-content"
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            minHeight: "60vh",
          }}
        >
          <Spin size="large" />
        </div>
      </div>
    );
  }

  return (
    <div className="detalles-layout">
      <div className="detalles-content">
        {/* HERO SECTION */}
        <div className="hero-section">
          <div className="hero-content">
            <h1 className="hero-title">Tierras Físicas</h1>
            <p className="hero-subtitle">
              Completa cada fase del proceso de validación
            </p>
            <div className="hero-actions">
              <Button
                type="primary"
                icon={<DownloadOutlined />}
                onClick={handleDownloadExcel}
                loading={downloading}
              >
                Descargar
              </Button>
              <Button icon={<ArrowLeftOutlined />} onClick={() => navigate("/CrearTF")}>
                Volver
              </Button>
            </div>
          </div>

          <div className="hero-info">
            <div className="info-item">
              <span className="info-label">Orden de Trabajo</span>
              <div className="info-value">{genericData?.OT || "—"}</div>
            </div>
            <div className="info-item">
              <span className="info-label">Total de Fases</span>
              <div className="info-value">{fases.length}</div>
            </div>
            <div className="info-item">
              <span className="info-label">Completadas</span>
              <div className="info-value">
                {fases.filter((f) => f.completado).length}
              </div>
            </div>
          </div>
        </div>

        {/* GRID DE FASES */}
        <div className="section">
          <h2 className="section-title">Fases del Proceso</h2>
          <FasesGrid fases={fases} onNavigate={handleNavigate} />
        </div>
      </div>
    </div>
  );
};

export default DetallesTierrasFisicas;