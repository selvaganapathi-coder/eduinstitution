"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";
import { Layout, Menu, Drawer, Button, Grid, Space, Input, Avatar } from "antd";
import {
  AppstoreOutlined,
  BankOutlined,
  BarChartOutlined,
  BookOutlined,
  CalendarOutlined,
  CheckCircleOutlined,
  DollarOutlined,
  FileTextOutlined,
  MenuOutlined,
  SearchOutlined,
  TeamOutlined,
  BellOutlined,
} from "@ant-design/icons";
import { Text, Title } from "@/components/ui/typography";
import type { MenuProps } from "antd";
const { Header, Sider, Content } = Layout;
const { useBreakpoint } = Grid;

type MenuItem = Required<MenuProps>["items"][number];

type ApplicationShellProps = {
  children: ReactNode;
  pageTitle?: string;
  pageContext?: string;
  selectedKey?: string;
};

const iconClass = "!text-[18px]";

const items: MenuItem[] = [
  { key: "dashboard", icon: <AppstoreOutlined className={iconClass} />, label: <Link href="/">Dashboard</Link> },
  { key: "institution", icon: <BankOutlined className={iconClass} />, label: <Link href="/institution">Institution</Link> },
  { key: "academic", icon: <CalendarOutlined className={iconClass} />, label: <Link href="/academic/years">Academic</Link> },
  { key: "students", icon: <TeamOutlined className={iconClass} />, label: "Students" },
  { key: "faculty", icon: <TeamOutlined className={iconClass} />, label: "Faculty / Staff" },
  { key: "attendance", icon: <CheckCircleOutlined className={iconClass} />, label: "Attendance" },
  { key: "examinations", icon: <FileTextOutlined className={iconClass} />, label: "Examinations" },
  { key: "fees", icon: <DollarOutlined className={iconClass} />, label: "Fees" },
  { key: "reports", icon: <BarChartOutlined className={iconClass} />, label: "Reports" },
];

export function ApplicationShell({ children, pageTitle = "Dashboard", pageContext = "Institution overview", selectedKey = "dashboard" }: ApplicationShellProps) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const screens = useBreakpoint();
  const desktop = screens.md;

  const navigation = (
    <>
      <div className="brand-block">
        <div className="brand-mark" aria-hidden="true">E</div>
        <div><Text className="brand-name">EduInstitution</Text><Text className="brand-subtitle">Learn · Grow · Succeed</Text></div>
      </div>
      <Menu mode="inline" selectedKeys={[selectedKey]} items={items} className="app-menu" aria-label="Main navigation" />
    </>
  );

  return (
    <Layout className="app-shell">
      {desktop ? <Sider width={260} className="app-sider">{navigation}</Sider> : null}
      <Layout>
        <Header className="app-header">
          <div className="header-left">
            {!desktop ? <Button type="text" aria-label="Open navigation" onClick={() => setDrawerOpen(true)} icon={<MenuOutlined />} className="mobile-menu-button" /> : null}
            <Input className="global-search" prefix={<SearchOutlined />} placeholder="Search students, staff, courses..." aria-label="Search" />
          </div>
          <Space size={18}>
            <Button type="text" aria-label="Notifications" icon={<BellOutlined />} className="header-icon" />
            <div className="header-account" aria-label="Account menu">
              <Avatar className="account-avatar">A</Avatar>
              <div className="account-copy"><Text strong>Administrator</Text><Text type="secondary">College Admin</Text></div>
            </div>
          </Space>
        </Header>
        <div className="page-context-bar"><div><Title level={4} className="page-title">{pageTitle}</Title><Text className="page-context">{pageContext}</Text></div></div>
        <Content className="app-content">{children}</Content>
      </Layout>
      {!desktop ? <Drawer placement="left" open={drawerOpen} onClose={() => setDrawerOpen(false)} width={280} title={null} styles={{ body: { padding: 0, background: "#fff" } }}>{navigation}</Drawer> : null}
    </Layout>
  );
}
