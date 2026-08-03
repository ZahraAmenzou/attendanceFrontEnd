import { Layout } from "antd";
import Sidebar from "../components/Sidebar";
import { Outlet } from "react-router-dom";

const { Content } = Layout;

export default function MainLayout() {
  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Sidebar />
      <Layout>
        <Content style={{ padding: 24, background: "#f5f5f5", overflow: "auto" }}>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
}
