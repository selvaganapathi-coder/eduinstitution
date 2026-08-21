import Link from "next/link";
import { redirect } from "next/navigation";

import { ApplicationShell } from "@/components/application-shell";
import { TermManagement } from "@/components/academic/term-management";
import { Paragraph, Title } from "@/components/ui/typography";
import { AuthenticationError, TenantAccessError } from "@/src/server/auth/errors";
import { requireTenantContext } from "@/src/server/auth/tenant-context";

export default async function AcademicTermsPage({ params }: { params: Promise<{ id: string }> }) {
  try { await requireTenantContext(); } catch (error) { if (error instanceof AuthenticationError || error instanceof TenantAccessError) redirect("/login"); throw error; }
  const { id } = await params;
  return (
    <ApplicationShell pageTitle="Terms" pageContext="Manage academic terms" selectedKey="academic">
      <div className="mx-auto max-w-5xl">
        <div className="mb-5 text-xs text-[#5f6368]"><Link href="/academic/years" className="hover:text-[#1a73e8]">Academic years</Link><span className="mx-2">/</span><Link href={`/academic/years/${id}`} className="hover:text-[#1a73e8]">Academic year</Link><span className="mx-2">/</span><span className="text-[#202124]">Terms</span></div>
        <div className="mb-7"><Title level={2} className="!mb-1 !text-[28px] !font-normal">Terms</Title><Paragraph type="secondary" className="!mb-0">Add and manage the terms or semesters used in this academic year.</Paragraph></div>
        <TermManagement id={id} />
      </div>
    </ApplicationShell>
  );
}
