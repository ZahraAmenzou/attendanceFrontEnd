import { useContext, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Layout, Menu, Button, Avatar, Tooltip, Grid, Drawer } from "antd";
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
  MenuOutlined,
  CloseOutlined,
  LogoutOutlined,
  SafetyCertificateOutlined,
} from "@ant-design/icons";

const { Sider } = Layout;
const { useBreakpoint } = Grid;

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
  const screens = useBreakpoint();
  const [collapsed, setCollapsed] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  if (screens.md === undefined) return null;
  const isMobile = !screens.md;

  const handleLogout = () => {
    logoutUser();
    navigate("/login");
  };

  const filteredItems = menuItems.filter(
    (item) => user?.role === "admin" || item.roles.includes(user?.role)
  );

  const handleNavigate = ({ key }) => {
    setDrawerOpen(false);
    navigate(key);
  };

  const initials = (name = "") =>
    name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);

  const menuEl = (
    <Menu
      mode="inline"
      selectedKeys={[location.pathname]}
      items={filteredItems}
      onClick={handleNavigate}
      style={{ flex: 1, border: "none", padding: "8px 4px", overflow: "auto" }}
    />
  );

  const userEl = (
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
  );

  // Mobile: top bar + hamburger drawer
  if (isMobile) {
    return (
      <>
        <div
          style={{
            position: "sticky",
            top: 0,
            zIndex: 100,
            height: 56,
            background: "#fff",
            borderBottom: "1px solid #f0f0f0",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "0 12px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0 }}>
            <Button
              type="text"
              icon={<MenuOutlined style={{ fontSize: 18 }} />}
              onClick={() => setDrawerOpen(true)}
              style={{ color: "#1f2937" }}
            />
            <SafetyCertificateOutlined style={{ fontSize: 18, color: "#4f46e5", flexShrink: 0 }} />
            <span
              style={{
                fontWeight: 700,
                fontSize: 14,
                color: "#1f2937",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              Smart Attendance
            </span>
          </div>
          <Tooltip title="Logout">
            <Button
              type="text"
              icon={<LogoutOutlined />}
              onClick={handleLogout}
              style={{ color: "#9ca3af" }}
            />
          </Tooltip>
        </div>

        <Drawer
          placement="left"
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          width={260}
          closable={false}
          styles={{
            body: {
              padding: 0,
              display: "flex",
              flexDirection: "column",
              height: "100%",
            },
          }}
        >
          {/* Logo header */}
          <div
            style={{
              height: 56,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "0 16px",
              borderBottom: "1px solid #f0f0f0",
              flexShrink: 0,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <SafetyCertificateOutlined style={{ fontSize: 20, color: "#4f46e5" }} />
              <span style={{ fontWeight: 700, fontSize: 15, color: "#1f2937" }}>Smart Attendance</span>
            </div>
            <Button
              type="text"
              icon={<CloseOutlined />}
              onClick={() => setDrawerOpen(false)}
              style={{ color: "#9ca3af" }}
            />
          </div>

          {menuEl}

          {/* Bottom user section */}
          <div
            style={{
              borderTop: "1px solid #f0f0f0",
              padding: "12px 16px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexShrink: 0,
            }}
          >
            {userEl}
            <Button
              type="text"
              icon={<LogoutOutlined />}
              onClick={handleLogout}
              style={{ color: "#9ca3af" }}
            />
          </div>
        </Drawer>
      </>
    );
  }

  // Desktop: fixed sider
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
          flexShrink: 0,
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
      {menuEl}

      {/* Bottom user section */}
      <div
        style={{
          borderTop: "1px solid #f0f0f0",
          padding: collapsed ? "12px 0" : "12px 16px",
          display: "flex",
          alignItems: "center",
          justifyContent: collapsed ? "center" : "space-between",
          flexShrink: 0,
        }}
      >
        {userEl}
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
        <div style={{ textAlign: "center", paddingBottom: 12, flexShrink: 0 }}>
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
