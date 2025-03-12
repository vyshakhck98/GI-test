import React, { useState } from "react";
import { Card, Input, Button, Typography, Form, message } from "antd";
import { MailOutlined } from "@ant-design/icons";
import { auth } from "../../firebase";
import { sendPasswordResetEmail } from "firebase/auth";

const { Title, Text } = Typography;

const ResetPassword = ({ onBack }) => {
  const [loading, setLoading] = useState(false);

  const onFinish = async (values) => {
    setLoading(true);
    try {
      await sendPasswordResetEmail(auth, values.email);
      message.success("Password reset email sent!");
      onBack(); 
    } catch (error) {
      message.error("Error sending reset email!");
    }
    setLoading(false);
  };

  return (
    <div>
      <Title level={2} className="login-title">Reset Password</Title>
      <Text className="login-subtitle">Enter your email to reset your password</Text>

      <Form name="reset-form" onFinish={onFinish} layout="vertical" className="login-form">
        <Form.Item name="email" rules={[{ required: true, message: "Please enter your email!", type: "email" }]}> 
          <Input prefix={<MailOutlined className="input-icon" />} placeholder="Email" className="input-field" />
        </Form.Item>

        <Button type="primary" htmlType="submit" className="submit-button" loading={loading}>
          Send Reset Email
        </Button>

        <Button type="link" onClick={onBack} className="back-button">Back to Login</Button>
      </Form>
    </div>
  );
};

export default ResetPassword;
