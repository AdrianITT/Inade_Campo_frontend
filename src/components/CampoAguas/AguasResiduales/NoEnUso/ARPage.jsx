// src/pages/AguasResiduales/ARPage/index.jsx
import React from "react";
import { Card, Row, Col, Typography, Spin, Grid } from "antd";
import { useState, useEffect, useMemo, useCallback } from "react";
import "./css/AguasResiduales.css"; // ajusta ruta si es necesario
import useAguasResidualesData from "./hooks/useAguasResidualesData";
import { leerEstadoDeLocalStorage, guardarEstadoEnLocalStorage } from "./utils/storage";
import { filterData } from "./utils/filters";
import useColumns from "./columns";
import ARSearchBar from "./ARSearchBar";
import ARTable from "./ARTable";

const { Title } = Typography;
const { useBreakpoint } = Grid;

function useFilteredBySearch(filteredData, searchText, base, filterFn) {
  return useMemo(() => {
    if (!filteredData?.length && searchText) {
      return filterFn(base, searchText);
    }
    return filteredData;
  }, [filteredData, searchText, base, filterFn]);
}

const ARPage = () => {
  const screens = useBreakpoint();
  const isMobile = !screens.lg;

  const organizationId = parseInt(localStorage.getItem("organizacion_id"), 10);

  // Estado de UI (búsqueda/paginación)
  const [searchText, setSearchText] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Cargar estado previo si no ha expirado
  useEffect(() => {
    const saved = leerEstadoDeLocalStorage();
    if (saved) {
      setSearchText(saved.searchText ?? "");
      setCurrentPage(saved.currentPage ?? 1);
      setPageSize(saved.pageSize ?? 10);
    }
  }, []);

  const { ordenes, filteredData, setFilteredData, isLoading } =
    useAguasResidualesData(organizationId, searchText);

  // Columnas reactivas a datos y viewport
  const columns = useColumns(ordenes, isMobile);

  // Manejo de búsqueda con memo
  const handleSearch = useCallback(
    (value) => {
      setSearchText(value);
      setCurrentPage(1);
      setFilteredData(filterData(ordenes, value));
      guardarEstadoEnLocalStorage({ searchText: value, currentPage: 1, pageSize });
    },
    [ordenes, pageSize, setFilteredData]
  );

  // Paginación
  const handlePageChange = (page, size) => {
    setCurrentPage(page);
    setPageSize(size);
    guardarEstadoEnLocalStorage({ searchText, currentPage: page, pageSize: size });
  };

  // Resultado final a mostrar (evita recomputar)
  const dataToShow = useFilteredBySearch(filteredData, searchText, ordenes, filterData);

  return (
    <div style={{ padding: 16 }}>
      <Card bordered={false} style={{ maxWidth: 1400, margin: "0 auto" }} bodyStyle={{ padding: 16 }}>
        <Row justify="space-between" align="middle" style={{ marginBottom: 12 }}>
          <Col>
            <Title level={3} style={{ margin: 0 }}>Aguas Residuales</Title>
          </Col>
          <Col>
            <ARSearchBar value={searchText} onSearch={handleSearch} isMobile={isMobile} />
          </Col>
        </Row>

        {isLoading ? (
          <div style={{ textAlign: "center", padding: 32 }}>
            <Spin size="large" tip="Cargando órdenes de trabajo..." />
          </div>
        ) : (
          <ARTable
            data={dataToShow}
            columns={columns}
            isMobile={isMobile}
            currentPage={currentPage}
            pageSize={pageSize}
            onPageChange={handlePageChange}
            filteredLength={filteredData.length}
          />
        )}
      </Card>
    </div>
  );
};

export default React.memo(ARPage);
