import Link from "next/link";
import { ApartmentOutlined, ArrowRightOutlined, BankOutlined, CheckCircleOutlined, InfoCircleOutlined, SettingOutlined } from "@ant-design/icons";
import { Card, Col, Row, Tag } from "antd";
import { redirect } from "next/navigation";

import { ApplicationShell } from "@/components/application-shell";
import { InstitutionNavigation } from "@/components/institution/institution-navigation";
import { Paragraph, Title } from "@/components/ui/typography";
import { AuthenticationError, TenantAccessError } from "@/src/server/auth/errors";
import { requireTenantContext } from "@/src/server/auth/tenant-context";

const settings = [
  { href: "/institution/profile", icon: <SettingOutlined />, tone: "blue", title: "Institution profile", description: "Update your institution name and basic details used across the application.", action: "Manage profile" },
  { href: "/institution/type", icon: <ApartmentOutlined />, tone: "purple", title: "Institution type", description: "Choose the category that controls which platform features are available.", action: "Manage type" },
] as const;

export default async function InstitutionPage() {
  let context;
  try {
    context = await requireTenantContext();
  } catch (error) {
    if (error instanceof AuthenticationError || error instanceof TenantAccessError) redirect("/login");
    throw error;
  }

  return (
    <ApplicationShell pageTitle="Institution" pageContext="Manage your institution details and settings" selectedKey="institution">
      <div className="institution-page">
        <div className="institution-breadcrumb"><Link href="/">Home</Link><span>/</span><strong>Institution</strong></div>
        <section className="institution-hero">
          <div>
            <span className="institution-overline">INSTITUTION MANAGEMENT</span>
            <Title level={1} className="institution-page-title">Your institution</Title>
            <Paragraph className="institution-page-description">Keep your institution information clear and up to date. These settings help organize your workspace and control the features available to you.</Paragraph>
          </div>
          <div className="institution-tip"><InfoCircleOutlined /><span>Start with your basic profile, then choose the correct institution type.</span></div>
        </section>

        <InstitutionNavigation />

        <Card className="institution-summary-card" styles={{ body: { padding: 24 } }}>
          <div className="institution-summary-main">
            <span className="institution-summary-icon"><BankOutlined /></span>
            <div className="institution-summary-copy">
              <span className="institution-summary-label">CURRENT INSTITUTION</span>
              <h2>{context.tenant.name}</h2>
              <div className="institution-summary-meta"><Tag><CheckCircleOutlined /> Active</Tag><span>Your workspace is ready for institution setup.</span></div>
            </div>
          </div>
          <Link href="/institution/profile" className="institution-primary-action">Edit details <ArrowRightOutlined /></Link>
        </Card>

        <section className="institution-section">
          <div className="institution-section-heading"><div><h2>Manage institution settings</h2><p>Choose what you want to update.</p></div><span>2 settings available</span></div>
          <Row gutter={[16, 16]}>
            {settings.map((setting) => <Col xs={24} md={12} key={setting.href}><Link href={setting.href} className={`institution-setting-card institution-setting-${setting.tone}`}><span className="institution-setting-icon">{setting.icon}</span><span className="institution-setting-copy"><strong>{setting.title}</strong><small>{setting.description}</small><em>{setting.action} <ArrowRightOutlined /></em></span></Link></Col>)}
          </Row>
        </section>

        <section className="institution-example-grid">
          <div className="institution-example-box"><div><span className="institution-example-label">EXAMPLE</span><strong>College of Engineering</strong><p>This is how your institution name can appear throughout the application.</p></div><span className="institution-example-icon"><BankOutlined /></span></div>
          <div className="institution-tip-box"><InfoCircleOutlined /><div><strong>What comes next?</strong><p>After your institution setup, continue with academic years, departments, programs, and courses.</p></div></div>
        </section>

        <section className="institution-coming-soon"><span><ApartmentOutlined /></span><div><strong>More institution settings are coming</strong><p>Members, roles, academic configuration, and integrations will appear here as those modules become available.</p></div></section>
      </div>
    </ApplicationShell>
  );
}
