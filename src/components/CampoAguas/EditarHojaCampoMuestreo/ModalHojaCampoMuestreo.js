// components/ConfirmDelete.js
import { Modal } from "antd";

/**
 * Abre un modal de confirmación y devuelve una promesa
 * que se resuelve `true` si el usuario confirma.
 *
 * @param {string} title   – Título del diálogo
 * @param {string} content – Mensaje del diálogo
 */
export function confirmDelete({ title = "Confirmar", content }) {
  return new Promise((resolve) => {
    Modal.confirm({
      title,
      content,
      okText: "Sí, eliminar",
      cancelText: "Cancelar",
      okButtonProps: { danger: true },
      onOk: () => resolve(true),
      onCancel: () => resolve(false),
    });
  });
}
