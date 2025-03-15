import React, { useEffect, useState } from "react";
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
  MenuUnfoldOutlined,
  MenuFoldOutlined,
  CloseOutlined,
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
  const [collapsed, setCollapsed] = useState(false);
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
      const usersData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      console.log("Fetched users:", usersData);

      setUsers(usersData);
    } catch (error) {
      message.error("Error fetching users.");
      console.error(error);
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

      console.log("User updated in Firebase, updating local state...");

      setUsers((prevUsers) => {
        return prevUsers.map((user) =>
          user.id === editingUser.id ? { ...user, ...values } : user
        );
      });

      message.success("User updated successfully!");
      setIsModalOpen(false);

      fetchUsers();
    } catch (error) {
      message.error("Update failed!");
      console.error(error);
    }
  };

  const columns = [
    {
      title: "Username",
      dataIndex: "username",
      key: "username",
      sorter: (a, b) => a.username.localeCompare(b.username),
      align:'center'
    },
    { title: "Email", dataIndex: "email", key: "email" , align:'center' },
    { title: "Mobile", dataIndex: "mobile", key: "mobile" , align:'center'},
    { title: "Gender", dataIndex: "gender", key: "gender" , align:'center' },
    { title: "DOB", dataIndex: "dob", key: "dob" , align:'center'},
    { title: "Address", dataIndex: "address", key: "address" ,align:'center'},
    { title: "Role", dataIndex: "role", key: "role" , align:'center'},
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => {
        if (currentUser?.role === "admin" || currentUser?.id === record.id) {
          return (
            <>
              <Button
                icon={<EditOutlined />}
                onClick={() => handleEdit(record)}
                style={{ marginRight: 8 }}
              />
              {currentUser?.role === "admin" && (
                <Button
                  icon={<DeleteOutlined />}
                  onClick={() => handleDelete(record.id)}
                  danger
                />
              )}
            </>
          );
        }
        return null;
      },
    },
  ];

  const filteredUsers =
    currentUser?.role === "admin"
      ? users.filter((user) => user.id !== currentUser?.id)
      : currentUser
      ? [currentUser]
      : users;

  return (
    <Layout className="dashboard-container">
      <Sider
        theme="dark"
        className="sidebar"
        collapsible
        collapsed={collapsed}
        onCollapse={(value) => setCollapsed(value)}
        breakpoint="lg"
        collapsedWidth="0"
        trigger={null}
        width={250}
      >
        <div className="sidebar-header">
          <div className="logo">Dashboard</div>
          <Button
            icon={<CloseOutlined />}
            onClick={() => setCollapsed(true)}
            className="close-sidebar-btn"
          />
        </div>
        <Menu className="menu-alignment" theme="dark" mode="inline" defaultSelectedKeys={["1"]}>
          <Menu.Item style={{ background:'#e2392c' , borderRadius:'2px' }} key="1" icon={<UserOutlined />}>
            Users
          </Menu.Item>
          <Menu.Item key="2" icon={<LogoutOutlined />} onClick={handleLogout}>
            Logout
          </Menu.Item>
        </Menu>
      </Sider>

      <Layout>
        <Header className="header">
          {React.createElement(collapsed ? MenuUnfoldOutlined : MenuFoldOutlined, {
            className: "trigger",
            onClick: () => setCollapsed(!collapsed),
          })}
          {currentUser ? (
            <span className="welcome-text">Welcome, {currentUser?.username}</span>
          ) : (
            <p style={{ textAlign: "center", color: "#888", fontSize: "16px" }}>
              Fetching user details...
            </p>
          )}
        </Header>

        <Content className="dashboard-content">
          {loading ? (
            <p className="loading-message">Loading users...</p>
          ) : filteredUsers.length > 0 ? (
            <>
            <h2 style={{ textAlign:'center' }}>{currentUser?.role === "admin" ? "Admin Dashboard" : "User Details"}</h2>
            <Card
              
              bordered={false}
              style={{
                margin: "20px",
                boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
                color: "#5b5b5b",
              }}
            >
              <div className="table-responsive">
                <Table
                  dataSource={filteredUsers}
                  columns={columns}
                  rowKey="id"
                  bordered
                  pagination={{ pageSize: 5 }}
                />
              </div>
            </Card>
            </>
          ) : (
            <Card
              bordered={false}
              style={{
                textAlign: "center",
                margin: "20px",
                padding: "20px",
              }}
            >
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
          <Form.Item
            name="username"
            label="Username"
            rules={[{ required: true, message: "Please enter username" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="email"
            label="Email"
            rules={[{ required: true, message: "Please enter email" }]}
          >
            <Input type="email" />
          </Form.Item>
          <Form.Item
            name="mobile"
            label="Mobile"
            rules={[{ required: true, message: "Please enter mobile number" }]}
          >
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