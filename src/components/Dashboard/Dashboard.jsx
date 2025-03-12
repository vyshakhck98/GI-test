import React, { useEffect, useState, useMemo } from "react";
import {
  Layout,
  Table,
  Button,
  Menu,
  message,
  Modal,
  Form,
  Input,
  Select,
  Card,
} from "antd";
import {
  UserOutlined,
  LogoutOutlined,
  EditOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import { auth, db } from "../../firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import {
  collection,
  getDocs,
  doc,
  getDoc,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import "./Dashboard.css";

const { Header, Sider, Content } = Layout;
const { Option } = Select;

const Dashboard = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [form] = Form.useForm();
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        setCurrentUser(null);
        navigate("/");
        return;
      }

      try {
        const userRef = doc(db, "users", user.uid);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
          const userData = userSnap.data();
          setCurrentUser({ id: user.uid, ...userData });


          fetchUsers();
        }
      } catch (error) {
        message.error("Failed to fetch user details.");
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const querySnapshot = await getDocs(collection(db, "users"));
      const usersData = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setUsers(usersData);
    } catch (error) {
      message.error("Error fetching users.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      message.success("Logged out successfully!");
      navigate("/");
    } catch (error) {
      message.error("Logout failed!");
    }
  };

  const handleEdit = (user) => {
    setEditingUser(user);
    form.setFieldsValue(user);
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    try {
      await deleteDoc(doc(db, "users", id));
      message.success("User deleted successfully!");
      fetchUsers();
    } catch (error) {
      message.error("Failed to delete user.");
    }
  };

  const handleUpdate = async (values) => {
    if (!editingUser) return;
    try {
      await updateDoc(doc(db, "users", editingUser.id), values);
      message.success("User updated successfully!");
      setIsModalOpen(false);
      fetchUsers();
    } catch (error) {
      message.error("Update failed!");
    }
  };

  const columns = useMemo(
    () => [
      { title: "Username", dataIndex: "username", key: "username", sorter: (a, b) => a.username.localeCompare(b.username) },
      { title: "Email", dataIndex: "email", key: "email" },
      { title: "Mobile", dataIndex: "mobile", key: "mobile" },
      { title: "Gender", dataIndex: "gender", key: "gender" },
      { title: "DOB", dataIndex: "dob", key: "dob" },
      { title: "Address", dataIndex: "address", key: "address" },
      { title: "Role", dataIndex: "role", key: "role" },
      {
        title: "Actions",
        key: "actions",
        render: (_, record) => {
          if (currentUser?.role === "admin" || currentUser?.id === record.id) {
            return (
              <>
                <Button icon={<EditOutlined />} onClick={() => handleEdit(record)} style={{ marginRight: 8 }} />
                {currentUser?.role === "admin" && (
                  <Button icon={<DeleteOutlined />} onClick={() => handleDelete(record.id)} danger />
                )}
              </>
            );
          }
          return null;
        },
      },
    ],
    [currentUser]
  );

  // Memoize the filtered list of users
  const filteredUsers = useMemo(() => {
    if (currentUser?.role === "admin") {
      return users.filter(user => user.id !== currentUser?.id); // Exclude the logged-in admin from the list
    } else if (currentUser) {
      return [currentUser]; // Display only the logged-in user's details if not an admin
    }
    return users;
  }, [users, currentUser]);

  return (
    <Layout className="dashboard-container">
      <Sider theme="dark" className="sidebar">
        <div className="logo">Dashboard</div>
        <Menu theme="dark" mode="inline" defaultSelectedKeys={["1"]}>
          <Menu.Item key="1" icon={<UserOutlined />}> Users </Menu.Item>
          <Menu.Item key="2" icon={<LogoutOutlined />} onClick={handleLogout}> Logout </Menu.Item>
        </Menu>
      </Sider>

      <Layout>
        <Header className="header">
          {currentUser ? (
            <span className="welcome-text">Welcome, {currentUser?.username}</span>
          ) : (
            <p style={{ textAlign: "center", color: "#888", fontSize: "16px" }}>Fetching user details...</p>
          )}
        </Header>

        <Content className="dashboard-content">
          {loading ? (
            <p className="loading-message">Loading users...</p>
          ) : filteredUsers.length > 0 ? (
            <Card title={currentUser?.role === "admin" ? "Users" : "User Details"} bordered={false} style={{ margin: "20px", boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)", color:'#5b5b5b' }}>
              <Table 
                dataSource={filteredUsers} 
                columns={columns} 
                rowKey="id" 
                bordered 
                pagination={{ pageSize: 5 }} 
              />
            </Card>
          ) : (
            <Card bordered={false} style={{ textAlign: "center", margin: "20px", padding: "20px" }}>
              <p style={{ color: "#888", fontSize: "16px" }}>No users available.</p>
            </Card>
          )}
        </Content>
      </Layout>

      <Modal
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        onOk={() => form.submit()}
        className="custom-modal"
      >
        <Form form={form} onFinish={handleUpdate} layout="vertical">
          <Form.Item name="username" label="Username" rules={[{ required: true, message: "Please enter username" }]}>
            <Input />
          </Form.Item>
          <Form.Item name="email" label="Email" rules={[{ required: true, message: "Please enter email" }]}>
            <Input type="email" />
          </Form.Item>
          <Form.Item name="mobile" label="Mobile" rules={[{ required: true, message: "Please enter mobile number" }]}>
            <Input />
          </Form.Item>
          <Form.Item name="gender" label="Gender">
            <Select>
              <Option value="male">Male</Option>
              <Option value="female">Female</Option>
              <Option value="other">Other</Option>
            </Select>
          </Form.Item>
          <Form.Item name="dob" label="Date of Birth">
            <Input type="date" />
          </Form.Item>
          <Form.Item name="address" label="Address">
            <Input.TextArea />
          </Form.Item>
        </Form>
      </Modal>
    </Layout>
  );
};

export default Dashboard;
