import { useEffect, useMemo, useRef, useState } from "react";
import {
  Button,
  Card,
  Col,
  Form,
  Input,
  Row,
  Space,
  Switch,
  message,
  Modal,
  Select,
  Typography,
  Spin,
  Affix,
  Alert,
  Upload,
} from "antd";
import { buildRowsCByIndex } from "./mapperC";
import { useBeforeUnload, useNavigationPrompt } from "../../../hooks/DetectTabClosure";
import { useOnlineStatus } from "./useOnlineStatus";
import {
  clearDraft,
  downloadJsonFile,
  loadDraft,
  readJsonFile,
  saveDraft,
  validateImportedDraft,
} from "./draftImportExport";

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

export default function FormatoC({
  areasPorFila = [],
  initialData = null,
  onSave,
  onSaveOK,
  areasPunto = [],
}) {
  const [form] = Form.useForm();
  const compactItemStyle = { marginBottom: 8 };
  const smallInput = { size: "middle" };

  const [loading, setLoading] = useState(false);

  // ========= DIRTY + SUSPEND PROMPT =========
  const [isDirty, setIsDirty] = useState(false);
  const [suspendPrompt, setSuspendPrompt] = useState(false);

  useBeforeUnload(isDirty && !suspendPrompt);
  useNavigationPrompt(isDirty && !suspendPrompt);

  const hydratingRef = useRef(false);

  const { isMobile, isTablet } = useMedia();
  const cardWidth = isMobile ? "88vw" : isTablet ? 420 : 360;
  const isOnline = useOnlineStatus();
  const scopeId =
    initialData?.distribucion_ilum?.id ?? initialData?.distribucion_ilum?.iluminacion ?? "default";
  const [draftTick, setDraftTick] = useState(0);

  const existingRows = useMemo(() => {
    return Array.isArray(initialData?.dataTabla) ? initialData.dataTabla : [];
  }, [initialData]);

  const initialObservacion = useMemo(() => {
    return initialData?.distribucion_ilum?.observaciones ?? "";
  }, [initialData]);

  // ========= HIDRATAR FORM =========
  useEffect(() => {
    if (!Array.isArray(areasPorFila)) return;

    hydratingRef.current = true;
    setLoading(true);

    try {
      const rows = buildRowsCByIndex({
        areas: areasPorFila,
        existingRows,
        puntos: areasPunto,
      });

      form.setFieldsValue({
        rows,
        observacion: initialObservacion,
      });

      setIsDirty(false);

      const draft = loadDraft({ scopeId });
      if (draft?.values) {
        Modal.confirm({
          title: "Se encontró un respaldo local",
          content: "Hay un borrador guardado localmente. ¿Quieres restaurarlo?",
          okText: "Restaurar",
          cancelText: "Ignorar",
          onOk: () => {
            hydratingRef.current = true;
            form.setFieldsValue(draft.values);
            setTimeout(() => {
              hydratingRef.current = false;
            }, 0);
            setIsDirty(true);
            message.success("Borrador restaurado");
          },
        });
      }
    } catch (err) {
      console.error(err);
      message.error("Error al cargar datos");
    } finally {
      setLoading(false);
      setTimeout(() => {
        hydratingRef.current = false;
      }, 0);
    }
  }, [areasPorFila, areasPunto, existingRows, initialObservacion, form]);

  useEffect(() => {
    if (!isDirty) return;
    const t = setTimeout(() => {
      const values = form.getFieldsValue(true);
      saveDraft({ scopeId, values });
    }, 600);
    return () => clearTimeout(t);
  }, [draftTick, form, isDirty, scopeId]);

  // ========= GUARDAR REAL =========
  const onFinishReal = async (values) => {
    if (loading) return;

    setSuspendPrompt(true);
    setLoading(true);

    try {
      const rows = values?.rows ?? [];
      const observacion = values?.observacion ?? "";

      const ok = await onSave?.({ rows, observacion });

      if (ok) {
        message.success("FOR-M-001C guardado correctamente.");
        setIsDirty(false);
        clearDraft({ scopeId });
        setTimeout(() => onSaveOK?.(), 0);
      } else {
        setIsDirty(true);
      }
    } catch (err) {
      console.error(err);
      message.error("Error al guardar");
      setIsDirty(true);
    } finally {
      setLoading(false);
      setSuspendPrompt(false);
    }
  };

  // ========= CLICK GUARDAR (confirm) =========
  const handleGuardarClick = async () => {
    if (loading) return;

    let values;
    try {
      values = await form.validateFields();
    } catch {
      return;
    }

    setSuspendPrompt(true);

    Modal.confirm({
      title: "¿Estás seguro de enviar los datos?",
      content: "Verifica que toda la información esté completa antes de continuar.",
      okText: "Sí, enviar",
      cancelText: "Cancelar",
      onCancel: () => setSuspendPrompt(false),
      onOk: () => onFinishReal(values),
    });
  };

  const onExport = () => {
    const values = form.getFieldsValue(true);
    downloadJsonFile({
      filename: `FOR-M-001C_edit_${scopeId}_draft.json`,
      data: { version: 1, exportedAt: new Date().toISOString(), values },
    });
    message.success("Exportación generada");
  };

  const uploadProps = {
    accept: "application/json",
    showUploadList: false,
    beforeUpload: async (file) => {
      try {
        const payload = await readJsonFile(file);
        const result = validateImportedDraft(payload);
        if (!result.ok) {
          message.error(result.message);
          return Upload.LIST_IGNORE;
        }
        hydratingRef.current = true;
        form.setFieldsValue(result.values);
        setTimeout(() => {
          hydratingRef.current = false;
        }, 0);
        setIsDirty(true);
        setDraftTick((v) => v + 1);
        message.success("Datos importados al formulario");
      } catch {
        message.error("No se pudo leer el archivo JSON");
      }
      return Upload.LIST_IGNORE;
    },
  };

  return (
    <div style={ui.page}>
      <div style={ui.container}>
        {/* Header sticky */}
        <Card style={ui.headerCard} bodyStyle={{ padding: isMobile ? 12 : 16 }}>
          {!isOnline && (
            <div style={{ marginBottom: 12 }}>
              <Alert
                type="warning"
                showIcon
                message="Sin conexión a Internet"
                description="Tus cambios se están guardando localmente. Exporta el borrador si necesitas respaldo adicional."
              />
            </div>
          )}
          <Row gutter={[12, 12]} align="middle">
            <Col xs={24} lg={14}>
              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                <Title level={4} style={{ margin: 0 }}>
                  FOR-M-001C (Edición)
                </Title>
                <Text type="secondary">
                  {loading
                    ? "Guardando / cargando..."
                    : isDirty
                    ? "Tienes cambios sin guardar"
                    : "Sin cambios"}
                </Text>
              </div>
            </Col>

            <Col xs={24} lg={10} style={{ display: "flex", justifyContent: "flex-end" }}>
              <Space wrap style={{ width: isMobile ? "100%" : "auto", justifyContent: "flex-end" }}>
                <span style={styles.chip}>{isDirty ? "Cambios sin guardar" : "OK"}</span>

                <Button
                  type="primary"
                  onClick={handleGuardarClick}
                  loading={loading}
                  disabled={loading || !isDirty}
                  block={isMobile}
                >
                  Guardar cambios
                </Button>
                <Button onClick={onExport} disabled={loading} block={isMobile}>
                  Exportar
                </Button>
                <Upload {...uploadProps}>
                  <Button disabled={loading} block={isMobile}>
                    Importar
                  </Button>
                </Upload>
              </Space>
            </Col>
          </Row>
        </Card>

        <Spin spinning={loading}>
          <Form
            form={form}
            layout="vertical"
            disabled={loading}
            onValuesChange={() => {
              if (!hydratingRef.current) setIsDirty(true);
              if (!hydratingRef.current) setDraftTick((v) => v + 1);
            }}
          >
            {/* Carrusel horizontal (se mantiene) */}
            <Form.List name="rows">
              {(fields) => (
                <div style={ui.carouselWrap}>
                  {fields.map((field, idx) => (
                    <div key={field.key} style={{ ...ui.carouselItem, width: cardWidth }}>
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
                        <Form.Item name={[field.name, "id"]} hidden>
                          <Input />
                        </Form.Item>

                        <Form.Item label="Área de trabajo" name={[field.name, "areaTrabajo"]}>
                          <Input {...smallInput} disabled />
                        </Form.Item>

                        <Form.Item name={[field.name, "punto"]} hidden>
                          <Input />
                        </Form.Item>

                        <Form.Item label="Distribución de lámparas" name={[field.name, "distribucionlamparas"]}>
                          <Select
                            placeholder="Selecciona"
                            options={[
                              { value: "Disperso", label: "Disperso" },
                              { value: "Lineal", label: "Lineal" },
                              // { value: "Hileras", label: "Hileras" },
                            ]}
                          />
                        </Form.Item>

                        {/* Hileras vs Total */}
                        <Form.Item
                          noStyle
                          shouldUpdate={(prev, cur) =>
                            prev?.rows?.[field.name]?.distribucionlamparas !==
                            cur?.rows?.[field.name]?.distribucionlamparas
                          }
                        >
                          {({ getFieldValue }) => {
                            const dist = getFieldValue(["rows", field.name, "distribucionlamparas"]);
                            const isHileras = dist === "Lineal";

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

                        {/* ✅ Breakpoints reales */}
                        <Row gutter={[12, 8]}>
                          <Col xs={24} sm={12}>
                            <Form.Item label="Potencia" name={[field.name, "potenciaLampara"]}>
                              <Input placeholder="Ej: 18W" />
                            </Form.Item>
                          </Col>
                          <Col xs={24} sm={12}>
                            <Form.Item label="Tipo lámpara" name={[field.name, "tipoLampara"]}>
                              <Input placeholder="Ej: LED" />
                            </Form.Item>
                          </Col>
                        </Row>

                        {/* ✅ Switches ordenados */}
                        <div style={styles.switchGroup}>
                          <Form.Item
                            label="Iluminación Natural"
                            name={[field.name, "ilum_natural"]}
                            valuePropName="checked"
                            style={{ marginBottom: 0 }}
                          >
                            <Switch />
                          </Form.Item>

                          <Form.Item
                            label="Iluminación Artificial"
                            name={[field.name, "ilum_artificial"]}
                            valuePropName="checked"
                            style={{ marginBottom: 0 }}
                          >
                            <Switch />
                          </Form.Item>
                        </div>
                      </Card>
                    </div>
                  ))}
                </div>
              )}
            </Form.List>

            {/* Observación en Card */}
            <Card style={ui.sectionCard} bodyStyle={{ padding: isMobile ? 12 : 16 }}>
              <Form.Item label="Observación" name="observacion" style={{ marginBottom: 0 }}>
                <TextArea autoSize={{ minRows: 2, maxRows: 4 }} />
              </Form.Item>
            </Card>

            {/* Desktop: botón normal */}
            {!isMobile && !isTablet && (
              <div style={{ display: "flex", justifyContent: "flex-end" }}>
                <Button
                  type="primary"
                  loading={loading}
                  onClick={handleGuardarClick}
                  disabled={loading || !isDirty}
                  size="large"
                >
                  Guardar cambios
                </Button>
              </div>
            )}

            {/* Móvil/Tablet: botón sticky */}
            {(isMobile || isTablet) && (
              <Affix offsetBottom={12}>
                <Card style={ui.stickyCard} bodyStyle={{ padding: 12 }}>
                  <Button
                    block
                    type="primary"
                    loading={loading}
                    onClick={handleGuardarClick}
                    disabled={loading || !isDirty}
                  >
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

  // mantiene scroll horizontal
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
    maxWidth: 190,
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

  // switches más limpios
  switchGroup: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 12,
    padding: 10,
    borderRadius: 12,
    border: "1px solid #e6eaf2",
    background: "#fafcff",
    marginTop: 6,
  },
};
