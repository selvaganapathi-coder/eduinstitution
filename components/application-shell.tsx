"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";
import {
  AppstoreOutlined,
  BankOutlined,
  BarChartOutlined,
  BellOutlined,
  CalendarOutlined,
  CheckCircleOutlined,
  DollarOutlined,
  FileTextOutlined,
  MenuOutlined,
  QuestionCircleOutlined,
  SearchOutlined,
  TeamOutlined,
} from "@ant-design/icons";
import { Avatar, Badge, Button, Drawer, Grid, Input, Layout, Menu, Space } from "antd";
import type { MenuProps } from "antd";

import { Text, Title } from "@/components/ui/typography";

const { Header, Sider, Content } = Layout;
const { useBreakpoint } = Grid;

type MenuItem = Required<MenuProps>["items"][number];
type ApplicationShellProps = {
  children: ReactNode;
  pageTitle?: string;
  pageContext?: string;
  selectedKey?: string;
  showPageContext?: boolean;
};

const iconClass = "!text-[18px]";
const academicChildKeys = ["academic-years", "departments", "courses"];

const items: MenuItem[] = [
  { key: "dashboard", icon: <AppstoreOutlined className={`${iconClass} nav-icon nav-icon-green`} />, label: <Link href="/">Home</Link> },
  { key: "institution", icon: <BankOutlined className={`${iconClass} nav-icon nav-icon-blue`} />, label: <Link href="/institution">Institution</Link> },
  {
    key: "academic",
    icon: <CalendarOutlined className={`${iconClass} nav-icon nav-icon-orange`} />,
    label: <Link href="/academic/years">Academic</Link>,
    children: [
      { key: "academic-years", label: <Link href="/academic/years">Academic years</Link> },
      { key: "departments", label: <Link href="/academic/departments">Departments & Programs</Link> },
      { key: "courses", label: <Link href="/academic/courses">Courses & Subjects</Link> },
    ],
  },
  { key: "students", icon: <TeamOutlined className={`${iconClass} nav-icon nav-icon-purple`} />, label: <Link href="/students">Students</Link> },
  { key: "faculty", icon: <TeamOutlined className={`${iconClass} nav-icon nav-icon-purple`} />, label: <Link href="/staff">Faculty / Staff</Link> },
  { key: "attendance", icon: <CheckCircleOutlined className={`${iconClass} nav-icon nav-icon-green`} />, label: "Attendance" },
  { key: "examinations", icon: <FileTextOutlined className={`${iconClass} nav-icon nav-icon-blue`} />, label: "Examinations" },
  { key: "fees", icon: <DollarOutlined className={`${iconClass} nav-icon nav-icon-orange`} />, label: "Fees" },
  { key: "reports", icon: <BarChartOutlined className={`${iconClass} nav-icon nav-icon-blue`} />, label: "Reports" },
];

export function ApplicationShell({ children, pageTitle = "Home", pageContext = "Institution overview", selectedKey = "dashboard", showPageContext = true }: ApplicationShellProps) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [openKeys, setOpenKeys] = useState<string[]>(() => academicChildKeys.includes(selectedKey) ? ["academic"] : []);
  const screens = useBreakpoint();
  const desktop = screens.md;

  const navigation = (
    <div className="shell-navigation">
      <div className="brand-block">
        <div className="brand-mark" aria-hidden="true"><span>EI</span></div>
        <div className="min-w-0">
          <Text className="brand-name">EduInstitution</Text>
          <Text className="brand-subtitle">Education management</Text>
        </div>
      </div>
      <div className="navigation-label">WORKSPACE</div>
      <Menu
        mode="inline"
        selectedKeys={[selectedKey]}
        openKeys={openKeys}
        onOpenChange={setOpenKeys}
        items={items}
        className="app-menu"
        aria-label="Main navigation"
      />
    </div>
  );

  return (
    <Layout className="app-shell">
      {desktop ? <Sider width={252} className="app-sider">{navigation}</Sider> : null}
      <Layout className="app-main-layout">
        <Header className="app-header">
          <div className="header-left">
            {!desktop ? (
              <Button type="text" aria-label="Open navigation" onClick={() => setDrawerOpen(true)} icon={<MenuOutlined />} className="mobile-menu-button" />
            ) : null}
            <Input className="global-search" prefix={<SearchOutlined />} placeholder="Search students, courses and settings" aria-label="Search" allowClear />
          </div>
          <Space size={desktop ? 14 : 6}>
            <Button type="text" aria-label="Help and support" icon={<QuestionCircleOutlined />} className="header-icon" />
            <Badge dot offset={[-3, 4]}>
              <Button type="text" aria-label="Notifications" icon={<BellOutlined />} className="header-icon" />
            </Badge>
            <div className="header-account" aria-label="Account menu">
              <Avatar className="account-avatar">A</Avatar>
              {desktop ? (
                <div className="account-copy">
                  <Text strong>Administrator</Text>
                  <Text type="secondary">Institution Admin</Text>
                </div>
              ) : null}
            </div>
          </Space>
        </Header>

        {showPageContext ? <div className="page-context-bar">
          <div className="page-context-inner">
            <Title level={4} className="page-title">{pageTitle}</Title>
            <Text className="page-context">{pageContext}</Text>
          </div>
        </div> : null}

        <Content className="app-content">{children}</Content>
      </Layout>

      {!desktop ? (
        <Drawer placement="left" open={drawerOpen} onClose={() => setDrawerOpen(false)} width={296} title={null} styles={{ body: { padding: 0, background: "#fff" } }}>
          {navigation}
        </Drawer>
      ) : null}
    </Layout>
  );
}
