// src/components/Header/Header.js
import React, { useState, useEffect, useMemo } from "react";
import { Menu, Button, Drawer, Typography, Space } from "antd";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { MenuOutlined, LogoutOutlined } from "@ant-design/icons";
import Logout_Api from "../../apis/ApiCampo/LougoutApi";
import { getOrganizacionById } from "../../apis/ApiCampo/OrganizacionApi";
import "./Header.css";
import { clearSession } from "../../utils/session";

const { Text } = Typography;

const MENU_ITEMS = [
  {
    key: "home",
    label: "Aguas Residuales",
    children: [
      { key: "homeAguas", path: "/homeAguas", label: "Inicio" },
      { key: "custodiaExterna", path: "/custodiaExterna", label: "Custodia Externa" },
      { key: "AguasResiduales", path: "/AguasResiduales", label: "Aguas Residuales" },
      { key: "Filtros", path: "/Filtros", label: "Filtros" },
      { key: "CustodiaInterna", path: "/Custodia_Externa_en", label: "Custodia Interna" },
    ],
  },
];

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [logoOrganizacion, setLogoOrganizacion] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [openKeys, setOpenKeys] = useState([]);

  const organizacionLocal = localStorage.getItem("organizacion");
  const username = localStorage.getItem("username");

  const handleLogout = async () => {
    try {
      await Logout_Api.post(
        "",
        {},
        { headers: { Authorization: `Token ${localStorage.getItem("token")}` } }
      );

      // ["token", "user_id", "username", "rol", "organizacion", "organizacion_id"].forEach((k) =>
      //   localStorage.removeItem(k)
      // );
      clearSession();
      navigate("/");
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    }
  };

  useEffect(() => {
    const fetchLogoOrganizacion = async () => {
      const organizationId = Number(localStorage.getItem("organizacion_id"));
      if (!organizationId) return;

      try {
        const { data } = await getOrganizacionById(organizationId);
        setLogoOrganizacion(data);
      } catch (error) {
        console.error("Error al obtener la organización:", error);
      }
    };

    fetchLogoOrganizacion();
  }, []);

  // ✅ seleccionado: busca también en children
  const selectedKey = useMemo(() => {
    for (const it of MENU_ITEMS) {
      if (it.children?.length) {
        const child = it.children.find((c) => location.pathname.startsWith(c.path));
        if (child) return child.key;
      }
      if (it.path && location.pathname.startsWith(it.path)) return it.key;
    }
    return "";
  }, [location.pathname]);

  const menuItemsForAntd = MENU_ITEMS.map((item) => ({
    key: item.key,
    label: item.label,
    children: item.children?.map((child) => ({
      key: child.key,
      label: <Link to={child.path}>{child.label}</Link>,
    })),
  }));

  return (
    <header className="appHeader">
      {/* Izquierda: logo + org */}
      <Link to="/homeAguas" className="brand">
        <div className="brandLogoWrap">
          {logoOrganizacion?.logo ? (
            <img
              alt="Logo de la Organización"
              src={logoOrganizacion.logo}
              className="brandLogo"
            />
          ) : (
            <div className="brandLogoFallback" />
          )}
        </div>

        <div className="brandText">
          <div className="brandTitle">{organizacionLocal || "Mi Organización"}</div>
          <Text type="secondary" className="brandSub">
            {username ? `Usuario: ${username}` : "Sistema INADE"}
          </Text>
        </div>
      </Link>

      {/* Derecha: menú + acciones */}
      <div className="headerRight">
        <Menu
          mode="horizontal"
          selectedKeys={[selectedKey]}
          items={menuItemsForAntd}
          className="navDesktop"
        />

        <Space className="actionsDesktop" size={10}>
          <Button danger type="primary" icon={<LogoutOutlined />} onClick={handleLogout}>
            Cerrar sesión
          </Button>
        </Space>

        {/* Móvil */}
        <Button
          className="navMobileBtn"
          type="primary"
          icon={<MenuOutlined />}
          onClick={() => setDrawerOpen(true)}
        >
          Menú
        </Button>
      </div>

      <Drawer
        title="Menú"
        onClose={() => setDrawerOpen(false)}
        open={drawerOpen}
        placement="right"
      >
        <Menu
          mode="inline"
          selectedKeys={[selectedKey]}
          openKeys={openKeys}
          onOpenChange={setOpenKeys}
          items={[
            ...menuItemsForAntd,
            {
              key: "logout",
              label: (
                <Button
                  danger
                  type="primary"
                  block
                  icon={<LogoutOutlined />}
                  onClick={handleLogout}
                >
                  Cerrar sesión
                </Button>
              ),
            },
          ]}
        />
      </Drawer>
    </header>
  );
};

export default Header;
