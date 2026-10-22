"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, Send, Save, Undo2 } from "lucide-react";
import AdminImageField from "./AdminImageField";
import type { ActionResult } from "./EntityForm";
import type { FieldDef } from "@/lib/page-schemas";

type Props = {
  fields: FieldDef[];
  initial: { metaTitle: string; metaDescription: string; fields: Record<string, string> };
  defaults: { metaTitle: string; metaDescription: string };
  save: (mode: "draft" | "publish", fd: FormData) => Promise<ActionResult>;
  discard: () => Promise<ActionResult>;
  hasDraft: boolean;
};

export default function PageEditor({ fields, initial, defaults, save, discard, hasDraft }: Props) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [images, setImages] = useState<Record<string, string>>(() =>
    Object.fromEntries(fields.filter((f) => f.type === "image").map((f) => [f.name, initial.fields[f.name] ?? f.default]))
  );

  function run(fn: () => Promise<ActionResult>) {
    start(async () => {
      try {
        const res = await fn();
        if (res.ok) {
          toast.success(res.message || "Saved.");
          router.refresh();
        } else toast.error(res.error || "Could not save.");
      } catch {
        toast.error("Something went wrong. Please try again.");
      }
    });
  }

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const submitter = (e.nativeEvent as SubmitEvent).submitter as HTMLButtonElement | null;
    const mode = submitter?.value === "publish" ? "publish" : "draft";
    const fd = new FormData(e.currentTarget);
    for (const [k, v] of Object.entries(images)) fd.set(k, v);
    run(() => save(mode, fd));
  }

  return (
    <form onSubmit={onSubmit} className="space-y-8">
      <fieldset className="space-y-5 rounded-sm border border-line bg-white p-6">
        <legend className="px-2 text-sm font-semibold uppercase tracking-[0.14em] text-gold-ink">Content</legend>
        {fields.map((f) => {
          const id = `pf-${f.name}`;
          const value = initial.fields[f.name] ?? f.default;
          if (f.type === "image") {
            return (
              <AdminImageField
                key={f.name}
                label={f.label}
                value={images[f.name] ?? ""}
                onChange={(url) => setImages((s) => ({ ...s, [f.name]: url }))}
                folder="pages"
                help="Leave empty to use the default image"
                disabled={pending}
              />
            );
          }
          return (
            <div key={f.name}>
              <label htmlFor={id} className="field-label">{f.label}</label>
              {f.type === "text" ? (
                <input id={id} name={f.name} defaultValue={value} className="field" placeholder={f.default} />
              ) : (
                <textarea id={id} name={f.name} defaultValue={value} rows={f.type === "richtext" ? 12 : 3} className="field" placeholder={f.default} />
              )}
              {f.help && <p className="mt-1 text-xs text-muted">{f.help}</p>}
            </div>
          );
        })}
      </fieldset>

      <fieldset className="space-y-5 rounded-sm border border-line bg-white p-6">
        <legend className="px-2 text-sm font-semibold uppercase tracking-[0.14em] text-gold-ink">Search engine</legend>
        <div>
          <label htmlFor="pf-metaTitle" className="field-label">SEO title</label>
          <input id="pf-metaTitle" name="metaTitle" defaultValue={initial.metaTitle} placeholder={defaults.metaTitle} maxLength={120} className="field" />
        </div>
        <div>
          <label htmlFor="pf-metaDescription" className="field-label">SEO description</label>
          <textarea id="pf-metaDescription" name="metaDescription" defaultValue={initial.metaDescription} placeholder={defaults.metaDescription} maxLength={320} rows={2} className="field" />
        </div>
      </fieldset>

      <div className="sticky bottom-0 flex flex-wrap gap-3 border-t border-line bg-[#f7f3ea] py-4">
        <button type="submit" name="mode" value="publish" disabled={pending} className="admin-btn admin-btn-primary">
          {pending ? <Loader2 aria-hidden className="h-4 w-4 animate-spin" /> : <Send aria-hidden className="h-4 w-4" />} Publish
        </button>
        <button type="submit" name="mode" value="draft" disabled={pending} className="admin-btn">
          <Save aria-hidden className="h-4 w-4" /> Save draft
        </button>
        {hasDraft && (
          <button
            type="button"
            disabled={pending}
            className="admin-btn admin-btn-danger"
            onClick={() => window.confirm("Discard unpublished changes?") && run(discard)}
          >
            <Undo2 aria-hidden className="h-4 w-4" /> Discard draft
          </button>
        )}
      </div>
    </form>
  );
}
