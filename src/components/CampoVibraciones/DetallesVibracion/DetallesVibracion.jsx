import React, { useState, useEffect, useCallback } from "react";
import { useParams } from "react-router-dom";
import { getDetallesVibraciones } from "../../../apis/ApiCampo/ApiVibraciones";
import {
  message,
  Spin,
  Button,
  Modal,
  Tag,
  Row,
  Col,
  Divider,
  Space,
} from "antd";
import {
  FileAddOutlined,
  EnvironmentOutlined,
  UserOutlined,
  ApartmentOutlined,
  NumberOutlined,
  CheckCircleFilled,
  CloseCircleFilled,
  DashboardOutlined,
  ToolOutlined,
} from "@ant-design/icons";

import FileVibraciones from "../FileVibraciones";
import FormCalibracion from "../FormCalibracion";
import FormVibrometro from "../FormVibrometro";
import "./DetallesVibracion.css";

/* ─── Subcomponentes ─── */
function InfoCard({ icon, label, children }) {
  return (
    <div className="dv-info-card">
      <div className="dv-info-card-header">
        <span className="dv-info-card-icon">{icon}</span>
        <span className="dv-info-card-label">{label}</span>
      </div>
      {children}
    </div>
  );
}

function FieldBlock({ label, value }) {
  return (
    <div className="dv-field-block">
      <span className="dv-field-label">{label}</span>
      <span className="dv-field-value">{value || "—"}</span>
    </div>
  );
}

/* ─── Componente principal ─── */
function DetallesVibracione() {
  const { id } = useParams();

  const [DetailsVibracion, setDetailsVibracion] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [isModalOpenVibrometro, setIsModalOpenVibrometro] = useState(false)
  const [isModalOpenCalibracion, setIsModalOpenCalibracion] = useState(false)

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await getDetallesVibraciones(id);
      setDetailsVibracion(res.data);
    } catch {
      message.error("No se pudieron cargar los detalles");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const nombreCompleto = `${DetailsVibracion?.clientenombre ?? ""} ${
    DetailsVibracion?.clienteapPaterno ?? ""
  } ${DetailsVibracion?.clienteapMaterno ?? ""}`.trim();

  const direccionCompleta = [
    DetailsVibracion?.calle,
    DetailsVibracion?.numero,
    DetailsVibracion?.colonia,
    DetailsVibracion?.divicion,
    DetailsVibracion?.codigoPostal && `C.P. ${DetailsVibracion.codigoPostal}`,
    DetailsVibracion?.ciudad,
    DetailsVibracion?.estado,
  ]
    .filter(Boolean)
    .join(", ");

  const tieneReconocimiento = DetailsVibracion?.tieneReconocimiento;

  return (
    <Spin spinning={loading} tip="Cargando detalles..." size="large">
      <div className="dv-page-container">
        <div className="dv-wrapper">
          {/* ── Hero ── */}
          <div className="dv-hero">
            <div className="dv-badge">
              <span className="dv-hero-dot" />
              Detalle de vibración
            </div>

            <h1 className="dv-hero-title">
              {DetailsVibracion?.codigo ?? "Sin código"}
            </h1>
            <p className="dv-hero-sub">
              Consulta la información técnica, ubicación y gestiona la documentación del servicio.
            </p>
          </div>

              <div className="dv-hero-actions">
                <Button
                  icon={<DashboardOutlined />}
                  onClick={() => setIsModalOpenVibrometro(true)}
                  className="dv-hero-btn dv-hero-btn--vibro"
                >
                  Vibrómetro
                </Button>
                <Button
                  icon={<ToolOutlined />}
                  onClick={() => setIsModalOpenCalibracion(true)}
                  className="dv-hero-btn dv-hero-btn--calib"
                >
                  Calibrador
                </Button>
              </div>
          {/* ── Body ── */}
          <div className="dv-body">
            <Row gutter={[24, 24]}>
              {/* Cliente */}
              <Col xs={24} md={12}>
                <InfoCard icon={<UserOutlined />} label="Cliente">
                  <FieldBlock label="Nombre completo" value={nombreCompleto || "Sin información"} />
                </InfoCard>
              </Col>

              {/* Empresa */}
              <Col xs={24} md={12}>
                <InfoCard icon={<ApartmentOutlined />} label="Empresa">
                  <FieldBlock label="Razón social" value={DetailsVibracion?.empresa || "Sin información"} />
                </InfoCard>
              </Col>

              {/* Dirección */}
              <Col xs={24} md={12}>
                <InfoCard icon={<EnvironmentOutlined />} label="Ubicación del Servicio">
                  <div className="dv-field-value" style={{ fontWeight: 400 }}>
                    {direccionCompleta || "Sin información de dirección"}
                  </div>
                </InfoCard>
              </Col>

              {/* Información Técnica */}
              <Col xs={24} md={12}>
                <InfoCard icon={<NumberOutlined />} label="Información Técnica">
                  <div className="dv-stats-grid">
                    <div className="dv-stat-chip">
                      <span className="dv-field-label">Código de Seguimiento</span>
                      <span className="dv-field-value" style={{ color: "#1677ff" }}>
                        {DetailsVibracion?.codigo ?? "—"}
                      </span>
                    </div>

                    <div className="dv-stat-chip">
                      <span className="dv-field-label">Estado de Reconocimiento</span>
                      <Tag
                        icon={
                          tieneReconocimiento
                            ? <CheckCircleFilled />
                            : <CloseCircleFilled />
                        }
                        color={tieneReconocimiento ? "success" : "default"}
                        style={{
                          borderRadius: 8,
                          padding: "4px 12px",
                          fontWeight: 600,
                          margin: 0,
                        }}
                      >
                        {tieneReconocimiento ? "RECONOCIDO" : "SIN RECONOCIMIENTO"}
                      </Tag>
                    </div>
                  </div>
                </InfoCard>
              </Col>
            </Row>

            <Divider style={{ margin: "24px 0" }} />

            <div className="dv-action-container">
              <Button
                type="primary"
                size="large"
                icon={<FileAddOutlined />}
                onClick={() => setIsModalOpen(true)}
                className="dv-action-btn"
              >
                Abrir Formulario de Vibraciones
              </Button>
            </div>
          </div>
        </div>

        {/* ── Modal ── */}
        <Modal
          title={
            <Space>
              <FileAddOutlined style={{ color: "#1677ff" }} />
              <span style={{ fontWeight: 700 }}>Gestión de Vibraciones</span>
            </Space>
          }
          open={isModalOpen}
          onCancel={() => setIsModalOpen(false)}
          footer={null}
          width={1200}
          centered
          destroyOnClose
          styles={{
            body: {
              background: "#f8fafc",
              padding: "24px",
              borderRadius: "0 0 12px 12px",
            },
            mask: {
              backdropFilter: "blur(4px)",
              background: "rgba(15, 23, 42, 0.4)",
            },
          }}
        >
          <FileVibraciones
            dataCliente={DetailsVibracion}
            idVibracion={id}
            onUploadSuccess={async () => {
              await fetchData();
              setIsModalOpen(false);
            }}
          />
        </Modal>

        {/* ── Modal Vibrometro ── */}
        <Modal
          title={
            <Space>
              <FileAddOutlined style={{ color: "#1677ff" }} />
              <span style={{ fontWeight: 700 }}>Gestión de Vibraciones</span>
            </Space>
          }
          open={isModalOpenVibrometro}
          onCancel={() => setIsModalOpenVibrometro(false)}
          footer={null}
          width={1200}
          centered
          destroyOnClose
          styles={{
            body: {
              background: "#f8fafc",
              padding: "24px",
              borderRadius: "0 0 12px 12px",
            },
            mask: {
              backdropFilter: "blur(4px)",
              background: "rgba(15, 23, 42, 0.4)",
            },
          }}
        >
          <FormVibrometro
            vibracionId={id}
            inventarioMaquinaId={DetailsVibracion?.inventarioMaquina}
            onSuccess={async () => {
              await fetchData();
              setIsModalOpenVibrometro(false);
            }}
          />
        </Modal>

                {/* ── Modal Calibracion ── */}
        <Modal
          title={
            <Space>
              <FileAddOutlined style={{ color: "#1677ff" }} />
              <span style={{ fontWeight: 700 }}>Gestión de Vibraciones</span>
            </Space>
          }
          open={isModalOpenCalibracion}
          onCancel={() => setIsModalOpenCalibracion(false)}
          footer={null}
          width={1200}
          centered
          destroyOnClose
          styles={{
            body: {
              background: "#f8fafc",
              padding: "24px",
              borderRadius: "0 0 12px 12px",
            },
            mask: {
              backdropFilter: "blur(4px)",
              background: "rgba(15, 23, 42, 0.4)",
            },
          }}
        >
          <FormCalibracion
            vibracionId={id}
            calibradorId={DetailsVibracion?.calibrador}
            onSuccess={async () => {
              await fetchData();
              setIsModalOpenCalibracion(false);
            }}
          />
        </Modal>
      </div>
    </Spin>
  );
}

export default DetallesVibracione;