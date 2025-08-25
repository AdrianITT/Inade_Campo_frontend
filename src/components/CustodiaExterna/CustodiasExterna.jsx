import React, { useEffect, useMemo, useState } from "react";
import { Table, Button, Typography, Row, Col, Input, Tag, Tooltip, Card, Space, Grid } from "antd";
import { Link } from "react-router-dom";
import dayjs from "dayjs";
import { fetchCustodias } from "../../apis/ApiCustodiaExterna/ApiCustodiaExtern"; // <-- usa tu función
const { Title } = Typography;
const { Search } = Input;
const { useBreakpoint }= Grid;

// Helpers de color
const colorPrioridad = (codigo) => {
  const map = { A: "red", B: "orange", C: "gold", 1: "red", 2: "orange", 3: "gold" };
  return map[codigo] || "blue";
};
const colorEstado = (estado) => {
  const id = estado?.id;
  const desc = String(estado?.descripcion ?? "").toLowerCase();
  if (id === 1 || desc.includes("proceso")) return "processing";
  if (id === 2 || desc.includes("entreg")) return "geekblue";
  if (id === 3 || desc.includes("complet")) return "green";
  if (id === 4 || desc.includes("final")) return "cyan";
  return "default";
};

// pequeño hook de debounce
function useDebounced(value, delay=400){
  const [v, setV] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setV(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return v;
}

const CustodiasExterna = () => {
  const screens = useBreakpoint();
  const isMobile = !screens.md;

  // estado UI
  const [searchText, setSearchText] = useState("");
  const q = useDebounced(searchText, 400);

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [ordering, setOrdering] = useState(undefined); // ej: "codigo", "-empresa", etc.

  // datos remotos
  const [rows, setRows] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  const organizacion_id = Number(localStorage.getItem("organizacion_id") || 0) || undefined;

  // cargar del servidor cuando cambie q, página, límite u orden
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        const data = await fetchCustodias({
          q, page: currentPage, limit: pageSize, organizacion_id, ordering
        });
        if (!mounted) return;
        setRows(Array.isArray(data?.results) ? data.results : []);
        setTotal(Number(data?.count ?? 0));
      } catch (e) {
        if (mounted) {
          console.error("Error al obtener custodias:", e);
          setRows([]); setTotal(0);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [q, currentPage, pageSize, ordering, organizacion_id]);

  // columnas (ojo con column.key → lo usamos para 'ordering')
  const baseCols = useMemo(() => ([
      {
        title: "Código OT",
        dataIndex: ["ordenTrabajo", "codigo"],
        key: "codigo",             // 👈 clave que mapeas en el backend (ORDER_MAP)
        sorter: true,              // server-side
        ellipsis: true,
        width: 140,
        render: (val) => val ? <Tooltip title={val}><span>{val}</span></Tooltip> : "—",
      },
      {
        title: "Empresa",
        dataIndex: ["empresa", "nombre"],
        key: "empresa",            // 👈
        sorter: true,              // server-side
        ellipsis: true,
        width: 220,
        render: (val) => val ? <Tooltip title={val}>{val}</Tooltip> : "—",
        responsive: ["sm", "md", "lg", "xl"],
      },
      {
        title: "Fecha Final",
        dataIndex: ["custodiaExterna", "fechaFinal"],
        key: "fechaFinal",         // 👈
        sorter: true,              // server-side
        render: (val) => val ? dayjs(val).format("YYYY-MM-DD") : "—",
        width: 140,
        responsive: ["md", "lg", "xl"],
      },
      {
        title: "Prioridad",
        key: "prioridad",          // 👈
        dataIndex: ["prioridad", "codigo"], // para que sorter.field sea algo
        sorter: true,              // server-side
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
        key: "estado",             // 👈
        dataIndex: ["estado", "descripcion"],
        sorter: true,              // server-side
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
    ]), []);

  const columns = useMemo(() => {
    if (isMobile) {
      const keep = new Set(["codigo", "empresa", "estado", "action"]);
      return baseCols
        .filter(c => keep.has(c.key))
        .map(c => ({ ...c, fixed: undefined, width: undefined }));
    }
    return baseCols.map(c => {
      if (c.key === "codigo") return { ...c, fixed: "left" };
      if (c.key === "action") return { ...c, fixed: "right" };
      return c;
    });
  }, [baseCols, isMobile]);

  // onChange de AntD: paginación + orden
  const handleTableChange = (pagination, filters, sorter) => {
    const { current, pageSize: ps } = pagination;
    setCurrentPage(current);
    setPageSize(ps);

    // ordenar: usamos columnKey que mapeamos al backend (ORDER_MAP)
    const colKey = sorter?.columnKey ?? sorter?.field; // column.key configurado arriba
    const ord = sorter?.order; // 'ascend' | 'descend' | undefined
    if (colKey && ord) {
      setOrdering(ord === "ascend" ? colKey : `-${colKey}`);
    } else {
      setOrdering(undefined);
    }
  };

  return (
    <div style={{ padding: 16 }}>
      <Card bordered={false} style={{ maxWidth: 1200, margin: "0 auto" }} bodyStyle={{ padding: 16 }}>
        <Row justify="space-between" align="middle" style={{ marginBottom: 12 }}>
          <Col><Title level={3} style={{ margin: 0 }}>Custodias Externas</Title></Col>
          <Col>
            <Space>
              <Search
                allowClear
                placeholder="Buscar (OT, empresa, estado, etc.)"
                value={searchText}
                onChange={(e) => { setSearchText(e.target.value); setCurrentPage(1); }}
                style={{ width: 280 }}
              />
              <Link to="/crearCustodiaExterna">
                <Button type="primary">Crear custodia externa</Button>
              </Link>
            </Space>
          </Col>
        </Row>

        <Table
          dataSource={rows}
          columns={columns}
          loading={loading}
          rowKey={(r, i) => r?.custodiaExterna?.id ?? `row-${i}`}
          size={isMobile ? "small" : "middle"}
          bordered={!isMobile}
          sticky={!isMobile}
          onChange={handleTableChange}                // 👈 importante
          pagination={{
            current: currentPage,                     // 👈 controlado
            pageSize,
            total,                                    // 👈 viene del servidor
            showSizeChanger: !isMobile,
            pageSizeOptions: [5, 10, 20, 50, 100],
            simple: isMobile,
            showTotal: !isMobile ? (t, r) => `${r[0]}–${r[1]} de ${t} registros` : undefined,
          }}
          scroll={{ x: isMobile ? "max-content" : 1000, y: isMobile ? undefined : 520 }}
          locale={{ emptyText: loading ? "Cargando..." : "No hay datos" }}
        />
      </Card>
    </div>
  );
};

export default CustodiasExterna;
