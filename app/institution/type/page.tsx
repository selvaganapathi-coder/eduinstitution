"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ApartmentOutlined, CheckCircleOutlined, InfoCircleOutlined, LoadingOutlined, SaveOutlined } from "@ant-design/icons";
import { Alert, Button, Card, Empty, Skeleton, Tag } from "antd";

import { ApplicationShell } from "@/components/application-shell";
import { InstitutionNavigation } from "@/components/institution/institution-navigation";

type InstitutionType = { id: string; code: string; name: string; description: string | null; capabilities: Array<{ enabled: boolean; capability: { id: string; name: string } }> };

export default function InstitutionTypePage() {
  const [types, setTypes] = useState<InstitutionType[]>([]);
  const [current, setCurrent] = useState<InstitutionType | null>(null);
  const [selectedId, setSelectedId] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ kind: "success" | "error" | "info"; text: string } | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const [typesResponse, currentResponse] = await Promise.all([fetch("/api/platform/institution-types", { cache: "no-store" }), fetch("/api/institution/type", { cache: "no-store" })]);
        const typesData = await typesResponse.json();
        const currentData = await currentResponse.json();
        if (!typesResponse.ok) throw new Error(typesData.error ?? "Unable to load institution types.");
        if (!currentResponse.ok) throw new Error(currentData.error ?? "Unable to load the current institution type.");
        if (cancelled) return;
        setTypes(typesData.institutionTypes);
        setCurrent(currentData.institutionType);
        setSelectedId(currentData.institutionType?.id ?? "");
      } catch (error) {
        if (!cancelled) setMessage({ kind: "error", text: error instanceof Error ? error.message : "We couldn't load the institution type. Please try again." });
      } finally { if (!cancelled) setLoading(false); }
    }
    void load();
    return () => { cancelled = true; };
  }, []);

  async function save() {
    if (!selectedId || selectedId === current?.id) return;
    const selected = types.find((item) => item.id === selectedId);
    if (!selected) return;
    if (!window.confirm("Changing the institution type may change which features are available. Existing records will not be deleted. Continue?")) return;
    setSaving(true); setMessage(null);
    try {
      const response = await fetch("/api/institution/type", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ institutionTypeId: selectedId }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "We couldn't update the institution type. Please try again.");
      setCurrent(data.institutionType);
      setMessage({ kind: "success", text: "Institution type updated successfully." });
    } catch (error) { setMessage({ kind: "error", text: error instanceof Error ? error.message : "We couldn't update the institution type. Please try again." }); }
    finally { setSaving(false); }
  }

  const selected = types.find((item) => item.id === selectedId);
  const enabledCapabilities = selected?.capabilities.filter((item) => item.enabled) ?? [];

  return (
    <ApplicationShell pageTitle="Institution type" pageContext="Choose the category that best describes your institution" selectedKey="institution">
      <div className="institution-type-page">
        <div className="institution-breadcrumb"><Link href="/">Home</Link><span>/</span><Link href="/institution">Institution</Link><span>/</span><strong>Institution type</strong></div>
        <section className="institution-type-hero"><span className="institution-type-hero-icon"><ApartmentOutlined /></span><div><span className="institution-overline">INSTITUTION SETUP</span><h1>Choose your institution type</h1><p>Select the category that best describes your institution. This helps EduInstitution prepare the right features for your workspace.</p></div></section>
        <InstitutionNavigation />

        {message ? <Alert className={`institution-inline-alert ${message.kind === "success" ? "feedback-success" : message.kind === "error" ? "feedback-error" : "feedback-info"}`} type={message.kind === "error" ? "error" : message.kind === "success" ? "success" : "info"} message={message.text} showIcon closable onClose={() => setMessage(null)} /> : null}

        <Card className="institution-type-card" styles={{ body: { padding: 24 } }}>
          {loading ? <div className="institution-type-loading"><Skeleton active paragraph={{ rows: 6 }} /><span><LoadingOutlined /> Loading your institution setup...</span></div> : types.length === 0 ? <div className="institution-type-empty"><Empty description="No institution types are available right now." /><p>Please try again later.</p></div> : <>
            <div className="institution-type-card-heading"><div><h2>Institution category</h2><p>Choose one option from the list below.</p></div><Tag className="institution-current-tag"><CheckCircleOutlined /> {current?.name ?? "Not selected"}</Tag></div>
            <label htmlFor="institution-type" className="institution-field-label">Institution type</label>
            <select id="institution-type" value={selectedId} onChange={(event) => setSelectedId(event.target.value)} className="institution-type-select">
              <option value="">Select an institution type</option>
              {types.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
            </select>
            <div className="institution-example-hint"><InfoCircleOutlined /><span><strong>Example:</strong> A university can select “University” so relevant academic features can be prepared for its workspace.</span></div>
            {selected ? <div className="institution-selected-preview"><span className="institution-selected-icon"><ApartmentOutlined /></span><div><span>SELECTED TYPE</span><h3>{selected.name}</h3><p>{selected.description ?? "This institution type helps determine which features are available to your workspace."}</p>{enabledCapabilities.length > 0 ? <div className="institution-capabilities"><strong>Available features</strong><div>{enabledCapabilities.slice(0, 6).map((item) => <Tag key={item.capability.id}>{item.capability.name}</Tag>)}</div></div> : null}</div></div> : null}
            <div className="institution-change-note"><InfoCircleOutlined /><div><strong>What changes when you switch?</strong><p>The selected type controls which platform features are available. Existing records are not deleted when you change this setting.</p></div></div>
            <div className="institution-save-bar"><span>{selectedId && selectedId !== current?.id ? "You have unsaved changes" : "Your institution type is up to date"}</span><Button type="primary" icon={<SaveOutlined />} onClick={() => void save()} loading={saving} disabled={!selectedId || selectedId === current?.id}>Save changes</Button></div>
          </>}
        </Card>
      </div>
    </ApplicationShell>
  );
}
