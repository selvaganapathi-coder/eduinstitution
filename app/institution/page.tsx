"use client";

import { useEffect, useState } from "react";
import { Alert, Button, Card, Input, Space, Tag } from "antd";
import { ApplicationShell } from "@/components/application-shell";
import { Paragraph, Title } from "@/components/ui/typography";

type Institution = {
  id: string;
  name: string;
  slug: string;
  createdAt: string;
  updatedAt: string;
};

type ApiResponse = { institution?: Institution; error?: string };

export default function InstitutionPage() {
  const [institution, setInstitution] = useState<Institution | null>(null);
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    void loadInstitution();
  }, []);

  async function loadInstitution() {
    setLoading(true);
    setError("");
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
      setSuccess("Institution details saved.");
    } catch {
      setError("Unable to update institution. Check your connection and try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <ApplicationShell pageTitle="Institution" pageContext="Institution settings" selectedKey="institution">
      <div className="dashboard-intro">
        <Title level={2}>Institution profile</Title>
        <Paragraph type="secondary">Manage the basic identity of the institution associated with your current session.</Paragraph>
      </div>

      {error ? <Alert type="error" showIcon message={error} className="mb-5" /> : null}
      {success ? <Alert type="success" showIcon message={success} className="mb-5" /> : null}

      <Card loading={loading} title="Basic information" className="empty-panel">
        {institution ? (
          <Space direction="vertical" size={20} className="w-full">
            <div>
              <label htmlFor="institution-name" className="mb-2 block text-sm font-medium">Institution name</label>
              <Input id="institution-name" value={name} maxLength={120} onChange={(event) => setName(event.target.value)} />
            </div>
            <div>
              <p className="mb-2 text-sm font-medium">Institution slug</p>
              <Space><Tag>{institution.slug}</Tag><span className="text-sm text-gray-500">Stable tenant identifier; cannot be changed here.</span></Space>
            </div>
            <div className="flex justify-end">
              <Button type="primary" loading={saving} disabled={name.trim().length < 2 || name.trim() === institution.name} onClick={() => void saveInstitution()}>
                Save changes
              </Button>
            </div>
          </Space>
        ) : null}
      </Card>
    </ApplicationShell>
  );
}
