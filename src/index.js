import React, { useEffect } from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import {
  createBrowserRouter,
  RouterProvider, Outlet
} from "react-router-dom";
import "./index.css";
import reportWebVitals from "./reportWebVitals";
import Login from "./components/Login/Login";
import VerificarExpiracionLocalStorage from "./components/DataLocalStorage/LocalStorage";
import ProtectedRoute from "./components/ProtectedRoute";
import Layout from "./components/Layouts/Layout.js";
import FormularioProtocoloMuestreo from "./components/CampoAguas/FormularioProtocoloMuestreo/FormularioProtocoloMuestreo";
import HojaCampoMuestreo from "./components/HojaCampoMuestreo/HojaCampoMuestreo.jsx";
import FormularioCroquisUbicacion from "./components/CampoAguas/FormularioCroquisUbicacion/FormularioCroquisUbicacion";
import Home from "./components/Home/Home.js";
import AguasResiduales from "./components/CampoAguas/AguasResiduales/AguasResiduales.jsx";
import OrdenTrabajo from "./components/OrdenTrabajo/OrdenTrabajo.jsx";
import DetallesAguasResiduales from "./components/CampoAguas/DetallesAguasR/DetallesAguasResduales.jsx";
import EditarFormularioProtocoloMuestreo from "./components/CampoAguas/EditarFormularioProtocoloMuestreo/EditarFormularioProtocoloMuestreo.jsx";
import EditarHojaCampoMuestreo from "./components/CampoAguas/EditarHojaCampoMuestreo/EditarHojaCampoMuestreo.jsx";
import EditarCroquisUbicacion from "./components/CampoAguas/EditarCroquisUbicacion/EditarCroquisUbicacion.jsx";
import FromularioConductividad from "./components/CampoAguas/FormularioConductividad/FormularioConductividad.jsx";
import EditarConductividad from "./components/CampoAguas/EditarFormularioConductividad/EditarConductividad.jsx";
import FormularioVerificacionPh from "./components/CampoAguas/FormularioVerificacionPh/VerificacionPh.jsx";
import EditarVerificacionPh from "./components/CampoAguas/EditarVerificacionPh/EditartVerificacionPh.jsx";
import CustodiasExternas from "./components/CustodiaExterna/CustodiasExterna.jsx";
import CrearCustodiaExterna from "./components/CustodiaExterna/CrearCustodiaExterna/CrearCustida.jsx";
import DetallesCustodiaExterna from "./components/CustodiaExterna/DetallesCE/DetallesCustodiaExterna.jsx";
import Filtros from "./components/Filtros/Filtros.js";
import Usuario from "./components/Userjs/Usuario.js";
import EditarUsuario from "./components/Userjs/EditarUsuario.js";
import CustodiasEntregadasPage from "./components/CustodiaInterna/CustodiaEntregadasPage.jsx";
import EditarCustodia from "./components/CustodiaInterna/LaboratorioId/EditarCustodia.jsx";
import NoAutorizado from "./components/FetchProtected/NoAutorizado.jsx";
import Formularios from "./App.js";
//Importaciones de prueba
import DARpart1 from "./components/CampoAguas/DetallesAguasR/PageDetallesARPruevas/DARpart1.jsx";
import IluminacionGate from "./components/CampoIluminacion/AllIluminacion/Iluminacion.jsx";
import DetailsIluminacion from "./components/CampoIluminacion/DetalsIluminacion/DetallesIlum.jsx";
import CreateReconocimientoA from "./components/CampoIluminacion/CreateIluminacion/ReconocimientoA.jsx"
import CreateReconocimientoB from "./components/CampoIluminacion/CreateIluminacion/ReconocimientoB.jsx";
import CreateReconocimientoC from "./components/CampoIluminacion/CreateIluminacion/ReconocimientoC.jsx";
import EditarReconocimientoA from "./components/CampoIluminacion/EditIluminacion/ReconocimientoA.jsx";
import EditarReconocimientoB from "./components/CampoIluminacion/EditIluminacion/ReconocimientoB.jsx";
import EditarReconocimientoC from "./components/CampoIluminacion/EditIluminacion/ReconocimientoC.jsx";
import CreateHojaIluminacion from "./components/CampoIluminacion/CreateIluminacion/HojaCampoIlum.jsx";
import EditarHojaIluminacion from "./components/CampoIluminacion/EditIluminacion/HojaCampoIlum.jsx";
// import ARPage from "./components/CampoAguas/AguasResiduales/NoEnUso/ARPage.jsx";
// Hook para cambiar el título de la pestaña
const usePageTitle = () => {
  const location = useLocation();

  useEffect(() => {
    const { pathname } = location;
    let pageTitle = "SimplaxiAguas"; // Título por defecto

    switch (pathname) {
      case "/homeAguas":
        pageTitle = "Inicio | SimplaxiAguas";
        break;
      case "/empresa":
        pageTitle = "Empresas | SimplaxiAguas";
        break;
      case "/cliente":
        pageTitle = "Clientes | SimplaxiAguas";
        break;
      case "/servicio":
        pageTitle = "Servicios | SimplaxiAguas";
        break;
      case "/cotizar":
        pageTitle = "Cotizar | SimplaxiAguas";
        break;
      case "/usuario":
        pageTitle = "Usuarios | SimplaxiAguas";
        break;
      case "/configuracionorganizacion":
        pageTitle = "Configuración | SimplaxiAguas";
        break;
      // Agrega más rutas según sea necesario
      default:
        pageTitle = "SimplaxiAguas";
    }

    document.title = pageTitle; // Cambia el título
  }, [location]);
};

// Componente con lógica para cambiar el título
const PageWrapper = ({ children }) => {
  usePageTitle(); // Llama al hook para actualizar el título dinámicamente
  return children;
};

const AppRouter = () => {
  return (
    <Router>
      <VerificarExpiracionLocalStorage/>
      <Routes>
        {/* Ruta para el login sin el Layout */}
        <Route path="/" element={<Login />} />
        {/* <Route path="/RegistroUsuarios" element={<RegistroUsuarios />} />
         */}
        {/* Rutas envueltas con Layout */}
        <Route path="*" element={<NoAutorizado />} />
        <Route path="/no-autorizado" element={<NoAutorizado />} />
        <Route path="/" element={
            <PageWrapper>
              <Layout />
            </PageWrapper>
          }
        >
          {/* <Route path="/FormularioProtocoloMuestreo" element={<ProtectedRoute allowedRoles={['MuestreadorOrganizacion', 'Administradororganizacion']}><FormularioProtocoloMuestreo /></ProtectedRoute>} /> */}
          <Route path="/HojaCampoMuestreo/:id/:idAguas" element={<ProtectedRoute allowedRoles={['MuestreadorOrganizacion', 'Administradororganizacion', 'AdministradorMuestreadorOrganizacion']}><HojaCampoMuestreo/></ProtectedRoute>} />
          <Route path="/FormularioCroquisUbicacion/:id" element={<ProtectedRoute allowedRoles={['MuestreadorOrganizacion', 'Administradororganizacion', 'AdministradorMuestreadorOrganizacion']}><FormularioCroquisUbicacion/></ProtectedRoute>} />
          <Route path="/homeAguas" element={<ProtectedRoute allowedRoles={['LaboratorioOrganizacion','MuestreadorOrganizacion', 'Administradororganizacion', 'AdministradorMuestreadorOrganizacion', 'AdministradorLaboratorioOrganizacion']}><Home/></ProtectedRoute>} />
          <Route path="/AguasResiduales" element={<ProtectedRoute allowedRoles={['MuestreadorOrganizacion', 'Administradororganizacion', 'AdministradorMuestreadorOrganizacion']}><AguasResiduales/></ProtectedRoute>} />
          <Route path="/OrdenTrabajo" element={<ProtectedRoute allowedRoles={['MuestreadorOrganizacion', 'Administradororganizacion', 'AdministradorMuestreadorOrganizacion']}><OrdenTrabajo/></ProtectedRoute>} />
          <Route path="/DetallesAguasResiduales/:id" element={<ProtectedRoute allowedRoles={['MuestreadorOrganizacion', 'Administradororganizacion', 'AdministradorMuestreadorOrganizacion']}><DARpart1/></ProtectedRoute>} />{/*DARpart1 DetallesAguasResiduales*/}
          <Route path="/Formularios/:id" element={<ProtectedRoute allowedRoles={['MuestreadorOrganizacion', 'Administradororganizacion', 'AdministradorMuestreadorOrganizacion']}><Formularios/></ProtectedRoute>} />
          <Route path="/FormularioProtocoloMuestreo/:id/:idAguas" element={<ProtectedRoute allowedRoles={['MuestreadorOrganizacion', 'Administradororganizacion', 'AdministradorMuestreadorOrganizacion']}><FormularioProtocoloMuestreo /></ProtectedRoute>} />
          <Route path="/EditarFormularioProtocoloMuestreo/:id/:idAguas" element={<ProtectedRoute allowedRoles={['MuestreadorOrganizacion', 'Administradororganizacion', 'AdministradorMuestreadorOrganizacion']}><EditarFormularioProtocoloMuestreo /></ProtectedRoute>} />
          <Route path="/EditarHojaCampoMuestreo/:id/:idAguas" element={<ProtectedRoute allowedRoles={['MuestreadorOrganizacion', 'Administradororganizacion', 'AdministradorMuestreadorOrganizacion']}><EditarHojaCampoMuestreo /></ProtectedRoute>} />
          <Route path="/EditarCroquisUbicacion/:id/:idAguas" element={<ProtectedRoute allowedRoles={['MuestreadorOrganizacion', 'Administradororganizacion', 'AdministradorMuestreadorOrganizacion']}><EditarCroquisUbicacion /></ProtectedRoute>} />
          <Route path= "/FormularioConductividad/:id" element={<ProtectedRoute allowedRoles={['MuestreadorOrganizacion', 'Administradororganizacion', 'AdministradorMuestreadorOrganizacion']}><FromularioConductividad /></ProtectedRoute>} />
          <Route path= "/EditarConductividad/:id/:idAguas" element={<ProtectedRoute allowedRoles={['MuestreadorOrganizacion', 'Administradororganizacion', 'AdministradorMuestreadorOrganizacion']}><EditarConductividad /></ProtectedRoute>} />
          <Route path= "/FormularioVerificacionPh/:id/:idAguas" element={<ProtectedRoute allowedRoles={['MuestreadorOrganizacion', 'Administradororganizacion']}><FormularioVerificacionPh /></ProtectedRoute>} />
          <Route path= "/EditarVerificacionPh/:id/:idAguas" element={<ProtectedRoute allowedRoles={['MuestreadorOrganizacion', 'Administradororganizacion', 'AdministradorMuestreadorOrganizacion']}><EditarVerificacionPh /></ProtectedRoute>} />
          <Route path= "/custodiaExterna" element={<ProtectedRoute allowedRoles={['MuestreadorOrganizacion', 'Administradororganizacion', 'AdministradorMuestreadorOrganizacion']}><CustodiasExternas /></ProtectedRoute>} />
          <Route path= "/CrearCustodiaExterna" element={<ProtectedRoute allowedRoles={['MuestreadorOrganizacion', 'Administradororganizacion', 'AdministradorMuestreadorOrganizacion']}><CrearCustodiaExterna /></ProtectedRoute>} />
          <Route path= "/CrearCustodiaExterna/:id" element={<ProtectedRoute allowedRoles={['MuestreadorOrganizacion', 'Administradororganizacion', 'AdministradorMuestreadorOrganizacion']}><CrearCustodiaExterna /></ProtectedRoute>} />
          <Route path= "/DetallesCustodiaExternas/:id" element={<ProtectedRoute allowedRoles={['MuestreadorOrganizacion', 'Administradororganizacion', 'AdministradorMuestreadorOrganizacion']}><DetallesCustodiaExterna /></ProtectedRoute>} />
          <Route path= "/Filtros" element={<ProtectedRoute allowedRoles={['AdministradorLaboratorioOrganizacion', 'Administradororganizacion']}><Filtros /></ProtectedRoute>} />
          <Route path= "/Custodia_Externa_en" element={<ProtectedRoute allowedRoles={['AdministradorLaboratorioOrganizacion','LaboratorioOrganizacion', 'Administradororganizacion']}><CustodiasEntregadasPage /></ProtectedRoute>} />
          <Route path= "/insert_id_laboratorio/:id" element={<ProtectedRoute allowedRoles={['AdministradorLaboratorioOrganizacion','LaboratorioOrganizacion', 'Administradororganizacion']}><EditarCustodia /></ProtectedRoute>} />
          <Route path= "/usuario" element={<ProtectedRoute allowedRoles={['AdministradorLaboratorioOrganizacion', 'Administradororganizacion', 'AdministradorMuestreadorOrganizacion']}><Usuario /></ProtectedRoute>} />
          <Route path= "/EditarUsuario/:id" element={<ProtectedRoute allowedRoles={['AdministradorLaboratorioOrganizacion', 'Administradororganizacion', 'AdministradorMuestreadorOrganizacion']}><EditarUsuario /></ProtectedRoute>} />
          <Route path= "/Iluminacion" element={<ProtectedRoute allowedRoles={['AdministradorLaboratorioOrganizacion', 'Administradororganizacion', 'AdministradorMuestreadorOrganizacion']}><IluminacionGate /></ProtectedRoute>} />
          <Route path= "/DetallesIluminacion/:id" element={<ProtectedRoute allowedRoles={['AdministradorLaboratorioOrganizacion', 'Administradororganizacion', 'AdministradorMuestreadorOrganizacion']}><DetailsIluminacion /></ProtectedRoute>} />
          {/* <Route path= "/ar_page" element={<ProtectedRoute allowedRoles={['LaboratorioOrganizacion', 'Administradororganizacion']}><ARPage/></ProtectedRoute>} /> */}
          {/* ARPage  */}
        </Route>
      </Routes>

    </Router>
  );
};

const router = createBrowserRouter([
  {
    path: "/",
    element: <>
    <VerificarExpiracionLocalStorage />
    <Outlet/>
    </>,
    children: [
      { index: true, element: <Login /> },
      { path: "no-autorizado", element: <NoAutorizado /> },
      {
        element: (
          <PageWrapper>
            <Layout />
          </PageWrapper>
        ),
        children: [
          {
            path: "HojaCampoMuestreo/:id/:idAguas",
            element: (
              <ProtectedRoute
                allowedRoles={[
                  "MuestreadorOrganizacion",
                  "Administradororganizacion",
                  "AdministradorMuestreadorOrganizacion",
                ]}
              >
                <HojaCampoMuestreo />
              </ProtectedRoute>
            ),
          },
          {
            path: "FormularioCroquisUbicacion/:id",
            element: (
              <ProtectedRoute
                allowedRoles={[
                  "MuestreadorOrganizacion",
                  "Administradororganizacion",
                  "AdministradorMuestreadorOrganizacion",
                ]}
              >
                <FormularioCroquisUbicacion />
              </ProtectedRoute>
            ),
          },
          {
            path: "homeAguas",
            element: (
              <ProtectedRoute
                allowedRoles={[
                  "LaboratorioOrganizacion",
                  "MuestreadorOrganizacion",
                  "Administradororganizacion",
                  "AdministradorMuestreadorOrganizacion",
                  "AdministradorLaboratorioOrganizacion",
                ]}
              >
                <Home />
              </ProtectedRoute>
            ),
          },
          {
            path: "AguasResiduales",
            element: (
              <ProtectedRoute
                allowedRoles={[
                  "MuestreadorOrganizacion",
                  "Administradororganizacion",
                  "AdministradorMuestreadorOrganizacion",
                ]}
              >
                <AguasResiduales />
              </ProtectedRoute>
            ),
          },
          {
            path: "OrdenTrabajo",
            element: (
              <ProtectedRoute
                allowedRoles={[
                  "MuestreadorOrganizacion",
                  "Administradororganizacion",
                  "AdministradorMuestreadorOrganizacion",
                ]}
              >
                <OrdenTrabajo />
              </ProtectedRoute>
            ),
          },
          {
            path: "DetallesAguasResiduales/:id",
            element: (
              <ProtectedRoute
                allowedRoles={[
                  "MuestreadorOrganizacion",
                  "Administradororganizacion",
                  "AdministradorMuestreadorOrganizacion",
                ]}
              >
                <DARpart1 />
              </ProtectedRoute>
            ),
          },
          {
            path: "Formularios/:id",
            element: (
              <ProtectedRoute
                allowedRoles={[
                  "MuestreadorOrganizacion",
                  "Administradororganizacion",
                  "AdministradorMuestreadorOrganizacion",
                ]}
              >
                <Formularios />
              </ProtectedRoute>
            ),
          },
          {
            path: "FormularioProtocoloMuestreo/:id/:idAguas",
            element: (
              <ProtectedRoute
                allowedRoles={[
                  "MuestreadorOrganizacion",
                  "Administradororganizacion",
                  "AdministradorMuestreadorOrganizacion",
                ]}
              >
                <FormularioProtocoloMuestreo />
              </ProtectedRoute>
            ),
          },
          {
            path: "EditarFormularioProtocoloMuestreo/:id/:idAguas",
            element: (
              <ProtectedRoute
                allowedRoles={[
                  "MuestreadorOrganizacion",
                  "Administradororganizacion",
                  "AdministradorMuestreadorOrganizacion",
                ]}
              >
                <EditarFormularioProtocoloMuestreo />
              </ProtectedRoute>
            ),
          },
          {
            path: "EditarHojaCampoMuestreo/:id/:idAguas",
            element: (
              <ProtectedRoute
                allowedRoles={[
                  "MuestreadorOrganizacion",
                  "Administradororganizacion",
                  "AdministradorMuestreadorOrganizacion",
                ]}
              >
                <EditarHojaCampoMuestreo />
              </ProtectedRoute>
            ),
          },
          {
            path: "EditarCroquisUbicacion/:id/:idAguas",
            element: (
              <ProtectedRoute
                allowedRoles={[
                  "MuestreadorOrganizacion",
                  "Administradororganizacion",
                  "AdministradorMuestreadorOrganizacion",
                ]}
              >
                <EditarCroquisUbicacion />
              </ProtectedRoute>
            ),
          },
          {
            path: "FormularioConductividad/:id",
            element: (
              <ProtectedRoute
                allowedRoles={[
                  "MuestreadorOrganizacion",
                  "Administradororganizacion",
                  "AdministradorMuestreadorOrganizacion",
                ]}
              >
                <FromularioConductividad />
              </ProtectedRoute>
            ),
          },
          {
            path: "EditarConductividad/:id/:idAguas",
            element: (
              <ProtectedRoute
                allowedRoles={[
                  "MuestreadorOrganizacion",
                  "Administradororganizacion",
                  "AdministradorMuestreadorOrganizacion",
                ]}
              >
                <EditarConductividad />
              </ProtectedRoute>
            ),
          },
          {
            path: "FormularioVerificacionPh/:id/:idAguas",
            element: (
              <ProtectedRoute
                allowedRoles={[
                  "MuestreadorOrganizacion",
                  "Administradororganizacion",
                ]}
              >
                <FormularioVerificacionPh />
              </ProtectedRoute>
            ),
          },
          {
            path: "EditarVerificacionPh/:id/:idAguas",
            element: (
              <ProtectedRoute
                allowedRoles={[
                  "MuestreadorOrganizacion",
                  "Administradororganizacion",
                  "AdministradorMuestreadorOrganizacion",
                ]}
              >
                <EditarVerificacionPh />
              </ProtectedRoute>
            ),
          },
          {
            path: "custodiaExterna",
            element: (
              <ProtectedRoute
                allowedRoles={[
                  "MuestreadorOrganizacion",
                  "Administradororganizacion",
                  "AdministradorMuestreadorOrganizacion",
                ]}
              >
                <CustodiasExternas />
              </ProtectedRoute>
            ),
          },
          {
            path: "CrearCustodiaExterna",
            element: (
              <ProtectedRoute
                allowedRoles={[
                  "MuestreadorOrganizacion",
                  "Administradororganizacion",
                  "AdministradorMuestreadorOrganizacion",
                ]}
              >
                <CrearCustodiaExterna />
              </ProtectedRoute>
            ),
          },
          {
            path: "CrearCustodiaExterna/:id",
            element: (
              <ProtectedRoute
                allowedRoles={[
                  "MuestreadorOrganizacion",
                  "Administradororganizacion",
                  "AdministradorMuestreadorOrganizacion",
                ]}
              >
                <CrearCustodiaExterna />
              </ProtectedRoute>
            ),
          },
          {
            path: "DetallesCustodiaExternas/:id",
            element: (
              <ProtectedRoute
                allowedRoles={[
                  "MuestreadorOrganizacion",
                  "Administradororganizacion",
                  "AdministradorMuestreadorOrganizacion",
                ]}
              >
                <DetallesCustodiaExterna />
              </ProtectedRoute>
            ),
          },
          {
            path: "Filtros",
            element: (
              <ProtectedRoute
                allowedRoles={[
                  "AdministradorLaboratorioOrganizacion",
                  "Administradororganizacion",
                ]}
              >
                <Filtros />
              </ProtectedRoute>
            ),
          },
          {
            path: "Custodia_Externa_en",
            element: (
              <ProtectedRoute
                allowedRoles={[
                  "AdministradorLaboratorioOrganizacion",
                  "LaboratorioOrganizacion",
                  "Administradororganizacion",
                ]}
              >
                <CustodiasEntregadasPage />
              </ProtectedRoute>
            ),
          },
          {
            path: "insert_id_laboratorio/:id",
            element: (
              <ProtectedRoute
                allowedRoles={[
                  "AdministradorLaboratorioOrganizacion",
                  "LaboratorioOrganizacion",
                  "Administradororganizacion",
                ]}
              >
                <EditarCustodia />
              </ProtectedRoute>
            ),
          },
          {
            path: "usuario",
            element: (
              <ProtectedRoute
                allowedRoles={[
                  "AdministradorLaboratorioOrganizacion",
                  "Administradororganizacion",
                  "AdministradorMuestreadorOrganizacion",
                ]}
              >
                <Usuario />
              </ProtectedRoute>
            ),
          },
          {
            path: "EditarUsuario/:id",
            element: (
              <ProtectedRoute
                allowedRoles={[
                  "AdministradorLaboratorioOrganizacion",
                  "Administradororganizacion",
                  "AdministradorMuestreadorOrganizacion",
                ]}
              >
                <EditarUsuario />
              </ProtectedRoute>
            ),
          },
          {
            path: "Iluminacion",
            element: (
              <ProtectedRoute
                allowedRoles={[
                  "AdministradorLaboratorioOrganizacion",
                  "Administradororganizacion",
                  "AdministradorMuestreadorOrganizacion",
                ]}
              >
                <IluminacionGate />
              </ProtectedRoute>
            ),
          },
          {
            path: "DetallesIluminacion/:id",
            element: (
              <ProtectedRoute
                allowedRoles={[
                  "AdministradorLaboratorioOrganizacion",
                  "Administradororganizacion",
                  "AdministradorMuestreadorOrganizacion",
                ]}
              >
                <DetailsIluminacion />
              </ProtectedRoute>
            ),
          },
          {
            path: "CreateReconocimientoA/:id",
            element: (
              <ProtectedRoute
                allowedRoles={[
                  "AdministradorLaboratorioOrganizacion",
                  "Administradororganizacion",
                  "AdministradorMuestreadorOrganizacion",
                ]}
              >
                <CreateReconocimientoA />
              </ProtectedRoute>
            ),
          },
          {
            path: "CreateReconocimientoB/:id",
            element: (
              <ProtectedRoute
                allowedRoles={[
                  "AdministradorLaboratorioOrganizacion",
                  "Administradororganizacion",
                  "AdministradorMuestreadorOrganizacion",
                ]}
              >
                <CreateReconocimientoB />
              </ProtectedRoute>
            ),
          },
          {
            path: "CreateReconocimientoC/:id",
            element: (
              <ProtectedRoute
                allowedRoles={[
                  "AdministradorLaboratorioOrganizacion",
                  "Administradororganizacion",
                  "AdministradorMuestreadorOrganizacion",
                ]}
              >
                <CreateReconocimientoC />
              </ProtectedRoute>
            ),
          },
          {
            path: "EditarReconocimientoA/:id",
            element: (
              <ProtectedRoute
                allowedRoles={[
                  "AdministradorLaboratorioOrganizacion",
                  "Administradororganizacion",
                  "AdministradorMuestreadorOrganizacion",
                ]}
              >
                <EditarReconocimientoA/>
              </ProtectedRoute>
            ),
          },
          {
            path: "EditarReconocimientoB/:id",
            element: (
              <ProtectedRoute
                allowedRoles={[
                  "AdministradorLaboratorioOrganizacion",
                  "Administradororganizacion",
                  "AdministradorMuestreadorOrganizacion",
                ]}
              >
                <EditarReconocimientoB/>
              </ProtectedRoute>
            ),
          },
          {
            path: "EditarReconocimientoC/:id",
            element: (
              <ProtectedRoute
                allowedRoles={[
                  "AdministradorLaboratorioOrganizacion",
                  "Administradororganizacion",
                  "AdministradorMuestreadorOrganizacion",
                ]}
              >
                <EditarReconocimientoC/>
              </ProtectedRoute>
            ),
          },
          {
            path: "CreateHojaIluminacion/:id",
            element: (
              <ProtectedRoute
                allowedRoles={[
                  "AdministradorLaboratorioOrganizacion",
                  "Administradororganizacion",
                  "AdministradorMuestreadorOrganizacion",
                ]}
              >
                <CreateHojaIluminacion/>
              </ProtectedRoute>
            ),
          },
                    {
            path: "EditarHojaIluminacion/:id",
            element: (
              <ProtectedRoute
                allowedRoles={[
                  "AdministradorLaboratorioOrganizacion",
                  "Administradororganizacion",
                  "AdministradorMuestreadorOrganizacion",
                ]}
              >
                <EditarHojaIluminacion/>
              </ProtectedRoute>
            ),
          },
        ],
      },
      { path: "*", element: <NoAutorizado /> },
    ],
  },
]);

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    {/* <AppRouter /> */}
    <RouterProvider router={router} />
  </React.StrictMode>
);

reportWebVitals();