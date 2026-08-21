import Link from "next/link";
import { BankOutlined, SettingOutlined } from "@ant-design/icons";
import { Card, Col, Row, Tag } from "antd";
import { redirect } from "next/navigation";

import { ApplicationShell } from "@/components/application-shell";
import { InstitutionNavigation } from "@/components/institution/institution-navigation";
import { Paragraph, Title } from "@/components/ui/typography";
import { AuthenticationError, TenantAccessError } from "@/src/server/auth/errors";
import { requireTenantContext } from "@/src/server/auth/tenant-context";

export default async function InstitutionPage() {
  let context;

  try {
    context = await requireTenantContext();
  } catch (error) {
    if (error instanceof AuthenticationError || error instanceof TenantAccessError) redirect("/login");
    throw error;
  }

  return (
    <ApplicationShell pageTitle="Institution" pageContext="Manage your institution details and settings" selectedKey="institution">
      <div className="mx-auto max-w-6xl space-y-5">
        <nav aria-label="Breadcrumb" className="text-sm text-[#5f6368]"><Link href="/" className="hover:text-[#1a73e8]">Home</Link><span className="mx-2">/</span><span className="text-[#202124]">Institution</span></nav>

        <div>
          <Title level={1} className="!mb-1 !text-[28px] !font-medium !tracking-[-0.02em]">Institution</Title>
          <Paragraph type="secondary" className="!mb-0 !max-w-2xl">Keep your institution information up to date. These details are used throughout the application.</Paragraph>
        </div>

        <InstitutionNavigation />

        <Card bordered={false} className="!rounded-2xl !border !border-[#dadce0] !shadow-[0_1px_2px_rgba(60,64,67,.06)]">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex min-w-0 items-start gap-4">
              <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-[#e6f4ea] text-xl text-[#188038]"><BankOutlined /></span>
              <div className="min-w-0">
                <p className="mb-1 text-xs font-medium text-[#5f6368]">Current institution</p>
                <h2 className="m-0 truncate text-xl font-medium text-[#202124]">{context.tenant.name}</h2>
                <div className="mt-2 flex flex-wrap items-center gap-2"><Tag className="!rounded-full !border-[#dadce0] !bg-[#f8f9fa] !text-[#5f6368]">Active</Tag><span className="text-xs text-[#5f6368]">Institution details are available to authorized staff.</span></div>
              </div>
            </div>
            <Link href="/institution/profile" className="inline-flex h-10 shrink-0 items-center justify-center rounded-lg bg-[#188038] px-5 text-sm font-medium text-white transition hover:bg-[#137333]">Edit details</Link>
          </div>
        </Card>

        <div>
          <h2 className="mb-3 text-base font-medium text-[#202124]">Institution settings</h2>
          <Row gutter={[16, 16]}>
            <Col xs={24} md={12}>
              <Link href="/institution/profile" className="block h-full">
                <Card bordered={false} className="h-full !rounded-2xl !border !border-[#dadce0] !shadow-none transition hover:!border-[#a8c7fa] hover:!shadow-[0_2px_8px_rgba(60,64,67,.10)]">
                  <div className="flex gap-3"><SettingOutlined className="mt-1 text-lg text-[#1a73e8]" /><div><p className="mb-1 text-base font-medium text-[#202124]">Institution profile</p><p className="m-0 text-sm leading-6 text-[#5f6368]">Update the institution name and review the details used to identify your institution.</p><span className="mt-4 block text-sm font-medium text-[#1a73e8]">Open profile →</span></div></div>
                </Card>
              </Link>
            </Col>
            <Col xs={24} md={12}>
              <Card bordered={false} className="h-full !rounded-2xl !border !border-dashed !border-[#dadce0] !bg-[#f8f9fa] !shadow-none">
                <p className="mb-1 text-base font-medium text-[#202124]">More settings are coming</p>
                <p className="m-0 text-sm leading-6 text-[#5f6368]">Members, roles, academic configuration, and integrations will be added here as each module becomes available.</p>
              </Card>
            </Col>
          </Row>
        </div>
      </div>
    </ApplicationShell>
  );
}
