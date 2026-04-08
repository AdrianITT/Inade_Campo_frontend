// FOR-M-001A/FORA.jsx
import React, { useEffect, useMemo, useState } from "react";
import { Modal, Button, Space, Row, Col, Typography, Card, Grid, Affix, Alert, Upload, message } from "antd";
import { useParams, useNavigate } from "react-router-dom";
import MonitoreoCard from "./MonitoreoCard";
import { createEmptyCard, normalizeCardsFromApi } from "./cardFactory";
import { getAllDataCalculoZona } from "../../../../apis/ApiCampo/IluminacionApi";
import { saveFormatoA } from "./saveFormatoA";
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
  const isOnline = useOnlineStatus();

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

        const draft = loadDraft({ iluminacionId: id });
        if (draft?.cards?.length) {
          Modal.confirm({
            title: "Se encontró un respaldo local",
            content:
              "Hay un borrador guardado localmente. ¿Quieres restaurarlo para no perder cambios?",
            okText: "Restaurar",
            cancelText: "Ignorar",
            onOk: () => {
              setCards(draft.cards);
              setIsDirty(true);
              message.success("Borrador restaurado");
            },
            onCancel: () => {
              // no hacemos nada, pero mantenemos el draft por si acaso
            },
          });
        }
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

  // Autosave local (debounce) para no perder cambios en movimiento/offline
  useEffect(() => {
    if (!isDirty) return;
    const t = setTimeout(() => {
      saveDraft({ iluminacionId: id, cards });
    }, 600);
    return () => clearTimeout(t);
  }, [cards, id, isDirty]);

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
      clearDraft({ iluminacionId: id });
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
    const onExport = () => {
      downloadJsonFile({
        filename: `FOR-M-001A_${id}_draft.json`,
        data: {
          version: 1,
          iluminacionId: id,
          exportedAt: new Date().toISOString(),
          cards,
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
          setCards(result.cards);
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
            <Button block onClick={onClickGuardar} loading={loading} disabled={!isDirty}>
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
        <Button onClick={onClickGuardar} loading={loading} disabled={!isDirty}>
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
  }, [isMobile, isTablet, addCard, onClickGuardar, loading, isDirty, id, cards]);

  return (
    <form onSubmit={onSubmitForm} style={ui.page}>
      <div style={ui.container}>
        {/* Header responsive */}
        <Card style={ui.headerCard} bodyStyle={{ padding: isMobile ? 12 : 16 }}>
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
