import Link from "next/link";
import { redirect } from "next/navigation";

import { ApplicationShell } from "@/components/application-shell";
import { AcademicYearEditForm } from "@/components/academic/academic-year-edit-form";
import { Paragraph, Title } from "@/components/ui/typography";
import { AuthenticationError, TenantAccessError } from "@/src/server/auth/errors";
import { requireTenantContext } from "@/src/server/auth/tenant-context";

export default async function EditAcademicYearPage({ params }: { params: Promise<{ id: string }> }) {
  try { await requireTenantContext(); } catch (error) { if (error instanceof AuthenticationError || error instanceof TenantAccessError) redirect("/login"); throw error; }
  const { id } = await params;
  return (
    <ApplicationShell pageTitle="Edit academic year" pageContext="Update academic year details" selectedKey="academic">
      <div className="mx-auto max-w-3xl">
        <div className="mb-5 text-xs text-[#5f6368]"><Link href={`/academic/years/${id}`} className="hover:text-[#1a73e8]">Academic year</Link><span className="mx-2">/</span><span className="text-[#202124]">Edit</span></div>
        <div className="mb-7"><Title level={2} className="!mb-1 !text-[28px] !font-normal">Edit academic year</Title><Paragraph type="secondary" className="!mb-0">Update the name or dates for this academic year.</Paragraph></div>
        <AcademicYearEditForm id={id} />
      </div>
    </ApplicationShell>
  );
}
