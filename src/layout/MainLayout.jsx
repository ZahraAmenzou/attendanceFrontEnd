import { Layout, Grid } from "antd";
import Sidebar from "../components/Sidebar";
import { Outlet } from "react-router-dom";

const { Content } = Layout;
const { useBreakpoint } = Grid;

export default function MainLayout() {
  const screens = useBreakpoint();
  const isMobile = screens.md === false;
  const padding = isMobile ? 12 : 24;

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Sidebar />
      <Layout>
        <Content style={{ padding, background: "#f5f5f5", overflow: "auto" }}>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
}
