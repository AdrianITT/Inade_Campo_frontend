import React, { useEffect, useState, useMemo } from "react";
import { Table, Button, Card, Dropdown, Menu, message, Modal } from "antd";
import { RightCircleTwoTone, FileTextTwoTone, FilePdfTwoTone, MailTwoTone, DeleteOutlined, EditTwoTone } from "@ant-design/icons";
import { Link, useParams, useNavigate } from "react-router-dom";
import {getDetallesAguaResidualInforme} from "../../apis/ApiCampo/DetallesAguasResiduales";
import "./css/DAR.css"; // Asegúrate de importar el archivo CSS



const DetallesAguasResiduales = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // Estados para almacenar cada parte de la información
  const [orderHeader, setOrderHeader] = useState(null); // Datos de la tabla "ordentrabajo"
  //const [receptorData, setReceptorData] = useState(null); // Datos del receptor (tabla "clientes")
  //const [companyData, setCompanyData] = useState(null); // Datos de la empresa (tabla "empresa")
  const [servicesData, setServicesData] = useState([]); // Datos de los servicios (tabla "servicio")
  const [cotizacionData, setCotizacionData] = useState([]); // Datos de la cotización
  const [clientData, setClientData] = useState(null); // Datos del cliente (que contiene el id de la empresa)
  const [recep, setRecep] = useState(null);
  const [empresa, setEmpresa] = useState(null);
  const [estadoEmpresa, setEstadoEmpresa] = useState(null);
  const [estadoOrden, setEstadoOrden] = useState(null);
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const [IdCotizacion, setIdCotizacion] = useState([]); // Datos de los servicios (tabla "servicio")
  const [loadingId, setLoadingId] = useState(null);

  // Obtener el ID de la organización una sola vez
     //const organizationId = useMemo(() => parseInt(localStorage.getItem("organizacion_id"), 10), []);
     
       useEffect(() => {
    const fetchData = async () => {
      try {
          setLoadingId(id);
        // Llamada al nuevo endpoint
        const detailResponse = await getDetallesAguaResidualInforme(id);
        const data = detailResponse.data;
        console.log("data: ", data);
        
        setClientData(data.cliente);
        setEmpresa(data.empresa);
        setRecep(data.ordenTrabajo.receptor);
        setOrderHeader(data.ordenTrabajo);
        setServicesData(data.intermediario);

        // Si necesitas un "método" adicional, tendrías que mapear
        // y hacer llamadas a getMetodoById(...) como hacías antes.
      } catch (error) {
        console.error("Error al obtener el detalle de la orden:", error);

      }finally{
          setLoadingId(null); 
      }
    };
    fetchData();
  }, [id]);

  const columnasServicios = [
    {
      title: "Nombre del servicio",
      key: "id",
      render: (_, record) => `Informes de aguas residuales #${record.id}`,
    },
     {
          title: "Opciones", 
          key: "opciones",
          render: (_, record) => (
          <Link to={`/ImformesAguas/${record.id}`}>
            <Button className="detalles-button">Continuar</Button>
          </Link>
          ),
     },

  ];
  

    // Función para mostrar el modal de eliminación
  const showDeleteModal = () => {
    setIsDeleteModalVisible(true);
  };

      // Función para cancelar la eliminación
  const handleCancelDelete = () => {
    setIsDeleteModalVisible(false);
  };


  /*<Menu.Item key="2" icon={<FileTextTwoTone />}>
        <Link to={`/CrearFactura/${orderId}`}>Detalles de Facturar</Link>
      </Menu.Item> */
  const menu = (
    <Menu>
      <Menu.Item key="1" icon={<RightCircleTwoTone />}>
        <Link to={`/Formularios/${id}`}>Crear Informe AR</Link>
      </Menu.Item>
    </Menu>

  );

  return (
    <div className="container">
      <h1 className="page-title">Detalles de Aguas: {orderHeader?.codigo }</h1>
      <div className="button-container">
        <Dropdown overlay={menu} placement="bottomRight" arrow>
          <Button type="primary" className="action-button">
            Acciones para AR
          </Button>
        </Dropdown>
      </div>

      <Card className="info-card" title="Información del Cliente y Empresa" bordered={false}>
        {orderHeader && clientData && recep && empresa && (
          <>
            <p><strong>Cliente:</strong> {clientData.nombre}</p>
            <p><strong>Correo:</strong> {clientData.correo}</p>
            <p><strong>Telefono:</strong> {clientData.telefono}</p>
            <p><strong>Receptor:</strong> {orderHeader.receptor}</p>
            <p><strong>Empresa:</strong> {empresa.nombre}</p>
            <p><strong>Dirección del Cliente:</strong></p>
            <ul>
              <li>{clientData.direccion}</li>
            </ul>
            <p><strong>Dirección de la Empresa:</strong></p>
            <ul>
               <li>{empresa.direccion}</li>
            </ul>

            
          </>
        )}
      </Card>

      <h2 className="concepts-title">Conceptos Asociados</h2>
      <Table
        className="services-table"
        dataSource={servicesData}
        columns={columnasServicios}
        bordered
        pagination={false}
        rowKey={(record) => record.uid}// O si tu record tiene id
      />

    </div>
  );
};

export default DetallesAguasResiduales;
