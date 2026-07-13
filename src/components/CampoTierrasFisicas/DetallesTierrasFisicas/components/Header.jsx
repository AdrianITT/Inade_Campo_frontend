import React from "react";
import { Row, Button } from "antd";
import { FileExcelOutlined } from "@ant-design/icons";
import PropTypes from "prop-types";
import { STYLES } from "../constants.js";

/**
 * Componente Header
 * Muestra el título y el botón de descarga de Excel
 *
 * @param {Object} props
 * @param {string} props.ot - Número de orden de trabajo
 * @param {Function} props.onDownload - Callback al hacer click en descargar
 * @param {boolean} props.loading - Si está cargando la descarga
 */
const Header = ({ ot, onDownload, loading = false }) => {
  return (
    <Row justify="space-between" align="middle">
      {/* Título y subtítulo */}
      <div>
        <h1 style={STYLES.headerTitle}>
          Tierras Físicas OT {ot ?? "Cargando..."}
        </h1>
        <p style={STYLES.headerSubtitle}>
          Flujo de trabajo y control de fases
        </p>
      </div>

      {/* Botón de descarga */}
      <Button
        type="primary"
        size="large"
        icon={<FileExcelOutlined />}
        onClick={onDownload}
        loading={loading}
        style={STYLES.downloadButton}
      >
        Descargar Excel
      </Button>
    </Row>
  );
};

Header.propTypes = {
  ot: PropTypes.string,
  onDownload: PropTypes.func.isRequired,
  loading: PropTypes.bool,
};

export default Header;