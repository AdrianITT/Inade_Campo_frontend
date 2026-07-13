import React from "react";
import { Form, Input, Row, Col, DatePicker } from "antd";

/**
 * Componente DatosGenerales
 * Renderiza los campos de datos principales optimizados
 */
const DatosGenerales = () => {
  return (
    <>
      <Row gutter={16}>
        <Col xs={24} sm={12}>
          <Form.Item
            label="Fecha Monitoreo"
            name="fechaMonitoreo"
            rules={[{ required: true, message: "Selecciona la fecha" }]}
          >
            <DatePicker style={{ width: "100%" }} format="DD/MM/YYYY" />
          </Form.Item>
        </Col>

        <Col xs={24} sm={12}>
          <Form.Item
            label="Dirección de Planta / Sucursal"
            name="direccion"
          >
            <Input placeholder="Ubicación física del inmueble" />
          </Form.Item>
        </Col>
      </Row>

      <Form.Item
        label="Observaciones Generales"
        name="observacion"
      >
        <Input.TextArea
          rows={2} // Menos espacio inicial, crece si es necesario
          autoSize={{ minRows: 2, maxRows: 6 }}
          placeholder="Notas adicionales encontradas durante el reconocimiento técnico..."
        />
      </Form.Item>
    </>
  );
};

export default DatosGenerales;