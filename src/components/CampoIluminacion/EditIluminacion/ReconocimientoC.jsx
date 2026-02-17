import { Tabs, message } from "antd";
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import FormatoC from "./FOR-M-001C/FORC";
import { getDataAreaTrabajo } from "./hook/getData";
import { getDistribucionC } from "../../../apis/ApiCampo/IluminacionApi";
import { saveDistribucionC } from "./FOR-M-001C/saveDistribucionC";

export default function CreateReconocomietoC() {
  const [activeKey, setActiveKey] = useState("1");
  const [areaOption, setAreaOptions] = useState([]);
  const [initialData, setInitialData] = useState(null);
  const [areaPunto  , setAreaPuntos ] = useState(null);

  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchAll() {
      try {
        const [areasRes, distRes] = await Promise.all([
          getDataAreaTrabajo(id),
          getDistribucionC(id), // ✅ GET de C existente
        ]);

        setAreaOptions(areasRes?.data?.areas || distRes?.data?.areasTrabajo || []);
        setInitialData(distRes?.data || null);
        setAreaPuntos(areasRes?.data?.punto || []);
      } catch (error) {
        console.error(error);
        try {
          const areasRes = await getDataAreaTrabajo(id);
          setAreaOptions(areasRes?.data?.areas || []);
        } catch (e) {
          message.error("No se pudo cargar FOR-M-001C");
        }
      }
    }

    if (id) fetchAll();
  }, [id]);

  const items = [
    {
      key: "1",
      label: "FOR-M-001C",
      children: (
        <FormatoC
          areasPunto={areaPunto}
          areasPorFila={areaOption}
          initialData={initialData}
          onSave={async ({ rows, observacion }) => {
            const ok = await saveDistribucionC({
              iluminacionId: id,
              rows,
              observacion,
              initialData,
            });
            return ok;
          }}
          onSaveOK={() => navigate(`/DetallesIluminacion/${id}`)}
        />
      ),
    },
  ];

  return <Tabs activeKey={activeKey} items={items} onChange={setActiveKey} />;
}
