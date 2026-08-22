import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowRightOutlined, BankOutlined, CalendarOutlined, CheckCircleOutlined, FileTextOutlined, InfoCircleOutlined, QuestionCircleOutlined, SettingOutlined, TeamOutlined } from "@ant-design/icons";
import { Button, Card, Col, Progress, Row, Statistic } from "antd";

import { ApplicationShell } from "@/components/application-shell";
import { Paragraph, Title } from "@/components/ui/typography";
import { AuthenticationError, TenantAccessError } from "@/src/server/auth/errors";
import { requireTenantContext } from "@/src/server/auth/tenant-context";

const stats = [
  { title: "Students", value: 0, helper: "No students added yet", icon: <TeamOutlined />, tone: "green" },
  { title: "Courses", value: 0, helper: "Start building your courses", icon: <FileTextOutlined />, tone: "blue" },
  { title: "Faculty / Staff", value: 0, helper: "No staff added yet", icon: <TeamOutlined />, tone: "purple" },
  { title: "Attendance today", value: 0, suffix: "%", helper: "Available when attendance starts", icon: <CheckCircleOutlined />, tone: "orange" },
] as const;

const quickActions = [
  { href: "/institution", icon: <BankOutlined />, tone: "green", title: "Institution", description: "Review your profile" },
  { href: "/academic/years/new", icon: <CalendarOutlined />, tone: "blue", title: "Academic year", description: "Create a new year" },
  { href: "/academic/departments", icon: <TeamOutlined />, tone: "purple", title: "Departments", description: "Organize academic areas" },
  { href: "/academic/courses", icon: <FileTextOutlined />, tone: "orange", title: "Courses", description: "Manage course details" },
] as const;

const setupSteps = [
  { number: "01", title: "Confirm institution details", description: "Check your institution name and profile information.", href: "/institution", complete: true },
  { number: "02", title: "Set up your academic year", description: "Create the academic period used by your institution.", href: "/academic/years", complete: false },
  { number: "03", title: "Organize departments and programs", description: "Add the structure used to group your academic courses.", href: "/academic/departments", complete: false },
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
    <ApplicationShell pageTitle="Home" pageContext="A simple overview of your institution" selectedKey="dashboard">
      <div className="dashboard-stack">
        <section className="dashboard-hero dashboard-hero-redesigned">
          <div className="dashboard-hero-copy dashboard-hero-layout">
            <div className="dashboard-hero-main">
              <div className="dashboard-hero-kicker"><span className="dashboard-live-dot" /> INSTITUTION WORKSPACE</div>
              <Title level={1} className="dashboard-hero-title">Welcome back</Title>
              <Paragraph className="dashboard-hero-description">Manage {context.tenant.name}, organize your academic setup, and prepare your institution for the next stage.</Paragraph>
              <div className="dashboard-hero-actions">
                <Link href="/institution"><Button size="large" className="dashboard-primary-button">Manage institution <ArrowRightOutlined /></Button></Link>
                <Link href="/academic/years"><Button size="large" className="dashboard-secondary-button">Academic setup</Button></Link>
              </div>
            </div>
            <div className="dashboard-hero-status" aria-label="Institution status">
              <div className="dashboard-status-icon"><BankOutlined /></div>
              <div><span>Current workspace</span><strong>{context.tenant.name}</strong></div>
              <div className="dashboard-status-chip"><CheckCircleOutlined /> Active</div>
            </div>
          </div>
        </section>

        <section aria-label="Institution summary">
          <div className="dashboard-section-heading">
            <div><h2>Institution overview</h2><p>A quick look at your current setup.</p></div>
            <span className="dashboard-section-caption">Updated when new data is added</span>
          </div>
          <Row gutter={[16, 16]}>
            {stats.map((stat) => (
              <Col xs={24} sm={12} xl={6} key={stat.title}>
                <Card className="stat-card dashboard-stat-card" styles={{ body: { padding: 20 } }}>
                  <div className="dashboard-stat-top">
                    <div className={`dashboard-stat-icon dashboard-stat-icon-${stat.tone}`}>{stat.icon}</div>
                    <span className="dashboard-stat-label">{stat.title}</span>
                  </div>
                  <Statistic value={stat.value} suffix={"suffix" in stat ? stat.suffix : undefined} valueStyle={{ marginTop: 14, fontSize: 30, lineHeight: 1.05, fontWeight: 700, color: "#202124" }} />
                  <p className="dashboard-stat-helper">{stat.helper}</p>
                </Card>
              </Col>
            ))}
          </Row>
        </section>

        <Row gutter={[16, 16]}>
          <Col xs={24} xl={15}>
            <Card className="dashboard-card dashboard-action-card" styles={{ body: { padding: 22 } }}>
              <div className="dashboard-card-heading">
                <div><h2>Quick actions</h2><p>Go directly to the tasks you are likely to need next.</p></div>
                <span className="dashboard-icon-label"><InfoCircleOutlined /> Easy start</span>
              </div>
              <div className="dashboard-quick-grid">
                {quickActions.map((action) => (
                  <Link key={action.href} href={action.href} className={`dashboard-quick-action dashboard-quick-${action.tone}`}>
                    <span className="dashboard-quick-icon">{action.icon}</span>
                    <span className="dashboard-quick-copy"><strong>{action.title}</strong><small>{action.description}</small></span>
                    <ArrowRightOutlined className="dashboard-quick-arrow" />
                  </Link>
                ))}
              </div>
            </Card>
          </Col>

          <Col xs={24} xl={9}>
            <Card className="dashboard-card dashboard-help-card" styles={{ body: { padding: 22 } }}>
              <div className="dashboard-card-heading"><div><h2>Need help?</h2><p>Start with the basics.</p></div><QuestionCircleOutlined className="dashboard-help-icon" /></div>
              <div className="dashboard-help-list">
                <div><span className="dashboard-help-number">1</span><div><strong>Complete your institution profile</strong><p>Add the basic information for your institution.</p></div></div>
                <div><span className="dashboard-help-number">2</span><div><strong>Create an academic year</strong><p>Set up the period used for your academic activities.</p></div></div>
              </div>
              <Link href="/institution" className="dashboard-text-link">Open institution settings <ArrowRightOutlined /></Link>
            </Card>
          </Col>
        </Row>

        <Card className="dashboard-card dashboard-setup-card" styles={{ body: { padding: 24 } }}>
          <div className="dashboard-card-heading dashboard-setup-heading">
            <div><span className="dashboard-overline">GETTING STARTED</span><h2>Complete your initial setup</h2><p>Follow these simple steps to prepare your institution for future modules.</p></div>
            <div className="dashboard-progress"><span>Setup progress</span><strong>1 of 3</strong><Progress percent={33} showInfo={false} strokeColor="#188038" trailColor="#e6f4ea" /></div>
          </div>
          <div className="dashboard-steps">
            {setupSteps.map((step) => (
              <Link key={step.number} href={step.href} className="dashboard-step">
                <span className={`dashboard-step-number ${step.complete ? "is-complete" : ""}`}>{step.complete ? <CheckCircleOutlined /> : step.number}</span>
                <span className="dashboard-step-copy"><strong>{step.title}</strong><small>{step.description}</small></span>
                <ArrowRightOutlined className="dashboard-step-arrow" />
              </Link>
            ))}
          </div>
        </Card>

        <Card className="dashboard-tip-card" styles={{ body: { padding: 18 } }}>
          <div className="dashboard-tip-icon"><SettingOutlined /></div>
          <div><strong>Tip for your institution setup</strong><p>Start with your institution details and academic year. Then add departments, programs, and courses in that order.</p></div>
        </Card>
      </div>
    </ApplicationShell>
  );
}
