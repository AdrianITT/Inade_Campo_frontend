/**
 * Configuración de fases del flujo de Tierras Físicas
 * Se exporta como constante para que sea reutilizable
 */
export const FASES_CONFIG = (
  id,
  reconocimientoTF,
  verificacionTF,
  hojaCampoTF
) => [
  {
    id: 1,
    fase: "Fase 1",
    titulo: "Reconocimiento TF",
    ruta: `/ReconocimientoTF/${id}`,
    desbloqueado: true,
    completado: reconocimientoTF,
    descripcion: "Análisis inicial de las tierras físicas",
  },
  {
    id: 2,
    fase: "Fase 2",
    titulo: "Verificación de TF",
    ruta: `/VerificacionTF/${id}`,
    desbloqueado: reconocimientoTF,
    completado: verificacionTF,
    descripcion: "Verificación de los parámetros medidos",
  },
  {
    id: 3,
    fase: "Fase 3",
    titulo: "Hoja de Campo",
    ruta: `/HojaCampoTF/${id}`,
    desbloqueado: reconocimientoTF && verificacionTF,
    completado: hojaCampoTF,
    descripcion: "Registro de datos en hoja de campo",
  },
];

/**
 * Estilos reutilizables para la página
 */
export const STYLES = {
  container: {
    minHeight: "100vh",
    padding: "40px 60px",
    background: "linear-gradient(to bottom, #f7f7f7, #ececec)",
  },
  headerTitle: {
    fontSize: 38,
    margin: 0,
    fontWeight: "bold",
  },
  headerSubtitle: {
    color: "#777",
    marginTop: 5,
  },
  downloadButton: {
    height: 50,
    borderRadius: 10,
    fontWeight: "bold",
  },
  cardContainer: {
    marginTop: 90,
  },
  faseLabel: {
    marginBottom: 15,
    display: "flex",
    alignItems: "center",
    gap: 10,
  },
  faseLabelText: {
    fontWeight: 600,
    color: "#555",
  },
  card: {
    width: 320,
    height: 120,
    borderRadius: 18,
    transition: "0.3s",
    boxShadow: "0 8px 20px rgba(0,0,0,0.08)",
  },
  cardBody: {
    height: "100%",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 25,
  },
  cardTitle: {
    margin: 0,
    fontSize: 28,
    fontWeight: "bold",
  },
  cardSubtitle: {
    marginTop: 10,
    color: "#777",
  },
  icon: {
    fontSize: 40,
  },
};