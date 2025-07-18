import React, { useEffect, useState, useMemo, useCallback } from "react";
import { Table, Input, Button, Spin } from "antd";
import { Link } from "react-router-dom";
import "./css/AguasResiduales.css";
import {getAguaResidualInforme, ByIdAguaResidualInforme} from "../../apis/ApiCampo/AguaResidualInforme";
import OrdenTrabajo from "../OrdenTrabajo/OrdenTrabajo";
// import { getAllOrdenesTrabajoData } from "../../../apis/ApisServicioCliente/OrdenTrabajoApi";
// import { cifrarId } from "../secretKey/SecretKey";

 const LOCAL_STORAGE_KEY = "ordenes_trabajo_state";
 const TIEMPO_EXPIRACION_MS = 1 * 60 * 1000; 
// 1 minutos

const organizationId = parseInt(localStorage.getItem("organizacion_id"), 10);

// Guardar con timestamp
const guardarEstadoEnLocalStorage = (data) => {
  const payload = {
    valor: data,
    timestamp: Date.now(),
  };
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(payload));
};


const Generarorden = () => {
  const [ordenes, setOrdenes] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);

  const organizationId = parseInt(localStorage.getItem("organizacion_id"), 10);


  useEffect(() => {
    const fetchOrdenes = async () => {
      try {
        setIsLoading(true);
        const response = await ByIdAguaResidualInforme(organizationId);
        console.log("Órdenes de trabajo response:", response);
        const mapeado= response.data.map((item)=> ({
          numero: item.informe.numero,
          id:item.informe.id,
          OTcodigo:item.orden_trabajo.codigo,
          contacto:item.cliente.nombre,
          receptor:item.orden_trabajo.receptor,
          direccion:item.cliente.direccion,
          nombreEmpresa:item.empresa.nombre,
        }));
        setOrdenes(mapeado);

        const filtered = filterData(mapeado, searchText);
        setFilteredData(filtered);
      } catch (error) {
        console.error("Error al cargar las órdenes de trabajo:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrdenes();
  }, [organizationId, searchText]);

  const filterData = (data, text) => {
    return data.filter((item) =>
      Object.values(item).some(
        (field) =>
          field !== null &&
          field !== undefined &&
          String(field).toLowerCase().includes(text.toLowerCase())
      )
    );
  };

  const handleSearch = useCallback(
    (value) => {
      setSearchText(value);
      setCurrentPage(1);

      const filtered = filterData(ordenes, value);
      setFilteredData(filtered);

      guardarEstadoEnLocalStorage({
        searchText: value,
        currentPage: 1,
        pageSize,
      }); 
      //localStorage.setItem("expiraEn", Date.now() + TIEMPO_EXPIRACION_MS);     
    },
    [ordenes, pageSize]
  );

  const handlePageChange = (page, size) => {
    setCurrentPage(page);
    setPageSize(size);
    guardarEstadoEnLocalStorage({
      searchText,
      currentPage: page,
      pageSize: size,
    });   
    localStorage.setItem("expiraEn", Date.now() + TIEMPO_EXPIRACION_MS); 
  };

const columns = useMemo(
  () => [
    {
      title: "ID",
      dataIndex: "numero",
      key: "numero",
      sorter: (a, b) => a.id - b.id,
    },
    {
      title: "Código OT",
      dataIndex: "OTcodigo",
      key: "OTcodigo",
      sorter: (a, b) => a.codigo.localeCompare(b.codigo),
      filters: ordenes.map(({ codigo }) => ({ text: codigo, value: codigo })),
      filterSearch: true,
      onFilter: (value, record) => record.codigo === value,
    },
    {
      title: "Cliente",
      dataIndex: "contacto",
      key: "contacto",
      sorter: (a, b) => a.contacto.localeCompare(b.contacto),
    },
    {
      title: "Recibe",
      dataIndex: "receptor",
      key: "receptor",
      sorter: (a, b) => a.receptor.localeCompare(b.receptor),
    },
    {
      title: "Empresa",
      dataIndex: "nombreEmpresa",
      key: "nombreEmpresa",
      sorter: (a, b) => a.nombreEmpresa.localeCompare(b.nombreEmpresa),
    },
    {
      title: "Dirección",
      dataIndex: "direccion",
      key: "direccion",
      sorter: (a, b) => a.direccion.localeCompare(b.direccion),
    },
    {
      title: "Opciones",
      key: "opciones",
      render: (_, record) => (
        <Link to={`/DetallesAguasResiduales/${record.id}`}>
          <Button>Detalles</Button>
        </Link>
      ),
    },
  ],
  [searchText, ordenes]
);


  const sortedData = useMemo(() => {
    return [...filteredData].sort((a, b) => a.orden - b.orden);
  }, [filteredData]);

  return (
    <div className="generarorden-container">
      <h1 className="generarorden-title">Aguas Residuales</h1>
      <center>
        <Input.Search
          className="generarorden-search"
          placeholder="Buscar órdenes de trabajo..."
          enterButton="Buscar"
          value={searchText}
          onSearch={handleSearch}
          onChange={(e) => handleSearch(e.target.value)}
        />
      </center>
      <div className="generarorden-buttons">
        <Link to="/OrdenTrabajo">
          <Button className="nueva-orden-button">Agregar Nuevo Informe AR</Button>
        </Link>
      </div>
      {isLoading ? (
        <div style={{ textAlign: "center", marginTop: "20px" }}>
          <Spin size="large" tip="Cargando órdenes de trabajo..." />
        </div>
      ) : (
        <>
          <Table
            rowKey="id"
            className="generarorden-table"
            dataSource={sortedData}
            columns={columns}
            bordered
            pagination={{
              current: currentPage,
              pageSize,
              onChange: handlePageChange,
            }}
          />
          <div className="generarorden-summary">
            <div className="summary-container">
              Número de órdenes de trabajo: {filteredData.length}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default React.memo(Generarorden);
