import {
    Modal,
    Input,
    Button,
    Row,
    Col,
    Result,
} from "antd";

const ModalExito = ({ visible, onClose }) => {
  return (
    <Modal
      title="Exito"
      visible={visible}
      onCancel={onClose}
      footer={null}
    >
      {/* Aquí puedes agregar el formulario para crear tierras físicas */}
      <Result
      status="success"
      title="Operacion realizada con exito"
      />
    </Modal>
  );
};

export default ModalExito;