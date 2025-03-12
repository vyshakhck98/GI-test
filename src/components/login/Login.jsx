import React, { useState } from "react";
import { Layout, Card, Input, Button, Typography, Form, message } from "antd";
import { LockOutlined, UserOutlined } from "@ant-design/icons";
import { auth } from "../../firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import ResetPassword from "../ResetPassword/ResetPassword";
import "./Login.css";

const { Title, Text } = Typography;
const { Content } = Layout;

const Login = () => {
  const [loading, setLoading] = useState(false);
  const [showResetPassword, setShowResetPassword] = useState(false);

  const navigate = useNavigate();

  const onFinish = async (values) => {
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, values.email, values.password);
      message.success("Login successful!");
      navigate("/dashboard");
    } catch (error) {
      message.error("Invalid email or password!");
    }
    setLoading(false);
  };

  return (
    <Layout className="auth-container">
      <Content className="auth-main-wrapper">
        <Card className="auth-card" bordered={false}>
          {!showResetPassword ? (
            <>
              <Title level={2} className="auth-title">Welcome Back</Title>
              <Text className="auth-subtitle">Sign in to continue</Text>

              <Form name="auth-form" onFinish={onFinish} layout="vertical" className="auth-form-wrapper">
                <Form.Item name="email" rules={[{ required: true, type: "email", message: "Please enter a valid email!" }]}>
                  <Input prefix={<UserOutlined className="auth-icon" />} placeholder="Email" className="auth-input" />
                </Form.Item>

                <Form.Item name="password" rules={[{ required: true, message: "Please enter your password!" }]}>
                  <Input.Password prefix={<LockOutlined className="auth-icon" />} placeholder="Password" className="auth-input" />
                </Form.Item>

                <Button type="primary" htmlType="submit" className="auth-submit-btn" loading={loading}>
                  Login
                </Button>
              </Form>

              <Text className="auth-footer">
                <a onClick={() => setShowResetPassword(true)} className="auth-forgot-link">Forgot Password?</a>
              </Text>

              <Text className="auth-footer">
                Don't have an account? <a href="/register" className="auth-signup-link">Sign up</a>
              </Text>
            </>
          ) : (
            <ResetPassword onBack={() => setShowResetPassword(false)} />
          )}
        </Card>
      </Content>
    </Layout>
  );
};

export default Login;
