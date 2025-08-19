import React, { useEffect, useState, useMemo, useCallback } from "react";
import { Table, Input, Button, Spin, message, Modal } from "antd";
import { Link, useNavigate } from "react-router-dom";
import "./css/Generarorden.css";
import { getAllOrdenesTrabajoData } from "../../apis/ApiCampo/OrdenTrabajo";
import { createCroquisUbicacion } from "../../apis/ApiCampo/CroquisUbicacion";
import { createAguaResidualInforme } from "../../apis/ApiCampo/AguaResidualInforme";
// import { cifrarId } from "../secretKey/SecretKey";

const LOCAL_STORAGE_KEY = "ordenes_trabajo_state";
const TIEMPO_EXPIRACION_MS = 1 * 60 * 1000; // 1 minutos

// Guardar con timestamp
const guardarEstadoEnLocalStorage = (data) => {
  const payload = {
    valor: data,
    timestamp: Date.now(),
  };
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(payload));
};

// Leer y verificar expiración
const obtenerEstadoConExpiracion = () => {
  const savedItem = localStorage.getItem(LOCAL_STORAGE_KEY);
  if (!savedItem) return null;

  try {
    const { valor, timestamp } = JSON.parse(savedItem);
    const ahora = Date.now();

    if (ahora - timestamp < TIEMPO_EXPIRACION_MS) {
      return valor; // todavía válido
    } else {
      localStorage.removeItem(LOCAL_STORAGE_KEY); // expirado
      return null;
    }
  } catch (error) {
    console.error("Error al leer localStorage:", error);
    localStorage.removeItem(LOCAL_STORAGE_KEY);
    return null;
  }
};


const Generarorden = () => {
  const navigate= useNavigate();
  const [ordenes, setOrdenes] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [loadingId, setLoadingId] = useState(null);

  const organizationId = parseInt(localStorage.getItem("organizacion_id"), 10);

  useEffect(() => {
    const savedState = obtenerEstadoConExpiracion();
    if (savedState) {
      setSearchText(savedState.searchText || "");
      setCurrentPage(savedState.currentPage || 1);
      setPageSize(savedState.pageSize || 5);
    }
  }, []);

  useEffect(() => {
    const fetchOrdenes = async () => {
      try {
        setIsLoading(true);
        const response = await getAllOrdenesTrabajoData(organizationId);
        console.log("Órdenes de trabajo response:", response);
        const ordensEstadoDos=response.data.filter((orden)=> orden.estado.id===2);
        console.log("Órdenes de trabajo con estado 2:", ordensEstadoDos);
        setOrdenes(ordensEstadoDos);

        const filtered = filterData(ordensEstadoDos, searchText);
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

const handleAgregar = (record) => {
  Modal.confirm({
    title: "¿Esta segura?",
    content: `Esta OT ${record.codigo} se eligirá par crear el informe de agua residual. ¿Deseas continuar?`,
    okText: "Sí, agregar",
    cancelText: "Cancelar",
    onOk: async () => {
      try {
        setLoadingId(record.orden);   // 1️⃣ spinner solo en la fila
        // console.log("Agregando croquis para la OT:", record);
        /* Paso 1: crear croquis */
        // const croquis = await createCroquisUbicacion({
        //   domicilio: "data1",
        //   // ⚠️  agrega aquí los demás campos obligatorios de tu modelo
        // });
        // console.log("Croquis creado:", croquis);
        /* Paso 2: informe de agua residual */
        const data=await createAguaResidualInforme({
          OrdenTrabajo: record.orden, // Asegúrate de que este campo sea correcto
          estado: 2
          // ⚠️  agrega aquí los demás campos obligatorios de tu modelo
        });
        console.log(data);
        message.success("Croquis ligado correctamente 🎉");
        // navigate("/AguasResiduales");
        navigate(`/DetallesAguasResiduales/${data.data.id}`);
        //`/DetallesAguasResiduales/${record.id}`
     //    reload?.();
      } catch (err) {
        console.error(err);
        console.error("Detalle DRF:", err?.response?.data);   // 👀
        message.error("Error al agregar");
        message.error(
          err?.response?.data?.detail ?? "Ocurrió un error al agregar."
        );
      } finally {
        setLoadingId(null);           // 2️⃣ quita spinner
      }
    },
  });
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
      localStorage.setItem("expiraEn", Date.now() + TIEMPO_EXPIRACION_MS);     
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
        sorter: (a, b) => a.orden - b.orden,
      },
      {
        title: "Código OT",
        dataIndex: "codigo",
        key: "codigo",
        sorter: (a, b) => a.codigo.localeCompare(b.codigo),
        filters: ordenes.map((item) => ({
          text: item.codigo,
          value: item.codigo,
        })),
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
        title: "Estado",
        dataIndex: ["estado", "nombre"],
        key: "estado",
        filters: [
          { text: "Pendiente", value: "Pendiente" },
          { text: "En proceso", value: "En proceso" },
          { text: "Completado", value: "Completado" },
        ],
        onFilter: (value, record) => record.estado?.nombre === value,
        sorter: (a, b) => a.estado?.nombre.localeCompare(b.estado?.nombre),
        render: (_, record) => record.estado?.nombre || "N/A",
      },
      {
        title: "Vigencia",
        dataIndex: "expiracion",
        key: "vigencia",
        sorter: (a, b) => new Date(a.expiracion) - new Date(b.expiracion),
      },
      {
        title: "Opciones",
        key: "opciones",
        render: (_, record) => (
          <Button
            type="primary"
            onClick={() => handleAgregar(record)}
            loading={loadingId === record.orden}
          >
            Agregar
          </Button>
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
      <h1 className="generarorden-title">Órdenes de Trabajo</h1>
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
            scroll={{ x: "max-content" }}
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
