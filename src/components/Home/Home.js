import React, { useEffect, useState } from "react";
//import "./index.css";
import "./home.css";
import { Card, Col, Row, Badge, Space, Progress } from "antd";
// import { getAllCotizacion } from "./apis/ApisServicioCliente/CotizacionApi";
// import { getAllCliente } from "./apis/ApisServicioCliente/ClienteApi";
// import { getAllEmpresas } from "./apis/ApisServicioCliente/EmpresaApi";

import {
  FilterOutlined,
  SignatureFilled,
  FileSearchOutlined 
} from "@ant-design/icons";
import { Link } from "react-router-dom";

const Home = () => {
  const [countCotizaciones, setCountCotizaciones] = useState(0);
  // Para progress bar y textos
  const [totalCotizaciones, setTotalCotizaciones] = useState(0);
  const [cotizacionesAceptadas, setCotizacionesAceptadas] = useState(0);

//   useEffect(() => {
//     const fetchCount = async () => {
//       try {

//         // Obtén el ID de la organización del usuario desde localStorage
//         const organizationId = parseInt(localStorage.getItem("organizacion_id"), 10);

//         // Realiza las peticiones a las APIs: cotizaciones, clientes y empresas
//         const [cotResponse, clientesResponse, empresasResponse] = await Promise.all([
//           getAllCotizacion(),
//           getAllCliente(),
//           getAllEmpresas(),
//         ]);

//         const cotizaciones = cotResponse.data || [];
//         const clientes = clientesResponse.data || [];
//         const empresas = empresasResponse.data || [];

//         // Filtrar las empresas que pertenecen a la organización actual
//         const filteredEmpresas = empresas.filter(
//           (empresa) => empresa.organizacion === organizationId
//         );

//         // Filtrar los clientes que pertenecen a una de las empresas filtradas
//         const filteredClientes = clientes.filter((cliente) =>
//           filteredEmpresas.some((empresa) => empresa.id === cliente.empresa)
//         );

//         // Filtrar las cotizaciones cuyos clientes están en el listado filtrado
//         const filteredCotizaciones = cotizaciones.filter((cotizacion) =>
//           filteredClientes.some((cliente) => cliente.id === cotizacion.cliente)
//         );

//         // Ahora se aplican los filtros sobre los estados:
//         // 1. Cotizaciones con estado = 1
//         const estadoUno = filteredCotizaciones.filter((cot) => cot.estado === 1);
//         setCountCotizaciones(estadoUno.length);

//         // 2. Total de cotizaciones filtradas
//         const total = filteredCotizaciones.length;
//         setTotalCotizaciones(total);

//         // 3. Cotizaciones aceptadas (estado >= 2)
//         const aceptadas = filteredCotizaciones.filter((cot) => cot.estado >= 2).length;
//         setCotizacionesAceptadas(aceptadas);
//       } catch (error) {
//         console.error("Error al obtener las cotizaciones", error);
//       }
//     };

//     fetchCount();
//   }, []);

  // Calcula el porcentaje para la progress bar
//   let porcentaje = 0;
//   if (totalCotizaciones > 0) {
//     porcentaje = (cotizacionesAceptadas / totalCotizaciones) * 100;
//   }
//   const porcentajeFinal = parseFloat(porcentaje.toFixed(2));

  return (
    <div className="Home">
         {/* Barra de carga */}
      {/* <div className="justi-card">
        <Card className="custom-card-bar">
          <div className="progress-bar-container">
            <Progress percent={porcentajeFinal} status="active" />
          </div>
          <div className="text-container">
            <p>Total de cotizaciones: {totalCotizaciones}</p>
            <p>Cotizaciones Aceptadas: {cotizacionesAceptadas}</p>
          </div>
        </Card>
      </div> */}
      {/* Opciones de navegación */}
      <div className="contencenter">
        <br />
        <Space size ={0}>
          <Row gutter={[0, 0]} justify="center">
            <Col xs={48} sm={24} md={12} lg={8} xl={6} className="col-style">
              <div>
                <Link to="/AguasResiduales">
                  <Card className="card-custom" title="Aguas Residuales" bordered={false}>
                    <div className="icon-container">
                      <SignatureFilled />
                    </div>
                  </Card>
                </Link>
              </div>
            </Col>
            <Col xs={48} sm={24} md={12} lg={8} xl={6} className="col-style">
              <div>
                <Link to="/custodiaExterna">
                  <Card className="card-custom" title="Custodia Externa" bordered={false}>
                    <div className="icon-container">
                    {/* <FileTextOutlined />*/}
                    <svg xmlns="http://www.w3.org/2000/svg" width="110" height="110" fill="currentColor" class="bi bi-hammer" viewBox="0 0 16 16">
                      <path d="M9.972 2.508a.5.5 0 0 0-.16-.556l-.178-.129a5 5 0 0 0-2.076-.783C6.215.862 4.504 1.229 2.84 3.133H1.786a.5.5 0 0 0-.354.147L.146 4.567a.5.5 0 0 0 0 .706l2.571 2.579a.5.5 0 0 0 .708 0l1.286-1.29a.5.5 0 0 0 .146-.353V5.57l8.387 8.873A.5.5 0 0 0 14 14.5l1.5-1.5a.5.5 0 0 0 .017-.689l-9.129-8.63c.747-.456 1.772-.839 3.112-.839a.5.5 0 0 0 .472-.334"/>
                    </svg>
                    </div>
                  </Card>
                </Link>
              </div>
            </Col>
            <Col xs={48} sm={24} md={12} lg={8} xl={6} className="col-style">
              <div>
                <Link to="/Filtros">
                  <Card className="card-custom" title="Asignacion de id Filtros" bordered={false}>
                    <div className="icon-container">
                      <FilterOutlined />
                    </div>
                  </Card>
                </Link>
              </div>
            </Col>

            <Col xs={48} sm={24} md={12} lg={8} xl={6} className="col-style">
              <div>
                <Link to="/Custodia_Externa_en">
                  <Card className="card-custom" title="Custodia Interna" bordered={false}>
                    <div className="icon-container">
                      <FileSearchOutlined />
                    </div>
                  </Card>
                </Link>
              </div>
            </Col>
          </Row>
        </Space>
      </div>
    </div>
  );
};

export default Home;
