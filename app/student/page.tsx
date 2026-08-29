import { redirect } from "next/navigation";
import { Card, Col, Row, Tag } from "antd";
import { BankOutlined, BookOutlined, CalendarOutlined, IdcardOutlined, MailOutlined, PhoneOutlined, UserOutlined } from "@ant-design/icons";

import { AuthenticationError, AuthorizationError, TenantAccessError } from "@/src/server/auth/errors";
import { requireStudentPortalAccess } from "@/src/server/auth/portal-access";
import { getPrisma } from "@/src/server/auth/tenant-context";

export default async function StudentPortalPage() {
  let access;

  try {
    access = await requireStudentPortalAccess();
  } catch (error) {
    if (error instanceof AuthenticationError || error instanceof TenantAccessError) redirect("/login");
    if (error instanceof AuthorizationError) redirect("/");
    throw error;
  }

  const prisma = getPrisma();
  const student = await prisma.student.findFirst({
    where: { id: access.studentId, tenantId: access.context.tenantId, status: "ACTIVE" },
    include: {
      enrollments: {
        where: { tenantId: access.context.tenantId, status: "ACTIVE" },
        orderBy: { createdAt: "desc" },
        take: 1,
        include: {
          academicYear: { select: { name: true } },
          department: { select: { name: true } },
          program: { select: { name: true } },
        },
      },
    },
  });

  if (!student) redirect("/");

  const enrollment = student.enrollments[0];
  const fullName = [student.firstName, student.middleName, student.lastName].filter(Boolean).join(" ");

  return (
    <main className="min-h-screen bg-[#f6f8f7] text-[#17352d]">
      <header className="border-b border-[#dfe7e3] bg-white">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-5 py-4 sm:px-8">
          <div className="flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#e9f5ef] text-[#0c6b4f]"><BankOutlined /></div><div><p className="font-semibold">EduInstitution</p><p className="text-xs text-[#6a7a74]">Student Portal</p></div></div>
          <Tag color="green" className="!m-0">Active</Tag>
        </div>
      </header>

      <div className="mx-auto w-full max-w-6xl px-5 py-8 sm:px-8 lg:py-12">
        <section className="mb-6 rounded-3xl bg-[#076653] p-6 text-white shadow-[0_20px_60px_rgba(7,84,63,0.12)] sm:p-9">
          <p className="text-sm font-medium uppercase tracking-[0.14em] text-[#dff51f]">Student workspace</p>
          <div className="mt-5 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"><div><h1 className="text-3xl font-semibold tracking-[-0.03em] sm:text-4xl">Welcome, {student.firstName}</h1><p className="mt-2 text-white/75">Your academic profile and current enrollment in one place.</p></div><div className="rounded-2xl bg-white/10 px-4 py-3 text-sm"><span className="block text-white/60">Student number</span><strong>{student.studentNumber}</strong></div></div>
        </section>

        <Row gutter={[20, 20]}>
          <Col xs={24} lg={14}><Card title="My profile" className="h-full" styles={{ body: { padding: 24 } }}>
            <div className="space-y-5"><Info icon={<UserOutlined />} label="Full name" value={fullName} /><Info icon={<MailOutlined />} label="Email" value={student.email ?? "Not provided"} /><Info icon={<PhoneOutlined />} label="Phone" value={student.phone ?? "Not provided"} /><Info icon={<IdcardOutlined />} label="Status" value={student.status === "ACTIVE" ? "Active" : student.status} /></div>
          </Card></Col>
          <Col xs={24} lg={10}><Card title="Current academic details" className="h-full" styles={{ body: { padding: 24 } }}>
            <div className="space-y-5"><Info icon={<CalendarOutlined />} label="Academic year" value={enrollment?.academicYear.name ?? "Not available"} /><Info icon={<BookOutlined />} label="Program" value={enrollment?.program.name ?? "Not available"} /><Info icon={<BankOutlined />} label="Department" value={enrollment?.department.name ?? "Not available"} /></div>
          </Card></Col>
        </Row>

        <section className="mt-6"><Card title="Coming next" styles={{ body: { padding: 24 } }}><p className="m-0 text-[#5f6f69]">Attendance, examinations, timetable, notifications, and additional academic services will appear here as those modules are implemented.</p></Card></section>
      </div>
    </main>
  );
}

function Info({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return <div className="flex gap-3"><span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#f1f7f4] text-[#0c6b4f]">{icon}</span><div><p className="m-0 text-xs font-medium uppercase tracking-wide text-[#7a8883]">{label}</p><p className="mt-1 mb-0 font-medium text-[#17352d]">{value}</p></div></div>;
}
