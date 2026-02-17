import React, { useMemo, useEffect, useState, useRef } from "react";
import {
  Button,
  Card,
  Col,
  Form,
  Input,
  InputNumber,
  Row,
  Space,
  Switch,
  TimePicker,
  Typography,
  message,
  Divider,
  DatePicker,
  Tabs,
  Collapse,
} from "antd";
import TextArea from "antd/es/input/TextArea";
import { PlusOutlined, DeleteOutlined } from "@ant-design/icons";
import { useBeforeUnload, useNavigationPrompt } from "../../../hooks/DetectTabClosure";
import PuntosExcelSheet from "./hooK/hookNAT";

const { Text } = Typography;

const MAX_PUNTOS = 100;

const SHARED_POINT_FIELDS = new Set([
  "numeroPunto",
  "areaMonitoreo",
  "posicionTrabajo",
  "descripcionPunto",
]);

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

// Etiquetas (solo UI)
const BLOQUES = [
  { key: 0, label: "Inicio", timeField: "horaInicio" },
  { key: 1, label: "Intermedia", timeField: "horaIntermediario" },
  { key: 2, label: "Final", timeField: "horaFinal" },
];

// ✅ Responsive (sin romper SSR)
const getIsSmall = () =>
  typeof window !== "undefined" &&
  window.matchMedia &&
  window.matchMedia("(max-width: 576px)").matches;

export default function FormNAT({
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

  const [activeSetKey, setActiveSetKey] = useState("0");
  const [startAtBySet, setStartAtBySet] = useState({});

  const [openPanelsBySet, setOpenPanelsBySet] = useState({});
  const pointsWrapRef = useRef({});
  const pointsScrollLeftRef = useRef({});
  const normalizeKeys = (k) => (Array.isArray(k) ? k : k ? [k] : []);

  const [isDirty, setIsDirty] = useState(false);
  useBeforeUnload(isDirty);
  useNavigationPrompt(isDirty);
  

  const hydratingRef = useRef(true);

  const autoCompleteOptions = useMemo(() => {
  const raw = areasPorFila;

  const arr = Array.isArray(raw) ? raw : raw ? [raw] : [];

  return arr
    .filter((x) => x !== null && x !== undefined && String(x).trim() !== "")
    .map((x) => {
      // si ya viene como {value: ...} lo respetamos
      if (typeof x === "object" && x.value) return x;
      return { value: String(x) };
    });
}, [areasPorFila]);


  // Tabs: que NO rompan layout
  const tabWrap = {
    borderRadius: 12,
    border: "1px solid #e6eaf2",
    background: "#fff",
    padding: isSmall ? 6 : 8,
    overflow: "hidden",
    minWidth: 0,
    maxWidth: "100%",
  };

  // Scroll HORIZONTAL solo para tabla
  const pointsWrap = {
    width: "100%",
    maxWidth: "100%",
    minWidth: 0,
    overflowX: "auto",
    overflowY: "hidden",
    borderRadius: 12,
    border: "1px solid #e6eaf2",
    background: "#fff",
    WebkitOverflowScrolling: "touch",
    paddingBottom: 8,
    overscrollBehaviorX: "contain",
    contain: "layout paint",
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

  // --- helpers sets ---
  const getSetStart = (blockIndex) => Math.floor(blockIndex / 3) * 3;
  const getTotalSets = (totalBlocks) => Math.max(1, Math.ceil(totalBlocks / 3));
  const calcSetIndexFromTotalBlocks = (totalBlocks) =>
    Math.max(0, Math.ceil(totalBlocks / 3) - 1);

  const safeSetField = (namePath, value) => {
    if (!form) return;
    form.setFields([{ name: namePath, value }]);
  };

  const safeSetManyFields = (fields) => {
    if (!form) return;
    form.setFields(fields);
  };

  const ensurePointExists = (bloques, blockIndex, pointIndex) => {
    const b = bloques?.[blockIndex] ?? {};
    const puntos = Array.isArray(b.puntos) ? [...b.puntos] : [];
    while (puntos.length <= pointIndex) puntos.push(makeEmptyPunto());
    return puntos;
  };

  const restorePointsScroll = (panelKey) => {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        const el = pointsWrapRef.current[panelKey];
        if (!el) return;
        el.scrollLeft = pointsScrollLeftRef.current[panelKey] ?? 0;
      });
    });
  };

  const syncSharedPointField = (fromBlockIndex, pointIndex, field, value) => {
    if (!SHARED_POINT_FIELDS.has(field)) return;

    const start = getSetStart(fromBlockIndex);
    const targets = [start, start + 1, start + 2].filter((i) => i !== fromBlockIndex);

    const bloques = form.getFieldValue("bloques") || [];
    const fieldsToSet = [];

    for (const bi of targets) {
      const puntos = ensurePointExists(bloques, bi, pointIndex);
      fieldsToSet.push({ name: ["bloques", bi, "puntos"], value: puntos });
      fieldsToSet.push({ name: ["bloques", bi, "puntos", pointIndex, field], value });
    }

    safeSetManyFields(fieldsToSet);
  };

  const addPointToSet = (blockIndex) => {
    const start = getSetStart(blockIndex);
    const bloques = form.getFieldValue("bloques") || [];

    const lengths = [0, 1, 2].map((k) => (bloques[start + k]?.puntos || []).length);
    const maxLen = Math.max(...lengths);

    if (maxLen >= MAX_PUNTOS) {
      message.warning(`Máximo ${MAX_PUNTOS} puntos por bloque.`);
      return;
    }

    for (const bi of [start, start + 1, start + 2]) {
      const puntos = Array.isArray(bloques[bi]?.puntos) ? [...bloques[bi].puntos] : [];
      puntos.push(makeEmptyPunto());
      safeSetField(["bloques", bi, "puntos"], puntos);
    }
  };

  const addNPointsToSet = (blockIndex, n = 5) => {
    const start = getSetStart(blockIndex);
    const bloques = form.getFieldValue("bloques") || [];

    const lengths = [0, 1, 2].map((k) => (bloques[start + k]?.puntos || []).length);
    const maxLen = Math.max(...lengths);

    const canAdd = Math.min(n, MAX_PUNTOS - maxLen);
    if (canAdd <= 0) {
      message.warning(`${MAX_PUNTOS} puntos por bloque.`);
      return;
    }

    for (const bi of [start, start + 1, start + 2]) {
      const puntos = Array.isArray(bloques[bi]?.puntos) ? [...bloques[bi].puntos] : [];
      for (let j = 0; j < canAdd; j++) puntos.push(makeEmptyPunto());
      safeSetField(["bloques", bi, "puntos"], puntos);
    }

    message.success(`Se agregaron ${canAdd} puntos al set.`);
  };

  const autonumerarSet = (blockIndex, startAt = 1) => {
    const start = getSetStart(blockIndex);
    const bloques = form.getFieldValue("bloques") || [];

    const len = Math.max(
      (bloques[start]?.puntos || []).length,
      (bloques[start + 1]?.puntos || []).length,
      (bloques[start + 2]?.puntos || []).length
    );

    const fields = [];
    for (const bi of [start, start + 1, start + 2]) {
      for (let pi = 0; pi < len; pi++) {
        fields.push({
          name: ["bloques", bi, "puntos", pi, "numeroPunto"],
          value: startAt + pi,
        });
      }
    }

    safeSetManyFields(fields);
    message.success("Numeración aplicada al set.");
  };

  const setStart = (setIndex, v) =>
    setStartAtBySet((prev) => ({ ...prev, [setIndex]: v ?? 1 }));

  const removePointFromSet = (blockIndex, pointIndex) => {
    const start = getSetStart(blockIndex);
    const bloques = form.getFieldValue("bloques") || [];

    const lengths = [0, 1, 2].map((k) => (bloques[start + k]?.puntos || []).length);
    const minLen = Math.min(...lengths);

    if (minLen <= 1) {
      message.warning("No puedes borrar el último punto del set.");
      return;
    }

    for (const bi of [start, start + 1, start + 2]) {
      const puntos = Array.isArray(bloques[bi]?.puntos) ? [...bloques[bi].puntos] : [];
      puntos.splice(pointIndex, 1);
      safeSetField(["bloques", bi, "puntos"], puntos);
    }
  };

  useEffect(() => {
    const t = setTimeout(() => {
      hydratingRef.current = false;
    }, 0);
    return () => clearTimeout(t);
  }, []);

  const makeEmptyBloqueNAT = () => ({
    tipo: "NAT",
    observaciones: "",
    fechaMonitoreo: null,
    hora: null,
    puntos: [makeEmptyPunto()],
    InfluyeLuz: false,
  });

  const initialValues = useMemo(
    () => ({
      bloques: BLOQUES.map(() => makeEmptyBloqueNAT()),
    }),
    []
  );

  const removeSetBySetIndex = (setIndex, remove, totalBlocks) => {
    if (totalBlocks <= 3) {
      message.warning("No puedes borrar el último set.");
      return false;
    }

    const start = setIndex * 3;
    remove(start + 2);
    remove(start + 1);
    remove(start + 0);

    message.success(`Set eliminado: ${setIndex + 1}`);
    return true;
  };

  const handleValuesChange = () => {
    if (hydratingRef.current) return;
    setIsDirty(true);
  };

  const onFinish = (values) => {
    const bloques = Array.isArray(values?.bloques) ? values.bloques : [];
    onFinishOK?.(bloques);
    message.success("Cambios guardados.");
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
            <div style={ui.subtitle}>Puntos de Muestreo — Iluminación Natural (NAT)</div>
          </div>

          <div style={ui.headerRight}>
            <span style={styles.chip}>{isDirty ? "Cambios sin guardar" : "Sin cambios"}</span>
            <Button
              type="primary"
              size={SZ.btn}
              htmlType="submit"
              loading={loading}
              disabled={disabled || loading || !isDirty}
              style={isSmall ? ui.saveBtnMobile : ui.saveBtn}
            >
              Guardar cambios
            </Button>
          </div>
        </div>

        <Divider style={ui.divider} />

        <Form.List name="bloques">
          {(bloqueFields, { add, remove }) => {
            const totalSets = getTotalSets(bloqueFields.length);

            return (
              <div style={{ display: "grid", gap: 12, minWidth: 0 }}>
                {/* Toolbar */}
                <div style={ui.toolbar}>
                  <div style={ui.toolbarLeft}>
                    <Button
                      type="primary"
                      ghost
                      size={SZ.btn}
                      icon={<PlusOutlined />}
                      onClick={() => {
                        add(makeEmptyBloqueNAT());
                        add(makeEmptyBloqueNAT());
                        add(makeEmptyBloqueNAT());
                        message.success("Se agregaron 3 Bloques: Inicio, Intermedia y Final.");

                        setTimeout(() => {
                          const totalAfter = bloqueFields.length + 3;
                          const nextSetIndex = calcSetIndexFromTotalBlocks(totalAfter);
                          setActiveSetKey(String(nextSetIndex));
                        }, 0);
                      }}
                    >
                      Agregar set
                    </Button>

                    <span style={styles.chip}>Total bloques: {bloqueFields.length}</span>
                  </div>

                  <Text type="secondary">Cada set contiene 3 bloques</Text>
                </div>

                {/* Tabs wrapper */}
                <div style={{ minWidth: 0 }}>
                  <div style={tabWrap}>
                    <Tabs
                      type="card"
                      activeKey={activeSetKey}
                      onChange={setActiveSetKey}
                      items={Array.from({ length: totalSets }).map((_, setIndex) => {
                        const start = setIndex * 3;
                        const end = start + 3;

                        return {
                          key: String(setIndex),
                          label: setIndex === 0 ? "Set principal" : `Set ${setIndex + 1}`,
                          children: (
                            <div style={{ display: "grid", gap: 12, minWidth: 0 }}>
                              {/* toolbar del tab */}
                              <div style={ui.toolbar}>
                                <Text type="secondary">
                                  Set #{setIndex + 1}: Inicio / Intermedia / Final
                                </Text>

                                <Button
                                  danger
                                  size={SZ.btn}
                                  icon={<DeleteOutlined />}
                                  disabled={bloqueFields.length <= 3}
                                  onClick={() => {
                                    const ok = removeSetBySetIndex(setIndex, remove, bloqueFields.length);
                                    if (ok) {
                                      setActiveSetKey((prev) => {
                                        const cur = Number(prev);
                                        const next = Math.max(0, Math.min(cur, totalSets - 2));
                                        return String(next);
                                      });
                                    }
                                  }}
                                >
                                  Quitar set
                                </Button>
                              </div>
                              <div style={{ minWidth: 0, maxWidth: "100%", overflowX: "hidden"}}>
                                <Collapse
                                    destroyInactivePanel={false}
                                    style={{ background: "transparent", border: "none", minWidth: 0 }}
                                    activeKey={openPanelsBySet[setIndex] ?? []}
                                    onChange={(keys) => {
                                      const next = normalizeKeys(keys);
                                      setOpenPanelsBySet((prev) => ({ ...prev, [setIndex]: next }));
                                      next.forEach((k) => restorePointsScroll(String(k)));
                                    }}
                                    expandIconPosition="end"
                                    >
                                    {/* render de los 3 bloques */}
                                    {bloqueFields.slice(start, end).map((bloqueField, localIdx) => {
                                      const i = start + localIdx;
                                      const meta = BLOQUES[localIdx];
                                            // panelKey estable: si tienes id real úsalo, si no, key
                                        const panelKey = String(bloqueField.key);
                                      return (
                                                                                <Collapse.Panel
                                          key={panelKey}
                                          header={
                                            <div style={{ display: "flex", flexDirection: "column" }}>
                                              <b>Hoja de campo #{i + 1} — {meta.label}</b>
                                              <Text type="secondary">Bloque de medición: {meta.label}</Text>
                                            </div>
                                          }
                                          style={{ background: "transparent", border: "none", minWidth: 0 }}
                                          >
                                            <div style={{ minWidth: 0, maxWidth: "100%", overflowX: "hidden" }}>
                                            <Card
                                              key={bloqueField.key}
                                              style={{ ...styles.card, minWidth: 0 }}
                                              bodyStyle={{ padding: SZ.pad, minWidth: 0 }}
                                              title={
                                                <Space direction="vertical" style={{ width: "100%" }}>
                                                  <b>
                                                    Bloque #{i + 1} — {meta.label}
                                                  </b>
                                                  <Text type="secondary">Bloque de medición: {meta.label}</Text>
                                                </Space>
                                              }
                                            >
                                              <Row gutter={[SZ.gap, 8]}>
                                                <Col xs={24} sm={12} lg={8}>
                                                  <Form.Item
                                                    label="Fecha de Monitoreo"
                                                    name={[bloqueField.name, "fechaMonitoreo"]}
                                                    style={{ marginBottom: 0 }}
                                                  >
                                                    <DatePicker size={SZ.input} style={{ width: "100%" }} />
                                                  </Form.Item>
                                                </Col>

                                                <Col xs={24} sm={12} lg={8}>
                                                  <Form.Item
                                                    label={`Hora ${meta.label.toLowerCase()}`}
                                                    name={[bloqueField.name, "hora"]}
                                                    style={{ marginBottom: 0 }}
                                                  >
                                                    <TimePicker size={SZ.input} format="HH:mm" style={{ width: "100%" }} />
                                                  </Form.Item>
                                                </Col>

                                                <Col xs={24} sm={12} lg={8}>
                                                  <Form.Item name={[bloqueField.name, "tipo"]} hidden>
                                                    <Input />
                                                  </Form.Item>

                                                  <Form.Item
                                                    label="Influye la Luz"
                                                    name={[bloqueField.name, "InfluyeLuz"]}
                                                    valuePropName="checked"
                                                    style={{ marginBottom: 0 }}
                                                  >
                                                    <Switch />
                                                  </Form.Item>
                                                </Col>

                                                <Col xs={24}>
                                                  <Form.Item label="Observaciones" name={[bloqueField.name, "observaciones"]}>
                                                    <TextArea autoSize={{ minRows: 2, maxRows: 4 }} placeholder="..." />
                                                  </Form.Item>
                                                </Col>
                                              </Row>

                                              <Divider style={ui.dividerSoft} />

                                              {/* Puntos dentro del bloque */}
                                              <Form.List name={[bloqueField.name, "puntos"]}>
                                                {(puntoFields) => (
                                                  <>
                                                    <Space style={{ marginBottom: 12, width: "100%" }} wrap>
                                                      <Button
                                                        type="default"
                                                        size={SZ.btn}
                                                        icon={<PlusOutlined />}
                                                        onClick={() => addPointToSet(i)}
                                                        disabled={disabled || puntoFields.length >= MAX_PUNTOS}
                                                      >
                                                        Agregar punto (al set)
                                                      </Button>

                                                      <Button size={SZ.btn} disabled={disabled} onClick={() => addNPointsToSet(i, 5)}>
                                                        +5
                                                      </Button>
                                                      <Button size={SZ.btn} disabled={disabled} onClick={() => addNPointsToSet(i, 10)}>
                                                        +10
                                                      </Button>

                                                      <Space wrap style={{ width: isSmall ? "100%" : "auto" }}>
                                                        <InputNumber
                                                          size={SZ.input}
                                                          min={1}
                                                          style={{ width: isSmall ? "100%" : 120 }}
                                                          value={startAtBySet[setIndex] ?? 1}
                                                          onChange={(v) => setStart(setIndex, v)}
                                                          disabled={disabled}
                                                        />
                                                        <Button
                                                          size={SZ.btn}
                                                          style={{ width: isSmall ? "100%" : "auto" }}
                                                          disabled={disabled}
                                                          onClick={() => autonumerarSet(i, startAtBySet[setIndex] ?? 1)}
                                                        >
                                                          Autonumerar
                                                        </Button>
                                                      </Space>

                                                      <span style={styles.chip}>Total puntos: {puntoFields.length}</span>
                                                    </Space>

                                                    {/* ✅ Scroll horizontal SOLO aquí */}
                                                    <div style={{ minWidth: 0 }}>
                                                      <div style={pointsWrap}>
                                                        {/* fuerza overflow en móvil */}
                                                        <div style={{ display: "inline-block", minWidth: isSmall ? 1200 : "auto" }}>
                                                          <PuntosExcelSheet
                                                            puntoFields={puntoFields}
                                                            bloqueField={bloqueField}
                                                            blockIndexGlobal={i}
                                                            disabled={disabled}
                                                            form={form}
                                                            autoCompleteOptions={autoCompleteOptions}
                                                            syncSharedPointField={syncSharedPointField}
                                                            onRemovePoint={(pointIndex) => removePointFromSet(i, pointIndex)}
                                                            compact={isSmall} // si tu hook lo soporta
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
                                                  </>
                                                )}
                                              </Form.List>
                                            </Card>

                                            </div>
                                        </Collapse.Panel>
                                      );
                                    })}

                                    </Collapse>
                              </div>

                            </div>
                          ),
                        };
                      })}
                    />
                  </div>
                </div>

                {/* ✅ Barra inferior fija siguiendo pantalla */}
                <div style={ui.bottomBar}>
                  <div style={ui.bottomBarInner}>
                    <span style={styles.chip}>{isDirty ? "Cambios sin guardar" : "Sin cambios"}</span>

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
              </div>
            );
          }}
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
    maxWidth: 1400,
    margin: "0 auto",
    overflowX: "hidden",
    paddingBottom: isSmall ? 96 : 92, // ✅ para no tapar contenido con barra inferior
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

  title: {
    fontSize: 18,
    fontWeight: 800,
    color: "#0f172a",
    lineHeight: 1.1,
  },

  subtitle: {
    fontSize: 13,
    color: "#64748b",
    marginTop: 2,
  },

  toolbar: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    flexWrap: "wrap",
  },

  toolbarLeft: {
    display: "flex",
    gap: 10,
    flexWrap: "wrap",
    alignItems: "center",
  },

  divider: {
    margin: "12px 0",
    borderColor: "#e6eaf2",
  },

  dividerSoft: {
    margin: "10px 0",
    borderColor: "#e6eaf2",
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
