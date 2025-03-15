import React, { useState } from "react";
import { Layout, Card, Input, Button, Typography, Form, message } from "antd";
import { LockOutlined, UserOutlined } from "@ant-design/icons";
import { auth } from "../../firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import ResetPassword from "../ResetPassword/ResetPassword";
import { motion } from "framer-motion"; // Import Framer Motion
import "./Login.css";

const { Title, Text } = Typography;
const { Content } = Layout;

const Login = () => {
  const [loading, setLoading] = useState(false);
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null); 

  const navigate = useNavigate();

  const onFinish = async (values) => {
    setLoading(true);
    setErrorMessage(null); 

    try {
      await signInWithEmailAndPassword(auth, values.email, values.password);
      message.success("Login successful!");
      navigate("/dashboard");
    } catch (error) {
      setLoading(false);

      if (error.code === "auth/invalid-login-credentials") {
        setErrorMessage("Invalid email or password. Please try again.");
      } else {
        setErrorMessage("An unexpected error occurred. Please try again later.");
      }
    }
  };

  return (
    <Layout className="auth-container">
      <Content className="auth-main-wrapper">
        {!showResetPassword ? (
          <motion.div
            initial={{ x: -300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 1, ease: "easeOut" }}
          >
            <Card className="auth-card" bordered={false}>
              <>
                <Title level={2} className="auth-title">
                  Welcome Back
                </Title>
                <Text className="auth-subtitle">Sign in to continue</Text>

                {/* Display error message if there is one */}
                {errorMessage && (
                  <div className="error-message">
                    <Text type="danger">{errorMessage}</Text>
                  </div>
                )}

                <Form
                  name="auth-form"
                  onFinish={onFinish}
                  layout="vertical"
                  className="auth-form-wrapper"
                >
                  <Form.Item
                    name="email"
                    rules={[
                      { required: true, type: "email", message: "Please enter a valid email!" },
                    ]}
                  >
                    <Input
                      prefix={<UserOutlined className="auth-icon" />}
                      placeholder="Email"
                      className="auth-input"
                    />
                  </Form.Item>

                  <Form.Item
                    name="password"
                    rules={[{ required: true, message: "Please enter your password!" }]}
                  >
                    <Input.Password
                      prefix={<LockOutlined className="auth-icon" />}
                      placeholder="Password"
                      className="auth-input"
                    />
                  </Form.Item>

                  <Button
                    type="primary"
                    htmlType="submit"
                    className="auth-submit-btn"
                    loading={loading}
                  >
                    Login
                  </Button>
                </Form>

                <Text className="auth-footer">
                  <a
                    onClick={() => setShowResetPassword(true)}
                    className="auth-forgot-link"
                  >
                    Forgot Password?
                  </a>
                </Text>

                <Text className="auth-footer">
                  Don't have an account?{" "}
                  <a href="/register" className="auth-signup-link">
                    Sign up
                  </a>
                </Text>
              </>
            </Card>
          </motion.div>
        ) : (
          <ResetPassword onBack={() => setShowResetPassword(false)} />
        )}
      </Content>
    </Layout>
  );
};

export default Login;