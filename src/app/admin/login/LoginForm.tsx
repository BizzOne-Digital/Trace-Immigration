"use client";

import { useActionState } from "react";
import { Loader2, LogIn } from "lucide-react";
import { login, type LoginState } from "../auth-actions";

export default function LoginForm() {
  const [state, action, pending] = useActionState<LoginState, FormData>(login, {});
  return (
    <form action={action} className="space-y-5">
      {state.error && <p role="alert" className="border border-[#f2c6c2] bg-[#fdf3f2] px-3 py-2 text-sm text-[#8a1c12]">{state.error}</p>}
      <div>
        <label htmlFor="email" className="field-label">Email</label>
        <input id="email" name="email" type="email" autoComplete="username" required className="field" />
      </div>
      <div>
        <label htmlFor="password" className="field-label">Password</label>
        <input id="password" name="password" type="password" autoComplete="current-password" required className="field" />
      </div>
      <button type="submit" disabled={pending} className="admin-btn admin-btn-primary w-full justify-center !py-3">
        {pending ? <Loader2 aria-hidden className="h-4 w-4 animate-spin" /> : <LogIn aria-hidden className="h-4 w-4" />}
        {pending ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}
