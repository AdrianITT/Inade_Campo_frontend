import React, { useEffect, useMemo, useState } from "react";
import { Table, Button, Typography, Row, Col, Input, Tag, Tooltip, Card, Space, Grid } from "antd";
import { Link } from "react-router-dom";
import dayjs from "dayjs";
import { getAllCustodiaExterna } from "../../apis/ApiCustodiaExterna/ApiCustodiaExtern";

const { Title } = Typography;
const { Search } = Input;
const { useBreakpoint }= Grid;

const colorPrioridad = (codigo) => {
  // Ajusta a tus códigos reales: A/B/C o 1/2/3, etc.
  const map = {
    A: "red",
    B: "orange",
    C: "gold",
    1: "red",
    2: "orange",
    3: "gold",
  };
  return map[codigo] || "blue";
};

const colorEstado = (estado) => {
  // Puedes mapear por id o descripción
  const id = estado?.id;
  const desc = (estado?.descripcion || "").toLowerCase();

  if (id === 1 || desc.includes("proceso")) return "processing";
  if (id === 2 || desc.includes("entreg")) return "geekblue";
  if (id === 3 || desc.includes("complet")) return "green";
  return "default";
};

const CustodiasExterna = () => {
  const [dataSource, setDataSource] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState("");
  const screens = useBreakpoint();
  const isMobile = !screens.md;

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const res = await getAllCustodiaExterna();
        setDataSource(Array.isArray(res?.data) ? res.data : []);
      } catch (e) {
        console.error("Error al obtener datos:", e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  // Utilidad: valores únicos para filtros dinámicos
  const getUniqueValues = (data, path) => {
    const values = data
      .map((item) => path.reduce((acc, curr) => (acc ? acc[curr] : undefined), item))
      .filter((v) => v != null);
    return [...new Set(values)];
  };

  // Filtros dinámicos
  const fechaFinalFilters = useMemo(
    () => getUniqueValues(dataSource, ["custodiaExterna", "fechaFinal"]).map((v) => ({ text: v, value: v })),
    [dataSource]
  );
  const codigoOTFilters = useMemo(
    () => getUniqueValues(dataSource, ["ordenTrabajo", "codigo"]).map((v) => ({ text: v, value: v })),
    [dataSource]
  );
  const empresaFilters = useMemo(
    () => getUniqueValues(dataSource, ["empresa", "nombre"]).map((v) => ({ text: v, value: v })),
    [dataSource]
  );
  const prioridadFilters = useMemo(
    () => getUniqueValues(dataSource, ["prioridad", "codigo"]).map((v) => ({ text: v, value: v })),
    [dataSource]
  );
  const estadoFilters = useMemo(
    () => getUniqueValues(dataSource, ["estado", "descripcion"]).map((v) => ({ text: v, value: v })),
    [dataSource]
  );

  // Búsqueda global sencilla (cliente)
  const filteredBySearch = useMemo(() => {
    const q = searchText.trim().toLowerCase();
    if (!q) return dataSource;
    return dataSource.filter((r) => {
      const ot = r?.ordenTrabajo?.codigo || "";
      const emp = r?.empresa?.nombre || "";
      const fecha = r?.custodiaExterna?.fechaFinal || "";
      const prio = `${r?.prioridad?.codigo || ""}-${r?.prioridad?.descripcion || ""}`;
      const est = r?.estado?.descripcion || "";
      return [ot, emp, fecha, prio, est].some((x) => String(x).toLowerCase().includes(q));
    });
  }, [dataSource, searchText]);

  const baseCols = useMemo(() => ([
      {
        title: "Código OT",
        dataIndex: ["ordenTrabajo", "codigo"],
        key: "codigoOT",
        filters: codigoOTFilters,
        filterSearch: true,
        onFilter: (v, r) => r?.ordenTrabajo?.codigo === v,
        sorter: (a,b) => (a?.ordenTrabajo?.codigo || "").localeCompare(b?.ordenTrabajo?.codigo || ""),
        ellipsis: true,
        width: 140,
        render: (val) => val ? <Tooltip title={val}><span>{val}</span></Tooltip> : "—",
      },
      {
        title: "Empresa",
        dataIndex: ["empresa", "nombre"],
        key: "empresa",
        filters: empresaFilters,
        filterSearch: true,
        onFilter: (v,r) => r?.empresa?.nombre === v,
        sorter: (a,b) => (a?.empresa?.nombre || "").localeCompare(b?.empresa?.nombre || ""),
        ellipsis: true,
        width: 220,
        render: (val) => val ? <Tooltip title={val}>{val}</Tooltip> : "—",
        responsive: ["sm", "md", "lg", "xl"],
      },
      {
        title: "Fecha Final",
        dataIndex: ["custodiaExterna", "fechaFinal"],
        key: "fechaFinal",
        filters: fechaFinalFilters,
        filterSearch: true,
        onFilter: (v,r) => r?.custodiaExterna?.fechaFinal === v,
        sorter: (a,b) => new Date(a?.custodiaExterna?.fechaFinal || 0) - new Date(b?.custodiaExterna?.fechaFinal || 0),
        render: (val) => val ? dayjs(val).format("YYYY-MM-DD") : "—",
        width: 140,
        responsive: ["md", "lg", "xl"],
      },
      {
        title: "Prioridad",
        key: "prioridad",
        filters: prioridadFilters,
        filterSearch: true,
        onFilter: (v,r) => r?.prioridad?.codigo === v,
        sorter: (a,b) => String(a?.prioridad?.codigo || "").localeCompare(String(b?.prioridad?.codigo || "")),
        render: (_, r) => {
          const { codigo, descripcion } = r?.prioridad || {};
          return <Tag color={colorPrioridad(codigo)} style={{ marginInlineEnd: 0 }}>
            {codigo ? `${codigo} — ${descripcion || ""}` : "—"}
          </Tag>;
        },
        width: 180,
        responsive: ["sm", "md", "lg", "xl"],
      },
      {
        title: "Estado",
        dataIndex: ["estado", "descripcion"],
        key: "estado",
        filters: estadoFilters,
        filterSearch: true,
        onFilter: (v,r) => r?.estado?.descripcion === v,
        sorter: (a,b) => (a?.estado?.descripcion || "").localeCompare(b?.estado?.descripcion || ""),
        render: (_, r) => <Tag color={colorEstado(r?.estado)} style={{ marginInlineEnd: 0 }}>
          {r?.estado?.descripcion || "—"}
        </Tag>,
        width: 160,
      },
      {
        title: "Acción",
        key: "action",
        width: 110,
        render: (_, r) => (
          <Link to={`/DetallesCustodiaExternas/${r?.custodiaExterna?.id}`}>
            <Button size="small" type="primary">Detalles</Button>
          </Link>
        ),
      },
    ]), [codigoOTFilters, empresaFilters, fechaFinalFilters, prioridadFilters, estadoFilters]);
    //pantalla Movil
    const columns = useMemo(() => {
    if (isMobile) {
      const keep = new Set(["codigoOT", "estado", "action", "empresa"]); // deja 2–3 columnas clave
      return baseCols
        .filter(c => keep.has(c.key))
        .map(c => ({ ...c, fixed: undefined, width: undefined })); // suelta anchos/fijos
    }
    return baseCols.map(c => {
      if (c.key === "codigoOT") return { ...c, fixed: "left" };
      if (c.key === "action") return { ...c, fixed: "right" };
      return c;
    });
  }, [baseCols, isMobile]);

  return (
    <div style={{ padding: 16 }}>
      <Card
        bordered={false}
        style={{ maxWidth: 1200, margin: "0 auto" }}
        bodyStyle={{ padding: 16 }}
      >
        <Row justify="space-between" align="middle" style={{ marginBottom: 12 }}>
          <Col>
            <Title level={3} style={{ margin: 0 }}>Custodias Externas</Title>
          </Col>
          <Col>
            <Space>
              <Search
                allowClear
                placeholder="Buscar (OT, empresa, estado, etc.)"
                onChange={(e) => setSearchText(e.target.value)}
                style={{ width: 280 }}
              />
              <Link to="/crearCustodiaExterna">
                <Button type="primary">Crear custodia externa</Button>
              </Link>
            </Space>
          </Col>
        </Row>

        <Table
          dataSource={filteredBySearch}
          columns={columns}
          loading={loading}
          rowKey={(record) => record?.custodiaExterna?.id}
          size={isMobile ? "small" : "middle"}
          bordered={!isMobile}
          sticky={!isMobile}                          
          pagination={{
            defaultPageSize: 10,
            showSizeChanger: !isMobile,
            pageSizeOptions: [5, 10, 20, 50],
            simple: isMobile,                
          }}
          scroll={{
            x: isMobile ? "max-content" : 1000,        // móvil deja fluir
            y: isMobile ? undefined : 520,
          }}
          locale={{
            emptyText: loading ? "Cargando..." : "No hay datos",
          }}
        />
      </Card>
    </div>
  );
};

export default CustodiasExterna;
