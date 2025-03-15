import React, { useState } from "react";
import { Card, Input, Button, Typography, Form, message } from "antd";
import { MailOutlined } from "@ant-design/icons";
import { auth } from "../../firebase";
import { sendPasswordResetEmail } from "firebase/auth";
import { motion } from "framer-motion"; 
import "./ResetPassword.css"; 

const { Title, Text } = Typography;

const ResetPassword = ({ onBack }) => {
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null); 

  const onFinish = async (values) => {
    setLoading(true);
    setErrorMessage(null);

    try {
      await sendPasswordResetEmail(auth, values.email);
      message.success("Password reset email sent!");
      onBack();
    } catch (error) {
      setLoading(false);


      if (error.code === "auth/user-not-found") {
        setErrorMessage("No user found with this email address. Please check and try again.");
      } else {
        setErrorMessage("An unexpected error occurred. Please try again later.");
      }
    }
  };

  return (
    <div className="reset-password-container">
      <motion.div
        initial={{ x: -300, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 1, ease: "easeOut" }}
      >
        <Card className="reset-password-card" bordered={false}>
          <Title level={2} className="reset-password-title">
            Reset Password
          </Title>
          <Text className="reset-password-subtitle">
            Enter your email to reset your password
          </Text>

          {/* Display error message if there is one */}
          {errorMessage && (
            <div className="error-message">
              <Text type="danger">{errorMessage}</Text>
            </div>
          )}

          <Form
            name="reset-form"
            onFinish={onFinish}
            layout="vertical"
            className="reset-password-form"
          >
            <Form.Item
              name="email"
              rules={[
                { required: true, message: "Please enter your email!", type: "email" },
              ]}
            >
              <Input
                prefix={<MailOutlined className="reset-password-icon" />}
                placeholder="Email"
                className="reset-password-input"
              />
            </Form.Item>

            <Button
              type="primary"
              htmlType="submit"
              className="reset-password-submit-button"
              loading={loading}
            >
              Send Reset Email
            </Button>

            <Button
              type="link"
              onClick={onBack}
              className="reset-password-back-button"
            >
              Back to Login
            </Button>
          </Form>
        </Card>
      </motion.div>
    </div>
  );
};

export default ResetPassword;