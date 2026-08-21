"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";
import { Avatar, Badge, Button, Drawer, Grid, Input, Layout, Menu, Space } from "antd";
import {
  AppstoreOutlined,
  BankOutlined,
  BarChartOutlined,
  CalendarOutlined,
  CheckCircleOutlined,
  DollarOutlined,
  FileTextOutlined,
  MenuOutlined,
  SearchOutlined,
  TeamOutlined,
  BellOutlined,
  QuestionCircleOutlined,
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
  { key: "dashboard", icon: <AppstoreOutlined className={iconClass} />, label: <Link href="/">Home</Link> },
  { key: "institution", icon: <BankOutlined className={iconClass} />, label: <Link href="/institution">Institution</Link> },
  { key: "academic", icon: <CalendarOutlined className={iconClass} />, label: <Link href="/academic/years">Academic</Link> },
  { key: "students", icon: <TeamOutlined className={iconClass} />, label: "Students" },
  { key: "faculty", icon: <TeamOutlined className={iconClass} />, label: "Faculty / Staff" },
  { key: "attendance", icon: <CheckCircleOutlined className={iconClass} />, label: "Attendance" },
  { key: "examinations", icon: <FileTextOutlined className={iconClass} />, label: "Examinations" },
  { key: "fees", icon: <DollarOutlined className={iconClass} />, label: "Fees" },
  { key: "reports", icon: <BarChartOutlined className={iconClass} />, label: "Reports" },
];

export function ApplicationShell({ children, pageTitle = "Home", pageContext = "Institution overview", selectedKey = "dashboard" }: ApplicationShellProps) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const screens = useBreakpoint();
  const desktop = screens.md;

  const navigation = (
    <div className="shell-navigation">
      <div className="brand-block">
        <div className="brand-mark" aria-hidden="true">
          <span>Edu</span>
        </div>
        <div className="min-w-0">
          <Text className="brand-name">EduInstitution</Text>
          <Text className="brand-subtitle">Learn · Grow · Succeed</Text>
        </div>
      </div>
      <Menu mode="inline" selectedKeys={[selectedKey]} items={items} className="app-menu" aria-label="Main navigation" />
    </div>
  );

  return (
    <Layout className="app-shell">
      {desktop ? <Sider width={236} className="app-sider">{navigation}</Sider> : null}
      <Layout className="app-main-layout">
        <Header className="app-header">
          <div className="header-left">
            {!desktop ? <Button type="text" aria-label="Open navigation" onClick={() => setDrawerOpen(true)} icon={<MenuOutlined />} className="mobile-menu-button" /> : null}
            <Input className="global-search" prefix={<SearchOutlined />} placeholder="Search students, staff, courses..." aria-label="Search" allowClear />
          </div>
          <Space size={desktop ? 18 : 8}>
            <Button type="text" aria-label="Help and support" icon={<QuestionCircleOutlined />} className="header-icon" />
            <Badge dot offset={[-3, 4]}>
              <Button type="text" aria-label="Notifications" icon={<BellOutlined />} className="header-icon" />
            </Badge>
            <div className="header-account" aria-label="Account menu">
              <Avatar className="account-avatar">A</Avatar>
              {desktop ? <div className="account-copy"><Text strong>Administrator</Text><Text type="secondary">Institution Admin</Text></div> : null}
            </div>
          </Space>
        </Header>
        <div className="page-context-bar">
          <div className="page-context-inner">
            <Title level={4} className="page-title">{pageTitle}</Title>
            <Text className="page-context">{pageContext}</Text>
          </div>
        </div>
        <Content className="app-content">{children}</Content>
      </Layout>
      {!desktop ? <Drawer placement="left" open={drawerOpen} onClose={() => setDrawerOpen(false)} width={280} title={null} styles={{ body: { padding: 0, background: "#fff" } }}>{navigation}</Drawer> : null}
    </Layout>
  );
}
