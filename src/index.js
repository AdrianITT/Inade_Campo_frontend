import React, { useEffect } from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
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
import CustodiasEntregadasPage from "./components/CustodiaInterna/CustodiaEntregadasPage.jsx";
import EditarCustodia from "./components/CustodiaInterna/LaboratorioId/EditarCustodia.jsx";
import NoAutorizado from "./components/FetchProtected/NoAutorizado.jsx";
import Formularios from "./App.js";
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
          <Route path="/HojaCampoMuestreo/:id/:idAguas" element={<ProtectedRoute allowedRoles={['MuestreadorOrganizacion', 'Administradororganizacion']}><HojaCampoMuestreo/></ProtectedRoute>} />
          <Route path="/FormularioCroquisUbicacion/:id" element={<ProtectedRoute allowedRoles={['MuestreadorOrganizacion', 'Administradororganizacion']}><FormularioCroquisUbicacion/></ProtectedRoute>} />
          <Route path="/homeAguas" element={<ProtectedRoute allowedRoles={['Laboratorio','MuestreadorOrganizacion', 'Administradororganizacion']}><Home/></ProtectedRoute>} />
          <Route path="/AguasResiduales" element={<ProtectedRoute allowedRoles={['MuestreadorOrganizacion', 'Administradororganizacion']}><AguasResiduales/></ProtectedRoute>} />
          <Route path="/OrdenTrabajo" element={<ProtectedRoute allowedRoles={['MuestreadorOrganizacion', 'Administradororganizacion']}><OrdenTrabajo/></ProtectedRoute>} />
          <Route path="/DetallesAguasResiduales/:id" element={<ProtectedRoute allowedRoles={['MuestreadorOrganizacion', 'Administradororganizacion']}><DetallesAguasResiduales/></ProtectedRoute>} />
          <Route path="/Formularios/:id" element={<ProtectedRoute allowedRoles={['MuestreadorOrganizacion', 'Administradororganizacion']}><Formularios/></ProtectedRoute>} />
          <Route path="/FormularioProtocoloMuestreo/:id/:idAguas" element={<ProtectedRoute allowedRoles={['MuestreadorOrganizacion', 'Administradororganizacion']}><FormularioProtocoloMuestreo /></ProtectedRoute>} />
          <Route path="/EditarFormularioProtocoloMuestreo/:id/:idAguas" element={<ProtectedRoute allowedRoles={['MuestreadorOrganizacion', 'Administradororganizacion']}><EditarFormularioProtocoloMuestreo /></ProtectedRoute>} />
          <Route path="/EditarHojaCampoMuestreo/:id/:idAguas" element={<ProtectedRoute allowedRoles={['MuestreadorOrganizacion', 'Administradororganizacion']}><EditarHojaCampoMuestreo /></ProtectedRoute>} />
          <Route path="/EditarCroquisUbicacion/:id/:idAguas" element={<ProtectedRoute allowedRoles={['MuestreadorOrganizacion', 'Administradororganizacion']}><EditarCroquisUbicacion /></ProtectedRoute>} />
          <Route path= "/FormularioConductividad/:id" element={<ProtectedRoute allowedRoles={['MuestreadorOrganizacion', 'Administradororganizacion']}><FromularioConductividad /></ProtectedRoute>} />
          <Route path= "/EditarConductividad/:id/:idAguas" element={<ProtectedRoute allowedRoles={['MuestreadorOrganizacion', 'Administradororganizacion']}><EditarConductividad /></ProtectedRoute>} />
          <Route path= "/FormularioVerificacionPh/:id/:idAguas" element={<ProtectedRoute allowedRoles={['MuestreadorOrganizacion', 'Administradororganizacion']}><FormularioVerificacionPh /></ProtectedRoute>} />
          <Route path= "/EditarVerificacionPh/:id/:idAguas" element={<ProtectedRoute allowedRoles={['MuestreadorOrganizacion', 'Administradororganizacion']}><EditarVerificacionPh /></ProtectedRoute>} />
          <Route path= "/custodiaExterna" element={<ProtectedRoute allowedRoles={['MuestreadorOrganizacion', 'Administradororganizacion']}><CustodiasExternas /></ProtectedRoute>} />
          <Route path= "/CrearCustodiaExterna" element={<ProtectedRoute allowedRoles={['MuestreadorOrganizacion', 'Administradororganizacion']}><CrearCustodiaExterna /></ProtectedRoute>} />
          <Route path= "/CrearCustodiaExterna/:id" element={<ProtectedRoute allowedRoles={['MuestreadorOrganizacion', 'Administradororganizacion']}><CrearCustodiaExterna /></ProtectedRoute>} />
          <Route path= "/DetallesCustodiaExternas/:id" element={<ProtectedRoute allowedRoles={['MuestreadorOrganizacion', 'Administradororganizacion']}><DetallesCustodiaExterna /></ProtectedRoute>} />
          <Route path= "/Filtros" element={<ProtectedRoute allowedRoles={['LaboratorioOrganizacion', 'Administradororganizacion']}><Filtros /></ProtectedRoute>} />
          <Route path= "/Custodia_Externa_en" element={<ProtectedRoute allowedRoles={['LaboratorioOrganizacion', 'Administradororganizacion']}><CustodiasEntregadasPage /></ProtectedRoute>} />
          <Route path= "/insert_id_laboratorio/:id" element={<ProtectedRoute allowedRoles={['LaboratorioOrganizacion', 'Administradororganizacion']}><EditarCustodia /></ProtectedRoute>} />
        </Route>
      </Routes>

    </Router>
  );
};

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <AppRouter />
  </React.StrictMode>
);

reportWebVitals();