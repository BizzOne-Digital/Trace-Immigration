import EntityForm, { type FieldConfig } from "@/components/admin/EntityForm";
import { AdminHeader, Panel } from "@/components/admin/ui";
import { requireAdminPage } from "@/lib/auth";
import { getSettings } from "@/lib/content";
import { isEmailConfigured } from "@/lib/email";
import { saveSettings } from "../content-actions";

const FIELDS: FieldConfig[] = [
  { name: "businessName", label: "Business name (operating as)", type: "text", required: true },
  { name: "legalName", label: "Legal name", type: "text", required: true },
  { name: "email", label: "Public email", type: "email", required: true },
  { name: "phone", label: "Public phone", type: "text", required: true },
  { name: "contactPerson", label: "Contact person", type: "text" },
  { name: "virtualStatement", label: "Virtual consultation statement", type: "text" },
  { name: "logoUrl", label: "Logo", type: "image", folder: "misc", help: "Upload the original logo file. Removing it restores the built-in logo." },
  { name: "logoAlt", label: "Logo alt text", type: "text" },
  { name: "social_facebook", label: "Facebook URL", type: "url", help: "Social links appear only when a full https:// URL is set." },
  { name: "social_instagram", label: "Instagram URL", type: "url" },
  { name: "social_linkedin", label: "LinkedIn URL", type: "url" },
  { name: "social_youtube", label: "YouTube URL", type: "url" },
  { name: "social_x", label: "X URL", type: "url" },
  { name: "social_tiktok", label: "TikTok URL", type: "url" },
  { name: "seoDefaultTitle", label: "Default SEO title", type: "text" },
  { name: "seoDefaultDescription", label: "Default SEO description", type: "textarea", rows: 2 },
  { name: "ogImage", label: "Social sharing image", type: "image", folder: "misc" },
];

export default async function SettingsAdmin() {
  await requireAdminPage();
  const s = await getSettings();
  const initial: Record<string, unknown> = { ...s, logoUrl: s.logoUrl === "/brand/logo-transparent.png" ? "" : s.logoUrl };
  for (const [k, v] of Object.entries(s.social)) initial[`social_${k}`] = v;
  const email = isEmailConfigured();

  return (
    <>
      <AdminHeader title="Site settings" description="Logo, contact details, social links and default SEO." />
      <Panel title="Integrations" className="mb-6">
        <dl className="grid gap-3 text-sm sm:grid-cols-2">
          <div><dt className="text-muted">Email notifications (SMTP)</dt><dd className={email ? "text-[#1f6b35]" : "text-[#9b1c1c]"}>{email ? "Configured" : "Not configured — set SMTP_* variables"}</dd></div>
          <div><dt className="text-muted">Firm inbox</dt><dd>{process.env.FIRM_INBOX_EMAIL || "Not set (FIRM_INBOX_EMAIL)"}</dd></div>
          <div><dt className="text-muted">Payments</dt><dd>Not configured — no payment is collected online</dd></div>
          <div><dt className="text-muted">Site URL</dt><dd>{process.env.NEXT_PUBLIC_SITE_URL || "Not set (NEXT_PUBLIC_SITE_URL)"}</dd></div>
        </dl>
      </Panel>
      <Panel>
        <EntityForm fields={FIELDS} initial={initial} action={saveSettings} submitLabel="Save settings" />
      </Panel>
    </>
  );
}
