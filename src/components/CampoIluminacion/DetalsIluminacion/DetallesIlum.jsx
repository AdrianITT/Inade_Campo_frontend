import React, { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Card,
  Typography,
  Space,
  Button,
  Row,
  Col,
  Tag,
  Skeleton,
  message,
  Grid,
  Flex,
  Divider,
} from "antd";
import { ArrowLeftOutlined, CheckCircleFilled, ClockCircleFilled, DownloadOutlined } from "@ant-design/icons";

import {
  CardIluminacion,
  CardIluminacionHojaCampo,
  CardIluminacionReconocimiento,
  CardLightingDistribution,
} from "../DetalsIluminacion/CardIluminacion/Card.jsx";
import { DataDetailsIlum, download } from "../hook/useEffectIlum.jsx";

const { Title, Text } = Typography;
const { useBreakpoint } = Grid;

export default function DetailsIluminacion() {
  const { id } = useParams();
  const navigate = useNavigate();
  const screens = useBreakpoint();

  const [detailsIlum, setDetailsIlum] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingButton, setLoadingButton] = useState(false);

  const isTablet = screens.md && !screens.lg; // aprox 768-991
  const isMobile = !screens.md;

  useEffect(() => {
    const fetchDat = async () => {
      try {
        setLoading(true);
        const res = await DataDetailsIlum(id);
        setDetailsIlum(res.data);
      } catch (err) {
        console.error(err);
        message.error("No se pudieron cargar los detalles.");
        setDetailsIlum(null);
      } finally {
        setLoading(false);
      }
    };
    fetchDat();
  }, [id]);

  const clienteNombre = useMemo(() => {
    if (!detailsIlum) return "N/A";
    const parts = [
      detailsIlum.clientenombre,
      detailsIlum.clienteapPaterno,
      detailsIlum.clienteapMaterno,
    ].filter(Boolean);
    return parts.length ? parts.join(" ") : "N/A";
  }, [detailsIlum]);

  const statusTag = (isDone, doneText = "Listo", pendingText = "Pendiente") =>
    isDone ? (
      <Tag icon={<CheckCircleFilled />} color="success">
        {doneText}
      </Tag>
    ) : (
      <Tag icon={<ClockCircleFilled />} color="default">
        {pendingText}
      </Tag>
    );

  const canDownload =
    !!detailsIlum?.rec && !!detailsIlum?.rilum && !!detailsIlum?.dilum && !!detailsIlum?.hci;

  const downloadExcel = async () => {
    try {
      setLoadingButton(true);
      const res = await download(id);
      const headers = res?.headers ?? {};
      const disposition = headers["content-disposition"] || headers["Content-Disposition"] || "";
      let filename = "archivo.zip";
      const match = disposition.match(/filename="?([^"]+)"?/);
      if (match?.[1]) filename = match[1];

      const blob = new Blob([res.data], { type: "application/zip" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (e) {
      message.error("No se pudo descargar el archivo.");
    }finally{
      setLoadingButton(false);
    }
  };

  // Chips/steps (se ven bien y se adaptan)
  const chips = (
    <Flex wrap="wrap" gap={8} style={{ marginTop: 8 }}>
      {statusTag(!!detailsIlum?.rec, "Zonas listo", "Zonas pendiente")}
      {statusTag(!!detailsIlum?.hci, "Hoja campo lista", "Hoja campo pendiente")}
      {statusTag(!!detailsIlum?.rilum, "Reconocimiento listo", "Reconocimiento pendiente")}
      {statusTag(!!detailsIlum?.dilum, "Distribución lista", "Distribución pendiente")}
    </Flex>
  );

  return (
    <div style={{ maxWidth: 1200, margin: "0 auto", padding: isMobile ? 12 : 20 }}>
      {/* HEADER */}
      <Card style={{ borderRadius: 16 }} bodyStyle={{ padding: isMobile ? 14 : 18 }}>
        <Flex justify="space-between" align="flex-start" wrap="wrap" gap={12}>
          <div style={{ minWidth: 260 }}>
            <Space direction="vertical" size={6}>
              <Button icon={<ArrowLeftOutlined />} onClick={() => navigate("/Iluminacion")}>
                Volver
              </Button>

              <Title level={isMobile ? 4 : 3} style={{ margin: 0 }}>
                Detalles de Iluminación — OT {loading ? "" : detailsIlum?.codigo ?? "N/A"}
              </Title>

              <Text type="secondary">
                Empresa: <b>{loading ? "..." : detailsIlum?.empresa ?? "N/A"}</b>
                {!isMobile && (
                  <>
                    {" "}
                    · Cliente: <b>{loading ? "..." : clienteNombre}</b> · ID Equipo:{" "}
                    <b>{loading ? "..." : detailsIlum?.machinelight?.equipoId ?? "N/A"}</b>
                  </>
                )}
              </Text>

              {/* En móvil mostramos los datos en 2da línea para que no quede larguísimo */}
              {isMobile && (
                <Text type="secondary">
                  Cliente: <b>{loading ? "..." : clienteNombre}</b> · Equipo:{" "}
                  <b>{loading ? "..." : detailsIlum?.machinelight?.equipoId ?? "N/A"}</b>
                </Text>
              )}
            </Space>

            {/* Chips siempre debajo (wrap en tablet perfecto) */}
            {!loading && chips}
          </div>

          <Space>
            <Button
              type="primary"
              icon={<DownloadOutlined />}
              onClick={downloadExcel}
              disabled={!canDownload}
              loading={loadingButton}
            >
              {isMobile ? "Excel" : "Descargar Excel"}
            </Button>
          </Space>
        </Flex>
      </Card>

      <Divider style={{ margin: "16px 0" }} />

      {/* CONTENIDO */}
      {loading ? (
        <Card style={{ borderRadius: 16 }}>
          <Skeleton active paragraph={{ rows: 7 }} />
        </Card>
      ) : (
        <Row gutter={[16, 16]}>
          {/* En tablet/desktop: 2 columnas / En móvil: 1 */}
          <Col xs={24} md={12}>
            <Space direction="vertical" size={16} style={{ width: "100%" }}>
              <Card
                title={
                  <Space>
                    <span>Cálculo de Zonas</span>
                    {statusTag(!!detailsIlum?.rec, "Creado", "Pendiente")}
                  </Space>
                }
                style={{ borderRadius: 16 }}
                bodyStyle={{ padding: 16 }}
                hoverable
              >
                <CardIluminacion rec={detailsIlum?.rec || false} idIlum={id} />
              </Card>

              <Card
                title={
                  <Space>
                    <span>Reconocimiento de Iluminación</span>
                    {statusTag(!!detailsIlum?.rilum, "Creado", "Pendiente")}
                  </Space>
                }
                style={{ borderRadius: 16 }}
                bodyStyle={{ padding: 16 }}
                hoverable
              >
                <CardIluminacionReconocimiento rI={detailsIlum?.rilum ?? false} rec={detailsIlum?.rec || false} idIlum={id} />
              </Card>

              <Card
                title={
                  <Space>
                    <span>Distribución de lámparas</span>
                    {statusTag(!!detailsIlum?.dilum, "Creado", "Pendiente")}
                  </Space>
                }
                style={{ borderRadius: 16 }}
                bodyStyle={{ padding: 16 }}
                hoverable
              >
                <CardLightingDistribution di={detailsIlum?.dilum ?? false} rI={detailsIlum?.rilum ?? false} rec={detailsIlum?.rec || false} idIlum={id} />
              </Card>
            </Space>
          </Col>

          <Col xs={24} md={12}>
            <Space direction="vertical" size={16} style={{ width: "100%" }}>
              <Card
                title={
                  <Space>
                    <span>Hojas de Campo</span>
                    {statusTag(!!detailsIlum?.hci, "Creado", "Pendiente")}
                  </Space>
                }
                style={{ borderRadius: 16 }}
                bodyStyle={{ padding: 16 }}
                hoverable
              >
                <CardIluminacionHojaCampo hci={detailsIlum?.hci || false} di={detailsIlum?.dilum ?? false} rI={detailsIlum?.rilum ?? false} rec={detailsIlum?.rec || false} idIlum={id} />
              </Card>

              {/* Extra opcional: un card “Resumen” que en tablet se ve muy bien */}
              <Card style={{ borderRadius: 16 }} bodyStyle={{ padding: 16 }}>
                <Title level={5} style={{ marginTop: 0 }}>
                  Resumen
                </Title>
                <Text type="secondary">
                  Completa los módulos para habilitar la descarga del Excel.
                </Text>
                <div style={{ marginTop: 12 }}>{chips}</div>
              </Card>
            </Space>
          </Col>
        </Row>
      )}
    </div>
  );
}
