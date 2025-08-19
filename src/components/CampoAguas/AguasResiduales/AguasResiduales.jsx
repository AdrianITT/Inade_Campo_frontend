import React, { useEffect, useState, useMemo, useCallback } from "react";
import { Table, Input, Button, Spin, Typography, Row, Col, Card, Tag, Tooltip, Space,Grid } from "antd";
import { Link } from "react-router-dom";
import "./css/AguasResiduales.css";
import { ByIdAguaResidualInforme } from "../../../apis/ApiCampo/AguaResidualInforme";

const { Title } = Typography;
const { Search } = Input;
const { useBreakpoint } = Grid;

const TIEMPO_EXPIRACION_MS = 1 * 60 * 1000; // 1 minuto
const LOCAL_STORAGE_KEY = "ordenes_trabajo_state";

const guardarEstadoEnLocalStorage = (data) => {
  const payload = { valor: data, timestamp: Date.now() };
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(payload));
};

const leerEstadoDeLocalStorage = () => {
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

const colorEstado = (estado) => {
  const e = (estado || "").toLowerCase();
  if (e.includes("inici")) return "processing";
  if (e.includes("complet")) return "green";
  if (e.includes("pend") || e.includes("espera")) return "warning";
  if (e.includes("cancel")) return "red";
  return "default";
};

const Generarorden = () => {
  const [ordenes, setOrdenes] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const screens = useBreakpoint();
  const isMobile = !screens.lg;

  const organizationId = parseInt(localStorage.getItem("organizacion_id"), 10);

  // Cargar estado previo (search/paginación) si no ha expirado
  useEffect(() => {
    const saved = leerEstadoDeLocalStorage();
    if (saved) {
      setSearchText(saved.searchText ?? "");
      setCurrentPage(saved.currentPage ?? 1);
      setPageSize(saved.pageSize ?? 10);
    }
  }, []);

  useEffect(() => {
    const fetchOrdenes = async () => {
      try {
        setIsLoading(true);
        const response = await ByIdAguaResidualInforme(organizationId);
        const mapeado = (response?.data ?? []).map((item) => ({
          numero: item?.informe?.numero,                  // identificador visible
          id: item?.informe?.id,                          // id para detalles
          OTcodigo: item?.orden_trabajo?.codigo || "",    // código OT
          contacto: item?.cliente?.nombre || "",          // cliente
          receptor: item?.orden_trabajo?.receptor || "",  // recibe
          direccion: item?.cliente?.direccion || "",      // dirección
          nombreEmpresa: item?.empresa?.nombre || "",     // empresa
          estado: item?.informe?.estado || "",            // estado (texto)
        }));

        setOrdenes(mapeado);
        // aplicar búsqueda global inicial (si había)
        const filtrado = filterData(mapeado, searchText);
        setFilteredData(filtrado);
      } catch (error) {
        console.error("Error al cargar las órdenes de trabajo:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrdenes();
  }, [organizationId]); // búsqueda se maneja aparte

  const filterData = (data, text) => {
    const q = (text || "").trim().toLowerCase();
    if (!q) return data;
    return data.filter((item) =>
      [
        item.numero,
        item.OTcodigo,
        item.contacto,
        item.receptor,
        item.direccion,
        item.nombreEmpresa,
        item.estado,
      ]
        .filter((v) => v !== null && v !== undefined)
        .some((v) => String(v).toLowerCase().includes(q))
    );
  };

  const handleSearch = useCallback(
    (value) => {
      setSearchText(value);
      setCurrentPage(1);
      const filtrado = filterData(ordenes, value);
      setFilteredData(filtrado);
      guardarEstadoEnLocalStorage({ searchText: value, currentPage: 1, pageSize });
    },
    [ordenes, pageSize]
  );

  const handlePageChange = (page, size) => {
    setCurrentPage(page);
    setPageSize(size);
    guardarEstadoEnLocalStorage({ searchText, currentPage: page, pageSize: size });
    localStorage.setItem("expiraEn", Date.now() + TIEMPO_EXPIRACION_MS);
  };

  // Helpers de filtros únicos
  const unique = (arr) => [...new Set(arr.filter((x) => x != null && x !== ""))];
  const codigoOTFilters = useMemo(
    () => unique(ordenes.map((o) => o.OTcodigo)).map((v) => ({ text: v, value: v })),
    [ordenes]
  );
  const clienteFilters = useMemo(
    () => unique(ordenes.map((o) => o.contacto)).map((v) => ({ text: v, value: v })),
    [ordenes]
  );
  const receptorFilters = useMemo(
    () => unique(ordenes.map((o) => o.receptor)).map((v) => ({ text: v, value: v })),
    [ordenes]
  );
  const empresaFilters = useMemo(
    () => unique(ordenes.map((o) => o.nombreEmpresa)).map((v) => ({ text: v, value: v })),
    [ordenes]
  );
  const estadoFilters = useMemo(
    () => unique(ordenes.map((o) => o.estado)).map((v) => ({ text: v, value: v })),
    [ordenes]
  );

  const columns = useMemo(
    () => [
      {
        title: "ID",
        dataIndex: "numero",
        key: "numero",
        sorter: (a, b) => Number(a.numero ?? 0) - Number(b.numero ?? 0),
        width: 100,
        //fixed: "left",
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
        render: (value) =>
          value ? (
            <Tooltip title={value}>
              <span>{value}</span>
            </Tooltip>
          ) : (
            "—"
          ),
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
        render: (value) =>
          value ? (
            <Tooltip title={value}>
              <span>{value}</span>
            </Tooltip>
          ) : (
            "—"
          ),
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
        render: (value) =>
          value ? (
            <Tooltip title={value}>
              <span>{value}</span>
            </Tooltip>
          ) : (
            "—"
          ),
        responsive: ["sm", "md", "lg", "xl"],
      },
      {
        title: "Dirección",
        dataIndex: "direccion",
        key: "direccion",
        ellipsis: true,
        render: (value) =>
          value ? (
            <Tooltip title={value}>
              <span>{value}</span>
            </Tooltip>
          ) : (
            "—"
          ),
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
        // fixed: "right",
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
    // En móvil: menos columnas + sin widths/fixed para que fluya
  const columnsn = useMemo(() => {
    if (!isMobile) {
      // Desktop: puedes fijar si quieres
      return columns.map(col => {
        if (col.key === "numero") return { ...col, fixed: "left" };
        if (col.key === "opciones") return { ...col, fixed: "right" };
        return col;
      });
    }
    // Mobile: ocultamos columnas pesadas y quitamos width/fixed
    const keysVisibles = new Set(["numero", "OTcodigo", "contacto", "estado", "opciones"]);
    return columns
      .filter(c => keysVisibles.has(c.key))
      .map(c => ({ ...c, width: undefined, fixed: undefined }));
  }, [columns, isMobile]);

  // No vuelvas a ordenar con un campo inexistente; usa los sorters de columnas
  const dataToShow = useFilteredBySearch(filteredData, searchText, ordenes, filterData);

  return (
    <div style={{ padding: 16 }}>
      <Card bordered={false} style={{ maxWidth: 1400, margin: "0 auto" }} bodyStyle={{ padding: 16 }}>
        <Row justify="space-between" align="middle" style={{ marginBottom: 12 }}>
          <Col>
            <Title level={3} style={{ margin: 0 }}>Aguas Residuales</Title>
          </Col>
          <Col>
            <Space wrap>
              <Search
                allowClear
                placeholder="Buscar (OT, cliente, empresa, estado, etc.)"
                value={searchText}
                onChange={(e) => handleSearch(e.target.value)}
                onSearch={handleSearch}
                style={{ width: 320 }}
              />
              <Link to="/OrdenTrabajo">
                <Button type="primary">Agregar Nuevo Informe AR</Button>
              </Link>
            </Space>
          </Col>
        </Row>

        {isLoading ? (
          <div style={{ textAlign: "center", padding: 32 }}>
            <Spin size="large" tip="Cargando órdenes de trabajo..." />
          </div>
        ) : (
          <>
            <Table
              rowKey="id"
              dataSource={dataToShow}
              columns={columnsn}
              size={isMobile ? "small" : "middle"}
              bordered={!isMobile}
              sticky={!isMobile} 
              pagination={{
                current: currentPage,
                pageSize,
                onChange: handlePageChange,
                showSizeChanger: !isMobile,
                simple: isMobile,
                pageSizeOptions: [5, 10, 20, 50, 100],
                showTotal: !isMobile ? (total, range) => `${range[0]}–${range[1]} de ${total} registros` : undefined,
              }}
              scroll={{ 
                  x: isMobile ? "max-content" : 1000,  // deja que fluya el ancho
                  y: isMobile ? undefined : 520,
               }}
              locale={{ emptyText: "Sin resultados" }}
            />

                        {!isMobile && (
              <div style={{ marginTop: 8, textAlign: "right", color: "#666" }}>
                Total filtrado: {filteredData.length}
              </div>
            )}
          </>
        )}
      </Card>
    </div>
  );
};

// Memo pequeño para evitar recomputar el filtrado cuando no cambia nada
// Hook: memorizamos el resultado filtrado
function useFilteredBySearch(filteredData, searchText, base, filterFn) {
  return React.useMemo(() => {
    if (!filteredData?.length && searchText) {
      return filterFn(base, searchText);
    }
    return filteredData;
  }, [filteredData, searchText, base, filterFn]);
}


export default React.memo(Generarorden);
