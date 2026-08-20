import Link from "next/link";
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
    if (error instanceof AuthenticationError || error instanceof TenantAccessError) {
      redirect("/login");
    }

    throw error;
  }

  return (
    <ApplicationShell pageTitle="Institution" pageContext="Manage your institution" selectedKey="institution">
      <div className="mx-auto max-w-6xl">
        <div className="mb-5 text-xs text-[#5f6368]">
          <Link href="/" className="hover:text-[#1a73e8]">Dashboard</Link>
          <span className="mx-2">/</span>
          <span className="text-[#202124]">Institution</span>
        </div>

        <div className="mb-6">
          <Title level={2} className="!mb-1 !text-[28px] !font-normal !tracking-[-0.02em]">Institution</Title>
          <Paragraph type="secondary" className="!mb-0">Manage your institution profile and configuration from one place.</Paragraph>
        </div>

        <InstitutionNavigation />

        <div className="mt-7">
          <Card bordered={false} className="!rounded-2xl !border !border-[#dadce0] !shadow-[0_1px_2px_rgba(60,64,67,.08)]">
            <div className="flex flex-col justify-between gap-5 md:flex-row md:items-center">
              <div>
                <p className="mb-2 text-xs font-medium uppercase tracking-[0.08em] text-[#5f6368]">Current institution</p>
                <h2 className="m-0 text-2xl font-normal tracking-[-0.02em] text-[#202124]">{context.tenant.name}</h2>
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <Tag className="!rounded-full !border-[#dadce0] !bg-[#f8f9fa] !px-3 !py-1 !text-[#5f6368]">{context.tenant.slug}</Tag>
                  <span className="text-sm text-[#5f6368]">Active institution</span>
                </div>
              </div>
              <Link href="/institution/profile" className="inline-flex h-10 items-center justify-center rounded-lg bg-[#1a73e8] px-5 text-sm font-medium text-white transition hover:bg-[#185abc]">
                Edit profile
              </Link>
            </div>
          </Card>

          <div className="mt-6">
            <p className="mb-3 text-sm font-medium text-[#202124]">Management</p>
            <Row gutter={[16, 16]}>
              <Col xs={24} md={12}>
                <Link href="/institution/profile" className="block h-full">
                  <Card bordered={false} className="h-full !rounded-2xl !border !border-[#dadce0] !shadow-none transition hover:!border-[#a8c7fa] hover:!shadow-[0_2px_8px_rgba(60,64,67,.12)]">
                    <p className="mb-2 text-base font-medium text-[#202124]">Profile</p>
                    <p className="m-0 text-sm leading-6 text-[#5f6368]">Update the institution name and review its stable tenant identifier.</p>
                    <span className="mt-4 block text-sm font-medium text-[#1a73e8]">Open profile →</span>
                  </Card>
                </Link>
              </Col>
              <Col xs={24} md={12}>
                <Card bordered={false} className="h-full !rounded-2xl !border !border-dashed !border-[#dadce0] !bg-[#f8f9fa] !shadow-none">
                  <p className="mb-2 text-base font-medium text-[#3c4043]">More settings</p>
                  <p className="m-0 text-sm leading-6 text-[#5f6368]">Members, roles, academic configuration and integrations will appear here as those modules are implemented.</p>
                </Card>
              </Col>
            </Row>
          </div>
        </div>
      </div>
    </ApplicationShell>
  );
}
