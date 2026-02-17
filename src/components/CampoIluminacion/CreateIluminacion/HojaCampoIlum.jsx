import { Tabs, message, Button } from "antd";
import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { getDataAreaTrabajo } from "./hook/getData";
import { getExisces } from '../../../apis/ApiCampo/IluminacionApi.js';
import FormHC from "./HOJACAMPO/FormHC.jsx";
import FormNAT from "./HOJACAMPO/FormNAT.jsx";
import { insertDataLuzART } from "./HOJACAMPO/insertDataART.jsx";
import { insertDataIluminacionNAT } from "./HOJACAMPO/insertDataNAT.jsx";

export default function CreateReconocomietoA() {
  const [areaOption, setAreaOptions] = useState([]);
  const { id } = useParams();
  const navigate = useNavigate();


  // ✅ bloqueo ART
  const [artSubmitting, setArtSubmitting] = useState(false);
  const [artSent, setArtSent] = useState(false);

  // ✅ bloqueo NAT
  const [natSubmitting, setNatSubmitting] = useState(false);
  const [natSent, setNatSent] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function fetchData() {
      try {
        const r = await getDataAreaTrabajo(id);
        const c = await getExisces(id);
        setArtSubmitting(c.data.exists_art);
        setNatSubmitting(c.data.exists_nat);
     //    console.log("c: ",c);
        const areas = Array.isArray(r?.data?.areas) ? r.data.areas : [];
        if (!cancelled) setAreaOptions(areas);
      } catch (error) {
        message.error("Error al cargar áreas");
        console.error(error);
      }
    }

    if (id) fetchData();
    return () => { cancelled = true; };
  }, [id]);

  const onclick = ( ) =>{
     navigate(`/DetallesIluminacion/${id}`);
  }

  const Reconocimiento = [
    {
      key: 1,
      label: "Luz ART",
      children: (
        <FormHC
          disabled={artSubmitting || artSent}
          loading={artSubmitting}
          onFinishOK={async (payload) => {
            if (artSubmitting) return;
            if (artSent) {
              message.warning("El formulario ART ya fue enviado y está bloqueado.");
              return;
            }

            try {
              setArtSubmitting(true);

              // ✅ importante: await
              const res = await insertDataLuzART({ payload, id });

              // si regresas algo, puedes validar aquí:
              // if (!res) throw new Error("No se pudo guardar");

              setArtSent(true);
              message.success("Formulario ART enviado correctamente. Quedó bloqueado.");
            } catch (err) {
              console.error(err);
              message.error("No se pudo enviar ART. Intenta de nuevo.");
            } finally {
              setArtSubmitting(false);
            }
          }}
          areasPorFila={areaOption}
        />
      ),
    },
    {
      key: 2,
      label: "Luz NAT",
      children: (
        <FormNAT
          disabled={natSubmitting || natSent}
          loading={natSubmitting}
          onFinishOK={async (values) => {
            if (natSubmitting) return;
            if (natSent) {
              message.warning("El formulario NAT ya fue enviado y está bloqueado.");
              return;
            }

            try {
              setNatSubmitting(true);

              // ✅ importante: await
              const res = await insertDataIluminacionNAT({ values, id });

              // if (!res) throw new Error("No se pudo guardar");

              setNatSent(true);
              message.success("Formulario NAT enviado correctamente. Quedó bloqueado.");
            } catch (err) {
              console.error(err);
              message.error("No se pudo enviar NAT. Intenta de nuevo.");
            } finally {
              setNatSubmitting(false);
            }
          }}
          areasPorFila={areaOption}
        />
      ),
    },
  ];

  return (
     <>
          <Button onClick={()=>{onclick()}}>Regresar</Button>
          <Tabs defaultActiveKey="1" items={Reconocimiento} />
     </>
     );
}
