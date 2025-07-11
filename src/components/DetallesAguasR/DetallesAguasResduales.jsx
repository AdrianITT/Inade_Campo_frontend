import React, { useEffect, useState, useMemo } from "react";
import { Table, Button, Card, Dropdown, Menu, message, Modal, Collapse, Space, Typography } from "antd";
import { RightCircleTwoTone, FileTextTwoTone, FilePdfTwoTone, MailTwoTone, DeleteOutlined, EditTwoTone } from "@ant-design/icons";
import { Link, useParams, useNavigate } from "react-router-dom";
import {getDetallesAguaResidualInforme} from "../../apis/ApiCampo/DetallesAguasResiduales";
import {createIntermediario} from "../../apis/ApiCampo/FormmularioInforme";
import "./css/DAR.css"; // Asegúrate de importar el archivo CSS

const { Panel } = Collapse;
const { Text } = Typography;

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
  const [informes, setInformes] = useState(null);
  const [estadoOrden, setEstadoOrden] = useState(null);
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const [IdCoquis, setIdCoquis] = useState([]); // Datos de los servicios (tabla "servicio")
  const [loadingId, setLoadingId] = useState(null);

  // Obtener el ID de la organización una sola vez
     //const organizationId = useMemo(() => parseInt(localStorage.getItem("organizacion_id"), 10), []);
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
        setIdCoquis(data.croquis);

        // Si necesitas un "método" adicional, tendrías que mapear
        // y hacer llamadas a getMetodoById(...) como hacías antes.
      } catch (error) {
        console.error("Error al obtener el detalle de la orden:", error);
        console.error(error.response?.data || error);
      }finally{
          setLoadingId(null); 
      }
    };
     useEffect(() => {
      fetchData();
    }, [id]);
  

  //   // Función para mostrar el modal de eliminación
  // const showDeleteModal = () => {
  //   setIsDeleteModalVisible(true);
  // };

  //     // Función para cancelar la eliminación
  // const handleCancelDelete = () => {
  //   setIsDeleteModalVisible(false);
  // };

  const menu = (
    <Menu>
      <Menu.Item key="1" icon={<RightCircleTwoTone />}
      onClick={async () => {
      try {
        await createIntermediario({ aguaResidualInforme: id });
        message.success("Intermediario creado");
        fetchData(); // 🔁 Recargar Collapse con nuevos datos
        } catch (err) {
          message.error("Error al crear el intermediario");
          console.error(err);
        }
      }}
      >
        Crear Intermediario
      </Menu.Item>
      <Menu.Item key="2" icon={<FileTextTwoTone />}>
        <Link to={`/FormularioCroquisUbicacion/${IdCoquis.id}`}>
          <Button type="link" style={{ padding: 0 }}>
        Crear Croquis de Ubicación
          </Button>
      </Link>
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

      <h2 className="concepts-title">Croquis</h2>
      {/* <Table
        className="services-table"
        dataSource={servicesData}
        columns={columnasServicios}
        bordered
        pagination={false}
        rowKey={(record) => record.uid}// O si tu record tiene id
      /> */}
    <Collapse accordion>
      <Panel
        key={IdCoquis.id}
        header={
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span>croquis ID: {IdCoquis.id}</span>
            <Space>
              <Link to={`/FormularioCroquisUbicacion/${IdCoquis.id}`}>
                <Button size="small">Eliminar</Button>
              </Link>
            </Space>
          </div>
        }
      >
        {IdCoquis.comentario && (
          <div style={{ marginBottom: 16 }}>
            <Text strong>Protocolo de Muestreo:</Text>{" "}
            {IdCoquis.protocoloMuestreo || "No asignado"}
            <br />
            <span>{IdCoquis.domicilio}</span>
            <span>{IdCoquis.comentario}</span>
            {/* <Space wrap style={{ marginTop: 8 }}>
              <Button size="small" type="primary">Continuar con Croquis</Button>
              <Button size="small" danger>Eliminar</Button>
            </Space> */}
          </div>
        )}
      </Panel>
    </Collapse>

        <h2 className="concepts-title">Intermediario</h2>
      <Collapse accordion>
      {servicesData.map((item) => (
        <Panel
          key={item.id}
          header={
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span>Intermediario ID: {item.id}</span>
              <Space>
                <Link to={`/FormularioProtocoloMuestreo/${item.id}`}>
                <Button size="small">Crear Protocolo de Muestreo</Button>
                </Link>
                <Link to={`/HojaCampoMuestreo/${item.id}`}>
                <Button size="small" >Crear Hoja de campo</Button>
                </Link>
                <Link to={`/ImformesAguas/${item.id}`}>
                <Button size="small" >Eliminar</Button>
                {/* onClick={() => handleEliminarIntermediario(item.id)} */}
                </Link>
              </Space>
            </div>
          }
        >
          {item.protocoloMuestreo && (
          <div style={{ marginBottom: 16 }}>
            <Text strong>Protocolo de Muestreo:</Text>{" "}
            {item.protocoloMuestreo || "No asignado"}
            <br />
            <Space wrap style={{ marginTop: 8 }}>
              <Button size="small" type="primary" >
                Continuar Protocolo
              </Button>
              <Button size="small" danger>
                Eliminar Protocolo
              </Button>
            </Space>
          </div>
        )}

          {item.hojaCampo && (
          <div style={{ marginBottom: 16 }}>
            <Text strong>Hoja de Campo:</Text>{" "}
            {item.hojaCampo || "No asignada"}
            <br />
            <Space wrap style={{ marginTop: 8 }}>
              <Button size="small" type="primary" >
                Continuar Hoja de Campo
              </Button>
              <Button size="small" danger >
                Eliminar Hoja de Campo
              </Button>
            </Space>
          </div>
          )}

          {/* <div>
            <Space wrap>
              <Button size="small" >
                Crear Croquis
              </Button>
              <Button size="small" danger >
                Eliminar Intermediario
              </Button>
            </Space>
          </div> */}
        </Panel>
      ))}
    </Collapse>

    </div>
  );
};

export default DetallesAguasResiduales;
