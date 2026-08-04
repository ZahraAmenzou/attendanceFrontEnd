import { useEffect, useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { axiosInstance } from "../api/axios";
import { Card, Button, Typography, Modal, Form, Input, message, Space, Avatar } from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined, UserOutlined, MailOutlined } from "@ant-design/icons";

const { Title, Text } = Typography;

export default function Teachers() {
  const { token } = useContext(AuthContext);
  const [teachers, setTeachers] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();

  const fetchTeachers = async () => {
    const res = await axiosInstance.get("/users/teacher", {
      headers: { Authorization: `Bearer ${token}` }
    });
    setTeachers(res.data);
  };

  useEffect(() => { fetchTeachers(); }, []);

  const openAdd = () => {
    setEditing(null);
    form.resetFields();
    setModalOpen(true);
  };

  const openEdit = (t) => {
    setEditing(t);
    form.setFieldsValue({ name: t.name, email: t.email });
    setModalOpen(true);
  };

  const submit = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);
      if (editing) {
        await axiosInstance.put(`/users/teacher/${editing._id}`, {
          name: values.name,
          email: values.email,
        }, { headers: { Authorization: `Bearer ${token}` } });
        message.success("Teacher updated");
      } else {
        await axiosInstance.post("/users/teacher", values, {
          headers: { Authorization: `Bearer ${token}` }
        });
        message.success("Teacher added");
      }
      setModalOpen(false);
      fetchTeachers();
    } catch (err) {
      if (err.response) message.error(err.response?.data?.message || "Error");
    } finally {
      setLoading(false);
    }
  };

  const deleteTeacher = async (id) => {
    Modal.confirm({
      title: "Delete teacher?",
      okText: "Delete",
      okType: "danger",
      onOk: async () => {
        try {
          await axiosInstance.delete(`/users/teacher/${id}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          message.success("Teacher deleted");
          fetchTeachers();
        } catch (err) {
          message.error(err.response?.data?.message || "Error");
        }
      },
    });
  };

  const initials = (name = "") => name.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2);

  return (
    <div style={{ maxWidth: 720, margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, gap: 12, flexWrap: "wrap" }}>
        <div>
          <Title level={4} style={{ margin: 0 }}>Teachers</Title>
          <Text type="secondary">{teachers.length} registered</Text>
        </div>
        <Button type="primary" icon={<PlusOutlined />} onClick={openAdd}>Add teacher</Button>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {teachers.map((t) => (
          <Card key={t._id} style={{ borderRadius: 10 }} hoverable>
            <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
              <Avatar size={44} style={{ background: "#eef2ff", color: "#4f46e5", fontWeight: 600, flexShrink: 0 }}>
                {initials(t.name)}
              </Avatar>
              <div style={{ flex: 1, minWidth: 0 }}>
                <Text strong style={{ fontSize: 15 }}>{t.name}</Text>
                <br />
                <Text type="secondary" style={{ fontSize: 13 }}>
                  <MailOutlined style={{ marginRight: 4 }} />{t.email}
                </Text>
              </div>
              <Space>
                <Button type="text" icon={<EditOutlined />} onClick={() => openEdit(t)} />
                <Button type="text" danger icon={<DeleteOutlined />} onClick={() => deleteTeacher(t._id)} />
              </Space>
            </div>
          </Card>
        ))}
      </div>

      <Modal
        title={editing ? "Edit teacher" : "New teacher"}
        open={modalOpen}
        onOk={submit}
        onCancel={() => setModalOpen(false)}
        confirmLoading={loading}
        okText={editing ? "Save changes" : "Add teacher"}
      >
        <Form form={form} layout="vertical" requiredMark={false}>
          <Form.Item
            label="Full name"
            name="name"
            rules={[{ required: true, message: "Name is required" }]}
          >
            <Input placeholder="Mohammed Cherkaoui" />
          </Form.Item>
          <Form.Item
            label="Email"
            name="email"
            rules={[
              { required: true, message: "Email is required" },
              { type: "email", message: "Invalid email format" },
            ]}
          >
            <Input placeholder="m.cherkaoui@school.ma" />
          </Form.Item>
          {!editing && (
            <Form.Item
              label="Password"
              name="password"
              rules={[
                { required: true, message: "Password is required" },
                { min: 6, message: "At least 6 characters" },
              ]}
            >
              <Input.Password placeholder="••••••••" />
            </Form.Item>
          )}
        </Form>
      </Modal>
    </div>
  );
}
