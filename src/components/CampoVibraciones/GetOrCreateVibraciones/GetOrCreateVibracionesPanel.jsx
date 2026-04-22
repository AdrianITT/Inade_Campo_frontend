import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Input,
  Typography,
  Card,
  Space,
  Row,
  Col,
  Divider,
  Flex,
  message,
  ConfigProvider,
} from "antd";
import { SearchOutlined, PlusCircleOutlined, FileSearchOutlined } from "@ant-design/icons";
import {
  DataModalVibraciones,
  ModalVibracionesOT,
} from "./ModalGetOrCreateVibraciones";
import { searchOTDataVibraciones, getRegistroVibracionesPorOT } from "../hook/stateOTVibraciones";
import {
  existeOTparaVibraciones,
  createVibracionesCampo,
} from "../../../apis/ApiCampo/ApiVibraciones";

const { Search } = Input;
const { Title, Text } = Typography;

function GetOrCreateVibracionesPanel() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isModalOpenSearch, setIsModalOpenSearch] = useState(false);
  const [vibracionData, setVibracionData] = useState(null);
  const [otData, setOtData] = useState(null);
  const [otCodeCreate, setOtCodeCreate] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const navigate = useNavigate();

  const showModal = async (value) => {
    if (!value?.trim()) {
      message.warning("Ingresa un código de OT válido");
      return;
    }
    try {
      setIsSearching(true);
      const t = await searchOTDataVibraciones(value.trim());
      setOtData(t);
      setIsModalOpen(true);
    } catch (error) {
      message.error("No se pudo obtener la información de la OT");
    } finally {
      setIsSearching(false);
    }
  };

  const handleOk = async (values) => {
    try {
      if (!otData?.ot?.orden_trabajo_id) {
        message.error("OT no válida");
        setIsModalOpen(false);
        return;
      }

      const responseOk = await existeOTparaVibraciones(otData.ot.orden_trabajo_id);
      
      if (!responseOk.data.ok) {
        message.warning("Ya existe un registro de vibraciones para esta OT");
        setIsModalOpen(false);
        return;
      }

      const data = {
        OrdenTrabajo: otData.ot.orden_trabajo_id,
        fecha: values,
      };

      const r = await createVibracionesCampo(data);
      message.success("Registro creado exitosamente");
      
      setTimeout(() => {
        navigate(`/DetallesVibracion/${r.data.id}`);
      }, 400);
      
    } catch (error) {
      console.error("Error al crear:", error);
      message.error("No se pudo crear el registro de vibraciones");
      setIsModalOpen(false);
    }
  };

  const handleCancel = () => setIsModalOpen(false);

  const showModalVibraciones = async (value) => {
    if (!value?.trim()) {
      message.warning("Ingresa un código de OT válido");
      return;
    }
    try {
      setIsSearching(true);
      const t = await getRegistroVibracionesPorOT(value.trim());
      setVibracionData(t);
      setIsModalOpenSearch(true);
    } catch (error) {
      message.error("No se encontraron registros para esta OT");
    } finally {
      setIsSearching(false);
    }
  };

  const handleOkSearch = () => {
    setIsModalOpenSearch(false);
    const id = vibracionData?.data?.vibracion_id;
    if (id) {
      navigate(`/DetallesVibracion/${id}`);
    }
  };

  const handleCancelSearch = () => setIsModalOpenSearch(false);

  // Estilos minimalistas
  const cardStyle = {
    borderRadius: 16,
    border: "1px solid rgba(0,0,0,0.04)",
    boxShadow: "0 2px 8px rgba(0,0,0,0.02), 0 4px 12px rgba(0,0,0,0.02)",
    transition: "all 0.2s ease",
    height: "100%",
  };

  const iconStyle = {
    fontSize: 20,
    color: "#1677ff",
    opacity: 0.8,
  };

  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: "#1677ff",
          borderRadius: 10,
          colorBorderSecondary: "rgba(0,0,0,0.04)",
        },
        components: {
          Card: {
            headerFontSize: 16,
            headerFontWeight: 500,
          },
          Input: {
            activeShadow: "0 0 0 2px rgba(22,119,255,0.08)",
          },
        },
      }}
    >
      <div
        style={{
          padding: "32px 24px",
          maxWidth: 1200,
          margin: "0 auto",
          minHeight: "100vh",
          backgroundColor: "#fafbfc",
        }}
      >
        {/* Header minimalista */}
        <Flex vertical gap={4} style={{ marginBottom: 32 }}>
          <Title 
            level={1} 
            style={{ 
              marginBottom: 0, 
              fontSize: 32, 
              fontWeight: 500,
              letterSpacing: "-0.01em",
            }}
          >
            Vibraciones
          </Title>
          <Text style={{ fontSize: 15, color: "#6b7280" }}>
            Gestiona los registros de vibraciones de forma simple y rápida
          </Text>
        </Flex>

        <Row gutter={[20, 20]}>
          {/* Card: Crear */}
          <Col xs={24} lg={12}>
            <Card
              style={cardStyle}
              bodyStyle={{ padding: "28px 24px 32px" }}
              bordered={false}
            >
              <Flex vertical gap={20}>
                {/* Header de la card */}
                <Flex align="center" gap={12}>
                  <div
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 12,
                      backgroundColor: "#1677ff08",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <PlusCircleOutlined style={iconStyle} />
                  </div>
                  <div>
                    <Title level={4} style={{ margin: 0, fontWeight: 500 }}>
                      Crear nuevo registro
                    </Title>
                    <Text type="secondary" style={{ fontSize: 13 }}>
                      Inicia desde una orden de trabajo
                    </Text>
                  </div>
                </Flex>

                <Divider style={{ margin: "4px 0 8px", opacity: 0.3 }} />

                <Text style={{ color: "#4b5563", fontSize: 14 }}>
                  Ingresa el código de la OT para crear un registro de vibraciones.
                </Text>

                <Search
                  value={otCodeCreate}
                  onChange={(e) => setOtCodeCreate(e.target.value.toUpperCase())}
                  placeholder="OT-000123"
                  enterButton={
                    <span style={{ padding: "0 4px" }}>
                      Buscar OT
                    </span>
                  }
                  size="large"
                  allowClear
                  loading={isSearching}
                  prefix={<SearchOutlined style={{ opacity: 0.5 }} />}
                  onSearch={showModal}
                  style={{
                    filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.02))",
                  }}
                />

                <Text 
                  type="secondary" 
                  style={{ 
                    fontSize: 12, 
                    marginTop: -8,
                    fontStyle: "italic",
                  }}
                >
                  Puedes pegar el código completo con el prefijo OT-
                </Text>
              </Flex>
            </Card>
          </Col>

          {/* Card: Buscar */}
          <Col xs={24} lg={12}>
            <Card
              style={cardStyle}
              bodyStyle={{ padding: "28px 24px 32px" }}
              bordered={false}
            >
              <Flex vertical gap={20}>
                {/* Header de la card */}
                <Flex align="center" gap={12}>
                  <div
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 12,
                      backgroundColor: "#52c41a08",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <FileSearchOutlined style={{ ...iconStyle, color: "#52c41a" }} />
                  </div>
                  <div>
                    <Title level={4} style={{ margin: 0, fontWeight: 500 }}>
                      Buscar existente
                    </Title>
                    <Text type="secondary" style={{ fontSize: 13 }}>
                      Encuentra registros guardados
                    </Text>
                  </div>
                </Flex>

                <Divider style={{ margin: "4px 0 8px", opacity: 0.3 }} />

                <Text style={{ color: "#4b5563", fontSize: 14 }}>
                  Localiza un registro de vibraciones por su código de OT.
                </Text>

                <Search
                  placeholder="OT-000123"
                  enterButton={
                    <span style={{ padding: "0 4px" }}>
                      Buscar
                    </span>
                  }
                  size="large"
                  allowClear
                  loading={isSearching}
                  prefix={<SearchOutlined style={{ opacity: 0.5 }} />}
                  onSearch={showModalVibraciones}
                  style={{
                    filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.02))",
                  }}
                />

                <Text 
                  type="secondary" 
                  style={{ 
                    fontSize: 12, 
                    marginTop: -8,
                    fontStyle: "italic",
                  }}
                >
                  También puedes buscar con el código exacto
                </Text>
              </Flex>
            </Card>
          </Col>
        </Row>

        {/* Footer sutil */}
        <Divider style={{ margin: "40px 0 16px", opacity: 0.3 }} />
        <Flex justify="center">
          <Text style={{ fontSize: 12, color: "#9ca3af" }}>
            Gestión de Vibraciones v1.0
          </Text>
        </Flex>

        <DataModalVibraciones
          ot_data={otData}
          open={isModalOpen}
          onOk={handleOk}
          onCancel={handleCancel}
        />

        <ModalVibracionesOT
          vibracion_data={vibracionData}
          open={isModalOpenSearch}
          onOk={handleOkSearch}
          onCancel={handleCancelSearch}
        />
      </div>
    </ConfigProvider>
  );
}

export default GetOrCreateVibracionesPanel;