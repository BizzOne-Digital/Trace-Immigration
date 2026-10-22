import "server-only";
import nodemailer, { type Transporter } from "nodemailer";
import type { EmailStatus } from "./models";

export function isEmailConfigured() {
  return Boolean(process.env.SMTP_HOST && process.env.EMAIL_FROM && process.env.FIRM_INBOX_EMAIL);
}

export function firmInbox() {
  return process.env.FIRM_INBOX_EMAIL || "";
}

let transporter: Transporter | null = null;
function getTransport() {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT || 587),
      secure: process.env.SMTP_SECURE === "true",
      auth: process.env.SMTP_USER ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASSWORD } : undefined,
    });
  }
  return transporter;
}

export type MailInput = {
  to: string;
  subject: string;
  text: string;
  html?: string;
  replyTo?: string;
  attachments?: { filename: string; content: Buffer; contentType: string }[];
};

/** Sends an email and reports a status suitable for storing on the record. Never throws. */
export async function sendMail(input: MailInput): Promise<{ status: EmailStatus; error?: string }> {
  if (!isEmailConfigured()) return { status: "not_configured", error: "SMTP is not configured" };
  try {
    await getTransport().sendMail({ from: process.env.EMAIL_FROM, ...input });
    return { status: "sent" };
  } catch (err) {
    const message = (err as Error).message || "Email delivery failed";
    console.error("Email delivery failed:", message);
    return { status: "failed", error: message.slice(0, 480) };
  }
}

export function escapeHtml(s: string) {
  return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);
}

/** Minimal branded HTML wrapper for transactional emails. */
export function emailLayout(title: string, rows: [string, string][], intro = "") {
  const body = rows
    .map(([k, v]) => `<tr><td style="padding:6px 12px 6px 0;color:#6b6457;vertical-align:top;white-space:nowrap">${escapeHtml(k)}</td><td style="padding:6px 0;color:#171719">${escapeHtml(v).replace(/\n/g, "<br>")}</td></tr>`)
    .join("");
  return `<div style="font-family:Arial,Helvetica,sans-serif;background:#FBF8F1;padding:24px"><div style="max-width:560px;margin:0 auto;background:#fff;border:1px solid #e8dcc3;padding:28px">
<p style="letter-spacing:3px;font-size:11px;color:#8a6220;margin:0 0 8px">TRACE IMMIGRATION</p>
<h1 style="font-family:Georgia,serif;font-weight:normal;color:#171719;font-size:24px;margin:0 0 16px">${escapeHtml(title)}</h1>
${intro ? `<p style="color:#3d3a35;line-height:1.6">${escapeHtml(intro)}</p>` : ""}
<table style="border-collapse:collapse;font-size:14px;line-height:1.5">${body}</table></div></div>`;
}
