import { Tabs, message, Button } from "antd";
import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { getDataAreaTrabajo } from "./hook/getData";
import { getExisces, getAllDataAreaTrabajo } from '../../../apis/ApiCampo/IluminacionApi.js';
import FormHC from "./HOJACAMPO/FormHC.jsx";
import FormNAT from "./HOJACAMPO/FormNAT.jsx";
import { insertDataLuzART } from "./HOJACAMPO/insertDataART.jsx";
import { insertDataIluminacionNAT } from "./HOJACAMPO/insertDataNAT.jsx";

export default function CreateReconocomietoA() {
  const [areaOption, setAreaOptions] = useState([]);
  const { id } = useParams();
  const navigate = useNavigate();
  const [areaNat, setAreaNat] = useState([]);
  const [areaArt, setAreaArt] = useState([]);
  const POSICION =[{value:"Parado"}, {value:"Sentado"}, {value: "Parado/Sentado"}];


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
        const area_art_nat = await getAllDataAreaTrabajo(id);

        
        setArtSubmitting(c.data.exists_art);
        setNatSubmitting(c.data.exists_nat);
     //    console.log("c: ",c);
        const areas = Array.isArray(r?.data?.areas) ? r.data.areas : [];

        const dataNat = Array.isArray(area_art_nat?.data?.nat) ? area_art_nat.data.nat : [];
        const dataArt = Array.isArray(area_art_nat?.data?.art) ? area_art_nat.data.art : [];

        const natArea = dataNat.map((x) => x.areaTrabajo).filter(Boolean);

        const artArea = dataArt.map((x) => x.areaTrabajo).filter(Boolean);

        if (!cancelled){
          setAreaOptions(areas);
          setAreaArt(artArea);
          setAreaNat(natArea);
        }
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
          areasPorFila={areaArt}
          posicion={POSICION}
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
          areasPorFila={areaNat}
          posicion={POSICION}
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
