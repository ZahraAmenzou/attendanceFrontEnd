import { useEffect, useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { axiosInstance } from "../api/axios";
import { Card, Button, Typography, Modal, Form, Input, Select, message, Space, Tag } from "antd";
import { EyeOutlined, PlusOutlined, EditOutlined, DeleteOutlined, BankOutlined, BookOutlined, TeamOutlined } from "@ant-design/icons";

const { Title, Text } = Typography;

export default function Classes() {
  const { token } = useContext(AuthContext);
  const [classes, setClasses] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();

  const [detailOpen, setDetailOpen] = useState(false);
  const [detailClass, setDetailClass] = useState(null);
  const [detailStudents, setDetailStudents] = useState([]);
  const [detailLoading, setDetailLoading] = useState(false);

  const fetchAll = async () => {
    const res = await axiosInstance.get("/classes", { headers: { Authorization: `Bearer ${token}` } });
    setClasses(res.data);
  };

  useEffect(() => { fetchAll(); }, [token]);

  const openAdd = () => {
    setEditing(null);
    form.resetFields();
    setModalOpen(true);
  };

  const openEdit = (c) => {
    setEditing(c);
    form.setFieldsValue({ name: c.name });
    setModalOpen(true);
  };

  const submit = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);
      if (editing) {
        await axiosInstance.put(`/classes/${editing._id}`, values, {
          headers: { Authorization: `Bearer ${token}` }
        });
        message.success("Class updated");
      } else {
        await axiosInstance.post("/classes", values, {
          headers: { Authorization: `Bearer ${token}` }
        });
        message.success("Class created");
      }
      setModalOpen(false);
      fetchAll();
    } catch (err) {
      if (err.response) message.error(err.response?.data?.message || "Error");
    } finally {
      setLoading(false);
    }
  };

  const deleteClass = async (id) => {
    Modal.confirm({
      title: "Delete class?",
      content: "This will also delete all students and attendance records in this class.",
      okText: "Delete",
      okType: "danger",
      onOk: async () => {
        try {
          await axiosInstance.delete(`/classes/${id}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          message.success("Class deleted");
          fetchAll();
        } catch (err) {
          message.error(err.response?.data?.message || "Error");
        }
      },
    });
  };

  const showDetail = async (c) => {
    setDetailClass(c);
    setDetailOpen(true);
    setDetailLoading(true);
    try {
      const res = await axiosInstance.get(`/students/class/${c._id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setDetailStudents(res.data);
    } catch {
      message.error("Failed to load students");
    } finally {
      setDetailLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 720, margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <div>
          <Title level={4} style={{ margin: 0 }}>Classes</Title>
          <Text type="secondary">{classes.length} classes</Text>
        </div>
        <Button type="primary" icon={<PlusOutlined />} onClick={openAdd}>Add class</Button>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {classes.map((c) => (
          <Card key={c._id} style={{ borderRadius: 10 }} hoverable>
            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <div style={{
                width: 44, height: 44, borderRadius: 10,
                background: "#eef2ff", display: "flex", alignItems: "center", justifyContent: "center",
                flexShrink: 0,
              }}>
                <BankOutlined style={{ color: "#4f46e5", fontSize: 18 }} />
              </div>
              <div style={{ flex: 1 }}>
                <Text strong style={{ fontSize: 15 }}>{c.name}</Text>
              </div>
              <Space>
                <Button type="text" icon={<EyeOutlined />} onClick={() => showDetail(c)} />
                <Button type="text" icon={<EditOutlined />} onClick={() => openEdit(c)} />
                <Button type="text" danger icon={<DeleteOutlined />} onClick={() => deleteClass(c._id)} />
              </Space>
            </div>
          </Card>
        ))}
      </div>

      <Modal
        title={editing ? "Edit class" : "New class"}
        open={modalOpen}
        onOk={submit}
        onCancel={() => setModalOpen(false)}
        confirmLoading={loading}
        okText={editing ? "Save changes" : "Create class"}
      >
        <Form form={form} layout="vertical" requiredMark={false}>
          <Form.Item
            label="Class name"
            name="name"
            rules={[{ required: true, message: "Class name is required" }]}
          >
            <Input placeholder="3eme Informatique A" />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title={detailClass?.name || "Class details"}
        open={detailOpen}
        onCancel={() => setDetailOpen(false)}
        footer={null}
        width={600}
      >
        {detailClass && (
          <>
            <div style={{ marginBottom: 20, padding: "0 2px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                <BankOutlined style={{ color: "#4f46e5" }} />
                <Text strong style={{ fontSize: 16 }}>{detailClass.name}</Text>
              </div>
            </div>

            <Title level={5} style={{ margin: 0, marginBottom: 12 }}>
              <TeamOutlined style={{ marginRight: 6 }} />
              Students ({detailStudents.length})
            </Title>

            {detailLoading ? (
              <Text type="secondary">Loading...</Text>
            ) : detailStudents.length === 0 ? (
              <Text type="secondary">No students enrolled</Text>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {detailStudents.map((s, i) => {
                  const initials = `${s.firstName?.[0] || ""}${s.lastName?.[0] || ""}`.toUpperCase();
                  return (
                    <div key={s._id} style={{
                      display: "flex", alignItems: "center", gap: 10,
                      padding: "8px 12px", borderRadius: 8,
                      background: i % 2 === 0 ? "#f8fafc" : "transparent",
                    }}>
                      <div style={{
                        width: 30, height: 30, borderRadius: "50%",
                        background: "#eef2ff", color: "#4f46e5",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: 10, fontWeight: 600, flexShrink: 0,
                      }}>
                        {initials}
                      </div>
                      <Text style={{ flex: 1 }}>{s.firstName} {s.lastName}</Text>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}
      </Modal>
    </div>
  );
}