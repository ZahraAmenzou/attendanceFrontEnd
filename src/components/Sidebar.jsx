import { useContext, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Layout, Menu, Button, Avatar, Tooltip, Dropdown } from "antd";
import { AuthContext } from "../context/AuthContext";
import {
  DashboardOutlined,
  CheckCircleOutlined,
  CalendarOutlined,
  UserOutlined,
  BankOutlined,
  TeamOutlined,
  BookOutlined,
  LinkOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  LogoutOutlined,
  SafetyCertificateOutlined,
} from "@ant-design/icons";

const { Sider } = Layout;

const menuItems = [
  { key: "/", icon: <DashboardOutlined />, label: "Dashboard", roles: ["admin"] },
  { key: "/attendance", icon: <CheckCircleOutlined />, label: "Attendance", roles: ["admin", "teacher"] },
  { key: "/attendance-history", icon: <CalendarOutlined />, label: "History", roles: ["admin"] },
  { key: "/my-subjects", icon: <BookOutlined />, label: "My Subjects", roles: ["teacher"] },
  { key: "/students", icon: <TeamOutlined />, label: "Students", roles: ["admin"] },
  { key: "/classes", icon: <BankOutlined />, label: "Classes", roles: ["admin"] },
  { key: "/teachers", icon: <UserOutlined />, label: "Teachers", roles: ["admin"] },
  { key: "/subjects", icon: <BookOutlined />, label: "Subjects", roles: ["admin"] },
  { key: "/assign-subjects", icon: <LinkOutlined />, label: "Assign Subjects", roles: ["admin"] },
];

export default function Sidebar() {
  const { user, logoutUser } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  const handleLogout = () => {
    logoutUser();
    navigate("/login");
  };

  const filteredItems = menuItems.filter(
    (item) => user?.role === "admin" || item.roles.includes(user?.role)
  );

  const initials = (name = "") =>
    name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);

  return (
    <Sider
      collapsible
      collapsed={collapsed}
      onCollapse={setCollapsed}
      trigger={null}
      width={220}
      collapsedWidth={64}
      style={{
        background: "#fff",
        borderRight: "1px solid #f0f0f0",
        height: "100vh",
        position: "sticky",
        top: 0,
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Logo */}
      <div
        style={{
          height: 64,
          display: "flex",
          alignItems: "center",
          justifyContent: collapsed ? "center" : "space-between",
          padding: collapsed ? 0 : "0 16px",
          borderBottom: "1px solid #f0f0f0",
        }}
      >
        {!collapsed && (
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <SafetyCertificateOutlined style={{ fontSize: 20, color: "#4f46e5" }} />
            <span style={{ fontWeight: 700, fontSize: 15, color: "#1f2937" }}>Smart Attendance</span>
          </div>
        )}
        <Button
          type="text"
          icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
          onClick={() => setCollapsed(!collapsed)}
          style={{ fontSize: 14, color: "#9ca3af" }}
        />
      </div>

      {/* Menu */}
      <Menu
        mode="inline"
        selectedKeys={[location.pathname]}
        items={filteredItems}
        onClick={({ key }) => navigate(key)}
        style={{ flex: 1, border: "none", padding: "8px 4px" }}
      />

      {/* Bottom user section */}
      <div
        style={{
          borderTop: "1px solid #f0f0f0",
          padding: collapsed ? "12px 0" : "12px 16px",
          display: "flex",
          alignItems: "center",
          justifyContent: collapsed ? "center" : "space-between",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Avatar
            size={32}
            style={{ background: "#eef2ff", color: "#4f46e5", fontWeight: 600, fontSize: 12 }}
          >
            {user ? initials(user.name) : "?"}
          </Avatar>
          {!collapsed && (
            <div>
              <div style={{ fontSize: 13, fontWeight: 500, color: "#1f2937", lineHeight: 1.2 }}>{user?.name}</div>
              <div style={{ fontSize: 11, color: "#9ca3af", textTransform: "capitalize" }}>{user?.role}</div>
            </div>
          )}
        </div>
        {!collapsed && (
          <Tooltip title="Logout">
            <Button
              type="text"
              icon={<LogoutOutlined />}
              onClick={handleLogout}
              style={{ color: "#9ca3af" }}
            />
          </Tooltip>
        )}
      </div>

      {/* Logout icon when collapsed */}
      {collapsed && (
        <div style={{ textAlign: "center", paddingBottom: 12 }}>
          <Tooltip title="Logout">
            <Button
              type="text"
              icon={<LogoutOutlined />}
              onClick={handleLogout}
              style={{ color: "#9ca3af" }}
            />
          </Tooltip>
        </div>
      )}
    </Sider>
  );
}
