import React, { useRef, useState, useEffect } from "react";
// import "./EditarCroquisUbicacion.css";
import {
  Form,
  Input,
  DatePicker,
  Button,
  Row,
  Col,
  Collapse,
  message,
  Upload, 
  Modal
} from "antd";
import { getCroquisUbicacionById, updateCroquisUbicacion } from "../../../apis/ApiCampo/CroquisUbicacion";
import { ControlOutlined, LoadingOutlined, PlusOutlined } from '@ant-design/icons';
import ImageEditorModal from "./ImageEditorModal";
import { useParams, useNavigate } from "react-router-dom";

const { Panel } = Collapse;

const EditarCroquisUbicacion = () => {
  const [form] = Form.useForm();
  const {id, idAguas} = useParams();
  const [activePanelKey, setActivePanelKey] = useState("1");
  const [loading, setLoading] = useState(false);
  const [imageUrl, setImageUrl] = useState(null);
  const punto1Ref = useRef(null);
  const [editorVisible, setEditorVisible] = useState(false);
  const [tempImage, setTempImage] = useState(null); // imagen sin editar
  const [fileObj, setFileObj] = useState(null);
  const navigate = useNavigate();

     useEffect(() => {
      setLoading(true);
     const fetchData = async () => {
     try {
          const croquisData = await getCroquisUbicacionById(id); // 👈 trae el croquis usando el ID del informe
          console.log("Croquis data:", croquisData);
          const croquis = croquisData[0]; // si es array
          console.log("Croquis:", croquis);
          form.setFieldsValue({
          domicilioUbicacion: croquisData.data.domicilio || "",
          comentarios: croquisData.data.comentario || ""
          });
          setImageUrl(croquisData.data.croquis); // 👈 para mostrar la imagen en el formulario
          setFileObj(null); // como ya hay imagen, aún no hay un archivo nuevo
     } catch (err) {
          console.error("Error al obtener el croquis:", err);
          message.error("No se pudo cargar el croquis existente.");
     }finally{
      setLoading(false);
     }
     };

     fetchData();
     }, [id]);
  // Para convertir la imagen en base64 (opcional si quieres mostrarla en vista previa)
  const getBase64 = (img, callback) => {
    const reader = new FileReader();
    reader.addEventListener('load', () => callback(reader.result));
    reader.readAsDataURL(img);
  };

  const convertirBase64AWebp = (base64Original) => {
  return new Promise((resolve) => {
     const img = new Image();
     img.crossOrigin = "anonymous";
     img.onload = () => {
          const canvas = document.createElement("canvas");
          canvas.width = img.width;
          canvas.height = img.height;

          const ctx = canvas.getContext("2d");
          ctx.drawImage(img, 0, 0);

          const webpBase64 = canvas.toDataURL("image/webp", 0.9);
          resolve(webpBase64);
     };
     img.src = base64Original;
     });
     };

  const beforeUpload = (file) => {
    const isImage = file.type.startsWith('image/');
    if (!isImage) {
      message.error('Solo se pueden subir imágenes');
    }
    const isLt2M = file.size / 1024 / 1024 < 2;
    if (!isLt2M) {
      message.error('La imagen debe ser menor a 2MB');
    }
    return isImage && isLt2M;
  };

const handleChange = info => {
  if (info.file.status === 'uploading') {
    setLoading(true);
    return;
  }

  if (info.file.originFileObj) {
    // 1️⃣  Guarda el File para después
    setFileObj(info.file.originFileObj);

    // 2️⃣  Genera una mini-preview (thumbUrl) para mostrar
    setImageUrl(info.file.thumbUrl || URL.createObjectURL(info.file.originFileObj));

    // 3️⃣  Si quieres abrir el editor con la imagen original en base64
    getBase64(info.file.originFileObj, (url) => {
      setTempImage(url);
      setEditorVisible(true);
      setLoading(false);
    });
  }
};

  const confirmarEnvio = () => {
    Modal.confirm({
      title: "¿Estás seguro de enviar el formulario?",
      content: "Verifica que toda la información esté correcta antes de enviarla.",
      okText: "Sí, enviar",
      cancelText: "Cancelar",
      onOk: async () => {
        setLoading(true);
        try {
          const values = await form.validateFields(); // 🔍 valida los campos primero
          await onFinish(values); // 🧠 llama a la función original
          navigate(`/DetallesAguasResiduales/${idAguas}`); // 🚀 redirige
        } catch (err) {
          message.error("Error al validar el formulario.");
          console.error(err);
        }finally{
          setLoading(false);
        }
      },
    });
  };


  const uploadButton = (
    <div>
      {loading ? <LoadingOutlined /> : <PlusOutlined />}
      <div style={{ marginTop: 8 }}>Subir</div>
    </div>
  );

const onFinish = async (values) => {
  setLoading(true);
  try {
    const fd = new FormData();
    fd.append('domicilio', values.domicilioUbicacion);
    fd.append('comentario', values.comentarios || '');

    // ✅ Importante: adjuntamos el archivo
    if (fileObj) fd.append('croquis', fileObj);
    console.log("Datos del formulario:", fd);
    await updateCroquisUbicacion(id, fd);
    message.success('Formulario enviado correctamente');
  } catch (err) {
    console.error(err);
    message.error('Error al enviar el formulario');
  }finally{
    setLoading(false);
  }
};



  const enviarSeccion = async (punto) => {
    const values = await form.getFieldsValue();
    console.log("Imagen subida:", imageUrl); // aquí podrías enviar la imagen si la tienes en base64
    // await updateCroquisUbicacion
    const data = {
      punto,
      ...values
    };
    try {
      switch (punto) {
        case 'punto1':
          console.log("API punto 1", data);
          break;
        default:
          break;
      }
      message.success(`Datos de ${punto} enviados correctamente.`);
    } catch (err) {
      message.error("Error al enviar los datos");
    }
  };
  function base64ToFile(b64, filename) {
  const arr = b64.split(',');
  const mime = arr[0].match(/:(.*?);/)[1];
  const binary = atob(arr[1]);
  const len = binary.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) bytes[i] = binary.charCodeAt(i);
  return new File([bytes], filename, { type: mime });
}

  return (
    <Form
      layout="vertical"
      form={form}
      // onFinish={onFinish}
      style={{ maxWidth: 800, margin: "0 auto" }}
    >
      <Collapse 
        activeKey={activePanelKey}
        onChange={(key) => setActivePanelKey(key)}
      >
        <Panel header="Punto 1 - Datos del Sitio de Muestreo" key="1" >
          <div ref={punto1Ref} className="panel-header-sticky">
            <Row justify="space-between" align="middle">
              <Col>
                <h3 style={{ margin: 0 }}>Punto 1 - Datos del Sitio de Muestreo</h3>
              </Col>
              <Col>
                {/* <Button 
                  type="primary" 
                  onClick={(e) => {
                    e.stopPropagation(); 
                    enviarSeccion('punto1'); 
                    setActivePanelKey(null);
                    setTimeout(() => {
                      const top = punto1Ref.current?.getBoundingClientRect().top + window.scrollY - 100;
                      window.scrollTo({ top, behavior: 'smooth' });
                    }, 200);
                  }}
                >
                  Guardar
                </Button> */}
              </Col>
            </Row>
          </div>

          {/* <Form.Item label="Nombre de la Empresa" name="nombreEmpresa">
            <Input placeholder="Nombre de la empresa" />
          </Form.Item> */}

          <Form.Item label="Domicilio / Ubicación Física" name="domicilioUbicacion">
            <Input.TextArea placeholder="Dirección del sitio" rows={2} />
          </Form.Item>

          <Form.Item label="Croquis de Ubicación" name="croquis">
            <Upload
              name="croquis"
              listType="picture-card"
              showUploadList={false}
              beforeUpload={beforeUpload}
              onChange={handleChange}
              customRequest={({ file, onSuccess }) => {
                setTimeout(() => {
                  onSuccess("ok"); // simula una subida exitosa
                }, 500);
              }}
            >
              {imageUrl ? <img src={imageUrl} alt="croquis" style={{ width: '100%' }} /> : uploadButton}
            </Upload>
          </Form.Item>
          <ImageEditorModal
          visible={editorVisible}
          imageSrc={tempImage}
          onSave={(editedB64) => {
            // 1️⃣  Convierte el base64 editado en File
            const editedFile = base64ToFile(editedB64, 'croquis.webp');

            // 2️⃣  Actualiza el estado
            setFileObj(editedFile);
            setImageUrl(editedB64);       // solo para seguir mostrando preview
            setEditorVisible(false);
            message.success('Imagen editada correctamente');
          }}
          onCancel={() => {
          setEditorVisible(false);
          message.warning("Edición cancelada.");
          }}
          />
          <Form.Item label="Comentarios:" name="comentarios">
            <Input.TextArea placeholder="Comentarios" rows={2} />
          </Form.Item>


        </Panel>
      </Collapse>

      <Form.Item>
        <Button type="primary" onClick={confirmarEnvio}>
          Enviar
        </Button>
      </Form.Item>
    </Form>
  );
};

export default EditarCroquisUbicacion;
