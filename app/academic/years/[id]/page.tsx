import Link from "next/link";
import { redirect } from "next/navigation";

import { ApplicationShell } from "@/components/application-shell";
import { AcademicYearDetails } from "@/components/academic/academic-year-details";
import { Paragraph, Title } from "@/components/ui/typography";
import { AuthenticationError, TenantAccessError } from "@/src/server/auth/errors";
import { requireTenantContext } from "@/src/server/auth/tenant-context";

export default async function AcademicYearPage({ params }: { params: Promise<{ id: string }> }) {
  try { await requireTenantContext(); } catch (error) { if (error instanceof AuthenticationError || error instanceof TenantAccessError) redirect("/login"); throw error; }
  const { id } = await params;
  return (
    <ApplicationShell pageTitle="Academic year" pageContext="Academic year details" selectedKey="academic">
      <div className="mx-auto max-w-5xl">
        <div className="mb-5 text-xs text-[#5f6368]"><Link href="/academic/years" className="hover:text-[#1a73e8]">Academic years</Link><span className="mx-2">/</span><span className="text-[#202124]">Details</span></div>
        <div className="mb-7"><Title level={2} className="!mb-1 !text-[28px] !font-normal">Academic year</Title><Paragraph type="secondary" className="!mb-0">View the dates and terms for this academic year.</Paragraph></div>
        <AcademicYearDetails id={id} />
      </div>
    </ApplicationShell>
  );
}
