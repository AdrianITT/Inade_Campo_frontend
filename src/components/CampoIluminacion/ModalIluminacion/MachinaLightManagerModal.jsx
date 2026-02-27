import React, { useEffect, useMemo, useState } from "react";
import {
  Modal,
  Table,
  Button,
  Space,
  Input,
  Form,
  DatePicker,
  InputNumber,
  message,
  Divider,
  Typography,
  Card,
} from "antd";
import dayjs from "dayjs";
import { PlusOutlined, ReloadOutlined, EditOutlined } from "@ant-design/icons";

import {
  getAllMachineLight,
  createMachineLight,
  updateMachineLight,
  getcalibracionesLightforMachineLight,

  createCalibracionLight,
  updateCalibracionLight,
  deleteCalibracionLight,
} from "../../../apis/ApiCampo/IluminacionApi";

const { Text } = Typography;

// =======================
// Modal principal: lista + crear/editar
// =======================
export function MachineLightManagerModal({ open, onCancel }) {
  const [loading, setLoading] = useState(false);
  const [machines, setMachines] = useState([]);
  const [query, setQuery] = useState("");

  // modal "Agregar/Editar"
  const [openUpsert, setOpenUpsert] = useState(false);
  const [editingMachine, setEditingMachine] = useState(null); // null = create, obj = edit

  // ✅ SOLO máquinas (sin calibraciones aquí)
  const fetchMachines = async () => {
    setLoading(true);
    try {
      const r = await getAllMachineLight();
      const rows = Array.isArray(r?.data) ? r.data : [];
      setMachines(rows);
    } catch (e) {
      console.error(e);
      message.error("No se pudieron cargar las máquinas.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!open) return;
    fetchMachines();
    setQuery("");
  }, [open]);

  const dataFiltered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return machines;
    return machines.filter((m) => {
      const s = `${m?.equipoId ?? ""} ${m?.marca ?? ""} ${m?.modelo ?? ""} ${m?.serie ?? ""}`.toLowerCase();
      return s.includes(q);
    });
  }, [machines, query]);

  const columns = [
    { title: "Equipo ID", dataIndex: "equipoId", key: "equipoId" },
    { title: "Marca", dataIndex: "marca", key: "marca" },
    { title: "Modelo", dataIndex: "modelo", key: "modelo" },
    { title: "Serie", dataIndex: "serie", key: "serie" },
    {
      title: "Fecha calibración",
      dataIndex: "fechaCalibracion",
      key: "fechaCalibracion",
      render: (v) => (v ? dayjs(v).format("YYYY-MM-DD") : "-"),
    },
    {
      title: "Acciones",
      key: "actions",
      width: 140,
      render: (_, row) => (
        <Button
          icon={<EditOutlined />}
          onClick={async () => {
            try {
              setLoading(true);
               //console.log(row);
              // ✅ trae calibraciones del machine seleccionado
              const resp = await getcalibracionesLightforMachineLight(row.id);
              //console.log("resp: ",resp);
              const calibs = Array.isArray(resp?.data.calibracionData) ? resp.data.calibracionData : [];

              // ✅ inyecta calibraciones al objeto machine para que el modal las precargue
              setEditingMachine({
                ...row,
                calibraciones: calibs,
              });

              setOpenUpsert(true);
            } catch (e) {
              console.error(e);
              message.error("No se pudieron cargar calibraciones.");
            } finally {
              setLoading(false);
            }
          }}
        >
          Editar
        </Button>
      ),
    },
  ];

  return (
    <>
      <Modal
        open={open}
        title="Máquinas de Luz"
        onCancel={onCancel}
        footer={null}
        width={1100}
      >
        <Space style={{ width: "100%", justifyContent: "space-between" }}>
          <Input
            style={{ maxWidth: 360 }}
            placeholder="Buscar por equipoId / marca / modelo / serie"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />

          <Space>
            <Button icon={<ReloadOutlined />} onClick={fetchMachines}>
              Recargar
            </Button>

            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => {
                setEditingMachine(null); // ✅ create mode
                setOpenUpsert(true);
              }}
            >
              Agregar máquina
            </Button>
          </Space>
        </Space>

        <Divider />

        <Table
          rowKey="id"
          loading={loading}
          columns={columns}
          dataSource={dataFiltered}
          pagination={{ pageSize: 8 }}
        />

        <Text type="secondary">
          Tip: usa “Editar” para modificar una máquina existente o “Agregar máquina”.
        </Text>
      </Modal>

      <UpsertMachineLightModal
        open={openUpsert}
        machine={editingMachine}
        onCancel={() => setOpenUpsert(false)}
        onSaved={async () => {
          setOpenUpsert(false);
          await fetchMachines();
        }}
      />
    </>
  );
}

// =======================
// Modal secundario: crear/editar máquina + calibraciones (hasta 20)
// =======================
function UpsertMachineLightModal({ open, machine, onCancel, onSaved }) {
  const [form] = Form.useForm();
  const [saving, setSaving] = useState(false);

  const isEdit = !!machine?.id;

  useEffect(() => {
    if (!open) return;

    if (isEdit) {
      const calibs =
        Array.isArray(machine?.calibraciones) ? machine.calibraciones :
        Array.isArray(machine?.calibracionesLight) ? machine.calibracionesLight :
        Array.isArray(machine?.calibraciones_data) ? machine.calibraciones_data :
        [];

      form.setFieldsValue({
        equipoId: machine?.equipoId ?? "",
        marca: machine?.marca ?? "",
        modelo: machine?.modelo ?? "",
        serie: machine?.serie ?? "",
        fechaCalibracion: machine?.fechaCalibracion ? dayjs(machine.fechaCalibracion) : null,

        calibraciones:
          calibs.length > 0
            ? calibs.slice(0, 20).map((c) => ({
                id: c?.id ?? null,
                fc: c?.fc !== null && c?.fc !== undefined ? String(c.fc) : null,
                inicial: c?.inicial !== null && c?.inicial !== undefined ? String(c.inicial) : null,
                final: c?.final !== null && c?.final !== undefined ? String(c.final) : null,
              }))
            : [{ id: null, fc: null, inicial: null, final: null }],
      });
    } else {
      form.resetFields();
      form.setFieldsValue({
        equipoId: "",
        marca: "",
        modelo: "",
        serie: "",
        fechaCalibracion: null,
        calibraciones: [{ id: null, fc: null, inicial: null, final: null }],
      });
    }
  }, [open, isEdit, machine, form]);

  const onSave = async () => {
    try {
      const values = await form.validateFields();
      setSaving(true);

      // 1) create/update machine
      const machinePayload = {
        equipoId: values?.equipoId ?? null,
        marca: values?.marca ?? null,
        modelo: values?.modelo ?? null,
        serie: values?.serie ?? null,
        fechaCalibracion: values?.fechaCalibracion
          ? values.fechaCalibracion.format("YYYY-MM-DD")
          : null,
      };

      let machineId = machine?.id ?? null;

      if (machineId) {
        await updateMachineLight(machineId, machinePayload);
      } else {
        const r = await createMachineLight(machinePayload);
        machineId = r?.data?.id;
      }

      if (!machineId) {
        message.error("No se pudo guardar la máquina.");
        return;
      }

      // 2) calibraciones diff (update/create/delete)
      const current = Array.isArray(values?.calibraciones) ? values.calibraciones : [];

      // elimina filas vacías
      const currentNormalized = current
        .filter((c) => c && (c.fc !== null || c.inicial !== null || c.final !== null))
        .slice(0, 20);

      const initialCalibs = Array.isArray(machine?.calibraciones) ? machine.calibraciones : [];
      const initialIds = initialCalibs.map((c) => c?.id).filter(Boolean);
      const currentIds = currentNormalized.map((c) => c?.id).filter(Boolean);

      const deletedIds = initialIds.filter((id) => !currentIds.includes(id));
      for (const id of deletedIds) {
        await deleteCalibracionLight(id);
      }

      for (const c of currentNormalized) {
        const payload = {
          machineLight: machineId,
          fc: c.fc,
          inicial: c.inicial,
          final: c.final,
        };

        if (c?.id) {
          await updateCalibracionLight(c.id, payload);
        } else {
          await createCalibracionLight(payload);
        }
      }

      message.success(isEdit ? "Máquina actualizada" : "Máquina creada");
      onSaved?.();
    } catch (e) {
      if (e?.errorFields) return;
      console.error(e);
      message.error("Error al guardar");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      open={open}
      title={isEdit ? "Editar máquina de luz" : "Agregar máquina de luz"}
      onCancel={onCancel}
      onOk={onSave}
      okText="Guardar"
      cancelText="Cancelar"
      confirmLoading={saving}
      width={950}
    >
      <Form form={form} layout="vertical">
        <Card size="small" title="Datos de la máquina">
          <Space style={{ width: "100%" }} direction="vertical">
            <Space style={{ width: "100%" }} wrap>
              <Form.Item label="Equipo ID" name="equipoId" style={{ minWidth: 200 }}>
                <Input placeholder="PI-07" />
              </Form.Item>
              <Form.Item label="Marca" name="marca" style={{ minWidth: 200 }}>
                <Input placeholder="Lutron" />
              </Form.Item>
              <Form.Item label="Modelo" name="modelo" style={{ minWidth: 200 }}>
                <Input placeholder="Lutron" />
              </Form.Item>
              <Form.Item label="Serie" name="serie" style={{ minWidth: 200 }}>
                <Input placeholder="R.007993" />
              </Form.Item>
              <Form.Item label="Fecha calibración" name="fechaCalibracion" style={{ minWidth: 200 }}>
                <DatePicker style={{ width: "100%" }} />
              </Form.Item>
            </Space>
          </Space>
        </Card>

        <Divider />

        <Card
          size="small"
          title="Calibraciones (máximo 10)"
          extra={
            <Form.Item noStyle shouldUpdate>
              {() => {
                const list = form.getFieldValue("calibraciones") || [];
                const disabledAdd = list.length >= 10;
                return (
                  <Button
                    type="dashed"
                    onClick={() =>
                      form.setFieldsValue({
                        calibraciones: [...list, { id: null, fc: null, inicial: null, final: null }],
                      })
                    }
                    disabled={disabledAdd}
                  >
                    + Agregar calibración
                  </Button>
                );
              }}
            </Form.Item>
          }
        >
          <Form.List name="calibraciones">
            {(fields, { remove }) => (
              <>
                {fields.map((f, idx) => (
                  <Card
                    key={f.key}
                    size="small"
                    style={{ marginBottom: 12 }}
                    title={<b>Calibración #{idx + 1}</b>}
                    extra={
                      <Button danger size="small" onClick={() => remove(f.name)} disabled={fields.length === 1}>
                        Quitar
                      </Button>
                    }
                  >
                    <Form.Item name={[f.name, "id"]} hidden>
                      <Input />
                    </Form.Item>

                    <Space wrap>
                      <Form.Item label="FC" name={[f.name, "fc"]} rules={[{ required: true, message: "Requerido" }]}>
                        <InputNumber stringMode step={0.0001} style={{ width: 180 }} />
                      </Form.Item>

                      <Form.Item label="Inicial" name={[f.name, "inicial"]} rules={[{ required: true, message: "Requerido" }]}>
                        <InputNumber stringMode step={0.0001} style={{ width: 180 }} />
                      </Form.Item>

                      <Form.Item label="Final" name={[f.name, "final"]} rules={[{ required: true, message: "Requerido" }]}>
                        <InputNumber stringMode step={0.0001} style={{ width: 180 }} />
                      </Form.Item>
                    </Space>
                  </Card>
                ))}
              </>
            )}
          </Form.List>

          <Text type="secondary">Si agregas más de 10, solo se guardarán las primeras 10.</Text>
        </Card>
      </Form>
    </Modal>
  );
}