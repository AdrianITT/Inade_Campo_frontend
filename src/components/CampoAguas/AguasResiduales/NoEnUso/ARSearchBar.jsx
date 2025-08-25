// src/pages/AguasResiduales/GenerarOrden/components/ARSearchBar.jsx
import React from "react";
import { Input, Space, Button } from "antd";
import { Link } from "react-router-dom";

const { Search } = Input;

export default function ARSearchBar({ value, onSearch, isMobile }) {
  return (
    <Space wrap>
      <Search
        allowClear
        placeholder="Buscar (OT, cliente, empresa, estado, etc.)"
        value={value}
        onChange={(e) => onSearch(e.target.value)}
        onSearch={onSearch}
        style={{ width: isMobile ? 240 : 320 }}
      />
      <Link to="/OrdenTrabajo">
        <Button type="primary">Agregar Nuevo Informe AR</Button>
      </Link>
    </Space>
  );
}
