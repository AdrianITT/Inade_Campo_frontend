import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  Button,
  Card,
  Col,
  Divider,
  Form,
  Input,
  InputNumber,
  Row,
  Space,
  TimePicker,
  Typography,
  message,
  DatePicker,
  Popconfirm,
  Spin,
  Collapse,
} from "antd";
import { PlusOutlined, DeleteOutlined, DownOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import TextArea from "antd/es/input/TextArea";
import { useBeforeUnload, useNavigationPrompt } from "../../../hooks/DetectTabClosure";
import PuntosExcelSheetART from "./hookART/luxART";

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
  id: null,
  idHoja: null,
  fechaMonitoreo: null,
  horaInicio: null,
  horaFinal: null,
  turno: "",
  observaciones: "",
  puntos: [makeEmptyPunto()],
});

const firstOrNull = (arr) => (Array.isArray(arr) && arr.length ? arr[0] : null);

const getIsSmall = () =>
  typeof window !== "undefined" &&
  window.matchMedia &&
  window.matchMedia("(max-width: 576px)").matches;

const excelWrap = {
  border: "1px solid #e6eaf2",
  borderRadius: 14,
  background: "#fff",
  maxWidth: "100%",
  width: "100%",
  minWidth: 0,
  overflow: "visible",
};

const excelScroller = {
  maxWidth: "100%",
  width: "100%",
  minWidth: 0,
  overflowX: "auto",
  overflowY: "hidden",
  WebkitOverflowScrolling: "touch",
  paddingBottom: 8,
  overscrollBehaviorX: "contain",
};

export default function FormHCArtificial({
  initialData,
  areasPorFila = [],
  onFinishOK,
  disabled = false,
  loading = false,
  posicion,
}) {
  const [form] = Form.useForm();

  // ✅ Collapse state (controlado)
  const [openKeys, setOpenKeys] = useState(["0"]); // abre el primer bloque

  // ✅ responsive real (resize)
  const [isSmall, setIsSmall] = useState(getIsSmall());
  useEffect(() => {
    // console.log("posicion: 1",posicion)
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

  const [saveDataInitial, setSaveDataInitial] = useState({});
  const [isDirty, setIsDirty] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);

  useBeforeUnload(isDirty);
  useNavigationPrompt(isDirty);

  const hydratingRef = useRef(true);

  // ✅ startAt por bloque (autonumerar)
  const [startAtByBloque, setStartAtByBloque] = useState({});
  const getStartAt = (bloqueIdx) => startAtByBloque[bloqueIdx] ?? 1;
  const setStartAt = (bloqueIdx, v) =>
    setStartAtByBloque((prev) => ({ ...prev, [bloqueIdx]: v ?? 1 }));

  const handleValuesChange = () => {
    if (hydratingRef.current) return;
    setIsDirty(true);
  };

  const buildPuntosFromBlock = (art) => {
    const table = Array.isArray(art?.tableHojaCampoIluminacion)
      ? art.tableHojaCampoIluminacion
      : [];

    if (table.length === 0) return [makeEmptyPunto()];

    return table.map((p) => {
      const luxE1 = firstOrNull(p?.iluminacionE1);
      const luxE2 = firstOrNull(p?.iluminacionE2);

      return {
        idrowtabla: p.id,
        numeroPunto: p.numeroPunto ?? null,
        areaMonitoreo: p.areaMonitoreo ?? "",
        posicionTrabajo: p.posicionTrabajo ?? "",
        descripcionPunto: p.descripcionPunto ?? "",
        nivelMinimo: p.nivelMinimo ?? null,
        refl_paredes: !!p.refl_paredes,
        refl_plano_trabajo: !!p.refl_plano_trabajo,

        idluxE2: luxE2?.id ?? null,
        lux1E2: luxE2?.lux1E2 ?? "",
        lux2E2: luxE2?.lux2E2 ?? "",
        lux3E2: luxE2?.lux3E2 ?? "",

        idluxE1: luxE1?.id ?? null,
        lux1E1: luxE1?.lux1E1 ?? "",
        lux2E1: luxE1?.lux2E1 ?? "",
        lux3E1: luxE1?.lux3E1 ?? "",
      };
    });
  };

  // ✅ Autonumerar puntos de un bloque
  const autonumerarBloque = (bloqueName, startAt) => {
    const puntos = form.getFieldValue(["bloquesART", bloqueName, "puntos"]) || [];
    const len = Array.isArray(puntos) ? puntos.length : 0;
    if (len <= 0) return;

    const fields = [];
    for (let i = 0; i < len; i++) {
      fields.push({
        name: ["bloquesART", bloqueName, "puntos", i, "numeroPunto"],
        value: (startAt ?? 1) + i,
      });
    }
    form.setFields(fields);
    message.success("Numeración aplicada.");
  };

  useEffect(() => {
    const t = setTimeout(() => {
      hydratingRef.current = false;
    }, 0);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (!initialData) return;

    setDataLoading(true);

    const roots = Array.isArray(initialData)
      ? initialData
      : initialData && typeof initialData === "object"
      ? Object.values(initialData)
      : [];

    if (!roots.length) {
      setDataLoading(false);
      return;
    }

    const parseTime = (t) => (t ? dayjs(String(t), ["HH:mm:ss", "HH:mm"]) : null);

    const bloquesART = roots.map((root) => {
      const art = Array.isArray(root?.bloques) ? root.bloques[0] : null;

      if (!art) {
        return {
          ...makeEmptyBloqueART(),
          observaciones: root?.observacion ?? "",
          idHoja: root?.hojaId ?? null,
        };
      }

      return {
        id: art.id ?? null,
        idHoja: art.hoja_id ?? root?.hojaId ?? null,
        fechaMonitoreo: art?.fechaMonitoreo ? dayjs(art.fechaMonitoreo) : null,
        horaInicio: parseTime(art?.horaInicio),
        horaFinal: parseTime(art?.horaFinal),
        turno: art?.turno ?? "",
        observaciones: root?.observacion ?? "",
        puntos: buildPuntosFromBlock(art),
      };
    });

    hydratingRef.current = true;
    form.setFieldsValue({ bloquesART });

    setSaveDataInitial({ bloquesART });
    setIsDirty(false);

    setTimeout(() => {
      hydratingRef.current = false;
    }, 0);

    setDataLoading(false);
  }, [initialData, form]);

  const initialValues = {
    bloquesART: [makeEmptyBloqueART()],
  };

  const autoCompleteOptions = useMemo(() => {
    return (Array.isArray(areasPorFila) ? areasPorFila : [])
      .filter(Boolean)
      .map((a) => ({ value: String(a) }));
  }, [areasPorFila]);

  const onFinish = (values) => {
    if (loading) return;

    const bloques = Array.isArray(values?.bloquesART) ? values.bloquesART : [];
    if (!bloques.length) return message.error("Sin bloques ART.");

    const payload = {
      tipo: "ART",
      bloques: bloques.map((b) => ({
        id: b.id ?? null,
        idHoja: b.idHoja ?? null,
        fechaMonitoreo: b?.fechaMonitoreo?.format("YYYY-MM-DD") ?? null,
        horaInicio: b?.horaInicio?.format("HH:mm:ss") ?? null,
        horaFinal: b?.horaFinal?.format("HH:mm:ss") ?? null,
        turno: b?.turno ?? "",
        observaciones: b?.observaciones ?? "",
        puntos: Array.isArray(b?.puntos) ? b.puntos : [],
      })),
    };

    for (let i = 0; i < payload.bloques.length; i++) {
      const b = payload.bloques[i];
      if (!b.horaInicio || !b.horaFinal)
        return message.warning(`Bloque #${i + 1}: falta hora inicio/final`);
      if (!String(b.turno).trim())
        return message.warning(`Bloque #${i + 1}: falta turno`);
    }

    onFinishOK?.(payload, saveDataInitial);
    setIsDirty(false);
  };

  const handleConfirmSave = () => form.submit();
  const canSave = !disabled && !loading && isDirty;

  const swipeHint = (
    <div style={ui.swipeHint}>
      <span>Desliza lateralmente para ver todas las columnas</span>
      <span>
        <b>Tip:</b> Tab / Shift+Tab
      </span>
    </div>
  );

  return (
    <div style={ui.page(isSmall)}>
      <Spin spinning={dataLoading}>
        <Form
          form={form}
          layout="vertical"
          initialValues={initialValues}
          onFinish={onFinish}
          disabled={disabled}
          onValuesChange={handleValuesChange}
        >
          {/* Header sticky responsive */}
          <div style={ui.header}>
            <div style={ui.headerLeft}>
              <div style={ui.title}>Hoja de Campo</div>
              <div style={ui.subtitle}>Luz Artificial (ART)</div>
            </div>

            <div style={ui.headerRight}>
              <span style={styles.chip}>
                {isDirty ? "Cambios sin guardar" : "Sin cambios"}
              </span>

              <Popconfirm
                title="Confirmar guardado"
                description="¿Deseas guardar los cambios?"
                onConfirm={handleConfirmSave}
                okText="Sí"
                cancelText="No"
                okButtonProps={{ loading }}
                disabled={!canSave}
              >
                <Button
                  type="primary"
                  htmlType="button"
                  size={SZ.btn}
                  loading={loading}
                  disabled={!canSave}
                  style={isSmall ? ui.saveBtnMobile : ui.saveBtn}
                  block={isSmall}
                >
                  Guardar cambios
                </Button>
              </Popconfirm>
            </div>
          </div>

          <Divider style={ui.divider} />

          <Form.List name="bloquesART">
            {(bloqueFields, { add: addBloque, remove: removeBloque }) => (
              <>
                <div style={ui.toolbar}>
                  <div style={ui.toolbarLeft}>
                    <Button
                      type="primary"
                      ghost
                      size={SZ.btn}
                      icon={<PlusOutlined />}
                      onClick={() => {
                        addBloque(makeEmptyBloqueART());
                        // abre el último (por índice)
                        setOpenKeys((prev) => {
                          const nextIdx = String(bloqueFields.length); // índice nuevo
                          return [...new Set([...(prev || []), nextIdx])];
                        });
                      }}
                    >
                      Agregar bloque ART
                    </Button>

                    <span style={styles.chip}>
                      Total bloques: {bloqueFields.length}
                    </span>
                  </div>

                  {isDirty ? (
                    <Text type="warning">Cambios sin guardar</Text>
                  ) : (
                    <Text type="secondary">Sin cambios</Text>
                  )}
                </div>

                {/* ✅ Collapse envuelve TODO el Card */}
                <Collapse
                  activeKey={openKeys}
                  onChange={(keys) => setOpenKeys(Array.isArray(keys) ? keys : [keys])}
                  expandIcon={({ isActive }) => (
                    <DownOutlined style={{ fontSize: 12 }} rotate={isActive ? 180 : 0} />
                  )}
                  style={{ background: "transparent" }}
                  items={bloqueFields.map((bloqueField, bloqueIdx) => {
                    const panelKey = String(bloqueIdx);

                    return {
                      key: panelKey,
                      label: (
                        <Space style={{ width: "100%", justifyContent: "space-between" }} wrap>
                          <b>Hoja de Campo #{bloqueIdx + 1}</b>

                          <Space>
                            <Text type="secondary">
                              {form.getFieldValue(["bloquesART", bloqueField.name, "turno"]) ||
                                "Sin turno"}
                            </Text>

                            <Button
                              danger
                              size="small"
                              icon={<DeleteOutlined />}
                              disabled={bloqueFields.length === 1}
                              onClick={(e) => {
                                e.stopPropagation();
                                removeBloque(bloqueField.name);

                                setOpenKeys((prev) => {
                                  const next = (prev || []).filter((k) => k !== panelKey);
                                  // si se quedó vacío, abre el primero
                                  if (next.length === 0 && bloqueFields.length - 1 > 0) return ["0"];
                                  return next;
                                });
                              }}
                            >
                              Quitar
                            </Button>
                          </Space>
                        </Space>
                      ),
                      children: (
                        <Card
                          style={{ ...styles.card, minWidth: 0 }}
                          bodyStyle={{ padding: SZ.pad, minWidth: 0 }}
                        >
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
                                <TimePicker
                                  size={SZ.input}
                                  format="HH:mm"
                                  style={{ width: "100%" }}
                                />
                              </Form.Item>
                            </Col>

                            <Col xs={24} sm={12} lg={8}>
                              <Form.Item
                                label="Hora final"
                                name={[bloqueField.name, "horaFinal"]}
                                rules={[{ required: true, message: "Requerido" }]}
                              >
                                <TimePicker
                                  size={SZ.input}
                                  format="HH:mm"
                                  style={{ width: "100%" }}
                                />
                              </Form.Item>
                            </Col>

                            <Col xs={24} sm={12} lg={8}>
                              <Form.Item
                                label="Turno"
                                name={[bloqueField.name, "turno"]}
                                rules={[{ required: true, message: "Requerido" }]}
                              >
                                <Input
                                  size={SZ.input}
                                  placeholder="Ej: Matutino / Vespertino / Nocturno"
                                />
                              </Form.Item>
                            </Col>

                            <Col xs={24} sm={12} lg={16}>
                              <Form.Item
                                label="Observaciones"
                                name={[bloqueField.name, "observaciones"]}
                              >
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
                              {Array.isArray(
                                form.getFieldValue(["bloquesART", bloqueField.name, "puntos"])
                              )
                                ? form.getFieldValue(["bloquesART", bloqueField.name, "puntos"]).length
                                : 0}
                            </span>
                          </div>

                          <div style={{ height: 10 }} />

                          <Form.List name={[bloqueField.name, "puntos"]}>
                            {(puntoFields, { add, remove }) => {
                              const addN = (n) => {
                                const canAdd = Math.min(n, MAX_PUNTOS - puntoFields.length);
                                if (canAdd <= 0)
                                  return message.warning(`Máximo ${MAX_PUNTOS} puntos por bloque.`);
                                for (let i = 0; i < canAdd; i++) add(makeEmptyPunto());
                                message.success(`Se agregaron ${canAdd} punto(s).`);
                              };

                              return (
                                <>
                                  <Space style={{ marginBottom: 12, width: "100%" }} wrap>
                                    <Button
                                      type="default"
                                      size={SZ.btn}
                                      icon={<PlusOutlined />}
                                      onClick={() => addN(1)}
                                      disabled={disabled || puntoFields.length >= MAX_PUNTOS}
                                    >
                                      Agregar punto
                                    </Button>

                                    <Button
                                      size={SZ.btn}
                                      onClick={() => addN(5)}
                                      disabled={disabled || puntoFields.length >= MAX_PUNTOS}
                                    >
                                      +5
                                    </Button>

                                    <Button
                                      size={SZ.btn}
                                      onClick={() => addN(10)}
                                      disabled={disabled || puntoFields.length >= MAX_PUNTOS}
                                    >
                                      +10
                                    </Button>

                                    <Space wrap style={{ width: isSmall ? "100%" : "auto" }}>
                                      <InputNumber
                                        size={SZ.input}
                                        min={1}
                                        style={{ width: isSmall ? "100%" : 120 }}
                                        value={getStartAt(bloqueIdx)}
                                        onChange={(v) => setStartAt(bloqueIdx, v)}
                                        disabled={disabled}
                                      />
                                      <Button
                                        size={SZ.btn}
                                        style={{ width: isSmall ? "100%" : "auto" }}
                                        onClick={() =>
                                          autonumerarBloque(
                                            bloqueField.name,
                                            getStartAt(bloqueIdx)
                                          )
                                        }
                                        disabled={disabled || puntoFields.length === 0}
                                      >
                                        Autonumerar
                                      </Button>
                                    </Space>

                                    <span style={styles.chip}>Total: {puntoFields.length}</span>
                                  </Space>

                                  <div style={{ maxWidth: "100%", minWidth: 0 }}>
                                    <div style={excelWrap}>
                                      <div style={excelScroller}>
                                        <div
                                          style={{
                                            display: "inline-block",
                                            minWidth: isSmall ? 1200 : "auto",
                                          }}
                                        >
                                          <PuntosExcelSheetART
                                            puntoFields={puntoFields}
                                            bloqueField={bloqueField}
                                            bloqueIdx={bloqueIdx}
                                            onRemovePoint={(pName) => remove(pName)}
                                            autoCompleteOptions={autoCompleteOptions}
                                            form={form}
                                            disabled={disabled}
                                            posiciones={posicion}
                                          />
                                        </div>
                                      </div>
                                      {swipeHint}
                                    </div>
                                  </div>
                                </>
                              );
                            }}
                          </Form.List>
                        </Card>
                      ),
                    };
                  })}
                />

                {/* ✅ Barra inferior fija siguiendo pantalla */}
                <div style={ui.bottomBar}>
                  <div style={ui.bottomBarInner}>
                    <span style={styles.chip}>
                      {isDirty ? "Cambios sin guardar" : "Sin cambios"}
                    </span>

                    <Popconfirm
                      title="Confirmar guardado"
                      description="¿Deseas guardar los cambios?"
                      onConfirm={handleConfirmSave}
                      okText="Sí"
                      cancelText="No"
                      okButtonProps={{ loading }}
                      disabled={!canSave}
                    >
                      <Button
                        type="primary"
                        size={SZ.btn}
                        loading={loading}
                        disabled={!canSave}
                        style={{ width: isSmall ? "100%" : 260 }}
                        block={isSmall}
                      >
                        Guardar cambios
                      </Button>
                    </Popconfirm>
                  </div>
                </div>
              </>
            )}
          </Form.List>
        </Form>
      </Spin>
    </div>
  );
}

const ui = {
  page: (isSmall) => ({
    padding: 16,
    background: "#f6f8fb",
    minHeight: "100%",
    overflowX: "hidden",
    paddingBottom: isSmall ? 96 : 92,
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

  headerLeft: { minWidth: 0, flex: "1 1 240px" },

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

  swipeHint: {
    fontSize: 12,
    color: "#64748b",
    padding: "8px 12px",
    borderTop: "1px solid #e6eaf2",
    background: "#fff",
    display: "flex",
    justifyContent: "space-between",
    gap: 10,
    flexWrap: "wrap",
  },

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

  title: { fontWeight: 900, fontSize: 18, color: "#0f172a" },
  subtitle: { fontSize: 12, color: "#64748b" },
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
    whiteSpace: "nowrap",
  },
};
