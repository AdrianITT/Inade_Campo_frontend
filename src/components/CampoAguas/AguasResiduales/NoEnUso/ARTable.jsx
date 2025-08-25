// src/pages/AguasResiduales/GenerarOrden/components/ARTable.jsx
import React from "react";
import { Table } from "antd";

export default function ARTable({
  data,
  columns,
  isMobile,
  currentPage,
  pageSize,
  onPageChange,
  filteredLength, // ahora es total del servidor
}) {
  return (
    <>
      <Table
        rowKey="id"
        dataSource={data}
        columns={columns}
        size={isMobile ? "small" : "middle"}
        bordered={!isMobile}
        sticky={!isMobile}
        pagination={{
          current: currentPage,
          pageSize,
          total: filteredLength, // 👈 importante para server-side
          onChange: onPageChange,
          showSizeChanger: !isMobile,
          simple: isMobile,
          pageSizeOptions: [5, 10, 20, 50, 100],
          showTotal: !isMobile ? (total, range) => `${range[0]}–${range[1]} de ${total} registros` : undefined,
        }}
        scroll={{
          x: isMobile ? "max-content" : 1000,
          y: isMobile ? undefined : 520,
        }}
        locale={{ emptyText: "Sin resultados" }}
      />
    </>
  );
}
