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
} from 'antd';
import moment from "moment";
import { useParams, useNavigate} from "react-router-dom";
import { CheckOutlined, CloseOutlined,DownOutlined } from '@ant-design/icons';
import { createCustodiaExterna, getCustodiaExternaById, updateCustodiaExterna } from '../../../apis/ApiCustodiaExterna/ApiCustodiaExtern';
import { createMuestra, updateMuestra } from '../../../apis/ApiCustodiaExterna/ApiMuestra';
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

const CrearCustodiaExterna = () => {
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


  useEffect(() => {
    console.log("hola");
    if (id && preservadores.length > 0) {
      getCustodiaExternaDataById(id).then((res) => {
        const data = res.data;
        console.log("data id && preservador: ",data);
        // 1. Setear datos del formulario principal
        if (data?.["custodiaExterna"]) {
          const custodia = data["custodiaExterna"];
          console.log("res.data: ",res.data)
          setTimeout(()=>{
            console.log("res.data: ",res.data)
          console.log("PuestoCargo recibido:", custodia["Puesto o Cargo del Contacto"]);
          form.setFieldsValue({
            contacto: custodia["contacto"] || "",
            puestoCargoContacto: custodia["puestoOCargoDelContacto"] || "",
            celularDelContacto: custodia["celularDelContacto"] || "",
            correoDelContacto: custodia["correoDelContacto"] || "",
            puntosMuestreoAutorizados: custodia["puntosDeMuestreoAutorizados"] || "",
            modificacionDeLaOrdenDeTrabajo: custodia["modificacionDeLaOrdenDeTrabajo"],
            observacionesDeLaModificacion: custodia["observacionesDeLaModificacion"] || "",
            muestreoRequerido: custodia["muestreoRequerido"] || "",
            fechaFinal: custodia["fechaFinal"] ? moment(custodia["fechaFinal"], "DD-MM-YYYY") : null,
            horaFinal: custodia["horaFinal"] ? moment(custodia["horaFinal"], "HH:mm:ss") : null,
            prioridad: custodia["prioridad"]?.id,
            asesoriaGestionAmbiental: custodia["solicitudDeAsesoriaEnGestionAmbiental"],
            observaciones: custodia["observaciones"] || "",
            receptorCam: custodia["receptor"].id || "",
            tipoMuestra: [
              custodia["muestraCompuesta"] ? 2 : null,
              custodia["muestraPuntual"] ? 1 : null,
            ].filter(Boolean),
            idCompuesta: custodia["idDeLaMuestraCompuesta"] || null,
            idPuntual: custodia["idDeLaMuestraPuntual"] || null,
            
          });

        },0);
        }
        

        // 2. Setear muestras (bitácoras)
        if (data?.custodiaExterna?.muestras) {
          const muestras = data.custodiaExterna.muestras;
        
          const muestrasFormateadas = muestras.map((muestra) => ({
            id: muestra.id,
            identificacionCampo: muestra.identificacionDeCampo,
            fechaMuestreo: moment(muestra.fechaDeMuestreo, "DD-MM-YYYY"),
            horaMuestreo: moment(muestra.horaDeMuestreo, "HH:mm:ss"),
            matriz: muestra.matriz?.id,
            volumenCantidad: muestra.volumenOCantidad,
            filtro: muestra.filtro.id,
            parametro: muestra.parametro?.id,
            contenedor: muestra.conservador?.id,
            numeroContenedor: muestra.numeroDeContenedor,
            origenMuestra: muestra.origenDeLaMuestra,
            tipoMuestra: muestra.tipoDeMuestra ? [muestra.tipoDeMuestra.id] : [],
            preservador: (muestra.preservadores || []).map((p) => ({
              value: p.id,
              label: `${p.id} - ${p.nombre}`,
            })),
          }));

        
          //setMuestras(muestrasFormateadas);
          setBitacoras(muestrasFormateadas.map((muestra) => muestra.id));
          setActiveKey(muestrasFormateadas.map((_, idx) => idx));
          form.setFieldsValue({ bitacoras: muestrasFormateadas });
        }

      });
    }
  }, [id, preservadores, form]);

  useEffect(() => {
    console.log("hola1");
    if (id) {
      getCustodiaExternaById(id)
        .then((res) => {
          const data = res.data;
          console.log("Custodia Externa: ",res.data);
          // Si hay campos de fecha/hora, conviértelos a objetos moment()
          if (data.fechaFinal) {
            data.fechaFinal = moment(data.fechaFinal, "YYYY-MM-DD");
          }
          if (data.horaFinal) {
            data.horaFinal = moment(data.horaFinal, "HH:mm:ss");
          }
          // Precarga el formulario
          form.setFieldsValue({
            ...data,
            // Si tu data tiene un nombre de propiedad diferente para ordenTrabajo, ajústalo
            ordenTrabajo: data.ordenTrabajo,
            idCompuesta:data.idMuestraCompuesta,
            idPuntual: data.idMuestraPuntual,
            // Si usas tipoMuestra, por ejemplo:
            // tipoMuestra: data.tipoMuestra,
          });
          // Si necesitas actualizar estados locales, hazlo:
          setOrdenSeleccionada(data.ordenTrabajo);
          // Guardar en estado para usarlo más adelante si lo necesitas
          // setTipoMuestra(data.tipoMuestra);
        })
        .catch((err) => console.error("Error al obtener custodia externa:", err));
    }
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
      console.log("values: ",values);
      // 1. Crear la custodia externa
      const custodiaPayload = {
        contacto: values.contacto || "sin contacto",
        puntosMuestreoAutorizados: values.puntosMuestreoAutorizados || "0",
        modificacionOrdenTrabajo: values.modificacionDeLaOrdenDeTrabajo || false,
        observacionesModificacion: values.observacionesModificacion || "",
        muestreoRequerido: values.muestreoRequerido,
        fechaFinal: values.fechaFinal ? values.fechaFinal.format("YYYY-MM-DD") : null,
        horaFinal: values.horaFinal ? values.horaFinal.format("HH:mm:ss") : null,
        observaciones: values.observaciones,
        prioridad: values.prioridad,
        receptor: values.receptorCam, // o puedes hacer esto dinámico si lo necesitas
        ordenTrabajo: values.ordenTrabajo,
        asesoriaGestionAmbiental:values.asesoriaGestionAmbiental|| false,
        puestoCargoContacto:values.puestoCargoContacto,
        correoContacto:values.correoDelContacto,
        celularContacto:values.celularDelContacto,
        muestraCompuesta: values.tipoMuestra?.includes(2) || false,
        idMuestraCompuesta: values.idCompuesta || "",
        muestraPuntual: values.tipoMuestra?.includes(1) || false,
        idMuestraPuntual: values.idPuntual || "",
        estado:1,
      };
      let custodiaId;

      if (id) {
        const res = await updateCustodiaExterna(id, custodiaPayload);
        custodiaId = res.data.id;
      } else {
        const res = await createCustodiaExterna(custodiaPayload);
        custodiaId = res.data.id;
      }
  
      // 2. Crear las muestras
      const bitacoras = values.bitacoras || [];
      console.log('bitacoras:', bitacoras);
  
      for (const bitacora of bitacoras) {
        const muestraPayload = {
          identificacionCampo: bitacora.identificacionCampo || null,
          fechaMuestreo: bitacora.fechaMuestreo ? bitacora.fechaMuestreo.format("YYYY-MM-DD") : null,
          horaMuestreo: bitacora.horaMuestreo ? bitacora.horaMuestreo.format("HH:mm:ss") : null,
          volumenCantidad: bitacora.volumenCantidad,
          numeroContenedor: bitacora.numeroContenedor || "1",
          origenMuestra: bitacora.origenMuestra,
          idLaboratorio: "",
          filtro: bitacora.filtro,
          matriz: bitacora.matriz,
          contenedor: bitacora.contenedor,
          parametro: bitacora.parametro,
          custodiaExterna: custodiaId,
          preservador: Array.isArray(bitacora.preservador)
          ? bitacora.preservador.map(p => typeof p === "object" ? p.value : p)
          : [],
        };
        console.log("🧪 Bitácoras con IDs:", values.bitacoras);
        let muestraId = null;
        console.log("bitacora.id: ", bitacora.id)
        if (bitacora.id) {
          // ✅ Actualiza la muestra existente
          console.log("update")
          await updateMuestra(bitacora.id, muestraPayload);
          muestraId = bitacora.id;
      
          // ❌ No relaciones preservadores de nuevo
        } else {
          console.log("create")
          // ✅ Crea nueva muestra
          const res = await createMuestra(muestraPayload);
          muestraId = res.data.id;
      
          // ✅ Solo si es nueva, relaciona preservadores múltiples
          if (Array.isArray(bitacora.preservador)) {
            for (const preservador of bitacora.preservador) {
              try {
                await createpreservadormuestra({
                  muestra: muestraId,
                  preservador: preservador.value, // ⚠️ Necesitas `value`, no el objeto entero
                });
              } catch (err) {
                console.error(`❌ Error al relacionar preservador ${preservador.value}:`, err.response?.data || err);
              }
            }
          }
        }
      }
      
      navigate(`/DetallesCustodiaExternas/${custodiaId}`);
      console.log("✅ Todo creado correctamente");
    } catch (error) {
      console.error("❌ Error al enviar formulario:", error);
    }
    console.log('Formulario enviado:', values);
  };


   
   const renderBitacoraPanel = (index) => (
    <Panel header={`Muestras del parámetro ${index + 1}`} key={index}>
      <Row gutter={[16, 16]}>
      <Form.Item name={['bitacoras', index, 'id']} noStyle>
        <Input type="hidden" />
        {/* type="hidden"  */}
      </Form.Item>


        {/* IDENTIFICACIÓN DE CAMPO */}
        <Col span={8}>
          <Form.Item label="Identificación de campo"
          rules={[{ required: true, message: 'Ingresa identificador de campo' }]}
          name={['bitacoras', index, 'identificacionCampo']}>
            <Input  />
          </Form.Item>
        </Col>

        {/* MATRIZ */}
        <Col span={8}>
          <Form.Item label="Matriz" name={['bitacoras', index, 'matriz']}>
          <Select placeholder="Selecciona matriz">
            {matrices.map((item) => (
              <Option key={item.id} value={item.id}>
                {item.codigo} - {item.nombre}
              </Option>
            ))}
          </Select>
          </Form.Item>
        </Col>

        {/* VOLUMEN / CANTIDAD */}
        <Col span={8}>
          <Form.Item label="Volumen / cantidad" name={['bitacoras', index, 'volumenCantidad']}>
            <Input placeholder="Ej. 500 ml" />
          </Form.Item>
        </Col>

        {/* ID FILTRO */}
        <Col span={8}>
          <Form.Item label="Filtro" name={['bitacoras', index, 'filtro']}>
          <Select placeholder="Selecciona Filtro">
            {Filtros.map((item) => (
              <Option key={item.id} value={item.id}>
                {item.id} - {item.codigo}
              </Option>
            ))}
          </Select>
          </Form.Item>
        </Col>
        
        {/* MÉTODO */}
        <Col span={8}>
          <Form.Item label="Método/Paramatro" name={['bitacoras', index, 'parametro']}>
            <Select placeholder="Selecciona método">
              {parametros.map((item)=>(
                <Option key={item.id} value={item.id}>
                  {item.nombre}
                </Option>
              ))}
            </Select>
          </Form.Item>
        </Col>
        
  
        {/* CONTENEDOR */}
        <Col span={8}>
          <Form.Item label="Contenedor" name={['bitacoras', index, 'contenedor']}>
          <Select placeholder="Selecciona contenedor">
            {contenedores.map((item) => (
              <Option key={item.id} value={item.id}>
                {item.codigo} - {item.nombre}
              </Option>
            ))}
          </Select>
          </Form.Item>
        </Col>
  
        {/* PRESERVADOR */}
        <Col span={8}>
          <Form.Item label="Preservadores" name={['bitacoras', index, 'preservador']}>
            <Select
            mode="multiple"
            maxCount={MAX_PRESERVADORES}
            placeholder="Selecciona preservador"
            suffixIcon={<DownOutlined />}
            labelInValue
          >
            {preservadores.map((item) => (
              <Option key={item.id} value={item.id}>
                {item.id} - {item.nombre}
              </Option>
            ))}
          </Select>
          </Form.Item>
        </Col>
  
        {/* ORIGEN DE LA MUESTRA */}
        <Col span={8}>
          <Form.Item label="Origen de la muestra" name={['bitacoras', index, 'origenMuestra']}>
          <Input placeholder="Origen de la muestra" />
          </Form.Item>
        </Col>
  
        {/* FECHA Y HORA DE MUESTREO */}
        <Col span={8}>
          <Form.Item label="Fecha de muestreo y hora" name={['bitacoras', index, 'fechaMuestreo']}>
            <DatePicker />
          </Form.Item>
          <Form.Item label="Fecha de muestreo y hora" name={['bitacoras', index, 'horaMuestreo']}>
            <TimePicker />
          </Form.Item>
        </Col>
        <Col span={8}>
        <Form.Item label="Numero de contenedores" name={['bitacoras', index, 'numeroContenedor']}>
          <InputNumber />
        </Form.Item>
        </Col>
          {/* <Row gutter={16}>
            <Col span={24}>
            <Form.Item label="Tipo de muestra" name={['bitacoras', index, 'tipoMuestra']}>
            <Checkbox.Group >
              <Checkbox value={2}>Muestra Compuesta</Checkbox>
              <Checkbox value={1}>Muestra Puntual</Checkbox>
            </Checkbox.Group>
            </Form.Item>

              
            </Col>
          </Row>*/}
      </Row>
    </Panel>
  );
  
  return (
    <div style={{ 
     display: 'flex',
    justifyContent: 'center',
    padding: '32px 16px',
     }}>
      <ConfigProvider componentSize="large">
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
                {ordenSeleccionada && dataOrdenTrabajo && (
                  <div>

                  <Card title="Datos del cliente" style={{ marginBottom: 17 }}>
                    <Descriptions column={1}>

                      {/* Nombre Completo */}
                      <Descriptions.Item label="Nombre">
                        {dataOrdenTrabajo.cliente["nombreCompleto"]}
                      </Descriptions.Item>

                      {/* Teléfono o Celular */}
                      <Descriptions.Item label="Teléfono">
                        {dataOrdenTrabajo.cliente.telefono}
                      </Descriptions.Item>

                      {/* Dirección: concatenamos los campos dentro de dataOrdenTrabajo.Cliente.Dirección */}
                      <Descriptions.Item label="Dirección">
                        {dataOrdenTrabajo.cliente?.direccion?.calle || ""}{" "}
                        {dataOrdenTrabajo.cliente?.direccion?.numero || ""},{" "}
                        {dataOrdenTrabajo.cliente?.direccion?.colonia || ""},{" "}
                        {dataOrdenTrabajo.cliente?.direccion?.ciudad || ""},{" "}
                        {dataOrdenTrabajo.cliente?.direccion?.estado || ""}
                      </Descriptions.Item>


                      {/* Correo */}
                      <Descriptions.Item label="Correo">
                        {dataOrdenTrabajo.cliente.correo}
                      </Descriptions.Item>

                    </Descriptions>
                  </Card>
                  <Card title="Datos de Empresa" style={{ marginBottom: 17 }}>
                    <Descriptions column={1}>

                      {/* Nombre Empresa */}
                      <Descriptions.Item label="Empresa">
                      {dataOrdenTrabajo.empresa.nombre}{" "}
                      </Descriptions.Item>
                      <Descriptions.Item label="Dirección">
                        {dataOrdenTrabajo.empresa?.direccion?.calle || ""}{" "}
                        {dataOrdenTrabajo.empresa?.direccion?.numero || ""},{" "}
                        {dataOrdenTrabajo.empresa?.direccion?.colonia || ""},{" "}
                        {dataOrdenTrabajo.empresa?.direccion?.ciudad || ""},{" "}
                        {dataOrdenTrabajo.empresa?.direccion?.estado || ""}
                      </Descriptions.Item>
                    </Descriptions>
                    
                  </Card>
                  </div>
                )}
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
                  <Form.Item
                    label="Contacto: "
                    name="contacto"
                    rules={[{ required: true, message: 'Ingresa el Contacto' }]}
                  >
                    <Input />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item
                    label="Puesto/Cargo: "
                    name="puestoCargoContacto"
                  >
                    <Input />
                  </Form.Item>
                </Col>
                <Col span={8}>
                <Form.Item label="E-mail:" name="correoDelContacto">
                      <Input />
                    </Form.Item>
                  </Col>
                  <Col span={8}>
                <Form.Item label="TelCel:" name="celularDelContacto">
                      <Input />
                    </Form.Item>
                  </Col>
                <Col span={8}>
                  <Form.Item
                    label="Puntos de muestreo autorizados"
                    name="puntosMuestreoAutorizados"
                  >
                    <Input />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item name="modificacionDeLaOrdenDeTrabajo" valuePropName="checked"
                  label="¿El Cliente solicita modificación a la OT?">
                    <Switch
                      checkedChildren={<CheckOutlined />}
                      unCheckedChildren={<CloseOutlined />}
                    />
                  </Form.Item>
                </Col>
                {modificacionDeLaOrdenDeTrabajo&& (
                <Col span={8}>
                  <Form.Item
                      label="Modificacion solicitada:"
                      name="observacionesModificacion"
                    >
                      <Input />
                  </Form.Item>
                </Col>)}
               </Row>
               <Row gutter={16}>
                <Col span={8}>
                  <Form.Item
                      label="Muestro requerido por:"
                      name="muestreoRequerido"
                    >
                      <Input />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item label="Fecha de muestreo y hora" name='fechaFinal'>
                    <DatePicker name='fechaMuestra'/>
                  </Form.Item>
                  <Form.Item label="Fecha de muestreo y hora" name='horaFinal'> 
                    <TimePicker name='horaMuestra'/>
                  </Form.Item>
                </Col>

               </Row>
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
                <Button type="dashed" onClick={handleAddBitacora} block>
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
                    
                <Row gutter={16} style={{ marginBottom: 16 }}>
                  <Col span={24}>
                    <Form.Item name="asesoriaGestionAmbiental" valuePropName="checked"
                    label="¿El Cliente solicita asesoría/gestión ambiental?">

                        <Switch
                          checkedChildren={<CheckOutlined />}
                          unCheckedChildren={<CloseOutlined />}
                        />

                    </Form.Item>
                  </Col>
                </Row>

               {/*  <Row gutter={16} style={{ marginBottom: 16 }}>
                  <Col span={8}>
                    <Form.Item label="Dirigir información a:" name="dirigirInformacion">
                      <Input />
                    </Form.Item>
                  </Col>
                </Row>*/}

                <Row gutter={16} style={{ marginBottom: 16 }}>
                  <Col span={8}>
                    <Form.Item label="Temperatura de las muestras en recepción:" name="tempMuestras">
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

                    <Form.Item
                      noStyle
                      shouldUpdate={(prev, curr) => prev.tipoMuestra !== curr.tipoMuestra}
                    >
                      {({ getFieldValue }) =>
                        (getFieldValue("tipoMuestra") || []).includes(1) ? (
                          <Form.Item
                            label="ID Puntual"
                            name="idPuntual"
                            rules={[{ required: true, message: 'Ingresa el ID de la muestra puntual' }]}
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
                  <Button type="primary" htmlType="submit">
                    {id ? 'Actualizar Custodia' : 'Crear Custodia'}
                  </Button>
               </Form.Item>
               </Form>
          </div>
      </ConfigProvider>
    </div>
  );
};

export default CrearCustodiaExterna;
