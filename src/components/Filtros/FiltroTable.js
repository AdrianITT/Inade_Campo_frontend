// src/components/Filtros/FiltroTable.js
import React from "react";
import { Table, Button } from "antd";

const FiltroTable = ({ filtros, onEdit }) => {
  const columns = [
    {
      title: "Código",
      dataIndex: "codigo",
      key: "codigo",
    },
    {
      title: "Descripción",
      dataIndex: "descripcion",
      key: "descripcion",
    },
    {
      title: "Acciones",
      key: "acciones",
      render: (_, record) => (
        <Button type="link" onClick={() => onEdit(record)}>
          Editar
        </Button>
      ),
    },
  ];

  return <Table columns={columns} dataSource={filtros} rowKey="id" />;
};

export default FiltroTable;
