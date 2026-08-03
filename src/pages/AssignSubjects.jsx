import { useEffect, useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { axiosInstance } from "../api/axios";
import { Card, Button, Typography, Modal, Form, Select, message, Tag, Empty, Space, Tooltip, Collapse } from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined, UserOutlined, BookOutlined, BankOutlined, CloseCircleOutlined } from "@ant-design/icons";

const { Title, Text } = Typography;

export default function AssignSubjects() {
  const { token } = useContext(AuthContext);
  const [assignments, setAssignments] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingKey, setEditingKey] = useState(null);
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();

  const fetchAll = async () => {
    const [a, t, c, s] = await Promise.all([
      axiosInstance.get("/subjects/assignments", { headers: { Authorization: `Bearer ${token}` } }),
      axiosInstance.get("/users/teacher", { headers: { Authorization: `Bearer ${token}` } }),
      axiosInstance.get("/classes", { headers: { Authorization: `Bearer ${token}` } }),
      axiosInstance.get("/subjects", { headers: { Authorization: `Bearer ${token}` } }),
    ]);
    setAssignments(a.data);
    setTeachers(t.data);
    setClasses(c.data);
    setSubjects(s.data);
  };

  useEffect(() => { fetchAll(); }, [token]);

  const openAssign = () => {
    setEditingKey(null);
    form.resetFields();
    setModalOpen(true);
  };

  const openEdit = (teacherId, classId) => {
    setEditingKey(`${teacherId}|${classId}`);
    const currentSubjects = assignments
      .filter(a => a.teacherId?._id === teacherId && a.classId?._id === classId)
      .map(a => a.subjectId._id);
    form.setFieldsValue({
      teacherId,
      classId,
      subjectIds: currentSubjects,
    });
    setModalOpen(true);
  };

  const submit = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);
      if (editingKey) {
        const [teacherId, classId] = editingKey.split("|");
        await axiosInstance.put(`/subjects/assignments/${teacherId}/${classId}`, {
          subjectIds: values.subjectIds,
        }, {
          headers: { Authorization: `Bearer ${token}` },
        });
        message.success("Assignments updated");
      } else {
        await axiosInstance.post("/subjects/assignments", values, {
          headers: { Authorization: `Bearer ${token}` },
        });
        message.success("Subjects assigned");
      }
      setModalOpen(false);
      fetchAll();
    } catch (err) {
      if (err.response) message.error(err.response?.data?.message || "Error");
    } finally {
      setLoading(false);
    }
  };

  const removeAssignment = async (id) => {
    Modal.confirm({
      title: "Remove assignment?",
      content: "The teacher will no longer have access to this subject in this class.",
      okText: "Remove",
      okType: "danger",
      onOk: async () => {
        try {
          await axiosInstance.delete(`/subjects/assignments/${id}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          message.success("Assignment removed");
          fetchAll();
        } catch (err) {
          message.error(err.response?.data?.message || "Error");
        }
      },
    });
  };

  const groupedByTeacher = assignments.reduce((acc, a) => {
    const tid = a.teacherId?._id || "unknown";
    if (!acc[tid]) acc[tid] = { teacher: a.teacherId, classes: {} };
    const cid = a.classId?._id || "unknown";
    if (!acc[tid].classes[cid]) acc[tid].classes[cid] = { class: a.classId, items: [] };
    acc[tid].classes[cid].items.push(a);
    return acc;
  }, {});

  const selectedTeacherId = Form.useWatch("teacherId", form);
  const selectedClassId = Form.useWatch("classId", form);

  const assignedTeacherClassKeys = assignments.reduce((acc, a) => {
    const key = `${a.teacherId?._id}|${a.classId?._id}`;
    acc[key] = true;
    return acc;
  }, {});

  const classOptions = classes.filter(c => {
    if (!editingKey) return true;
    const [editTeacherId, editClassId] = editingKey.split("|");
    if (c._id === editClassId) return true;
    const key = `${editingKey.split("|")[0]}|${c._id}`;
    return !assignedTeacherClassKeys[key];
  });

  return (
    <div style={{ maxWidth: 800, margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <div>
          <Title level={4} style={{ margin: 0 }}>Assign Subjects to Teachers</Title>
          <Text type="secondary">{assignments.length} assignments</Text>
        </div>
        <Button type="primary" icon={<PlusOutlined />} onClick={openAssign}>Assign subjects</Button>
      </div>

      {Object.keys(groupedByTeacher).length === 0 ? (
        <Empty description="No assignments yet" />
      ) : (
        Object.entries(groupedByTeacher).map(([tid, { teacher, classes: classMap }]) => (
          <Card key={tid} style={{ borderRadius: 10, marginBottom: 12 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
              <UserOutlined style={{ color: "#4f46e5" }} />
              <Text strong style={{ fontSize: 15 }}>{teacher?.name || "Unknown"}</Text>
              <Tag>{Object.keys(classMap).length} class{Object.keys(classMap).length > 1 ? "es" : ""}</Tag>
            </div>
            <Collapse ghost size="small" items={Object.entries(classMap).map(([cid, { class: cls, items }]) => ({
              key: cid,
              label: (
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%" }}>
                  <Space>
                    <BankOutlined style={{ color: "#4f46e5" }} />
                    <Text>{cls?.name || "Unknown"}</Text>
                    <Tag>{items.length} subject{items.length > 1 ? "s" : ""}</Tag>
                  </Space>
                  <Space onClick={e => e.stopPropagation()}>
                    <Tooltip title="Edit subjects for this class">
                      <Button type="text" size="small" icon={<EditOutlined />} onClick={() => openEdit(teacher._id, cls._id)} />
                    </Tooltip>
                    <Tooltip title="Remove all subjects for this class">
                      <Button type="text" size="small" danger icon={<DeleteOutlined />} onClick={() => {
                        Modal.confirm({
                          title: "Remove all subjects?",
                          content: `This will remove all subject assignments for ${teacher?.name} in ${cls?.name}.`,
                          okText: "Remove all",
                          okType: "danger",
                          onOk: async () => {
                            try {
                              await axiosInstance.put(`/subjects/assignments/${teacher._id}/${cls._id}`, { subjectIds: [] }, {
                                headers: { Authorization: `Bearer ${token}` },
                              });
                              message.success("All assignments removed");
                              fetchAll();
                            } catch (err) {
                              message.error(err.response?.data?.message || "Error");
                            }
                          },
                        });
                      }} />
                    </Tooltip>
                  </Space>
                </div>
              ),
              children: (
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {items.map((a) => (
                    <Tag
                      key={a._id}
                      closable
                      closeIcon={<CloseCircleOutlined />}
                      onClose={() => removeAssignment(a._id)}
                      style={{ padding: "4px 10px", fontSize: 13, borderRadius: 6 }}
                      icon={<BookOutlined />}
                    >
                      {a.subjectId?.name || "Unknown"}
                      {a.subjectId?.code ? ` (${a.subjectId.code})` : ""}
                    </Tag>
                  ))}
                </div>
              ),
            }))} />
          </Card>
        ))
      )}

      <Modal
        title={editingKey ? "Edit subjects for class" : "Assign subjects to teacher"}
        open={modalOpen}
        onOk={submit}
        onCancel={() => setModalOpen(false)}
        confirmLoading={loading}
        okText={editingKey ? "Save changes" : "Assign"}
        width={500}
      >
        <Form form={form} layout="vertical" requiredMark={false}>
          <Form.Item
            label="Teacher"
            name="teacherId"
            rules={[{ required: true, message: "Select a teacher" }]}
          >
            <Select placeholder="Select teacher" disabled={!!editingKey} onChange={() => form.setFieldValue("classId", undefined)}>
              {teachers.map((t) => (
                <Select.Option key={t._id} value={t._id}>{t.name}</Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            label="Class"
            name="classId"
            rules={[{ required: true, message: "Select a class" }]}
          >
            <Select placeholder="Select class" disabled={!!editingKey}>
              {classOptions.map((c) => (
                <Select.Option key={c._id} value={c._id}>{c.name}</Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            label="Subjects"
            name="subjectIds"
            rules={[{ required: true, message: "Select at least one subject", type: "array", min: 1 }]}
          >
            <Select mode="multiple" placeholder="Select subjects">
              {subjects.map((s) => (
                <Select.Option key={s._id} value={s._id}>{s.name}{s.code ? ` (${s.code})` : ""}</Select.Option>
              ))}
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}