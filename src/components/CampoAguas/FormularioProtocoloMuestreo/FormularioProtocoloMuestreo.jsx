import React, {useRef, useState} from "react";
import "./FormularioProtocoloMuestreo.css";
import {
  Form,
  Input,
  Checkbox,
  DatePicker,
  Button,
  Radio,
  InputNumber,
  Row,
  Col,
  TimePicker,
  Collapse,
  message, Modal
} from "antd";
import {
     createProtocoloMuestreo,
     updateIntermediario,
} from "../../../apis/ApiCampo/FormmularioInforme";
import { sendProtocolSections } from "./sendProtocolSections";
import { useParams, useNavigate } from "react-router-dom";
const { Panel } = Collapse;

const tratamientoOpciones = [
  { label: "Filtrado", value: 1 },
  { label: "Desengrasado/Trampa de GyA", value: 2 },
  { label: "Neutralización", value: 3 },
  { label: "Floculación / Sedimentación / Decantación", value: 4},
  { label: "Tratamiento Biológico", value: 5 },
  { label: "Ninguno", value: 6 },
  { label: "Otros", value: 7 },
];

const INSTRUMENTOS = [
  { label: "Embudo de plástico",       value: 1 },
  { label: "Hoja de campo",            value: 2 },
  { label: "Calculadora",              value: 3 },
  { label: "Barra",                    value: 4 },
  { label: "Herramienta",              value: 5 },
  { label: "Cadena de custodia",       value: 6 },
  { label: "Pizeta",                   value: 7 },
  { label: "Etiquetas",                value: 8 },
  { label: "Guantes",                  value: 9 },
  { label: "Multiparámetro",           value: 10 },
  { label: "Malla",                    value: 11 },
  { label: "Cronómetro",               value: 12 },
  { label: "Probeta graduada 1 L",     value: 13 },
  { label: "Hielera",                  value: 14 },
];
const opcionesFrecuencia = [
  { value: 1, horas: "Menor que 4", muestras: "Mínimo 2", intervalo: "N.E.", intervalomaximo: "N.E." },
  { value: 2, horas: "De 4 a 8", muestras: "4", intervalo: "1", intervalomaximo: "2" },
  { value: 3, horas: "Mayor que 8 y ≤ 12", muestras: "4", intervalo: "2", intervalomaximo: "3" },
  { value: 4, horas: "Mayor que 12 y ≤ 18", muestras: "6", intervalo: "2", intervalomaximo: "3" },
  { value: 5, horas: "Mayor que 18 y ≤ 24", muestras: "6", intervalo: "3", intervalomaximo: "4" },
];

const FormularioProtocoloMuestreo = () => {
  const [form] = Form.useForm();
  const [idProtocoloMuestreo, setIdProtocoloMuestreo] = useState(null);
  const [idIntermediario, setIdIntermediario] = useState(null);
  const [activePanelKey, setActivePanelKey] = React.useState("1");
  const [face, setface] = useState(0);
  const punto1Ref = useRef(null);
  const punto2Ref = useRef(null);
  const punto3Ref = useRef(null);
  const punto4Ref = useRef(null);
  const { id, idAguas } = useParams(); 
  const protocoloRef   = useRef(null); // id real para lógica (no depende de setState)
  const intermediarioRef = useRef(null);
  const [checkedList, setCheckedList] = useState([]);      // estado local
  const allValues  = INSTRUMENTOS.map(i => i.value);
  const indeterminate = checkedList.length && checkedList.length < allValues.length;
  const checkAll     = checkedList.length === allValues.length;
   const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  /* helpers dentro del componente */
  const ensureProtocolo = async () => {
  // ya existen
  if (protocoloRef.current) return protocoloRef.current;

  const { data: proto } = await createProtocoloMuestreo({
    aguaResidualInforme: id,
  });
  protocoloRef.current = proto.id;
  setIdProtocoloMuestreo(proto.id);

  await updateIntermediario(id,{
    protocoloMuestreo   : proto.id
  });
  intermediarioRef.current = id;
  setIdIntermediario(id);

  return proto.id;
  };

  const confirmarEnvio = () => {
  Modal.confirm({
    title: "¿Estás seguro de enviar el protocolo?",
    content: "Verifica que toda la información esté completa antes de continuar.",
    okText: "Sí, enviar",
    cancelText: "Cancelar",
    onOk: () => handleSubmit(),  // llama a la función real de envío
  });
  };

/* reemplaza tu onFinish */
  const handleSubmit = async () => {
    try {
      setLoading(true);
      // 1️⃣  valida todo el formulario
      const allValues = await form.validateFields();

      // 2️⃣  asegúrate de tener protocolo + intermediario
      const protocoloId = await ensureProtocolo();

      // 3️⃣  envía los 4 puntos en orden (puede ser Promise.all si no importan los mensajes por secciones)
      for (const punto of ["punto1", "punto2", "punto3", "punto4"]) {
        const ok = await sendProtocolSections(
          punto,
          allValues,
          id,           // AguaResidualInforme
          protocoloId   // ProtocoloMuestreo
        );
        if (!ok) throw new Error(`Fallo al guardar ${punto}`);
      }

      message.success("Todos los puntos guardados ✅");
    } catch (err) {
      /* validaFields lanza si falta algo  */
      if (err.errorFields) {
        message.error("Corrige los campos marcados");
      } else {
        message.error(err.message || "Error al enviar");
      }
    }finally {
      message.success("Todos los puntos guardados ✅");
      setTimeout(() => {
        navigate(`/DetallesAguasResiduales/${idAguas}`); // regresar a la página anterior
      }, 1000);
      setLoading(false);
    }
  };

  

const enviarSeccion = async (punto, ref) => {
    /* 1️⃣  crear protocolo + intermediario sólo una vez -------- */
    if (!protocoloRef.current) {
      try {
        setLoading(true);
        console.log("Creando protocolo e intermediario...");
        const { data: proto } = await createProtocoloMuestreo({
          aguaResidualInforme: id,
        });
        protocoloRef.current = proto.id;
        setIdProtocoloMuestreo(proto.id);          // mantiene UI

        await updateIntermediario(id,{
          protocoloMuestreo: proto.id
        });
        intermediarioRef.current = id
        // localStorage.setItem("intermediarioId", id);
        setIdIntermediario(id);

        message.success("Protocolo e intermediario creados");
      } catch (err) {
        console.error(err.response?.data || err);
        message.error("No se pudo crear el protocolo");
        return;
      }finally{
        setLoading(false);
      }
    }

    /* 2️⃣  enviar la sección (upsert) ------------------------- */
    const ok = await sendProtocolSections(
      punto,
      await form.getFieldsValue(),
      id,                         // ← AguaResidualInforme
      protocoloRef.current        // ← siempre válido
    );

    /* 3️⃣  UX: cerrar panel y hacer scroll -------------------- */
    if (ok) {
      setActivePanelKey(null);
      setTimeout(() => {
        const top =
          ref.current?.getBoundingClientRect().top + window.scrollY - 100;
        window.scrollTo({ top, behavior: "smooth" });
      }, 200);
    }
  };

  return (
    
    <Form
      layout="vertical"
      form={form}
      onFinish={handleSubmit}
      style={{ maxWidth: 800, margin: "0 auto" }}
    >
      <Collapse 
      activeKey={activePanelKey}
      onChange={(key) => setActivePanelKey(key)}
      >
      
      <Panel header="Punto 1 - Datos del Sitio de Muestreo" key="1" >
      {/* Punto 1 - Datos del sitio de muestreo */}
      <div ref={punto1Ref} className="panel-header-sticky">
        <Row justify="space-between" align="middle">
          <Col>
            <h3 style={{ margin: 0 }}>Punto 1 - Datos del Sitio de Muestreo</h3>
          </Col>
          <Col>
            <Button 
            type="primary" 
            onClick={(e) => { e.stopPropagation(); enviarSeccion('punto1', punto1Ref); setActivePanelKey(null);
            setTimeout(() => {
              const top = punto1Ref.current?.getBoundingClientRect().top + window.scrollY - 100; // ajuste por headers sticky
              window.scrollTo({ top, behavior: 'smooth' });
            }, 200); // Espera a que el panel se cierre antes de hacer scroll
            }}>
              Guardar
            </Button>
          </Col>
        </Row>
      </div>
      {/* <Form.Item label="Fecha" name="fecha">
        <DatePicker format="DD/MM/YYYY" style={{ width: "100%" }} />
      </Form.Item>

      <Form.Item label="Nombre de la Empresa" name="nombreEmpresa">
        <Input placeholder="Nombre de la empresa" />
      </Form.Item> */}

      <Form.Item label="Domicilio / Ubicación Física" name="domicilioUbicacion">
        <Input.TextArea placeholder="Dirección del sitio" rows={2} />
      </Form.Item>

      <Form.Item label="Giro o Actividad Principal" name="giroActividad">
        <Input placeholder="Actividad de la empresa" />
      </Form.Item>
      </Panel>

     <Panel header="Punto 2 - Identificación del Punto de Muestreo" key="2" >
      <div ref={punto2Ref} className="panel-header-sticky">
        <Row justify="space-between" align="middle">
          <Col>
            <h3 style={{ margin: 0 }}>Punto 2 - Identificación del Punto de Muestreo</h3>
          </Col>
          <Col>
            <Button type="primary" onClick={(e) => { e.stopPropagation(); enviarSeccion('punto2', punto2Ref); setActivePanelKey(null);
            setTimeout(() => {
              const top = punto2Ref.current?.getBoundingClientRect().top + window.scrollY - 100; // ajuste por headers sticky
              window.scrollTo({ top, behavior: 'smooth' });
            }, 200);
            }}>
              Guardar
            </Button>
          </Col>
        </Row>
      </div>
      <Form.Item label="Identificación de Campo del Punto de Muestreo" name="identificacionCampo">
        <Input placeholder="Identificación del punto" />
      </Form.Item>

      <Form.Item label="Descripción del Proceso(s) / Actividad(es)" name="descripcionProceso">
        <Input.TextArea placeholder="Descripción del proceso" rows={2} />
      </Form.Item>

      <Form.Item label="Origen de la Muestra" name="origenMuestra">
        <Input placeholder="Ejemplo: descarga directa, pozo, etc." />
      </Form.Item>

      <Form.Item label="¿Cuántas horas al día descarga el proceso?" name="horasDescargaP2">
        <Input style={{ width: "100%" }} />
      </Form.Item>

      <Form.Item label="Tratamiento Antes de la Descarga" name="tratamientoAntesDescarga">
        <Checkbox.Group options={tratamientoOpciones} />
      </Form.Item>

     <Form.Item noStyle shouldUpdate={(prev, curr) => prev.tratamientoAntesDescarga !== curr.tratamientoAntesDescarga}>
        {({ getFieldValue }) =>
          getFieldValue("tratamientoAntesDescarga")=== 7 ? (
            <Form.Item name="tratamientoAntesDescargaOtro" label="Otro Tratamiento (especifique)">
              <Input placeholder="Describa otro tratamiento si aplica" />
            </Form.Item>
          ) : null
        }
      </Form.Item>
      
      <Form.Item label="Horas al día que opera el proceso" name="horasOpera">
        <Input style={{ width: "100%" }} />
      </Form.Item>

      <Form.Item label="Horas al día que descarga el proceso" name="horasDescarga">
        <Input style={{ width: "100%" }} />
      </Form.Item>

      <Form.Item label="Frecuencia de descarga en el proceso" name="frecuenciaDescarga">
        <Input style={{ width: "100%" }} />
      </Form.Item>

      <Form.Item label="¿En qué modalidad descarga?" name="modalidadDescarga">
        <Radio.Group>
          <Radio value={1}>Continua</Radio>
          <Radio value={2}>Intermitente</Radio>
          <Radio value={3}>Lotes</Radio>
          <Radio value={4}>Fortuita</Radio>
        </Radio.Group>
      </Form.Item>

     <Form.Item label="Nombre Completo del Responsable del Punto" name="nombreResponsable">
        <Input placeholder="Nombre completo" />
      </Form.Item>

      <Form.Item label="Puesto o Cargo del Responsable" name="puestoResponsable">
        <Input placeholder="Puesto o cargo del responsable" />
      </Form.Item>
      </Panel>

      <Panel header="Punto 3 - Procedimiento de Muestreo" key="3" >
      <div ref={punto3Ref}className="panel-header-sticky">
        <Row justify="space-between" align="middle">
          <Col>
            <h3 style={{ margin: 0 }}>Punto 3 - Procedimiento de muestreo</h3>
          </Col>
          <Col>
            <Button type="primary" onClick={(e) => { e.stopPropagation(); enviarSeccion('punto3', punto3Ref); setActivePanelKey(null);
            setTimeout(() => {
              const top = punto3Ref.current?.getBoundingClientRect().top + window.scrollY - 100; // ajuste por headers sticky
              window.scrollTo({ top, behavior: 'smooth' });
            }, 200);
            }}>
              Guardar
            </Button>
          </Col>
        </Row>
      </div>

      <Form.Item label="Parámetro a determinar:" name="parametroDeterminado">
        <Input style={{ width: "100%" }} />
      </Form.Item>

      <Form.Item label="3.2 Tipo de instrumento de medición utilizado">

        {/* ①  Select-all */}
        <Checkbox
          indeterminate={indeterminate}
          checked={checkAll}
          onChange={(e) => {
            const list = e.target.checked ? allValues : [];
            setCheckedList(list);
            form.setFieldsValue({ instrumentoMedicion: list });
          }}
          style={{ marginBottom: 8 }}
        >
          Seleccionar todo
        </Checkbox>

        {/* ②  Grupo real ligado al formulario */}
        <Form.Item name="instrumentoMedicion" noStyle>
          <Checkbox.Group
            options={INSTRUMENTOS}
            value={checkedList}
            onChange={(list) => setCheckedList(list)}
          />
        </Form.Item>

      </Form.Item>

     <Form.Item label="3.3 Reactivo utilizado" name="recipiente">
          <Checkbox.Group
          options={[
               { label: "Recipientes de plástico", value: 1 },
               { label: "Frascos de vidrio", value: 2 },
          ]}
          />
     </Form.Item>
     <Form.Item label="3.3 Reactivo utilizado" name="reactivoUtilizado">
          <Checkbox.Group
          options={[
                { label: "Hielo", value: 1 },
                { label: "H2SO4", value: 2},
                { label: "HCI", value: 3 },
                { label: "HNO3 SUPRAPURO", value: 4 },
                { label: "K2Cr2O7 5%", value: 5 },
                { label: "NaOH", value: 6 },
                { label: "HNO3 1:1", value: 7 },
          ]}
          />
     </Form.Item>

      <Form.Item label="3.4 Tipo de Muestreo" name="tipoMuestreo">
        <Radio.Group>
          <Radio value={true}>Simple</Radio>
          <Radio value={false}>Compuesto</Radio>
        </Radio.Group>
      </Form.Item>
      

  <Form.Item
    label="3.5 Frecuencia de muestreo"
    name="frecuenciaMuestreo"
    rules={[{ required: true, message: "Seleccione una frecuencia" }]}
  >
    {/* Este campo es el valor que capturará el Form */}
    <Radio.Group style={{ display: "none" }} />
  </Form.Item>

  <Form.Item shouldUpdate>
    {({ getFieldValue, setFieldValue }) => {
      const currentValue = getFieldValue("frecuenciaMuestreo");
      return (
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "#f5f5f5", textAlign: "left" }}>
                <th style={{ padding: "8px" }}></th>
                <th style={{ padding: "8px" }}>Horas</th>
                <th style={{ padding: "8px" }}>Muestras</th>
                <th style={{ padding: "8px" }}>Intervalo mínimo</th>
                <th style={{ padding: "8px" }}>Intervalo máximo</th>
              </tr>
            </thead>
            <tbody>
              {opcionesFrecuencia.map((row) => (
                <tr key={row.value} style={{ borderBottom: "1px solid #e8e8e8" }}>
                  <td style={{ padding: "12px", textAlign: "center" }}>
                    <Radio
                      checked={currentValue === row.value}
                      onChange={() => setFieldValue("frecuenciaMuestreo", row.value)}
                    />
                  </td>
                  <td style={{ padding: "12px" }}>{row.horas}</td>
                  <td style={{ padding: "12px" }}>{row.muestras}</td>
                  <td style={{ padding: "12px" }}>{row.intervalo}</td>
                  <td style={{ padding: "12px" }}>{row.intervalomaximo}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    }}
  </Form.Item>


{/* 
      <Form.Item label="Modo de descarga" name="modoDescarga">
        <Radio.Group>
          <Radio value="fortuita">Fortuita</Radio>
          <Radio value="intermitente">Intermitente</Radio>
          <Radio value="continua">Continua</Radio>
        </Radio.Group>
      </Form.Item> */}


      {/* <Form.Item label="Número de muestras simples a colectar" name="numeroMuestras">
        <InputNumber min={1} style={{ width: "100%" }} />
      </Form.Item> */}

     <Form.Item label="3.6 Tipo de agua en estudio" name="tipoAgua">
      <Radio.Group
        options={[
          { label: "Lavadora", value: 1 },
          { label: "Compresor", value: 2 },
          { label: "Residual de Proceso", value: 3 },
          { label: "Trampa de GyA", value:4 },
          { label: "Potable", value: 5 },
          { label: "Residual Sanitaria", value: 6},
          { label: "Residual Tratada", value: 7 },
          { label: "Ósmosis", value: 8 },
          { label: "Otro", value: 9},
        ]}
      />
    </Form.Item>

      <Form.Item noStyle shouldUpdate={(prev, curr) => prev.tipoAgua !== curr.tipoAgua}>
        {({ getFieldValue }) =>
          getFieldValue("tipoAgua")=== 9 ? (
            <Form.Item name="tipoAguaOtro" label="Especifique otro tipo de agua">
              <Input placeholder="Describa el tipo de agua" />
            </Form.Item>
          ) : null
        }
      </Form.Item>

      <Form.Item label="3.7 cuerpo Receptor" name="cuerpoReceptor">
        <Radio.Group
          options={[
            { label: "Suelo", value: 1 },
            { label: "Fosa", value: 2 },
            { label: "Alcantarillado", value: 3 },
            { label: "Embalse Natural", value: 4 },
            { label: "Río", value: 5 },
            { label: "PTAR", value: 6 },
            { label: "Aguas Costeras", value: 7 },
            { label: "No se descarga, se reutiliza", value: 8},
            { label: "Otro", value: 9 },
          ]}
        />
      </Form.Item>

      <Form.Item noStyle shouldUpdate={(prev, curr) => prev.cuerpoReceptor !== curr.cuerpoReceptor}>
        {({ getFieldValue }) =>
          getFieldValue("cuerpoReceptor")=== 9 ? (
            <Form.Item name="cuerpoReceptorOtro" label="Especifique otro sitio de descarga">
              <Input placeholder="Describa el sitio de descarga" />
            </Form.Item>
          ) : null
        }
      </Form.Item>
      </Panel>

      <Panel header="Punto 4 - Plan de Muestreo" key="4">
      <div ref={punto4Ref} className="panel-header-sticky">
        <Row justify="space-between" align="middle">
          <Col>
            <h3 style={{ margin: 0 }}>Punto 4 - Información del Muestreo</h3>
          </Col>
          <Col>
            <Button type="primary" onClick={(e) => { e.stopPropagation(); enviarSeccion('punto4', punto4Ref); setActivePanelKey(null);
            setTimeout(() => {
              const top = punto4Ref.current?.getBoundingClientRect().top + window.scrollY - 100; // ajuste por headers sticky
              window.scrollTo({ top, behavior: 'smooth' });
            }, 200);
            }}>
              Guardar
            </Button>
          </Col>
        </Row>
      </div>
      <Row gutter={16}>
        <Col span={12}>
          <Form.Item label="INICIAL" name="inicial">
               <Input.TextArea placeholder="" style={{ width: "100%" }} />
          </Form.Item>
          <Form.Item label="Hora de inicio del muestreo" name="horaInicio">
            <TimePicker format="HH:mm" style={{ width: "100%" }} />
          </Form.Item>
        </Col>
        <Col span={12}>
        <Form.Item label="Final" name="final">
               <Input.TextArea placeholder="" style={{ width: "100%" }} />
          </Form.Item>
          <Form.Item label="Hora de término del muestreo" name="horaTermino">
            <TimePicker format="HH:mm" style={{ width: "100%" }} />
          </Form.Item>
        </Col>
      </Row>
      <Form.Item label="Observaciones" name="Observaciones">
               <Input.TextArea placeholder="" style={{ width: "100%" }} />
     </Form.Item>
    </Panel>
     </Collapse>

      <Form.Item>
        <Button type="primary" onClick={confirmarEnvio}>
          Salir y Guardar Protocolo
        </Button>
      </Form.Item>
    </Form>
  );
};

export default FormularioProtocoloMuestreo;