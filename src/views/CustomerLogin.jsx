import { useState } from "react";
import { Form, Input, Button, notification, Typography } from "antd";
import { LockOutlined, UserOutlined } from "@ant-design/icons";
import Particles from "react-tsparticles";
import { loadFull } from "tsparticles";
import "../assets/styles/customerLogin.css"; // Include updated styles
import axios from "./../helpers/axiosConfig";
import API_ENDPOINTS from "../config/apiConfig";

const { Title, Text } = Typography;

const CustomerLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = () => {
    if (!email || !password) {
      notification.error({
        message: "Invalid Input",
        description: "Please enter both email and password!",
      });
      return;
    }
    axios
      .post(`${API_ENDPOINTS.CUSTOMERS}/login`, {
        email,
        password,
      })
      .then((response) => {
        const { data } = response;
        console.log("Login response: ", data);
        if (data?.status === "success") {
          notification.success({
            message: "Login successful",
            description: "Redirecting to dashboard...",
          });
          localStorage.setItem("userData", JSON.stringify(data?.data));
          window.location.href = "/customer-dashboard";
        } else {
          notification.error({
            message: "Login failed",
            description: "Please check your credentials.",
          });
        }
      })
      .catch((error) => {
        console.error("Error logging in: ", error);
        notification.error({
          message: "Login failed",
          description: "Please check your credentials.",
        });
      });
  };

  const particlesInit = async (main) => {
    await loadFull(main);
  };

  const particlesOptions = {
    background: { color: { value: "#f0f0f0" } },
    particles: {
      number: { value: 200, density: { enable: true, value_area: 800 } },
      color: { value: "#4a90e2" }, // Dark color for particles
      shape: { type: "circle" },
      opacity: { value: 0.4 },
      size: { value: 4, random: true },
      move: { enable: true, speed: 1.5, outMode: "out" },
    },
    interactivity: {
      events: { onHover: { enable: true, mode: "repulse" } },
      modes: { repulse: { distance: 100, duration: 0.4 } },
    },
  };

  return (
    <div className="customer-login-container">
      <Particles
        className="particles-bg"
        init={particlesInit}
        options={particlesOptions}
      />

      <div className="login-content">
        <div className="header-container">
          <Title level={2} className="header-title">
            Welcome to OneHealth
          </Title>
        </div>

        <div className="form-container">
          <Form name="customer-login" layout="vertical" onFinish={handleLogin}>
            <Form.Item
              label={<Text strong>Email</Text>}
              name="email"
              rules={[{ required: true, message: "Please input your email!" }]}
            >
              <Input
                prefix={<UserOutlined />}
                placeholder="Enter your email"
                onChange={(e) => setEmail(e.target.value)}
              />
            </Form.Item>

            <Form.Item
              label={<Text strong>Password</Text>}
              name="password"
              rules={[
                { required: true, message: "Please input your password!" },
              ]}
            >
              <Input.Password
                prefix={<LockOutlined />}
                placeholder="Enter your password"
                onChange={(e) => setPassword(e.target.value)}
              />
            </Form.Item>

            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                block
                className="login-button"
              >
                Login
              </Button>
            </Form.Item>
          </Form>
        </div>
      </div>
    </div>
  );
};

export default CustomerLogin;
