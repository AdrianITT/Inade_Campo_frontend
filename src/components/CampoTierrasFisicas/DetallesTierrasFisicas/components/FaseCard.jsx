import React from "react";
import { CheckCircleOutlined, LockOutlined } from "@ant-design/icons";
import PropTypes from "prop-types";
import "./FaseCard.css";

/**
 * Componente FaseCard
 * Tarjeta minimalista para cada fase
 */
const FaseCard = ({ fase, bloqueado, onNavigate }) => {
  const handleClick = () => {
    if (!bloqueado) {
      onNavigate(fase);
    }
  };

  const getIcon = () => {
    if (bloqueado) return <LockOutlined />;
    if (fase.completado) return <CheckCircleOutlined />;
    return <CheckCircleOutlined />;
  };

  return (
    <div
      className={`fase-card ${bloqueado ? "bloqueado" : ""} ${
        fase.completado ? "completado" : ""
      }`}
      onClick={handleClick}
      role="button"
      tabIndex={bloqueado ? -1 : 0}
      onKeyPress={(e) => {
        if (e.key === "Enter" && !bloqueado) handleClick();
      }}
    >
      <div className="fase-card-header">
        <div className="fase-badge">{fase.fase}</div>
        <h3 className="fase-title">{fase.titulo}</h3>
      </div>

      <div className="fase-body">
        <span className="fase-status">
          {bloqueado ? "Bloqueado" : "Disponible"}
        </span>
        <div className="fase-icon">{getIcon()}</div>
      </div>
    </div>
  );
};

FaseCard.propTypes = {
  fase: PropTypes.shape({
    id: PropTypes.number.isRequired,
    fase: PropTypes.string.isRequired,
    titulo: PropTypes.string.isRequired,
    ruta: PropTypes.string.isRequired,
    desbloqueado: PropTypes.bool.isRequired,
    completado: PropTypes.bool.isRequired,
  }).isRequired,
  bloqueado: PropTypes.bool.isRequired,
  onNavigate: PropTypes.func.isRequired,
};

export default FaseCard;