import React, { useState } from "react";
import { auth, db } from "../../firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { setDoc, doc } from "firebase/firestore";
import { Form, Input, Button, message, Select, DatePicker, Layout, Card, Typography, Row, Col } from "antd";
import { UserOutlined, MailOutlined, PhoneOutlined, HomeOutlined, LockOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import { useNavigate } from "react-router-dom";
import "./Register.css";

const { Title, Text } = Typography;
const { Content } = Layout;

const Register = () => {
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState(null); // Track API errors
  const navigate = useNavigate();

  const onFinish = async (values) => {
    setLoading(true);
    setApiError(null); // Reset error before making the request

    try {
      if (!values.dob) {
        message.error("Date of Birth is required!");
        setLoading(false);
        return;
      }

      const userCredential = await createUserWithEmailAndPassword(auth, values.email, values.password);

      // Create user in Firestore database
      await setDoc(doc(db, "users", userCredential.user.uid), {
        username: values.username,
        email: values.email,
        mobile: values.mobile,
        gender: values.gender,
        dob: values.dob.format("YYYY-MM-DD"),
        address: values.address,
        role: "user",
      });

      message.success("Registration successful! You can now log in.");
      navigate("/");

    } catch (error) {
      setLoading(false);

      // Handle Firebase Auth error
      if (error.code) {
        message.error(`Error: ${error.message}`);
      } else {
        // Handle unexpected errors from Firestore or other issues
        message.error("An unexpected error occurred. Please try again later.");
        setApiError(error.message); // Set API error to display in the card
      }
    }
  };

  return (
    <Layout className="main-container">
      <Content className="register-main-container">
        <Card className="register-card" bordered={false}>
          <Form name="register-form" onFinish={onFinish} layout="vertical" className="register-form">
            <Form.Item
              name="username"
              rules={[
                { required: true, message: "Please enter your username!" },
                { min: 3, max: 20, message: "Username must be between 3 and 20 characters!" },
                { pattern: /^[a-zA-Z0-9]+$/, message: "Username must be alphanumeric!" }
              ]}
            >
              <Input prefix={<UserOutlined />} placeholder="Username" />
            </Form.Item>

            <Form.Item
              name="email"
              rules={[{ required: true, type: "email", message: "Please enter a valid email!" }]}
            >
              <Input prefix={<MailOutlined />} placeholder="Email" />
            </Form.Item>

            <Form.Item
              name="password"
              rules={[
                { required: true, min: 6, message: "Password must be at least 6 characters!" },
                { pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/, message: "Password must contain at least one uppercase letter, one number, and one special character!" }
              ]}
            >
              <Input.Password prefix={<LockOutlined />} placeholder="Password" />
            </Form.Item>

            <Form.Item
              name="confirmPassword"
              dependencies={["password"]}
              rules={[
                { required: true, message: "Please confirm your password!" },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue("password") === value) {
                      return Promise.resolve();
                    }
                    return Promise.reject(new Error("Passwords do not match!"));
                  },
                }),
              ]}
            >
              <Input.Password prefix={<LockOutlined />} placeholder="Confirm Password" />
            </Form.Item>

            <Form.Item
              name="mobile"
              rules={[
                { required: true, message: "Please enter your mobile number!" },
                { pattern: /^[0-9]{10}$/, message: "Please enter a valid 10-digit mobile number!" }
              ]}
            >
              <Input prefix={<PhoneOutlined />} placeholder="Mobile" />
            </Form.Item>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="gender"
                  rules={[{ required: true, message: "Please select your gender!" }]}
                >
                  <Select placeholder="Select Gender">
                    <Select.Option value="male">Male</Select.Option>
                    <Select.Option value="female">Female</Select.Option>
                    <Select.Option value="other">Other</Select.Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="dob"
                  rules={[
                    { required: true, message: "Please select your date of birth!" },
                    ({ getFieldValue }) => ({
                      validator(_, value) {
                        if (value && dayjs().diff(value, 'years') < 18) {
                          return Promise.reject(new Error("You must be at least 18 years old!"));
                        }
                        return Promise.resolve();
                      },
                    }),
                  ]}
                >
                  <DatePicker placeholder="Date of Birth" format="YYYY-MM-DD" />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item
              name="address"
              rules={[{ required: true, message: "Please enter your address!" }]}
            >
              <Input prefix={<HomeOutlined />} placeholder="Address" />
            </Form.Item>

            <Button type="primary" htmlType="submit" loading={loading} className="submit-button">
              Register
            </Button>
          </Form>

          {/* Display API error message if there is one */}
          {apiError && (
            <Card className="error-card" style={{ marginTop: "20px", borderColor: "red" }}>
              <Typography.Text type="danger">{apiError}</Typography.Text>
            </Card>
          )}

          <Text className="register-footer">
            Already have an account? <a href="/" className="footer-link">Login</a>
          </Text>
        </Card>
      </Content>
    </Layout>
  );
};

export default Register;
