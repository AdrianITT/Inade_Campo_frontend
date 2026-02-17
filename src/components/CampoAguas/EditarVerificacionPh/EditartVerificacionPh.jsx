
import { useEffect, useState } from "react";
import {
     Card, Row, Col, Form, Input, DatePicker, TimePicker,
     Typography, Space, Radio, Button, Collapse, message
     ,Spin, Modal, Tag, Alert, Checkbox
} from "antd";
import dayjs from "dayjs";
import { useParams, useNavigate } from "react-router-dom";
import {updateCalibracionPh,
 updateCalibracionPhCampo,
updateCalibraionPhLaboratorio,
updatePrimerPuntoLaboratorio,
updateSegundoPuntoLaboratorio,
updatePrimerPuntoCampo,
updateSegundoPuntoCampo,
updateLecturaVerificacion,
verificacionPhData } from "../../../apis/ApiCampo/VerificacionPhApi"
import { useBeforeUnload, useNavigationPrompt} from "../../hooks/DetectTabClosure";
const { Title } = Typography;
const { Panel } = Collapse;




/* ---------- Bloque individual ---------- */
function BloqueEstandar({ pref, titulo, form , onOpenBulk}) {
     const itemProps = { size: "small", style: { width: "100%" } };
     const cfg = { labelCol: { span: 9 }, wrapperCol: { span: 15 }, style: { marginBottom: 6 } };
     // const presets= {
     //      CertLab:{
     //           ph:"7.00",
     //           marca:"Control Company",
     //           lote:"CC805972",
     //           // lecturas:["7.00","7.01","7.00"]
     //      },
     //      ComLab:{
     //           ph:"7.00",
     //           marca:"Fermont",
     //           lote:"448441",
     //           // lecturas:["7.00","7.00","7.00"]
     //      },
     //      CertLab2:{
     //           ph:"4.00",
     //           marca:"Control Company",
     //           lote:"CC808510",
     //           // lecturas:["4.00","4.01","4.00"]
     //      },
     //      ComLab2:{
     //           ph:"4.00",
     //           marca:"Fermont",
     //           lote:"503242",
     //           // lecturas:["4.00","4.00","4.00"]
     //      },
     //      CertCampo:{
     //           ph:"7.00",
     //           marca:"Control Company",
     //           lote:"CC805972",
     //           // lecturas:["7.00","7.01","7.00"]
     //      },
     //      ComCampo:{
     //           ph:"7.00",
     //           marca:"Fermont",
     //           lote:"448441",
     //           // lecturas:["7.00","7.00","7.00"]
     //      },
     //      CertCam2:{
     //           ph:"4.00",
     //           marca:"Control Company",
     //           lote:"CC805670",
     //           // lecturas:["4.00","4.01","4.00"]
     //      },
     //      ComCamp2:{
     //           ph:"4.00",
     //           marca:"Fermont",
     //           lote:"44446",
     //           // lecturas:["4.00","4.00","4.00"]
     //      },

     //      // default si no coincide el pref
     //      default: {
     //           ph: "100",
     //           marca: "",
     //           lote: "",
     //           caducidad: null,
     //           lecturas: ["", "", ""],
     //           temps: ["", "", ""],
     //      },
     // }
     // const aplicarValoresSugeridos = () => {
     // const cfgPreset = presets[pref] || presets.default;

     // const values = {
     //      [`ph${pref}`]: cfgPreset.ph,
     //      [`marca${pref}`]: cfgPreset.marca,
     //      [`lote${pref}`]: cfgPreset.lote,
     //      // [`caducidad${pref}`]: cfgPreset.caducidad,
     //      // [`lectura1${pref}`]: cfgPreset.lecturas[0],
     //      // [`lectura2${pref}`]: cfgPreset.lecturas[1],
     //      // [`lectura3${pref}`]: cfgPreset.lecturas[2],
     //      // [`tem1${pref}`]: cfgPreset.temps[0],
     //      // [`tem2${pref}`]: cfgPreset.temps[1],
     //      // [`tem3${pref}`]: cfgPreset.temps[2],
     // };

     // form.setFieldsValue(values);
     // };
     return (
                    <div
          style={{
          border: "1px solid #d9d9d9",   // color gris claro de Ant Design
          borderRadius: 8,
          padding: 16,
          backgroundColor: "#fafafa",    // opcional para mejor contraste
          }}
          >
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
               <Title level={5} style={{ margin: 0 }}>
                    {titulo}
               </Title>
               {/* <Button size="small" type="link" onClick={aplicarValoresSugeridos}>
                    Usar valores sugeridos
               </Button> */}
               <Button size="small" type="link" onClick={onOpenBulk}>
                    Replicar a varios
               </Button>
          </div>
          <Space direction="vertical" size={4} style={{ width: "100%" }}>
               {/* <Title level={5} style={{ margin: 0 }}>{titulo}</Title> */}
               <Form.Item label="pH" name={`ph${pref}`} {...cfg}><Input {...itemProps} /></Form.Item>
               <Form.Item label="Hora" name={`hora${pref}`} {...cfg}>
                    <TimePicker format="HH:mm" style={{ width: "100%" }} {...itemProps} />
               </Form.Item>
               <Form.Item label="Marca" name={`marca${pref}`} {...cfg}><Input {...itemProps} /></Form.Item>
               <Form.Item label="Lote" name={`lote${pref}`} {...cfg}><Input {...itemProps} /></Form.Item>
               <Form.Item label="Caducidad" name={`caducidad${pref}`} {...cfg}>
                    <DatePicker format="YYYY-MM-DD" style={{ width: "100%" }} {...itemProps} />
               </Form.Item>
               {[1, 2, 3].map(i => (
                    <Row key={i} gutter={8}>
                         <Form.Item name={`idLectura1${pref}`} hidden>
                         <Input  />
                         </Form.Item>
                         <Form.Item name={`idLectura2${pref}`} hidden>
                         <Input  />
                         </Form.Item>
                         <Form.Item name={`idLectura3${pref}`} hidden>
                         <Input  />
                         </Form.Item>
                         <Col span={12}>
                              <Form.Item label={`Lectura ${i}`} name={`lectura${i}${pref}`} {...cfg}><Input {...itemProps} /></Form.Item>
                         </Col>
                         <Col span={12}>
                              <Form.Item label={`Temp ${i} (°C)`} name={`tem${i}${pref}`} {...cfg}><Input {...itemProps} /></Form.Item>
                         </Col>
                    </Row>
               ))}
          </Space>
          </div>
     );
}

/* ---------- Componente principal ---------- */
export default function EditarCalibracionLab() {
     const [form] = Form.useForm();
     const { id, idAguas } = useParams();
     const [idMap, setIdMap] = useState({});
     const [loading, setLoading] = useState(false);
     const navigate = useNavigate();
     const [isDirty, setIsDirty] = useState(false);
     const [openBulk, setOpenBulk] = useState(false);
     const [bulkForm] = Form.useForm();

     useBeforeUnload(isDirty);
     
     useNavigationPrompt(isDirty);

     /* ---------- helper ---------- */
     const getIds = (d) => {
     const ids = {};

     // laboratorio
     ids.idCalLab = d.calibracionPhLaboratorio?.id;

     const pushPunto = (punto, pref) => {
     if (!punto) return;
     ids[`idPunto${pref}`] = punto.id;

     ids[`idCertLect1${pref}`] = punto.certificadoLectura?.id;
     ids[`idCertLect2${pref}`] = punto.certificadoLectura2?.id;
     ids[`idCertLect3${pref}`] = punto.certificadoLectura3?.id;

     ids[`idComLect1${pref}`]  = punto.comercialLectura?.id;
     ids[`idComLect2${pref}`]  = punto.comercialLectura2?.id;
     ids[`idComLect3${pref}`]  = punto.comercialLectura3?.id;
     };

     pushPunto(d.calibracionPhLaboratorio?.primerPuntoLaboratorio,  "Lab1");
     pushPunto(d.calibracionPhLaboratorio?.segundoPuntoLaboratorio, "Lab2");

     // campo
     ids.idCalCampo = d.calibracionPhCampo?.id;

     pushPunto(d.calibracionPhCampo?.primerPuntoCampo,  "Campo1");
     pushPunto(d.calibracionPhCampo?.segundoPuntoCampo, "Campo2");

     return ids;
     };


     useEffect(()=>{
     async function fetchData() {
          setLoading(true);
               try {
                    const { data } = await verificacionPhData(id);
                    const ids = getIds(data);
                    setIdMap(ids);  
                    console.log("data: ",data);
                    const getLecturas = (punto, prefijo) => {
                    if (!punto) return {};

                    const usarCertificado = ["CertLab", "CertLab2", "CertCampo", "CertCam2"].includes(prefijo);
                    const usarComercial = ["ComLab", "ComLab2", "ComCampo", "ComCamp2"].includes(prefijo);

                    if (!usarCertificado && !usarComercial) return {}; // protección

                    return {
                         [`ph${prefijo}`]: usarCertificado ? punto.certificadoPh : punto.comercialPh,
                         [`hora${prefijo}`]: dayjs(
                              usarCertificado ? punto.certificadoHora : punto.comercialHora,
                              "HH:mm"
                         ),
                         [`marca${prefijo}`]: usarCertificado ? punto.certificadoMarca : punto.comercialMarca,
                         [`lote${prefijo}`]: usarCertificado ? punto.certificadoLote : punto.comercialLote,
                         [`caducidad${prefijo}`]: dayjs(
                              usarCertificado ? punto.certificadoCaducidad : punto.comercialCaducidad
                         ),
                         [`lectura1${prefijo}`]: usarCertificado ? punto.certificadoLectura?.lectura : punto.comercialLectura?.lectura,
                         [`tem1${prefijo}`]: usarCertificado ? punto.certificadoLectura?.temperatura : punto.comercialLectura?.temperatura,
                         [`lectura2${prefijo}`]: usarCertificado ? punto.certificadoLectura2?.lectura : punto.comercialLectura2?.lectura,
                         [`tem2${prefijo}`]: usarCertificado ? punto.certificadoLectura2?.temperatura : punto.comercialLectura2?.temperatura,
                         [`lectura3${prefijo}`]: usarCertificado ? punto.certificadoLectura3?.lectura : punto.comercialLectura3?.lectura,
                         [`tem3${prefijo}`]: usarCertificado ? punto.certificadoLectura3?.temperatura : punto.comercialLectura3?.temperatura,
                         [`idLectura1${prefijo}`]: usarCertificado ? punto.certificadoLectura?.id : punto.comercialLectura?.id,
                         [`idLectura2${prefijo}`]: usarCertificado ? punto.certificadoLectura2?.id : punto.comercialLectura2?.id,
                         [`idLectura3${prefijo}`]: usarCertificado ? punto.certificadoLectura3?.id : punto.comercialLectura3?.id,
                    };
                    };

                    const values = {
                         ...getLecturas(data.calibracionPhLaboratorio?.primerPuntoLaboratorio, "CertLab"),
                         ...getLecturas(data.calibracionPhLaboratorio?.primerPuntoLaboratorio, "ComLab"),
                         ...getLecturas(data.calibracionPhLaboratorio?.segundoPuntoLaboratorio, "CertLab2"),
                         ...getLecturas(data.calibracionPhLaboratorio?.segundoPuntoLaboratorio, "ComLab2"),
                         ...getLecturas(data.calibracionPhCampo?.primerPuntoCampo, "CertCampo"),
                         ...getLecturas(data.calibracionPhCampo?.primerPuntoCampo, "ComCampo"),
                         ...getLecturas(data.calibracionPhCampo?.segundoPuntoCampo, "CertCam2"),
                         ...getLecturas(data.calibracionPhCampo?.segundoPuntoCampo, "ComCamp2"),
                         aceptacionPar1: data.calibracionPhLaboratorio?.primerPuntoLaboratorio?.asectacion,
                         aceptacionPar2: data.calibracionPhLaboratorio?.segundoPuntoLaboratorio?.asectacion,
                         aceptacionPar3: data.calibracionPhCampo?.primerPuntoCampo?.asectacion,
                         aceptacionPar4: data.calibracionPhCampo?.segundoPuntoCampo?.asectacion,
                         tiraPhUtilizada: data.calibracionPhCampo?.usoPh,
                         rangoMin: data.calibracionPhCampo?.rangoA,
                         rangoMax: data.calibracionPhCampo?.rangoB,
                         ...ids,
                    };
                    console.log("values: ",values);
                    form.setFieldsValue(values);

               } catch (err) {
                    console.error("Error al cargar los datos:", err);
                    message.error("Error al cargar los datos de verificación de pH");
               }finally {
               setLoading(false); // 👈 Finaliza loading
               }
          }

          fetchData();
     }, [id]);

     /** 1.  lista de bloques en el orden deseado */
     const bloques = [
          { pref: "CertLab", titulo: "Estándar Certificado" },
          { pref: "ComLab", titulo: "Estándar Comercial" },
          { pref: "CertLab2", titulo: "Estándar Certificado (2)" },
          { pref: "ComLab2", titulo: "Estándar Comercial (2)" },
          { pref: "CertCampo", titulo: "Estándar Certificado (Campo)" },
          { pref: "ComCampo", titulo: "Estándar Comercial (Campo)" },
          { pref: "CertCam2", titulo: "Estándar Certificado (Campo 2)" },
          { pref: "ComCamp2", titulo: "Estándar Comercial (Campo 2)" },
     ];
     const CAMPOS_REPETIBLES = [
     { key: "ph", label: "pH" },
     { key: "marca", label: "Marca" },
     { key: "lote", label: "Lote" },
     { key: "caducidad", label: "Caducidad" },
     ];
     

     const abrirBulk = () => {
     // valores iniciales por comodidad
          bulkForm.setFieldsValue({
          campos: ["ph", "marca", "lote", "caducidad"],     // cuáles campos aplicar
          bloques: bloques.map(b => b.pref),  // a qué bloques aplicar
          ph: "",
          marca: "",
          lote: "",
          caducidad: "",
          });
          setOpenBulk(true);
     };
     const aplicarBulk = async () => {
     const v = await bulkForm.validateFields();

     const patch = {};
     v.bloques.forEach((pref) => {
     v.campos.forEach((campo) => {
          // setFieldsValue requiere el nombre exacto de tu Form.Item
          patch[`${campo}${pref}`] = v[campo];
     });
     });

     form.setFieldsValue(patch);
     setIsDirty(true);
     setOpenBulk(false);
     message.success("Valores aplicados ✅");
     };

     const abrirBulkDesde = (pref) => {
     const base = form.getFieldsValue([`ph${pref}`, `marca${pref}`, `lote${pref}`, `caducidad${pref}`]);

     bulkForm.setFieldsValue({
     campos: ["ph", "marca", "lote"],
     bloques: bloques.map(b => b.pref),
     ph: base[`ph${pref}`] ?? "",
     marca: base[`marca${pref}`] ?? "",
     lote: base[`lote${pref}`] ?? "",
     caducidad: base[`caducidad${pref}`] ?? "",
     });

     setOpenBulk(true);
     };




     const confirmarEnvio = (values) => {
       Modal.confirm({
         title: "¿Estás seguro de guardar la verificación de Ph?",
         content: "Verifica que toda la información esté completa antes de continuar.",
         okText: "Sí, enviar",
         cancelText: "Cancelar",
         onOk: () => onFinish(values),  // llama a la función real de envío
       });
       };

     const onFinish = async (values) => {
          setLoading(true);
          try {
               // Crear todas las lecturas (24)
               const createLectura = async (lecturaId, lectura, temp) => {
                    const { data } = await updateLecturaVerificacion(lecturaId, { lectura, temperatura: temp });
                    return data.id;
               };

               // CertLab
               const l1 = await  createLectura(values.idLectura1CertLab, values.lectura1CertLab, values.tem1CertLab);
               const l2 = await createLectura(values.idLectura2CertLab, values.lectura2CertLab, values.tem2CertLab);
               const l3 = await createLectura(values.idLectura3CertLab, values.lectura3CertLab, values.tem3CertLab);
               
               // ComLab
               const l4 = await createLectura(values.idLectura1ComLab, values.lectura1ComLab, values.tem1ComLab);
               const l5 = await createLectura(values.idLectura2ComLab, values.lectura2ComLab, values.tem2ComLab);
               const l6 = await createLectura(values.idLectura3ComLab, values.lectura3ComLab, values.tem3ComLab);
               // CertLab2
               const l7 = await createLectura(values.idLectura1CertLab2, values.lectura1CertLab2, values.tem1CertLab2);
               const l8 = await createLectura(values.idLectura2CertLab2, values.lectura2CertLab2, values.tem2CertLab2);
               const l9 = await createLectura(values.idLectura3CertLab2, values.lectura3CertLab2, values.tem3CertLab2);
               // ComLab2
               const l10 = await createLectura(values.idLectura1ComLab2, values.lectura1ComLab2, values.tem1ComLab2);
               const l11 = await createLectura(values.idLectura2ComLab2, values.lectura2ComLab2, values.tem2ComLab2);
               const l12 = await createLectura(values.idLectura3ComLab2, values.lectura3ComLab2, values.tem3ComLab2);
               // CertCampo
               const l13 = await createLectura(values.idLectura1CertCampo, values.lectura1CertCampo, values.tem1CertCampo);
               const l14 = await createLectura(values.idLectura2CertCampo, values.lectura2CertCampo, values.tem2CertCampo);
               const l15 = await createLectura(values.idLectura3CertCampo, values.lectura3CertCampo, values.tem3CertCampo);
               // ComCampo
               const l16 = await createLectura(values.idLectura1ComCampo, values.lectura1ComCampo, values.tem1ComCampo);
               const l17 = await createLectura(values.idLectura2ComCampo, values.lectura2ComCampo, values.tem2ComCampo);
               const l18 = await createLectura(values.idLectura3ComCampo, values.lectura3ComCampo, values.tem3ComCampo);
               // CertCam2
               const l19 = await createLectura(values.idLectura1CertCam2, values.lectura1CertCam2, values.tem1CertCam2);
               const l20 = await createLectura(values.idLectura2CertCam2, values.lectura2CertCam2, values.tem2CertCam2);
               const l21 = await createLectura(values.idLectura3CertCam2, values.lectura3CertCam2, values.tem3CertCam2);
               // ComCamp2
               const l22 = await  createLectura(values.idLectura1ComCamp2, values.lectura1ComCamp2, values.tem1ComCamp2);
               const l23 = await createLectura(values.idLectura2ComCamp2, values.lectura2ComCamp2, values.tem2ComCamp2);
               const l24 = await createLectura(values.idLectura3ComCamp2, values.lectura3ComCamp2, values.tem3ComCamp2);
               // 2. Actualizar los puntos con sus respectivos IDs
               const punto1 = await updatePrimerPuntoLaboratorio(idMap.idPuntoLab1, {
                    certificadoPh: values.phCertLab,
                    certificadoHora: dayjs(values.horaCertLab).format("HH:mm"),
                    certificadoMarca: values.marcaCertLab,
                    certificadoLote: values.loteCertLab,
                    certificadoCaducidad: dayjs(values.caducidadCertLab).format("YYYY-MM-DD"),
                    certificadoLectura: l1,
                    certificadoLectura2: l2,
                    certificadoLectura3: l3,
                    comercialPh: values.phComLab,
                    comercialHora: dayjs(values.horaComLab).format("HH:mm"),
                    comercialMarca: values.marcaComLab,
                    comercialLote: values.loteComLab,
                    comercialCaducidad: dayjs(values.caducidadComLab).format("YYYY-MM-DD"),
                    comercialLectura: l4,
                    comercialLectura2: l5,
                    comercialLectura3: l6,
                    asectacion: values.aceptacionPar1
               });

               const punto2 = await updateSegundoPuntoLaboratorio(idMap.idPuntoLab2, {
                    certificadoPh: values.phCertLab2,
                    certificadoHora: dayjs(values.horaCertLab2).format("HH:mm"),
                    certificadoMarca: values.marcaCertLab2,
                    certificadoLote: values.loteCertLab2,
                    certificadoCaducidad: dayjs(values.caducidadCertLab2).format("YYYY-MM-DD"),
                    certificadoLectura: l7,
                    certificadoLectura2: l8,
                    certificadoLectura3: l9,
                    comercialPh: values.phComLab2,
                    comercialHora: dayjs(values.horaComLab2).format("HH:mm"),
                    comercialMarca: values.marcaComLab2,
                    comercialLote: values.loteComLab2,
                    comercialCaducidad: dayjs(values.caducidadComLab2).format("YYYY-MM-DD"),
                    comercialLectura: l10,
                    comercialLectura2: l11,
                    comercialLectura3: l12,
                    asectacion: values.aceptacionPar2
               });


               const punto3 = await updatePrimerPuntoCampo(idMap.idPuntoCampo1,{
                    certificadoPh: values.phCertCampo,
                    certificadoHora: dayjs(values.horaCertCampo).format("HH:mm"),
                    certificadoMarca: values.marcaCertCampo,
                    certificadoLote: values.loteCertCampo,
                    certificadoCaducidad: dayjs(values.caducidadCertCampo).format("YYYY-MM-DD"),
                    certificadoLectura: l13,
                    certificadoLectura2: l14,
                    certificadoLectura3: l15,
                    comercialPh: values.phComCampo,
                    comercialHora: dayjs(values.horaComCampo).format("HH:mm"),
                    comercialMarca: values.marcaComCampo,
                    comercialLote: values.loteComCampo,
                    comercialCaducidad: dayjs(values.caducidadComCampo).format("YYYY-MM-DD"),
                    comercialLectura: l16,
                    comercialLectura2: l17,
                    comercialLectura3: l18,
                    asectacion: values.aceptacionPar3
               });

               const punto4 = await updateSegundoPuntoCampo(idMap.idPuntoCampo2,{
                    certificadoPh: values.phCertCam2,
                    certificadoHora: dayjs(values.horaCertCam2).format("HH:mm"),
                    certificadoMarca: values.marcaCertCam2,
                    certificadoLote: values.loteCertCam2,
                    certificadoCaducidad: dayjs(values.caducidadCertCam2).format("YYYY-MM-DD"),
                    certificadoLectura: l19,
                    certificadoLectura2: l20,
                    certificadoLectura3: l21,
                    comercialPh: values.phComCamp2,
                    comercialHora: dayjs(values.horaComCamp2).format("HH:mm"),
                    comercialMarca: values.marcaComCam2,
                    comercialLote: values.loteComCamp2,
                    comercialCaducidad: dayjs(values.caducidadComCamp2).format("YYYY-MM-DD"),
                    comercialLectura: l22,
                    comercialLectura2: l23,
                    comercialLectura3: l24,
                    asectacion: values.aceptacionPar4
               });
       
               // 3. Actualizar agrupadores laboratorio/campo con sus IDs
               // await updateCalibraionPhLaboratorio({
               //      id: idMap.idCalLab,
               //      primerPuntoLaboratorio: punto1.data.id,
               //      segundoPuntoLaboratorio: punto2.data.id
               // });

               await updateCalibracionPhCampo(idMap.idCalCampo,{
                    usoPh: values.tiraPhUtilizada,
                    rangoA: values.rangoMin,
                    rangoB: values.rangoMax
               });

               message.success("Formulario de pH guardado correctamente ✅");
          } catch (error) {
               console.error(error);
               message.error("Hubo un error al guardar los datos");
          } finally {
               setLoading(false);
               setIsDirty(false);
               setTimeout(() => {
                    navigate(`/DetallesAguasResiduales/${idAguas}`); // regresar a la página anterior
               }, 1000);

          }
     }
     /** 2.  divide en pares → [[b0,b1], [b2,b3], ...] */
     const pares = [];
     for (let i = 0; i < bloques.length; i += 2) {
          pares.push(bloques.slice(i, i + 2));
     }

     // Agrupa cada 2 pares (4 bloques) en un grupo
     const paresEnFila = [];
     for (let j = 0; j < pares.length; j += 2) {
          paresEnFila.push(pares.slice(j, j + 2));
     }

return (
     <>
     <Card
          title="Calibración y Verificación de Ph"
          bordered={false}
          style={{ background: "#f5f7fa" }}
     >
          {loading ?(
               <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: 200 }}>
                    <Spin tip="Cargando datos..." />
               </div>
          ):(
          <Form
               form={form}
               layout="vertical"
               onFinish={confirmarEnvio}
               onValuesChange={()=> setIsDirty(true)}
               scrollToFirstError
          >
          {Object.keys(idMap).map((name) => (
          <Form.Item key={name} name={name} hidden>
          <Input />                       {/* importa Input de 'antd' */}
          </Form.Item>
          ))}
          <Space style={{ marginBottom: 12 }}>
          <Button onClick={abrirBulk}>
          Aplicar pH / Marca / Lote a varios / Caducidad
          </Button>
          </Space>


               <Collapse
                    // accordion
                    bordered={false}
                    style={{ background: "transparent" }}
                    expandIconPosition="end"
                    defaultActiveKey={paresEnFila.map((_, idx)=> idx)}
               >
                    {paresEnFila.map((fila, filaIdx) => (
                         <Panel
                         header={
                         <div style={{ 
                         padding: '20px 24px',
                         background: '#ffffff',
                         boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                         borderRadius: '12px 12px 0 0',
                         border: '1px solid #f0f0f0',
                         borderBottom: 'none'
                         }}>
                         <Title level={4} style={{ 
                              margin: '0 0 16px 0', 
                              color: '#1890ff',
                              fontSize: '18px',
                              fontWeight: 600,
                              letterSpacing: '-0.02em'
                         }}>
                              {filaIdx === 0
                              ? "🔬 Calibración y Verificación en laboratorio"
                              : "🌱 Calibración y Verificación en campo"}
                         </Title>
                         
                         <div style={{
                              padding: '16px 20px',
                              backgroundColor: '#f6ffed',
                              border: '1px solid #b7eb8f',
                              borderRadius: '8px',
                              position: 'relative'
                         }}>
                              <div style={{
                              position: 'absolute',
                              left: '20px',
                              top: '16px',
                              width: '4px',
                              height: '20px',
                              backgroundColor: '#52c41a',
                              borderRadius: '2px'
                              }}></div>
                              <p style={{ 
                              margin: 0, 
                              paddingLeft: '20px',
                              fontSize: '13px', 
                              color: '#389e0d',
                              lineHeight: '1.6',
                              fontWeight: 500
                              }}>
                              <strong style={{ color: '#237804' }}>💡 Nota importante:</strong><br/>
                              {filaIdx === 0
                                   ? "Se debe calibrar a dos puntos, ejemplo: 7.00 - 4.00 o 7.00 - 10.00 ya calibrado el equipo a dos puntos se deben realizar la comprobación"
                                   : "Antes de realizar la Calibración / Verificación se debe utilizar la tira indicadora de PH para estimar el valor de PH de la muestra y poder seleccionar el rango a Calibrar / Verificar"}
                              </p>
                         </div>
                         </div>
                         }
                              key={filaIdx}
                              style={{
                                   background: "#fff",
                                   borderRadius: 8,
                                   marginBottom: 16,
                                   border: "1px solid #e6e6e6",
                                   boxShadow: "0 2px 8px #f0f1f2"
                              }}
                         >
                              <Row gutter={[16, 24]}>
                                   {/* Solo en el segundo punto de campo */}
                                   {filaIdx === 1 &&  (
                                        <Col span={24} >
                                        <div style={{
                                             padding: '12px 16px',
                                             border: '1px solid #f0f0f0',
                                             borderRadius: 8,
                                             background: '#fff',
                                        }}
                                        >
                                        <Space
                                             align="center"
                                             size={16}
                                             wrap
                                             style={{ width: '100%', justifyContent: 'center' }}  // ⬅️ CENTRA
                                        >
                                             <Form.Item
                                                  label="¿Se utilizó la tira pH?"
                                                  name="tiraPhUtilizada"
                                                  style={{ margin: "16px 0 8px" }}
                                             >
                                                  <Radio.Group size="small">
                                                       <Radio value={true}>Sí</Radio>
                                                       <Radio value={false}>No</Radio>
                                                  </Radio.Group>
                                             </Form.Item>
                                             <Form.Item
                                                  label="Rango a calibrar"
                                                  style={{ margin: "8px 0 24px" }}
                                             >
                                                  <Input.Group compact>
                                                       <Form.Item
                                                            name="rangoMin"
                                                            noStyle
                                                       >
                                                            <Input style={{ width: 100 }} placeholder="Mínimo" />
                                                       </Form.Item>
                                                       <span style={{ margin: "0 8px" }}>a</span>
                                                       <Form.Item
                                                            name="rangoMax"
                                                            noStyle
                                                       >
                                                            <Input style={{ width: 100 }} placeholder="Máximo" />
                                                       </Form.Item>
                                                  </Input.Group>
                                             </Form.Item>
                                             </Space>
                                        </div>
                                        </Col>
                                   )}
                                   {fila.map((par, parIdx) => (
                                        <Col key={parIdx} xs={24} sm={24} md={12} lg={12}>
                                             {/* --- los dos bloques --- */}
                                             <Row gutter={16}>
                                                  {par.map(b => (
                                                       <Col key={b.pref} xs={24} sm={24} lg={12}>
                                                            <BloqueEstandar pref={b.pref} titulo={b.titulo} form={form} onOpenBulk={() => abrirBulkDesde(b.pref)}/>
                                                       </Col>
                                                  ))}
                                             </Row>
                                             {/* --- radio del par --- */}
                                             <div 
                                                  style={{
                                                  border: "1px dashed #d9d9d9",
                                                  borderRadius: 10,
                                                  padding: 12,
                                                  backgroundColor: "#fcfcfc",
                                                  marginTop: 12,
                                                  }}
                                             >
                                                  <Space direction="vertical" size={12} style={{ width: "100%" }}>
                                                  <div style={{
                                                  background: '#f9f9f9',
                                                  borderRadius: '8px',
                                                  padding: '12px',
                                                  border: '1px solid #e8e8e8'
                                                  }}>
                                                  <div style={{
                                                       fontSize: '13px',
                                                       fontWeight: 600,
                                                       color: '#595959',
                                                       marginBottom: '8px',
                                                       display: 'flex',
                                                       alignItems: 'center',
                                                       gap: '6px'
                                                  }}>
                                                       📋 Criterios de Aceptación
                                                  </div>
                                                  
                                                  <Space direction="vertical" size={6} style={{ width: "100%" }}>
                                                       <div style={{
                                                       padding: '8px 12px',
                                                       background: '#fff0f6',
                                                       border: '1px solid #ffadd6',
                                                       borderRadius: '6px',
                                                       fontSize: '12px',
                                                       lineHeight: '1.4'
                                                       }}>
                                                       <span style={{ fontWeight: 600, color: '#c41d7f' }}>Criterio de aceptación:</span> ± 0.05 UpH del valor nominal del Estándar
                                                       </div>
                                                       
                                                       <div style={{
                                                       padding: '8px 12px',
                                                       background: '#fff2f0',
                                                       border: '1px solid #ffccc7',
                                                       borderRadius: '6px',
                                                       fontSize: '12px',
                                                       lineHeight: '1.4'
                                                       }}>
                                                       <span style={{ fontWeight: 600, color: '#cf1322' }}>Criterio de aceptación:</span> ± 0.03 UpH entre lecturas independientes
                                                       </div>
                                                  </Space>
                                                  </div>
                                                  
                                                  <Alert
                                                  type="info"
                                                  showIcon
                                                  message="Verificación importante"
                                                  description="Confirma que todas las lecturas cumplan con las tolerancias antes de proceder."
                                                  style={{
                                                       fontSize: '13px',
                                                       borderRadius: '8px'
                                                  }}
                                                  />
                                             <Form.Item
                                                  label="¿Aceptado?"
                                                  name={`aceptacionPar${filaIdx * 2 + parIdx + 1}`}
                                                  style={{ margin: "16px 0 24px" }}
                                             >
                                                  <Radio.Group size="small">
                                                       <Radio value={true}>Sí</Radio>
                                                       <Radio value={false}>No</Radio>
                                                  </Radio.Group>
                                             </Form.Item>
                                             </Space>
                                             </div>
                                             {/* Solo en el segundo punto de campo */}
                                             {/* {filaIdx === 1 && parIdx === 1 && (
                                                  <>
                                                       <Form.Item
                                                            label="¿Se utilizó la tira pH?"
                                                            name="tiraPhUtilizada"
                                                            style={{ margin: "16px 0 8px" }}
                                                       >
                                                            <Radio.Group size="small">
                                                                 <Radio value={true}>Sí</Radio>
                                                                 <Radio value={false}>No</Radio>
                                                            </Radio.Group>
                                                       </Form.Item>
                                                       <Form.Item
                                                            label="Rango a calibrar"
                                                            style={{ margin: "8px 0 24px" }}
                                                       >
                                                            <Input.Group compact>
                                                                 <Form.Item
                                                                      name="rangoMin"
                                                                      noStyle
                                                                 >
                                                                      <Input style={{ width: 100 }} placeholder="Mínimo" />
                                                                 </Form.Item>
                                                                 <span style={{ margin: "0 8px" }}>a</span>
                                                                 <Form.Item
                                                                      name="rangoMax"
                                                                      noStyle
                                                                 >
                                                                      <Input style={{ width: 100 }} placeholder="Máximo" />
                                                                 </Form.Item>
                                                            </Input.Group>
                                                       </Form.Item>
                                                  </>
                                             )} */}
                                        </Col>
                                   ))}
                              </Row>
                         </Panel>
                    ))}
               </Collapse>
               <div style={{ textAlign: "right", marginTop: 24 }}>
                    <Button type="primary" htmlType="submit" size="large">
                         Guardar
                    </Button>
               </div>
          </Form>
          )}
     </Card>
     {/* Modal para entrada masiva */}
     <Modal
     open={openBulk}
     title="Aplicar valores repetidos"
     onCancel={() => setOpenBulk(false)}
     onOk={aplicarBulk}
     okText="Aplicar"
     cancelText="Cancelar"
     >
     <Form form={bulkForm} layout="vertical">
     <Row gutter={12}>
          <Col span={8}>
          <Form.Item name="ph" label="pH">
               <Input placeholder="Ej. 7.00" />
          </Form.Item>
          </Col>
          <Col span={8}>
          <Form.Item name="marca" label="Marca">
               <Input placeholder="Ej. Control Company" />
          </Form.Item>
          </Col>
          <Col span={8}>
          <Form.Item name="lote" label="Lote">
               <Input placeholder="Ej. CC805972" />
          </Form.Item>
          </Col>
          <Col span={8}>
               <Form.Item label="Caducidad" name="caducidad" >
                    <DatePicker format="YYYY-MM-DD"/>
               </Form.Item>
          </Col>
     </Row>

     <Form.Item
          name="campos"
          label="¿Qué campos quieres aplicar?"
          rules={[{ required: true, message: "Selecciona al menos un campo" }]}
     >
          <Checkbox.Group
          options={CAMPOS_REPETIBLES.map(c => ({ label: c.label, value: c.key }))}
          />
     </Form.Item>

     <Form.Item
          name="bloques"
          label="¿En qué bloques se aplicarán?"
          rules={[{ required: true, message: "Selecciona al menos un bloque" }]}
     >
          <Checkbox.Group
          style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}
          options={bloques.map(b => ({ label: b.titulo, value: b.pref }))}
          />
     </Form.Item>
     </Form>
     </Modal>
</>
);
}
