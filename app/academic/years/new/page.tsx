import Link from "next/link";
import { redirect } from "next/navigation";

import { ApplicationShell } from "@/components/application-shell";
import { AcademicYearForm } from "@/components/academic/academic-year-form";
import { Paragraph, Title } from "@/components/ui/typography";
import { AuthenticationError, AuthorizationError, TenantAccessError } from "@/src/server/auth/errors";
import { requirePermission } from "@/src/server/auth/permissions";

export default async function NewAcademicYearPage() {
  try {
    await requirePermission("academic_year:create");
  } catch (error) {
    if (error instanceof AuthenticationError || error instanceof TenantAccessError) redirect("/login");
    if (error instanceof AuthorizationError) {
      return (
        <ApplicationShell pageTitle="Add academic year" pageContext="Academic setup" selectedKey="academic">
          <div className="mx-auto max-w-3xl py-10">
            <div className="rounded-2xl border border-[#dadce0] bg-white p-8 text-center">
              <Title level={3} className="!mb-2">You don&apos;t have access</Title>
              <Paragraph type="secondary">You don&apos;t have permission to add an academic year. Contact your institution administrator if you need access.</Paragraph>
              <Link href="/academic/years" className="text-[#076653]">Back to academic years</Link>
            </div>
          </div>
        </ApplicationShell>
      );
    }
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
