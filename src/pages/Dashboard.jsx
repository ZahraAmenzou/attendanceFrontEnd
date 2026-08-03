import { useEffect, useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { axiosInstance } from "../api/axios";
import {
  Row, Col, Card, Statistic, Progress, Typography, Spin, Tag,
} from "antd";
import {
  TeamOutlined, CheckCircleOutlined, CloseCircleOutlined, ClockCircleOutlined,
  ArrowUpOutlined, ArrowDownOutlined,
} from "@ant-design/icons";

const { Title, Text } = Typography;

export default function Dashboard() {
  const { token } = useContext(AuthContext);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await axiosInstance.get("/dashboard", {
          headers: { Authorization: `Bearer ${token}` }
        });
        setData(res.data);
      } catch {
        setData({ classStats: [] });
      } finally {
        setLoading(false);
      }
    };
    if (token) load();
  }, [token]);

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: 80 }}>
        <Spin size="large" />
      </div>
    );
  }

  const classStats = data?.classStats || [];

  const totalPresent = classStats.reduce((a, c) => a + c.present, 0);
  const totalAbsent  = classStats.reduce((a, c) => a + c.absent, 0);
  const totalLate    = classStats.reduce((a, c) => a + c.late, 0);
  const grandTotal   = totalPresent + totalAbsent + totalLate;
  const rate         = grandTotal ? Math.round((totalPresent / grandTotal) * 100) : 0;

  const today = new Date().toLocaleDateString("fr-MA", {
    weekday: "long", year: "numeric", month: "long", day: "numeric"
  });

  const activeClasses = classStats.filter(c => c.present + c.absent + c.late > 0)
    .sort((a, b) => {
      const rateA = (a.present + a.absent + a.late) ? (a.present / (a.present + a.absent + a.late)) * 100 : 0;
      const rateB = (b.present + b.absent + b.late) ? (b.present / (b.present + b.absent + b.late)) * 100 : 0;
      return rateA - rateB;
    });

  return (
    <div style={{ maxWidth: 960, margin: "0 auto" }}>
      <div style={{ marginBottom: 24 }}>
        <Title level={4} style={{ margin: 0 }}>Dashboard</Title>
        <Text type="secondary" style={{ textTransform: "capitalize" }}>{today}</Text>
      </div>

      {/* Attendance rate card */}
      <Card style={{ marginBottom: 16, borderRadius: 10 }} styles={{ body: { padding: 24 } }}>
        <div style={{ display: "flex", alignItems: "center", gap: 32 }}>
          <Progress
            type="circle"
            percent={rate}
            size={100}
            strokeColor={rate >= 90 ? "#22c55e" : rate >= 75 ? "#f59e0b" : "#ef4444"}
          />
          <div>
            <Text type="secondary" style={{ fontSize: 12, textTransform: "uppercase", letterSpacing: 1 }}>Attendance Rate</Text>
            <div style={{ marginTop: 4 }}>
              <Text strong style={{ fontSize: 15, color: rate >= 90 ? "#16a34a" : rate >= 75 ? "#d97706" : "#dc2626" }}>
                {rate >= 90 ? "Excellent attendance" : rate >= 75 ? "Needs improvement" : "Critical — take action"}
              </Text>
            </div>
            <Text type="secondary" style={{ fontSize: 13 }}>{grandTotal} students marked today</Text>
          </div>
        </div>
      </Card>

      {/* KPI Cards */}
      <Row gutter={[12, 12]} style={{ marginBottom: 24 }}>
        {[
          { label: "Total today", val: grandTotal, icon: <TeamOutlined />, color: "#1f2937", bg: "#f9fafb" },
          { label: "Present", val: totalPresent, icon: <CheckCircleOutlined />, color: "#16a34a", bg: "#f0fdf4" },
          { label: "Absent", val: totalAbsent, icon: <CloseCircleOutlined />, color: "#dc2626", bg: "#fef2f2" },
          { label: "Late", val: totalLate, icon: <ClockCircleOutlined />, color: "#d97706", bg: "#fffbeb" },
        ].map(({ label, val, icon, color, bg }) => (
          <Col xs={12} sm={6} key={label}>
            <Card style={{ borderRadius: 10, background: bg }} styles={{ body: { padding: 20 } }}>
              <Statistic
                title={label}
                value={val}
                prefix={icon}
                valueStyle={{ color, fontSize: 26, fontWeight: 700 }}
              />
              {grandTotal > 0 && label !== "Total today" && (
                <div style={{ marginTop: 4 }}>
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    {Math.round((val / grandTotal) * 100)}% of total
                  </Text>
                </div>
              )}
            </Card>
          </Col>
        ))}
      </Row>

      {/* Classes overview */}
      <Title level={5} style={{ marginBottom: 12 }}>Classes today</Title>

      {activeClasses.length === 0 ? (
        <Card style={{ borderRadius: 10, textAlign: "center", padding: 40 }}>
          <Text type="secondary">No attendance recorded yet today.</Text>
        </Card>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {activeClasses.map((c) => {
            const total = c.present + c.absent + c.late;
            const pct = total ? Math.round((c.present / total) * 100) : 0;

            return (
              <Card key={c.classId} style={{ borderRadius: 10 }} styles={{ body: { padding: 16 } }}>
                {/* Header */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <Tag color={pct >= 90 ? "success" : pct >= 75 ? "warning" : "error"}>{pct}%</Tag>
                    <span style={{ fontWeight: 600, fontSize: 14 }}>{c.className}</span>
                    {c.subject && (
                      <Text type="secondary" style={{ fontSize: 12 }}>{c.subject}</Text>
                    )}
                  </div>
                  <div style={{ display: "flex", gap: 16, fontSize: 13 }}>
                    <span style={{ color: "#16a34a" }}><CheckCircleOutlined /> {c.present}</span>
                    <span style={{ color: "#dc2626" }}><CloseCircleOutlined /> {c.absent}</span>
                    <span style={{ color: "#d97706" }}><ClockCircleOutlined /> {c.late}</span>
                    <Text type="secondary" style={{ fontSize: 12 }}>{total} total</Text>
                  </div>
                </div>

                {/* Progress bar */}
                <Progress
                  percent={pct}
                  showInfo={false}
                  strokeColor={{
                    "0%": "#22c55e",
                    "100%": pct >= 90 ? "#22c55e" : pct >= 75 ? "#f59e0b" : "#ef4444",
                  }}
                  trailColor="#f0f0f0"
                  style={{ marginBottom: 8 }}
                />

                {/* Absent + Late tags */}
                {(c.absent > 0 || c.late > 0) && (
                  <div style={{ display: "flex", gap: 16 }}>
                    {c.absent > 0 && (
                      <div style={{ flex: 1 }}>
                        <Text type="secondary" style={{ fontSize: 11, textTransform: "uppercase" }}>Absent</Text>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginTop: 4 }}>
                          {(c.absentStudents || []).map((s) => (
                            <Tag key={s._id} color="error" style={{ fontSize: 11, margin: 0 }}>{s.firstName} {s.lastName}</Tag>
                          ))}
                        </div>
                      </div>
                    )}
                    {c.late > 0 && (
                      <div style={{ flex: 1 }}>
                        <Text type="secondary" style={{ fontSize: 11, textTransform: "uppercase" }}>Late</Text>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginTop: 4 }}>
                          {(c.lateStudents || []).map((s) => (
                            <Tag key={s._id} color="warning" style={{ fontSize: 11, margin: 0 }}>{s.firstName} {s.lastName}</Tag>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
