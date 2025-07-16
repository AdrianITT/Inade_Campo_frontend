import React, {useRef, useEffect, useState } from "react";
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
  message
} from "antd";
import dayjs from 'dayjs';
import {
  createHojaCampo,
  updateHojaCampo,
  updateIntermediario,
  fetchHojaCampoFromIntermediario,
  HojaCampoById,
} from "../../apis/ApiCampo/HojaCampo";
import{
     deleteMuestraHojaCampo
} from "../../apis/ApiCampo/MuestraHojaCampoApi";
import { saveHojaCampo } from "./hojaCampoService";
import { useParams } from "react-router-dom";
import { TextInput } from "@react-pdf/renderer";


const EditarHojaCampoMuestreo = ({ initialValues = {}, onBack, onNext }) => {

  const [form] = Form.useForm();
  const { id } = useParams(); 
  const intermediarioRef = useRef(null);
  const [registrosEliminados, setRegistrosEliminados] = useState([]);


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

const cargarDatos = async () => {
  try {
    const {data} = await HojaCampoById(id); // <- debe devolver los datos JSON de tu vista
    console.log("Datos cargados:", data);
        
    const hoja = {
      nombreEmpresa: "", // Asigna si lo tienes
      identificacionCampo: data.idMuestra,
      normaReferencia: data.normaReferencia,
      condicionMuestreo: data.condicionMuestreo === "Bajo techo", // convierte a booleano
      observaciones: data.observacion,
      muestreador: data.muestreador,
      supervisor: data.supervisor,
      registros: (data.muestras || []).map((m) => ({
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
      }))
    };

    form.setFieldsValue(hoja);
    console.log("Valores aplicados al form:", form.getFieldsValue());
  } catch (error) {
    console.error("Error al cargar datos del backend:", error);
  }
};
useEffect(() => {

  cargarDatos();
}, [form, id]);




const onFinish = (values) => {
  onNext(values); // pasamos los datos al componente padre
};

const handleSave = async (values) => {
  let hojaCampoId;
  console.log("id:", id);
//   const id = await fetchHojaCampoFromIntermediario(id);

  console.log("Hoja de campo existente1:", id);
  //id.muestras?.length
  console.log("Hoja de campo existente2:", id?.muestras?.length);
  try {
    if (id ) {
    // const registrosFormateados = mapMuestrasToFormValues(id.muestras);
    // values.registros = registrosFormateados;
    hojaCampoId = id;
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

  }  
  // Ahora guarda las muestras
  await saveHojaCampo(values, hojaCampoId, form);
  await cargarDatos();
  } catch (err) {
    console.error("Error al guardar la hoja de campo: 1er");
    console.error(err);
    console.error(err.response?.data || err);
    message.error("No se pudo guardar la hoja de campo");
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
    onFinish={handleSave}
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
                <Form.Item name={[name, "id"]} hidden preserve={true}><Input  /></Form.Item>
                <Form.Item name={[name, "phId"]} hidden preserve={true}><Input /></Form.Item>
                <Form.Item name={[name, "temperaturaId"]} hidden preserve={true}><Input  /></Form.Item>
                <Form.Item name={[name, "conductividadId"]} hidden preserve={true}><Input /></Form.Item>
                <Form.Item name={[name, "temperaturaAireId"]} hidden preserve={true}><Input  /></Form.Item>
                <Form.Item name={[name, "tiempoId"]} hidden preserve={true}><Input /></Form.Item>
                <Form.Item name={[name, "volumenId"]} hidden preserve={true}><Input/></Form.Item>
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
                    <Button
                    danger
                    onClick={async () => {
                    const idMuestra = form.getFieldValue(["registros", name, "id"]);
                    const confirmar = window.confirm("¿Seguro que deseas eliminar este registro?");
                    if (!confirmar) return;

                    if (idMuestra) {
                         try {
                         await deleteMuestraHojaCampo(idMuestra);
                         remove(name); // ❗️remueve del frontend justo después de eliminar
                         message.success("Registro eliminado");
                         } catch (err) {
                         message.error("No se pudo eliminar el registro");
                         }
                    } else {
                         remove(name); // si aún no estaba guardado en BD
                    }
                    }}
                    >
                    Eliminar Registro
                    </Button>
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
        <Button type="primary" htmlType="submit">
          Guardar Registros
        </Button>
      </Form.Item>
    </Form>
  );
};

export default EditarHojaCampoMuestreo;
