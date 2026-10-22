"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, Save } from "lucide-react";
import type { ActionResult } from "@/components/admin/EntityForm";

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

type Av = {
  timezone: string;
  weekly: { day: number; start: string; end: string }[];
  blackoutDates: string[];
  slotStepMinutes: number;
  minNoticeHours: number;
  maxDaysAhead: number;
  bufferMinutes: number;
  acceptingBookings: boolean;
};

export default function AvailabilityForm({ initial, save }: { initial: Av; save: (fd: FormData) => Promise<ActionResult> }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [enabled, setEnabled] = useState<boolean[]>(DAYS.map((_, i) => initial.weekly.some((w) => w.day === i)));
  const rule = (d: number) => initial.weekly.find((w) => w.day === d);

  return (
    <form
      className="space-y-8"
      onSubmit={(e) => {
        e.preventDefault();
        const fd = new FormData(e.currentTarget);
        start(async () => {
          const r = await save(fd);
          if (r.ok) {
            toast.success(r.message || "Saved.");
            router.refresh();
          } else toast.error(r.error || "Could not save.");
        });
      }}
    >
      <label className="flex items-center gap-3 rounded-sm border border-line bg-white p-5 text-sm">
        <input type="checkbox" name="acceptingBookings" defaultChecked={initial.acceptingBookings} className="h-4 w-4 accent-[#8c601d]" />
        <span><span className="font-semibold">Accept online bookings</span><span className="block text-muted">When off, the booking page invites visitors to send an inquiry instead.</span></span>
      </label>

      <fieldset className="rounded-sm border border-line bg-white p-6">
        <legend className="px-2 text-sm font-semibold uppercase tracking-[0.14em] text-gold-ink">Weekly hours</legend>
        <div className="mb-5 max-w-sm">
          <label htmlFor="timezone" className="field-label">Firm timezone (IANA)</label>
          <input id="timezone" name="timezone" defaultValue={initial.timezone} className="field" required />
          <p className="mt-1 text-xs text-muted">Hours below are in this timezone. Bookings are stored in UTC.</p>
        </div>
        <ul className="divide-y divide-line">
          {DAYS.map((name, d) => (
            <li key={name} className="flex flex-wrap items-center gap-4 py-3">
              <label className="flex w-36 items-center gap-2 text-sm font-medium">
                <input
                  type="checkbox"
                  name={`day${d}_on`}
                  checked={enabled[d]}
                  onChange={(e) => setEnabled((s) => s.map((v, i) => (i === d ? e.target.checked : v)))}
                  className="h-4 w-4 accent-[#8c601d]"
                />
                {name}
              </label>
              <label className="flex items-center gap-2 text-sm">
                <span className="sr-only">{name} start</span>
                <input type="time" name={`day${d}_start`} defaultValue={rule(d)?.start ?? "09:00"} disabled={!enabled[d]} className="field !w-32 !py-1.5" />
              </label>
              <span className="text-muted">to</span>
              <label className="flex items-center gap-2 text-sm">
                <span className="sr-only">{name} end</span>
                <input type="time" name={`day${d}_end`} defaultValue={rule(d)?.end ?? "17:00"} disabled={!enabled[d]} className="field !w-32 !py-1.5" />
              </label>
            </li>
          ))}
        </ul>
      </fieldset>

      <fieldset className="grid gap-5 rounded-sm border border-line bg-white p-6 sm:grid-cols-2 lg:grid-cols-4">
        <legend className="px-2 text-sm font-semibold uppercase tracking-[0.14em] text-gold-ink">Rules</legend>
        <div>
          <label htmlFor="slotStepMinutes" className="field-label">Start times every</label>
          <select id="slotStepMinutes" name="slotStepMinutes" defaultValue={initial.slotStepMinutes} className="field">
            {[15, 30, 45, 60].map((m) => <option key={m} value={m}>{m} minutes</option>)}
          </select>
        </div>
        <div>
          <label htmlFor="bufferMinutes" className="field-label">Buffer after each booking</label>
          <select id="bufferMinutes" name="bufferMinutes" defaultValue={initial.bufferMinutes} className="field">
            {[0, 15, 30, 45, 60].map((m) => <option key={m} value={m}>{m} minutes</option>)}
          </select>
        </div>
        <div>
          <label htmlFor="minNoticeHours" className="field-label">Minimum notice (hours)</label>
          <input id="minNoticeHours" name="minNoticeHours" type="number" min={0} max={720} defaultValue={initial.minNoticeHours} className="field" />
        </div>
        <div>
          <label htmlFor="maxDaysAhead" className="field-label">Bookable days ahead</label>
          <input id="maxDaysAhead" name="maxDaysAhead" type="number" min={1} max={365} defaultValue={initial.maxDaysAhead} className="field" />
        </div>
        <div className="sm:col-span-2 lg:col-span-4">
          <label htmlFor="blackoutDates" className="field-label">Unavailable dates</label>
          <textarea id="blackoutDates" name="blackoutDates" rows={3} defaultValue={initial.blackoutDates.join("\n")} className="field" placeholder="2026-12-25" />
          <p className="mt-1 text-xs text-muted">One date per line, YYYY-MM-DD (holidays, time off).</p>
        </div>
      </fieldset>

      <button type="submit" disabled={pending} className="admin-btn admin-btn-primary">
        {pending ? <Loader2 aria-hidden className="h-4 w-4 animate-spin" /> : <Save aria-hidden className="h-4 w-4" />} Save availability
      </button>
    </form>
  );
}
