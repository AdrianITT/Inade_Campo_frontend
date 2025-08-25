// src/components/Filtros/FiltroFormModal.js
import React, { useEffect } from "react";
import { Modal, Form, Input } from "antd";
import { createFiltro, updateFiltro } from "../../apis/ApiCustodiaExterna/ApiFiltro";
const FiltroFormModal = ({ visible, onCancel, onOk, initialValues }) => {
  const [form] = Form.useForm();

  useEffect(() => {
    if (initialValues) {
      form.setFieldsValue(initialValues);
    } else {
      form.resetFields();
    }
  }, [initialValues, form]);

  const handleFinish = () => {
    form.validateFields().then((values) => {
      onOk(values);
    });
  };

  return (
    <Modal
      title={initialValues ? "Editar Filtro" : "Crear Filtro"}
      open={visible}
      onCancel={onCancel}
      onOk={handleFinish}
      okText="Guardar"
    >
      <Form form={form} layout="vertical">
        <Form.Item
          name="codigo"
          label="Código"
          rules={[{ required: true, message: "El código es obligatorio" }]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          name="descripcion"
          label="Descripción"
          initialValue="Sin descripción"
        >
          <Input />
        </Form.Item>
                <Form.Item
          name="estado"
          label="estado"
          initialValue={6}
          hidden>
          <Input />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default FiltroFormModal;
