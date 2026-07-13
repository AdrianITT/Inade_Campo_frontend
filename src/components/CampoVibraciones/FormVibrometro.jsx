import React, { useState, useEffect } from "react";
import { Form, Select, Button, Spin, message } from "antd";
import {
  getMachineVibracion,
  updateVibracionesCampo,
} from "../../apis/ApiCampo/ApiVibraciones";

function FormVibrometro({ vibracionId, inventarioMaquinaId, onSuccess }) {
  const [form] = Form.useForm();
  const [machines, setMachines] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const cargarMaquinas = async () => {
      try {
        setLoading(true);
        const res = await getMachineVibracion();
        setMachines(res.data.machines);
        if (inventarioMaquinaId) {
          form.setFieldsValue({ inventarioMaquinas: inventarioMaquinaId });
        }
      } catch {
        message.error("Error al cargar máquinas");
      } finally {
        setLoading(false);
      }
    };
    cargarMaquinas();
  }, [inventarioMaquinaId, form]);

  const handleFinish = async (values) => {
    try {
      setSubmitting(true);
      await updateVibracionesCampo(vibracionId, {
        inventarioMaquinas: values.inventarioMaquinas,
      });
      message.success("Vibrómetro actualizado correctamente");
      form.resetFields();
      onSuccess?.();
    } catch {
      message.error("Error al guardar el vibrómetro");
    } finally {
      setSubmitting(false);
    }
  };

  const options = machines.map((m) => ({
    value: m.id,
    label: `${m.equipoId} — ${m.marca} ${m.modelo}`,
  }));

  return (
    <Spin spinning={loading} tip="Cargando máquinas...">
      <Form
        form={form}
        layout="vertical"
        onFinish={handleFinish}
        style={{ maxWidth: 600, margin: "0 auto" }}
      >
        <Form.Item
          name="inventarioMaquinas"
          label="Vibrómetro / Máquina"
        >
          <Select
            showSearch
            placeholder="Selecciona una máquina"
            options={options}
            filterOption={(input, option) =>
              option.label.toLowerCase().includes(input.toLowerCase())
            }
            allowClear
            notFoundContent="No hay máquinas disponibles"
          />
        </Form.Item>

        <Form.Item style={{ textAlign: "right" }}>
          <Button type="primary" htmlType="submit" loading={submitting}>
            Guardar
          </Button>
        </Form.Item>
      </Form>
    </Spin>
  );
}

export default FormVibrometro;
