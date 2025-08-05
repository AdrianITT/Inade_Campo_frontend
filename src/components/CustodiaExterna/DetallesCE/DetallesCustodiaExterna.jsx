import React, { useEffect, useState } from "react";
import {useParams,useNavigate } from "react-router-dom";
//import { DownloadOutlined } from '@ant-design/icons';
import { Button,Descriptions, Card, Tag, Dropdown, Menu, Modal, Result } from 'antd';
import {CheckCircleTwoTone, FileExcelTwoTone, CaretDownOutlined, MailTwoTone } from "@ant-design/icons";
//import {Link} from "react-router-dom";
//import { useParams, Link, useNavigate } from "react-router-dom";
import './DetallesCustodiaExterna.css';
import { getCustodiaExternaById } from "../../../apis/ApiCustodiaExterna/ApiCustodiaExtern";
import { getAllPrioridad } from '../../../apis/ApiCustodiaExterna/ApiPrioridad';
import { getCustodiaExternaDataById } from '../../../apis/ApiCustodiaExterna/ApiCustodiaExternaData';

export default function CadenaCustodiaExterna() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [custodiaExternas, setCustodiaExterna] = useState(null);
  const [custodiaExternasData, setCustodiaExternaData] = useState(null);
  const [prioridades, setPrioridades] = useState([]);
  const { id } = useParams(); // Cambia esto por el ID real que necesites
  const navigate = useNavigate();
  //const estado = 1; // Cambia esto por el estado real que necesites
  const estados = {
    1: { color: "orange", texto: "Iniciado" },
    2: { color: "processing", texto: "Completado" },
    3: { color: "success", texto: "Entregado" },
    4: { color: "error", texto: "Finalizado" },
  };
  

  
  // 1. Cargar los datos de la custodia externa por ID
  useEffect(() => {
    if (!id) return; // Evita llamar si no hay ID
    getCustodiaExternaById(id)
      .then((res) => {
        console.log('res.data: ',res.data);
        // Asume que res.data contiene la custodia
        setCustodiaExterna(res.data);
      })
      .catch((err) => console.error("Error al obtener la custodia:", err));
    
      getAllPrioridad().then(res => {
        console.log('getAllPrioridad: ',res.data);
      setPrioridades(res.data); // [{ id:1, codigo:'A', descripcion:'(15) Días hábiles'}, ...]
    });
    getCustodiaExternaDataById(id)
    .then((res) => {
      console.log('res.data12: ',res.data);
      // Asume que res.data contiene la custodia
      setCustodiaExternaData(res.data);
    })
    
  }, [id]);
  //const { id } = useParams();

  const showModal = () => {
    setIsModalOpen(true);
  };

  const handleOk = () => {
    setIsModalOpen(false);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
  };
  

   const menu = (
      <Menu>
        <Menu.Item key="1" icon={<CheckCircleTwoTone twoToneColor="#52c41a"/>} onClick={showModal}>
          Actualizar estado
        </Menu.Item>
        <Menu.Item key="2" icon={<FileExcelTwoTone />} >
          descargar Excel
        </Menu.Item>{/*"/crearCustodiaExterna" to={`/crearCustodiaExterna/${id}`}*/}
        <Menu.Item key="3" icon={<FileExcelTwoTone />} onClick={() => navigate(`/crearCustodiaExterna/${custodiaExternas.id}`)}>
          Editar o continuar con CE
        </Menu.Item>
        <Menu.Item key="4" icon={<MailTwoTone />} >
          Editar o continuar con CE
        </Menu.Item>
      </Menu>
    );
  return (
  <div className="contenedor-principal">
    <h2>
      Detalles Cadena <span className="font-bold">de Custodia Externa</span>
    </h2>
    {custodiaExternasData &&(
      <div>
    {/* Contenedor alineado con el Card */}
    <div className="fila-etiqueta-boton borde-card">
    <Tag bordered={false} color={estados[custodiaExternas.estado].color} className="tag-grande">
      {estados[custodiaExternas.estado].texto}
    </Tag>
      {/* <Button type="primary" size="large">Actualizar estado</Button>*/}
      <Dropdown overlay={menu}>
        <Button type="primary" size="large" style={{ marginBottom: "16px" }}
        icon={<CaretDownOutlined  twoToneColor="#52c41a" />} iconPosition={'end'} 
        >
          Mas Optiones
        </Button>
      </Dropdown>
    </div>

    <Card title="Custodia Externa" style={{ width: 900 }}>
      <Descriptions title="Info">
      <Descriptions.Item label="Prioridad">
        {custodiaExternas && prioridades.length > 0 ? (
          (() => {
            // Buscar la prioridad asociada
            const prioridadObj = prioridades.find(
              (p) => p.id === custodiaExternas.prioridad
            );
            // Definir el mapeo de colores por id de prioridad
            const priorityColors = {
              4: "red",
              3:"cyan",
              2: "blue",
              1: "green",
              // Agrega más mapeos según tus prioridades
            };
            
            return prioridadObj ? (
              <Tag color={priorityColors[prioridadObj.id] || "default"}>
                {`${prioridadObj.codigo} - ${prioridadObj.descripcion}`}
              </Tag>
            ) : (
              "Sin asignar"
            );
          })()
        ) : (
          "Cargando..."
        )}
      </Descriptions.Item>
      <Descriptions.Item label="Contacto">
        {custodiaExternas?.contacto}
      </Descriptions.Item>
      <Descriptions.Item label="Muestreo Requerido">
        {custodiaExternas?.muestreoRequerido}
      </Descriptions.Item>
      <Descriptions.Item label="Fecha Final">
        {custodiaExternas?.fechaFinal}
      </Descriptions.Item>
      <Descriptions.Item label="Hora Final">
        {custodiaExternas?.horaFinal}
      </Descriptions.Item>
      <Descriptions.Item label="Puntos de muestreo">
        {custodiaExternas?.puntosMuestreoAutorizados}
      </Descriptions.Item>
      </Descriptions>

      <Descriptions title="Info Cliente" column={2} style={{marginTop:24}}>
        <Descriptions.Item label="Nombre">
          {custodiaExternasData.cliente?.nombre}
        </Descriptions.Item>
        <Descriptions.Item label="Correo">
          {custodiaExternasData.cliente?.correo}
        </Descriptions.Item>
        <Descriptions.Item label="Celular">
          {custodiaExternasData.cliente?.celular}
        </Descriptions.Item>
      </Descriptions>
      <Descriptions title="Info Empresa" column={2} style={{marginTop:24}}>
        <Descriptions.Item label="Nombre">
          {custodiaExternasData.empresa?.nombre}
        </Descriptions.Item>
        <Descriptions.Item label="Dirección">
          {[
            custodiaExternasData.empresa?.direccion?.calle,
            custodiaExternasData.empresa?.direccion?.numero,
            custodiaExternasData.empresa?.direccion?.colonia,
            custodiaExternasData.empresa?.direccion?.ciudad,
            custodiaExternasData.empresa?.direccion?.estado,
            custodiaExternasData.empresa?.direccion?.codigoPostal,
          ].filter(Boolean).join(', ')}
        </Descriptions.Item>
      </Descriptions>
    </Card>

      </div>
  )}
    <Modal 
    title="Basic Modal" 
    open={isModalOpen} 
    onOk={handleOk} 
    onCancel={handleCancel}>
      <Result
          title="Esta seguro de cambiar el estado de la cadena de custodia?"
          />
      </Modal>
  </div>

  );
}
