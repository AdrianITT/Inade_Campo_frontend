import { Form, Input, Button, Checkbox, InputNumber } from "antd";
import { DeleteOutlined } from "@ant-design/icons";

/**
 * Genera las columnas de la tabla de ubicaciones de forma compacta
 * @param {Function} eliminarUbicacion - Callback para eliminar
 * @returns {Array} Array de columnas para Ant Design Table
 */
export const getUbicacionesColumns = (eliminarUbicacion) => [
  {
    title: "Punto",
    width: 85,
    render: (_, field) => (
      <Form.Item
        name={[field.name, "numeroPunto"]}
        style={{ marginBottom: 0 }}
        rules={[{ required: true, message: "" }]} // Validación rápida integrada
      >
        <InputNumber 
          min={1} 
          placeholder="1" 
          style={{ width: "100%", fontWeight: "bold" }} // Negrita para resaltar el autollenado
          size="small" 
        />
      </Form.Item>
    ),
  },
  {
    title: "Área",
    minWidth: 150,
    render: (_, field) => (
      <Form.Item
        name={[field.name, "area"]}
        style={{ marginBottom: 0 }}
      >
        <Input placeholder="Área / Departamento" size="small" />
      </Form.Item>
    ),
  },
  {
    title: "Proceso",
    minWidth: 150,
    render: (_, field) => (
      <Form.Item
        name={[field.name, "proceso"]}
        style={{ marginBottom: 0 }}
      >
        <Input placeholder="Proceso" size="small" />
      </Form.Item>
    ),
  },
  {
    title: "Máquina",
    minWidth: 150,
    render: (_, field) => (
      <Form.Item
        name={[field.name, "maquinaUbicacion"]}
        style={{ marginBottom: 0 }}
      >
        <Input placeholder="Nombre de máquina" size="small" />
      </Form.Item>
    ),
  },
  {
    title: "Actividad",
    minWidth: 150,
    render: (_, field) => (
      <Form.Item
        name={[field.name, "actividad"]}
        style={{ marginBottom: 0 }}
      >
        <Input placeholder="Actividad" size="small" />
      </Form.Item>
    ),
  },
  {
    title: "Conexión",
    width: 90,
    align: "center",
    render: (_, field) => (
      <Form.Item
        name={[field.name, "conexion"]}
        valuePropName="checked"
        style={{ marginBottom: 0 }}
      >
        <Checkbox />
      </Form.Item>
    ),
  },
  {
    title: "",
    width: 50,
    align: "center",
    render: (_, field) => (
      <Button
        danger
        type="text"
        size="small"
        icon={<DeleteOutlined />}
        onClick={() => eliminarUbicacion(field)}
      />
    ),
  },
];