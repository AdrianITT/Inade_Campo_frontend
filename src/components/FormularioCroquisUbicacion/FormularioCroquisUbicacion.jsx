import React, { useRef, useState } from "react";
// import "./FormularioCroquisUbicacion.css";
import {
  Form,
  Input,
  DatePicker,
  Button,
  Row,
  Col,
  Collapse,
  message,
  Upload
} from "antd";
import { updateCroquisUbicacion } from "../../apis/ApiCampo/CroquisUbicacion";
import { LoadingOutlined, PlusOutlined } from '@ant-design/icons';
import ImageEditorModal from "./ImageEditorModal";

const { Panel } = Collapse;

const FormularioCroquisUbicacion = () => {
  const [form] = Form.useForm();
  const [activePanelKey, setActivePanelKey] = useState("1");
  const [loading, setLoading] = useState(false);
  const [imageUrl, setImageUrl] = useState(null);
  const punto1Ref = useRef(null);
  const [editorVisible, setEditorVisible] = useState(false);
  const [tempImage, setTempImage] = useState(null); // imagen sin editar


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
    getBase64(info.file.originFileObj, (url) => {
      setTempImage(url); // guarda imagen original
      setEditorVisible(true); // abre editor
      setLoading(false);
    });
  }
};


  const uploadButton = (
    <div>
      {loading ? <LoadingOutlined /> : <PlusOutlined />}
      <div style={{ marginTop: 8 }}>Subir</div>
    </div>
  );

     const onFinish = async (values) => {
     try {
     let webpImage = null;
     if (imageUrl) {
          webpImage = await convertirBase64AWebp(imageUrl);
     }

     const payload = {
          ...values,
          croquisWebp: webpImage, // imagen en base64.webp
     };

     console.log("Datos del formulario con imagen WebP:", payload);

     // Aquí puedes hacer la petición al backend, por ejemplo:
     // await axios.post('/api/tu-endpoint', payload);

     message.success("Formulario enviado correctamente.");
     } catch (error) {
     console.error(error);
     message.error("Error al enviar el formulario.");
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

  return (
    <Form
      layout="vertical"
      form={form}
      onFinish={onFinish}
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
                <Button 
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
                </Button>
              </Col>
            </Row>
          </div>

          <Form.Item label="Nombre de la Empresa" name="nombreEmpresa">
            <Input placeholder="Nombre de la empresa" />
          </Form.Item>

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
          onSave={(editedBase64) => {
          setImageUrl(editedBase64); // guarda imagen editada
          setEditorVisible(false);
          message.success("Imagen editada correctamente.");
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

      {/* <Form.Item>
        <Button type="primary" htmlType="submit">
          Enviar
        </Button>
      </Form.Item> */}
    </Form>
  );
};

export default FormularioCroquisUbicacion;
