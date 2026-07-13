import React, { useState, useEffect } from "react";
import { Form, Input, Button, Row, Col, message, Spin } from "antd";
import {
  getCalibracion,
  createCalibracion,
  updateCalibracion,
  updateVibracionesCampo
} from "../../apis/ApiCampo/ApiVibraciones";

function FormCalibracion({vibracionId, calibradorId, onSuccess }) {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const isEditing = Boolean(calibradorId);

  useEffect(() => {
    const cargarDatos = async () => {
      if (!calibradorId) {
        form.resetFields();
        return;
      }
      try {
        setLoading(true);
        const res = await getCalibracion(calibradorId);
        form.setFieldsValue(res.data);
      } catch {
        message.error("No se pudieron cargar los datos de calibración");
      } finally {
        setLoading(false);
      }
    };
    cargarDatos();
  }, [calibradorId, form]);

  const handleFinish = async (values) => {
    try {
      setSubmitting(true);
      if (isEditing) {
        await updateCalibracion(calibradorId, values);
        message.success("Calibración actualizada correctamente");
      } else {
        const res = await createCalibracion(values);
        await updateVibracionesCampo(vibracionId,{
            calibracion: res.data.id,
        });
        message.success("Calibración creada correctamente");
      }
      form.resetFields();
      onSuccess?.();
    } catch {
      message.error("Error al guardar la calibración");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Spin spinning={loading} tip="Cargando datos de calibración...">
      <Form
        form={form}
        layout="vertical"
        onFinish={handleFinish}
        style={{ maxWidth: 800, margin: "0 auto" }}
      >
        <Row gutter={[16, 0]}>
          <Col xs={24} sm={8}>
            <Form.Item name="marca" label="Marca">
              <Input placeholder="Marca del calibrador" />
            </Form.Item>
          </Col>
          <Col xs={24} sm={8}>
            <Form.Item name="modelo" label="Modelo">
              <Input placeholder="Modelo del calibrador" />
            </Form.Item>
          </Col>
          <Col xs={24} sm={8}>
            <Form.Item name="serie" label="Serie">
              <Input placeholder="Número de serie" />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={[16, 0]}>
          <Col xs={8}>
            <Form.Item name="initial_x" label="Initial X">
              <Input placeholder="X inicial" />
            </Form.Item>
          </Col>
          <Col xs={8}>
            <Form.Item name="initial_y" label="Initial Y">
              <Input placeholder="Y inicial" />
            </Form.Item>
          </Col>
          <Col xs={8}>
            <Form.Item name="initial_z" label="Initial Z">
              <Input placeholder="Z inicial" />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={[16, 0]}>
          <Col xs={8}>
            <Form.Item name="final_x" label="Final X">
              <Input placeholder="X final" />
            </Form.Item>
          </Col>
          <Col xs={8}>
            <Form.Item name="final_y" label="Final Y">
              <Input placeholder="Y final" />
            </Form.Item>
          </Col>
          <Col xs={8}>
            <Form.Item name="final_z" label="Final Z">
              <Input placeholder="Z final" />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item style={{ textAlign: "right", marginTop: 24 }}>
          <Button type="primary" htmlType="submit" loading={submitting}>
            {isEditing ? "Actualizar Calibración" : "Crear Calibración"}
          </Button>
        </Form.Item>
      </Form>
    </Spin>
  );
}

export default FormCalibracion;
