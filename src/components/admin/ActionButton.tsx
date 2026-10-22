"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import type { ActionResult } from "./EntityForm";

/** Button that runs a server action, with optional confirmation, toast feedback and redirect. */
export default function ActionButton({
  action, children, confirm, variant = "default", redirectTo, className = "",
}: {
  action: () => Promise<ActionResult>;
  children: React.ReactNode;
  confirm?: string;
  variant?: "default" | "primary" | "danger";
  redirectTo?: string;
  className?: string;
}) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const cls = variant === "primary" ? "admin-btn-primary" : variant === "danger" ? "admin-btn-danger" : "";
  return (
    <button
      type="button"
      disabled={pending}
      className={`admin-btn ${cls} ${className}`}
      onClick={() => {
        if (confirm && !window.confirm(confirm)) return;
        start(async () => {
          try {
            const res = await action();
            if (!res.ok) {
              toast.error(res.error || "Action failed.");
              return;
            }
            toast.success(res.message || "Done.");
            if (redirectTo) router.push(redirectTo.replace(":id", res.id ?? ""));
            else router.refresh();
          } catch {
            toast.error("Something went wrong. Please try again.");
          }
        });
      }}
    >
      {pending && <Loader2 aria-hidden className="h-4 w-4 animate-spin" />}
      {children}
    </button>
  );
}
