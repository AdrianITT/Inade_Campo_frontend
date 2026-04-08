import React, { useState, useEffect, useCallback } from "react";
import { useParams } from "react-router-dom";
import { getDetallesVibraciones } from "../../../apis/ApiCampo/ApiVibraciones";
import {
  message,
  Spin,
  Button,
  Modal,
  Card,
  Typography,
  Space,
  Tag,
  Row,
  Col,
  Divider,
} from "antd";
import {
  FileAddOutlined,
  EnvironmentOutlined,
  UserOutlined,
  ApartmentOutlined,
  NumberOutlined,
  CheckCircleFilled,
  CloseCircleFilled,
  IdcardOutlined,
} from "@ant-design/icons";

import FileVibraciones from "../FileVibraciones";

const { Title, Text } = Typography;

/* ─── Estilos en objeto (sin CSS-in-JS externo) ─── */
const styles = {
  page: {
    minHeight: "100vh",
    background: "#f0f4f8",
    padding: "36px 16px",
    fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
  },
  wrapper: {
    maxWidth: 1060,
    margin: "0 auto",
  },

  /* Hero header */
  hero: {
    borderRadius: "20px 20px 0 0",
    background: "linear-gradient(135deg, #0f172a 0%, #1e3a5f 60%, #1677ff 100%)",
    padding: "36px 36px 28px",
    position: "relative",
    overflow: "hidden",
  },
  heroOrb: {
    position: "absolute",
    width: 280,
    height: 280,
    borderRadius: "50%",
    background: "rgba(22, 119, 255, 0.18)",
    right: -60,
    top: -80,
    pointerEvents: "none",
  },
  heroOrb2: {
    position: "absolute",
    width: 160,
    height: 160,
    borderRadius: "50%",
    background: "rgba(255,255,255,0.05)",
    left: 40,
    bottom: -50,
    pointerEvents: "none",
  },
  badge: {
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    background: "rgba(22,119,255,0.25)",
    border: "1px solid rgba(22,119,255,0.5)",
    borderRadius: 999,
    padding: "4px 14px",
    color: "#93c5fd",
    fontSize: 12,
    fontWeight: 600,
    letterSpacing: "0.06em",
    textTransform: "uppercase",
    marginBottom: 14,
  },
  heroDot: {
    width: 7,
    height: 7,
    borderRadius: "50%",
    background: "#3b82f6",
    display: "inline-block",
    boxShadow: "0 0 6px #3b82f6",
  },
  heroTitle: {
    color: "#fff",
    margin: "0 0 8px",
    fontSize: 30,
    fontWeight: 700,
    letterSpacing: "-0.5px",
  },
  heroSub: {
    color: "rgba(255,255,255,0.55)",
    fontSize: 14,
    margin: 0,
  },

  /* Body */
  body: {
    background: "#fff",
    borderRadius: "0 0 20px 20px",
    padding: "28px 28px 32px",
    boxShadow: "0 8px 32px rgba(15,23,42,0.08)",
  },

  /* Info card */
  infoCard: {
    borderRadius: 14,
    border: "1px solid #e8eef5",
    background: "#fafbfd",
    padding: "18px 20px",
    height: "100%",
    transition: "box-shadow 0.2s",
  },
  infoCardTitle: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    fontSize: 12,
    fontWeight: 700,
    letterSpacing: "0.07em",
    textTransform: "uppercase",
    color: "#64748b",
    marginBottom: 12,
  },
  infoCardIcon: {
    width: 28,
    height: 28,
    borderRadius: 8,
    background: "#eff6ff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#1677ff",
    fontSize: 13,
  },
  infoLabel: {
    fontSize: 11,
    fontWeight: 600,
    color: "#94a3b8",
    letterSpacing: "0.05em",
    textTransform: "uppercase",
    display: "block",
    marginBottom: 3,
  },
  infoValue: {
    fontSize: 15,
    fontWeight: 600,
    color: "#0f172a",
  },

  /* Stat chips row */
  statsRow: {
    display: "flex",
    gap: 12,
    flexWrap: "wrap",
    marginTop: 4,
  },
  statChip: {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-start",
    gap: 4,
    background: "#f8fafc",
    border: "1px solid #e2e8f0",
    borderRadius: 12,
    padding: "12px 18px",
    minWidth: 140,
    flex: "1 1 140px",
  },

  /* Action button */
  actionBtn: {
    background: "linear-gradient(135deg, #1677ff, #4096ff)",
    border: "none",
    borderRadius: 12,
    height: 46,
    paddingInline: 28,
    fontWeight: 700,
    fontSize: 14,
    boxShadow: "0 4px 14px rgba(22,119,255,0.35)",
    letterSpacing: "0.02em",
  },

  divider: {
    margin: "24px 0",
    borderColor: "#f1f5f9",
  },
};

/* ─── Subcomponentes ─── */
function InfoCard({ icon, label, children }) {
  return (
    <div style={styles.infoCard}>
      <div style={styles.infoCardTitle}>
        <span style={styles.infoCardIcon}>{icon}</span>
        {label}
      </div>
      {children}
    </div>
  );
}

function FieldBlock({ label, value }) {
  return (
    <div>
      <span style={styles.infoLabel}>{label}</span>
      <span style={styles.infoValue}>{value || "—"}</span>
    </div>
  );
}

/* ─── Componente principal ─── */
function DetallesVibracione() {
  const { id } = useParams();

  const [DetailsVibracion, setDetailsVibracion] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

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
    <Spin spinning={loading} tip="Cargando detalles...">
      <div style={styles.page}>
        <div style={styles.wrapper}>

          {/* ── Hero ── */}
          <div style={styles.hero}>
            <div style={styles.heroOrb} />
            <div style={styles.heroOrb2} />

            <div style={styles.badge}>
              <span style={styles.heroDot} />
              Detalle de vibración
            </div>

            <h1 style={styles.heroTitle}>
              {DetailsVibracion?.codigo ?? "Sin código"}
            </h1>
            <p style={styles.heroSub}>
              Consulta la información general y gestiona los archivos del formulario.
            </p>
          </div>

          {/* ── Body ── */}
          <div style={styles.body}>
            <Row gutter={[16, 16]}>

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
              <Col xs={24}>
                <InfoCard icon={<EnvironmentOutlined />} label="Dirección">
                  <span style={{ ...styles.infoValue, fontWeight: 400, color: "#334155" }}>
                    {direccionCompleta || "Sin información"}
                  </span>
                </InfoCard>
              </Col>

              {/* Información general */}
              <Col xs={24}>
                <InfoCard icon={<NumberOutlined />} label="Información general">
                  <div style={styles.statsRow}>
                    <div style={styles.statChip}>
                      <span style={styles.infoLabel}>Código</span>
                      <span style={{ ...styles.infoValue, color: "#1677ff" }}>
                        {DetailsVibracion?.codigo ?? "—"}
                      </span>
                    </div>

                    <div style={styles.statChip}>
                      <span style={styles.infoLabel}>Reconocimiento</span>
                      <Tag
                        icon={
                          tieneReconocimiento
                            ? <CheckCircleFilled />
                            : <CloseCircleFilled />
                        }
                        color={tieneReconocimiento ? "success" : "default"}
                        style={{ marginTop: 2, borderRadius: 6, fontWeight: 600 }}
                      >
                        {tieneReconocimiento ? "Sí" : "No"}
                      </Tag>
                    </div>

                    {/* <div style={styles.statChip}>
                      <span style={styles.infoLabel}>ID de registro</span>
                      <span style={{ ...styles.infoValue, fontFamily: "monospace", fontSize: 13 }}>
                        <IdcardOutlined style={{ marginRight: 5, color: "#94a3b8" }} />
                        {id}
                      </span>
                    </div> */}
                  </div>
                </InfoCard>
              </Col>
            </Row>

            <Divider style={styles.divider} />

            <Button
              type="primary"
              size="large"
              icon={<FileAddOutlined />}
              onClick={() => setIsModalOpen(true)}
              style={styles.actionBtn}
            >
              Cargar archivos y llenar formulario
            </Button>
          </div>
        </div>

        {/* ── Modal ── */}
        <Modal
          title={
            <Space>
              <FileAddOutlined />
              <span style={{ fontWeight: 700 }}>Formulario de vibraciones</span>
            </Space>
          }
          open={isModalOpen}
          onCancel={() => setIsModalOpen(false)}
          footer={null}
          width={1100}
          centered
          destroyOnClose
          styles={{
            body: {
              background: "#f0f4f8",
              padding: 24,
              borderRadius: 12,
            },
            header: {
              borderBottom: "1px solid #f1f5f9",
              paddingBottom: 12,
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
      </div>
    </Spin>
  );
}

export default DetallesVibracione;