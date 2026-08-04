import { useEffect, useState, useContext, useMemo } from "react";
import { AuthContext } from "../context/AuthContext";
import { axiosInstance } from "../api/axios";
import {
  Card, Select, Button, Typography, Tag, Space, message, Spin,
} from "antd";
import {
  CheckOutlined, CloseOutlined, ClockCircleOutlined,
  ExclamationCircleOutlined, PhoneOutlined, MailOutlined,
} from "@ant-design/icons";

const { Title, Text } = Typography;

export default function Attendance() {
  const { token, user } = useContext(AuthContext);
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [students, setStudents] = useState([]);
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");
  const [statuses, setStatuses] = useState({});
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [alerts, setAlerts] = useState([]);
  const [subjectsLoading, setSubjectsLoading] = useState(false);

  useEffect(() => {
    const endpoint = user?.role === "teacher" ? "/classes/my" : "/classes";
    axiosInstance
      .get(endpoint, { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => setClasses(res.data))
      .catch(console.log);
  }, [token, user]);

  const loadStudents = async (classId) => {
    try {
      const res = await axiosInstance.get(`/students/class/${classId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setStudents(res.data);
      const initial = {};
      res.data.forEach((s) => { initial[s._id] = "present"; });
      setStatuses(initial);
      setSaved(false);
      setAlerts([]);
    } catch (err) {
      console.log(err);
    }
  };

  const loadSubjects = async (classId) => {
    if (user?.role !== "teacher") {
      const allRes = await axiosInstance.get("/subjects", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSubjects(allRes.data);
      return;
    }
    setSubjectsLoading(true);
    try {
      const res = await axiosInstance.get(`/subjects/my?classId=${classId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSubjects(res.data);
    } catch (err) {
      console.log(err);
    } finally {
      setSubjectsLoading(false);
    }
  };

  const handleClassChange = (val) => {
    setSelectedClass(val);
    setSelectedSubject("");
    setStudents([]);
    setAlerts([]);
    if (val) {
      loadSubjects(val);
    }
  };

  const handleSubjectChange = (val) => {
    setSelectedSubject(val);
    setStudents([]);
    setAlerts([]);
    if (val && selectedClass) {
      loadStudents(selectedClass);
    }
  };

  const mark = (studentId, status) => {
    setStatuses((prev) => ({ ...prev, [studentId]: status }));
  };

  const saveAll = async () => {
    if (!selectedClass || !selectedSubject || students.length === 0) return;
    setSaving(true);
    setAlerts([]);
    try {
      const results = await Promise.all(
        students.map((s) =>
          axiosInstance.post(
            "/attendance",
            { studentId: s._id, classId: selectedClass, subjectId: selectedSubject, status: statuses[s._id] || "present" },
            { headers: { Authorization: `Bearer ${token}` } }
          )
        )
      );
      const newAlerts = results.map((r) => r.data?.alert).filter((a) => a?.triggered === true);
      setAlerts(newAlerts);
      setSaved(true);
      if (newAlerts.length > 0) {
        message.warning(`${newAlerts.length} absence alert${newAlerts.length > 1 ? "s" : ""} triggered`);
      } else {
        message.success("Attendance saved");
      }
    } catch (err) {
      message.error("Failed to save attendance");
    } finally {
      setSaving(false);
    }
  };

  const presentCount = Object.values(statuses).filter((s) => s === "present").length;
  const absentCount = Object.values(statuses).filter((s) => s === "absent").length;
  const lateCount = Object.values(statuses).filter((s) => s === "late").length;

  const statusTag = (sid, status, label, icon, color) => (
    <Button
      size="small"
      icon={icon}
      onClick={() => mark(sid, status)}
      type={statuses[sid] === status ? "primary" : "default"}
      style={{
        background: statuses[sid] === status ? color : undefined,
        borderColor: statuses[sid] === status ? color : undefined,
      }}
    >
      {label}
    </Button>
  );

  return (
    <div style={{ maxWidth: 720, margin: "0 auto" }}>
      <div style={{ marginBottom: 20 }}>
        <Title level={4} style={{ margin: 0 }}>Attendance</Title>
        <Text type="secondary">
          {user?.role === "teacher"
            ? `Welcome ${user.name} — mark your class attendance`
            : "Mark attendance per class"}
        </Text>
      </div>

      <Card style={{ borderRadius: 10, marginBottom: 16 }} styles={{ body: { padding: 16 } }}>
        <Text type="secondary" style={{ fontSize: 12, display: "block", marginBottom: 8, textTransform: "uppercase", letterSpacing: 1 }}>
          Select class
        </Text>
        <Select
          value={selectedClass || undefined}
          onChange={handleClassChange}
          placeholder="-- Choose a class --"
          style={{ width: "100%" }}
          size="large"
        >
          {classes.map((c) => (
            <Select.Option key={c._id} value={c._id}>{c.name}</Select.Option>
          ))}
        </Select>
      </Card>

      {selectedClass && (
        <Card style={{ borderRadius: 10, marginBottom: 16 }} styles={{ body: { padding: 16 } }}>
          <Text type="secondary" style={{ fontSize: 12, display: "block", marginBottom: 8, textTransform: "uppercase", letterSpacing: 1 }}>
            Select subject
          </Text>
          <Select
            value={selectedSubject || undefined}
            onChange={handleSubjectChange}
            placeholder="-- Choose a subject --"
            style={{ width: "100%" }}
            size="large"
            loading={subjectsLoading}
          >
            {subjects.map((s) => (
              <Select.Option key={s._id} value={s._id}>
                {s.name}
              </Select.Option>
            ))}
          </Select>
        </Card>
      )}

      {user?.role === "teacher" && classes.length === 0 && (
        <Card style={{ borderRadius: 10, marginBottom: 16, background: "#fffbeb", borderColor: "#fde68a" }}>
          <Text style={{ color: "#d97706" }}><ExclamationCircleOutlined style={{ marginRight: 8 }} />No classes assigned to you yet. Contact the admin.</Text>
        </Card>
      )}

      {students.length > 0 && (
        <div style={{ display: "flex", gap: 12, marginBottom: 16 }}>
          {[
            { label: "Present", val: presentCount, color: "green" },
            { label: "Absent", val: absentCount, color: "red" },
            { label: "Late", val: lateCount, color: "orange" },
          ].map(({ label, val, color }) => (
            <Card key={label} size="small" style={{ borderRadius: 8, flex: 1 }}>
              <Text strong style={{ color, fontSize: 18 }}>{val}</Text>
              <br />
              <Text type="secondary" style={{ fontSize: 11 }}>{label}</Text>
            </Card>
          ))}
        </div>
      )}

      {students.length > 0 && (
        <>
          <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 16 }}>
            {students.map((s) => {
              const activeColor = statuses[s._id] === "absent" ? "#fef2f2" : statuses[s._id] === "late" ? "#fffbeb" : "#f0fdf4";
              const activeText = statuses[s._id] === "absent" ? "#dc2626" : statuses[s._id] === "late" ? "#d97706" : "#16a34a";
              return (
                <Card key={s._id} style={{ borderRadius: 10, background: activeColor }} hoverable>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12, minWidth: 0 }}>
                      <div style={{
                        width: 36, height: 36, borderRadius: "50%",
                        background: activeText, opacity: 0.9,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        color: "#fff", fontSize: 11, fontWeight: 700, flexShrink: 0,
                      }}>
                        {`${s.firstName?.[0] || ""}${s.lastName?.[0] || ""}`.toUpperCase()}
                      </div>
                      <div style={{ minWidth: 0 }}>
                        <Text strong style={{ fontSize: 14 }}>{s.firstName} {s.lastName}</Text>
                        {s.discipline < 10 && (
                          <><br /><Text type="danger" style={{ fontSize: 11 }}><ExclamationCircleOutlined /> Low discipline</Text></>
                        )}
                      </div>
                    </div>
                    <Space wrap>
                      {statusTag(s._id, "present", "Present", <CheckOutlined />, "#16a34a")}
                      {statusTag(s._id, "late", "Late", <ClockCircleOutlined />, "#d97706")}
                      {statusTag(s._id, "absent", "Absent", <CloseOutlined />, "#dc2626")}
                    </Space>
                  </div>
                </Card>
              );
            })}
          </div>

          <Button
            type="primary"
            onClick={saveAll}
            loading={saving}
            block
            size="large"
            style={{ borderRadius: 10, marginBottom: 16 }}
            icon={saved ? <CheckOutlined /> : undefined}
          >
            {saving ? "Saving..." : saved ? "Saved" : "Save attendance"}
          </Button>

          {alerts.length > 0 && (
            <div style={{ marginTop: 8 }}>
              <Text type="secondary" style={{ fontSize: 11, textTransform: "uppercase", display: "block", marginBottom: 8 }}>
                <ExclamationCircleOutlined style={{ color: "#d97706", marginRight: 4 }} />Absence alerts triggered
              </Text>
              {alerts.map((a, i) => (
                <Card key={i} size="small" style={{ borderRadius: 10, marginBottom: 8, background: "#fffbeb", borderColor: "#fde68a" }}>
                  <Text strong style={{ color: "#d97706", display: "block", marginBottom: 4 }}>
                    <ExclamationCircleOutlined style={{ marginRight: 6 }} />{a.studentName}
                  </Text>
                  <Text style={{ fontSize: 13 }}>{a.message}</Text>
                  <div style={{ marginTop: 6, display: "flex", gap: 16 }}>
                    {a.email && (
                      <Text style={{ fontSize: 12, color: a.email.success ? "#16a34a" : "#dc2626" }}>
                        <MailOutlined style={{ marginRight: 4 }} />{a.email.success ? "Email sent" : "Email failed"}
                      </Text>
                    )}
                    {a.sms && (
                      <Text style={{ fontSize: 12, color: a.sms.success ? "#16a34a" : "#dc2626" }}>
                        <PhoneOutlined style={{ marginRight: 4 }} />{a.sms.success ? "SMS sent" : "SMS failed"}
                      </Text>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}