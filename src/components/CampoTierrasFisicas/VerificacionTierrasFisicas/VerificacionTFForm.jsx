import React, { use, useEffect, useState } from "react";
import {
  Form,
  Input,
  Button,
  Card,
  Row,
  Col,
  DatePicker,
  message,
  Typography,
} from "antd";

import {
  CheckCircleOutlined,
  SaveOutlined,
} from "@ant-design/icons";

import dayjs from "dayjs";

import { useParams, useNavigate } from "react-router-dom";

import {
  createVerificacionTF,
  getExistsVerificacionTF,
  updateVerificacionTF,
} from "../../../apis/ApiCampo/TierrasFisicasApi";

import ModalExito from "../ModalTierrasFisicas/ModalCreacion";
import SkeletonAvatar from "antd/es/skeleton/Avatar";

const { Title } = Typography;

const VerificacionTFForm = () => {
  const [form] = Form.useForm();

  const { id } = useParams();

  const [isEdit, setIsEdit] = useState(false);
  const [loading, setLoading] = useState(false);
  const [verificacionId, setVerificacionId] = useState(null);

  const [modalOpen, setModalOpen] = useState(false);

  const navigate = useNavigate();

  const esxistsVerificacion = async () => {
    try {
      setLoading(true);

      const response = await getExistsVerificacionTF(id);

      console.log("response ", response);

      if (response.data.exists) {
        setIsEdit(true);

        setVerificacionId(response.data.id);

        form.setFieldsValue({
          valorInicial: response.data.valorInicial,
          valorFinal: response.data.valorFinal,
          limiteInferior: response.data.limiteInferior,
          limiteSuperior: response.data.limiteSuperior,
          fechaCalibracion: response.data.fechaCalibracion
            ? dayjs(response.data.fechaCalibracion)
            : null,
        });
      }
    } catch (error) {
      console.log(error);
      message.error("Error al consultar verificación");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    esxistsVerificacion();
  }, []);

  const onFinish = async (values) => {
    try {
      const payload = {
        valorInicial: values.valorInicial,
        valorFinal: values.valorFinal,
        limiteInferior: values.limiteInferior,
        limiteSuperior: values.limiteSuperior,
        fechaCalibracion:
          values.fechaCalibracion?.format("YYYY-MM-DD"),
        tierraFisica: id,
      };

      console.log(payload);

      if (isEdit) {
        await updateVerificacionTF(verificacionId, payload);

        message.success(
          "Verificación actualizada correctamente"
        );
      } else {
        await createVerificacionTF(payload);

        message.success(
          "Verificación creada correctamente"
        );
      }

      setModalOpen(true);

      setTimeout(() => {
        navigate(`/DetallesTierrasFisicas/${id}`);
      }, 1000);

    } catch (error) {
      console.log(error);

      message.error("Error al guardar");
    }
  };

  return (
    <>
      <Card 
        style={{ maxWidth: 1000, margin: '0 auto' }}
        bodyStyle={{ padding: '32px' }}
      >
        {/* Header */}
        <div style={{ marginBottom: 32 }}>
          <Title level={3} style={{ marginBottom: 8 }}>
            {isEdit ? '✏️ Editar Verificación' : '➕ Nueva Verificación'}
          </Title>
          <p style={{ color: '#666', margin: 0 }}>
            Ingresa los valores de calibración y rango de validación
          </p>
        </div>

      <Form
        layout="vertical"
        form={form}
        onFinish={onFinish}
        autoComplete="off"
      >

        {/* SECCIÓN 1: Valores Medidos */}
          <div style={{ marginBottom: 32 }}>
            <h4 style={{ 
              fontSize: 14, 
              fontWeight: 600, 
              textTransform: 'uppercase',
              color: '#1890ff',
              letterSpacing: 0.5,
              marginBottom: 16
            }}>
              📊 Valores Medidos
            </h4>
            
            <Row gutter={[24, 0]}>
              <Col xs={24} sm={12}>
                <Form.Item
                  label="Valor Inicial"
                  name="valorInicial"
                  rules={[
                    { required: true, message: 'Este campo es obligatorio' },
                    { 
                      pattern: /^-?\d+(\.\d{1,4})?$/, 
                      message: 'Ingresa un valor numérico válido' 
                    },
                  ]}
                  tooltip="El valor inicial de la medición"
                >
                  <Input 
                    type="number"
                    placeholder="Ej: 100.50"
                    step="0.01"
                    size="large"
                  />
                </Form.Item>
              </Col>
 
              <Col xs={24} sm={12}>
                <Form.Item
                  label="Valor Final"
                  name="valorFinal"
                  rules={[
                    { required: true, message: 'Este campo es obligatorio' },
                    { 
                      pattern: /^-?\d+(\.\d{1,4})?$/, 
                      message: 'Ingresa un valor numérico válido' 
                    },
                    // { validator: validateValorRange }
                  ]}
                  tooltip="Debe ser mayor que el Valor Inicial"
                >
                  <Input 
                    type="number"
                    placeholder="Ej: 150.75"
                    step="0.01"
                    size="large"
                  />
                </Form.Item>
              </Col>
            </Row>
          </div>

          <div style={{ marginBottom: 32 }}>
            <h4 style={{ 
              fontSize: 14, 
              fontWeight: 600, 
              textTransform: 'uppercase',
              color: '#52c41a',
              letterSpacing: 0.5,
              marginBottom: 16
            }}>
              🎯 Rangos de Validación
            </h4>
            
            <Row gutter={[24, 0]}>
              <Col xs={24} sm={12}>
                <Form.Item
                  label="Límite Inferior"
                  name="limiteInferior"
                  rules={[
                    { required: true, message: 'Este campo es obligatorio' },
                    { 
                      pattern: /^-?\d+(\.\d{1,4})?$/, 
                      message: 'Ingresa un valor numérico válido' 
                    },
                  ]}
                  tooltip="Valor mínimo aceptable"
                >
                  <Input 
                    type="number"
                    placeholder="Ej: 80.00"
                    step="0.01"
                    size="large"
                  />
                </Form.Item>
              </Col>

              <Col xs={24} sm={12}>
                <Form.Item
                  label="Límite Superior"
                  name="limiteSuperior"
                  rules={[
                    { required: true, message: 'Este campo es obligatorio' },
                    { 
                      pattern: /^-?\d+(\.\d{1,4})?$/, 
                      message: 'Ingresa un valor numérico válido' 
                    },
                    // { validator: validateLimiteRange }
                  ]}
                  tooltip="Valor máximo aceptable. Debe ser mayor que el Límite Inferior"
                >
                  <Input 
                    type="number"
                    placeholder="Ej: 200.00"
                    step="0.01"
                    size="large"
                  />
                </Form.Item>
              </Col>
            </Row>
          </div>

          {/* SECCIÓN 3: Calibración */}
          <div style={{ marginBottom: 32 }}>
            <h4 style={{ 
              fontSize: 14, 
              fontWeight: 600, 
              textTransform: 'uppercase',
              color: '#faad14',
              letterSpacing: 0.5,
              marginBottom: 16
            }}>
              📅 Calibración
            </h4>
            
            <Row gutter={[24, 0]}>
              <Col xs={24} sm={12}>
                <Form.Item
                  label="Fecha de Calibración"
                  name="fechaCalibracion"
                  rules={[
                    { required: true, message: 'Este campo es obligatorio' },
                  ]}
                  tooltip="Fecha en que se realizó la calibración"
                >
                  <DatePicker 
                    style={{ width: '100%' }}
                    size="large"
                    format="DD/MM/YYYY"
                    // disabledDate={(current) => {
                    //   // No permitir fechas futuras
                    //   return current && current > dayjs().endOf('day');
                    // }}
                  />
                </Form.Item>
              </Col>
            </Row>
          </div>


        <Button
          icon= { isEdit ? <CheckCircleOutlined/> : <SaveOutlined/>}
          type="primary"
          htmlType="submit"
          loading={loading}
        >
          {isEdit ? "Actualizar" : "Guardar"}
        </Button>
      </Form>
    </Card>
    <ModalExito
    visible={modalOpen}
    onClose={() => setModalOpen(false)}/>
    </>
    
  );
};

export default VerificacionTFForm;