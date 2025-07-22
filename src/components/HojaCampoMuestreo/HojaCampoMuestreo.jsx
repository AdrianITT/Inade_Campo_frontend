import React, {useRef, useEffect } from "react";
import {
  Form,
  Input,
  InputNumber,
  TimePicker,
  Button,
  Checkbox,
  Row,
  Col,
  Divider,
  Radio, 
  message,
  Modal
} from "antd";
import dayjs from 'dayjs';
import {
  createHojaCampo,
  updateHojaCampo,
  updateIntermediario,
  fetchHojaCampoFromIntermediario
} from "../../apis/ApiCampo/HojaCampo";
import { saveHojaCampo } from "./hojaCampoService";
import { useParams, useNavigate } from "react-router-dom";
import { TextInput } from "@react-pdf/renderer";


const HojaCampoMuestreo = ({ initialValues = {}, onBack, onNext }) => {

  const [form] = Form.useForm();
  const { id,idAguas } = useParams(); 
  const intermediarioRef = useRef(null);
  const navigate = useNavigate();

  const REFERENCIA = [
  { label: "NMX-AA-003-1980",       value: "NMX-AA-003-1980" },
  { label: "NMX-AA-014-1980",            value: "NMX-AA-014-1980" },
  { label: "NMX-014-SSA1-1993",              value:"NMX-014-SSA1-1993"}
];
const MUESTREO =[
  { label: "Bajo techo", value: true },
  { label: "Intemperie/Cielo abierto", value: false }
]
const CONDICION_CLIMA = [
  { label: "Soleado", value: "Soleado" },
  { label: "Nublado", value: "Nublado" },
  { label: "1/2 Nublado", value: "Medio_nublado" }, // esto es lo que espera el backend
];

  useEffect(() => {
  form.setFieldsValue(initialValues);
}, [initialValues, form]);


  useEffect(() => {
    form.setFieldsValue({
      registros: [{}] // inserta un registro vacío inicial
    });
  }, [form]);

const onFinish = (values) => {
  confirmarEnvio(values); // pasamos los datos al componente padre
};

const confirmarEnvio = async (values) => {
  try {
    const values = await form.validateFields();
    Modal.confirm({
      title: "¿Estás seguro de enviar la Hoja de campo?",
      content: "Verifica que toda la información esté completa antes de continuar.",
      okText: "Sí, enviar",
      cancelText: "Cancelar",
      onOk: () => handleSave(values), // ← ahora sí pasa los valores
    });
  } catch (error) {
    message.warning("Completa todos los campos obligatorios antes de continuar.");
  }
};

const handleSave = async (values) => {
  let hojaCampoId;
  const intermediarioGuardado = id;
  console.log("intermediarioGuardado:", intermediarioGuardado);
  const hojaCampoExistente = await fetchHojaCampoFromIntermediario(intermediarioGuardado);
  const mapMuestrasToFormValues = (muestras) => {
  return muestras.map((m) => ({
    id: m.id,
    phId: m.ph?.id,
    temperaturaId: m.temperatura?.id,
    conductividadId: m.conductividad?.id,
    temperaturaAireId: m.temperaturaAire?.id,
    tiempoId: m.tiempoMuestra?.id,
    volumenId: m.volumenMuestra?.id,

    numero: m.numero,
    hora: dayjs(m.hora, "HH:mm:ss"),

    ph1: m.ph?.ph1,
    ph2: m.ph?.ph2,
    ph3: m.ph?.ph3,

    temperatura1: m.temperatura?.temp1,
    temperatura2: m.temperatura?.temp2,
    temperatura3: m.temperatura?.temp3,

    conductividad1: m.conductividad?.cond1,
    conductividad2: m.conductividad?.cond2,
    conductividad3: m.conductividad?.cond3,

    temperaturaAmbiente1: m.temperaturaAire?.tempAire1,
    temperaturaAmbiente2: m.temperaturaAire?.tempAire2,
    temperaturaAmbiente3: m.temperaturaAire?.tempAire3,

    tiempo1: m.tiempoMuestra?.tiempo1,
    tiempo2: m.tiempoMuestra?.tiempo2,
    tiempo3: m.tiempoMuestra?.tiempo3,

    volumen1: m.volumenMuestra?.volumen1,
    volumen2: m.volumenMuestra?.volumen2,
    volumen3: m.volumenMuestra?.volumen3,

    color: m.color,
    olor: m.olor,
    materiaFlotante: m.materiaFlotante ? ["PRESENTE"] : ["AUSENTE"],
    solidos: m.solido ? "Sí" : "No",
    lluvia: m.lluvia ? "Sí" : "No",
    condiciones: m.condicion,
  }));
};

  console.log("Hoja de campo existente1:", hojaCampoExistente);
  //hojaCampoExistente.muestras?.length
  console.log("Hoja de campo existente2:", hojaCampoExistente?.muestras?.length);
  try {
    if (hojaCampoExistente ) {
    // const registrosFormateados = mapMuestrasToFormValues(hojaCampoExistente.muestras);
    // values.registros = registrosFormateados;
    hojaCampoId = hojaCampoExistente;
    console.log("Hoja de campo ya existe, actualizando:", hojaCampoId);
    await updateHojaCampo(hojaCampoId,{
      idMuestra        : values.identificacionCampo,
      normaReferencia  : values.normaReferencia ,
      condicionMuestreo: values.condicionMuestreo ,
      fechaMuestreo    : dayjs().format?.("YYYY-MM-DD"),
      observacion      : values.observacion,
      muestreador      : values.muestreador,
      supervisor       : values.supervisor,
    });
  } else {
    // Crear la hoja y enlazar
    console.log("values.normaReferencia:", values.normaReferencia);
    console.log("values.condicionMuestreo:", values.condicionMuestreo);
    const { data: nuevaHoja } = await createHojaCampo({
      idMuestra        : values.identificacionCampo,
      normaReferencia  : values.normaReferencia ,
      condicionMuestreo: values.condicionMuestreo ,
      fechaMuestreo    : dayjs().format?.("YYYY-MM-DD"),
      observacion      : values.observaciones,
      muestreador      : values.muestreador,
      supervisor       : values.supervisor,
    });
    console.log("Nueva hoja de campo creada:", nuevaHoja);
    hojaCampoId = nuevaHoja.id;

    // Enlazar con el intermediario
    await updateIntermediario(intermediarioGuardado, {
      hojaCampo: hojaCampoId,
    });
  }

  if (hojaCampoExistente?.muestras?.length > 0) {
  const registrosFormateados = mapMuestrasToFormValues(hojaCampoExistente.muestras);
  values.registros = registrosFormateados;
  }


  // Ahora guarda las muestras
  await saveHojaCampo(values, hojaCampoId, form);
  } catch (err) {
    console.error("Error al guardar la hoja de campo: 1er");
    console.error(err);
    console.error(err.response?.data || err);
    message.error("No se pudo guardar la hoja de campo");
  }finally {
    message.success("Todos los puntos guardados ✅");
    setTimeout(() => {
      navigate(`/DetallesAguasResiduales/${idAguas}`); // regresar a la página anterior
    }, 1000);
  }
};


  const TripleInput = ({ name, label, step, index }) => (
    <Form.Item label={`${label} (Promedio calculado)`} style={{ marginBottom: 0 }}>
      <Input.Group compact>
        <Form.Item name={[name, `${label}1`]} noStyle>
          <InputNumber step={step} placeholder="1°" style={{ width: '33%' }} />
        </Form.Item>
        <Form.Item name={[name, `${label}2`]} noStyle>
          <InputNumber step={step} placeholder="2°" style={{ width: '33%' }} />
        </Form.Item>
        <Form.Item name={[name, `${label}3`]} noStyle>
          <InputNumber step={step} placeholder="3°" style={{ width: '34%' }} />
        </Form.Item>
      </Input.Group>
      <Form.Item shouldUpdate noStyle>
        {({ getFieldValue }) => {
          const values = [1, 2, 3]
            .map(i => getFieldValue(["registros", index, `${label}${i}`]))
            .filter(v => v !== undefined && v !== null);
          const avg = values.length ? (values.reduce((a, b) => a + b, 0) / values.length).toFixed(2) : "-";
          return <div style={{ marginTop: 4, fontSize: 12 }}>Promedio: <strong>{avg}</strong></div>;
        }}
      </Form.Item>
    </Form.Item>
  );


  return (
    <Form
    form={form}
    layout="vertical"
    onFinish={onFinish}
    style={{ maxWidth: 1100, margin: "0 auto" }}
    >
      <Col span={24}>
        {/* <Form.Item label="Nombre de la empresa:" name="nombreEmpresa">
          <Input placeholder="Nombre de la empresa" />
        </Form.Item> */}
        <Form.Item label="ID DE LA MUESTRA:" name="identificacionCampo">
          <Input placeholder="Identificación del punto" />
        </Form.Item>
      
      </Col>
      <h3>Hoja de Campo - Datos por muestra (máx. 6)</h3>
      <Row gutter={16}>
      <Col span={8}><Form.Item label="NMX/NOM REFERENCIA:" name="normaReferencia"><Radio.Group options={REFERENCIA} /></Form.Item></Col>
      <Col span={8}><Form.Item  label="MUESTREO:" name="condicionMuestreo"><Radio.Group options={MUESTREO} /></Form.Item></Col>

      </Row>
      <Form.List name="registros">
        {(fields, { add, remove }) => (
          <>
            {fields.map(({ key, name, ...restField }, index) => (
              <div key={key} style={{ padding: 16, border: "1px solid #ccc", marginBottom: 32, borderRadius: 8, backgroundColor: "#f9f9f9" }}>
                {/* 🔒 Campos ocultos para mantener los ID relacionados */}
                <Form.Item name={[name, "id"]} hidden><Input  /></Form.Item>
                <Form.Item name={[name, "phId"]} hidden><Input /></Form.Item>
                <Form.Item name={[name, "temperaturaId"]} hidden><Input  /></Form.Item>
                <Form.Item name={[name, "conductividadId"]} hidden><Input /></Form.Item>
                <Form.Item name={[name, "temperaturaAireId"]} hidden><Input  /></Form.Item>
                <Form.Item name={[name, "tiempoId"]} hidden><Input /></Form.Item>
                <Form.Item name={[name, "volumenId"]} hidden><Input  /></Form.Item>
                <h4>Registro {index + 1}</h4>
                <Row gutter={16}>
                  {/* <Col span={6}><Form.Item {...restField} name={[name, "numero"]} label="Número de muestra"><InputNumber min={1} style={{ width: "100%" }} /></Form.Item></Col> */}
                  <Col span={6}><Form.Item {...restField} name={[name, "hora"]} label="Hora"><TimePicker format="HH:mm" style={{ width: "100%" }} /></Form.Item></Col>
                </Row>

                <Row gutter={16}>
                  <Col span={8}><TripleInput name={name} label="ph" step={0.01} index={index} /></Col>
                  <Col span={8}><TripleInput name={name} label="temperatura" step={0.1} index={index} /></Col>
                  <Col span={8}><TripleInput name={name} label="conductividad" step={1} index={index} /></Col>
                </Row>
                <Row gutter={16}>
                  <Col span={8}><TripleInput name={name} label="temperaturaAmbiente" step={0.1} index={index} /></Col>
                  <Col span={8}><TripleInput name={name} label="tiempo" step={1} index={index} /></Col>
                  <Col span={8}><TripleInput name={name} label="volumen" step={1} index={index} /></Col>
                </Row>
                {/* <Row gutter={16}>
                  <Col span={8}><TripleInput name={name} label="qi" step={1} index={index} /></Col>
                </Row> */}

                <Divider orientation="left">Otras observaciones</Divider>
                <Row gutter={16}>
                  <Col span={8}><Form.Item {...restField} name={[name, "color"]} label="Color"><Input /></Form.Item></Col>
                  <Col span={8}><Form.Item {...restField} name={[name, "olor"]} label="Olor"><Input /></Form.Item></Col>
                  <Col span={8}><Form.Item {...restField} name={[name, "materiaFlotante"]} label="Materia Flotante"><Checkbox.Group options={["AUSENTE", "PRESENTE"]} /></Form.Item></Col>
                </Row>

                <Row gutter={16}>
                  <Col span={8}><Form.Item
                    {...restField}
                    name={[name, "condiciones"]}
                    label="Clima"
                    rules={[{ required: true, message: "Selecciona una condición" }]}
                  >
                    <Radio.Group options={CONDICION_CLIMA} />
                  </Form.Item></Col>
                  <Col span={8}><Form.Item {...restField} name={[name, "solidos"]} label="¿Sólidos?"><Radio.Group options={["Sí", "No"]} /></Form.Item></Col>
                  <Col span={8}><Form.Item {...restField} name={[name, "lluvia"]} label="¿Lluvia?"><Radio.Group options={["Sí", "No"]} /></Form.Item></Col>
                </Row>

                <Row justify="end">
                  <Col><Button danger onClick={() => remove(name)}>Eliminar Registro</Button></Col>
                </Row>
              </div>
            ))}

            <Form.Item>
              <Button
                type="dashed"
                onClick={() => {
                  if (fields.length < 6) add();
                }}
                block
              >
                Agregar muestra
              </Button>
            </Form.Item>
          </>
        )}
        
      </Form.List>
      
      <Col span={24}><Form.Item label="Observaciones:" name="observaciones"><Input.TextArea/></Form.Item></Col>
      <Col span={24}><Form.Item  label="Muestreo Realizado por:" name="muestreador"><Input/></Form.Item></Col>
      <Col span={24}><Form.Item  label="Supervisado por:" name="supervisor"><Input/></Form.Item></Col>
      <Divider />

      <Form.Item>
        <Button type="primary" onClick={() => form.submit()}>
          Guardar Registros
        </Button>
      </Form.Item>
    </Form>
  );
};

export default HojaCampoMuestreo;
