import { useEffect, useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { axiosInstance } from "../api/axios";
import {
  Card, Table, Button, Tag, Typography, Modal, Form, Input, Select, message, Space, Grid,
} from "antd";
import {
  PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined,
  PhoneOutlined, MailOutlined, WarningOutlined, MinusOutlined,
  FilterOutlined,
} from "@ant-design/icons";

const { Title, Text } = Typography;
const { useBreakpoint } = Grid;

export default function Students() {
  const { token } = useContext(AuthContext);
  const screens = useBreakpoint();
  const isMobile = screens.md === false;
  const [students, setStudents] = useState([]);
  const [classes, setClasses] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [classFilter, setClassFilter] = useState(null);
  const [teacherFilter, setTeacherFilter] = useState(null);
  const [form] = Form.useForm();

  const fetchStudents = async (classId, teacherId) => {
    const params = {};
    if (classId) params.classId = classId;
    if (teacherId) params.teacherId = teacherId;
    const res = await axiosInstance.get("/students", {
      headers: { Authorization: `Bearer ${token}` },
      params,
    });
    setStudents(res.data);
  };

  const fetchClasses = async () => {
    const res = await axiosInstance.get("/classes", {
      headers: { Authorization: `Bearer ${token}` }
    });
    setClasses(res.data);
  };

  const fetchTeachers = async () => {
    const res = await axiosInstance.get("/users/teacher", {
      headers: { Authorization: `Bearer ${token}` }
    });
    setTeachers(res.data);
  };

  useEffect(() => {
    fetchClasses();
    fetchTeachers();
  }, []);

  useEffect(() => {
    fetchStudents(classFilter, teacherFilter);
  }, [classFilter, teacherFilter]);

  const openAdd = () => {
    setEditing(null);
    form.resetFields();
    setModalOpen(true);
  };

  const openEdit = (s) => {
    setEditing(s);
    form.setFieldsValue({
      firstName: s.firstName,
      lastName: s.lastName,
      classId: s.classId?._id,
      phone: s.phone || "",
      parentPhone: s.parentPhone || "",
      email: s.email || "",
    });
    setModalOpen(true);
  };

  const submit = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);
      if (editing) {
        await axiosInstance.put(`/students/${editing._id}`, values, {
          headers: { Authorization: `Bearer ${token}` }
        });
        message.success("Student updated");
      } else {
        await axiosInstance.post("/students", values, {
          headers: { Authorization: `Bearer ${token}` }
        });
        message.success("Student added");
      }
      setModalOpen(false);
      fetchStudents();
    } catch (err) {
      if (err.response) message.error(err.response?.data?.message || "Error");
    } finally {
      setLoading(false);
    }
  };

  const deleteStudent = (id) => {
    Modal.confirm({
      title: "Delete student?",
      okText: "Delete",
      okType: "danger",
      onOk: async () => {
        try {
          await axiosInstance.delete(`/students/${id}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          message.success("Student deleted");
          fetchStudents();
        } catch (err) {
          message.error(err.response?.data?.message || "Error");
        }
      },
    });
  };

  const updateDiscipline = async (id, value) => {
    try {
      await axiosInstance.put(`/students/discipline/${id}`, { value }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchStudents();
    } catch (err) {
      message.error(err.response?.data?.message || "Error");
    }
  };

  const initials = (f = "", l = "") => `${f[0] || ""}${l[0] || ""}`.toUpperCase();

  const discColor = (d) => {
    if (d >= 15) return "green";
    if (d >= 10) return "orange";
    return "red";
  };

  const filtered = students.filter(s =>
    `${s.firstName} ${s.lastName}`.toLowerCase().includes(search.toLowerCase()) ||
    s.classId?.name?.toLowerCase().includes(search.toLowerCase())
  );

  const columns = [
    {
      title: "Student",
      key: "name",
      render: (_, r) => (
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            width: 34, height: 34, borderRadius: "50%",
            background: r.discipline < 10 ? "#fef2f2" : "#eef2ff",
            color: r.discipline < 10 ? "#dc2626" : "#4f46e5",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 11, fontWeight: 600, flexShrink: 0,
          }}>
            {initials(r.firstName, r.lastName)}
          </div>
          <div>
            <Text strong style={{ fontSize: 13 }}>{r.firstName} {r.lastName}</Text>
            {r.discipline < 10 && (
              <div><Tag icon={<WarningOutlined />} color="error" style={{ fontSize: 10, margin: 0 }}>Warning</Tag></div>
            )}
          </div>
        </div>
      ),
    },
    {
      title: "Class",
      dataIndex: ["classId", "name"],
      key: "class",
      render: (name) => name || <Text type="secondary">—</Text>,
    },
    {
      title: "Phone",
      key: "phone",
      render: (_, r) => (
        r.phone
          ? <Text style={{ fontSize: 13 }}><PhoneOutlined style={{ marginRight: 4, color: "#9ca3af" }} />{r.phone}</Text>
          : <Text type="secondary">—</Text>
      ),
    },
    {
      title: "Email",
      key: "email",
      render: (_, r) => (
        r.email
          ? <Text style={{ fontSize: 13 }}><MailOutlined style={{ marginRight: 4, color: "#9ca3af" }} />{r.email}</Text>
          : <Text type="secondary">—</Text>
      ),
    },
    {
      title: "Discipline",
      key: "discipline",
      align: "center",
      render: (_, r) => <Tag color={discColor(r.discipline)}>{r.discipline}/20</Tag>,
    },
    {
      title: "Actions",
      key: "actions",
      align: "right",
      render: (_, r) => (
        <Space>
          <TooltipBtn icon={<MinusOutlined />} onClick={() => updateDiscipline(r._id, -0.5)} color="default" />
          <TooltipBtn icon={<PlusOutlined />} onClick={() => updateDiscipline(r._id, 0.5)} color="default" />
          <Button type="text" size="small" icon={<EditOutlined />} onClick={() => openEdit(r)} />
          <Button type="text" size="small" danger icon={<DeleteOutlined />} onClick={() => deleteStudent(r._id)} />
        </Space>
      ),
    },
  ];

  const TooltipBtn = ({ icon, onClick, color }) => (
    <Button type="text" size="small" icon={icon} onClick={onClick} />
  );

  return (
    <div style={{ maxWidth: 960, margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, gap: 12, flexWrap: "wrap" }}>
        <div>
          <Title level={4} style={{ margin: 0 }}>Students</Title>
          <Text type="secondary">{students.length} registered across {classes.length} classes</Text>
        </div>
        <Button type="primary" icon={<PlusOutlined />} onClick={openAdd} block={isMobile}>Add student</Button>
      </div>

      {/* Stats */}
      <RowCards students={students} isMobile={isMobile} />

      {/* Filters */}
      <div style={{ display: "flex", gap: 12, marginBottom: 16, alignItems: "center", flexDirection: isMobile ? "column" : "row" }}>
        <Select
          placeholder="Filter by class"
          allowClear
          style={isMobile ? { width: "100%" } : { minWidth: 200 }}
          value={classFilter}
          onChange={(v) => { setClassFilter(v); setTeacherFilter(null); }}
          options={[
            { label: "All classes", value: null },
            ...classes.map(c => ({ label: c.name, value: c._id })),
          ]}
        />
        <Select
          placeholder="Filter by teacher"
          allowClear
          style={isMobile ? { width: "100%" } : { minWidth: 200 }}
          value={teacherFilter}
          onChange={(v) => { setTeacherFilter(v); setClassFilter(null); }}
          options={[
            { label: "All teachers", value: null },
            ...teachers.map(t => ({ label: t.name, value: t._id })),
          ]}
        />
        <Input
          prefix={<SearchOutlined style={{ color: "#9ca3af" }} />}
          placeholder="Search by name or class..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={isMobile ? { flex: 1, width: "100%", borderRadius: 8 } : { flex: 1, borderRadius: 8 }}
          allowClear
        />
      </div>

      {/* Table */}
      <Card style={{ borderRadius: 10, padding: 0 }} styles={{ body: { padding: 0 } }}>
        <Table
          dataSource={filtered}
          columns={columns}
          rowKey="_id"
          pagination={{ pageSize: 15, showSizeChanger: false }}
          size="middle"
          scroll={{ x: "max-content" }}
        />
      </Card>

      {/* Modal */}
      <Modal
        title={editing ? "Edit student" : "New student"}
        open={modalOpen}
        onOk={submit}
        onCancel={() => setModalOpen(false)}
        confirmLoading={loading}
        okText={editing ? "Save changes" : "Add student"}
        width={520}
      >
        <Form form={form} layout="vertical" requiredMark={false}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 12px" }}>
            <Form.Item label="First name" name="firstName" rules={[{ required: true, message: "Required" }]}>
              <Input placeholder="Ahmed" />
            </Form.Item>
            <Form.Item label="Last name" name="lastName" rules={[{ required: true, message: "Required" }]}>
              <Input placeholder="Benali" />
            </Form.Item>
            <Form.Item label="Phone" name="phone">
              <Input placeholder="+212 6..." />
            </Form.Item>
            <Form.Item label="Parent phone" name="parentPhone">
              <Input placeholder="+212 6..." />
            </Form.Item>
            <Form.Item label="Email" name="email" rules={[{ type: "email", message: "Invalid email" }]}>
              <Input placeholder="ahmed@school.ma" />
            </Form.Item>
            <Form.Item label="Class" name="classId" rules={[{ required: true, message: "Required" }]}>
              <Select placeholder="Select class">
                {classes.map((c) => (
                  <Select.Option key={c._id} value={c._id}>{c.name}</Select.Option>
                ))}
              </Select>
            </Form.Item>
          </div>
        </Form>
      </Modal>
    </div>
  );
}

function RowCards({ students, isMobile }) {
  const atRisk = students.filter(s => s.discipline < 10).length;
  const goodStanding = students.filter(s => s.discipline >= 15).length;

  return (
    <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(3, 1fr)", gap: 12, marginBottom: 16 }}>
      {[
        { label: "Total students", val: students.length, color: "#4f46e5" },
        { label: "Good standing (>=15)", val: goodStanding, color: "#16a34a" },
        { label: "At risk (<10)", val: atRisk, color: "#dc2626" },
      ].map(({ label, val, color }) => (
        <Card key={label} style={{ borderRadius: 10 }} styles={{ body: { padding: 16 } }}>
          <Text type="secondary" style={{ fontSize: 11, textTransform: "uppercase", display: "block", marginBottom: 4 }}>{label}</Text>
          <Text strong style={{ fontSize: 24, color }}>{val}</Text>
        </Card>
      ))}
    </div>
  );
}
