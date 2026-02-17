// FOR-M-001A/FORA.jsx
import React, { useEffect, useMemo, useState } from "react";
import { Modal, Button, Space, Row, Col, Typography, Card, Grid, Affix } from "antd";
import { useParams, useNavigate } from "react-router-dom";
import MonitoreoCard from "./MonitoreoCard";
import { createEmptyCard, normalizeCardsFromApi } from "./cardFactory";
import { getAllDataCalculoZona } from "../../../../apis/ApiCampo/IluminacionApi";
import { saveFormatoA } from "./saveFormatoA";
import { useBeforeUnload, useNavigationPrompt } from "../../../hooks/DetectTabClosure";

const { Title, Text } = Typography;
const { useBreakpoint } = Grid;

export default function FormatoA({ onFinishOK }) {
  const [cards, setCards] = useState([createEmptyCard()]);
  const [carded, setCarded] = useState([createEmptyCard()]);
  const [loading, setLoading] = useState(false);

  const [isDirty, setIsDirty] = useState(false);
  useBeforeUnload(isDirty);
  useNavigationPrompt(isDirty);

  const { id } = useParams();
  const navigate = useNavigate();

  const screens = useBreakpoint();
  const isMobile = !screens.sm;         // < 576
  const isTablet = screens.sm && !screens.lg; // 576..991 aprox

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const res = await getAllDataCalculoZona(id);
        const normalized = normalizeCardsFromApi(res?.data);

        const base = normalized.length ? normalized : [createEmptyCard()];
        setCards(base);
        setCarded(base);
        setIsDirty(false);
      } catch (e) {
        setCards([createEmptyCard()]);
        setCarded([createEmptyCard()]);
        setIsDirty(false);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const addCard = () => {
    setCards((prev) => [...prev, createEmptyCard()]);
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

  const doSave = async () => {
    if (loading) return;
    setIsDirty(false);

    const ok = await saveFormatoA({ cards, iluminacionId: id, carded });
    if (ok) {
      setIsDirty(false);
      onFinishOK?.();
      navigate(`/DetallesIluminacion/${id}`);
    }
  };

  const onClickGuardar = () => {
    Modal.confirm({
      title: "¿Estás seguro de enviar los datos?",
      content: "Verifica que toda la información esté completa antes de continuar.",
      okText: "Sí, enviar",
      cancelText: "Cancelar",
      onOk: async () => {
        await doSave();
      },
    });
  };

  const onSubmitForm = (e) => {
    e.preventDefault();
    onClickGuardar();
  };

  const headerRight = useMemo(() => {
    // En móvil/tablet: botones “full width” y ordenados
    if (isMobile || isTablet) {
      return (
        <Row gutter={[8, 8]} style={{ width: "100%" }}>
          <Col xs={24} sm={12}>
            <Button block type="primary" onClick={addCard} disabled={loading}>
              + Agregar Card
            </Button>
          </Col>
          <Col xs={24} sm={12}>
            <Button block onClick={onClickGuardar} loading={loading} disabled={!isDirty}>
              Guardar cambios
            </Button>
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
        <Button onClick={onClickGuardar} loading={loading} disabled={!isDirty}>
          Guardar cambios
        </Button>
      </Space>
    );
  }, [isMobile, isTablet, addCard, onClickGuardar, loading, isDirty]);

  return (
    <form onSubmit={onSubmitForm} style={ui.page}>
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
                  <Button block onClick={onClickGuardar} loading={loading} disabled={!isDirty}>
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
}

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
