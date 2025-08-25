// src/pages/AguasResiduales/GenerarOrden/columns.js
import { Tooltip, Tag, Button } from "antd";
import { Link } from "react-router-dom";
import { useMemo } from "react";
import { buildAntdFilters } from "./utils/filters";
import { colorEstado } from "./utils/colorEstado";

// Construye columnas base + filtros
export default function useColumns(ordenes, isMobile) {
  const codigoOTFilters = useMemo(
    () => buildAntdFilters(ordenes.map((o) => o.OTcodigo)),
    [ordenes]
  );
  const clienteFilters = useMemo(
    () => buildAntdFilters(ordenes.map((o) => o.contacto)),
    [ordenes]
  );
  const receptorFilters = useMemo(
    () => buildAntdFilters(ordenes.map((o) => o.receptor)),
    [ordenes]
  );
  const empresaFilters = useMemo(
    () => buildAntdFilters(ordenes.map((o) => o.nombreEmpresa)),
    [ordenes]
  );
  const estadoFilters = useMemo(
    () => buildAntdFilters(ordenes.map((o) => o.estado)),
    [ordenes]
  );

  const base = useMemo(
    () => [
      {
        title: "ID",
        dataIndex: "numero",
        key: "numero",
        sorter: (a, b) => Number(a.numero ?? 0) - Number(b.numero ?? 0),
        width: 100,
        responsive: ["xs", "sm", "md", "lg", "xl"],
      },
      {
        title: "Código OT",
        dataIndex: "OTcodigo",
        key: "OTcodigo",
        filters: codigoOTFilters,
        filterSearch: true,
        onFilter: (value, record) => record.OTcodigo === value,
        sorter: (a, b) => (a.OTcodigo || "").localeCompare(b.OTcodigo || ""),
        ellipsis: true,
        width: 160,
        render: (value) => (value ? <Tooltip title={value}><span>{value}</span></Tooltip> : "—"),
      },
      {
        title: "Cliente",
        dataIndex: "contacto",
        key: "contacto",
        filters: clienteFilters,
        filterSearch: true,
        onFilter: (value, record) => record.contacto === value,
        sorter: (a, b) => (a.contacto || "").localeCompare(b.contacto || ""),
        ellipsis: true,
        width: 220,
        render: (value) => (value ? <Tooltip title={value}><span>{value}</span></Tooltip> : "—"),
        responsive: ["sm", "md", "lg", "xl"],
      },
      {
        title: "Recibe",
        dataIndex: "receptor",
        key: "receptor",
        filters: receptorFilters,
        filterSearch: true,
        onFilter: (value, record) => record.receptor === value,
        sorter: (a, b) => (a.receptor || "").localeCompare(b.receptor || ""),
        ellipsis: true,
        width: 200,
        responsive: ["md", "lg", "xl"],
      },
      {
        title: "Empresa",
        dataIndex: "nombreEmpresa",
        key: "nombreEmpresa",
        filters: empresaFilters,
        filterSearch: true,
        onFilter: (value, record) => record.nombreEmpresa === value,
        sorter: (a, b) => (a.nombreEmpresa || "").localeCompare(b.nombreEmpresa || ""),
        ellipsis: true,
        width: 240,
        render: (value) => (value ? <Tooltip title={value}><span>{value}</span></Tooltip> : "—"),
        responsive: ["sm", "md", "lg", "xl"],
      },
      {
        title: "Dirección",
        dataIndex: "direccion",
        key: "direccion",
        ellipsis: true,
        render: (value) => (value ? <Tooltip title={value}><span>{value}</span></Tooltip> : "—"),
        width: 300,
        responsive: ["lg", "xl"],
      },
      {
        title: "Estado",
        dataIndex: "estado",
        key: "estado",
        filters: estadoFilters,
        filterSearch: true,
        onFilter: (value, record) => record.estado === value,
        sorter: (a, b) => (a.estado || "").localeCompare(b.estado || ""),
        width: 160,
        render: (estado) => <Tag color={colorEstado(estado)}>{estado || "—"}</Tag>,
      },
      {
        title: "Opciones",
        key: "opciones",
        width: 120,
        render: (_, record) => (
          <Link to={`/DetallesAguasResiduales/${record.id}`}>
            <Button size="small" type="primary">Detalles</Button>
          </Link>
        ),
      },
    ],
    [codigoOTFilters, clienteFilters, receptorFilters, empresaFilters, estadoFilters]
  );

  // Desktop: fija primera/última
  if (!isMobile) {
    return base.map((col) => {
      if (col.key === "numero") return { ...col, fixed: "left" };
      if (col.key === "opciones") return { ...col, fixed: "right" };
      return col;
    });
  }

  // Móvil: menos columnas, sin fixed/width
  const keysVisibles = new Set(["numero", "OTcodigo", "contacto", "estado", "opciones"]);
  return base
    .filter((c) => keysVisibles.has(c.key))
    .map((c) => ({ ...c, width: undefined, fixed: undefined }));
}
