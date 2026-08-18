import { Card, Col, Row, Statistic, Typography } from "antd";
import { ApplicationShell } from "@/components/application-shell";

const stats = [
  { title: "Total Students", value: 0 },
  { title: "Faculty Members", value: 0 },
  { title: "Active Courses", value: 0 },
  { title: "Attendance Today", value: 0, suffix: "%" },
];

export default function Home() {
  return (
    <ApplicationShell>
      <div className="dashboard-intro">
        <Typography.Title level={2}>Good morning</Typography.Title>
        <Typography.Paragraph type="secondary">
          Your institution overview will appear here as modules are enabled.
        </Typography.Paragraph>
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
        <Typography.Title level={4}>Application foundation</Typography.Title>
        <Typography.Paragraph type="secondary">
          Authentication, institution setup, academic configuration, and business modules will be introduced as separate vertical slices.
        </Typography.Paragraph>
      </Card>
    </ApplicationShell>
  );
}
