import { useEffect, useRef, useState } from "react";
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
import { flushSync } from "react-dom";
import { useBeforeUnload, useNavigationPrompt } from "../../../hooks/DetectTabClosure";

const { TextArea } = Input;
const { Title, Text } = Typography;

// --- mini hook para responsive (sin librerías extra) ---
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

export default function FormatoB({ areasPorFila = [], onFinishOK, areasPunto = [] }) {
  const [form] = Form.useForm();

  const compactItemStyle = { marginBottom: 10 };
  const [loading, setLoading] = useState(false);

  const [isDirty, setIsDirty] = useState(false);
  const [bypassPrompt, setBypassPrompt] = useState(false);

  const hydratingRef = useRef(false);

  const { isMobile, isTablet } = useMedia();

  const shouldBlock = isDirty && !loading && !bypassPrompt;
  useBeforeUnload(shouldBlock);
  useNavigationPrompt(shouldBlock);

  // 1) Precarga cards
  useEffect(() => {
    if (!Array.isArray(areasPorFila)) return;

    setLoading(true);
    try {
      hydratingRef.current = true;
      const puntos = Array.isArray(areasPunto) ? areasPunto : [];

      const rows = areasPorFila.map((area, idx) => ({
        areaTrabajo: area ?? "",
        tareas_visuales: "",
        puestos_trabajo: "",
        color_superficie: "",
        tipo_superficie: "",
        color_pared: "",
        tipo_pared: "",
        punto: puntos[idx],
      }));

      form.setFieldsValue({ rows });
      setIsDirty(false);
    } catch (error) {
      message.error("Error");
    } finally {
      setTimeout(() => {
        hydratingRef.current = false;
        setLoading(false);
      }, 0);
    }
  }, [areasPorFila, areasPunto, form]);

  const confirmarEnvio = (values) => {
    Modal.confirm({
      title: "¿Estás seguro de enviar los datos?",
      content: "Verifica que toda la información esté completa antes de continuar.",
      okText: "Sí, enviar",
      cancelText: "Cancelar",
      onOk: async () => {
        flushSync(() => {
          setBypassPrompt(true);
          setIsDirty(false);
        });
        await onFinish(values);
      },
      onCancel: () => setBypassPrompt(false),
    });
  };

  const onFinish = async (values) => {
    if (loading) return;
    setLoading(true);
    try {
      const rows = values?.rows ?? [];
      const observacion = values?.observacion ?? "";

      message.success("FOR-M-001B guardado correctamente.");
      onFinishOK?.(rows, observacion);
    } catch (err) {
      message.error("Error al guardar");
      setBypassPrompt(false);
      setIsDirty(true);
    } finally {
      setLoading(false);
    }
  };

  const tareasOptions = [
    { value: "En exteriores." },
    { value: "En Interiores." },
    { value: "En interiores." },
    { value: "Requerimiento visual simple." },
    { value: "Distinción moderada de detalles." },
    { value: "Distincion clara de detalles." },
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
                  FOR-M-001B
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
                  Guardar
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
              if (hydratingRef.current) return;
              setIsDirty(true);
            }}
          >
            {/* Carrusel horizontal (se queda porque te gusta) */}
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
                        {/* Área de trabajo */}
                        <Form.Item
                          label="Área de trabajo"
                          name={[field.name, "areaTrabajo"]}
                          style={compactItemStyle}
                        >
                          <Input size="middle" disabled />
                        </Form.Item>

                        <Form.Item name={[field.name, "punto"]} hidden>
                          <Input />
                        </Form.Item>

                        <Form.Item
                          label="Descripción de la tarea"
                          name={[field.name, "tareas_visuales"]}
                          style={compactItemStyle}
                        >
                          <AutoComplete options={tareasOptions} placeholder="Ej: inspección, lectura de etiquetas...">
                            <Input size="middle" />
                          </AutoComplete>
                        </Form.Item>

                        <Form.Item
                          label="Descripción del puesto"
                          name={[field.name, "puestos_trabajo"]}
                          style={compactItemStyle}
                        >
                          <TextArea placeholder="Ej: operador, supervisor..." autoSize={{ minRows: 1, maxRows: 2 }} />
                        </Form.Item>

                        <Row gutter={[12, 8]}>
                          <Col xs={24} sm={12}>
                            <Form.Item
                              label="Color superficie"
                              name={[field.name, "color_superficie"]}
                              style={compactItemStyle}
                            >
                              <Input size="middle" placeholder="Ej: gris" />
                            </Form.Item>
                          </Col>
                          <Col xs={24} sm={12}>
                            <Form.Item
                              label="Tipo superficie"
                              name={[field.name, "tipo_superficie"]}
                              style={compactItemStyle}
                            >
                              <Input size="middle" placeholder="Ej: concreto" />
                            </Form.Item>
                          </Col>
                        </Row>

                        <Row gutter={[12, 8]}>
                          <Col xs={24} sm={12}>
                            <Form.Item
                              label="Color pared"
                              name={[field.name, "color_pared"]}
                              style={compactItemStyle}
                            >
                              <Input size="middle" placeholder="Ej: blanco" />
                            </Form.Item>
                          </Col>
                          <Col xs={24} sm={12}>
                            <Form.Item
                              label="Tipo pared"
                              name={[field.name, "tipo_pared"]}
                              style={compactItemStyle}
                            >
                              <Input size="middle" placeholder="Ej: block, tablaroca" />
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
                <TextArea placeholder="..." autoSize={{ minRows: 2, maxRows: 4 }} />
              </Form.Item>
            </Card>

            {/* Footer desktop */}
            {!isMobile && !isTablet && (
              <div style={{ display: "flex", justifyContent: "flex-end" }}>
                <Button type="primary" htmlType="submit" loading={loading} disabled={loading || !isDirty} size="large">
                  Guardar
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

  // ✅ carrusel horizontal (se mantiene)
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
