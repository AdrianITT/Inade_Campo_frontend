import React, { useEffect, useRef, useState, useMemo } from "react";
import {
  AutoComplete,
  Button,
  Card,
  Col,
  Divider,
  Form,
  Input,
  InputNumber,
  Row,
  Space,
  Switch,
  TimePicker,
  Typography,
  message,
  DatePicker,
} from "antd";
import { PlusOutlined, DeleteOutlined } from "@ant-design/icons";
import TextArea from "antd/es/input/TextArea";
import { useBeforeUnload, useNavigationPrompt } from "../../../hooks/DetectTabClosure";
import PuntosExcelSheetART from "./hooK/hookART";

const { Text } = Typography;

const MAX_PUNTOS = 100;

const makeEmptyPunto = () => ({
  numeroPunto: null,
  areaMonitoreo: "",
  posicionTrabajo: "",
  descripcionPunto: "",
  refl_paredes: false,
  refl_plano_trabajo: false,
  lux1E2: "",
  lux2E2: "",
  lux3E2: "",
  lux1E1: "",
  lux2E1: "",
  lux3E1: "",
  nivelMinimo: null,
});

const makeEmptyBloqueART = () => ({
  fechaMonitoreo: null,
  horaInicio: null,
  horaFinal: null,
  turno: "",
  observaciones: "",
  puntos: [makeEmptyPunto()],
});

// ✅ Responsive (sin romper SSR)
const getIsSmall = () =>
  typeof window !== "undefined" &&
  window.matchMedia &&
  window.matchMedia("(max-width: 576px)").matches;

export default function FormHCArtificial({
  areasPorFila = [],
  onFinishOK,
  disabled = false,
  loading = false,
}) {
  const [form] = Form.useForm();

  // ✅ detectar móvil y reaccionar al resize
  const [isSmall, setIsSmall] = useState(getIsSmall());
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 576px)");
    const handler = () => setIsSmall(mq.matches);
    handler();
    mq.addEventListener?.("change", handler);
    return () => mq.removeEventListener?.("change", handler);
  }, []);

  const SZ = useMemo(
    () => ({
      btn: isSmall ? "middle" : "large",
      input: isSmall ? "middle" : "large",
      pad: isSmall ? 12 : 16,
      gap: isSmall ? 8 : 12,
    }),
    [isSmall]
  );

  // Collapses (si lo usas luego)
  const [activePuntoKeys, setActivePuntoKeys] = useState({ 0: ["0"] });

  // ✅ startAt por BLOQUE
  const [startAtByBloque, setStartAtByBloque] = useState({});
  const setStartBloque = (bloqueIdx, v) => {
    setStartAtByBloque((prev) => ({ ...prev, [bloqueIdx]: v ?? 1 }));
  };

  // ✅ contenedor tabla estilo excel (scroll + hint)
  const excelWrap = {
    border: "1px solid #e6eaf2",
    borderRadius: 14,
    background: "#fff",
    width: "100%",
    minWidth: 0,
    overflow: "hidden",
  };

  const excelScroller = {
    width: "100%",
    minWidth: 0,
    overflowX: "auto",
    overflowY: "hidden",
    WebkitOverflowScrolling: "touch",
    paddingBottom: 8,
    overscrollBehaviorX: "contain",
  };

  const swipeHint = {
    fontSize: 12,
    color: "#64748b",
    padding: "8px 12px",
    borderTop: "1px solid #e6eaf2",
    background: "#fff",
    display: "flex",
    justifyContent: "space-between",
    gap: 10,
    flexWrap: "wrap",
  };

  // Dirty
  const [isDirty, setIsDirty] = useState(false);
  useBeforeUnload(isDirty);
  useNavigationPrompt(isDirty);

  const hydratingRef = useRef(true);
  useEffect(() => {
    const t = setTimeout(() => (hydratingRef.current = false), 0);
    return () => clearTimeout(t);
  }, []);

  const initialValues = {
    bloquesART: [makeEmptyBloqueART()],
  };

  const handleValuesChange = () => {
    if (hydratingRef.current) return;
    setIsDirty(true);
  };

  const autoCompleteOptions = useMemo(() => {
    return (Array.isArray(areasPorFila) ? areasPorFila : [])
      .filter(Boolean)
      .map((a) => ({ value: String(a) }));
  }, [areasPorFila]);

  // ✅ agrega N puntos a un BLOQUE
  const addNPointsToBloque = (bloqueIdx, n = 5) => {
    const bloques = form.getFieldValue("bloquesART") || [];
    const puntos = Array.isArray(bloques?.[bloqueIdx]?.puntos)
      ? [...bloques[bloqueIdx].puntos]
      : [];

    const canAdd = Math.min(n, MAX_PUNTOS - puntos.length);
    if (canAdd <= 0) {
      message.warning(`Máximo ${MAX_PUNTOS} puntos por bloque.`);
      return;
    }

    for (let j = 0; j < canAdd; j++) puntos.push(makeEmptyPunto());

    form.setFields([{ name: ["bloquesART", bloqueIdx, "puntos"], value: puntos }]);
    message.success(`Se agregaron ${canAdd} puntos al bloque #${bloqueIdx + 1}.`);
  };

  // ✅ autonumerar numeroPunto en un BLOQUE
  const autonumerarBloque = (bloqueIdx, startAt = 1) => {
    const bloques = form.getFieldValue("bloquesART") || [];
    const puntos = Array.isArray(bloques?.[bloqueIdx]?.puntos)
      ? bloques[bloqueIdx].puntos
      : [];

    if (!puntos.length) return;

    const fields = [];
    for (let pi = 0; pi < puntos.length; pi++) {
      fields.push({
        name: ["bloquesART", bloqueIdx, "puntos", pi, "numeroPunto"],
        value: (startAt ?? 1) + pi,
      });
    }

    form.setFields(fields);
    message.success(`Numeración aplicada al bloque #${bloqueIdx + 1}.`);
  };

  const onFinish = (values) => {
    const bloques = Array.isArray(values?.bloquesART) ? values.bloquesART : [];

    for (let i = 0; i < bloques.length; i++) {
      const b = bloques[i] || {};
      if (!b?.fechaMonitoreo) {
        message.warning(`Bloque #${i + 1}: Falta Fecha de Monitoreo.`);
        return;
      }
      if (!b?.horaInicio || !b?.horaFinal) {
        message.warning(`Bloque #${i + 1}: Falta Hora inicio o Hora final.`);
        return;
      }
      if (!String(b?.turno || "").trim()) {
        message.warning(`Bloque #${i + 1}: Falta Turno.`);
        return;
      }
    }

    const payload = {
      tipo: "ART",
      bloques: bloques.map((b) => ({
        fechaMonitoreo: b?.fechaMonitoreo ? b.fechaMonitoreo.format("YYYY-MM-DD") : null,
        horaInicio: b?.horaInicio ? b.horaInicio.format("HH:mm") : null,
        horaFinal: b?.horaFinal ? b.horaFinal.format("HH:mm") : null,
        turno: b?.turno ?? "",
        observaciones: b?.observaciones ?? "",
        puntos: Array.isArray(b?.puntos) ? b.puntos : [],
      })),
    };

    onFinishOK?.(payload);
    message.success("Formulario ART listo (multi-bloques).");
    setIsDirty(false);
  };

  return (
    <div style={ui.page(isSmall)}>
      <Form
        form={form}
        layout="vertical"
        initialValues={initialValues}
        onFinish={onFinish}
        disabled={disabled}
        onValuesChange={handleValuesChange}
      >
        {/* Header sticky */}
        <div style={ui.header}>
          <div style={ui.headerLeft}>
            <div style={ui.title}>Hoja de Campo</div>
            <div style={ui.subtitle}>Luz Artificial (ART) — Multi-bloques</div>
          </div>

          <div style={ui.headerRight}>
            <span style={styles.chip}>{isDirty ? "Cambios sin guardar" : "Sin cambios"}</span>

            <Button
              type="primary"
              size={SZ.btn}
              htmlType="submit"
              loading={loading}
              style={isSmall ? ui.saveBtnMobile : ui.saveBtn}
              disabled={disabled || loading || !isDirty}
            >
              Guardar cambios
            </Button>
          </div>
        </div>

        <Divider style={ui.divider} />

        {/* LISTA DE BLOQUES ART */}
        <Form.List name="bloquesART">
          {(bloqueFields, { add: addBloque, remove: removeBloque }) => (
            <>
              {/* toolbar */}
              <div style={ui.toolbar}>
                <div style={ui.toolbarLeft}>
                  <Button
                    type="primary"
                    ghost
                    size={SZ.btn}
                    icon={<PlusOutlined />}
                    onClick={() => {
                      addBloque(makeEmptyBloqueART());
                      setTimeout(() => {
                        const last = bloqueFields.length;
                        setActivePuntoKeys((prev) => ({ ...prev, [last]: ["0"] }));
                      }, 0);
                    }}
                  >
                    Agregar bloque ART
                  </Button>

                  <span style={styles.chip}>Total bloques: {bloqueFields.length}</span>
                </div>

                <Text type="secondary">Captura por bloques y puntos</Text>
              </div>

              <div style={{ display: "grid", gap: 12, minWidth: 0 }}>
                {bloqueFields.map((bloqueField, bloqueIdx) => (
                  <Card
                    key={bloqueField.key}
                    style={{ ...styles.card, minWidth: 0 }}
                    bodyStyle={{ padding: SZ.pad, minWidth: 0 }}
                    title={
                      <div style={ui.cardTitleRow}>
                        <b>Hoja de Campo #{bloqueIdx + 1}</b>
                        <Button
                          danger
                          size={SZ.btn}
                          icon={<DeleteOutlined />}
                          disabled={bloqueFields.length === 1}
                          onClick={() => {
                            removeBloque(bloqueField.name);
                            setActivePuntoKeys((prev) => {
                              const next = { ...prev };
                              delete next[bloqueIdx];
                              return next;
                            });
                          }}
                        >
                          Quitar
                        </Button>
                      </div>
                    }
                  >
                    {/* Header fields del bloque */}
                    <Row gutter={[SZ.gap, 8]}>
                      <Col xs={24} sm={12} lg={8}>
                        <Form.Item
                          label="Fecha de Monitoreo"
                          name={[bloqueField.name, "fechaMonitoreo"]}
                          rules={[{ required: true, message: "Requerido" }]}
                        >
                          <DatePicker size={SZ.input} style={{ width: "100%" }} />
                        </Form.Item>
                      </Col>

                      <Col xs={24} sm={12} lg={8}>
                        <Form.Item
                          label="Hora inicio"
                          name={[bloqueField.name, "horaInicio"]}
                          rules={[{ required: true, message: "Requerido" }]}
                        >
                          <TimePicker size={SZ.input} format="HH:mm" style={{ width: "100%" }} />
                        </Form.Item>
                      </Col>

                      <Col xs={24} sm={12} lg={8}>
                        <Form.Item
                          label="Hora final"
                          name={[bloqueField.name, "horaFinal"]}
                          rules={[{ required: true, message: "Requerido" }]}
                        >
                          <TimePicker size={SZ.input} format="HH:mm" style={{ width: "100%" }} />
                        </Form.Item>
                      </Col>

                      <Col xs={24} sm={12} lg={8}>
                        <Form.Item
                          label="Turno"
                          name={[bloqueField.name, "turno"]}
                          rules={[{ required: true, message: "Requerido" }]}
                        >
                          <Input size={SZ.input} placeholder="Ej: Matutino / Vespertino / Nocturno" />
                        </Form.Item>
                      </Col>

                      <Col xs={24} sm={12} lg={16}>
                        <Form.Item label="Observaciones" name={[bloqueField.name, "observaciones"]}>
                          <TextArea
                            placeholder="Ej: Observaciones del bloque..."
                            autoSize={{ minRows: 2, maxRows: 4 }}
                          />
                        </Form.Item>
                      </Col>
                    </Row>

                    <Divider style={ui.dividerSoft} />

                    <div style={ui.sectionRow}>
                      <div style={ui.sectionTitle}>Puntos de muestreo</div>
                      <span style={styles.chip}>
                        Total:{" "}
                        {Array.isArray(form.getFieldValue(["bloquesART", bloqueField.name, "puntos"]))
                          ? form.getFieldValue(["bloquesART", bloqueField.name, "puntos"]).length
                          : 0}
                      </span>
                    </div>

                    <div style={{ height: 10 }} />

                    {/* PUNTOS DENTRO DE CADA BLOQUE */}
                    <Form.List name={[bloqueField.name, "puntos"]}>
                      {(fields, { add, remove }) => (
                        <>
                          {/* Toolbar puntos responsive */}
                          <Space style={{ marginBottom: 12, width: "100%" }} wrap>
                            <Button
                              type="default"
                              size={SZ.btn}
                              icon={<PlusOutlined />}
                              onClick={() => {
                                if (fields.length >= MAX_PUNTOS) {
                                  return message.warning(`Máximo ${MAX_PUNTOS} puntos por bloque.`);
                                }
                                add(makeEmptyPunto());
                                setTimeout(() => {
                                  const last = fields.length;
                                  setActivePuntoKeys((prev) => ({ ...prev, [bloqueIdx]: [String(last)] }));
                                }, 0);
                              }}
                              disabled={disabled || fields.length >= MAX_PUNTOS}
                            >
                              Agregar punto
                            </Button>

                            <Button
                              size={SZ.btn}
                              disabled={disabled || fields.length >= MAX_PUNTOS}
                              onClick={() => addNPointsToBloque(bloqueIdx, 5)}
                            >
                              +5
                            </Button>

                            <Button
                              size={SZ.btn}
                              disabled={disabled || fields.length >= MAX_PUNTOS}
                              onClick={() => addNPointsToBloque(bloqueIdx, 10)}
                            >
                              +10
                            </Button>

                            <Space wrap style={{ width: isSmall ? "100%" : "auto" }}>
                              <InputNumber
                                size={SZ.input}
                                min={1}
                                style={{ width: isSmall ? "100%" : 120 }}
                                value={startAtByBloque[bloqueIdx] ?? 1}
                                onChange={(v) => setStartBloque(bloqueIdx, v)}
                                disabled={disabled}
                              />

                              <Button
                                size={SZ.btn}
                                style={{ width: isSmall ? "100%" : "auto" }}
                                disabled={disabled || fields.length === 0}
                                onClick={() => autonumerarBloque(bloqueIdx, startAtByBloque[bloqueIdx] ?? 1)}
                              >
                                Autonumerar
                              </Button>
                            </Space>

                            <span style={styles.chip}>Total: {fields.length}</span>
                          </Space>

                          {/* Excel scroll */}
                          <div style={{ maxWidth: "100%", minWidth: 0 }}>
                            <div style={excelWrap}>
                              <div style={excelScroller}>
                                {/* ✅ fuerza overflow en móvil para swipe */}
                                <div style={{ display: "inline-block", minWidth: isSmall ? 1200 : "auto" }}>
                                  <PuntosExcelSheetART
                                    puntoFields={fields}
                                    bloqueField={bloqueField}
                                    bloqueIdx={bloqueIdx}
                                    onRemovePoint={(pName) => remove(pName)}
                                    autoCompleteOptions={autoCompleteOptions}
                                    form={form}
                                    disabled={disabled}
                                    compact={isSmall} // (si tu hook lo usa, mejor)
                                  />
                                </div>
                              </div>

                              <div style={swipeHint}>
                                <span>Desliza lateralmente para ver todas las columnas</span>
                                <span>
                                  <b>Tip:</b> Tab / Shift+Tab
                                </span>
                              </div>
                            </div>
                          </div>
                        </>
                      )}
                    </Form.List>
                  </Card>
                ))}
              </div>

              {/* ✅ BARRA INFERIOR PEGADA A PANTALLA */}
              <div style={ui.bottomBar}>
                <div style={ui.bottomBarInner}>
                  <span style={styles.chip}>
                    {isDirty ? "Cambios sin guardar" : "Sin cambios"}
                  </span>

                  <Button
                    type="primary"
                    size={SZ.btn}
                    htmlType="submit"
                    loading={loading}
                    disabled={disabled || loading || !isDirty}
                    style={{ width: isSmall ? "100%" : 260 }}
                    block={isSmall}
                  >
                    Guardar cambios
                  </Button>
                </div>
              </div>
            </>
          )}
        </Form.List>
      </Form>
    </div>
  );
}

const ui = {
  page: (isSmall) => ({
    padding: 16,
    background: "#f6f8fb",
    minHeight: "100%",
    overflowX: "hidden",
    paddingBottom: isSmall ? 96 : 92, // ✅ para que la barra inferior no tape contenido
  }),

  header: {
    position: "sticky",
    top: 0,
    zIndex: 20,
    background: "rgba(246, 248, 251, 0.92)",
    backdropFilter: "blur(8px)",
    border: "1px solid #e6eaf2",
    borderRadius: 16,
    padding: 14,
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 12,
    marginBottom: 12,
    flexWrap: "wrap",
  },

  headerLeft: {
    minWidth: 0,
    flex: "1 1 240px",
  },

  headerRight: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    flex: "1 1 260px",
    justifyContent: "flex-end",
    flexWrap: "wrap",
  },

  saveBtn: { width: "auto" },
  saveBtnMobile: { width: "100%" },

  title: { fontSize: 18, fontWeight: 800, color: "#0f172a", lineHeight: 1.1 },
  subtitle: { fontSize: 13, color: "#64748b", marginTop: 2 },

  toolbar: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    marginBottom: 12,
    flexWrap: "wrap",
  },

  toolbarLeft: {
    display: "flex",
    gap: 10,
    flexWrap: "wrap",
    alignItems: "center",
  },

  sectionRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
    flexWrap: "wrap",
  },

  sectionTitle: { fontWeight: 800, color: "#0f172a" },

  divider: { margin: "12px 0", borderColor: "#e6eaf2" },
  dividerSoft: { margin: "10px 0", borderColor: "#e6eaf2" },

  cardTitleRow: {
    width: "100%",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 10,
    flexWrap: "wrap",
  },

  // ✅ barra inferior sticky a viewport
  bottomBar: {
    position: "fixed",
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 50,
    padding: "10px 12px calc(10px + env(safe-area-inset-bottom))",
    background: "rgba(246, 248, 251, 0.92)",
    backdropFilter: "blur(10px)",
    borderTop: "1px solid #e6eaf2",
  },

  bottomBarInner: {
    maxWidth: 1100,
    margin: "0 auto",
    display: "flex",
    gap: 12,
    justifyContent: "flex-end",
    alignItems: "center",
    flexWrap: "wrap",
  },
};

const styles = {
  card: {
    borderRadius: 16,
    border: "1px solid #e6eaf2",
    boxShadow: "0 8px 24px rgba(15, 23, 42, 0.05)",
    background: "#ffffff",
  },

  chip: {
    fontSize: 12,
    color: "#475569",
    background: "#f1f5f9",
    padding: "4px 10px",
    borderRadius: 999,
    border: "1px solid #e2e8f0",
  },
};
