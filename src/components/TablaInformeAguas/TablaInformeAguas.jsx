import React, { useState } from "react";
import { Table, Select, Card, Typography, message, Space,Button } from "antd";

const { Option } = Select;
const { Title } = Typography;

// Lista base de elementos disponibles
const allItems = [
  { id: 1, nombre: "Producto A", precio: 100 },
  { id: 2, nombre: "Producto B", precio: 150 },
  { id: 3, nombre: "Producto C", precio: 200 },
  { id: 4, nombre: "Producto D", precio: 250 },
];

 const TablaConBusqueda = () => {
  const [data, setData] = useState([]);
  const [selectedItemId, setSelectedItemId] = useState(null);

  const handleAddItem = () => {
    if (!selectedItemId) {
      message.warning("Selecciona un producto primero.");
      return;
    }

    const item = allItems.find((i) => i.id === parseInt(selectedItemId));
    if (!item) {
      message.error("Elemento no encontrado.");
      return;
    }

    const exists = data.find((i) => i.id === item.id);
    if (exists) {
      message.warning("Este elemento ya está en la tabla.");
      return;
    }

    setData([...data, item]);
    setSelectedItemId(null); // limpiar selección
  };


  const columns = [
    { title: "ID", dataIndex: "id", key: "id" },
    { title: "Nombre", dataIndex: "nombre", key: "nombre" },
    { title: "Precio", dataIndex: "precio", key: "precio" },
    {
      title: "Acciones",
      key: "actions",
      render: (_, record) => (
     <Space>
        <Button
          type="red"
          danger
          onClick={() => {
            setData(data.filter((item) => item.id !== record.id));
            message.success("Producto eliminado de la tabla.");
          }}
          >
          Eliminar
        </Button>
        <Button
        type="primary"
        onClick={()=>"navigate to details page or show details modal"}
        >
          Ver Detalles
        </Button>
     </Space>
      ),
    },
  ];

  return (
<Card style={{ maxWidth: 600, margin: "auto", marginTop: 40 }}>
      <Title level={4}>Agregar productos a la tabla</Title>

      <Space style={{ marginBottom: 20 }} align="start">
        <Select
          showSearch
          value={selectedItemId}
          placeholder="Buscar por ID o nombre"
          style={{ width: 300 }}
          optionFilterProp="children"
          onChange={value => setSelectedItemId(value)}
          filterOption={(input, option) =>
            option?.children.toLowerCase().includes(input.toLowerCase())
          }
        >
          {allItems.map((item) => (
            <Option key={item.id} value={item.id}>
              {item.id} - {item.nombre}
            </Option>
          ))}
        </Select>

        <Button type="primary" onClick={handleAddItem}>
          Agregar a la tabla
        </Button>
      </Space>

      <Table
        dataSource={data}
        columns={columns}
        rowKey="id"
        pagination={false}
        bordered
      />
    </Card>
  );
};

export default TablaConBusqueda;
