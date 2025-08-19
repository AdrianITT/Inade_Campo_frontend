import React, { useState } from "react";
import { Modal, Button, Form, Input, DatePicker, TimePicker, Card, Row, Col, message } from "antd";

const ModalEntregaRecibe = ({ visible, onOk, onCancel}) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();

  // Abre el modal
  const showModal = () => setOpen(true);

  // Cierra el modal y reinicia el formulario
  const handleCancel = () => {
    form.resetFields();
    setOpen(false);
  };

  // Envía el formulario
  const handleOk = async () => {
    try {
      await form.validateFields();
      setLoading(true);
      const valores = form.getFieldsValue();
      console.log("📦 Datos enviados:", valores);
      /* Aquí iría tu llamada a la API
         await apiGuardarEntregaRecibe(valores);
      */
      message.success("Datos guardados correctamente");
      handleCancel();
    } catch (err) {
      console.error(err);
      // Si err viene de validateFields, no hagas nada (los errores ya se muestran)
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Modal
      open={visible}
      onOk={() => onOk(form)}   // le pasas el form al padre si quieres
      onCancel={onCancel}
      confirmLoading={loading}
      title="Registro de Entrega y Recepción"
      okText="Guardar"
      destroyOnClose
      width={600}
      >
        <Form
          form={form}
          layout="vertical"
          initialValues={{
            entregaHora: null,
            entregaFecha: null,
            recibeHora: null,
            recibeFecha: null,
          }}
        >
          {/* Card de Entrega */}
          <Card title="Entrega" size="small" style={{ marginBottom: 16 }}>
            <Row gutter={16}>
              <Col span={24}>
                <Form.Item
                  label="Nombre"
                  name="entregaNombre"
                  rules={[{ required: true, message: "Ingrese el nombre" }]}
                >
                  <Input placeholder="Nombre quien entrega" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  label="Hora"
                  name="entregaHora"
                  rules={[{ required: true, message: "Seleccione la hora" }]}
                >
                  <TimePicker format="HH:mm" style={{ width: "100%" }} />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  label="Fecha"
                  name="entregaFecha"
                  rules={[{ required: true, message: "Seleccione la fecha" }]}
                >
                  <DatePicker format="DD/MM/YYYY" style={{ width: "100%" }} />
                </Form.Item>
              </Col>
            </Row>
          </Card>

          {/* Card de Recibe */}
          <Card title="Recibe" size="small">
            <Row gutter={16}>
              <Col span={24}>
                <Form.Item
                  label="Nombre"
                  name="recibeNombre"
                  rules={[{ required: true, message: "Ingrese el nombre" }]}
                >
                  <Input placeholder="Nombre quien recibe" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  label="Hora"
                  name="recibeHora"
                  rules={[{ required: true, message: "Seleccione la hora" }]}
                >
                  <TimePicker format="HH:mm" style={{ width: "100%" }} />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  label="Fecha"
                  name="recibeFecha"
                  rules={[{ required: true, message: "Seleccione la fecha" }]}
                >
                  <DatePicker format="DD/MM/YYYY" style={{ width: "100%" }} />
                </Form.Item>
              </Col>
              <Col span={24}>
                <Form.Item
                  label="Temperatura (°C)"
                  name="temperatura"
                  rules={[{ required: true, message: "Ingrese la temperatura" }]}
                >
                  <Input placeholder="Temperatura" />
                </Form.Item>
              </Col>
            </Row>
          </Card>
        </Form>
      </Modal>
    </>
  );
};

export default ModalEntregaRecibe;
