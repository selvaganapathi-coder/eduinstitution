import Link from "next/link";
import { redirect } from "next/navigation";

import { Button } from "antd";
import { ApplicationShell } from "@/components/application-shell";
import { AcademicYearList } from "@/components/academic/academic-year-list";
import { Paragraph, Title } from "@/components/ui/typography";
import { AuthenticationError, TenantAccessError } from "@/src/server/auth/errors";
import { requireTenantContext } from "@/src/server/auth/tenant-context";

export default async function AcademicYearsPage() {
  try {
    await requireTenantContext();
  } catch (error) {
    if (error instanceof AuthenticationError || error instanceof TenantAccessError) redirect("/login");
    throw error;
  }

  return (
    <ApplicationShell pageTitle="Academic years" pageContext="Manage your academic years" selectedKey="academic">
      <div className="mx-auto max-w-6xl">
        <div className="mb-5 text-xs text-[#5f6368]"><Link href="/" className="hover:text-[#1a73e8]">Dashboard</Link><span className="mx-2">/</span><span className="text-[#202124]">Academic years</span></div>
        <div className="mb-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div><Title level={2} className="!mb-1 !text-[28px] !font-normal">Academic years</Title><Paragraph type="secondary" className="!mb-0">Set the years and terms your institution uses for teaching and records.</Paragraph></div>
          <Link href="/academic/years/new"><Button type="primary" size="large">Add academic year</Button></Link>
        </div>
        <AcademicYearList />
      </div>
    </ApplicationShell>
  );
}
