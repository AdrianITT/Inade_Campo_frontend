import React, { useState } from "react";
import { Form, Input, Button, Alert, Card, Spin } from "antd";
import { LockOutlined, UserOutlined } from '@ant-design/icons';
import { useNavigate } from "react-router-dom";
import Login_Api from "../../apis/ApiCampo/LoginApi"; // Asegúrate de que la ruta sea correcta
// import logo from "../../../public/logo192.png";
import "./Login.css";

const Login = () => {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false); // estado para controlar el loading
  const navigate = useNavigate();

  const onFinish = async (values) => {
    setLoading(true); // inicia el spinner
    try {
      const response = await Login_Api.post("", {
        username: values.user,
        password: values.password,
      });

      const { token, user_id, username, rol, organizacion, organizacion_id } = response.data;

      // Guarda los datos en el localStorage
      localStorage.setItem("token", token);
      localStorage.setItem("user_id", user_id);
      localStorage.setItem("username", username);
      localStorage.setItem("rol", rol);
      localStorage.setItem("organizacion", organizacion);
      localStorage.setItem("organizacion_id", organizacion_id);

      setError("");

      // Redirige según el rol del usuario
      if (rol === "Administrador") {
        navigate("/Homeadmin");
      } else {
        navigate("/home");
      }
    } catch (error) {
      setError("Correo o contraseña incorrectos.");
    } finally {
      setLoading(false); // finaliza el spinner
    }
  };

  return (
    <div>
    <div className="center-card">
      <Card className="login-card">
        {/* Contenedor del logo */}
        {/* <div className="login-logo">
          <img src={logo} alt="Simplaxi Logo" />
        </div> */}

        <h1>Iniciar Sesión</h1>

        {error && <Alert message={error} type="error" showIcon />}

        {loading ? (
          <Spin tip="Iniciando sesión...">
            <div style={{ minHeight: 150 }} />
          </Spin>
        ) : (
          <Form
            name="login"
            onFinish={onFinish}
            style={{ marginTop: 20 }}
            layout="vertical"
          >
            <Form.Item
              label="Usuario"
              name="user"
              rules={[
                { required: true, message: "Por favor, ingrese su correo" },
              ]}
            >
              <Input prefix={<UserOutlined />} placeholder="Username" />
            </Form.Item>
            <Form.Item
              label="Contraseña"
              name="password"
              rules={[
                { required: true, message: "Por favor, ingrese su contraseña" },
              ]}
            >
              <Input.Password
                prefix={<LockOutlined />}
                placeholder="Password"
              />
            </Form.Item>
            <Form.Item>
              <Button type="primary" htmlType="submit" block>
                Iniciar Sesión
              </Button>
            </Form.Item>
          </Form>
        )}
      </Card>
    </div>
    </div>
  );
};

export default Login;
