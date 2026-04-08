import React, { useEffect, useRef, useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import MonitoreoCard, { createEmptyCard } from "./MonitoreoCard";
import {InsertData} from "./insertData";
import { message,
  Spin, 
  Modal, 
  Button, 
  Col, 
  Affix, 
  Card, 
  Row, 
  Grid, 
  Typography, 
  Space,
  Alert,
  Upload,
 } from "antd";
import { useBeforeUnload, useNavigationPrompt } from "../../../hooks/DetectTabClosure";
import { useOnlineStatus } from "./useOnlineStatus";
import {
  clearDraft,
  downloadJsonFile,
  loadDraft,
  readJsonFile,
  saveDraft,
  validateImportedDraft,
} from "./draftImportExport";
// import { useBeforeUnload, useNavigationPrompt} from "../../hooks/DetectTabClosure";
const { useBreakpoint } = Grid;
const { Title, Text } = Typography;

export default function FormatoA({onFinishOK}) {
     const [cards, setCards] = useState([createEmptyCard()]);
     const [loading, setLoading] = useState(false);

     const{id} = useParams();
     const navigate = useNavigate();

    const [isDirty, setIsDirty] = useState(false);

    const hydratingRef = useRef(false);

    const screens = useBreakpoint();
    const isMobile = !screens.sm;         // < 576
    const isTablet = screens.sm && !screens.lg; // 576..991 aprox

    const shouldBlock = isDirty && !loading;
    useBeforeUnload(shouldBlock);
     
    useNavigationPrompt(shouldBlock);

    const isOnline = useOnlineStatus();
    const scopeId = useMemo(() => `formatoA:${id ?? "default"}`, [id]);
    const [draftTick, setDraftTick] = useState(0);

    useEffect(() => {
      const draft = loadDraft({ scopeId });
      const savedCards = draft?.values?.cards;

      if (Array.isArray(savedCards) && savedCards.length > 0) {
        hydratingRef.current = true;
        setCards(savedCards);
        setIsDirty(true); // o false, según tu UX
        hydratingRef.current = false;
      }
    }, [scopeId]);

    useEffect(() => {
    if (hydratingRef.current) return;

    const timer = setTimeout(() => {
      saveDraft({
        scopeId,
        values: { cards,}
      });
      setDraftTick((t) => t + 1);
    }, 500);

    return () => clearTimeout(timer);
  }, [cards, scopeId]);

  const addCard = () => {
    setCards((prev) => {
      const next = [...prev, createEmptyCard()];
      return next;
    });
    setIsDirty(true);
  };

  const removeCard = (cardIndex) => {
    setCards((prev) => prev.filter((_, i) => i !== cardIndex));
    setIsDirty(true);
  };

  const updateCard = (cardIndex, nextCardValue) => {
    setCards((prev) => prev.map((c, i) => (i === cardIndex ? nextCardValue : c)));
    setIsDirty(true);
  };

  const confirmarEnvio = (values) => {
    values.preventDefault();
    Modal.confirm({
      title: "¿Estás seguro de enviar los datos?",
      content: "Verifica que toda la información esté completa antes de continuar.",
      okText: "Sí, enviar",
      cancelText: "Cancelar",
      onOk:onSubmit,  // llama a la función real de envío
    });
    };

  const onSubmit = async () => {
    if(loading) return;
    setLoading(true);
    try{
    //  console.log("DATA FORMATO A:", cards);
     let r = await InsertData({cards, id});
    //  console.log("respuesta: ",r);
    //  console.log("PromiseResult", r.PromiseResult);
     if(r){
      clearDraft({ scopeId });
      setIsDirty(false);
      onFinishOK?.();
      navigate(`/DetallesIluminacion/${id}`); // cambia la ruta a la tuya
    }else{
      message.error("No se pudo guardar (respuesta inválida).");
    }

    }catch(err){
      message.error("Error al guardar");
    }finally{
      setLoading(false);
      // setIsDirty(false);
    }
    

  };

  const headerRight = useMemo(() => {
    // En móvil/tablet: botones “full width” y ordenados
        const onExport = () => {
          downloadJsonFile({
            filename: `FOR-M-001A_${id}_draft.json`,
            data: {
              version: 1,
              scopeId,
              exportedAt: new Date().toISOString(),
              values: {
                cards,
              },
            },
          });
          message.success("Exportación generada");
        };
    
        const uploadProps = {
          accept: "application/json",
          showUploadList: false,
          beforeUpload: async (file) => {
            try {
              const payload = await readJsonFile(file);
              const result = validateImportedDraft(payload);
              if (!result.ok) {
                message.error(result.message);
                return Upload.LIST_IGNORE;
              }
              setCards(result.values.cards);
              setIsDirty(true);
              message.success("Datos importados al formulario");
            } catch (e) {
              message.error("No se pudo leer el archivo JSON");
            }
            return Upload.LIST_IGNORE;
          },
        };
    
    if (isMobile || isTablet) {
      return (
        <Row gutter={[8, 8]} style={{ width: "100%" }}>
          <Col xs={24} sm={12}>
            <Button block type="primary" onClick={addCard} disabled={loading}>
              + Agregar Card
            </Button>
          </Col>
          <Col xs={24} sm={12}>
            <Button block onClick={confirmarEnvio} loading={loading} disabled={!isDirty}>
              Guardar cambios
            </Button>
          </Col>
                    <Col xs={24} sm={12}>
            <Button block onClick={onExport} disabled={loading}>
              Exportar
            </Button>
          </Col>
          <Col xs={24} sm={12}>
            <Upload {...uploadProps}>
              <Button block disabled={loading}>
                Importar
              </Button>
            </Upload>
          </Col>
        </Row>
      );
    }

    // Desktop: en una fila compacta
    return (
      <Space>
        <Button type="primary" onClick={addCard} disabled={loading}>
          + Agregar Card
        </Button>
        <Button onClick={confirmarEnvio} loading={loading} disabled={!isDirty}>
          Guardar cambios
        </Button>
        <Button onClick={onExport} disabled={loading}>
          Exportar
        </Button>
        <Upload {...uploadProps}>
          <Button disabled={loading}>Importar</Button>
        </Upload>
      </Space>
    );
  }, [isMobile, isTablet, addCard, onSubmit, loading, isDirty]);



  return (
    <form onSubmit={confirmarEnvio} style={ui.page}>
              {!isOnline && (
                <div style={{ marginBottom: 12 }}>
                  <Alert
                    type="warning"
                    showIcon
                    message="Sin conexión a Internet"
                    description="Tus cambios se están guardando localmente. Exporta el borrador si necesitas respaldo adicional."
                  />
                </div>
              )}
      <div style={ui.container}>
        {/* Header responsive */}
        <Card style={ui.headerCard} bodyStyle={{ padding: isMobile ? 12 : 16 }}>
          <Row gutter={[12, 12]} align="middle">
            <Col xs={24} lg={12}>
              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                <Title level={4} style={{ margin: 0 }}>
                  Formato A
                </Title>
                <Text type="secondary">
                  {loading ? "Cargando información..." : isDirty ? "Tienes cambios sin guardar" : "Sin cambios"}
                </Text>
              </div>
            </Col>

            <Col xs={24} lg={12} style={{ display: "flex", justifyContent: "flex-end" }}>
              <div style={{ width: isMobile || isTablet ? "100%" : "auto" }}>
                {headerRight}
              </div>
            </Col>
          </Row>
        </Card>

        {/* Lista de cards */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {cards.map((card, index) => (
            <MonitoreoCard
              key={card.id ?? `new-${index}`}
              index={index}
              value={card}
              onChange={updateCard}
              onRemove={removeCard}
              // tip: pásale esto a tu card para acomodar internamente
              compact={isMobile}
            />
          ))}
        </div>

        {/* Acciones sticky (súper útil en tablet/móvil) */}
        {(isMobile || isTablet) && (
          <Affix offsetBottom={12}>
            <Card style={ui.stickyCard} bodyStyle={{ padding: 12 }}>
              <Row gutter={[8, 8]}>
                <Col xs={24} sm={12}>
                  <Button block type="primary" onClick={addCard} disabled={loading}>
                    + Agregar Card
                  </Button>
                </Col>
                <Col xs={24} sm={12}>
                  <Button block onClick={confirmarEnvio} loading={loading} disabled={!isDirty}>
                    Guardar cambios
                  </Button>
                </Col>
              </Row>
            </Card>
          </Affix>
        )}
      </div>
    </form>
  );
};

const styles = {
  btnPrimary: {
    border: "1px solid #111827",
    background: "#111827",
    color: "white",
    padding: "8px 12px",
    borderRadius: 10,
    cursor: "pointer",
  },
  btn: {
    border: "1px solid #d1d5db",
    background: "white",
    color: "#111827",
    padding: "8px 12px",
    borderRadius: 10,
    cursor: "pointer",
  },
};

const ui = {
  page: {
    padding: 12,
  },
  container: {
    width: "100%",
    maxWidth: 1100,   // un poco menos para que tablet no se sienta “apretada”
    margin: "0 auto",
    display: "flex",
    flexDirection: "column",
    gap: 12,
  },
  headerCard: {
    borderRadius: 14,
  },
  stickyCard: {
    borderRadius: 14,
    boxShadow: "0 6px 18px rgba(0,0,0,0.10)",
  },
};
