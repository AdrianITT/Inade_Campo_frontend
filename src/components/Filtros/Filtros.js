// src/components/Filtros/Filtros.js
import React, { useState, useEffect } from "react";
import { Button, Card } from "antd";
import FiltroTable from "./FiltroTable";
import FiltroFormModal from "./FiltroFormModal";
import { getAllFiltro } from "../../apis/ApiCustodiaExterna/ApiFiltro";
import { createFiltro, updateFiltro } from "../../apis/ApiCustodiaExterna/ApiFiltro";

const Filtros = () => {
  const [filtros, setFiltros] = useState();
     useEffect(() => {
     const fetchFiltros = async () => {
     try {
          const response = await getAllFiltro();
          setFiltros(response.data);  // Asegúrate de usar `response.data` si `axios` lo envuelve
     } catch (error) {
          console.error("Error al cargar filtros:", error);
     }
     };

     fetchFiltros();
     }, []);

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
     try{
          if (selectedFiltro) {
               // actualizar
               const response = await updateFiltro(selectedFiltro.id, values);
               setFiltros((prev) =>
               prev.map((f) =>
                    f.id === selectedFiltro.id ? response.data : f
               )
               );
          } else {
               // crear nuevo
               const response = await createFiltro(values);
               setFiltros((prev) => [...prev, response.data]);
          }
          setModalVisible(false);
     }catch (error) {
     console.error("❌ Error al guardar el filtro:", error);
     }
  };

  return (
     <div style={{ padding: '0 40px' }}>
    <Card title="Gestión de Filtros" 
    extra={<Button onClick={handleCrear}
     style={{ width: "100%"}}
     bodyStyle={{ padding: 16 }}
     bordered
    >Crear Filtro</Button>}>
      <FiltroTable filtros={filtros} onEdit={handleEditar} />
      <FiltroFormModal
        visible={modalVisible}
        onCancel={() => setModalVisible(false)}
        onOk={handleGuardar}
        initialValues={selectedFiltro}
      />
    </Card></div>
  );
};

export default Filtros;
