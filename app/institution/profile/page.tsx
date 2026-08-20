"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Alert, Button, Card, Input, Tag } from "antd";

import { ApplicationShell } from "@/components/application-shell";
import { InstitutionNavigation } from "@/components/institution/institution-navigation";
import { Paragraph, Title } from "@/components/ui/typography";

type Institution = { id: string; name: string; slug: string };
type ApiResponse = { institution?: Institution; error?: string };

export default function InstitutionProfilePage() {
  const [institution, setInstitution] = useState<Institution | null>(null);
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    async function loadInstitution() {
      try {
        const response = await fetch("/api/institution", { cache: "no-store" });
        const result = (await response.json()) as ApiResponse;
        if (!response.ok || !result.institution) {
          setError(result.error ?? "Unable to load institution");
          return;
        }
        setInstitution(result.institution);
        setName(result.institution.name);
      } catch {
        setError("Unable to load institution. Check your connection and try again.");
      } finally {
        setLoading(false);
      }
    }
    void loadInstitution();
  }, []);

  async function saveInstitution() {
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      const response = await fetch("/api/institution", {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ name }),
      });
      const result = (await response.json()) as ApiResponse;
      if (!response.ok || !result.institution) {
        setError(result.error ?? "Unable to update institution");
        return;
      }
      setInstitution(result.institution);
      setName(result.institution.name);
      setSuccess("Changes saved");
    } catch {
      setError("Unable to update institution. Check your connection and try again.");
    } finally {
      setSaving(false);
    }
  }

  const changed = institution ? name.trim() !== institution.name : false;

  return (
    <ApplicationShell pageTitle="Institution" pageContext="Profile" selectedKey="institution">
      <div className="mx-auto max-w-6xl">
        <div className="mb-5 text-xs text-[#5f6368]">
          <Link href="/" className="hover:text-[#1a73e8]">Dashboard</Link>
          <span className="mx-2">/</span>
          <Link href="/institution" className="hover:text-[#1a73e8]">Institution</Link>
          <span className="mx-2">/</span>
          <span className="text-[#202124]">Profile</span>
        </div>

        <div className="mb-6">
          <Title level={2} className="!mb-1 !text-[28px] !font-normal !tracking-[-0.02em]">Institution profile</Title>
          <Paragraph type="secondary" className="!mb-0">Keep your institution identity accurate and consistent across the platform.</Paragraph>
        </div>

        <InstitutionNavigation />

        {error ? <Alert type="error" showIcon message={error} className="!mt-6" /> : null}
        {success ? <Alert type="success" showIcon message={success} className="!mt-6" /> : null}

        <div className="mt-7 max-w-3xl">
          <Card loading={loading} bordered={false} className="!rounded-2xl !border !border-[#dadce0] !shadow-none">
            {institution ? (
              <div className="space-y-7">
                <div>
                  <label htmlFor="institution-name" className="mb-2 block text-sm font-medium text-[#202124]">Institution name</label>
                  <Input id="institution-name" size="large" value={name} maxLength={120} onChange={(event) => setName(event.target.value)} />
                  <p className="mt-2 text-xs text-[#5f6368]">This name is displayed throughout your institution workspace.</p>
                </div>

                <div className="border-t border-[#e8eaed] pt-6">
                  <p className="mb-2 text-sm font-medium text-[#202124]">Institution ID</p>
                  <div className="flex flex-wrap items-center gap-3">
                    <Tag className="!m-0 !rounded-full !border-[#dadce0] !bg-[#f8f9fa] !px-3 !py-1 !text-[#5f6368]">{institution.slug}</Tag>
                    <span className="text-xs text-[#5f6368]">Stable tenant identifier. It cannot be changed from this screen.</span>
                  </div>
                </div>

                <div className="flex flex-col justify-between gap-3 border-t border-[#e8eaed] pt-5 sm:flex-row sm:items-center">
                  <p className="m-0 text-xs text-[#5f6368]">Changes are saved to the current institution only.</p>
                  <Button type="primary" size="large" loading={saving} disabled={!changed || name.trim().length < 2} onClick={() => void saveInstitution()}>
                    Save changes
                  </Button>
                </div>
              </div>
            ) : null}
          </Card>
        </div>
      </div>
    </ApplicationShell>
  );
}
