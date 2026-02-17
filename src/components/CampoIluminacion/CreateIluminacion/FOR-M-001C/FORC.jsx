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
  Switch,
  Modal,
  Select,
  Affix,
  Typography,
  Spin,
} from "antd";
import { useBeforeUnload, useNavigationPrompt } from "../../../hooks/DetectTabClosure";
import { flushSync } from "react-dom";

const { TextArea } = Input;
const { Title, Text } = Typography;

// --- mini hook responsive ---
function useMedia() {
  const [w, setW] = useState(typeof window !== "undefined" ? window.innerWidth : 1200);
  useEffect(() => {
    const onResize = () => setW(window.innerWidth);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);
  const isMobile = w <= 576;
  const isTablet = w > 576 && w <= 992;
  return { isMobile, isTablet, w };
}

export default function FormatoC({ areasPorFila = [], onFinishOK, areasPunto = [] }) {
  const [form] = Form.useForm();
  const compactItemStyle = { marginBottom: 8 };
  const smallInput = { size: "middle" }; // ✅ un poco mejor que small para UX
  const [loading, setLoading] = useState(false);

  const [isDirty, setIsDirty] = useState(false);
  const hydratingRef = useRef(false);
  const [bypassPrompt, setBypassPrompt] = useState(false);

  const { isMobile, isTablet } = useMedia();

  const shouldBlock = isDirty && !loading && !bypassPrompt;
  useBeforeUnload(shouldBlock);
  useNavigationPrompt(shouldBlock);

  // Precarga
  useEffect(() => {
    if (!Array.isArray(areasPorFila)) return;

    setLoading(true);
    const puntos = Array.isArray(areasPunto) ? areasPunto : [];

    hydratingRef.current = true;

    try {
      const rows = areasPorFila.map((area, idx) => ({
        areaTrabajo: area ?? "",
        hileraLamparas: "",
        lamparaporhilera: "",
        totalLamparas: "",
        distribucionlamparas: "",
        potenciaLampara: "",
        tipoLampara: "",
        ilum_natural: false,
        ilum_artificial: false,
        punto: puntos[idx],
      }));

      form.setFieldsValue({ rows });
      setIsDirty(false);
    } catch (err) {
      message.error("Error al cargar el formulario.");
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

      message.success("FOR-M-001C guardado correctamente.");
      onFinishOK?.(rows, observacion);

      setIsDirty(false);
      setBypassPrompt(false);
    } catch (err) {
      message.error("Error al guardar");
      setBypassPrompt(false);
      setIsDirty(true);
    } finally {
      setLoading(false);
    }
  };

  // ✅ ancho responsive por card (mantiene scroll horizontal)
  const cardWidth = isMobile ? "88vw" : isTablet ? 420 : 360;

  return (
    <div style={ui.page}>
      <div style={ui.container}>
        {/* Header sticky */}
        <Card style={ui.headerCard} bodyStyle={{ padding: isMobile ? 12 : 16 }}>
          <Row gutter={[12, 12]} align="middle">
            <Col xs={24} lg={14}>
              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                <Title level={4} style={{ margin: 0 }}>
                  FOR-M-001C
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
            <Form.List name="rows">
              {(fields) => (
                <div style={ui.carouselWrap}>
                  {fields.map((field, idx) => (
                    <div
                      key={field.key}
                      style={{
                        ...ui.carouselItem,
                        width: cardWidth,
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
                        <Form.Item label="Área de trabajo" name={[field.name, "areaTrabajo"]}>
                          <Input {...smallInput} disabled />
                        </Form.Item>

                        <Form.Item name={[field.name, "punto"]} hidden>
                          <Input />
                        </Form.Item>

                        <Form.Item
                          label="Distribución de lámparas"
                          name={[field.name, "distribucionlamparas"]}
                        >
                          <Select
                            placeholder="Selecciona"
                            options={[
                              { value: "Disperso", label: "Disperso" },
                              { value: "Hileras", label: "Hileras" },
                            ]}
                          />
                        </Form.Item>

                        {/* Condicional Hileras vs Total */}
                        <Form.Item
                          noStyle
                          shouldUpdate={(prev, cur) =>
                            prev?.rows?.[field.name]?.distribucionlamparas !==
                            cur?.rows?.[field.name]?.distribucionlamparas
                          }
                        >
                          {({ getFieldValue }) => {
                            const dist = getFieldValue(["rows", field.name, "distribucionlamparas"]);
                            const isHileras = dist === "Hileras";

                            return (
                              <>
                                {isHileras ? (
                                  <>
                                    <Form.Item
                                      label="Hileras de lámparas"
                                      name={[field.name, "hileraLamparas"]}
                                      style={compactItemStyle}
                                    >
                                      <Input placeholder="Ej: 4" />
                                    </Form.Item>

                                    <Form.Item
                                      label="Lámparas por hilera"
                                      name={[field.name, "lamparaporhilera"]}
                                      style={compactItemStyle}
                                    >
                                      <Input placeholder="Ej: 6" />
                                    </Form.Item>
                                  </>
                                ) : (
                                  <Form.Item
                                    label="Total de lámparas"
                                    name={[field.name, "totalLamparas"]}
                                    style={compactItemStyle}
                                  >
                                    <Input placeholder="Ej: 24" />
                                  </Form.Item>
                                )}
                              </>
                            );
                          }}
                        </Form.Item>

                        {/* ✅ responsive real: xs=24 sm=12 */}
                        <Row gutter={[12, 8]}>
                          <Col xs={24} sm={12}>
                            <Form.Item label="Potencia de lámparas" name={[field.name, "potenciaLampara"]}>
                              <Input placeholder="Ej: 18W" />
                            </Form.Item>
                          </Col>
                          <Col xs={24} sm={12}>
                            <Form.Item label="Tipo de lámparas" name={[field.name, "tipoLampara"]}>
                              <Input placeholder="Ej: LED" />
                            </Form.Item>
                          </Col>
                        </Row>

                        <Row gutter={[12, 8]}>
                          <Col xs={24} sm={12}>
                            <Form.Item
                              label="Iluminación natural"
                              name={[field.name, "ilum_natural"]}
                              valuePropName="checked"   // ✅ importante
                              style={{ marginBottom: 0 }}
                            >
                              <Switch />
                            </Form.Item>
                          </Col>

                          <Col xs={24} sm={12}>
                            <Form.Item
                              label="Iluminación artificial"
                              name={[field.name, "ilum_artificial"]}
                              valuePropName="checked"   // ✅ importante
                              style={{ marginBottom: 0 }}
                            >
                              <Switch />
                            </Form.Item>
                          </Col>
                        </Row>
                      </Card>
                    </div>
                  ))}
                </div>
              )}
            </Form.List>

            {/* Observación */}
            <Card style={ui.sectionCard} bodyStyle={{ padding: isMobile ? 12 : 16 }}>
              <Form.Item label="Observación" name="observacion" style={{ marginBottom: 0 }}>
                <TextArea placeholder="..." autoSize={{ minRows: 2, maxRows: 4 }} />
              </Form.Item>
            </Card>

            {/* Botón desktop */}
            {!isMobile && !isTablet && (
              <div style={{ display: "flex", justifyContent: "flex-end" }}>
                <Button type="primary" htmlType="submit" loading={loading} disabled={loading || !isDirty} size="large">
                  Guardar
                </Button>
              </div>
            )}

            {/* Sticky botón móvil/tablet */}
            {(isMobile || isTablet) && (
              <Affix offsetBottom={12}>
                <Card style={ui.stickyCard} bodyStyle={{ padding: 12 }}>
                  <Button block type="primary" htmlType="submit" loading={loading} disabled={loading || !isDirty}>
                    Guardar
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
    border: "1px solid #1677ff",
    boxShadow: "0 8px 24px rgba(15, 23, 42, 0.05)",
    background: "#ffffff",
  },
  cardHead: {
    borderBottom: "1px solid #1677ff",
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
    maxWidth: 180,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  cardTitleRow: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    flexWrap: "wrap",
  },
};
