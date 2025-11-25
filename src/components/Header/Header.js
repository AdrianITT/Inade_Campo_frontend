// src/components/Header/Header.js
import React, { useState, useEffect, useMemo } from "react";
import { Menu, Button, Drawer } from "antd";
import { Link, useLocation, useNavigate } from "react-router-dom";
import Logout_Api from "../../apis/ApiCampo/LougoutApi";
import { getOrganizacionById } from "../../apis/ApiCampo/OrganizacionApi";
import "./Header.css";

const MENU_ITEMS = [
  { key: "custodiaExterna", path: "/custodiaExterna", label: "Custodia Externa" },
  { key: "AguasResiduales", path: "/AguasResiduales", label: "Aguas Residuales" },
  { key: "Filtros", path: "/Filtros", label: "Filtros" },
  { key: "CustodiaInterna", path: "/Custodia_Externa_en", label: "Custodia Interna" },
];

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [logoOrganizacion, setLogoOrganizacion] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [openKeys, setOpenKeys] = useState([]);

  const organizacionLocal = localStorage.getItem("organizacion");

  // ---------- LOGOUT ----------
  const handleLogout = async () => {
    try {
      await Logout_Api.post(
        "",
        {},
        {
          headers: {
            Authorization: `Token ${localStorage.getItem("token")}`,
          },
        }
      );

      [
        "token",
        "user_id",
        "username",
        "rol",
        "organizacion",
        "organizacion_id",
      ].forEach((k) => localStorage.removeItem(k));

      navigate("/");
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    }
  };

  // ---------- LOGO ORG ----------
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

  // ---------- RUTA SELECCIONADA ----------
  const selectedKey = useMemo(() => {
    const item = MENU_ITEMS.find((it) =>
      location.pathname.startsWith(it.path)
    );
    return item?.key ?? "";
  }, [location.pathname]);

  // Construimos items para el componente Menu de antd
  const menuItemsForAntd = [
    ...MENU_ITEMS.map((item) => ({
      key: item.key,
      label: (
        <Link to={item.path} rel="noopener noreferrer">
          {item.label}
        </Link>
      ),
    })),
    {
      key: "logout",
      label: (
        <div className="logout-button">
          <Button danger type="primary" onClick={handleLogout}>
            Cerrar sesión
          </Button>
        </div>
      ),
    },
  ];

  return (
    <header className="header-container">
      {/* Logo */}
      <Link to="/homeAguas" className="header-logo">
        {logoOrganizacion?.logo ? (
          <img
            alt="Logo de la Organización"
            src={logoOrganizacion.logo}
            className="header-logo-img"
          />
        ) : (
          <img
            alt="LOGO"
            className="header-logo-img"
          />
        )}
      </Link>

      {/* Título */}
      <div className="Title-Header">
        <h2>{organizacionLocal || "Mi Organización"}</h2>
      </div>

      {/* MENÚ DESKTOP */}
      <Menu
        mode="horizontal"
        selectedKeys={[selectedKey]}
        items={menuItemsForAntd}
        className="header-menu-desktop"
      />

      {/* Botón menú (solo móvil) */}
      <div className="header-button">
        <Button type="primary" onClick={() => setDrawerOpen(true)}>
          Menú
        </Button>
      </div>

      {/* MENÚ MÓVIL (Drawer) */}
      <Drawer
        title="Menú"
        onClose={() => setDrawerOpen(false)}
        open={drawerOpen}
      >
        <Menu
          mode="inline"
          selectedKeys={[selectedKey]}
          openKeys={openKeys}
          onOpenChange={setOpenKeys}
          items={menuItemsForAntd}
        />
      </Drawer>
    </header>
  );
};

export default Header;
