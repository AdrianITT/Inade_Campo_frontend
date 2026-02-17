import React from "react";
import { Outlet } from "react-router-dom";
import Header from "../Header/Header";
import AutoLogoutTimer from "../AutoLogout/AutoLogoutTimer";
// import CustomFooter from "../footerjs/Footer";


const Layout = () => {
  return (
    <div id="layout-container">
      <AutoLogoutTimer timeout={480 * 60 * 1000} />
      <Header />
      <main id="main-content">
        <Outlet /> {/* Renderiza las rutas hijas aquí */}
      </main>
      {/* <CustomFooter /> */}
    </div>
  );
};

export default Layout;
