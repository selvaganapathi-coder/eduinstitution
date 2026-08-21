import Link from "next/link";
import { redirect } from "next/navigation";
import { BankOutlined, CalendarOutlined, FileTextOutlined, QuestionCircleOutlined, SettingOutlined, TeamOutlined } from "@ant-design/icons";
import { Button, Card, Col, Row, Statistic } from "antd";

import { ApplicationShell } from "@/components/application-shell";
import { Paragraph, Title } from "@/components/ui/typography";
import { AuthenticationError, TenantAccessError } from "@/src/server/auth/errors";
import { requireTenantContext } from "@/src/server/auth/tenant-context";

const stats = [
  { title: "Students", value: 0, icon: <TeamOutlined />, tone: "green" },
  { title: "Courses", value: 0, icon: <FileTextOutlined />, tone: "blue" },
  { title: "Faculty / Staff", value: 0, icon: <TeamOutlined />, tone: "purple" },
  { title: "Attendance today", value: 0, suffix: "%", icon: <CalendarOutlined />, tone: "orange" },
] as const;

export default async function Home() {
  let context;

  try {
    context = await requireTenantContext();
  } catch (error) {
    if (error instanceof AuthenticationError || error instanceof TenantAccessError) redirect("/login");
    throw error;
  }

  return (
    <ApplicationShell pageTitle="Home" pageContext="A clear view of your institution" selectedKey="dashboard">
      <div className="space-y-5">
        <section className="dashboard-hero">
          <div className="dashboard-hero-copy">
            <p className="mb-2 text-sm font-medium text-white/85">Welcome back</p>
            <Title level={1} className="!mb-2 !text-[30px] !font-semibold !text-white sm:!text-[36px]">Welcome to EduInstitution</Title>
            <Paragraph className="!mb-5 !max-w-2xl !text-[15px] !text-white/90">Manage your institution, academic setup, and future student services from one simple workspace.</Paragraph>
            <div className="flex flex-wrap gap-3">
              <Link href="/institution"><Button size="large" className="!border-white !bg-white !text-[#137333]">Get started</Button></Link>
              <Link href="/academic/years"><Button size="large" ghost>Academic setup</Button></Link>
            </div>
          </div>
        </section>

        <Row gutter={[16, 16]}>
          {stats.map((stat) => (
            <Col xs={24} sm={12} lg={6} key={stat.title}>
              <Card className="stat-card h-full" styles={{ body: { padding: 20 } }}>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="stat-label">{stat.title}</span>
                    <Statistic value={stat.value} suffix={"suffix" in stat ? stat.suffix : undefined} valueStyle={{ marginTop: 4, fontSize: 28, fontWeight: 700, color: "#202124" }} />
                    <span className="text-xs text-[#5f6368]">No records added yet</span>
                  </div>
                  <span className={`grid h-11 w-11 shrink-0 place-items-center rounded-full ${stat.tone === "green" ? "bg-[#e6f4ea] text-[#188038]" : stat.tone === "blue" ? "bg-[#e8f0fe] text-[#1a73e8]" : stat.tone === "purple" ? "bg-[#f3e8fd] text-[#7e57c2]" : "bg-[#fef7e0] text-[#e37400]"}`}>{stat.icon}</span>
                </div>
              </Card>
            </Col>
          ))}
        </Row>

        <Row gutter={[16, 16]}>
          <Col xs={24} lg={8}>
            <Card className="dashboard-card" title={<span className="section-title"><BankOutlined className="mr-2 text-[#188038]" />Institution overview</span>}>
              <div className="space-y-3">
                <div><p className="mb-1 text-xs text-[#5f6368]">Institution</p><p className="m-0 text-base font-medium text-[#202124]">{context.tenant.name}</p></div>
                <div><p className="mb-1 text-xs text-[#5f6368]">Status</p><span className="inline-flex rounded-full bg-[#e6f4ea] px-3 py-1 text-xs font-medium text-[#137333]">Active</span></div>
                <Link href="/institution" className="inline-block pt-1 text-sm font-medium text-[#1a73e8]">View institution details →</Link>
              </div>
            </Card>
          </Col>

          <Col xs={24} lg={8}>
            <Card className="dashboard-card" title={<span className="section-title">Quick actions</span>}>
              <div className="grid grid-cols-2 gap-3">
                <Link href="/institution" className="rounded-xl border border-[#dadce0] p-4 transition hover:border-[#a8c7fa] hover:bg-[#f8f9fa]"><BankOutlined className="mb-2 text-lg text-[#188038]" /><p className="m-0 text-sm font-medium text-[#202124]">Institution</p><p className="mt-1 text-xs text-[#5f6368]">Review profile</p></Link>
                <Link href="/academic/years/new" className="rounded-xl border border-[#dadce0] p-4 transition hover:border-[#a8c7fa] hover:bg-[#f8f9fa]"><CalendarOutlined className="mb-2 text-lg text-[#1a73e8]" /><p className="m-0 text-sm font-medium text-[#202124]">Academic year</p><p className="mt-1 text-xs text-[#5f6368]">Add a new year</p></Link>
              </div>
            </Card>
          </Col>

          <Col xs={24} lg={8}>
            <Card className="dashboard-card" title={<span className="section-title">Need help?</span>}>
              <div className="space-y-4">
                <div className="flex gap-3"><QuestionCircleOutlined className="mt-1 text-lg text-[#1a73e8]" /><div><p className="m-0 text-sm font-medium text-[#202124]">Start with your institution profile</p><p className="mt-1 text-xs leading-5 text-[#5f6368]">Add the basic details first. You can configure academic settings next.</p></div></div>
                <Link href="/institution" className="text-sm font-medium text-[#1a73e8]">Open institution settings →</Link>
              </div>
            </Card>
          </Col>
        </Row>

        <Card className="dashboard-card" title={<span className="section-title"><SettingOutlined className="mr-2 text-[#5f6368]" />Getting started</span>}>
          <div className="grid gap-4 md:grid-cols-3">
            <div><p className="m-0 text-sm font-medium text-[#202124]">1. Confirm institution details</p><p className="mt-1 text-sm text-[#5f6368]">Make sure your institution profile is correct.</p></div>
            <div><p className="m-0 text-sm font-medium text-[#202124]">2. Add an academic year</p><p className="mt-1 text-sm text-[#5f6368]">Set the academic period used by your institution.</p></div>
            <div><p className="m-0 text-sm font-medium text-[#202124]">3. Continue as modules arrive</p><p className="mt-1 text-sm text-[#5f6368]">Students, staff, attendance, fees, and reports will be added step by step.</p></div>
          </div>
        </Card>
      </div>
    </ApplicationShell>
  );
}
