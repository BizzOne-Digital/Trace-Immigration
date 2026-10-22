"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, Save } from "lucide-react";
import AdminImageField, { type UploadFolder } from "./AdminImageField";

export type FieldConfig = {
  name: string;
  label: string;
  type: "text" | "textarea" | "number" | "select" | "checkbox" | "image" | "lines" | "pairs" | "email" | "url";
  options?: { value: string; label: string }[];
  help?: string;
  required?: boolean;
  rows?: number;
  folder?: UploadFolder;
  maxLength?: number;
  full?: boolean;
};

export type ActionResult = { ok: boolean; error?: string; id?: string; message?: string };

type Props = {
  fields: FieldConfig[];
  initial: Record<string, unknown>;
  action: (fd: FormData) => Promise<ActionResult>;
  submitLabel?: string;
  /** After a successful create, navigate here (":id" is replaced with the new id). */
  redirectTo?: string;
  extraButtons?: React.ReactNode;
};

function toText(field: FieldConfig, v: unknown): string {
  if (field.type === "lines") return Array.isArray(v) ? v.join("\n") : "";
  if (field.type === "pairs") {
    return Array.isArray(v) ? v.map((p: { title?: string; description?: string }) => `${p.title ?? ""} | ${p.description ?? ""}`).join("\n") : "";
  }
  return v == null ? "" : String(v);
}

export default function EntityForm({ fields, initial, action, submitLabel = "Save", redirectTo, extraButtons }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [images, setImages] = useState<Record<string, string>>(() =>
    Object.fromEntries(fields.filter((f) => f.type === "image").map((f) => [f.name, String(initial[f.name] ?? "")]))
  );
  const [error, setError] = useState("");

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    for (const [k, v] of Object.entries(images)) fd.set(k, v);
    setError("");
    startTransition(async () => {
      try {
        const res = await action(fd);
        if (!res.ok) {
          setError(res.error || "Could not save.");
          toast.error(res.error || "Could not save.");
          return;
        }
        toast.success(res.message || "Saved.");
        if (redirectTo && res.id) router.push(redirectTo.replace(":id", res.id));
        else router.refresh();
      } catch {
        setError("Something went wrong. Please try again.");
        toast.error("Something went wrong. Please try again.");
      }
    });
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6" noValidate={false}>
      {error && <p role="alert" className="border border-[#f2c6c2] bg-[#fdf3f2] px-4 py-3 text-sm text-[#8a1c12]">{error}</p>}
      <div className="grid gap-5 md:grid-cols-2">
        {fields.map((f) => {
          const id = `f-${f.name}`;
          const full = f.full || ["textarea", "lines", "pairs", "image"].includes(f.type);
          const help = f.help ? <p className="mt-1 text-xs text-muted">{f.help}</p> : null;
          const wrap = (node: React.ReactNode) => (
            <div key={f.name} className={full ? "md:col-span-2" : ""}>{node}</div>
          );
          switch (f.type) {
            case "image":
              return wrap(
                <>
                  <AdminImageField
                    label={f.label}
                    value={images[f.name] ?? ""}
                    onChange={(url) => setImages((s) => ({ ...s, [f.name]: url }))}
                    folder={f.folder ?? "pages"}
                    disabled={pending}
                  />
                  {help}
                </>
              );
            case "checkbox":
              return wrap(
                <label className="flex items-start gap-3 pt-6 text-sm">
                  <input type="checkbox" name={f.name} defaultChecked={Boolean(initial[f.name])} className="mt-0.5 h-4 w-4 accent-[#8c601d]" />
                  <span><span className="font-medium">{f.label}</span>{help}</span>
                </label>
              );
            case "select":
              return wrap(
                <>
                  <label htmlFor={id} className="field-label">{f.label}{f.required && " *"}</label>
                  <select id={id} name={f.name} defaultValue={toText(f, initial[f.name])} className="field" required={f.required}>
                    {f.options?.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                  {help}
                </>
              );
            case "textarea":
            case "lines":
            case "pairs":
              return wrap(
                <>
                  <label htmlFor={id} className="field-label">{f.label}{f.required && " *"}</label>
                  <textarea
                    id={id}
                    name={f.name}
                    rows={f.rows ?? (f.type === "textarea" ? 5 : 4)}
                    defaultValue={toText(f, initial[f.name])}
                    className="field font-[inherit]"
                    required={f.required}
                    maxLength={f.maxLength}
                  />
                  {help ?? (f.type === "lines" ? <p className="mt-1 text-xs text-muted">One item per line.</p> : f.type === "pairs" ? <p className="mt-1 text-xs text-muted">One per line: Title | Description</p> : null)}
                </>
              );
            default:
              return wrap(
                <>
                  <label htmlFor={id} className="field-label">{f.label}{f.required && " *"}</label>
                  <input
                    id={id}
                    name={f.name}
                    type={f.type === "number" ? "number" : f.type === "email" ? "email" : f.type === "url" ? "url" : "text"}
                    defaultValue={toText(f, initial[f.name])}
                    className="field"
                    required={f.required}
                    maxLength={f.maxLength}
                  />
                  {help}
                </>
              );
          }
        })}
      </div>
      <div className="flex flex-wrap items-center gap-3 border-t border-line pt-5">
        <button type="submit" disabled={pending} className="admin-btn admin-btn-primary">
          {pending ? <Loader2 aria-hidden className="h-4 w-4 animate-spin" /> : <Save aria-hidden className="h-4 w-4" />}
          {pending ? "Saving…" : submitLabel}
        </button>
        {extraButtons}
      </div>
    </form>
  );
}
