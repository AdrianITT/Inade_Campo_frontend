// src/pages/AguasResiduales/GenerarOrden/index.jsx
import React, { useEffect, useMemo, useState } from "react";
import { Table, Input, Button, Spin, Typography, Row, Col, Card, Tag, Tooltip, Space, Grid } from "antd";
import { Link } from "react-router-dom";
import "./css/AguasResiduales.css";
import { fetchAguasOrg } from "../../../apis/ApiCampo/AguaResidualInforme";

const { Title } = Typography;
const { Search } = Input;
const { useBreakpoint } = Grid;

const LOCAL_STORAGE_KEY = "ordenes_trabajo_state";
const TIEMPO_EXPIRACION_MS = 60 * 1000;

const guardarEstado = (data) =>
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify({ valor: data, timestamp: Date.now() }));

const leerEstado = () => {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!raw) return null;
    const { valor, timestamp } = JSON.parse(raw);
    if (Date.now() - timestamp > TIEMPO_EXPIRACION_MS) return null;
    return valor;
  } catch {
    return null;
  }
};

// debounce simple
function useDebounced(value, delay = 400) {
  const [v, setV] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setV(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return v;
}

const colorEstado = (estado) => {
  const e = String(estado || "").toLowerCase();
  if (e.includes("inici")) return "processing";
  if (e.includes("complet")) return "green";
  if (e.includes("pend") || e.includes("espera")) return "warning";
  if (e.includes("cancel")) return "red";
  return "default";
};

const Generarorden = () => {
  const screens = useBreakpoint();
  const isMobile = !screens.lg;

  const organizationId = parseInt(localStorage.getItem("organizacion_id"), 10);

  // estado UI
  const [searchText, setSearchText] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [ordering, setOrdering] = useState(); // "numero" | "-empresa" | "codigo" | ...

  // datos
  const [rows, setRows] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  // restaurar estado previo
  useEffect(() => {
    setLoading(true);
    const saved = leerEstado();
    if (saved) {
      setSearchText(saved.searchText ?? "");
      setCurrentPage(saved.currentPage ?? 1);
      setPageSize(saved.pageSize ?? 10);
      setOrdering(saved.ordering);
      setLoading(false);
    }
    setLoading(false);
  }, []);

  const debouncedQ = useDebounced(searchText, 400);

  // fetch (server-side)
  useEffect(() => {
    if (!organizationId) return;
    const ac = new AbortController();
    (async () => {
      try {
        setLoading(true);
        const { data } = await fetchAguasOrg({
          organizacion_id: organizationId,
          q: debouncedQ,
          page: currentPage,
          limit: pageSize,
          ordering,
          signal: ac.signal,
        });

        // mapea al mismo shape que usabas antes
        const lista = (data?.results ?? data ?? []).map((item) => ({
          numero: item?.informe?.numero,
          id: item?.informe?.id,
          codigo: item?.orden_trabajo?.codigo || "",         // 👈 clave 'codigo' para ordenar en server
          contacto: item?.cliente?.nombre || "",
          receptor: item?.orden_trabajo?.receptor || "",
          direccion: item?.cliente?.direccion || "",
          empresa: item?.empresa?.nombre || "",              // 👈 clave 'empresa' para ordenar en server
          estado: item?.informe?.estado || "",
        }));

        setRows(lista);
        setTotal(Number(data?.count ?? lista.length));
      } catch (e) {
        if (e?.name === "CanceledError" || e?.code === "ERR_CANCELED") return;
        console.error("Error cargando AR:", e);
      } finally {
        setLoading(false);
      }
    })();
    return () => ac.abort();
  }, [organizationId, debouncedQ, currentPage, pageSize, ordering]);

  // columnas (usar sorter: true para ordenar en servidor)
  const columns = useMemo(
    () => [
      { title: "ID", dataIndex: "numero", key: "numero", sorter: true, width: 100, responsive: ["xs","sm","md","lg","xl"] },
      {
        title: "Código OT",
        dataIndex: "codigo",
        key: "codigo",            // 👈 coincide con ORDER_MAP['codigo']
        sorter: true,
        ellipsis: true,
        width: 160,
        render: (v) => (v ? <Tooltip title={v}>{v}</Tooltip> : "—"),
      },
      {
        title: "Cliente",
        dataIndex: "contacto",
        key: "contacto",
        sorter: true,
        ellipsis: true,
        width: 220,
        render: (v) => (v ? <Tooltip title={v}>{v}</Tooltip> : "—"),
        responsive: ["sm","md","lg","xl"],
      },
      {
        title: "Recibe",
        dataIndex: "receptor",
        key: "receptor",
        sorter: true,
        ellipsis: true,
        width: 200,
        responsive: ["md","lg","xl"],
      },
      {
        title: "Empresa",
        dataIndex: "empresa",
        key: "empresa",
        sorter: true,
        ellipsis: true,
        width: 240,
        render: (v) => (v ? <Tooltip title={v}>{v}</Tooltip> : "—"),
        responsive: ["sm","md","lg","xl"],
      },
      // {
      //   title: "Dirección",
      //   dataIndex: "direccion",
      //   key: "direccion",
      //   ellipsis: true,
      //   width: 300,
      //   render: (v) => (v ? <Tooltip title={v}>{v}</Tooltip> : "—"),
      //   responsive: ["lg","xl"],
      // },
      {
        title: "Estado",
        dataIndex: "estado",
        key: "estado",
        sorter: true,
        width: 160,
        render: (v) => <Tag color={colorEstado(v)}>{v || "—"}</Tag>,
      },
      {
        title: "Opciones",
        key: "opciones",
        width: 120,
        render: (_, r) => (
          <Link to={`/DetallesAguasResiduales/${r.id}`}>
            <Button size="small" type="primary">Detalles</Button>
          </Link>
        ),
      },
    ],
    []
  );

  // columnas móviles (menos columnas)
  const columnsMobile = useMemo(() => {
    if (!isMobile) {
      return columns.map((c) => {
        if (c.key === "numero") return { ...c, fixed: "left" };
        if (c.key === "opciones") return { ...c, fixed: "right" };
        return c;
      });
    }
    const keep = new Set(["numero", "codigo", "contacto", "estado", "opciones"]);
    return columns.filter((c) => keep.has(c.key)).map((c) => ({ ...c, width: undefined, fixed: undefined }));
  }, [columns, isMobile]);

  // onChange de la tabla → paginación + orden server
  const handleTableChange = (pagination, _filters, sorter) => {
    const { current, pageSize } = pagination;
    setCurrentPage(current);
    setPageSize(pageSize);

    // sorter.order = "ascend" | "descend" | undefined
    const key = sorter?.columnKey ?? sorter?.field;
    const ord = sorter?.order ? (sorter.order === "ascend" ? key : `-${key}`) : undefined;
    setOrdering(ord);

    guardarEstado({ searchText, currentPage: current, pageSize, ordering: ord });
  };

  return (
    <div style={{ padding: 16 }}>
      <Card bordered={false} style={{ maxWidth: 1400, margin: "0 auto" }} bodyStyle={{ padding: 16 }}>
        <Row justify="space-between" align="middle" style={{ marginBottom: 12 }}>
          <Col><Title level={3} style={{ margin: 0 }}>Aguas Residuales</Title></Col>
          <Col>
            <Space wrap>
              <Search
                allowClear
                placeholder="Buscar (OT, cliente, empresa, estado, etc.)"
                value={searchText}
                onChange={(e) => { setSearchText(e.target.value); setCurrentPage(1); }}
                style={{ width: 320 }}
              />
              <Link to="/OrdenTrabajo"><Button type="primary">Agregar Nuevo Informe AR</Button></Link>
            </Space>
          </Col>
        </Row>

        {loading ? (
          <div style={{ textAlign: "center", padding: 32 }}>
            <Spin size="large" tip="Cargando órdenes de trabajo..." />
          </div>
        ) : (
          <Table
            rowKey="id"
            dataSource={rows}
            columns={columnsMobile}
            loading={loading}
            onChange={handleTableChange}
            size={isMobile ? "small" : "middle"}
            bordered={!isMobile}
            sticky={!isMobile}
            pagination={{
              current: currentPage,
              pageSize,
              total,
              showSizeChanger: !isMobile,
              simple: isMobile,
              pageSizeOptions: [5, 10, 20, 50, 100],
              showTotal: !isMobile ? (t, r) => `${r[0]}–${r[1]} de ${t} registros` : undefined,
            }}
            scroll={{ x: isMobile ? "max-content" : 1000, y: isMobile ? undefined : 520 }}
            locale={{ emptyText: "Sin resultados" }}
          />
        )}
      </Card>
    </div>
  );
};

export default React.memo(Generarorden);
