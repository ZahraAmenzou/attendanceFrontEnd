import { useEffect, useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { axiosInstance } from "../api/axios";
import { Card, Button, Typography, Modal, Form, Input, message, Space } from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined, BookOutlined, CodeOutlined } from "@ant-design/icons";

const { Title, Text } = Typography;

export default function Subjects() {
  const { token } = useContext(AuthContext);
  const [subjects, setSubjects] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();

  const fetchSubjects = async () => {
    const res = await axiosInstance.get("/subjects", {
      headers: { Authorization: `Bearer ${token}` },
    });
    setSubjects(res.data);
  };

  useEffect(() => { fetchSubjects(); }, [token]);

  const openAdd = () => {
    setEditing(null);
    form.resetFields();
    setModalOpen(true);
  };

  const openEdit = (s) => {
    setEditing(s);
    form.setFieldsValue({ name: s.name, code: s.code || "", description: s.description || "" });
    setModalOpen(true);
  };

  const submit = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);
      if (editing) {
        await axiosInstance.put(`/subjects/${editing._id}`, values, {
          headers: { Authorization: `Bearer ${token}` },
        });
        message.success("Subject updated");
      } else {
        await axiosInstance.post("/subjects", values, {
          headers: { Authorization: `Bearer ${token}` },
        });
        message.success("Subject created");
      }
      setModalOpen(false);
      fetchSubjects();
    } catch (err) {
      if (err.response) message.error(err.response?.data?.message || "Error");
    } finally {
      setLoading(false);
    }
  };

  const deleteSubject = async (id) => {
    Modal.confirm({
      title: "Delete subject?",
      content: "This will also remove all teacher assignments for this subject.",
      okText: "Delete",
      okType: "danger",
      onOk: async () => {
        try {
          await axiosInstance.delete(`/subjects/${id}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          message.success("Subject deleted");
          fetchSubjects();
        } catch (err) {
          message.error(err.response?.data?.message || "Error");
        }
      },
    });
  };

  return (
    <div style={{ maxWidth: 720, margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <div>
          <Title level={4} style={{ margin: 0 }}>Subjects</Title>
          <Text type="secondary">{subjects.length} subjects</Text>
        </div>
        <Button type="primary" icon={<PlusOutlined />} onClick={openAdd}>Add subject</Button>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {subjects.map((s) => (
          <Card key={s._id} style={{ borderRadius: 10 }} hoverable>
            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <div style={{
                width: 44, height: 44, borderRadius: 10,
                background: "#f0fdf4", display: "flex", alignItems: "center", justifyContent: "center",
                flexShrink: 0,
              }}>
                <BookOutlined style={{ color: "#16a34a", fontSize: 18 }} />
              </div>
              <div style={{ flex: 1 }}>
                <Text strong style={{ fontSize: 15 }}>{s.name}</Text>
                {s.code && (
                  <>
                    <br />
                    <Text type="secondary" style={{ fontSize: 13 }}>
                      <CodeOutlined style={{ marginRight: 4 }} />{s.code}
                    </Text>
                  </>
                )}
                {s.description && (
                  <>
                    <br />
                    <Text type="secondary" style={{ fontSize: 12 }}>{s.description}</Text>
                  </>
                )}
              </div>
              <Space>
                <Button type="text" icon={<EditOutlined />} onClick={() => openEdit(s)} />
                <Button type="text" danger icon={<DeleteOutlined />} onClick={() => deleteSubject(s._id)} />
              </Space>
            </div>
          </Card>
        ))}
      </div>

      <Modal
        title={editing ? "Edit subject" : "New subject"}
        open={modalOpen}
        onOk={submit}
        onCancel={() => setModalOpen(false)}
        confirmLoading={loading}
        okText={editing ? "Save changes" : "Create subject"}
      >
        <Form form={form} layout="vertical" requiredMark={false}>
          <Form.Item
            label="Subject name"
            name="name"
            rules={[{ required: true, message: "Subject name is required" }]}
          >
            <Input placeholder="Mathematics" />
          </Form.Item>
          <Form.Item label="Subject code (optional)" name="code">
            <Input placeholder="MATH101" />
          </Form.Item>
          <Form.Item label="Description (optional)" name="description">
            <Input.TextArea placeholder="Brief description..." rows={3} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
