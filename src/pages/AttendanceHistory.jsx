import { useEffect, useState, useContext, useMemo } from "react";
import { AuthContext } from "../context/AuthContext";
import { axiosInstance } from "../api/axios";
import { Card, Typography, Tag, DatePicker, Select, Spin, Empty, Space } from "antd";
import { FilterOutlined, TeamOutlined, BookOutlined } from "@ant-design/icons";
import dayjs from "dayjs";

const { Title, Text } = Typography;

const statusConfig = {
  present: { color: "green", label: "Present" },
  absent:  { color: "red", label: "Absent" },
  late:    { color: "orange", label: "Late" },
};

const initials = (f = "", l = "") => `${f[0] || ""}${l[0] || ""}`.toUpperCase();

export default function AttendanceHistory() {
  const { token } = useContext(AuthContext);
  const [classes, setClasses] = useState([]);
  const [students, setStudents] = useState([]);
  const [records, setRecords] = useState([]);
  const [filterDate, setFilterDate] = useState(dayjs());
  const [filterStatus, setFilterStatus] = useState("all");
  const [loading, setLoading] = useState(true);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [cls, stu, att] = await Promise.all([
        axiosInstance.get("/classes", { headers: { Authorization: `Bearer ${token}` } }),
        axiosInstance.get("/students", { headers: { Authorization: `Bearer ${token}` } }),
        axiosInstance.get("/attendance", { headers: { Authorization: `Bearer ${token}` } }),
      ]);
      setClasses(cls.data);
      setStudents(stu.data);
      setRecords(att.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAll(); }, [token]);

  const filteredRecords = useMemo(() => {
    return records.filter((r) => {
      const recordDate = dayjs(r.date || r.createdAt).format("YYYY-MM-DD");
      const dateMatch = !filterDate || recordDate === filterDate.format("YYYY-MM-DD");
      const statusMatch = filterStatus === "all" || r.status === filterStatus;
      return dateMatch && statusMatch;
    });
  }, [records, filterDate, filterStatus]);

  const recordMap = useMemo(() => {
    const map = {};
    filteredRecords.forEach((r) => { map[r.studentId?._id] = r.status; });
    return map;
  }, [filteredRecords]);

  const stats = useMemo(() => {
    const total = filteredRecords.length;
    const present = filteredRecords.filter((r) => r.status === "present").length;
    const absent = filteredRecords.filter((r) => r.status === "absent").length;
    const late = filteredRecords.filter((r) => r.status === "late").length;
    return { total, present, absent, late };
  }, [filteredRecords]);

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: 80 }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 800, margin: "0 auto" }}>
      <div style={{ marginBottom: 20 }}>
        <Title level={4} style={{ margin: 0 }}>Attendance History</Title>
        <Text type="secondary">
          {filterDate
            ? filterDate.format("dddd, D MMMM YYYY")
            : "All dates"}
          {filterDate && ` — ${stats.total} record${stats.total !== 1 ? "s" : ""}`}
        </Text>
      </div>

      {filteredRecords.length > 0 && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 16 }}>
          {[
            { label: "Total", val: stats.total, color: "#1f2937" },
            { label: "Present", val: stats.present, color: "#16a34a" },
            { label: "Absent", val: stats.absent, color: "#dc2626" },
            { label: "Late", val: stats.late, color: "#d97706" },
          ].map(({ label, val, color }) => (
            <Card key={label} size="small" style={{ borderRadius: 8 }}>
              <Text type="secondary" style={{ fontSize: 10, textTransform: "uppercase" }}>{label}</Text>
              <br />
              <Text strong style={{ fontSize: 20, color }}>{val}</Text>
            </Card>
          ))}
        </div>
      )}

      <Space style={{ marginBottom: 16 }} wrap>
        <Card size="small" style={{ borderRadius: 8 }}>
          <Space>
            <FilterOutlined style={{ color: "#9ca3af" }} />
            <DatePicker
              value={filterDate}
              onChange={(d) => setFilterDate(d)}
              allowClear={false}
              size="small"
            />
          </Space>
        </Card>
        <Select
          value={filterStatus}
          onChange={setFilterStatus}
          size="small"
          style={{ width: 110 }}
        >
          {["all", "present", "absent", "late"].map((s) => (
            <Select.Option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</Select.Option>
          ))}
        </Select>
      </Space>

      {filteredRecords.length === 0 && (
        <Card style={{ borderRadius: 10, textAlign: "center", padding: 40 }}>
          <Empty description="No attendance records for this date." />
        </Card>
      )}

      {filterDate && filteredRecords.length >= 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {classes.map((cls) => {
            const classStudents = students.filter((s) => s.classId?._id === cls._id);
            if (classStudents.length === 0) return null;

            const hasAnyRecord = classStudents.some((s) => recordMap[s._id]);
            if (!hasAnyRecord && filterStatus !== "all") return null;

            return (
              <Card key={cls._id} style={{ borderRadius: 10 }} title={
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <TeamOutlined style={{ color: "#4f46e5" }} />
                  <span style={{ fontWeight: 600 }}>{cls.name}</span>
                  <div style={{ marginLeft: "auto" }}>
                    <Text type="secondary" style={{ fontSize: 11 }}>
                      {classStudents.length} student{classStudents.length !== 1 ? "s" : ""}
                      {hasAnyRecord && ` — ${classStudents.filter(s => recordMap[s._id]).length} recorded`}
                    </Text>
                  </div>
                </div>
              }>
                {classStudents.map((s) => {
                  const status = recordMap[s._id] || null;
                  const cfg = status ? statusConfig[status] : { color: "default", label: "No record" };
                  const bgColor = status === "absent" ? "#fef2f2" : status === "late" ? "#fffbeb" : status === "present" ? "#f0fdf4" : "#fafafa";
                  const avatarBg = status === "absent" ? "#fecaca" : status === "late" ? "#fde68a" : status === "present" ? "#bbf7d0" : "#e5e7eb";
                  const avatarColor = status === "absent" ? "#dc2626" : status === "late" ? "#d97706" : status === "present" ? "#16a34a" : "#9ca3af";

                  return (
                    <div
                      key={s._id}
                      style={{
                        display: "flex", alignItems: "center", gap: 12,
                        padding: "8px 0", borderBottom: "1px solid #f5f5f5",
                        background: bgColor, borderRadius: 6, marginBottom: 4,
                      }}
                    >
                      <div style={{
                        width: 32, height: 32, borderRadius: "50%",
                        background: avatarBg, color: avatarColor,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: 10, fontWeight: 700, flexShrink: 0, marginLeft: 8,
                      }}>
                        {status ? status.charAt(0).toUpperCase() : initials(s.firstName, s.lastName)}
                      </div>
                      <div style={{ flex: 1 }}>
                        <Text style={{ fontSize: 13 }}>{s.firstName} {s.lastName}</Text>
                      </div>
                      <Tag color={cfg.color} style={{ marginRight: 8, fontSize: 11 }}>{cfg.label}</Tag>
                    </div>
                  );
                })}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}