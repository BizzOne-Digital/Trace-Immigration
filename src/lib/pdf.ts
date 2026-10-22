import "server-only";
import { createHash } from "crypto";
import { PDFDocument, StandardFonts, rgb, type PDFFont, type PDFPage } from "pdf-lib";

export type AgreementPdfInput = {
  businessName: string;
  legalName: string;
  title: string;
  version: number;
  body: string;
  bookingReference: string;
  consultationName: string;
  clientFullName: string;
  clientEmail: string;
  clientPhone: string;
  clientAddress: string;
  signatureName: string;
  signedAt: Date;
  ipAddress: string;
};

const PAGE = { w: 612, h: 792, margin: 60 };
const INK = rgb(0.09, 0.09, 0.1);
const GOLD = rgb(0.54, 0.38, 0.13);
const MUTED = rgb(0.38, 0.36, 0.33);

/** Standard PDF fonts only support WinAnsi; replace anything else safely. */
function clean(s: string) {
  return s
    .replace(/[‘’]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/[–—]/g, "-")
    .replace(/…/g, "...")
    .replace(/\t/g, "    ")
    .replace(/[^\x0A\x20-\x7E\xA0-\xFF]/g, "?");
}

function wrap(text: string, font: PDFFont, size: number, width: number) {
  const lines: string[] = [];
  for (const para of clean(text).split("\n")) {
    if (!para.trim()) {
      lines.push("");
      continue;
    }
    let line = "";
    for (const word of para.split(/\s+/)) {
      const test = line ? `${line} ${word}` : word;
      if (font.widthOfTextAtSize(test, size) <= width) line = test;
      else {
        if (line) lines.push(line);
        line = word;
        while (font.widthOfTextAtSize(line, size) > width) {
          let cut = line.length - 1;
          while (cut > 1 && font.widthOfTextAtSize(line.slice(0, cut), size) > width) cut--;
          lines.push(line.slice(0, cut));
          line = line.slice(cut);
        }
      }
    }
    lines.push(line);
  }
  return lines;
}

export async function generateAgreementPdf(input: AgreementPdfInput) {
  const doc = await PDFDocument.create();
  doc.setTitle(clean(`${input.title} - ${input.bookingReference}`));
  doc.setAuthor(clean(input.legalName));
  doc.setCreationDate(input.signedAt);

  const serif = await doc.embedFont(StandardFonts.TimesRoman);
  const serifBold = await doc.embedFont(StandardFonts.TimesRomanBold);
  const script = await doc.embedFont(StandardFonts.TimesRomanItalic);
  const sans = await doc.embedFont(StandardFonts.Helvetica);
  const sansBold = await doc.embedFont(StandardFonts.HelveticaBold);
  const width = PAGE.w - PAGE.margin * 2;

  let page: PDFPage = doc.addPage([PAGE.w, PAGE.h]);
  let y = PAGE.h - PAGE.margin;
  const ensure = (h: number) => {
    if (y - h < PAGE.margin + 20) {
      page = doc.addPage([PAGE.w, PAGE.h]);
      y = PAGE.h - PAGE.margin;
    }
  };
  const text = (t: string, font: PDFFont, size: number, color = INK, gap = 4) => {
    for (const line of wrap(t, font, size, width)) {
      ensure(size + gap);
      page.drawText(line, { x: PAGE.margin, y: y - size, size, font, color });
      y -= size + gap;
    }
  };
  const rule = () => {
    ensure(16);
    y -= 6;
    page.drawLine({ start: { x: PAGE.margin, y }, end: { x: PAGE.w - PAGE.margin, y }, thickness: 0.6, color: GOLD });
    y -= 12;
  };

  text(input.businessName.toUpperCase(), sansBold, 9, GOLD, 2);
  text(input.legalName, sans, 9, MUTED, 10);
  text(input.title, serifBold, 20, INK, 8);
  text(`Agreement version ${input.version}  |  Booking reference ${input.bookingReference}  |  ${input.consultationName}`, sans, 8.5, MUTED, 6);
  rule();
  text(input.body, serif, 11, INK, 4.5);
  rule();

  text("CLIENT DETAILS", sansBold, 9, GOLD, 6);
  const rows: [string, string][] = [
    ["Full name", input.clientFullName],
    ["Email", input.clientEmail],
    ["Phone", input.clientPhone || "-"],
    ["Address", input.clientAddress || "-"],
  ];
  for (const [k, v] of rows) text(`${k}: ${v}`, sans, 10, INK, 4);
  y -= 8;

  text("ELECTRONIC SIGNATURE", sansBold, 9, GOLD, 8);
  ensure(40);
  page.drawText(clean(input.signatureName), { x: PAGE.margin, y: y - 24, size: 24, font: script, color: INK });
  y -= 32;
  page.drawLine({ start: { x: PAGE.margin, y }, end: { x: PAGE.margin + 260, y }, thickness: 0.5, color: MUTED });
  y -= 14;
  text(
    `Signed electronically by ${input.signatureName} on ${input.signedAt.toISOString().replace("T", " ").slice(0, 19)} UTC. ` +
      "The signer confirmed they read the agreement above and consented to sign electronically.",
    sans, 9, MUTED, 4
  );
  const bodyHash = createHash("sha256").update(input.body).digest("hex");
  text(`Signer IP: ${input.ipAddress || "unknown"}  |  Agreement text SHA-256: ${bodyHash}`, sans, 7.5, MUTED, 3);

  const pages = doc.getPages();
  pages.forEach((p, i) => {
    p.drawText(clean(`${input.bookingReference}  -  Page ${i + 1} of ${pages.length}`), {
      x: PAGE.margin, y: 30, size: 8, font: sans, color: MUTED,
    });
  });

  const bytes = await doc.save();
  const buffer = Buffer.from(bytes);
  return { buffer, sha256: createHash("sha256").update(buffer).digest("hex") };
}
