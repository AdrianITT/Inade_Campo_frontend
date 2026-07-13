import React from "react";
import { Form, Card, Button, Table } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import PropTypes from "prop-types";
import { getUbicacionesColumns } from "./UbicacionesColumns.jsx";

/**
 * Componente UbicacionesSection
 * Renderiza la sección de ubicaciones con autoincremento de puntos
 */
const UbicacionesSection = ({
  agregarUbicacion,
  eliminarUbicacion,
}) => {
  return (
    <Form.List name="ubicaciones">
      {(fields, { add, remove }) => {
        const columns = getUbicacionesColumns((field) =>
          eliminarUbicacion(field, remove)
        );

        // Función intermedia para autogestionar el número de punto
        const handleAgregarConPunto = () => {
          // 1. Obtenemos el cascarón inicial de tu hook personalizado
          const nuevaUbicacion = agregarUbicacion(); 
          
          // 2. Calculamos el siguiente número (si hay 0 filas, el siguiente es 1)
          const siguientePunto = fields.length + 1; 

          // 3. Inyectamos el número de punto automático al objeto
          add({
            ...nuevaUbicacion,
            numeroPunto: siguientePunto,
          });
        };

        return (
          <Card
            size="small"
            title={`Ubicaciones Registradas (${fields.length})`}
            style={{ marginTop: 20 }}
            extra={
              <Button
                type="primary"
                ghost
                size="small"
                icon={<PlusOutlined />}
                onClick={handleAgregarConPunto} // <-- Usamos la nueva función
              >
                Agregar Ubicación
              </Button>
            }
          >
            <Table
              rowKey="key"
              pagination={false}
              dataSource={fields}
              columns={columns}
              size="small"
              bordered
              scroll={{ x: 800, y: 400 }}
              locale={{ emptyText: "No hay ubicaciones configuradas para este reconocimiento." }}
            />
          </Card>
        );
      }}
    </Form.List>
  );
};

UbicacionesSection.propTypes = {
  agregarUbicacion: PropTypes.func.isRequired,
  eliminarUbicacion: PropTypes.func.isRequired,
};

export default UbicacionesSection;