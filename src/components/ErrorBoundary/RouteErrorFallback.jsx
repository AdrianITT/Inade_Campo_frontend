import React from "react";
import { useRouteError } from "react-router-dom";

const RouteErrorFallback = () => {
  const error = useRouteError();

  console.error("Error de ruta capturado:", error);

  const handleReload = () => {
    window.location.reload();
  };

  return (
    <div style={{ padding: 40, textAlign: "center" }}>
      <h2>Algo salió mal</h2>
      <p>Ocurrió un error inesperado. Por favor recarga la página.</p>
      <button onClick={handleReload}>Recargar</button>
    </div>
  );
};

export default RouteErrorFallback;
