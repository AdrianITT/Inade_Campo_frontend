import { Tabs, message } from "antd";
import { useState, useEffect } from "react";
import FormatoB from "./FOR-M-001B/FORB";
import { getDataAreaTrabajo } from "./hook/getData";
import { getReconocimientoB } from "../../../apis/ApiCampo/IluminacionApi";
import { useParams, useNavigate } from "react-router-dom";
import { saveReconocimientoB } from "./FOR-M-001B/saveReconocimientoB";

export default function CreateReconocomietoB() {
  const [activeKey, setActiveKey] = useState("1");
  const [aDone, setADone] = useState(true); // aquí ya estás en B, lo dejo true
  const [areaOption, setAreaOptions] = useState([]);
  const [areaPunto  , setAreaPuntos ] = useState(null);
  const [initialData, setInitialData] = useState(null);

  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchAll() {
      try {
        const [areasRes, recoRes] = await Promise.all([
          getDataAreaTrabajo(id),      // trae {areas: [...]}
          getReconocimientoB(id),      // trae {reconocimiento_ilum:{id,observaciones}, dataTabla:[...]}
        ]);
        console.log("areasRES: ",areasRes);
        console.log(recoRes);
        setAreaOptions(areasRes?.data?.areas || recoRes?.data?.areasTrabajo || []);
        setAreaPuntos(areasRes.data.punto || []);
        setInitialData(recoRes?.data || null);
      } catch (error) {
        console.error(error);
        // si no existe reconocimiento aún, tu API puede dar 404 → no lo tratamos como fatal
        // solo seguimos con áreas
        try {
          const areasRes = await getDataAreaTrabajo(id);
          setAreaOptions(areasRes?.data?.areas || []);
        } catch (e) {
          message.error("No se pudo cargar el Reconocimiento B.");
        }
      }
    }

    if (id) fetchAll();
  }, [id]);

  const onChange = (key) => {
    if (!aDone && key !== "1") {
      message.warning("Primero termine el formulario FOR-M-001A");
      setActiveKey("1");
      return;
    }
    setActiveKey(key);
  };

  const items = [
    {
      key: "1",
      label: "FOR-M-001B",
      children: (
        <FormatoB
          areasPunto={areaPunto}
          areasPorFila={areaOption}
          initialData={initialData}
          onSaveOK={async () => {
            // recarga datos o navega
            navigate(`/DetallesIluminacion/${id}`);
          }}
          onSave={async ({ rows, observacion }) => {
            const ok = await saveReconocimientoB({ iluminacionId: id, rows, observacion, initialData });
            return ok;
          }}
        />
      ),
    },
  ];

  return <Tabs activeKey={activeKey} items={items} onChange={onChange} />;
}
