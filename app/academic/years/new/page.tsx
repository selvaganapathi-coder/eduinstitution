import Link from "next/link";
import { redirect } from "next/navigation";

import { ApplicationShell } from "@/components/application-shell";
import { AcademicYearForm } from "@/components/academic/academic-year-form";
import { Paragraph, Title } from "@/components/ui/typography";
import { AuthenticationError, TenantAccessError } from "@/src/server/auth/errors";
import { requireTenantContext } from "@/src/server/auth/tenant-context";

export default async function NewAcademicYearPage() {
  try {
    await requireTenantContext();
  } catch (error) {
    if (error instanceof AuthenticationError || error instanceof TenantAccessError) redirect("/login");
    throw error;
  }

  return (
    <ApplicationShell pageTitle="Add academic year" pageContext="Set up a new academic year" selectedKey="academic">
      <div className="mx-auto max-w-3xl">
        <div className="mb-5 text-xs text-[#5f6368]"><Link href="/academic/years" className="hover:text-[#1a73e8]">Academic years</Link><span className="mx-2">/</span><span className="text-[#202124]">Add academic year</span></div>
        <div className="mb-7"><Title level={2} className="!mb-1 !text-[28px] !font-normal">Add academic year</Title><Paragraph type="secondary" className="!mb-0">Choose the dates your institution will use for this academic year.</Paragraph></div>
        <AcademicYearForm />
      </div>
    </ApplicationShell>
  );
}
