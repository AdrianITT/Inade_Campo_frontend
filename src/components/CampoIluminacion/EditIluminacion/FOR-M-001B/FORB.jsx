import { useEffect, useMemo, useState, useRef } from "react";
import {
  Button,
  Card,
  Col,
  Form,
  Input,
  Row,
  Space,
  message,
  AutoComplete,
  Modal,
  Affix,
  Spin,
  Typography,
} from "antd";
import { buildRowsByIndex } from "./mapper";
import { useBeforeUnload, useNavigationPrompt } from "../../../hooks/DetectTabClosure";

const { TextArea } = Input;
const { Title, Text } = Typography;

// --- mini hook responsive (sin libs extra) ---
function useMedia() {
  const [w, setW] = useState(typeof window !== "undefined" ? window.innerWidth : 1200);

  useEffect(() => {
    const onResize = () => setW(window.innerWidth);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const isMobile = w <= 576;
  const isTablet = w > 576 && w <= 992;
  return { w, isMobile, isTablet };
}

export default function FormatoB({
  areasPorFila = [],
  initialData = null,
  onSave,
  onSaveOK,
  areasPunto = [],
}) {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const [isDirty, setIsDirty] = useState(false);
  useBeforeUnload(isDirty);
  useNavigationPrompt(isDirty);

  // ✅ evita dirty durante setFieldsValue
  const hydratingRef = useRef(false);

  const { isMobile, isTablet } = useMedia();

  const existingRows = useMemo(() => {
    return Array.isArray(initialData?.dataTabla) ? initialData.dataTabla : [];
  }, [initialData]);

  const initialObservacion = useMemo(() => {
    return (
      initialData?.reconocimiento_ilum?.observaciones ??
      initialData?.["reconocimiento_ilum "]?.observaciones ??
      ""
    );
  }, [initialData]);

  // ✅ Precarga edición
  useEffect(() => {
    if (!Array.isArray(areasPorFila)) return;

    setLoading(true);
    hydratingRef.current = true;

    try {
      const rows = buildRowsByIndex({
        areas: areasPorFila,
        existingRows,
        puntos: areasPunto,
      });

      form.setFieldsValue({
        rows,
        observacion: initialObservacion,
      });

      setIsDirty(false);
    } finally {
      setTimeout(() => {
        hydratingRef.current = false;
      }, 0);

      setLoading(false);
    }
  }, [areasPorFila, areasPunto, existingRows, initialObservacion, form]);

  // ✅ guardado real
  const doSave = async (values) => {
    if (loading) return;

    setLoading(true);
    try {
      const rows = values?.rows ?? [];
      const observacion = values?.observacion ?? "";

      const ok = await onSave?.({ rows, observacion });
      if (ok) {
        message.success("FOR-M-001B guardado correctamente.");
        setIsDirty(false);
        onSaveOK?.();
      }
    } catch (err) {
      console.error(err);
      message.error("Error al guardar.");
    } finally {
      setLoading(false);
    }
  };

  // ✅ confirm modal
  const confirmarEnvio = (values) => {
    if (loading) return;

    Modal.confirm({
      title: "¿Estás seguro de enviar los datos?",
      content: "Verifica que toda la información esté completa antes de continuar.",
      okText: "Sí, enviar",
      cancelText: "Cancelar",
      onOk: async () => {
        await doSave(values);
      },
    });
  };

  const tareasOptions = [
    { value: "En exteriores." },
    { value: "En Interiores." },
    { value: "Requerimiento visual simple." },
    { value: "Distinción moderada de detalles." },
    { value: "Distinción clara de detalles." },
    { value: "Distinción fina de detalle." },
    { value: "Alta exactitud en la distinción de detalles." },
    { value: "Alto grado de especialización en la distinción de detalles." },
  ];

  return (
    <div style={ui.page}>
      <div style={ui.container}>
        {/* Header sticky */}
        <Card style={ui.headerCard} bodyStyle={{ padding: isMobile ? 12 : 16 }}>
          <Row gutter={[12, 12]} align="middle">
            <Col xs={24} lg={14}>
              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                <Title level={4} style={{ margin: 0 }}>
                  FOR-M-001B (Edición)
                </Title>

                <Text type="secondary">
                  {loading ? "Cargando..." : isDirty ? "Tienes cambios sin guardar" : "Sin cambios"}
                </Text>
              </div>
            </Col>

            <Col xs={24} lg={10} style={{ display: "flex", justifyContent: "flex-end" }}>
              <Space wrap style={{ justifyContent: "flex-end", width: isMobile ? "100%" : "auto" }}>
                <span style={styles.chip}>{isDirty ? "Cambios sin guardar" : "OK"}</span>

                <Button
                  type="primary"
                  onClick={() => form.submit()}
                  loading={loading}
                  disabled={loading || !isDirty}
                  block={isMobile}
                >
                  Guardar cambios
                </Button>
              </Space>
            </Col>
          </Row>
        </Card>

        <Spin spinning={loading}>
          <Form
            form={form}
            layout="vertical"
            onFinish={confirmarEnvio}
            disabled={loading}
            onValuesChange={() => {
              if (!hydratingRef.current) setIsDirty(true);
            }}
          >
            {/* Carrusel horizontal (se mantiene) */}
            <Form.List name="rows">
              {(fields) => (
                <div style={ui.carouselWrap}>
                  {fields.map((field, idx) => (
                    <div
                      key={field.key}
                      style={{
                        ...ui.carouselItem,
                        width: isMobile ? "88vw" : 360,
                      }}
                    >
                      <Card
                        size="small"
                        title={
                          <div style={styles.cardTitleRow}>
                            <b style={{ fontSize: 13 }}>{`Área #${idx + 1}`}</b>
                            <span style={styles.badgeSoft}>
                              {form.getFieldValue(["rows", field.name, "areaTrabajo"]) || ""}
                            </span>
                          </div>
                        }
                        style={styles.card}
                        headStyle={styles.cardHead}
                        bodyStyle={styles.cardBody}
                      >
                        {/* ID oculto */}
                        <Form.Item name={[field.name, "id"]} hidden>
                          <Input />
                        </Form.Item>

                        <Form.Item label="Área de trabajo" name={[field.name, "areaTrabajo"]} style={{ marginBottom: 10 }}>
                          <Input size="middle" disabled />
                        </Form.Item>

                        <Form.Item name={[field.name, "punto"]} hidden>
                          <Input />
                        </Form.Item>

                        <Form.Item
                          label="Descripción de la tarea"
                          name={[field.name, "tareas_visuales"]}
                          style={{ marginBottom: 10 }}
                        >
                          <AutoComplete options={tareasOptions} placeholder="Ej: inspección, lectura de etiquetas...">
                            <Input size="middle" />
                          </AutoComplete>
                        </Form.Item>

                        <Form.Item
                          label="Descripción del puesto"
                          name={[field.name, "puestos_trabajo"]}
                          style={{ marginBottom: 10 }}
                        >
                          <TextArea autoSize={{ minRows: 1, maxRows: 2 }} />
                        </Form.Item>

                        <Row gutter={[12, 8]}>
                          <Col xs={24} sm={12}>
                            <Form.Item
                              label="Color superficie"
                              name={[field.name, "color_superficie"]}
                              style={{ marginBottom: 10 }}
                            >
                              <Input size="middle" />
                            </Form.Item>
                          </Col>
                          <Col xs={24} sm={12}>
                            <Form.Item
                              label="Tipo superficie"
                              name={[field.name, "tipo_superficie"]}
                              style={{ marginBottom: 10 }}
                            >
                              <Input size="middle" />
                            </Form.Item>
                          </Col>
                        </Row>

                        <Row gutter={[12, 8]}>
                          <Col xs={24} sm={12}>
                            <Form.Item label="Color pared" name={[field.name, "color_pared"]} style={{ marginBottom: 0 }}>
                              <Input size="middle" />
                            </Form.Item>
                          </Col>
                          <Col xs={24} sm={12}>
                            <Form.Item label="Tipo pared" name={[field.name, "tipo_pared"]} style={{ marginBottom: 0 }}>
                              <Input size="middle" />
                            </Form.Item>
                          </Col>
                        </Row>
                      </Card>
                    </div>
                  ))}
                </div>
              )}
            </Form.List>

            {/* Observación en card separada */}
            <Card style={ui.sectionCard} bodyStyle={{ padding: isMobile ? 12 : 16 }}>
              <Form.Item label="Observación" name="observacion" style={{ marginBottom: 0 }}>
                <TextArea autoSize={{ minRows: 2, maxRows: 4 }} />
              </Form.Item>
            </Card>

            {/* Footer desktop */}
            {!isMobile && !isTablet && (
              <div style={{ display: "flex", justifyContent: "flex-end" }}>
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={loading}
                  disabled={loading || !isDirty}
                  size="large"
                >
                  Guardar cambios
                </Button>
              </div>
            )}

            {/* Sticky acciones en móvil/tablet */}
            {(isMobile || isTablet) && (
              <Affix offsetBottom={12}>
                <Card style={ui.stickyCard} bodyStyle={{ padding: 12 }}>
                  <Button block type="primary" htmlType="submit" loading={loading} disabled={loading || !isDirty}>
                    Guardar cambios
                  </Button>
                </Card>
              </Affix>
            )}
          </Form>
        </Spin>
      </div>
    </div>
  );
}

const ui = {
  page: {
    padding: 12,
    background: "#f6f8fb",
    minHeight: "100%",
  },
  container: {
    width: "100%",
    maxWidth: 1100,
    margin: "0 auto",
    display: "flex",
    flexDirection: "column",
    gap: 12,
  },
  headerCard: {
    position: "sticky",
    top: 0,
    zIndex: 20,
    borderRadius: 14,
    border: "1px solid #e6eaf2",
    background: "rgba(246, 248, 251, 0.92)",
    backdropFilter: "blur(8px)",
  },

  // ✅ carrusel horizontal (igual que el otro)
  carouselWrap: {
    display: "flex",
    gap: 12,
    overflowX: "auto",
    paddingBottom: 8,
    scrollSnapType: "x mandatory",
    WebkitOverflowScrolling: "touch",
  },
  carouselItem: {
    flex: "0 0 auto",
    scrollSnapAlign: "start",
  },

  sectionCard: {
    borderRadius: 14,
    border: "1px solid #e6eaf2",
  },

  stickyCard: {
    borderRadius: 14,
    boxShadow: "0 6px 18px rgba(0,0,0,0.10)",
    border: "1px solid #e6eaf2",
  },
};

const styles = {
  card: {
    borderRadius: 14,
    border: "1px solid #e6eaf2",
    boxShadow: "0 8px 24px rgba(15, 23, 42, 0.05)",
    background: "#ffffff",
  },
  cardHead: {
    borderBottom: "1px solid #e6eaf2",
    padding: "8px 12px",
  },
  cardBody: {
    padding: 12,
  },
  chip: {
    fontSize: 12,
    color: "#475569",
    background: "#f1f5f9",
    padding: "4px 10px",
    borderRadius: 999,
    border: "1px solid #e2e8f0",
  },
  badgeSoft: {
    fontSize: 12,
    fontWeight: 600,
    color: "#374151",
    background: "#fafafa",
    border: "1px solid #eeeeee",
    padding: "2px 8px",
    borderRadius: 999,
  },
  cardTitleRow: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    flexWrap: "wrap",
  },
};
