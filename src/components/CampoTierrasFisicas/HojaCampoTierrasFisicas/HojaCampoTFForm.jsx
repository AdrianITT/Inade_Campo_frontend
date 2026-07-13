import React, { useState, useEffect } from "react";
import {
  Form,
  Input,
  Button,
  Card,
  Row,
  Col,
  Checkbox,
  TimePicker,
  Divider,
  message,
  Tabs,
  Space,
  InputNumber,
  Modal
} from "antd";
import dayjs from "dayjs";
import {
  PlusOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import { useParams, useNavigate } from "react-router-dom";
import {
  createHojaCampoTF,
  createValoresResistencia,
  createOhmsTF,
  updateHojaCampoTF,
  updateValoresResistencia,
  updateOhmsTF,
  getExistsHojaCampoTF,
  deleteValoresResistencia,
  deletehojacampotf
} from "../../../apis/ApiCampo/TierrasFisicasApi";
import ModalExito from "../ModalTierrasFisicas/ModalCreacion";

const HojaCampoTFForm = ({ onSuccess = null }) => {
  const [form] = Form.useForm();
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [idVerificacion, setIdVerificacion] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [ubicaciones, setUbicaciones] = useState([]);
  const [totalUbicaciones, setTotalUbicaciones] = useState(0);
  const [activeTab, setActiveTab] = useState("0");

  const etiquetasOhms = [ "1m", "4m","7m", "10m", "13m", "16m", "19m" ];

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      const response = await getExistsHojaCampoTF(id);
      setIdVerificacion(response.data.id);
      setUbicaciones(response.data.ubicacion || []);
      setTotalUbicaciones(response.data.total_ubicaciones || 0);

      if (!response.data.exists) {
        form.setFieldsValue({ hojasCampo: [{ valoresResistencia: [] }] });
        return;
      }

      const hojas = response.data.HojaCampo || [];
      const hojasFormateadas = hojas.map((hoja) => ({
        ...hoja,
        horaInicio: hoja.horaInicio ? dayjs(hoja.horaInicio, "HH:mm:ss") : null,
        horaTermino: hoja.horaTermino ? dayjs(hoja.horaTermino, "HH:mm:ss") : null,
        valoresResistencia: hoja.valoresResistencia?.map((valor) => ({
          ...valor,
          ohms: valor.ohms?.length > 0 ? valor.ohms : Array(7).fill({ valorOhms: "" }),
        })) || [],
      }));

      form.setFieldsValue({ hojasCampo: hojasFormateadas });
    } catch (error) {
      console.error(error);
      message.error("Error cargando hojas");
    } finally {
      setLoading(false);
    }
  };

  const agregarHojaCampo = () => {
    const hojas = form.getFieldValue("hojasCampo") || [];
    const nuevaHoja = {
      horaInicio: null,
      horaTermino: null,
      resolucion: "",
      temperatura: "",
      humedad: "",
      humedadRelativa: false,
      humedadRelativaPorcentaje: "",
      valoresResistencia: [],
    };
    form.setFieldsValue({ hojasCampo: [...hojas, nuevaHoja] });
    setActiveTab(String(hojas.length));
  };

  // ✅ ELIMINACIÓN DE HOJA CON CONFIRMACIÓN Y LLAMADA A API
  const eliminarHojaCampo = (indexHoja) => {
    const hojas = form.getFieldValue("hojasCampo") || [];
    const hojaAEliminar = hojas[indexHoja];

    // Si la hoja tiene ID, existe en BD y hay que eliminarla
    if (hojaAEliminar?.id) {
      Modal.confirm({
        title: "Eliminar Hoja de Campo",
        content: "¿Estás seguro de que deseas eliminar esta hoja de campo? Esta acción no se puede deshacer.",
        okText: "Eliminar",
        okType: "danger",
        cancelText: "Cancelar",
        onOk: async () => {
          try {
            setDeleting(true);
            await deletehojacampotf(hojaAEliminar.id);
            message.success("Hoja eliminada correctamente");
            
            // Eliminar del estado
            hojas.splice(indexHoja, 1);
            form.setFieldsValue({ hojasCampo: hojas });
            setActiveTab("0");
          } catch (error) {
            console.error(error);
            message.error("Error eliminando hoja");
          } finally {
            setDeleting(false);
          }
        },
      });
    } else {
      // Si no tiene ID, es nueva, solo eliminar del estado sin confirmar
      hojas.splice(indexHoja, 1);
      form.setFieldsValue({ hojasCampo: hojas });
      setActiveTab("0");
    }
  };

  const agregarValor = (indexHoja) => {
    const hojas = [...form.getFieldValue("hojasCampo")];
    if (!hojas[indexHoja].valoresResistencia) {
      hojas[indexHoja].valoresResistencia = [];
    }
    hojas[indexHoja].valoresResistencia.push({
      elementoMedido: "",
      existenciaContinuidad: false,
      altura: "",
      angulo: "",
      ohms: Array(7).fill({ valorOhms: "" }),
    });
    form.setFieldsValue({ hojasCampo: hojas });
  };

  // ✅ ELIMINACIÓN DE VALOR CON CONFIRMACIÓN Y LLAMADA A API
  const eliminarValor = (indexHoja, indexValor) => {
    const hojas = [...form.getFieldValue("hojasCampo")];
    const valorAEliminar = hojas[indexHoja].valoresResistencia[indexValor];

    // Si el valor tiene ID, existe en BD y hay que eliminarlo
    if (valorAEliminar?.id) {
      Modal.confirm({
        title: "Eliminar Medición",
        content: "¿Estás seguro de que deseas eliminar esta medición? Esta acción no se puede deshacer.",
        okText: "Eliminar",
        okType: "danger",
        cancelText: "Cancelar",
        onOk: async () => {
          try {
            setDeleting(true);
            await deleteValoresResistencia(valorAEliminar.id);
            message.success("Medición eliminada correctamente");
            
            // Eliminar del estado
            hojas[indexHoja].valoresResistencia.splice(indexValor, 1);
            form.setFieldsValue({ hojasCampo: hojas });
          } catch (error) {
            console.error(error);
            message.error("Error eliminando medición");
          } finally {
            setDeleting(false);
          }
        },
      });
    } else {
      // Si no tiene ID, es nueva, solo eliminar del estado sin confirmar
      hojas[indexHoja].valoresResistencia.splice(indexValor, 1);
      form.setFieldsValue({ hojasCampo: hojas });
    }
  };

  const onFinish = async (values) => {
    try {
      setLoading(true);
      for (const hoja of (values.hojasCampo || [])) {
        const payloadHojaCampo = {
          verificacionTF: idVerificacion,
          horaInicio: hoja.horaInicio?.format("HH:mm:ss"),
          horaTermino: hoja.horaTermino?.format("HH:mm:ss"),
          resolucion: hoja.resolucion,
          temperatura: hoja.temperatura,
          humedad: hoja.humedad,
          humedadRelativa: hoja.humedadRelativa,
          humedadRelativaPorcentaje: hoja.humedadRelativa ? hoja.humedadRelativaPorcentaje : null,
        };

        let hojaResponse = hoja.id 
          ? await updateHojaCampoTF(hoja.id, payloadHojaCampo)
          : await createHojaCampoTF(payloadHojaCampo);

        const hojaActualId = hoja.id || hojaResponse.data.id;

        for (const valor of (hoja.valoresResistencia || [])) {
          const payloadValor = {
            hojaCampoTF: hojaActualId,
            elementoMedido: valor.elementoMedido,
            existenciaContinuidad: valor.existenciaContinuidad,
            altura: valor.altura,
            angulo: valor.angulo,
          };

          let valorResponse = valor.id
            ? await updateValoresResistencia(valor.id, payloadValor)
            : await createValoresResistencia(payloadValor);

          const valorActualId = valor.id || valorResponse.data.id;

          for (const ohm of (valor.ohms || [])) {
            const payloadOhm = {
              valoresResistencia: valorActualId,
              valorOhms: ohm.valorOhms,
            };
            if (ohm.id) {
              await updateOhmsTF(ohm.id, payloadOhm);
            } else {
              await createOhmsTF(payloadOhm);
            }
          }
        }
      }

      message.success("Hojas guardadas correctamente");
      if (onSuccess) onSuccess();
      setModalOpen(true);
      setTimeout(() => {
        navigate(`/DetallesTierrasFisicas/${id}`);
      }, 1000);
    } catch (error) {
      console.error(error);
      message.error("Error guardando hojas");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Card 
        title="Hoja de Campo TF" 
        extra={
          <Button type="dashed" icon={<PlusOutlined />} onClick={agregarHojaCampo}>
            Nueva Hoja de Campo
          </Button>
        }
      >
        <Form form={form} layout="vertical" onFinish={onFinish}>
          <Form.Item shouldUpdate noStyle>
            {() => {
              const hojas = form.getFieldValue("hojasCampo") || [];
              if (hojas.length === 0) return <p style={{ textAlign: 'center', color: '#999' }}>No hay hojas de campo agregadas.</p>;

              return (
                <Tabs
                  activeKey={activeTab}
                  onChange={setActiveTab}
                  type="editable-card"
                  hideAdd
                  onEdit={(targetKey, action) => {
                    if (action === "remove") eliminarHojaCampo(Number(targetKey));
                  }}
                  items={hojas.map((hoja, indexHoja) => {
                    const humedadRelativa = form.getFieldValue(["hojasCampo", indexHoja, "humedadRelativa"]);
                    const totalAgregados = hojas.reduce((sum, h) => sum + (h.valoresResistencia || []).length, 0);

                    return {
                      label: `Hoja #${indexHoja + 1}`,
                      key: String(indexHoja),
                      closable: true,
                      children: (
                        <div style={{ padding: "10px 0" }}>
                          {/* ID oculto */}
                          <Form.Item hidden name={["hojasCampo", indexHoja, "id"]}><Input /></Form.Item>

                          {/* METADATOS HOJA */}
                          <Row gutter={[16, 0]}>
                            <Col xs={24} sm={12} md={4}>
                              <Form.Item label="Hora Inicio" name={["hojasCampo", indexHoja, "horaInicio"]}>
                                <TimePicker style={{ width: "100%" }} format="HH:mm" />
                              </Form.Item>
                            </Col>
                            <Col xs={24} sm={12} md={4}>
                              <Form.Item label="Hora Término" name={["hojasCampo", indexHoja, "horaTermino"]}>
                                <TimePicker style={{ width: "100%" }} format="HH:mm" />
                              </Form.Item>
                            </Col>
                            <Col xs={24} sm={12} md={4}>
                              <Form.Item label="Resolución" name={["hojasCampo", indexHoja, "resolucion"]}>
                                <Input placeholder="Ej. 0.01" />
                              </Form.Item>
                            </Col>
                            <Col xs={24} sm={12} md={4}>
                              <Form.Item label="Temperatura" name={["hojasCampo", indexHoja, "temperatura"]}>
                                <InputNumber style={{ width: "100%" }} addonAfter="°C" />
                              </Form.Item>
                            </Col>
                            <Col xs={24} sm={12} md={4}>
                              <Form.Item label="Humedad" name={["hojasCampo", indexHoja, "humedad"]}>
                                <InputNumber style={{ width: "100%" }} addonAfter="%" />
                              </Form.Item>
                            </Col>
                            <Col xs={12} sm={6} md={2}>
                              <Form.Item label="H. Relativa" name={["hojasCampo", indexHoja, "humedadRelativa"]} valuePropName="checked">
                                <Checkbox />
                              </Form.Item>
                            </Col>
                            {humedadRelativa && (
                              <Col xs={12} sm={6} md={2}>
                                <Form.Item
                                  label="% H.R."
                                  name={["hojasCampo", indexHoja, "humedadRelativaPorcentaje"]}
                                  rules={[{ required: true, message: "Requerido" }]}
                                >
                                  <Input size="small" />
                                </Form.Item>
                              </Col>
                            )}
                          </Row>

                          <Divider style={{ margin: "12px 0" }} />

                          {/* CONTROL DE CONTADORES */}
                          <Row justify="space-between" align="middle" style={{ marginBottom: 15 }}>
                            <Col>
                              <Space size="middle">
                                <span><strong>Progreso:</strong> {totalAgregados} / {totalUbicaciones} Ubicaciones</span>
                                {totalAgregados < totalUbicaciones && <span style={{ color: "#faad14" }}>(Faltan {totalUbicaciones - totalAgregados})</span>}
                                {totalAgregados === totalUbicaciones && <span style={{ color: "green", fontWeight: "bold" }}>✓ Completo</span>}
                                {totalAgregados > totalUbicaciones && <span style={{ color: "red" }}>(Exceso de {totalAgregados - totalUbicaciones})</span>}
                              </Space>
                            </Col>
                            <Col>
                              <Button type="primary" ghost icon={<PlusOutlined />} onClick={() => agregarValor(indexHoja)}>
                                Agregar Medición de Ubicación
                              </Button>
                            </Col>
                          </Row>

                          {/* SECCIÓN VALORES DE RESISTENCIA */}
                          {(hoja.valoresResistencia || []).map((valor, indexValor) => {
                            const prevSheetsTotal = hojas.slice(0, indexHoja).reduce((sum, h) => sum + (h.valoresResistencia?.length || 0), 0);
                            const globalIndex = prevSheetsTotal + indexValor;
                            const infoUbicacion = ubicaciones[globalIndex] || {};
                            return (
                              <Card
                                key={indexValor}
                                size="small"
                                style={{ marginBottom: 16, borderLeft: "4px solid #1890ff" }}
                                title={
                                  <span style={{ fontSize: 13 }}>
                                    <strong>Ubicación #{globalIndex + 1}:</strong> {infoUbicacion.maquinaUbicacion || "N/A"} — <em>{infoUbicacion.area || "Sin área"}</em>
                                  </span>
                                }
                                extra={
                                  <Button 
                                    danger 
                                    type="text" 
                                    size="small" 
                                    icon={<DeleteOutlined />} 
                                    onClick={() => eliminarValor(indexHoja, indexValor)}
                                    loading={deleting}
                                  >
                                    Quitar
                                  </Button>
                                }
                              >
                                <Form.Item hidden name={["hojasCampo", indexHoja, "valoresResistencia", indexValor, "id"]}><Input /></Form.Item>

                                <Row gutter={[12, 8]} align="middle">
                                  <Col xs={24} sm={8} md={6}>
                                    <Form.Item label="Elemento Medido" name={["hojasCampo", indexHoja, "valoresResistencia", indexValor, "elementoMedido"]} style={{ marginBottom: 0 }}>
                                      <Input size="small" placeholder="Polo a tierra, estructura..." />
                                    </Form.Item>
                                  </Col>
                                  <Col xs={12} sm={4} md={3}>
                                    <Form.Item label="Altura" name={["hojasCampo", indexHoja, "valoresResistencia", indexValor, "altura"]} style={{ marginBottom: 0 }}>
                                      <InputNumber size="small" style={{ width: "100%" }} addonAfter="m" />
                                    </Form.Item>
                                  </Col>
                                  <Col xs={12} sm={4} md={3}>
                                    <Form.Item label="Ángulo" name={["hojasCampo", indexHoja, "valoresResistencia", indexValor, "angulo"]} style={{ marginBottom: 0 }}>
                                      <InputNumber size="small" style={{ width: "100%" }} addonAfter="°" />
                                    </Form.Item>
                                  </Col>
                                  <Col xs={12} sm={4} md={3}>
                                    <Form.Item label="Continuidad" name={["hojasCampo", indexHoja, "valoresResistencia", indexValor, "existenciaContinuidad"]} valuePropName="checked" style={{ marginBottom: 0 }}>
                                      <Checkbox />
                                    </Form.Item>
                                  </Col>

                                  {/* SECCIÓN MATRIZ DE OHMS COMPACTA */}
                                  <Col xs={24} sm={24} md={9}>
                                    <span style={{ display: "block", fontSize: "12px", color: "#8c8c8c", marginBottom: 4 }}>Lecturas de Ohms (1 al 7):</span>
                                    <Space size={4} wrap>
                                      {(valor.ohms || []).map((ohm, indexOhm) => (
                                        <div key={indexOhm}
                                        style={{ 
                                          display: "flex",
                                          flexDirection: "column",
                                          alignItems: "center",
                                        }}
                                        >
                                          <span
                                          style={{
                                            fontSize: "11px",
                                            color: "#595959",
                                            marginBottom: 2,
                                            fontWeight: 500,
                                          }}>
                                            {etiquetasOhms[indexOhm] || `R${indexOhm + 1}`}
                                          </span>
                                          <Form.Item hidden name={["hojasCampo", indexHoja, "valoresResistencia", indexValor, "ohms", indexOhm, "id"]}><Input /></Form.Item>
                                          <Form.Item
                                            name={["hojasCampo", indexHoja, "valoresResistencia", indexValor, "ohms", indexOhm, "valorOhms"]}
                                            style={{ marginBottom: 0 }}
                                          >
                                            <Input 
                                              size="small" 
                                              placeholder={`R${indexOhm + 1}`} 
                                              style={{ width: "55px", textAlign: "center" }} 
                                            />
                                          </Form.Item>
                                        </div>
                                      ))}
                                    </Space>
                                  </Col>
                                </Row>
                              </Card>
                            );
                          })}
                        </div>
                      ),
                    };
                  })}
                />
              );
            }}
          </Form.Item>

          <Divider style={{ margin: "20px 0" }} />
          
          <Button type="primary" htmlType="submit" size="large" loading={loading} block disabled={deleting}>
            Guardar Cambios de Campo
          </Button>
        </Form>
      </Card>

      <ModalExito visible={modalOpen} onClose={() => setModalOpen(false)} />
    </>
  );
};

export default HojaCampoTFForm;