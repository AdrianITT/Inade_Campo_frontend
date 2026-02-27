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
  AutoComplete,
  DatePicker,
  Popconfirm,
  Spin,
  Tabs,
  Collapse,
} from "antd";
import TextArea from "antd/es/input/TextArea";
import { PlusOutlined, DeleteOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import { useBeforeUnload, useNavigationPrompt } from "../../../hooks/DetectTabClosure";

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

const BLOQUES = [
  { key: 0, label: "Inicio", timeField: "horaInicio" },
  { key: 1, label: "Intermedia", timeField: "horaIntermediario" },
  { key: 2, label: "Final", timeField: "horaFinal" },
];

const makeEmptyBloqueNAT = () => ({
  tipo: "NAT",
  observaciones: "",
  fechaMonitoreo: null,
  horaInicio: null,
  horaIntermediario: null,
  horaFinal: null,
  puntos: [makeEmptyPunto()],
  influenciaLuz: false,
});

// ✅ responsive real
const getIsSmall = () =>
  typeof window !== "undefined" &&
  window.matchMedia &&
  window.matchMedia("(max-width: 576px)").matches;

export default function FormNAT({
  initialData,
  areasPorFila = [],
  onFinishOK,
  disabled = false,
  loading = false,
  posicion,
}) {
  const [form] = Form.useForm();

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

  const [saveDataInitial, setSaveDataInitial] = useState({});
  const [dataLoading, setDataLoading] = useState(true);

  // ✅ Tabs por set
  const [activeSetKey, setActiveSetKey] = useState("0");
  const [startAtBySet, setStartAtBySet] = useState({}); // { setIndex: startAt }

  const [isDirty, setIsDirty] = useState(false);
  useBeforeUnload(isDirty);
  useNavigationPrompt(isDirty);

  const hydratingRef = useRef(true);

  const [openPanelsBySet, setOpenPanelsBySet] = useState({});

  const pointsScrollLeftRef = useRef({});

  const pointsWrapRef = useRef({});

  const normalizeKeys = (k) => ( Array.isArray(k) ? k : k ? [k] : []);

  // Tabs NO deben romper el layout
  const tabWrap = {
    borderRadius: 12,
    border: "1px solid #e6eaf2",
    background: "#fff",
    padding: 8,
    overflow: "hidden",
    minWidth: 0,
    maxWidth: "100%",
  };

  // Scroll HORIZONTAL solo para tabla
const pointsWrap = {
  width: "100%",
  maxWidth: "100%",
  minWidth: 0,
  display: "block",          // ✅
  position: "relative",      // ✅
  overflowX: "auto",
  overflowY: "hidden",
  borderRadius: 12,
  border: "1px solid #e6eaf2",
  background: "#fff",
  WebkitOverflowScrolling: "touch",
  overscrollBehaviorX: "contain",
};
const pointsWrapStyle = {
  width: "100%",
  maxWidth: "100%",
  minWidth: 0,
  overflowX: "auto",
  overflowY: "hidden",
  display: "block",
  position: "relative",
  borderRadius: 12,
  border: "1px solid #e6eaf2",
  background: "#fff",
  WebkitOverflowScrolling: "touch",
  overscrollBehaviorX: "contain",
  contain: "layout paint",     // ✅ clave anti-deformación
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
  // doble RAF = después de animación/reflow del Collapse
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      const el = pointsWrapRef.current[panelKey];
      if (!el) return;
      el.scrollLeft = pointsScrollLeftRef.current[panelKey] ?? 0;
    });
  });
};


  // sincroniza campos compartidos dentro del set (3 bloques)
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

    if (maxLen >= MAX_PUNTOS) return message.warning(`Máximo ${MAX_PUNTOS} puntos por bloque.`);

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
    if (canAdd <= 0) return message.warning(`${MAX_PUNTOS} puntos por bloque.`);

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

    if (minLen <= 1) return message.warning("No puedes borrar el último punto del set.");

    for (const bi of [start, start + 1, start + 2]) {
      const puntos = Array.isArray(bloques[bi]?.puntos) ? [...bloques[bi].puntos] : [];
      puntos.splice(pointIndex, 1);
      safeSetField(["bloques", bi, "puntos"], puntos);
    }
  };

  // elimina set por índice de set (tab)
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

  useEffect(() => {
    const t = setTimeout(() => {
      hydratingRef.current = false;
    }, 0);
    return () => clearTimeout(t);
  }, []);

  const initialValues = useMemo(
    () => ({
      bloques: BLOQUES.map(() => makeEmptyBloqueNAT()),
    }),
    []
  );

  const buildPuntosFromBlock = (art) => {
    const table = Array.isArray(art?.tableHojaCampoIluminacion)
      ? art.tableHojaCampoIluminacion
      : [];
    const firstOrNullLocal = (arr) => (Array.isArray(arr) && arr.length ? arr[0] : null);

    if (table.length === 0) return [makeEmptyPunto()];

    return table.map((p) => {
      const luxE1 = firstOrNullLocal(p?.iluminacionE1);
      const luxE2 = firstOrNullLocal(p?.iluminacionE2);

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

  const handleValuesChange = () => {
    if (hydratingRef.current) return;
    setIsDirty(true);
  };

  const parseDate = (v) => {
    if (!v) return null;
    const d = dayjs(v, ["YYYY-MM-DD", "YYYY-MM-DDTHH:mm:ssZ", dayjs.ISO_8601], true);
    return d.isValid() ? d : null;
  };

  useEffect(() => {
    if (!initialData) return;

    setDataLoading(true);

    const natList = Object.values(initialData ?? {}).sort(
      (a, b) => (a?.hojaId ?? 0) - (b?.hojaId ?? 0)
    );

    const parseTime = (t) => (t ? dayjs(String(t), ["HH:mm:ss", "HH:mm"]) : null);

    const bloquesForForm = natList.map((_, i) => {
      const b = natList[i] || {};
      const bloqueReal = Array.isArray(b?.bloques) ? b.bloques[0] : b;
      const puntos = buildPuntosFromBlock(bloqueReal);

      return {
        tipo: "NAT",
        id: b.id ?? null,
        idHoja: bloqueReal.hoja_id ?? null,
        idDataMonitoreo: bloqueReal.id ?? null,
        observaciones: b.observacion ?? "",
        influenciaLuz: !!b.influenciaLuz,

        fechaMonitoreo: parseDate(bloqueReal?.fechaMonitoreo ?? "") ?? null,
        horaInicio: parseTime(bloqueReal.horaInicio) ?? null,
        horaIntermediario: parseTime(bloqueReal.horaIntermediario) ?? null,
        horaFinal: parseTime(bloqueReal.horaFinal) ?? null,

        puntos,
      };
    });

    hydratingRef.current = true;
    form.setFieldsValue({ bloques: bloquesForForm });
    setSaveDataInitial(bloquesForForm);
    setIsDirty(false);

    setActiveSetKey(String(calcSetIndexFromTotalBlocks(bloquesForForm.length)));

    setTimeout(() => {
      hydratingRef.current = false;
    }, 0);

    setDataLoading(false);
  }, [initialData, form]);

  const onFinish = (values) => {
    if (loading) return;
    onFinishOK?.(values.bloques, saveDataInitial);
    message.success("Cambios guardados.");
    setIsDirty(false);
  };

  const autoCompleteOptions = useMemo(() => {
    return (Array.isArray(areasPorFila) ? areasPorFila : [])
      .filter(Boolean)
      .map((a) => ({ value: String(a) }));
  }, [areasPorFila]);

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

  function PuntosExcelSheet({
    puntoFields,
    bloqueField,
    blockIndexGlobal,
    onRemovePoint,
    autoCompleteOptions,
    syncSharedPointField,
    form,
    disabled,
    posiciones,
  }) {
    const nameBase = (pName, key) => [pName, key];

    const posicionesOptions = useMemo(() => {
      return (Array.isArray(posiciones) ? posiciones : [])
        .filter(Boolean)
        .map((p) => ({ value: String(p) }));
    }, [posiciones]);


    const cellStyle = (isSticky = false) => ({
      ...excel.td,
      ...(isSticky ? excel.stickyCol : null),
    });

    const colW = {
      num: 90,
      area: 180,
      pos: 170,
      desc: 260,
      refl: 130,
      lux: 110,
      nivel: 140,
      actions: 90,
    };

    return (
      <table style={excel.table}>
        <thead>
          <tr>
            <th style={{ ...excel.th, ...excel.stickyCol, width: colW.num }}>No.</th>
            <th style={{ ...excel.th, width: colW.area }}>Área</th>
            <th style={{ ...excel.th, width: colW.pos }}>Posición</th>
            <th style={{ ...excel.th, width: colW.desc }}>Descripción</th>
            <th style={{ ...excel.th, width: colW.refl }}>Refl. pared</th>
            <th style={{ ...excel.th, width: colW.refl }}>Refl. plano</th>

            <th style={{ ...excel.th, width: colW.lux }}>Lux E2-1</th>
            <th style={{ ...excel.th, width: colW.lux }}>Lux E2-2</th>
            <th style={{ ...excel.th, width: colW.lux }}>Lux E2-3</th>

            <th style={{ ...excel.th, width: colW.lux }}>Lux E1-1</th>
            <th style={{ ...excel.th, width: colW.lux }}>Lux E1-2</th>
            <th style={{ ...excel.th, width: colW.lux }}>Lux E1-3</th>

            <th style={{ ...excel.th, width: colW.nivel }}>Nivel mín.</th>
            <th style={{ ...excel.th, width: colW.actions }}>Acción</th>
          </tr>
        </thead>

        <tbody>
          {puntoFields.map((pField) => {
            const basePath = ["bloques", bloqueField.name, "puntos", pField.name];

            return (
              <tr key={pField.key}>
                <td style={cellStyle(true)}>
                  <div style={excel.cell}>
                    <Form.Item name={nameBase(pField.name, "numeroPunto")} style={{ margin: 0 }}>
                      <InputNumber
                        disabled={disabled}
                        min={1}
                        style={excel.inputLikeCell}
                        onChange={(val) =>
                          syncSharedPointField(blockIndexGlobal, pField.name, "numeroPunto", val)
                        }
                      />
                    </Form.Item>
                  </div>
                </td>

                <td style={cellStyle(false)}>
                  <div style={excel.cell}>
                    <Form.Item name={nameBase(pField.name, "areaMonitoreo")} style={{ margin: 0 }}>
                      <AutoComplete
                        disabled={disabled}
                        options={autoCompleteOptions}
                        onChange={(val) =>
                          syncSharedPointField(blockIndexGlobal, pField.name, "areaMonitoreo", val)
                        }
                      >
                        <Input style={excel.inputLikeCell} />
                      </AutoComplete>
                    </Form.Item>
                  </div>
                </td>

                <td style={cellStyle(false)}>
                  <div style={excel.cell}>
                    <Form.Item name={nameBase(pField.name, "posicionTrabajo")} style={{ margin: 0 }}>
                      <AutoComplete
                        disabled={disabled}
                        options={posiciones}
                        onChange={(val) =>
                          syncSharedPointField(blockIndexGlobal, pField.name, "posicionTrabajo", val)
                        }
                        onSelect={(val) =>
                          syncSharedPointField(blockIndexGlobal, pField.name, "posicionTrabajo", val)
                        }
                      >
                        <Input disabled={disabled} style={excel.inputLikeCell} />
                      </AutoComplete>
                    </Form.Item>
                  </div>
                </td>

                <td style={cellStyle(false)}>
                  <div style={excel.cell}>
                    <Form.Item name={nameBase(pField.name, "descripcionPunto")} style={{ margin: 0 }}>
                      <Input
                        disabled={disabled}
                        style={excel.inputLikeCell}
                        onChange={(e) =>
                          syncSharedPointField(
                            blockIndexGlobal,
                            pField.name,
                            "descripcionPunto",
                            e.target.value
                          )
                        }
                      />
                    </Form.Item>
                  </div>
                </td>

                <td style={cellStyle(false)}>
                  <div style={{ ...excel.cell, display: "flex", justifyContent: "center" }}>
                    <Form.Item
                      name={nameBase(pField.name, "refl_paredes")}
                      valuePropName="checked"
                      style={{ margin: 0 }}
                    >
                      <Switch
                        disabled={disabled}
                        onChange={(checked) => {
                          if (checked) {
                            form.setFields([
                              { name: [...basePath, "refl_plano_trabajo"], value: false },
                            ]);
                          }
                        }}
                      />
                    </Form.Item>
                  </div>
                </td>

                <td style={cellStyle(false)}>
                  <div style={{ ...excel.cell, display: "flex", justifyContent: "center" }}>
                    <Form.Item
                      name={nameBase(pField.name, "refl_plano_trabajo")}
                      valuePropName="checked"
                      style={{ margin: 0 }}
                    >
                      <Switch
                        disabled={disabled}
                        onChange={(checked) => {
                          if (checked) {
                            form.setFields([{ name: [...basePath, "refl_paredes"], value: false }]);
                          }
                        }}
                      />
                    </Form.Item>
                  </div>
                </td>

                {["lux1E2", "lux2E2", "lux3E2"].map((k) => (
                  <td key={k} style={cellStyle(false)}>
                    <div style={excel.cell}>
                      <Form.Item name={nameBase(pField.name, k)} style={{ margin: 0 }}>
                        <Input disabled={disabled} style={excel.inputLikeCell} />
                      </Form.Item>
                    </div>
                  </td>
                ))}

                {["lux1E1", "lux2E1", "lux3E1"].map((k) => (
                  <td key={k} style={cellStyle(false)}>
                    <div style={excel.cell}>
                      <Form.Item name={nameBase(pField.name, k)} style={{ margin: 0 }}>
                        <Input disabled={disabled} style={excel.inputLikeCell} />
                      </Form.Item>
                    </div>
                  </td>
                ))}

                <td style={cellStyle(false)}>
                  <div style={excel.cell}>
                    <Form.Item name={nameBase(pField.name, "nivelMinimo")} style={{ margin: 0 }}>
                      <InputNumber
                        disabled={disabled}
                        min={0}
                        step={0.01}
                        style={excel.inputLikeCell}
                      />
                    </Form.Item>
                  </div>
                </td>

                <td style={cellStyle(false)}>
                  <div style={{ ...excel.cell, display: "flex", justifyContent: "center" }}>
                    <Button
                      danger
                      size="small"
                      style={excel.actionBtn}
                      disabled={disabled || puntoFields.length === 1}
                      onClick={() => onRemovePoint(pField.name)}
                    >
                      Quitar
                    </Button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    );
  }

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
              <div style={ui.subtitle}>Iluminación Natural (NAT) — Puntos de Muestreo</div>
            </div>

            <div style={ui.headerRight}>
              <span style={styles.chip}>{isDirty ? "Cambios sin guardar" : "Sin cambios"}</span>

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

          <div style={ui.toolbar}>
            <Space wrap>
              <span style={styles.chip}>{isDirty ? "Cambios sin guardar" : "Sin cambios"}</span>
            </Space>
            <Text type="secondary">Cada set contiene 3 bloques sincronizados</Text>
          </div>

          <Form.List name="bloques">
            {(bloqueFields, { add, remove }) => {
              const totalSets = getTotalSets(bloqueFields.length);

              return (
                <div style={{ display: "grid", gap: 12, minWidth: 0 }}>
                  {/* Toolbar real */}
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
                        Agregar set (Inicio / Intermedia / Final)
                      </Button>

                      <span style={styles.chip}>Total bloques: {bloqueFields.length}</span>
                    </div>

                    {isDirty ? <Text type="warning">Cambios sin guardar</Text> : <Text type="secondary">OK</Text>}
                  </div>

                  {/* ✅ Tabs sin romper layout */}
                  <div style={{ minWidth: 0, maxWidth: "100%" }}>
                    <div style={tabWrap}>
                      <Tabs
                        type="card"
                        size="small"
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
                                      const ok = removeSetBySetIndex(
                                        setIndex,
                                        remove,
                                        bloqueFields.length
                                      );
                                      if (ok) {
                                        setActiveSetKey((prev) => {
                                          const cur = Number(prev);
                                          const next = Math.max(0, Math.min(cur, totalSets - 2));
                                          return String(next);
                                        });
                                      }
                                    }}
                                  >
                                    Quitar este set
                                  </Button>
                                </div>
                                <div style={{ minWidth: 0, maxWidth: "100%", overflowX: "hidden" }}>
                                <Collapse
                                  destroyInactivePanel={false}  // ✅ NO desmonta: mejor UX + conserva estado
                                  style={{
                                    background: "transparent",
                                    border: "none",
                                  }}
                                  activeKey={openPanelsBySet[setIndex] ?? []}
                                  onChange={(keys) => {
                                    const next = normalizeKeys(keys);
                                    setOpenPanelsBySet((prev) => ({ ...prev, [setIndex]: next }));
                                    // restaura scroll de los paneles que se acaban de abrir
                                    next.forEach((k) => restorePointsScroll(k));
                                  }}
                                  expandIconPosition="end"
                                >
                                {bloqueFields.slice(start, end).map((bloqueField, localIdx) => {
                                  const i = start + localIdx;
                                  const meta = BLOQUES[localIdx];

                                  const panelKey = String(bloqueField.key);

                                  return (
                                    <Collapse.Panel
                                      key={panelKey}
                                      header={
                                        <div style={{ display: "flex", flexDirection: "column" }}>
                                          <b>
                                            Hoja de Campo #{i + 1} — {meta.label}
                                          </b>
                                          <Text type="secondary">
                                            Los campos compartidos del punto se sincronizan entre Inicio/Intermedia/Final.
                                          </Text>
                                        </div>
                                      }
                                      // IMPORTANTÍSIMO: quita padding del content-box del Panel
                                      style={{
                                        background: "transparent",
                                        border: "none",
                                      }}
                                      >
                                        <div style={{ minWidth: 0}}>
                                      <Card
                                        key={bloqueField.key}
                                        style={{ ...styles.card, minWidth: 0 }}
                                        bodyStyle={{ padding: SZ.pad, minWidth: 0, overflow: "hidden" }}
                                        title={
                                          <Space direction="vertical" style={{ width: "100%" }}>
                                            <b>
                                              Hoja de Campo #{i + 1} — {meta.label}
                                            </b>
                                            <Text type="secondary">
                                              Los campos compartidos del punto se sincronizan entre Inicio/Intermedia/Final.
                                            </Text>
                                          </Space>
                                        }
                                      >
                                        {/* IDs ocultos */}
                                        <Form.Item name={[bloqueField.name, "idHoja"]} hidden>
                                          <Input />
                                        </Form.Item>
                                        <Form.Item name={[bloqueField.name, "id"]} hidden>
                                          <Input />
                                        </Form.Item>
                                        <Form.Item name={[bloqueField.name, "idDataMonitoreo"]} hidden>
                                          <Input />
                                        </Form.Item>
                                        <Form.Item name={[bloqueField.name, "tipo"]} hidden>
                                          <Input />
                                        </Form.Item>

                                        <Row gutter={[SZ.gap, 8]}>
                                          <Col xs={24} sm={12} lg={8}>
                                            <Form.Item
                                              label="Fecha de Monitoreo"
                                              name={[bloqueField.name, "fechaMonitoreo"]}
                                            >
                                              <DatePicker size={SZ.input} style={{ width: "100%" }} />
                                            </Form.Item>
                                          </Col>

                                          <Col xs={24} sm={12} lg={8}>
                                            <Form.Item
                                              label={`Hora ${meta.label.toLowerCase()}`}
                                              name={[bloqueField.name, meta.timeField]}
                                            >
                                              <TimePicker size={SZ.input} format="HH:mm" style={{ width: "100%" }} />
                                            </Form.Item>
                                          </Col>

                                          <Col xs={24} sm={12} lg={8}>
                                            <Form.Item
                                              label="Influye la Luz"
                                              name={[bloqueField.name, "influenciaLuz"]}
                                              valuePropName="checked"
                                            >
                                              <Switch />
                                            </Form.Item>
                                          </Col>

                                          <Col xs={24}>
                                            <Form.Item
                                              label="Observaciones"
                                              name={[bloqueField.name, "observaciones"]}
                                            >
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
                                              <div style={{ minWidth: 0, maxWidth: "100%" }}>
                                                <div 
                                                    style={pointsWrapStyle}
                                                    ref={(el) => {
                                                      if (el) pointsWrapRef.current[panelKey] = el; // ✅ asigna ref
                                                    }}
                                                    onScroll={(e) => {
                                                      pointsScrollLeftRef.current[panelKey] = e.currentTarget.scrollLeft; // ✅ guarda scroll
                                                    }}
                                                    >
                                                  <div style={{ display: "inline-block", minWidth: 1850 }}>
                                                    <PuntosExcelSheet
                                                      puntoFields={puntoFields}
                                                      bloqueField={bloqueField}
                                                      blockIndexGlobal={i}
                                                      disabled={disabled}
                                                      form={form}
                                                      autoCompleteOptions={autoCompleteOptions}
                                                      syncSharedPointField={syncSharedPointField}
                                                      onRemovePoint={(pointIndex) => removePointFromSet(i, pointIndex)}
                                                      posiciones={posicion}
                                                    />
                                                  </div>
                                                </div>
                                                {swipeHint}
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
                </div>
              );
            }}
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
    maxWidth: 1400,
    margin: "0 auto",
    overflowX: "hidden",
    paddingBottom: isSmall ? 96 : 92, // ✅ evita que bottom bar tape contenido
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
    flexWrap: "wrap",
  },

  toolbarLeft: {
    display: "flex",
    gap: 10,
    flexWrap: "wrap",
    alignItems: "center",
  },

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

  // ✅ bottom bar fixed
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
    whiteSpace: "nowrap",
  },
};

const excel = {
  table: {
    width: "max-content",
    minWidth: 1850,
    maxWidth: "none",
    borderCollapse: "collapse",
    tableLayout: "fixed",
  },

  th: {
    position: "sticky",
    top: 0,
    zIndex: 3,
    background: "#f8fafc",
    fontSize: 12,
    fontWeight: 700,
    color: "#334155",
    borderBottom: "1px solid #e6eaf2",
    borderRight: "1px solid #e6eaf2",
    padding: "8px 10px",
    textAlign: "left",
    whiteSpace: "nowrap",
  },

  td: {
    borderBottom: "1px solid #e6eaf2",
    borderRight: "1px solid #e6eaf2",
    padding: 0,
    verticalAlign: "middle",
  },

  cell: { padding: "2px 6px" },

  stickyCol: {
    position: "sticky",
    left: 0,
    zIndex: 2,
    background: "#fff",
  },

  inputLikeCell: {
    width: "100%",
    border: "none",
    boxShadow: "none",
    borderRadius: 0,
    padding: "6px 6px",
    background: "transparent",
  },

  actionBtn: { padding: "0 6px" },
};
