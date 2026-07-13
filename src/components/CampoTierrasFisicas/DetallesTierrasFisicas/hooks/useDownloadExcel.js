import { message } from "antd";
import { getDownloadExcel } from "../../../../apis/ApiCampo/TierrasFisicasApi";

/**
 * Hook personalizado para descargar archivos Excel
 * Maneja ZIP y archivos individuales automáticamente
 */
export const useDownloadExcel = () => {
  const downloadExcel = async (id) => {
    try {
      const respuesta = await getDownloadExcel(id);

      if (!respuesta || !respuesta.data) {
        throw new Error("No se recibieron datos del servidor");
      }

      // Obtener headers
      const headers = respuesta.headers || {};
      const disposition =
        headers["content-disposition"] ||
        headers["Content-Disposition"] ||
        "";
      const contentType =
        headers["content-type"] ||
        headers["Content-Type"] ||
        "application/octet-stream";

      // Determinar nombre del archivo
      let filename = "archivo";
      const match = disposition.match(/filename="?([^"]+)"?/);

      if (match && match[1]) {
        filename = match[1];
      } else {
        // Fallback según tipo de contenido
        if (contentType.includes("zip")) {
          filename = "archivos_excel.zip";
        } else if (contentType.includes("spreadsheet")) {
          filename = "reporte.xlsx";
        }
      }

      // Crear y descargar blob
      const blob = new Blob([respuesta.data], { type: contentType });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");

      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();

      // Limpiar recursos
      link.remove();
      window.URL.revokeObjectURL(url);

      message.success("Archivo descargado correctamente");
    } catch (error) {
      console.error("Error al descargar:", error);
      message.error("Error al descargar el archivo");
    }
  };

  return { downloadExcel };
};