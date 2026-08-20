import { redirect } from "next/navigation";
import { Card, Col, Row, Statistic } from "antd";

import { ApplicationShell } from "@/components/application-shell";
import { Paragraph, Title } from "@/components/ui/typography";
import {
  AuthenticationError,
  TenantAccessError,
} from "@/src/server/auth/errors";
import { requireTenantContext } from "@/src/server/auth/tenant-context";

const stats = [
  { title: "Total Students", value: 0 },
  { title: "Faculty Members", value: 0 },
  { title: "Active Courses", value: 0 },
  { title: "Attendance Today", value: 0, suffix: "%" },
];

export default async function Home() {
  try {
    await requireTenantContext();
  } catch (error) {
    if (error instanceof AuthenticationError || error instanceof TenantAccessError) {
      redirect("/login");
    }

    throw error;
  }

  return (
    <ApplicationShell>
      <div className="dashboard-intro">
        <Title level={2}>Good morning</Title>
        <Paragraph type="secondary">
          Your institution overview will appear here as modules are enabled.
        </Paragraph>
      </div>

      <Row gutter={[16, 16]}>
        {stats.map((stat) => (
          <Col xs={24} sm={12} lg={6} key={stat.title}>
            <Card className="stat-card">
              <span className="stat-label">{stat.title}</span>
              <Statistic value={stat.value} suffix={stat.suffix} />
            </Card>
          </Col>
        ))}
      </Row>

      <Card className="empty-panel" style={{ marginTop: 20 }}>
        <Title level={4}>Application foundation</Title>
        <Paragraph type="secondary">
          Authentication, institution setup, academic configuration, and business modules will be introduced as separate vertical slices.
        </Paragraph>
      </Card>
    </ApplicationShell>
  );
}
