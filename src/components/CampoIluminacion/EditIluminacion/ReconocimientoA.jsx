// CreateReconocomietoA.jsx
import { Tabs, message } from "antd";
import { useState } from "react";
import FormatoA from "./FOR-M-001A/FORA";
// import FormatoB from "./FOR-M-001B/FORB";

export default function CreateReconocomietoA() {
  const [activeKey, setActiveKey] = useState("1");
  const [aDone, setADone] = useState(false);

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
      label: "FOR-M-001A",
      children: (
        <FormatoA
          onFinishOK={() => {
            setADone(true);
            setActiveKey("2");
          }}
        />
      ),
    },
    // {
    //   key: "2",
    //   label: "FOR-M-001B",
    //   children: <FormatoB />,
    // },
  ];

  return (
    <Tabs activeKey={activeKey} items={items} onChange={onChange} />
  );
}
