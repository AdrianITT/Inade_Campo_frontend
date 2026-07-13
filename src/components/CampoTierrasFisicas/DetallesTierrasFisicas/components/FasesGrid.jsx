import React from "react";
import PropTypes from "prop-types";
import FaseCard from "./FaseCard";
import "./FasesGrid.css";

/**
 * Componente FasesGrid
 * Grid limpio y responsivo de fases
 */
const FasesGrid = ({ fases, onNavigate }) => {
  return (
    <div className="fases-grid">
      {fases.map((fase) => (
        <FaseCard
          key={fase.id}
          fase={fase}
          bloqueado={!fase.desbloqueado}
          onNavigate={onNavigate}
        />
      ))}
    </div>
  );
};

FasesGrid.propTypes = {
  fases: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number.isRequired,
      fase: PropTypes.string.isRequired,
      titulo: PropTypes.string.isRequired,
      completado: PropTypes.bool.isRequired,
      desbloqueado: PropTypes.bool.isRequired,
    })
  ).isRequired,
  onNavigate: PropTypes.func.isRequired,
};

export default FasesGrid;