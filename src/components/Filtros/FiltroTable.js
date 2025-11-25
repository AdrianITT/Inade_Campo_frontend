// src/components/Filtros/FiltroTable.js
import React from "react";
import { Table, Button } from "antd";

const FiltroTable = ({ filtros, onEdit , total, page, pageSize, onPageChange}) => {
  const columns = [
    {
      title: "Código",
      dataIndex: "codigo",
      key: "codigo",
      width: 100,
    },
    {
      title: "Descripción",
      dataIndex: "descripcion",
      key: "descripcion",
      width: 100,
    },
    {
      title: "Acciones",
      key: "acciones",
      width: 100,
      render: (_, record) => (
        <Button type="link" onClick={() => onEdit(record)}>
          Editar
        </Button>
      ),
    },
  ];

  return <Table size="small" bordered={true} columns={columns} dataSource={filtros} rowKey="id" pagination={{
    current: page,
    pageSize,
    total,
    onChange: onPageChange,
    showSizeChanger: false,
  }} />;
};

export default FiltroTable;
