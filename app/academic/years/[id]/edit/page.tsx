import Link from "next/link";
import { redirect } from "next/navigation";
import { EditOutlined } from "@ant-design/icons";
import { ApplicationShell } from "@/components/application-shell";
import { AcademicYearEditForm } from "@/components/academic/academic-year-edit-form";
import { AuthenticationError, TenantAccessError } from "@/src/server/auth/errors";
import { requireTenantContext } from "@/src/server/auth/tenant-context";

export default async function EditAcademicYearPage({ params }: { params: Promise<{ id: string }> }) {
  try { await requireTenantContext(); } catch (error) { if (error instanceof AuthenticationError || error instanceof TenantAccessError) redirect("/login"); throw error; }
  const { id } = await params;
  return <ApplicationShell pageTitle="Edit academic year" pageContext="Update the academic period" selectedKey="academic"><div className="management-page management-form-page"><div className="management-breadcrumb"><Link href="/">Home</Link><span>/</span><Link href="/academic/years">Academic years</Link><span>/</span><Link href={`/academic/years/${id}`}>Details</Link><span>/</span><strong>Edit</strong></div><section className="management-page-hero"><div className="management-page-hero-copy"><div className="management-hero-icon management-hero-icon-blue"><EditOutlined /></div><div><h1>Edit academic year</h1><p>Update the name or dates while keeping the existing academic record.</p></div></div></section><AcademicYearEditForm id={id} /></div></ApplicationShell>;
}
