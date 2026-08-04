import { useState, useContext } from "react";
import { Form, Input, Button, Card, Typography, message } from "antd";
import { MailOutlined, LockOutlined, SafetyCertificateOutlined } from "@ant-design/icons";
import { login } from "../services/authService";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

const { Title, Text } = Typography;

export default function Login() {
  const [loading, setLoading] = useState(false);
  const { loginUser } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogin = async (values) => {
    setLoading(true);
    try {
      const res = await login(values);
      loginUser(res.data.token, res.data.user);
      const role = res.data.user.role;
      navigate(role === "teacher" ? "/attendance" : "/");
    } catch (err) {
      message.error(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #eef2ff 0%, #e0e7ff 100%)",
      }}
    >
      <Card
        style={{ width: "100%", maxWidth: 400, margin: "0 16px", borderRadius: 12, boxShadow: "0 4px 24px rgba(0,0,0,0.06)" }}
        styles={{ body: { padding: 32 } }}
      >
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <SafetyCertificateOutlined style={{ fontSize: 40, color: "#4f46e5", marginBottom: 12 }} />
          <Title level={3} style={{ margin: 0 }}>Smart Attendance</Title>
          <Text type="secondary">Sign in to continue</Text>
        </div>

        <Form
          layout="vertical"
          onFinish={handleLogin}
          autoComplete="off"
          requiredMark={false}
        >
          <Form.Item
            label="Email"
            name="email"
            rules={[
              { required: true, message: "Please enter your email" },
              { type: "email", message: "Invalid email format" },
            ]}
          >
            <Input
              prefix={<MailOutlined style={{ color: "#9ca3af" }} />}
              placeholder="admin@school.ma"
              size="large"
            />
          </Form.Item>

          <Form.Item
            label="Password"
            name="password"
            rules={[{ required: true, message: "Please enter your password" }]}
          >
            <Input.Password
              prefix={<LockOutlined style={{ color: "#9ca3af" }} />}
              placeholder="••••••••"
              size="large"
            />
          </Form.Item>

          <Form.Item style={{ marginBottom: 0 }}>
            <Button type="primary" htmlType="submit" loading={loading} block size="large">
              Sign in
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
}
