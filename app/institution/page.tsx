import Link from "next/link";
import { ApartmentOutlined, ArrowRightOutlined, BankOutlined, CheckCircleOutlined, InfoCircleOutlined, SettingOutlined } from "@ant-design/icons";
import { Card, Col, Row, Tag } from "antd";
import { redirect } from "next/navigation";
import styles from "./institution.module.css";

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
  try { context = await requireTenantContext(); }
  catch (error) { if (error instanceof AuthenticationError || error instanceof TenantAccessError) redirect("/login"); throw error; }

  return <ApplicationShell pageTitle="Institution" pageContext="Manage your institution details and settings" selectedKey="institution">
    <div className={styles.page}>
      <div className={styles.breadcrumb}><Link href="/">Home</Link><span>/</span><strong>Institution</strong></div>
      <section className={styles.hero}><div><span className={styles.overline}>INSTITUTION MANAGEMENT</span><Title level={1} className={styles.title}>Your institution</Title><Paragraph className={styles.description}>Keep your institution information clear and up to date. These settings help organize your workspace and control the features available to you.</Paragraph></div><div className={styles.tip}><InfoCircleOutlined /><span>Start with your basic profile, then choose the correct institution type.</span></div></section>
      <InstitutionNavigation />
      <Card className={styles.summary} styles={{ body: { padding: 24 } }}><div className={styles.summaryBody}><div className={styles.summaryMain}><span className={styles.summaryIcon}><BankOutlined /></span><div className={styles.summaryCopy}><span className={styles.summaryLabel}>CURRENT INSTITUTION</span><h2>{context.tenant.name}</h2><div className={styles.summaryMeta}><Tag><CheckCircleOutlined /> Active</Tag><span>Your workspace is ready for institution setup.</span></div></div></div><Link href="/institution/profile" className={styles.primaryAction}>Edit details <ArrowRightOutlined /></Link></div></Card>
      <section className={styles.section}><div className={styles.sectionHeading}><div><h2>Manage institution settings</h2><p>Choose what you want to update.</p></div><span>2 settings available</span></div><Row gutter={[16,16]}>{settings.map((setting) => <Col xs={24} md={12} key={setting.href}><Link href={setting.href} className={`${styles.settingCard} ${setting.tone === "blue" ? styles.settingBlue : styles.settingPurple}`}><span className={styles.settingIcon}>{setting.icon}</span><span className={styles.settingCopy}><strong>{setting.title}</strong><small>{setting.description}</small><em>{setting.action} <ArrowRightOutlined /></em></span></Link></Col>)}</Row></section>
      <section className={styles.exampleGrid}><div className={styles.exampleBox}><div><span className={styles.exampleLabel}>EXAMPLE</span><strong>College of Engineering</strong><p>This is how your institution name can appear throughout the application.</p></div><span className={styles.exampleIcon}><BankOutlined /></span></div><div className={styles.tipBox}><InfoCircleOutlined /><div><strong>What comes next?</strong><p>After your institution setup, continue with academic years, departments, programs, and courses.</p></div></div></section>
      <section className={styles.comingSoon}><span><ApartmentOutlined /></span><div><strong>More institution settings are coming</strong><p>Members, roles, academic configuration, and integrations will appear here as those modules become available.</p></div></section>
    </div>
  </ApplicationShell>;
}
