import React, { useState, useEffect } from 'react';
import {
  Form,
  Input,
  Button,
  Select,
  Collapse,
  Row,
  Col,
  Typography,
  DatePicker,
  Card,
  Descriptions, 
  Checkbox, 
  TimePicker,
  Switch,
  InputNumber,
  ConfigProvider,
  Spin
} from 'antd';
import moment from "moment";
import { useParams, useNavigate} from "react-router-dom";
import { CheckOutlined, CloseOutlined,DownOutlined } from '@ant-design/icons';
import { createCustodiaExterna, getCustodiaExternaById, updateCustodiaExterna } from '../../../apis/ApiCustodiaExterna/ApiCustodiaExtern';
import { createMuestra, updateMuestraDataOne } from '../../../apis/ApiCustodiaExterna/ApiMuestra';
import { createpreservadormuestra } from '../../../apis/ApiCustodiaExterna/ApiPreservadorMuestra';
import { getAllPrioridad } from '../../../apis/ApiCustodiaExterna/ApiPrioridad';
import {getAllContenedor} from '../../../apis/ApiCustodiaExterna/ApiContenedor'
import { getAllPreservador } from '../../../apis/ApiCustodiaExterna/ApiPreservador';
import { getAllMatriz } from '../../../apis/ApiCustodiaExterna/ApiMatriz';
//import { getAllClave } from '../../../apis/ApiCustodiaExterna/ApiClave';
import { getAllParametro } from '../../../apis/ApiCustodiaExterna/ApiParametros';
import { getCustodiaExternaDataById } from '../../../apis/ApiCustodiaExterna/ApiCustodiaExternaData';
import { getAllFiltro } from '../../../apis/ApiCustodiaExterna/ApiFiltro';
//getReceptorById
import { getReceptorById , getAllReceptor} from '../../../apis/ApisServicioCliente/ResectorApi';
//servicio cliente
import { getAlldataordentrabajo } from '../../../apis/ApisServicioCliente/DataordentrabajoApi';
import { getAllOrdenesTrabajo,getOrdenTrabajoById } from '../../../apis/ApisServicioCliente/OrdenTrabajoApi';

const { Title } = Typography;
const { Panel } = Collapse;
const { Option } = Select;
//const { TextArea } = Input;

const EditarCustodia = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [form] = Form.useForm();
  const [bitacoras, setBitacoras] = useState([0]); // Comienza con una bitácora
  const [activeKey, setActiveKey] = useState([0]);
  const [ordenSeleccionada, setOrdenSeleccionada] = useState(null);
  const MAX_PRESERVADORES = 3;
  const modificacionDeLaOrdenDeTrabajo=Form.useWatch("modificacionDeLaOrdenDeTrabajo", form);
  //const asesoriaGestionAmbiental=Form.useWatch("asesoriaGestionAmbiental", form);
  const [ordenesTrabajo, setOrdenesTrabajo] = useState([]);
  const [prioridades, setPrioridades] = useState([]);
  const [contenedores, setContenedores] = useState([]);
  const [preservadores, setPreservadores] = useState([]);
  //const [claves, setClaves] = useState([]);
  const [matrices, setMatrices] = useState([]);
  const [parametros, setParametros] = useState([]);
  const [tipoMuestras, setTipoMuestra] = useState([]);
  const [dataOrdenTrabajo, setDataOrdenTrabajo] = useState(null);
  const [Filtros, setFiltros] = useState([]);
  //const [muestras, setMuestras] = useState([]);
  //const [custodia, setCustodia] = useState(null);
  const [receptor, setReceptor] = useState(null);
  const [receptores, setReceptores] = useState([]);
  const [loading, setLoading] = useState(false);

  const READ_ONLY = true;
  const DISABLED =READ_ONLY;

  useEffect(() => {
    // ❌ 1) Sal de inmediato si aún no tienes los datos mínimos
    if (!id || preservadores.length === 0) return;

    let cancelado = false;        // 2) bandera de limpieza

    const cargarDatos = async () => {
      try {
        setLoading(true);         // 3) ⬆️ spinner ON

        const { data } = await getCustodiaExternaDataById(id);
        if (cancelado) return;    // el componente se desmontó

        /* ---------- 4) LLENAR DATOS DEL FORMULARIO ---------- */
        const custodia = data?.custodiaExterna;
        if (custodia) {
          form.setFieldsValue({
            contacto: custodia.contacto || "",
            puestoCargoContacto: custodia.puestoOCargoDelContacto || "",
            celularDelContacto: custodia.celularDelContacto || "",
            correoDelContacto: custodia.correoDelContacto || "",
            puntosMuestreoAutorizados: custodia.puntosDeMuestreoAutorizados || "",
            modificacionDeLaOrdenDeTrabajo: custodia.modificacionDeLaOrdenDeTrabajo,
            observacionesDeLaModificacion: custodia.observacionesDeLaModificacion || "",
            muestreoRequerido: custodia.muestreoRequerido || "",
            fechaFinal: custodia.fechaFinal
              ? moment(custodia.fechaFinal, "DD-MM-YYYY")
              : null,
            horaFinal: custodia.horaFinal
              ? moment(custodia.horaFinal, "HH:mm:ss")
              : null,
            prioridad: custodia.prioridad?.id,
            asesoriaGestionAmbiental: custodia.solicitudDeAsesoriaEnGestionAmbiental,
            observaciones: custodia.observaciones || "",
            receptorCam: custodia.receptor?.id || "",
            tipoMuestra: [
              custodia.muestraCompuesta ? 2 : null,
              custodia.muestraPuntual ? 1 : null,
            ].filter(Boolean),
            idCompuesta: custodia.idDeLaMuestraCompuesta || null,
            idPuntual: custodia.idDeLaMuestraPuntual || null,
            temperatura: custodia.temperatura || null,
          });
        }

        /* ---------- 5) LLENAR BITÁCORAS ---------- */
        if (custodia?.muestras) {
          const muestrasFmt = custodia.muestras.map((m) => ({
            id: m.id,
            identificacionCampo: m.identificacionDeCampo,
            fechaMuestreo: moment(m.fechaDeMuestreo, "DD-MM-YYYY"),
            horaMuestreo: moment(m.horaDeMuestreo, "HH:mm:ss"),
            matriz: m.matriz?.id,
            volumenCantidad: m.volumenOCantidad,
            filtro: m.filtro?.id,
            parametro: m.parametro?.id,
            contenedor: m.conservador?.id,
            numeroContenedor: m.numeroDeContenedor,
            origenMuestra: m.origenDeLaMuestra,
            tipoMuestra: m.tipoDeMuestra ? [m.tipoDeMuestra.id] : [],
            preservador: (m.preservadores || []).map((p) => ({
              value: p.id,
              label: `${p.id} - ${p.nombre}`,
            })),
          }));

          setBitacoras(muestrasFmt.map((m) => m.id));
          setActiveKey(muestrasFmt.map((_, i) => i));
          form.setFieldsValue({ bitacoras: muestrasFmt });
        }
      } catch (err) {
        console.error("Error al cargar custodia:", err);
      } finally {
        if (!cancelado) setLoading(false);  // 6) ⬇️ spinner OFF
      }
    };

    cargarDatos();

    // 7) cleanup → evita setState si el componente se desmonta
    return () => {
      cancelado = true;
    };
  }, [id, preservadores, form]);


  useEffect(() => {
    if (!id) return;                 // 🛑 nada que hacer si no hay id

    let cancelado = false;           // bandera de limpieza

    const cargarCustodia = async () => {
      try {
        setLoading(true);            // 🔹 spinner ON

        const { data } = await getCustodiaExternaById(id);
        if (cancelado) return;       // componente desmontado → salir

        /* --- Normaliza fechas --- */
        if (data.fechaFinal)  data.fechaFinal  = moment(data.fechaFinal, "YYYY-MM-DD");
        if (data.horaFinal)   data.horaFinal   = moment(data.horaFinal, "HH:mm:ss");

        /* --- Precarga formulario --- */
        form.setFieldsValue({
          ...data,
          ordenTrabajo : data.ordenTrabajo,
          idCompuesta  : data.idMuestraCompuesta,
          idPuntual    : data.idMuestraPuntual,
        });

        setOrdenSeleccionada(data.ordenTrabajo);
      } catch (err) {
        console.error("Error al obtener custodia externa:", err);
      } finally {
        if (!cancelado) setLoading(false);   // 🔻 spinner OFF
      }
    };

    cargarCustodia();

    /* cleanup: evita setState después de un desmontaje */
    return () => { cancelado = true; };
  }, [id, form]);

  
  useEffect(() => {
    if (ordenSeleccionada) {
      // Primero, obtenemos los datos generales de la orden de trabajo
      getAlldataordentrabajo(ordenSeleccionada)
        .then((res) => {
          console.log("Datos de getAlldataordentrabajo:", res.data);
          setDataOrdenTrabajo(res.data);
        })
        .catch((err) => console.error("Error al obtener datos de OT:", err));
  
      // Luego, usamos getOrdenTrabajoById para obtener el id del receptor
      getOrdenTrabajoById(ordenSeleccionada)
        .then((res2) => {
          console.log("Datos de getOrdenTrabajoById:", res2.data);
          // Supongamos que el receptor se encuentra en la propiedad "receptor" o "receptorId"
          const receptorId = res2.data.receptor || res2.data.receptorId;
          if (receptorId) {
            getReceptorById(receptorId)
              .then((resp) => {
                console.log("Datos del receptor:", resp.data);
                setReceptor(resp.data);
              })
              .catch((err) =>
                console.error("Error al obtener receptor:", err)
              );
          }
        })
        .catch((err) =>
          console.error("Error al obtener OrdenTrabajoById:", err)
        );
    }
  }, [ordenSeleccionada]);
  
  
  useEffect(() => {
    getAllOrdenesTrabajo()
      .then((res) => {
        const filtradas = res.data.filter(orden => orden.estado === 2);
        setOrdenesTrabajo(filtradas);
      })
      .catch((err) => {
        console.error("Error al obtener órdenes de trabajo:", err);
      });
  }, []);
  useEffect(() => {
    getAllReceptor()
      .then((res) => {
        setReceptores(res.data);
      })
      .catch((err) => {
        console.error("Error al obtener setReceptores:", err);
      });
  }, []);
  useEffect(() => {
    getAllPrioridad()
      .then((res) => {
        setPrioridades(res.data);
      })
      .catch((err) => {
        console.error("Error al obtener prioridades:", err);
      });
  }, []);
  useEffect(() => {
    getAllFiltro()
      .then((res) => {
        setFiltros(res.data);
      })
      .catch((err) => {
        console.error("Error al obtener prioridades:", err);
      });
  }, []);
  useEffect(() => {
    getAllContenedor()
      .then(res => setContenedores(res.data))
      .catch(err => console.error("Error al obtener contenedores:", err));
  
    getAllPreservador()
      .then(res => setPreservadores(res.data))
      .catch(err => console.error("Error al obtener preservadores:", err));
  
    getAllMatriz()
      .then(res => setMatrices(res.data))
      .catch(err => console.error("Error al obtener matrices:", err));

    /*getAllClave()
      .then(res => setClaves(res.data))
      .catch(err => console.error("Error al obtener claves:", err));*/
    getAllParametro()
      .then(res => setParametros(res.data))
      .catch(err => console.error("Error al obtener matrices:", err));
    getAllFiltro()
      .then(res => setFiltros(res.data))
      .catch(err => console.error("Error al obtener matrices:", err));
  }, []);
  
  
  

  const handleAddBitacora = () => {
     const newIndex = bitacoras.length;
     setBitacoras((prev) => [...prev, newIndex]);
     setActiveKey([newIndex]);
  };

  const handleFinish = async(values) => {
    try {
      setLoading(true);
      console.log("values: ",values);

  
      // 2. Crear las muestras
      const bitacoras = values.bitacoras || [];
      console.log('bitacoras:', bitacoras);
  
      for (const bitacora of bitacoras) {
        const muestraPayload = {
          idLaboratorio: bitacora.idLaboratorio || null ,
        };
        console.log("🧪 Bitácoras con IDs:", values.bitacoras);
        console.log("bitacora.id: ", bitacora.id)
          // ✅ Actualiza la muestra existente
          console.log("update")
          await updateMuestraDataOne(bitacora.id, muestraPayload);

      
          // ❌ No relaciones preservadores de nuevo
      }
      
      navigate(`/Custodia_Externa_en`);
      console.log("✅ Todo creado correctamente");
    } catch (error) {
      console.error("❌ Error al enviar formulario:", error);
    }finally{
      setLoading(false);
    }
    console.log('Formulario enviado:', values);
  };


   
  const renderBitacoraPanel = (index) => (
  <Panel
        key={index}
        header={`Muestras del parámetro ${index + 1}`}
        extra={<span style={{ fontSize: 12, color: "#999" }}>Solo lectura</span>}
      >
        {/* id oculto */}
        <Form.Item name={["bitacoras", index, "id"]} noStyle>
          <Input type="hidden" />
        </Form.Item>

        {/* Tabla de datos */}
        <Descriptions 
        bordered 
        size="small" 
        column={2} 
        labelStyle={{ width: 120 }} 
        contentStyle={{ padding: 8 }}>

          <Descriptions.Item label="Matriz">
            <Form.Item name={["bitacoras", index, "matriz"]} style={{ marginBottom: 0 }}>
              <Select placeholder="Selecciona matriz" disabled={DISABLED}>
                {matrices.map((item) => (
                  <Option key={item.id} value={item.id}>
                    {item.codigo} - {item.nombre}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Descriptions.Item>

          <Descriptions.Item label="Volumen / cantidad">
            <Form.Item name={["bitacoras", index, "volumenCantidad"]} style={{ marginBottom: 0 }}>
              <Input placeholder="Ej. 500 ml" disabled={DISABLED} />
            </Form.Item>
          </Descriptions.Item>

          <Descriptions.Item label="Filtro">
            <Form.Item name={["bitacoras", index, "filtro"]} style={{ marginBottom: 0 }}>
              <Select placeholder="Selecciona filtro" disabled={DISABLED}>
                {Filtros.map((item) => (
                  <Option key={item.id} value={item.id}>
                    {item.id} - {item.codigo}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Descriptions.Item>

          <Descriptions.Item label="Método / Parámetro">
            <Form.Item name={["bitacoras", index, "parametro"]} style={{ marginBottom: 0 }}>
              <Select placeholder="Selecciona método" disabled={DISABLED}>
                {parametros.map((item) => (
                  <Option key={item.id} value={item.id}>
                    {item.nombre}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Descriptions.Item>

          <Descriptions.Item label="Contenedor">
            <Form.Item name={["bitacoras", index, "contenedor"]} style={{ marginBottom: 0 }}>
              <Select placeholder="Selecciona contenedor" disabled={DISABLED}>
                {contenedores.map((item) => (
                  <Option key={item.id} value={item.id}>
                    {item.codigo} - {item.nombre}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Descriptions.Item>

          <Descriptions.Item label="Preservadores">
            <Form.Item name={["bitacoras", index, "preservador"]} style={{ marginBottom: 0 }}>
              <Select
                mode="multiple"
                maxCount={MAX_PRESERVADORES}
                placeholder="Selecciona preservador"
                suffixIcon={<DownOutlined />}
                labelInValue
                disabled={DISABLED}
              >
                {preservadores.map((item) => (
                  <Option key={item.id} value={item.id}>
                    {item.id} - {item.nombre}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Descriptions.Item>


          {/* Fecha y hora en una sola celda, ocupando 2 columnas */}
          <Descriptions.Item label="Fecha y hora de muestreo" span={2}>
            <Row gutter={8}>
              <Form.Item name={["bitacoras", index, "fechaMuestreo"]} style={{ marginBottom: 0, marginRight: 8 }}>
                <DatePicker style={{ width: "100%" }} disabled={DISABLED} />
              </Form.Item>
            </Row>
          </Descriptions.Item>

          <Descriptions.Item label="Número de contenedores">
            <Form.Item name={["bitacoras", index, "numeroContenedor"]} style={{ marginBottom: 0 }}>
              <InputNumber style={{ width: "100%" }} disabled={DISABLED} />
            </Form.Item>
          </Descriptions.Item>

          {/* NUEVO: IdLaboratorio (único editable) */}
          <Descriptions.Item label="ID de laboratorio">
            <Form.Item
              name={["bitacoras", index, "idLaboratorio"]}
              style={{ marginBottom: 0 }}
              rules={[{ required: true, message: "Ingresa el ID de laboratorio" }]}
            >
              <Input placeholder="Ej. LAB-000123" disabled={false} /* <- editable */ />
            </Form.Item>
          </Descriptions.Item>
        </Descriptions>
  </Panel>
  );
  
  return (
    <div style={{ 
     display: 'flex',
    justifyContent: 'center',
    padding: '32px 16px',
     }}>
      <Spin spinning={loading}>
      <ConfigProvider componentSize="large" componentDisabled={READ_ONLY}>
          <div style={{ width: '100%', maxWidth: 1000 }}>
               <Title level={3}>Crear Custodia Externa</Title>
               
               <Card title="Guía de códigos" style={{ marginBottom: 24 }}>
                <Row gutter={[16, 16]}>
                  {/* Preservadores */}
                  <Col span={8}>
                    <Title level={5}>Preservadores (P)</Title>
                    <ul style={{ paddingLeft: 20 }}>
                      <li>Hielo</li>
                      <li>H<sub>2</sub>SO<sub>4</sub></li>
                      <li>HC<sub>4</sub></li>
                      <li>HNO<sub>2</sub></li>
                      <li>K<sub>2</sub>Cr<sub>2</sub>O<sub>7</sub> 5%</li>
                      <li>NaOH</li>
                      <li>HNO<sub>3</sub></li>
                      <li>Otros (descripción en observaciones)</li>
                      <li>No Aplica</li>
                    </ul>
                  </Col>

                  {/* Matriz */}
                  <Col span={8}>
                    <Title level={5}>Matriz</Title>
                    <ul style={{ paddingLeft: 20 }}>
                      <li>S - Sólido</li>
                      <li>L - Líquido</li>
                      <li>G - Gas</li>
                      <li>O - Otros (descripción en observación)</li>
                    </ul>
                  </Col>

                  {/* Contenedores */}
                  <Col span={8}>
                    <Title level={5}>Contenedores (C)</Title>
                    <ul style={{ paddingLeft: 20 }}>
                      <li>V - Vidrio claro</li>
                      <li>F - Filtro</li>
                      <li>A - Vidrio ámbar</li>
                      <li>B - Bolsa</li>
                      <li>P - Plástico</li>
                      <li>O - Otro (descripción en observaciones)</li>
                    </ul>
                  </Col>

                  {/* Claves */}
                  <Col span={8}>
                    <Title level={5}>Claves</Title>
                    <ul style={{ paddingLeft: 20 }}>
                      <li>AR - Agua residual</li>
                      <li>AP - Agua potable</li>
                      <li>BM - Emisiones / Fuentes fijas</li>
                      <li>AL - Ambiente laboral</li>
                      <li>O - Otro (descripción en observaciones)</li>
                    </ul>
                  </Col>

                  {/* Tipo de muestra */}
                  <Col span={8}>
                    <Title level={5}>Tipo de Muestras</Title>
                    <ul style={{ paddingLeft: 20 }}>
                      <li>MP - Muestra puntual</li>
                      <li>MC - Muestra compuesta</li>
                    </ul>
                  </Col>
                </Row>
              </Card>
               <Form
               form={form}
               disabled={READ_ONLY}
               layout="vertical"
               onFinish={handleFinish}
               style={{ maxWidth: 900 }}
               initialValues={{
                modificacionDeLaOrdenDeTrabajo:false,
                asesoriaGestionAmbiental:false,
               }}
               >
                <Form.Item label="ID Orden de Trabajo" name="ordenTrabajo">
                  <Select
                    showSearch
                    placeholder="Selecciona una orden"
                    optionFilterProp="children"
                    onChange={(value) => setOrdenSeleccionada(value)}
                    filterOption={(input, option) =>
                      option.children.toLowerCase().includes(input.toLowerCase())
                    }
                  >
                    {ordenesTrabajo.map((orden) => (
                      <Option key={orden.id} value={orden.id}>
                        {orden.codigo}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>

                {receptor && (
                  <Card title="Receptor asignado" style={{ marginBottom: 17 }}>
                    <Descriptions column={1}>
                      <Descriptions.Item label="Receptor">
                        {receptor.nombrePila} {receptor.apPaterno} {receptor.apMaterno}
                      </Descriptions.Item>
                    </Descriptions>
                  </Card>
                )}

               <Row gutter={16}>
                <Col span={8}>
                  <Form.Item label="Grado de prioridad" name="prioridad">
                  <Select placeholder="Selecciona prioridad">
                    {prioridades.map((item) => (
                      <Option key={item.id} value={item.id}>
                        {item.codigo} - {item.descripcion}
                      </Option>
                    ))}
                  </Select>
                  </Form.Item>
                </Col>
               </Row>

               <Row gutter={16}>
                <Col span={8}>
                  <Form.Item label="Receptor" name="receptorCam">
                  <Select placeholder="Selecciona prioridad">
                    {receptores.map((item) => (
                      <Option key={item.id} value={item.id}>
                        {item.nombrePila} {item.apPaterno} {item.apMaterno}
                      </Option>
                    ))}
                  </Select>
                  </Form.Item>
                </Col>
               </Row>

               <Form.Item>
                <Button type="dashed" onClick={handleAddBitacora} block disabled>
                + Agregar punto de muestreo
                </Button>
               </Form.Item>

               <Collapse activeKey={activeKey} onChange={(keys) => setActiveKey(keys)}>
                    {bitacoras.map((_, index) => renderBitacoraPanel(index))}
               </Collapse>
                {/* <Col>
                  <Form.Item label="Muestreado por:" name="muestreado">
                    <Input />
                  </Form.Item>
                </Col>*/}
                <Col span={40}>
                  <Form.Item label="Observaciones" name="observaciones">
                      <Input.TextArea showCount maxLength={120} />
                  </Form.Item>
                </Col>
                    

               {/*  <Row gutter={16} style={{ marginBottom: 16 }}>
                  <Col span={8}>
                    <Form.Item label="Dirigir información a:" name="dirigirInformacion">
                      <Input />
                    </Form.Item>
                  </Col>
                </Row>*/}

                <Row gutter={16} style={{ marginBottom: 16 }}>
                  <Col span={8}>
                    <Form.Item label="Temperatura de las muestras en recepción:" name="temperatura">
                      <Input />
                    </Form.Item>
                  </Col>
                </Row>
                <Card title="Tipo de Muestras" style={{ display: 'inline-block', marginBottom: 16 }}>
                  <Row gutter={16}>
                    <Col span={24}>
                      <Form.Item label="Tipo de muestra" name="tipoMuestra">
                      <Checkbox.Group>
                        <Checkbox value={2}>Muestra Compuesta</Checkbox>
                        <Checkbox value={1}>Muestra Puntual</Checkbox>
                      </Checkbox.Group>
                    </Form.Item>

                    <Form.Item
                      noStyle
                      shouldUpdate={(prev, curr) => prev.tipoMuestra !== curr.tipoMuestra}
                    >
                      {({ getFieldValue }) =>
                        (getFieldValue("tipoMuestra") || []).includes(2) ? (
                          <Form.Item
                            label="ID Compuesta"
                            name="idCompuesta"
                            rules={[{ required: true, message: 'Ingresa el ID de la muestra compuesta' }]}
                          >
                            <Input />
                          </Form.Item>
                        ) : null
                      }
                    </Form.Item>

                    </Col>
                  </Row>
                </Card>

               <Form.Item style={{ marginTop: 17, textAlign: 'right' }}>
                  <Button type="primary" htmlType="submit" loading={loading} disabled={false}>
                    {id ? 'Actualizar Custodia' : 'Crear Custodia'}
                  </Button>
               </Form.Item>
               </Form>
          </div>
      </ConfigProvider>
      </Spin>
    </div>
  );
};

export default EditarCustodia;
