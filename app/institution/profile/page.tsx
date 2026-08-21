"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { App, Alert, Button, Card, Input, Tag } from "antd";

import { ApplicationShell } from "@/components/application-shell";
import { InstitutionNavigation } from "@/components/institution/institution-navigation";
import { Paragraph, Title } from "@/components/ui/typography";

type Institution = { id: string; name: string; slug: string };
type ApiResponse = { institution?: Institution; error?: string };

export default function InstitutionProfilePage() {
  const { message } = App.useApp();
  const [institution, setInstitution] = useState<Institution | null>(null);
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadInstitution() {
      try {
        const response = await fetch("/api/institution", { cache: "no-store" });
        const result = (await response.json()) as ApiResponse;
        if (!response.ok || !result.institution) {
          setError("We couldn't load your institution details. Please try again.");
          return;
        }
        setInstitution(result.institution);
        setName(result.institution.name);
      } catch {
        setError("We couldn't load your institution details. Check your connection and try again.");
      } finally {
        setLoading(false);
      }
    }
    void loadInstitution();
  }, []);

  async function saveInstitution() {
    setSaving(true);
    setError("");
    try {
      const response = await fetch("/api/institution", {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ name: name.trim() }),
      });
      const result = (await response.json()) as ApiResponse;
      if (!response.ok || !result.institution) {
        setError("We couldn't save your institution details. Please review the name and try again.");
        return;
      }
      setInstitution(result.institution);
      setName(result.institution.name);
      message.success("Your institution details were saved successfully.");
    } catch {
      setError("We couldn't save your institution details. Check your connection and try again.");
    } finally {
      setSaving(false);
    }
  }

  const changed = institution ? name.trim() !== institution.name : false;

  return (
    <ApplicationShell pageTitle="Institution profile" pageContext="Update your institution details" selectedKey="institution">
      <div className="mx-auto max-w-6xl">
        <nav aria-label="Breadcrumb" className="mb-5 text-sm text-[#5f6368]"><Link href="/" className="hover:text-[#1a73e8]">Home</Link><span className="mx-2">/</span><Link href="/institution" className="hover:text-[#1a73e8]">Institution</Link><span className="mx-2">/</span><span className="text-[#202124]">Profile</span></nav>

        <div className="mb-6"><Title level={1} className="!mb-1 !text-[28px] !font-medium !tracking-[-0.02em]">Institution profile</Title><Paragraph type="secondary" className="!mb-0 !max-w-2xl">Keep your institution information accurate and consistent across the application.</Paragraph></div>

        <InstitutionNavigation />

        {error ? <Alert type="error" showIcon message="We couldn't save your changes." description={error} className="!mt-6 feedback-error" /> : null}

        <div className="mt-6 max-w-3xl">
          <Card loading={loading} bordered={false} className="!rounded-2xl !border !border-[#dadce0] !shadow-none">
            {institution ? (
              <div className="space-y-7">
                <div>
                  <label htmlFor="institution-name" className="mb-2 block text-sm font-medium text-[#202124]">Institution name</label>
                  <Input id="institution-name" size="large" value={name} maxLength={120} onChange={(event) => setName(event.target.value)} aria-describedby="institution-name-help" />
                  <p id="institution-name-help" className="mt-2 text-xs leading-5 text-[#5f6368]">This name appears throughout your institution workspace. Use the official name your staff recognize.</p>
                </div>

                <div className="border-t border-[#e8eaed] pt-6">
                  <p className="mb-2 text-sm font-medium text-[#202124]">Institution ID</p>
                  <div className="flex flex-wrap items-center gap-3"><Tag className="!m-0 !rounded-full !border-[#dadce0] !bg-[#f8f9fa] !px-3 !py-1 !text-[#5f6368]">{institution.slug}</Tag><span className="text-xs leading-5 text-[#5f6368]">This identifier is used internally to keep your institution connected to its records. It cannot be changed here.</span></div>
                </div>

                <div className="flex flex-col justify-between gap-3 border-t border-[#e8eaed] pt-5 sm:flex-row sm:items-center">
                  <p className="m-0 text-xs leading-5 text-[#5f6368]">Changes will apply to this institution only.</p>
                  <Button type="primary" size="large" loading={saving} disabled={!changed || name.trim().length < 2} onClick={() => void saveInstitution()}>Save changes</Button>
                </div>
              </div>
            ) : null}
          </Card>
        </div>
      </div>
    </ApplicationShell>
  );
}
