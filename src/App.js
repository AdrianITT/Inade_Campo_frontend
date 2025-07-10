import logo from './logo.svg';
import React, { useState, useRef } from 'react';
import './App.css';
import FormularioProtocoloMuestreo from './components/FormularioProtocoloMuestreo/FormularioProtocoloMuestreo';
import HojaCampoMuestreo from './components/HojaCampoMuestreo/HojaCampoMuestreo';
import FormularioCroquisUbicacion from './components/FormularioCroquisUbicacion/FormularioCroquisUbicacion';
import useConfirmLeave from "./components/hooks/useConfirmLeave";
// import TablaInformeAguas from './components/TablaInformeAguas/TablaInformeAguas';
import { Collapse, Col, Row, Button } from 'antd';



function App() {
    const [activePanelKey, setActivePanelKey] = useState("1");
     const punto1Ref = useRef(null);
     const punto2Ref = useRef(null);
  return (
    <div
    style={{ maxWidth: 800, margin: "0 auto", paddingTop: '80px' }}
    >
      <Collapse defaultActiveKey={['1']}>
        <Collapse.Panel header="Protocolo de Muestreo" key="1">
        <div ref={punto2Ref} className="panel-header-sticky">
            <Row justify="space-between" align="middle">
              <Col>
                <h3 style={{ margin: 0 }}> Protocolo de Muestreo</h3>
              </Col>
              <Col>
                {/* <Button 
                  type="primary" 
                  onClick={(e) => {
                    e.stopPropagation(); 
                    setActivePanelKey("2");
                    setTimeout(() => {
                      const top = punto2Ref.current?.getBoundingClientRect().top + window.scrollY - 100;
                      window.scrollTo({ top, behavior: 'smooth' });
                    }, 200);
                  }}
                >
                  Guardar
                </Button> */}
              </Col>
            </Row>
          </div>
          <FormularioProtocoloMuestreo/>
        </Collapse.Panel>
        <Collapse.Panel header="Hoja de Campo" key="2">
          <div ref={punto1Ref} className="panel-header-sticky">
            <Row justify="space-between" align="middle">
              <Col>
                <h3 style={{ margin: 0 }}> Hoja de Campo</h3>
              </Col>
              <Col>
                {/* <Button 
                  type="primary" 
                  onClick={(e) => {
                    e.stopPropagation(); 
                    setActivePanelKey(null);
                    setTimeout(() => {
                      const top = punto1Ref.current?.getBoundingClientRect().top + window.scrollY - 100;
                      window.scrollTo({ top, behavior: 'smooth' });
                    }, 200);
                  }}
                >
                  Guardar
                </Button> */}
              </Col>
            </Row>
          </div>
          <HojaCampoMuestreo/>
        </Collapse.Panel>
        </Collapse>
      {/* 
      */}
      <h1>FormularioCroquisUbicacion</h1>
      <FormularioCroquisUbicacion/>

      {/* <h1>TablaInformeAguas</h1>
      <TablaInformeAguas/> */}
    </div>
  );
}

export default App;
