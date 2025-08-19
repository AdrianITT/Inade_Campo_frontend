import { useMemo } from "react";
import React from "react";
import CustodiasEntregadasTable from "./CustodiasEntregadasTable";
// import { useParams } from "react-router-dom";

export default function CustodiasEntregadasPage() {
     const organizacionId=useMemo(() => parseInt(localStorage.getItem("organizacion_id"), 10), []);
  // Si prefieres leerlo de la URL: const { organizacionId } = useParams();
  return (
  <div style={{ padding: "24px", maxWidth: "1200px", margin: "0 auto" }}>
    <CustodiasEntregadasTable organizacionId={organizacionId} />
  </div>
);
}
