"use client";

import { useState } from "react";
import { Layout, Menu, Drawer, Button, Typography, Grid, Space } from "antd";
import type { MenuProps } from "antd";

const { Header, Sider, Content } = Layout;
const { Title, Text } = Typography;
const { useBreakpoint } = Grid;

type MenuItem = Required<MenuProps>["items"][number];

const items: MenuItem[] = [
  { key: "dashboard", label: "Dashboard" },
  { key: "students", label: "Students" },
  { key: "faculty", label: "Faculty" },
  { key: "academics", label: "Academics" },
  { key: "attendance", label: "Attendance" },
  { key: "examinations", label: "Examinations" },
  { key: "fees", label: "Fees" },
  { key: "reports", label: "Reports" },
];

export function ApplicationShell({ children }: { children: React.ReactNode }) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const screens = useBreakpoint();
  const desktop = screens.md;

  const navigation = (
    <>
      <div className="brand-block">
        <div className="brand-mark">E</div>
        <div>
          <Text className="brand-name">EduInstitution</Text>
          <Text className="brand-subtitle">Education Management</Text>
        </div>
      </div>
      <Menu
        mode="inline"
        theme="dark"
        selectedKeys={["dashboard"]}
        items={items}
        className="app-menu"
      />
    </>
  );

  return (
    <Layout className="app-shell">
      {desktop ? (
        <Sider width={260} className="app-sider">
          {navigation}
        </Sider>
      ) : null}

      <Layout>
        <Header className="app-header">
          <Space size={16}>
            {!desktop ? (
              <Button
                type="text"
                aria-label="Open navigation"
                onClick={() => setDrawerOpen(true)}
                className="mobile-menu-button"
              >
                <span aria-hidden>☰</span>
              </Button>
            ) : null}
            <div>
              <Title level={4} className="page-title">Dashboard</Title>
              <Text className="page-context">Institution overview</Text>
            </div>
          </Space>
          <div className="header-account" aria-label="Account menu placeholder">
            <span className="account-avatar">A</span>
            <div className="account-copy">
              <Text strong>Administrator</Text>
              <Text type="secondary">College Admin</Text>
            </div>
          </div>
        </Header>

        <Content className="app-content">{children}</Content>
      </Layout>

      {!desktop ? (
        <Drawer
          placement="left"
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          width={280}
          title={null}
          styles={{ body: { padding: 0, background: "#06231D" } }}
        >
          {navigation}
        </Drawer>
      ) : null}
    </Layout>
  );
}
