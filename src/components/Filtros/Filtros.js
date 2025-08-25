// src/components/Filtros/Filtros.js
import React, { useState, useEffect } from "react";
import { Button, Card, Input, Spin, message } from "antd";
import FiltroTable from "./FiltroTable";
import FiltroFormModal from "./FiltroFormModal";
import { getAllFiltro } from "../../apis/ApiCustodiaExterna/ApiFiltro";
import { createFiltro, updateFiltro, getAllFiltroById } from "../../apis/ApiCustodiaExterna/ApiFiltro";

const { Search } = Input;

// pequeño hook para debounce (reduce llamadas mientras escriben)
function useDebouncedValue(value, delay = 400) {
  const [d, setD] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setD(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return d;
}


const Filtros = () => {
  const [filtros, setFiltros] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState("");
  const debouncedQ = useDebouncedValue(searchText, 400);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [total, setTotal] = useState(0);

  const fetchFiltros = async (signal) => {
    try {
      setLoading(true);
      // usa la API con q + limit=10 (según tu firma)
      const res = await getAllFiltroById(debouncedQ || "", { page, limit, signal });
      // si tu getAllFiltroById devuelve axios Response:
      const data = Array.isArray(res?.data?.results) ? res.data.results : Array.isArray(res) ? res : [];
      setFiltros(data);
      setTotal(Number(res?.data?.count ?? data.length));
    } catch (e) {
      if (e?.name === "CanceledError" || e?.code === "ERR_CANCELED" || e?.message === "canceled") {
          // Silenciar: es una cancelación normal por debounce/cambio rápido
          return;
     }
     console.error("Error al cargar filtros:", e);
     message.error("No se pudieron cargar los filtros");
    } finally {
      setLoading(false);
    }
  };

  // carga inicial + cada cambio de q/page
  useEffect(() => {
    const ac = new AbortController();
    fetchFiltros(ac.signal);
    return () => ac.abort();
  }, [debouncedQ, page, limit]); // <- si cambias limit, vuelve a cargar


  const [modalVisible, setModalVisible] = useState(false);
  const [selectedFiltro, setSelectedFiltro] = useState(null);

  const handleCrear = () => {
    setSelectedFiltro(null);
    setModalVisible(true);
  };

  const handleEditar = (filtro) => {
    setSelectedFiltro(filtro);
    setModalVisible(true);
  };

  const handleGuardar = async (values) => {
    try {
      if (selectedFiltro) {
        // actualizar
        const response = await updateFiltro(selectedFiltro.id, values);
        // refrescar lista con el query actual para mantener consistencia
        const ac = new AbortController();
        await fetchFiltros(ac.signal);
        setModalVisible(false);
      } else {
        // crear
        const response = await createFiltro(values);
        // refrescar lista (para respetar filtro actual)
        const ac = new AbortController();
        await fetchFiltros(ac.signal);
        setModalVisible(false);
      }
    } catch (error) {
      console.error("❌ Error al guardar el filtro:", error);
      message.error("No se pudo guardar el filtro");
    }
  };

return (
    <div style={{ padding: "0 40px" }}>
      <Card
        title="Gestión de Filtros"
        extra={
          <Button onClick={handleCrear} style={{ width: "100%" }} bordered>
            Crear Filtro
          </Button>
        }
        bodyStyle={{ padding: 16 }}
      >
        <div style={{ display: "flex", gap: 8, marginBottom: 12, flexWrap: "wrap" }}>
          <Search
            allowClear
            placeholder="Buscar filtro…"
            value={searchText}
            onChange={(e) => { setSearchText(e.target.value); setPage(1); }}
            style={{ maxWidth: 320 }}
          />
          <Button onClick={() => { setSearchText(""); setPage(1); }}>Limpiar</Button>
        </div>

        <Spin spinning={loading}>
          <FiltroTable 
          filtros={filtros} 
          total={total}
          page={page}
          pageSize={limit}
          onPageChange={(p) => setPage(p)}
          onEdit={handleEditar} />
        </Spin>

        <FiltroFormModal
          visible={modalVisible}
          onCancel={() => setModalVisible(false)}
          onOk={handleGuardar}
          initialValues={selectedFiltro}
        />
      </Card>
    </div>
  );
};


export default Filtros;
