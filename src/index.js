import React, { useEffect } from "react";
import ReactDOM from "react-dom/client";
import { useLocation, createBrowserRouter, RouterProvider, Outlet } from "react-router-dom";
import "./index.css";
import reportWebVitals from "./reportWebVitals";
import Login from "./components/Login/Login";
import VerificarExpiracionLocalStorage from "./components/DataLocalStorage/LocalStorage";
import ProtectedRoute from "./components/ProtectedRoute";
import Layout from "./components/Layouts/Layout.js";
const NoAutorizado = React.lazy(() => import("./components/FetchProtected/NoAutorizado.jsx"));
const ErrorBoundary = React.lazy(() => import("./components/ErrorBoundary/ErrorBoundary.jsx"));
const RouteErrorFallback = React.lazy(() => import("./components/ErrorBoundary/RouteErrorFallback.jsx"));
const DetallesAguasResiduales = React.lazy(() => import("./components/CampoAguas/DetallesAguasR/DetallesAguasResduales.jsx"));
const EditarFormularioProtocoloMuestreo = React.lazy(() => import("./components/CampoAguas/EditarFormularioProtocoloMuestreo/EditarFormularioProtocoloMuestreo.jsx"));
const EditarHojaCampoMuestreo = React.lazy(() => import("./components/CampoAguas/EditarHojaCampoMuestreo/EditarHojaCampoMuestreo.jsx"));
const EditarCroquisUbicacion = React.lazy(() => import("./components/CampoAguas/EditarCroquisUbicacion/EditarCroquisUbicacion.jsx"));
const FromularioConductividad = React.lazy(() => import("./components/CampoAguas/FormularioConductividad/FormularioConductividad.jsx"));
const EditarConductividad = React.lazy(() => import("./components/CampoAguas/EditarFormularioConductividad/EditarConductividad.jsx"));
const FormularioVerificacionPh = React.lazy(() => import("./components/CampoAguas/FormularioVerificacionPh/VerificacionPh.jsx"));
const EditarVerificacionPh = React.lazy(() => import("./components/CampoAguas/EditarVerificacionPh/EditartVerificacionPh.jsx"));
const CustodiasExternas = React.lazy(() => import("./components/CustodiaExterna/CustodiasExterna.jsx"));
const CrearCustodiaExterna = React.lazy(() => import("./components/CustodiaExterna/CrearCustodiaExterna/CrearCustida.jsx"));
const DetallesCustodiaExterna = React.lazy(() => import("./components/CustodiaExterna/DetallesCE/DetallesCustodiaExterna.jsx"));
const Filtros = React.lazy(() => import("./components/Filtros/Filtros.js"));
const Usuario = React.lazy(() => import("./components/Userjs/Usuario.js"));
const EditarUsuario = React.lazy(() => import("./components/Userjs/EditarUsuario.js"));
const CustodiasEntregadasPage = React.lazy(() => import("./components/CustodiaInterna/CustodiaEntregadasPage.jsx"));
const EditarCustodia = React.lazy(() => import("./components/CustodiaInterna/LaboratorioId/EditarCustodia.jsx"));
const Formularios = React.lazy(() => import("./App.js"));
//Importaciones de prueba
const DARpart1 = React.lazy(() => import("./components/CampoAguas/DetallesAguasR/PageDetallesARPruevas/DARpart1.jsx"));
const IluminacionGate = React.lazy(() => import("./components/CampoIluminacion/AllIluminacion/Iluminacion.jsx"));
const DetailsIluminacion = React.lazy(() => import("./components/CampoIluminacion/DetalsIluminacion/DetallesIlum.jsx"));
const CreateReconocimientoA = React.lazy(() => import( "./components/CampoIluminacion/CreateIluminacion/ReconocimientoA.jsx"));
const CreateReconocimientoB = React.lazy(() => import ("./components/CampoIluminacion/CreateIluminacion/ReconocimientoB.jsx"));
const CreateReconocimientoC = React.lazy(() => import("./components/CampoIluminacion/CreateIluminacion/ReconocimientoC.jsx"));
const EditarReconocimientoA = React.lazy(() => import("./components/CampoIluminacion/EditIluminacion/ReconocimientoA.jsx"));
const EditarReconocimientoB = React.lazy(() => import("./components/CampoIluminacion/EditIluminacion/ReconocimientoB.jsx"));
const EditarReconocimientoC = React.lazy(() => import("./components/CampoIluminacion/EditIluminacion/ReconocimientoC.jsx"));
const CreateHojaIluminacion = React.lazy(() => import("./components/CampoIluminacion/CreateIluminacion/HojaCampoIlum.jsx"));
const EditarHojaIluminacion = React.lazy(() => import("./components/CampoIluminacion/EditIluminacion/HojaCampoIlum.jsx"));
// Vibraciones
const ExcelUploader = React.lazy(() => import("./components/CampoVibraciones/FileVibraciones.jsx"));
const GetOrCreateVibracionesPanel = React.lazy(() => import("./components/CampoVibraciones/GetOrCreateVibraciones/GetOrCreateVibracionesPanel.jsx"));
const DetallesVibracione = React.lazy(() => import("./components/CampoVibraciones/DetallesVibracion/DetallesVibracion.jsx"));
const CrearConsultaTF = React.lazy(() => import("./components/CampoTierrasFisicas/HomeTierrasFisicas/CrearConsultaTF.jsx"));
const DetallesTierrasFisicas = React.lazy(() => import ("./components/CampoTierrasFisicas/DetallesTierrasFisicas/DetallesTF.jsx"));
const ReconocimientoTFForm = React.lazy(() => import("./components/CampoTierrasFisicas/ReconocimientoTierrasFisicas/ReconocimientoTFForm.jsx"));
const VerificacionTFForm = React.lazy(() => import("./components/CampoTierrasFisicas/VerificacionTierrasFisicas/VerificacionTFForm.jsx"));
const HojaCampoTFForm = React.lazy(()=> import("./components/CampoTierrasFisicas/HojaCampoTierrasFisicas/HojaCampoTFForm.jsx"));
const Inventario = React.lazy(() => import("./components/InventarioMaquinas/Inventario.jsx"));
// import MachineForm from "./components/InventarioMaquinas/MachineForm.jsx";
// import ARPage from "./components/CampoAguas/AguasResiduales/NoEnUso/ARPage.jsx";

// Lazy imports
const FormularioProtocoloMuestreo = React.lazy(() => import("./components/CampoAguas/FormularioProtocoloMuestreo/FormularioProtocoloMuestreo"));
const HojaCampoMuestreo = React.lazy(() => import("./components/HojaCampoMuestreo/HojaCampoMuestreo.jsx"));
const FormularioCroquisUbicacion = React.lazy(() => import("./components/CampoAguas/FormularioCroquisUbicacion/FormularioCroquisUbicacion"));
const Home = React.lazy(() => import("./components/Home/Home.js"));
const AguasResiduales = React.lazy(() => import("./components/CampoAguas/AguasResiduales/AguasResiduales.jsx"));
const OrdenTrabajo = React.lazy(() => import("./components/OrdenTrabajo/OrdenTrabajo.jsx"));

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

// const AppRouter = () => {
//   return (
//     <Router>
//       <VerificarExpiracionLocalStorage/>
//       <Routes>
//         {/* Ruta para el login sin el Layout */}
//         <Route path="/" element={<Login />} />
//         {/* <Route path="/RegistroUsuarios" element={<RegistroUsuarios />} />
//          */}
//         {/* Rutas envueltas con Layout */}
//         <Route path="*" element={<NoAutorizado />} />
//         <Route path="/no-autorizado" element={<NoAutorizado />} />
//         <Route path="/" element={
//             <PageWrapper>
//               <Layout />
//             </PageWrapper>
//           }
//         >
//           {/* <Route path="/FormularioProtocoloMuestreo" element={<ProtectedRoute allowedRoles={['MuestreadorOrganizacion', 'Administradororganizacion']}><FormularioProtocoloMuestreo /></ProtectedRoute>} /> */}
//           <Route path="/HojaCampoMuestreo/:id/:idAguas" element={<ProtectedRoute allowedRoles={['MuestreadorOrganizacion', 'Administradororganizacion', 'AdministradorMuestreadorOrganizacion']}><HojaCampoMuestreo/></ProtectedRoute>} />
//           <Route path="/FormularioCroquisUbicacion/:id" element={<ProtectedRoute allowedRoles={['MuestreadorOrganizacion', 'Administradororganizacion', 'AdministradorMuestreadorOrganizacion']}><FormularioCroquisUbicacion/></ProtectedRoute>} />
//           <Route path="/homeAguas" element={<ProtectedRoute allowedRoles={['LaboratorioOrganizacion','MuestreadorOrganizacion', 'Administradororganizacion', 'AdministradorMuestreadorOrganizacion', 'AdministradorLaboratorioOrganizacion']}><Home/></ProtectedRoute>} />
//           <Route path="/AguasResiduales" element={<ProtectedRoute allowedRoles={['MuestreadorOrganizacion', 'Administradororganizacion', 'AdministradorMuestreadorOrganizacion']}><AguasResiduales/></ProtectedRoute>} />
//           <Route path="/OrdenTrabajo" element={<ProtectedRoute allowedRoles={['MuestreadorOrganizacion', 'Administradororganizacion', 'AdministradorMuestreadorOrganizacion']}><OrdenTrabajo/></ProtectedRoute>} />
//           <Route path="/DetallesAguasResiduales/:id" element={<ProtectedRoute allowedRoles={['MuestreadorOrganizacion', 'Administradororganizacion', 'AdministradorMuestreadorOrganizacion']}><DARpart1/></ProtectedRoute>} />{/*DARpart1 DetallesAguasResiduales*/}
//           <Route path="/Formularios/:id" element={<ProtectedRoute allowedRoles={['MuestreadorOrganizacion', 'Administradororganizacion', 'AdministradorMuestreadorOrganizacion']}><Formularios/></ProtectedRoute>} />
//           <Route path="/FormularioProtocoloMuestreo/:id/:idAguas" element={<ProtectedRoute allowedRoles={['MuestreadorOrganizacion', 'Administradororganizacion', 'AdministradorMuestreadorOrganizacion']}><FormularioProtocoloMuestreo /></ProtectedRoute>} />
//           <Route path="/EditarFormularioProtocoloMuestreo/:id/:idAguas" element={<ProtectedRoute allowedRoles={['MuestreadorOrganizacion', 'Administradororganizacion', 'AdministradorMuestreadorOrganizacion']}><EditarFormularioProtocoloMuestreo /></ProtectedRoute>} />
//           <Route path="/EditarHojaCampoMuestreo/:id/:idAguas" element={<ProtectedRoute allowedRoles={['MuestreadorOrganizacion', 'Administradororganizacion', 'AdministradorMuestreadorOrganizacion']}><EditarHojaCampoMuestreo /></ProtectedRoute>} />
//           <Route path="/EditarCroquisUbicacion/:id/:idAguas" element={<ProtectedRoute allowedRoles={['MuestreadorOrganizacion', 'Administradororganizacion', 'AdministradorMuestreadorOrganizacion']}><EditarCroquisUbicacion /></ProtectedRoute>} />
//           <Route path= "/FormularioConductividad/:id" element={<ProtectedRoute allowedRoles={['MuestreadorOrganizacion', 'Administradororganizacion', 'AdministradorMuestreadorOrganizacion']}><FromularioConductividad /></ProtectedRoute>} />
//           <Route path= "/EditarConductividad/:id/:idAguas" element={<ProtectedRoute allowedRoles={['MuestreadorOrganizacion', 'Administradororganizacion', 'AdministradorMuestreadorOrganizacion']}><EditarConductividad /></ProtectedRoute>} />
//           <Route path= "/FormularioVerificacionPh/:id/:idAguas" element={<ProtectedRoute allowedRoles={['MuestreadorOrganizacion', 'Administradororganizacion']}><FormularioVerificacionPh /></ProtectedRoute>} />
//           <Route path= "/EditarVerificacionPh/:id/:idAguas" element={<ProtectedRoute allowedRoles={['MuestreadorOrganizacion', 'Administradororganizacion', 'AdministradorMuestreadorOrganizacion']}><EditarVerificacionPh /></ProtectedRoute>} />
//           <Route path= "/custodiaExterna" element={<ProtectedRoute allowedRoles={['MuestreadorOrganizacion', 'Administradororganizacion', 'AdministradorMuestreadorOrganizacion']}><CustodiasExternas /></ProtectedRoute>} />
//           <Route path= "/CrearCustodiaExterna" element={<ProtectedRoute allowedRoles={['MuestreadorOrganizacion', 'Administradororganizacion', 'AdministradorMuestreadorOrganizacion']}><CrearCustodiaExterna /></ProtectedRoute>} />
//           <Route path= "/CrearCustodiaExterna/:id" element={<ProtectedRoute allowedRoles={['MuestreadorOrganizacion', 'Administradororganizacion', 'AdministradorMuestreadorOrganizacion']}><CrearCustodiaExterna /></ProtectedRoute>} />
//           <Route path= "/DetallesCustodiaExternas/:id" element={<ProtectedRoute allowedRoles={['MuestreadorOrganizacion', 'Administradororganizacion', 'AdministradorMuestreadorOrganizacion']}><DetallesCustodiaExterna /></ProtectedRoute>} />
//           <Route path= "/Filtros" element={<ProtectedRoute allowedRoles={['AdministradorLaboratorioOrganizacion', 'Administradororganizacion']}><Filtros /></ProtectedRoute>} />
//           <Route path= "/Custodia_Externa_en" element={<ProtectedRoute allowedRoles={['AdministradorLaboratorioOrganizacion','LaboratorioOrganizacion', 'Administradororganizacion']}><CustodiasEntregadasPage /></ProtectedRoute>} />
//           <Route path= "/insert_id_laboratorio/:id" element={<ProtectedRoute allowedRoles={['AdministradorLaboratorioOrganizacion','LaboratorioOrganizacion', 'Administradororganizacion']}><EditarCustodia /></ProtectedRoute>} />
//           <Route path= "/usuario" element={<ProtectedRoute allowedRoles={['AdministradorLaboratorioOrganizacion', 'Administradororganizacion', 'AdministradorMuestreadorOrganizacion']}><Usuario /></ProtectedRoute>} />
//           <Route path= "/EditarUsuario/:id" element={<ProtectedRoute allowedRoles={['AdministradorLaboratorioOrganizacion', 'Administradororganizacion', 'AdministradorMuestreadorOrganizacion']}><EditarUsuario /></ProtectedRoute>} />
//           <Route path= "/Iluminacion" element={<ProtectedRoute allowedRoles={['AdministradorLaboratorioOrganizacion', 'Administradororganizacion', 'AdministradorMuestreadorOrganizacion',"MuestreadorOrganizacion",]}><IluminacionGate /></ProtectedRoute>} />
//           <Route path= "/DetallesIluminacion/:id" element={<ProtectedRoute allowedRoles={['AdministradorLaboratorioOrganizacion', 'Administradororganizacion', 'AdministradorMuestreadorOrganizacion',"MuestreadorOrganizacion",]}><DetailsIluminacion /></ProtectedRoute>} />
//           {/* <Route path= "/ar_page" element={<ProtectedRoute allowedRoles={['LaboratorioOrganizacion', 'Administradororganizacion']}><ARPage/></ProtectedRoute>} /> */}
//           {/* ARPage  */}
//         </Route>
//       </Routes>

//     </Router>
//   );
// };

const router = createBrowserRouter([
  {
    path: "/",
    element: <>
    <VerificarExpiracionLocalStorage />
    <Outlet/>
    </>,
    errorElement: <RouteErrorFallback />,
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
                  "MuestreadorOrganizacion",
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
                  "MuestreadorOrganizacion",
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
                  "MuestreadorOrganizacion",
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
                  "MuestreadorOrganizacion",
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
                  "MuestreadorOrganizacion",
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
                  "MuestreadorOrganizacion",
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
                  "MuestreadorOrganizacion",
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
                  "MuestreadorOrganizacion",
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
                  "MuestreadorOrganizacion",
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
                  "MuestreadorOrganizacion",
                  "Administradororganizacion",
                  "AdministradorMuestreadorOrganizacion",
                ]}
              >
                <EditarHojaIluminacion/>
              </ProtectedRoute>
            ),
          },
          // {
          //   path: "UpArchive",
          //   element: (
          //     <ProtectedRoute
          //       allowedRoles={[
          //         "AdministradorLaboratorioOrganizacion",
          //         "MuestreadorOrganizacion",
          //         "Administradororganizacion",
          //         "AdministradorMuestreadorOrganizacion",
          //       ]}
          //     >
          //       <ExcelUploader/>
          //     </ProtectedRoute>
          //   ),
          // },
          {
            path: "GetOrCreateVibracionesPanel",
            element: (
              <ProtectedRoute
                allowedRoles={[
                  "AdministradorLaboratorioOrganizacion",
                  "MuestreadorOrganizacion",
                  "Administradororganizacion",
                  "AdministradorMuestreadorOrganizacion",
                ]}
              >
                <GetOrCreateVibracionesPanel/>
              </ProtectedRoute>
            ),
          },
          {
            path: "DetallesVibracion/:id",
            element: (
              <ProtectedRoute
                allowedRoles={[
                  "AdministradorLaboratorioOrganizacion",
                  "MuestreadorOrganizacion",
                  "Administradororganizacion",
                  "AdministradorMuestreadorOrganizacion",
                ]}
              >
                <DetallesVibracione/>
              </ProtectedRoute>
            ),
          },
          {
            path: "CrearTF",
            element: (
              <ProtectedRoute
                allowedRoles={[
                  "AdministradorLaboratorioOrganizacion",
                  "MuestreadorOrganizacion",
                  "Administradororganizacion",
                  "AdministradorMuestreadorOrganizacion",
                ]}
              >
                <CrearConsultaTF/>
              </ProtectedRoute>
            ),
          },
          {
            path: "DetallesTierrasFisicas/:id",
            element: (
              <ProtectedRoute
                allowedRoles={[
                  "AdministradorLaboratorioOrganizacion",
                  "MuestreadorOrganizacion",
                  "Administradororganizacion",
                  "AdministradorMuestreadorOrganizacion",
                ]}
              >
                <DetallesTierrasFisicas/>
              </ProtectedRoute>
            ),
          },
          {
            path: "ReconocimientoTF/:id",
            element: (
              <ProtectedRoute
                allowedRoles={[
                  "AdministradorLaboratorioOrganizacion",
                  "MuestreadorOrganizacion",
                  "Administradororganizacion",
                  "AdministradorMuestreadorOrganizacion",
                ]}
              >
                <ReconocimientoTFForm/>
              </ProtectedRoute>
            ),
          },
          {
            path: "VerificacionTF/:id",
            element: (
              <ProtectedRoute
                allowedRoles={[
                  "AdministradorLaboratorioOrganizacion",
                  "MuestreadorOrganizacion",
                  "Administradororganizacion",
                  "AdministradorMuestreadorOrganizacion",
                ]}
              >
                <VerificacionTFForm/>
              </ProtectedRoute>
            ),
          },
          {
            path: "HojaCampoTF/:id",
            element: (
              <ProtectedRoute
                allowedRoles={[
                  "AdministradorLaboratorioOrganizacion",
                  "MuestreadorOrganizacion",
                  "Administradororganizacion",
                  "AdministradorMuestreadorOrganizacion",
                ]}
              >
                <HojaCampoTFForm/>
              </ProtectedRoute>
            ),
          },
          {
            path: "Inventario",
            element: (
              <ProtectedRoute
                allowedRoles={[
                  // "AdministradorLaboratorioOrganizacion",
                  // "MuestreadorOrganizacion",
                  "Administradororganizacion",
                  "AdministradorMuestreadorOrganizacion",
                ]}
              >
                <Inventario/>
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
    <ErrorBoundary>
      <RouterProvider router={router} />
    </ErrorBoundary>
  </React.StrictMode>
);

reportWebVitals();