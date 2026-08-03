import { useEffect, useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { axiosInstance } from "../api/axios";
import { Card, Typography, Empty, Spin, Tag } from "antd";
import { BookOutlined, CodeOutlined, BankOutlined } from "@ant-design/icons";

const { Title, Text } = Typography;

export default function MySubjects() {
  const { token } = useContext(AuthContext);
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await axiosInstance.get("/subjects/my", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setGroups(res.data);
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [token]);

  if (loading) return <Spin style={{ display: "block", marginTop: 80 }} />;

  const totalSubjects = groups.reduce((sum, g) => sum + (g.subjects?.length || 0), 0);

  return (
    <div style={{ maxWidth: 720, margin: "0 auto" }}>
      <Title level={4} style={{ marginBottom: 4 }}>My Subjects</Title>
      <Text type="secondary" style={{ display: "block", marginBottom: 20 }}>
        {totalSubjects} subject{totalSubjects !== 1 ? "s" : ""} across {groups.length} class{groups.length !== 1 ? "es" : ""}
      </Text>

      {groups.length === 0 ? (
        <Empty description="No subjects assigned yet" />
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {groups.map((g) => (
            <Card key={g.class?._id || "unknown"} style={{ borderRadius: 10 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                <BankOutlined style={{ color: "#4f46e5" }} />
                <Text strong style={{ fontSize: 15 }}>{g.class?.name || "Unknown"}</Text>
                <Tag>{g.subjects?.length || 0} subject{(g.subjects?.length || 0) > 1 ? "s" : ""}</Tag>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {g.subjects?.map((s) => (
                  <div key={s._id} style={{
                    display: "flex", alignItems: "center", gap: 12,
                    padding: "8px 12px", borderRadius: 8, background: "#f8fafc",
                  }}>
                    <div style={{
                      width: 36, height: 36, borderRadius: 8,
                      background: "#f0fdf4", display: "flex", alignItems: "center", justifyContent: "center",
                      flexShrink: 0,
                    }}>
                      <BookOutlined style={{ color: "#16a34a", fontSize: 16 }} />
                    </div>
                    <div>
                      <Text strong style={{ fontSize: 14 }}>{s.name}</Text>
                      {s.code && (
                        <Text type="secondary" style={{ fontSize: 12, marginLeft: 8 }}>
                          <CodeOutlined style={{ marginRight: 4 }} />{s.code}
                        </Text>
                      )}
                      {s.description && (
                        <><br /><Text type="secondary" style={{ fontSize: 12 }}>{s.description}</Text></>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}