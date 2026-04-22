import React, { useEffect, useState, useMemo } from "react";
import dayjs from "dayjs";
import {
  Table,
  Button,
  Card,
  Dropdown,
  Menu,
  message,
  Modal,
  Collapse,
  Space,
  Typography,
  Descriptions,
  Popconfirm,
  Segmented,
  Divider,
} from "antd";
import {
  FileTextTwoTone,
  DeleteOutlined,
  EditOutlined,
  FileAddOutlined,
  CheckCircleTwoTone,
} from "@ant-design/icons";
import { Link, useParams, useNavigate } from "react-router-dom";
import { getDetallesAguaResidualInforme } from "../../../../apis/ApiCampo/DetallesAguasResiduales";
import {
  createIntermediario,
  deleteProtocoloMuestreo,
  deleteIntermediario,
  getexcelprotocolo,
} from "../../../../apis/ApiCampo/FormmularioInforme";
import {
  deleteCroquisUbicacion,
  getExcelCroquis,
} from "../../../../apis/ApiCampo/CroquisUbicacion";
import {
  deleteHojaCampo,
  getexcelhojacampo,
} from "../../../../apis/ApiCampo/HojaCampo";
import { updateAguaResidualInforme } from "../../../../apis/ApiCampo/AguaResidualInforme";
import { getLlenarExcelAguas } from "../../../../apis/ApiCampo/LlenarExcelAguas";
import {
  deleteCalibracionVerificacion,
  getexcelcalibracionverificacion,
  getexcelcalibracionverificacionph,
} from "../../../../apis/ApiCampo/CalibracionVerificacion";
import {
  deleteConductividadAceptacionmr,
  deleteHojaCampoEnd,
  deleteLecturaVerificacion,
} from "../../../../apis/ApiCampo/Delete";
import "../css/DAR.css";

const { Panel } = Collapse;
const { Text } = Typography;

const DARpart1 = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const idAguas = id;

  const [orderHeader, setOrderHeader] = useState(null);
  const [servicesData, setServicesData] = useState([]);
  const [cotizacionData, setCotizacionData] = useState([]);
  const [clientData, setClientData] = useState(null);
  const [recep, setRecep] = useState(null);
  const [empresa, setEmpresa] = useState(null);
  const [informes, setInformes] = useState(null);
  const [estadoOrden, setEstadoOrden] = useState(null);
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const [IdCoquis, setIdCoquis] = useState([]);
  const [validacionverificacion, setValidacionVerificacion] = useState([]);
  const [loadingId, setLoadingId] = useState(null);
  const [lecturaIds, setLecturaIds] = useState([]);
  const [lecturaIdsAll, setLecturaIdsAll] = React.useState([]);
  const [lecturasPorPh, setLecturasPorPh] = React.useState({});
  const [phOptions, setPhOptions] = React.useState([]);

  // 🔹 NUEVO: estados para los modales
  const [isCroquisModalOpen, setIsCroquisModalOpen] = useState(false);
  const [isCalibracionModalOpen, setIsCalibracionModalOpen] = useState(false);

  // 🔹 NUEVO: estado para diferentes Calibraciones de conductividad 
  const [selectedCalibracion, setSelectedCalibracion] = useState(null);

  // dentro de tu componente:
  const [viewSegment, setViewSegment] = useState("conductividad");

  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  const DELAY_MS = 150;

  const arr = (v) => (Array.isArray(v) ? v : []);

  const collectAllLecturaIds = (calibraciones) => {
    const todos = arr(calibraciones).flatMap((cal) =>
      arr(cal.ph).flatMap((p) => {
        const L = p.lecturas || {};
        return [
          ...arr(L.lab1),
          ...arr(L.lab2),
          ...arr(L.campo1),
          ...arr(L.campo2),
        ];
      })
    );
    return Array.from(new Set(todos.filter((x) => Number.isFinite(x))));
  };

  const collectPerPh = (calibraciones) => {
    const map = {};
    const options = [];
    arr(calibraciones).forEach((cal) => {
      arr(cal.ph).forEach((p) => {
        const L = p.lecturas || {};
        const ids = Array.from(
          new Set(
            [
              ...arr(L.lab1),
              ...arr(L.lab2),
              ...arr(L.campo1),
              ...arr(L.campo2),
            ].filter((x) => Number.isFinite(x))
          )
        );
        map[p.id] = ids;
        options.push({ value: p.id, label: `pH #${p.numero ?? p.id}` });
      });
    });
    return { map, options };
  };

  const fetchData = async () => {
    try {
      setLoadingId(id);
      const detailResponse = await getDetallesAguaResidualInforme(id);
      const data = detailResponse.data;

      setClientData(data.cliente);
      setEmpresa(data.empresa);
      setRecep(data.ordenTrabajo.receptor);
      setOrderHeader(data.ordenTrabajo);
      setServicesData(data.calibraciones);
      setIdCoquis(data.croquis);
      setInformes(data.informe);
      const calibracionesFiltradas = (data.calibraciones || []).filter(
        (c) => !!c?.id
      );
      setValidacionVerificacion(calibracionesFiltradas);

      const todosLosIntermediarios = (data.calibraciones || []).flatMap(
        (c) => c.intermediarios || []
      );
      setServicesData(todosLosIntermediarios);

      setLecturaIdsAll(collectAllLecturaIds(data.calibraciones || []));
      const { map, options } = collectPerPh(data.calibraciones || []);
      setLecturasPorPh(map);
      setPhOptions(options);
    } catch (error) {
      console.error("Error al obtener el detalle de la orden:", error);
      console.error(error.response?.data || error);
    } finally {
      setLoadingId(null);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  useEffect(() => {
  if (!selectedCalibracion) return;

  // Buscar la versión actualizada de la calibración seleccionada
  const updated = validacionverificacion.find(
    (c) => c.id === selectedCalibracion.id
  );
  if (updated) {
    setSelectedCalibracion(updated);
  }
}, [validacionverificacion, selectedCalibracion?.id]);


  const ElimnarProtocolo = async (i) => {
    setLoadingId(true);
    try {
      await deleteProtocoloMuestreo(i);
      message.success("Hoja de campo eliminada correctamente");
      fetchData();
    } catch (error) {
      console.error("Error al eliminar la hoja de campo:", error);
      message.error("Error al eliminar la hoja de campo");
    } finally {
      setLoadingId(false);
    }
  };

  const ElimnarCroquis = async (i) => {
    setLoadingId(true);
    try {
      await deleteCroquisUbicacion(i);
      message.success("Hoja de campo eliminada correctamente");
      fetchData();
    } catch (error) {
      console.error("Error al eliminar la hoja de campo:", error);
      message.error("Error al eliminar la hoja de campo");
    } finally {
      setLoadingId(false);
    }
  };

  const confirmarEliminacionIntermediario = (interId, protocoloId, hojaId) => {
    Modal.confirm({
      title: "¿Estás seguro que deseas eliminar este intermediario?",
      content: "Esta acción no se puede deshacer.",
      okText: "Sí, eliminar",
      okType: "danger",
      cancelText: "Cancelar",
      onOk: () => {
        EliminateIntermediary(interId, protocoloId, hojaId);
      },
    });
  };

  const EliminateIntermediary = async (interId, protocoloId, hojaId) => {
    setLoadingId(true);
    try {
      if (protocoloId) {
        await deleteProtocoloMuestreo(protocoloId);
      }
      if (hojaId) {
        await deleteHojaCampoEnd(hojaId);
      }
      if (interId) {
        await deleteIntermediario(interId);
      }
      message.success("Intermediario eliminado correctamente");
      fetchData();
    } catch (error) {
      console.error("Error al eliminar el intermediario:", error);
      message.error("Error al eliminar el intermediario");
    } finally {
      setLoadingId(false);
    }
  };

  const EliminarHojaCampo = async (i) => {
    setLoadingId(true);
    try {
      await deleteHojaCampoEnd(i);
      message.success("Hoja de campo eliminada correctamente");
      fetchData();
    } catch (error) {
      console.error("Error al eliminar la hoja de campo:", error);
      message.error("Error al eliminar la hoja de campo");
    } finally {
      setLoadingId(false);
    }
  };

  const EliminarCalibracionVerificacion = async (i) => {
    try {
      await deleteCalibracionVerificacion(i);
      fetchData();
    } catch (error) {
      message.error("error al eliminar");
      console.log("error al eliminar: ", error);
    }
  };

  const getLecturaIdsFromPh = (ph) => {
    if (!ph) return [];
    const L = ph.lecturas || {};
    const arr = (v) => (Array.isArray(v) ? v : []);
    const ids = [
      ...arr(L.lab1),
      ...arr(L.lab2),
      ...arr(L.campo1),
      ...arr(L.campo2),
    ].filter((x) => Number.isFinite(x));
    return Array.from(new Set(ids));
  };

  const confirmarEliminacionLectura = (ph) => {
    const ids = getLecturaIdsFromPh(ph);

    if (ids.length === 0) {
      message.info("Ese pH no tiene lecturas para eliminar.");
      return;
    }

    Modal.confirm({
      title: `¿Eliminar ${ids.length} lecturas del pH #${ph.numero}?`,
      content: "Esta acción no se puede deshacer.",
      okText: "Sí, eliminar",
      okType: "danger",
      cancelText: "Cancelar",
      async onOk() {
        const okIds = [];
        const failIds = [];
        for (const lid of ids) {
          setLoadingId(true);
          try {
            await deleteLecturaVerificacion(lid);
            okIds.push(lid);
          } catch (e) {
            failIds.push(lid);
          }
          await sleep(DELAY_MS);
        }

        if (failIds.length === 0) {
          message.success(
            `Se eliminaron ${okIds.length} lecturas del pH seleccionado.`
          );
        } else if (okIds.length > 0) {
          message.warning(
            `Parcial: OK ${okIds.length}, Fallos ${failIds.length}.`
          );
        } else {
          message.error("No se pudieron eliminar las lecturas.");
        }

        setLecturasPorPh((prev) => ({
          ...prev,
          [ph.id]: (prev[ph.id] || []).filter((x) => !okIds.includes(x)),
        }));
        setLecturaIdsAll((prev) => prev.filter((x) => !okIds.includes(x)));
        fetchData();
        setLoadingId(false);
      },
    });
  };

  const downloadpdfconductividad = async (IdCvc) => {
    try {
      const response = await getexcelcalibracionverificacion(id, IdCvc);
      const blob = new Blob([response.data], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute(
        "download",
        `calibracion_verificacion_aguas_residuales_${id}.xlsx`
      );
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      message.error("Error al descargar el xlsx");
      console.error("Error al descargar el xlsx:", error);
    }
  };

  const downloadExcelph = async (Idph) => {
    try {
      const response = await getexcelcalibracionverificacionph(id, Idph);
      const blob = new Blob([response.data], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute(
        "download",
        `calibracion_verificacion_ph_aguas_residuales_${id}.xlsx`
      );
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      message.error("Error al descargar el xlsx");
      console.error("Error al descargar el xlsx:", error);
    }
  };

  const downloadpdfcroquis = async () => {
    try {
      const response = await getExcelCroquis(id);
      const blob = new Blob([response.data], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `croquis_${id}.xlsx`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      message.error("Error al descargar el xlsx");
      console.error("Error al descargar el xlsx:", error);
    }
  };

  const downloadExcelProtocolo = async (protocoloId) => {
    try {
      const response = await getexcelprotocolo(id, protocoloId);
      const blob = new Blob([response.data], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `protocolo_${id}.xlsx`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      message.error("Error al descargar el xlsx");
      console.error("Error al descargar el xlsx:", error);
    }
  };

  const downloadExcelHojaCampo = async (hojaCampoId) => {
    try {
      const response = await getexcelhojacampo(id, hojaCampoId);
      const blob = new Blob([response.data], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `Hoja_Campo_${id}.xlsx`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      message.error("Error al descargar el xlsx");
      console.error("Error al descargar el xlsx:", error);
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
      {!IdCoquis.comentario && (
        <Menu.Item key="1" icon={<FileTextTwoTone />}>
          <Link to={`/FormularioCroquisUbicacion/${id}`}>
            <Button type="link" style={{ padding: 0 }}>
              Crear Croquis de Ubicación
            </Button>
          </Link>
        </Menu.Item>
      )}

      {informes?.estatusid === 2 && (
        <Menu.Item
          key="3"
          icon={<CheckCircleTwoTone twoToneColor="#52c41a" />}
          onClick={async () => {
            try {
              await updateAguaResidualInforme(id, { estado: 3 });
              message.success("Estado actualizado");
              fetchData();
            } catch (err) {
              message.error("Error al actualizar el estado");
              console.error(err);
            }
          }}
        >
          Actualizar estado
        </Menu.Item>
      )}

      {informes?.estatusid === 3 && (
        <Menu.Item
          key="4"
          icon={<CheckCircleTwoTone twoToneColor="#52c41a" />}
          onClick={async () => {
            try {
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

              fetchData();
            } catch (err) {
              message.error("Error al actualizar estado o descargar Excel");
              console.error(err);
            }
          }}
        >
          Descargar Excel
        </Menu.Item>
      )}
    </Menu>
  );

  return (
    <div className="container">
      <h1 className="page-title">
        Detalles de Aguas: {informes?.numeroInfo} OT: {orderHeader?.codigo}
      </h1>
      <div className="button-container">
        <Dropdown overlay={menu} placement="bottomRight" arrow>
          <Button type="primary" className="action-button">
            Acciones para AR
          </Button>
        </Dropdown>
      </div>

      <Card
        className="info-card"
        title="Información del Cliente y Empresa"
        bordered={false}
      >
        {orderHeader && clientData && recep && empresa && (
          <>
            <p>
              <strong>Cliente:</strong> {clientData.nombre}
            </p>
            <p>
              <strong>Correo:</strong> {clientData.correo}
            </p>
            <p>
              <strong>Telefono:</strong> {clientData.telefono}
            </p>
            <p>
              <strong>Receptor:</strong> {orderHeader.receptor}
            </p>
            <p>
              <strong>Empresa:</strong> {empresa.nombre}
            </p>
            <p>
              <strong>Dirección del Cliente:</strong>
            </p>
            <ul>
              <li>{clientData.direccion}</li>
            </ul>
            <p>
              <strong>Dirección de la Empresa:</strong>
            </p>
            <ul>
              <li>{empresa.direccion}</li>
            </ul>
          </>
        )}
      </Card>

      {/* 🔹 Cards que abren modales */}
      <h2 className="concepts-title">Secciones</h2>
      <div
        style={{
          display: "flex",
          gap: 16,
          flexWrap: "wrap",
          marginBottom: 16,
        }}
      >
     {IdCoquis.comentario && (
          <Card
               hoverable
               style={{ flex: "1 1 240px", borderRadius: 16, cursor: "pointer" }}
               onClick={() => setIsCroquisModalOpen(true)}
          >
               <Text strong>Croquis</Text>
               <br />
               <Text type="secondary">Ver y gestionar el croquis de ubicación.</Text>
          </Card>
     )}
     {validacionverificacion?.filter(Boolean)?.map((item) => (
        <Card
          hoverable
          style={{ flex: "1 1 240px", borderRadius: 16, cursor: "pointer"}}
          onClick={() => {
            setIsCalibracionModalOpen(true)
            setViewSegment("conductividad");
            setSelectedCalibracion(item);
          }
        }
        >
          <Text strong>Calibración y Verificación</Text>
          <br />
          <Text type="secondary">
            Ver calibraciones, pH e intermediarios asociados.
          </Text>
        </Card>

          ))}
      </div>

      {/* ================= MODAL CROQUIS ================= */}
      <Modal
        title="Croquis"
        open={isCroquisModalOpen}
        onCancel={() => setIsCroquisModalOpen(false)}
        footer={null}
        width={720}
      >
        {IdCoquis?.comentario ? (
          <Collapse accordion>
            <Panel
              key={IdCoquis.id}
              header={
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <span>Croquis ID: {IdCoquis.numeroCroquis}</span>
                  <Space>
                    <Popconfirm
                    title="¿Eliminar Croquis de Ubicación?"
                    description="Esta acción no se puede deshacer."
                    okText="Sí, eliminar"
                    okType="danger"
                    cancelText="Cancelar"
                    onConfirm={() => ElimnarCroquis(IdCoquis.id)}>

                    <Button
                      danger
                      size="small"
                      icon={<DeleteOutlined />}
                      //onClick={() => ElimnarCroquis(IdCoquis.id)}
                    >
                      Eliminar
                    </Button>
                    </Popconfirm>
                  </Space>
                </div>
              }
            >
              <div style={{ marginBottom: 16 }}>
                <Text strong>Croquis:</Text>{" "}
                <Descriptions bordered size="small" column={1}>
                  <Descriptions.Item label="Número de Croquis">
                    {IdCoquis.numeroCroquis || "No asignado"}
                  </Descriptions.Item>
                  <Descriptions.Item label="Domicilio">
                    {IdCoquis.domicilio}
                  </Descriptions.Item>
                  <Descriptions.Item label="Comentarios">
                    {IdCoquis.comentario}
                  </Descriptions.Item>
                </Descriptions>
                <Space wrap style={{ marginTop: 8 }}>
                    <Text strong>Acciones:</Text>
                  <Link
                    to={`/EditarCroquisUbicacion/${IdCoquis.id}/${idAguas}`}
                  >
                    <Button type="primary" size="large" icon={<EditOutlined />}>
                      Editar Croquis
                    </Button>
                  </Link>
                  <Button
                    size="large"
                    icon={<FileAddOutlined />}
                    onClick={downloadpdfcroquis}
                  >
                    Descargar Excel
                  </Button>
                </Space>
              </div>
            </Panel>
          </Collapse>
        ) : (
          <Text type="secondary">No hay croquis registrados.</Text>
        )}
      </Modal>

     {/* ========== MODAL CALIBRACIÓN Y VERIFICACIÓN ========== */}
      <Modal
        open={isCalibracionModalOpen}
        onCancel={() => {
          setIsCalibracionModalOpen(false);
          setSelectedCalibracion(null);
        }}
        footer={null}
        width={1100}
      >
        {selectedCalibracion && 
        (<>
        {/* Selector principal de vista */}
        <div
          style={{
            marginBottom: 16,
            display: "flex",
            justifyContent: "flex-start",
          }}
        >
          <Segmented
            className="segmented-colored"
            value={viewSegment}
            onChange={setViewSegment}
            options={[
              { label: "Conductividad", value: "conductividad" },
              { label: "Calibración pH", value: "ph" },
              { label: "Intermediario", value: "intermediario" },
            ]}
          />
        </div>

        {/* Lista de calibraciones en Cards */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          
            <Card
              // key={item.id}
              size="small"
              extra={
              <Text strong>
               Calibración y Verificación de Conductividad ID: {selectedCalibracion.numero}
               </Text>

              }
              // Si quieres botón de eliminar calibración, lo puedes poner en "extra"
              // extra={
              //   <Popconfirm
              //     title="¿Eliminar calibración?"
              //     description="Se eliminarán todos los datos asociados."
              //     okText="Sí, eliminar"
              //     okType="danger"
              //     cancelText="Cancelar"
              //     onConfirm={() => EliminarCalibracionVerificacion(item.id)}
              //   >
              //     <Button size="small" danger icon={<DeleteOutlined />}>
              //       Eliminar
              //     </Button>
              //   </Popconfirm>
              // }
            >
              {/* ================== VISTA: CONDUCTIVIDAD ================== */}
              {viewSegment === "conductividad" && selectedCalibracion?.id && (
                <div style={{ marginBottom: 16 }}>
                  <h2 className="concepts-title">Calibración y Verificación de Conductividad</h2>
                  <Descriptions size="small" bordered column={1}>
                    <Descriptions.Item label="Equipo utilizado">
                      {selectedCalibracion.equipoUtilizado}
                    </Descriptions.Item>
                    <Descriptions.Item label="ID del equipo">
                      {selectedCalibracion.idEquipo}
                    </Descriptions.Item>
                    <Descriptions.Item label="Marca">
                      {selectedCalibracion.marcaEquipo}
                    </Descriptions.Item>
                    <Descriptions.Item label="Modelo">
                      {selectedCalibracion.modeloEquipo}
                    </Descriptions.Item>
                    <Descriptions.Item label="N. Serie">
                      {selectedCalibracion.serialEquipo}
                    </Descriptions.Item>
                    <Descriptions.Item label="data">
                      {selectedCalibracion.calibracionesConductivas?.[0].id || "N/A"}
                    </Descriptions.Item>
                  </Descriptions>

                  <Space wrap style={{ marginBottom: 24, marginTop: 8 }}>
                    <Text strong>
                      Acciones Calibración y Verificación de Conductividad:
                    </Text>

                    <Link to={`/EditarConductividad/${selectedCalibracion.id}/${idAguas}`}>
                      <Button size="large" icon={<EditOutlined />}>
                        Continuar Calibración y Verificación de Conductividad
                      </Button>
                    </Link>

                    {/* <Link to={`/FormularioVerificacionPh/${selectedCalibracion.id}/${idAguas}`}>
                      <Button size="large" icon={<FileAddOutlined />}>
                        Crear Calibración y Verificación de pH
                      </Button>
                    </Link> */}

                    {/* <Popconfirm
                      title="¿Crear Intermediario?"
                      description="Se creará un nuevo Intermediario (Protocolo de Muestreo y Hoja de Campo) asociado a esta calibración."
                      okText="Sí, crear"
                      cancelText="Cancelar"
                      onConfirm={async () => {
                        try {
                          await createIntermediario({
                            calibracionVerificacion: selectedCalibracion.id,
                          });
                          message.success("Intermediario creado");
                          fetchData();
                        } catch (err) {
                          message.error("Error al crear el intermediario");
                          console.error(err);
                        }
                      }}
                      >
                    <Button
                      type="dashed"
                      size="large"
                      // onClick={async () => {
                      //   try {
                      //     await createIntermediario({
                      //       calibracionVerificacion: selectedCalibracion.id,
                      //     });
                      //     message.success("Intermediario creado");
                      //     fetchData();
                      //   } catch (err) {
                      //     message.error("Error al crear el intermediario");
                      //     console.error(err);
                      //   }
                      // }}
                    >
                      Crear Intermediario (Protocolo de Muestreo y Hoja de Campo)
                    </Button>

                    </Popconfirm> */}


                    <Button
                      size="large"
                      icon={<FileAddOutlined />}
                      onClick={() => downloadpdfconductividad(selectedCalibracion.id)}
                    >
                      Descargar Excel
                    </Button>
                  </Space>
                </div>
              )}

              {/* ================== VISTA: pH ================== */}
              {viewSegment === "ph" && (
                <div style={{ marginTop: 4 }}>
                  <h3 className="concepts-title">Calibración y Verificación de pH</h3>

                  <div style={{ marginBottom: 16 }}>
                  <Link to={`/FormularioVerificacionPh/${selectedCalibracion.id}/${idAguas}`}>
                    <Button size="large" icon={<FileAddOutlined />}>
                      Crear Calibración y Verificación de pH
                    </Button>
                  </Link>
                  </div>

                  {selectedCalibracion.ph && selectedCalibracion.ph.length > 0 ? (
                    <Collapse accordion>
                      {selectedCalibracion.ph.map((ph) => (
                        <Panel
                          key={ph.id}
                          header={
                            <div
                              style={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                              }}
                            >
                              <span>pH ID: {ph.numero}</span>
                              <Space>
                                <Popconfirm
                                  title="¿Eliminar Lectura y calibración de pH?"
                                  description="Esta acción no se puede deshacer."
                                  okText="Sí, eliminar"
                                  okType="danger"
                                  cancelText="Cancelar"
                                  onConfirm={() => confirmarEliminacionLectura(ph)}
                                >
                                  <Button
                                    size="small"
                                    danger
                                    icon={<DeleteOutlined />}
                                  >
                                    Eliminar
                                  </Button>
                                </Popconfirm>
                              </Space>
                            </div>
                          }
                        >
                          {ph.id && (
                            <div style={{ marginBottom: 16 }}>
                              {/* <Descriptions size="small" column={1} bordered>
                                <Descriptions.Item label="¿Uso de tira de pH?">
                                  {ph.calibracionPhCampo?.usoPh ? "Sí" : "No"}
                                </Descriptions.Item>
                                <Descriptions.Item label="Rango a calibrar">
                                  {ph.calibracionPhCampo?.rangoA &&
                                  ph.calibracionPhCampo?.rangoB
                                    ? `${ph.calibracionPhCampo.rangoA} a ${ph.calibracionPhCampo.rangoB}`
                                    : "No asignado"}
                                </Descriptions.Item>
                              </Descriptions> */}

                              <Space wrap style={{ marginTop: 8 }}>
                                <Text strong>Acciones:</Text>

                                <Link
                                  to={`/EditarVerificacionPh/${ph.id}/${idAguas}`}
                                >
                                  <Button
                                    size="large"
                                    type="primary"
                                    icon={<EditOutlined />}
                                  >
                                    Continuar/Editar Verificación de pH
                                  </Button>
                                </Link>

                                <Button
                                  size="large"
                                  icon={<FileAddOutlined />}
                                  onClick={() => downloadExcelph(ph.id)}
                                >
                                  Descargar Excel
                                </Button>
                              </Space>
                            </div>
                          )}
                        </Panel>
                      ))}
                    </Collapse>
                  ) : (
                    <Text type="secondary">
                      No hay verificaciones de pH registradas para esta calibración.
                    </Text>
                  )}
                </div>
              )}

              {/* ================== VISTA: INTERMEDIARIO ================== */}
              {viewSegment === "intermediario" && (
                <div style={{ marginTop: 4 }}>
                  <h3 className="concepts-title">
                    Intermediario (Protocolo de Muestreo y Hoja de Campo)
                  </h3>
                  <div style={{ marginBottom: 16 }}> 
                  <Popconfirm
                  title="¿Crear Intermediario?"
                  description="Se creará un nuevo Intermediario (Protocolo de Muestreo y Hoja de Campo) asociado a esta calibración."
                  okText="Sí, crear"
                  cancelText="Cancelar"
                  onConfirm={async () => {
                    try {
                      await createIntermediario({
                        calibracionVerificacion: selectedCalibracion.id,
                      });
                      message.success("Intermediario creado");
                      fetchData();
                    } catch (err) {
                      message.error("Error al crear el intermediario");
                      console.error(err);
                    }
                  }}
                  >
                <Button
                  type="dashed"
                  size="large"
                  // onClick={async () => {
                  //   try {
                  //     await createIntermediario({
                  //       calibracionVerificacion: selectedCalibracion.id,
                  //     });
                  //     message.success("Intermediario creado");
                  //     fetchData();
                  //   } catch (err) {
                  //     message.error("Error al crear el intermediario");
                  //     console.error(err);
                  //   }
                  // }}
                >
                  Crear Intermediario (Protocolo de Muestreo y Hoja de Campo)
                </Button>

                </Popconfirm>

                  </div>

                  {selectedCalibracion.intermediarios?.filter((type) => type.id).length ? (
                    <Collapse accordion>
                      {selectedCalibracion.intermediarios
                        ?.filter((type) => type.id)
                        .map((type) => (
                          <Panel
                            key={type.id}
                            header={
                              <div
                                style={{
                                  display: "flex",
                                  justifyContent: "space-between",
                                  alignItems: "center",
                                }}
                              >
                                <span>Intermediario ID: {type.numero}</span>
                                <Popconfirm
                                  title="¿Eliminar intermediario?"
                                  description="Se eliminarán Protocolo de Muestreo, Hoja de Campo y datos asociados."
                                  okText="Sí, eliminar"
                                  okType="danger"
                                  cancelText="Cancelar"
                                  onConfirm={() =>
                                    confirmarEliminacionIntermediario(
                                      type.id,
                                      type.protocoloMuestreo?.id,
                                      type.hojaCampo?.id
                                    )
                                  }
                                >
                                  <Button
                                    size="small"
                                    danger
                                    icon={<DeleteOutlined />}
                                  >
                                    Eliminar
                                  </Button>
                                </Popconfirm>
                              </div>
                            }
                          >
                            {/* ====== ACCIONES PRINCIPALES DEL INTERMEDIARIO ====== */}
                            <div style={{ marginBottom: 12 }}>
                              {!type.protocoloMuestreo?.id &&
                                !type.hojaCampo?.id && (
                                <Text
                                  strong
                                  style={{ display: "block", marginBottom: 4 }}
                                >
                                  Acciones del intermediario:
                                </Text>
                                  
                                )}
                              <Space
                                wrap
                                size="small"
                                style={{
                                  rowGap: 8,
                                  columnGap: 8,
                                  width: "100%",
                                }}
                              >
                                {!type.protocoloMuestreo?.id && (
                                  <Link
                                    to={`/FormularioProtocoloMuestreo/${type.id}/${idAguas}`}
                                  >
                                    <Button size="large">
                                      Crear Protocolo de Muestreo
                                    </Button>
                                  </Link>
                                )}

                                {!type.hojaCampo?.id &&
                                  selectedCalibracion.id &&
                                  selectedCalibracion?.ph?.some((ph) => ph?.id) && (
                                    <Link
                                      to={`/HojaCampoMuestreo/${type.id}/${idAguas}`}
                                    >
                                      <Button size="large">
                                        Crear Hoja de campo
                                      </Button>
                                    </Link>
                                  )}
                              </Space>
                            </div>

                            {/* ====== PROTOCOLO / HOJA DE CAMPO ====== */}
                            <div
                              style={{
                                display: "flex",
                                gap: 12,
                                flexWrap: "wrap",
                                alignItems: "stretch",
                              }}
                            >
                              {/* Protocolo */}
                              {type.protocoloMuestreo?.id && (
                                <div
                                  style={{
                                    flex: "1 1 260px",
                                    minWidth: 260,
                                  }}
                                >
                                  <Text
                                  strong
                                  style={{ display: "block", marginBottom: 4 }}
                                >
                                  Protocolo de Muestreo
                                </Text>
                                  <Descriptions
                                    size="small"
                                    bordered
                                    column={1}
                                    style={{ marginBottom: 8 }}
                                  >
                                    {/* <Descriptions.Item label="Protocolo de Muestreo:">
                                      {type.protocoloMuestreo.numero || "No asignado"}
                                    </Descriptions.Item> */}
                                    <Descriptions.Item label="Domicilio">
                                      {
                                        type.protocoloMuestreo.sitioMuestreo
                                          ?.domicilio
                                      }
                                    </Descriptions.Item>
                                    <Descriptions.Item label="Giro de la Empresa:">
                                      {
                                        type.protocoloMuestreo.sitioMuestreo
                                          ?.giroEmpresa
                                      }
                                    </Descriptions.Item>
                                  </Descriptions>

                                  <Text
                                    strong
                                    style={{ display: "block", marginBottom: 4 }}
                                  >
                                    Acciones Protocolo de Muestreo:
                                  </Text>
                                  <Space
                                    wrap
                                    size="small"
                                    style={{ width: "100%", rowGap: 8 }}
                                  >
                                    <Link
                                      to={`/EditarFormularioProtocoloMuestreo/${type.protocoloMuestreo.id}/${idAguas}`}
                                    >
                                      <Button size="large" type="primary">
                                        Continuar Protocolo
                                      </Button>
                                    </Link>

                                    <Popconfirm
                                      title="¿Eliminar Protocolo de Muestreo?"
                                      description="Esta acción no se puede deshacer."
                                      okText="Sí, eliminar"
                                      okType="danger"
                                      cancelText="Cancelar"
                                      onConfirm={() =>
                                        ElimnarProtocolo(type.protocoloMuestreo.id)
                                      }
                                    >
                                      <Button size="large" danger>
                                        Eliminar Protocolo
                                      </Button>
                                    </Popconfirm>

                                    <Button
                                      size="large"
                                      icon={<FileAddOutlined />}
                                      onClick={() => downloadExcelProtocolo(type.protocoloMuestreo.id)}
                                    >
                                      Descargar Excel
                                    </Button>
                                  </Space>
                                </div>
                              )}
                              {/* Dividir */}
                              <Divider orientation="vertical" />
                              {/* Hoja de campo */}
                              {type.hojaCampo?.id && (
                                <div
                                  style={{
                                    flex: "1 1 260px",
                                    minWidth: 260,
                                  }}
                                >
                                  <Text
                                  strong
                                  style={{ display: "block", marginBottom: 4 }}
                                >
                                  Hoja de Campo
                                </Text>
                                  <Descriptions
                                    size="small"
                                    bordered
                                    column={1}
                                    style={{ marginBottom: 8 }}
                                  >
                                    <Descriptions.Item label="Hoja de Campo:">
                                      {type.hojaCampo?.numero || "No asignada"}
                                    </Descriptions.Item>
                                  </Descriptions>

                                  <Text
                                    strong
                                    style={{ display: "block", marginBottom: 4 }}
                                  >
                                    Acciones Hoja de Campo:
                                  </Text>
                                  <Space
                                    wrap
                                    size="small"
                                    style={{ width: "100%", rowGap: 8 }}
                                  >
                                    <Link
                                      to={`/EditarHojaCampoMuestreo/${type.hojaCampo.id}/${idAguas}`}
                                    >
                                      <Button size="large" type="primary">
                                        Continuar Hoja de Campo
                                      </Button>
                                    </Link>

                                    <Popconfirm
                                      title="¿Eliminar Hoja de Campo?"
                                      description="Esta acción no se puede deshacer."
                                      okText="Sí, eliminar"
                                      okType="danger"
                                      cancelText="Cancelar"
                                      onConfirm={() =>
                                        EliminarHojaCampo(type.hojaCampo.id)
                                      }
                                    >
                                      <Button size="large" danger>
                                        Eliminar Hoja de Campo
                                      </Button>
                                    </Popconfirm>

                                    <Button
                                      size="large"
                                      icon={<FileAddOutlined />}
                                      onClick={() => downloadExcelHojaCampo(type.hojaCampo.id)}
                                    >
                                      Descargar Excel
                                    </Button>
                                  </Space>
                                </div>
                              )}
                            </div>

                            {!type.protocoloMuestreo?.id && !type.hojaCampo?.id && (
                              <Text type="secondary">
                                Aún no se ha creado Protocolo ni Hoja de Campo para este
                                intermediario.
                              </Text>
                            )}
                          </Panel>
                        ))}
                    </Collapse>
                  ) : (
                    <Text type="secondary">
                      No hay intermediarios registrados para esta calibración.
                    </Text>
                  )}
                </div>
              )}
            </Card>
          
        </div>
        
        
        </>)}

      </Modal>


    </div>
  );
};

export default DARpart1;
