"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Copy, Link2, Loader2, Mail } from "lucide-react";
import type { ActionResult } from "@/components/admin/EntityForm";

export default function AgreementLinkButton({ create }: { create: (emailClient: boolean) => Promise<ActionResult & { url?: string }> }) {
  const [pending, start] = useTransition();
  const [url, setUrl] = useState("");

  const run = (email: boolean) =>
    start(async () => {
      const r = await create(email);
      if (!r.ok) return void toast.error(r.error || "Could not create the link.");
      setUrl(r.url ?? "");
      toast.success(r.message || "Link created.");
    });

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        <button type="button" className="admin-btn" disabled={pending} onClick={() => window.confirm("Create a new link? Any previous link stops working.") && run(false)}>
          {pending ? <Loader2 aria-hidden className="h-4 w-4 animate-spin" /> : <Link2 aria-hidden className="h-4 w-4" />} New agreement link
        </button>
        <button type="button" className="admin-btn" disabled={pending} onClick={() => window.confirm("Create a new link and email it to the client?") && run(true)}>
          <Mail aria-hidden className="h-4 w-4" /> Email new link to client
        </button>
      </div>
      {url && (
        <div className="flex items-center gap-2">
          <input readOnly value={url} aria-label="Agreement link" className="field !py-1.5 text-xs" onFocus={(e) => e.currentTarget.select()} />
          <button
            type="button"
            className="admin-btn"
            onClick={() => navigator.clipboard.writeText(url).then(() => toast.success("Link copied."), () => toast.error("Copy failed."))}
          >
            <Copy aria-hidden className="h-4 w-4" /> Copy
          </button>
        </div>
      )}
    </div>
  );
}
