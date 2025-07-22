import React, { useEffect } from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import "./index.css";
import reportWebVitals from "./reportWebVitals";
import Login from "./components/Login/Login";
import VerificarExpiracionLocalStorage from "./components/DataLocalStorage/LocalStorage";
import ProtectedRoute from "./components/ProtectedRoute";
import Layout from "./components/Layouts/Layout.js";
import FormularioProtocoloMuestreo from "./components/FormularioProtocoloMuestreo/FormularioProtocoloMuestreo";
import HojaCampoMuestreo from "./components/HojaCampoMuestreo/HojaCampoMuestreo.jsx";
import FormularioCroquisUbicacion from "./components/FormularioCroquisUbicacion/FormularioCroquisUbicacion";
import Home from "./components/Home/Home.js";
import AguasResiduales from "./components/AguasResiduales/AguasResiduales.jsx";
import OrdenTrabajo from "./components/OrdenTrabajo/OrdenTrabajo.jsx";
import DetallesAguasResiduales from "./components/DetallesAguasR/DetallesAguasResduales.jsx";
import EditarFormularioProtocoloMuestreo from "./components/EditarFormularioProtocoloMuestreo/EditarFormularioProtocoloMuestreo.jsx";
import EditarHojaCampoMuestreo from "./components/EditarHojaCampoMuestreo/EditarHojaCampoMuestreo.jsx";
import EditarCroquisUbicacion from "./components/EditarCroquisUbicacion/EditarCroquisUbicacion.jsx";
import FromularioConductividad from "./components/FormularioConductividad/FormularioConductividad.jsx";
import EditarConductividad from "./components/EditarFormularioConductividad/EditarConductividad.jsx";
import FormularioVerificacionPh from "./components/FormularioVerificacionPh/VerificacionPh.jsx";
import Formularios from "./App.js";
// Hook para cambiar el título de la pestaña
const usePageTitle = () => {
  const location = useLocation();

  useEffect(() => {
    const { pathname } = location;
    let pageTitle = "Simplaxi"; // Título por defecto

    switch (pathname) {
      case "/home":
        pageTitle = "Inicio | Simplaxi";
        break;
      case "/empresa":
        pageTitle = "Empresas | Simplaxi";
        break;
      case "/cliente":
        pageTitle = "Clientes | Simplaxi";
        break;
      case "/servicio":
        pageTitle = "Servicios | Simplaxi";
        break;
      case "/cotizar":
        pageTitle = "Cotizar | Simplaxi";
        break;
      case "/usuario":
        pageTitle = "Usuarios | Simplaxi";
        break;
      case "/configuracionorganizacion":
        pageTitle = "Configuración | Simplaxi";
        break;
      // Agrega más rutas según sea necesario
      default:
        pageTitle = "Simplaxi";
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
        <Route path="*" element={<NoAutorizado />} />
        <Route path="/no-autorizado" element={<NoAutorizado />} /> */}
        {/* Rutas envueltas con Layout */}
        <Route path="/" element={
            <PageWrapper>
              <Layout />
            </PageWrapper>
          }
        >
          {/* <Route path="/FormularioProtocoloMuestreo" element={<ProtectedRoute allowedRoles={['UsuarioOrganizacion', 'Administradororganizacion']}><FormularioProtocoloMuestreo /></ProtectedRoute>} /> */}
          <Route path="/HojaCampoMuestreo/:id/:idAguas" element={<ProtectedRoute allowedRoles={['UsuarioOrganizacion', 'Administradororganizacion']}><HojaCampoMuestreo/></ProtectedRoute>} />
          <Route path="/FormularioCroquisUbicacion/:id" element={<ProtectedRoute allowedRoles={['UsuarioOrganizacion', 'Administradororganizacion']}><FormularioCroquisUbicacion/></ProtectedRoute>} />
          <Route path="/home" element={<ProtectedRoute allowedRoles={['UsuarioOrganizacion', 'Administradororganizacion']}><Home/></ProtectedRoute>} />
          <Route path="/AguasResiduales" element={<ProtectedRoute allowedRoles={['UsuarioOrganizacion', 'Administradororganizacion']}><AguasResiduales/></ProtectedRoute>} />
          <Route path="/OrdenTrabajo" element={<ProtectedRoute allowedRoles={['UsuarioOrganizacion', 'Administradororganizacion']}><OrdenTrabajo/></ProtectedRoute>} />
          <Route path="/DetallesAguasResiduales/:id" element={<ProtectedRoute allowedRoles={['UsuarioOrganizacion', 'Administradororganizacion']}><DetallesAguasResiduales/></ProtectedRoute>} />
          <Route path="/Formularios/:id" element={<ProtectedRoute allowedRoles={['UsuarioOrganizacion', 'Administradororganizacion']}><Formularios/></ProtectedRoute>} />
          <Route path="/FormularioProtocoloMuestreo/:id/:idAguas" element={<ProtectedRoute allowedRoles={['UsuarioOrganizacion', 'Administradororganizacion']}><FormularioProtocoloMuestreo /></ProtectedRoute>} />
          <Route path="/EditarFormularioProtocoloMuestreo/:id/:idAguas" element={<ProtectedRoute allowedRoles={['UsuarioOrganizacion', 'Administradororganizacion']}><EditarFormularioProtocoloMuestreo /></ProtectedRoute>} />
          <Route path="/EditarHojaCampoMuestreo/:id/:idAguas" element={<ProtectedRoute allowedRoles={['UsuarioOrganizacion', 'Administradororganizacion']}><EditarHojaCampoMuestreo /></ProtectedRoute>} />
          <Route path="/EditarCroquisUbicacion/:id/:idAguas" element={<ProtectedRoute allowedRoles={['UsuarioOrganizacion', 'Administradororganizacion']}><EditarCroquisUbicacion /></ProtectedRoute>} />
          <Route path= "/FormularioConductividad/:id" element={<ProtectedRoute allowedRoles={['UsuarioOrganizacion', 'Administradororganizacion']}><FromularioConductividad /></ProtectedRoute>} />
          <Route path= "/EditarConductividad/:id" element={<ProtectedRoute allowedRoles={['UsuarioOrganizacion', 'Administradororganizacion']}><EditarConductividad /></ProtectedRoute>} />
          <Route path= "/FormularioVerificacionPh" element={<ProtectedRoute allowedRoles={['UsuarioOrganizacion', 'Administradororganizacion']}><FormularioVerificacionPh /></ProtectedRoute>} />
          {/*FormularioVerificacionPh  */}
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