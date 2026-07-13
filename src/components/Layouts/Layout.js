import React, { Suspense } from "react";
import { Outlet } from "react-router-dom";
import { Spin } from "antd";
import Header from "../Header/Header";
import AutoLogoutTimer from "../AutoLogout/AutoLogoutTimer";
// import CustomFooter from "../footerjs/Footer";


const Layout = () => {
  return (
    <div id="layout-container">
      <AutoLogoutTimer timeout={480 * 60 * 1000} />
      <Header />
      <main id="main-content">
        <Suspense fallback={<Spin size="large" style={{ display: "block", margin: "100px auto" }} />}>
          <Outlet />
        </Suspense>
      </main>
      {/* <CustomFooter /> */}
    </div>
  );
};

export default Layout;
