import { Modal, Descriptions } from "antd";

/**
 * Muestra un modal de confirmación con los valores del formulario.
 * Devuelve una promesa que se resuelve `true` si el usuario confirma.
 *
 * @param {object} valores  – Valores provenientes de form.getFieldsValue()
 */
export function confirmSave(valores) {
  return new Promise((resolve) => {
    Modal.confirm({
      width: 600,
      title: "Confirmar guardado de Hoja de Campo",
      okText: "Guardar",
      cancelText: "Cancelar",
      onOk: () => resolve(true),
      onCancel: () => resolve(false),
      content: (
          console.log("Valores a guardar:", valores),
        <Descriptions size="small" column={1} bordered>
          <Descriptions.Item label="Identificación">
            {valores.identificacionCampo}
          </Descriptions.Item>
          <Descriptions.Item label="Norma de referencia">
            {valores.normaReferencia}
          </Descriptions.Item>
          <Descriptions.Item label="Condición de muestreo">
            {valores.condicionMuestreo ? "Bajo techo" : "Intemperie"}
          </Descriptions.Item>
          <Descriptions.Item label="Observación">
            {valores.observaciones || "—"}
          </Descriptions.Item>
          <Descriptions.Item label="Muestreador / Supervisor">
            {valores.muestreador || "—"} / {valores.supervisor || "—"}
          </Descriptions.Item>
        </Descriptions>
      ),
    });
  });
}
