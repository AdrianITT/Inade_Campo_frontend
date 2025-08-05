import React, { useEffect, useState, useMemo } from "react";
import dayjs from 'dayjs';
import { Table, Button, Card, Dropdown, Menu, message, Modal, Collapse, Space, Typography, Descriptions  } from "antd";
import { RightCircleTwoTone, FileTextTwoTone, FilePdfTwoTone, MailTwoTone, DeleteOutlined, EditTwoTone,EditOutlined, FileAddOutlined, CheckCircleTwoTone } from "@ant-design/icons";
import { Link, useParams, useNavigate } from "react-router-dom";
import {getDetallesAguaResidualInforme, } from "../../../apis/ApiCampo/DetallesAguasResiduales";
import {createIntermediario, deleteProtocoloMuestreo, deleteIntermediario} from "../../../apis/ApiCampo/FormmularioInforme";
import {deleteCroquisUbicacion} from "../../../apis/ApiCampo/CroquisUbicacion";
import {deleteHojaCampo} from "../../../apis/ApiCampo/HojaCampo";
import {updateAguaResidualInforme} from "../../../apis/ApiCampo/AguaResidualInforme"
import {getLlenarExcelAguas} from "../../../apis/ApiCampo/LlenarExcelAguas"
import "./css/DAR.css"; // Asegúrate de importar el archivo CSS

const { Panel } = Collapse;
const { Text } = Typography;

const DetallesAguasResiduales = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const idAguas = id;
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
  const [validacionverificacion, setValidacionVerificacion] = useState([]);
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
        console.log("data.calibraciones: ", data.calibraciones);
        console.log("data.calibraciones.intermediario: ", data.calibraciones.intermediario);
        
        setClientData(data.cliente);
        setEmpresa(data.empresa);
        setRecep(data.ordenTrabajo.receptor);
        setOrderHeader(data.ordenTrabajo);
        setServicesData(data.calibraciones);
        setIdCoquis(data.croquis);
        setInformes(data.informe);
        setValidacionVerificacion(data.calibraciones);

        const todosLosIntermediarios =
      (data.calibraciones || []).flatMap(c => c.intermediarios || []);

      setServicesData(todosLosIntermediarios);

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

  const ElimnarProtocolo = async (i) => {
    try {
      await deleteProtocoloMuestreo(i);
      message.success("Hoja de campo eliminada correctamente");
      fetchData(); // Recargar los datos después de eliminar
    } catch (error) {
      console.error("Error al eliminar la hoja de campo:", error);
      message.error("Error al eliminar la hoja de campo");
    }
  };

    const ElimnarCroquis = async (i) => {
    try {
      await deleteCroquisUbicacion(i);
      message.success("Hoja de campo eliminada correctamente");
      fetchData(); // Recargar los datos después de eliminar
    } catch (error) {
      console.error("Error al eliminar la hoja de campo:", error);
      message.error("Error al eliminar la hoja de campo");
    }
  };

  const confirmarEliminacionIntermediario = (id) => {
  Modal.confirm({
    title: "¿Estás seguro que deseas eliminar este intermediario?",
    content: "Esta acción no se puede deshacer.",
    okText: "Sí, eliminar",
    okType: "danger",
    cancelText: "Cancelar",
    onOk: () => {
      EliminateIntermediary(id);
    },
  });
};

  const EliminateIntermediary= async (i) => {
    try {
      await deleteIntermediario(i);
      message.success("Intermediario eliminado correctamente");
      fetchData(); // Recargar los datos después de eliminar
    } catch (error) {
      console.error("Error al eliminar el intermediario:", error);
      message.error("Error al eliminar el intermediario");
    }
  };

  const EliminarHojaCampo = async (i) => {
    try {
      await deleteHojaCampo(i);
      message.success("Hoja de campo eliminada correctamente");
      fetchData(); // Recargar los datos después de eliminar
    } catch (error) {
      console.error("Error al eliminar la hoja de campo:", error);
      message.error("Error al eliminar la hoja de campo");
    }
  };

  const menu = (
    <Menu>
      
      <Menu.Item key="2" icon={<FileTextTwoTone />}>
        <Link to={`/FormularioConductividad/${id}`}>
          <Button type="link" style={{ padding: 0 }}>
          Crear Calibración y Verificación de conductividad
          </Button>
        </Link>
      </Menu.Item>

      <Menu.Item key="1" icon={<FileTextTwoTone />}>
        <Link to={`/FormularioCroquisUbicacion/${id}`}>
          <Button type="link" style={{ padding: 0 }}>
        Crear Croquis de Ubicación
          </Button>
      </Link>
      </Menu.Item>

      {informes?.estatusid===2 &&(
      <Menu.Item key="3" icon={<CheckCircleTwoTone twoToneColor="#52c41a" />}
      onClick={async () => {
      try {
        await updateAguaResidualInforme(id,{estado:3});
        message.success("Intermediario creado");
        fetchData(); // 🔁 Recargar Collapse con nuevos datos
        } catch (err) {
          message.error("Error al crear el intermediario");
          console.error(err);
        }
      }}
      >
        Actualizar estado
      </Menu.Item>)}

      {informes?.estatusid === 3 && (
        <Menu.Item
          key="4"
          icon={<CheckCircleTwoTone twoToneColor="#52c41a" />}
          onClick={async () => {
            try {

              // 🔽 Descargar Excel automáticamente
              const response = await getLlenarExcelAguas(id);
              const blob = new Blob([response.data], {
                type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
              });

              const url = window.URL.createObjectURL(blob);
              const link = document.createElement("a");
              link.href = url;
              link.setAttribute("download", `informe_aguas_${id}.xlsx`);
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
              window.URL.revokeObjectURL(url);

              // 🔁 Recargar datos
              fetchData();
            } catch (err) {
              message.error("Error al actualizar estado o descargar Excel");
              console.error(err);
            }
          }}
        >
           descargar Excel
        </Menu.Item>
      )}


    </Menu>

  );

  return (
    <div className="container">
      <h1 className="page-title"> Detalles de Aguas: {informes?.numeroInfo} OT: {orderHeader?.codigo }</h1>
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
    {IdCoquis.comentario && (
      <Panel
        key={IdCoquis.id}
        header={
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span>croquis ID: {IdCoquis.numeroCroquis}</span>
            <Space>
                <Button danger size="small" icon={<DeleteOutlined />} onClick={() => ElimnarCroquis(IdCoquis.id)}>
                  Eliminar
                </Button>
            </Space>
          </div>
        }
      >
          <div style={{ marginBottom: 16 }}>
            <Text strong>Protocolo de Muestreo:</Text>{" "}
            <Descriptions bordered size="small" column={1}>
              <Descriptions.Item label="Número de Croquis">{IdCoquis.numeroCroquis || "No asignado"}</Descriptions.Item>
              <Descriptions.Item label="Domicilio">{IdCoquis.domicilio}</Descriptions.Item>
              <Descriptions.Item label="Comentarios">{IdCoquis.comentario}</Descriptions.Item>
            </Descriptions>
            <Space wrap style={{ marginTop: 8 }}>
              <Link to={`/EditarCroquisUbicacion/${IdCoquis.id}/${idAguas}`}>  
              <Button type="primary" icon={<EditOutlined />}>
                Editar Croquis
              </Button>
              </Link>
              {/* <Button size="small" danger>
                Eliminar Croquis
              </Button> */}
            </Space>
            {/* 
            onClick={()=>ElimnarCroquis(item.protocoloMuestreo)}
            <Space wrap style={{ marginTop: 8 }}>
              <Button size="small" type="primary">Continuar con Croquis</Button>
              <Button size="small" danger>Eliminar</Button>
            </Space> */}
          </div>
      </Panel>
        )}
    </Collapse>

        <h2 className="concepts-title">Calibración y Verificación</h2>
    <Collapse accordion>
    {validacionverificacion.map((item) => (
      <Panel
      key ={validacionverificacion.id}
      header={
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <Text strong>Calibración y Verificación de Conductividad ID: {item.numero}</Text>
            <Space>
                <Button size="small"  danger icon={<DeleteOutlined />}onClick={()=>ElimnarCroquis(item.id)}>
                  Eliminar
                </Button>
            </Space>
          </div>
        }
        >
        {item.id && (
        <div>
          <Descriptions size="small" bordered column={1}>
            <Descriptions.Item label="Equipo utilizado">{item.equipoUtilizado}</Descriptions.Item>
            <Descriptions.Item label="ID del equipo">{item.idEquipo}</Descriptions.Item>
            <Descriptions.Item label="Marca">{item.marcaEquipo}</Descriptions.Item>
            <Descriptions.Item label="Modelo">{item.modeloEquipo}</Descriptions.Item>
            <Descriptions.Item label="N. Serie">{item.serialEquipo}</Descriptions.Item>
          </Descriptions>
          <Space wrap style={{ marginBottom: 24 }}>
          <Link to={`/EditarConductividad/${item.id}/${idAguas}`}>
            <Button size="small" icon={<EditOutlined />}>Continuar Calibración y Verificación de Conductividad </Button>
          </Link>
          <br></br>
          <Link to={`/FormularioVerificacionPh/${item.id}/${idAguas}`}>
            <Button size="small" icon={<FileAddOutlined />} >Crear Calibración y Verificación de Ph </Button>
          </Link>
          {/* FormularioVerificacionPh */}
          <br></br>
          <Button
          type="dashed"
          size="small"
          Text="Crear Intermediario"
          onClick={async () => {
          try {
            await createIntermediario({ calibracionVerificacion: item.id});
            message.success("Intermediario creado");
            fetchData(); // 🔁 Recargar Collapse con nuevos datos
            } catch (err) {
              message.error("Error al crear el intermediario");
              console.error(err);
            }
          }}
          >Crear Intermediario</Button></Space>
        </div>
        )}

        <h2 className="concepts-title">Ph</h2>
      <Collapse accordion>
      {item.ph.map((ph) => (
        <Panel
          key={ph.id}
          header={
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span>Ph ID: {ph.numero}</span>
              <Space>
                <Button size="small" danger icon={<DeleteOutlined />} onClick={()=> confirmarEliminacionIntermediario(ph.id)}>
                  Eliminar
                </Button>
                {/* onClick={() => handleEliminarIntermediario(item.id)} */}
              </Space>
            </div>
          }
        >
          {ph.id && (
          <div style={{ marginBottom: 16 }}>
              <Descriptions size="small" column={1} bordered>
                <Descriptions.Item label="¿Uso de tira de pH?">
                  {ph.calibracionPhCampo?.usoPh ? "Sí" : "No"}
                </Descriptions.Item>
                <Descriptions.Item label="Rango a calibrar">
                  {ph.calibracionPhCampo?.rangoA && ph.calibracionPhCampo?.rangoB
                    ? `${ph.calibracionPhCampo.rangoA} a ${ph.calibracionPhCampo.rangoB}`
                    : "No asignado"}
                </Descriptions.Item>
              </Descriptions>
            <Space wrap style={{ marginTop: 8 }}>
              <Link to={`/EditarVerificacionPh/${ph.id}/${idAguas}`}>  
              <Button size="small" type="primary" icon={<EditOutlined />} >
                Continuar/Editar Verificacion de Ph
              </Button>
              </Link>
            </Space>
          </div>
        )}
        </Panel>
      ))}
      </Collapse>

        <h2 className="concepts-title">Intermediario</h2>
      <Collapse accordion>
      {item.intermediarios.filter(type => type.id).map((type) => (

        <Panel
          key={type.id}
          header={
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span>Intermediario ID: {type.numero}</span>
              <Space>
                {!type.protocoloMuestreo.id && (
                <Link to={`/FormularioProtocoloMuestreo/${type.id}/${idAguas}`}>
                <Button size="small">Crear Protocolo de Muestreo</Button>
                </Link>
              )}
                {!type.hojaCampo.id && item.id && item?.ph?.some(ph => ph?.id) && (
                <Link to={`/HojaCampoMuestreo/${type.id}/${idAguas}`}>
                <Button size="small" >Crear Hoja de campo</Button>
                </Link>
              )}
                <Button size="small" danger icon={<DeleteOutlined />} onClick={()=> confirmarEliminacionIntermediario(type.id)}>
                  Eliminar
                </Button>
                {/* onClick={() => handleEliminarIntermediario(item.id)} */}
              </Space>
            </div>
          }
        >
        
          {type.protocoloMuestreo.id && (
          <div style={{ marginBottom: 16 }}>
            <Descriptions size="small" bordered column={1}>
            <Descriptions.Item label="Protocolo de Muestreo:">{type.protocoloMuestreo.numero || "No asignado"}</Descriptions.Item>
            <Descriptions.Item label="Domicilio">{type.protocoloMuestreo.sitioMuestreo.domicilio}</Descriptions.Item>
            <Descriptions.Item label="Giro de la Empresa:">{type.protocoloMuestreo.sitioMuestreo.giroEmpresa}</Descriptions.Item>
          </Descriptions>
            <Space wrap style={{ marginTop: 8 }}>
              <Link to={`/EditarFormularioProtocoloMuestreo/${type.protocoloMuestreo.id}/${idAguas}`}>  
              <Button size="small" type="primary" >
                Continuar Protocolo
              </Button>
              <br></br>
              </Link>
              <Button size="small" danger onClick={()=>ElimnarProtocolo(type.protocoloMuestreo.id)}>
                Eliminar Protocolo
              </Button>
            </Space>
          </div>
        )}

          {type.hojaCampo.id && (
          <div style={{ marginBottom: 16 }}>
            <Descriptions size="small" bordered column={1}>
            <Descriptions.Item label="Hoja de Campo:">{type.hojaCampo?.numero|| "No asignada"}</Descriptions.Item>
          </Descriptions>

            <Space wrap style={{ marginTop: 8 }}>
              <Link to={`/EditarHojaCampoMuestreo/${type.hojaCampo.id}/${idAguas}`}>
              <Button size="small" type="primary" >
                Continuar Hoja de Campo
              </Button>
              </Link>
              <Button size="small" danger  onClick={()=> EliminarHojaCampo(type.hojaCampo.id)}>
                Eliminar Hoja de Campo
              </Button>
            </Space>
          </div>
          )}

        
        </Panel>
        //{type.id && ()}
      ))}
      </Collapse>
      </Panel>

    ))}
    </Collapse>


    </div>
  );
};

export default DetallesAguasResiduales;
