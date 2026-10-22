import type { FieldConfig } from "@/components/admin/EntityForm";
import { SERVICE_ICONS } from "./site";

const PUBLISH_OPTIONS = [
  { value: "draft", label: "Draft (hidden)" },
  { value: "published", label: "Published" },
];

export const SERVICE_FIELDS: FieldConfig[] = [
  { name: "title", label: "Title", type: "text", required: true, maxLength: 120 },
  { name: "slug", label: "URL slug", type: "text", help: "Lowercase words separated by hyphens. Leave blank to generate from the title.", maxLength: 80 },
  { name: "tagline", label: "Card tagline", type: "text", maxLength: 200 },
  { name: "icon", label: "Icon", type: "select", options: SERVICE_ICONS.map((i) => ({ value: i, label: i })) },
  { name: "summary", label: "Summary", type: "textarea", rows: 3, maxLength: 600 },
  { name: "body", label: "Overview", type: "textarea", rows: 8, help: "Blank line between paragraphs. \"## \" for headings, \"- \" for bullets." },
  { name: "scope", label: "How we can help (scope)", type: "lines", rows: 5 },
  { name: "process", label: "Process steps", type: "pairs", rows: 5 },
  { name: "image", label: "Image", type: "image", folder: "pages" },
  { name: "imageAlt", label: "Image alt text", type: "text", maxLength: 200, help: "Describe what the image shows." },
  { name: "order", label: "Display order", type: "number" },
  { name: "status", label: "Status", type: "select", options: PUBLISH_OPTIONS },
  { name: "featured", label: "Feature on the homepage (first three featured are shown)", type: "checkbox" },
  { name: "metaTitle", label: "SEO title", type: "text", maxLength: 120 },
  { name: "metaDescription", label: "SEO description", type: "textarea", rows: 2, maxLength: 320 },
];

export const TEAM_FIELDS: FieldConfig[] = [
  { name: "name", label: "Name", type: "text", required: true, maxLength: 120 },
  { name: "role", label: "Role / title", type: "text", maxLength: 120 },
  { name: "credentials", label: "Credentials", type: "text", maxLength: 300, help: "Publish only verified credentials and registration details." },
  { name: "bio", label: "Biography", type: "textarea", rows: 6, maxLength: 4000 },
  { name: "portrait", label: "Portrait", type: "image", folder: "gallery", help: "Approved photo of this person only — never a stock image." },
  { name: "portraitAlt", label: "Portrait alt text", type: "text", maxLength: 200 },
  { name: "order", label: "Display order", type: "number" },
  { name: "status", label: "Status", type: "select", options: PUBLISH_OPTIONS, help: "Publish only after the person has approved their profile." },
];

export const TESTIMONIAL_FIELDS: FieldConfig[] = [
  { name: "clientName", label: "Client name (as approved for display)", type: "text", required: true, maxLength: 120, help: "e.g. full name, first name and initial, or initials — as the client approved." },
  { name: "context", label: "Context", type: "text", maxLength: 160, help: "Optional, e.g. \"Spousal sponsorship client\"." },
  { name: "quote", label: "Testimonial", type: "textarea", rows: 6, required: true, maxLength: 2000, help: "Use the client's exact approved wording." },
  { name: "order", label: "Display order", type: "number" },
  {
    name: "status", label: "Status", type: "select",
    options: [{ value: "pending", label: "Pending review" }, { value: "approved", label: "Approved (published)" }, { value: "hidden", label: "Hidden" }],
  },
  { name: "consentConfirmed", label: "Written client consent to publish has been received and filed", type: "checkbox" },
];

export const PRICING_FIELDS: FieldConfig[] = [
  { name: "name", label: "Service / fee name", type: "text", required: true, maxLength: 120 },
  { name: "priceLabel", label: "Approved price", type: "text", maxLength: 60, help: "Exactly as displayed, e.g. \"$250 CAD\". Leave blank to show \"Contact us for consultation details.\"" },
  { name: "priceNote", label: "Price note", type: "text", maxLength: 200, help: "e.g. \"Plus applicable taxes\"." },
  { name: "serviceSlug", label: "Linked service slug", type: "text", maxLength: 80 },
  { name: "description", label: "Description", type: "textarea", rows: 3, maxLength: 600 },
  { name: "features", label: "Included items", type: "lines", rows: 5 },
  { name: "order", label: "Display order", type: "number" },
  { name: "status", label: "Status", type: "select", options: PUBLISH_OPTIONS },
];

export const CONSULTATION_TYPE_FIELDS: FieldConfig[] = [
  { name: "name", label: "Name", type: "text", required: true, maxLength: 120 },
  { name: "slug", label: "Slug", type: "text", maxLength: 80, help: "Leave blank to generate from the name." },
  {
    name: "durationMinutes", label: "Duration", type: "select",
    options: [15, 30, 45, 60, 75, 90, 120].map((m) => ({ value: String(m), label: `${m} minutes` })),
  },
  { name: "priceLabel", label: "Approved price", type: "text", maxLength: 60, help: "Leave blank to show \"Contact us for consultation details.\" No payment is collected online." },
  { name: "description", label: "Description", type: "textarea", rows: 3, maxLength: 600 },
  { name: "order", label: "Display order", type: "number" },
  { name: "status", label: "Status", type: "select", options: PUBLISH_OPTIONS },
];
