import { Schema, model, models, type Model, type Types } from "mongoose";

const PUBLISH = ["draft", "published"] as const;
export type PublishStatus = (typeof PUBLISH)[number];
export type EmailStatus = "pending" | "sent" | "failed" | "not_configured";
const emailStatus = { type: String, enum: ["pending", "sent", "failed", "not_configured"] as EmailStatus[], default: "pending" as EmailStatus };
const slug = { type: String, required: true, unique: true, lowercase: true, trim: true, match: /^[a-z0-9]+(?:-[a-z0-9]+)*$/, maxlength: 80 };

/** Reuses compiled models across hot reloads / warm serverless invocations. */
function getModel<T>(name: string, schema: Schema): Model<T> {
  return (models[name] ?? model(name, schema)) as unknown as Model<T>;
}

/* ---------------- Admin ---------------- */
export interface AdminDoc {
  email: string;
  name: string;
  passwordHash: string;
  role: "owner" | "editor";
  lastLoginAt?: Date;
}
const AdminSchema = new Schema<AdminDoc>(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true, maxlength: 200 },
    name: { type: String, required: true, trim: true, maxlength: 120 },
    passwordHash: { type: String, required: true, select: false },
    role: { type: String, enum: ["owner", "editor"], default: "owner" },
    lastLoginAt: Date,
  },
  { timestamps: true }
);
export const Admin = getModel<AdminDoc>("Admin", AdminSchema as Schema);

/* ---------------- PageContent ---------------- */
type PageVersion = { metaTitle: string; metaDescription: string; fields: Record<string, string> };
export interface PageContentDoc {
  key: string;
  /** "draft" = the draft has unpublished changes; "published" = live matches draft. */
  status: PublishStatus;
  /** Live content shown on the website (null until first publish -> built-in defaults). */
  published: PageVersion | null;
  /** Working copy edited in admin. Field definitions live in lib/page-schemas.ts. */
  draft: PageVersion;
  publishedAt?: Date;
}
const PageContentSchema = new Schema<PageContentDoc>(
  {
    key: { type: String, required: true, unique: true, trim: true, maxlength: 60 },
    status: { type: String, enum: PUBLISH, default: "draft" },
    published: { type: Schema.Types.Mixed, default: null },
    draft: { type: Schema.Types.Mixed, default: () => ({ metaTitle: "", metaDescription: "", fields: {} }) },
    publishedAt: Date,
  },
  { timestamps: true, minimize: false }
);
export const PageContent = getModel<PageContentDoc>("PageContent", PageContentSchema as Schema);

/* ---------------- Service ---------------- */
export interface ServiceDoc {
  slug: string;
  title: string;
  tagline: string;
  summary: string;
  body: string;
  scope: string[];
  process: { title: string; description: string }[];
  icon: string;
  image: string;
  imageAlt: string;
  featured: boolean;
  order: number;
  status: PublishStatus;
  metaTitle: string;
  metaDescription: string;
}
const ServiceSchema = new Schema<ServiceDoc>(
  {
    slug,
    title: { type: String, required: true, trim: true, maxlength: 120 },
    tagline: { type: String, default: "", maxlength: 200 },
    summary: { type: String, default: "", maxlength: 600 },
    body: { type: String, default: "", maxlength: 10000 },
    scope: { type: [String], default: [] },
    process: {
      type: [{ _id: false, title: { type: String, maxlength: 120 }, description: { type: String, maxlength: 600 } }],
      default: [],
    },
    icon: { type: String, default: "file-text", maxlength: 40 },
    image: { type: String, default: "", maxlength: 500 },
    imageAlt: { type: String, default: "", maxlength: 200 },
    featured: { type: Boolean, default: false },
    order: { type: Number, default: 0 },
    status: { type: String, enum: PUBLISH, default: "draft" },
    metaTitle: { type: String, default: "", maxlength: 120 },
    metaDescription: { type: String, default: "", maxlength: 320 },
  },
  { timestamps: true }
);
ServiceSchema.index({ status: 1, order: 1 });
export const Service = getModel<ServiceDoc>("Service", ServiceSchema as Schema);

/* ---------------- TeamMember ---------------- */
export interface TeamMemberDoc {
  name: string;
  role: string;
  credentials: string;
  bio: string;
  /** Must be an approved photo of the actual person — never a stock portrait. */
  portrait: string;
  portraitAlt: string;
  order: number;
  status: PublishStatus;
}
const TeamMemberSchema = new Schema<TeamMemberDoc>(
  {
    name: { type: String, required: true, trim: true, maxlength: 120 },
    role: { type: String, default: "", maxlength: 120 },
    credentials: { type: String, default: "", maxlength: 300 },
    bio: { type: String, default: "", maxlength: 4000 },
    portrait: { type: String, default: "", maxlength: 500 },
    portraitAlt: { type: String, default: "", maxlength: 200 },
    order: { type: Number, default: 0 },
    status: { type: String, enum: PUBLISH, default: "draft" },
  },
  { timestamps: true }
);
TeamMemberSchema.index({ status: 1, order: 1 });
export const TeamMember = getModel<TeamMemberDoc>("TeamMember", TeamMemberSchema as Schema);

/* ---------------- Testimonial ---------------- */
export interface TestimonialDoc {
  clientName: string;
  context: string;
  quote: string;
  /** Written client consent to publish, recorded by the admin. Required for approval. */
  consentConfirmed: boolean;
  status: "pending" | "approved" | "hidden";
  order: number;
}
const TestimonialSchema = new Schema<TestimonialDoc>(
  {
    clientName: { type: String, required: true, trim: true, maxlength: 120 },
    context: { type: String, default: "", maxlength: 160 },
    quote: { type: String, required: true, maxlength: 2000 },
    consentConfirmed: { type: Boolean, default: false },
    status: { type: String, enum: ["pending", "approved", "hidden"], default: "pending" },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);
TestimonialSchema.index({ status: 1, order: 1 });
export const Testimonial = getModel<TestimonialDoc>("Testimonial", TestimonialSchema as Schema);

/* ---------------- PricingPlan ---------------- */
export interface PricingPlanDoc {
  name: string;
  description: string;
  /** Approved price exactly as displayed, e.g. "$250 CAD". Empty means "contact us". */
  priceLabel: string;
  priceNote: string;
  features: string[];
  serviceSlug: string;
  order: number;
  status: PublishStatus;
}
const PricingPlanSchema = new Schema<PricingPlanDoc>(
  {
    name: { type: String, required: true, trim: true, maxlength: 120 },
    description: { type: String, default: "", maxlength: 600 },
    priceLabel: { type: String, default: "", maxlength: 60 },
    priceNote: { type: String, default: "", maxlength: 200 },
    features: { type: [String], default: [] },
    serviceSlug: { type: String, default: "", maxlength: 80 },
    order: { type: Number, default: 0 },
    status: { type: String, enum: PUBLISH, default: "draft" },
  },
  { timestamps: true }
);
PricingPlanSchema.index({ status: 1, order: 1 });
export const PricingPlan = getModel<PricingPlanDoc>("PricingPlan", PricingPlanSchema as Schema);

/* ---------------- ConsultationType ---------------- */
export interface ConsultationTypeDoc {
  name: string;
  slug: string;
  description: string;
  durationMinutes: number;
  priceLabel: string;
  order: number;
  status: PublishStatus;
}
const ConsultationTypeSchema = new Schema<ConsultationTypeDoc>(
  {
    name: { type: String, required: true, trim: true, maxlength: 120 },
    slug,
    description: { type: String, default: "", maxlength: 600 },
    // Multiples of 15 so overlap locking works on 15-minute blocks.
    durationMinutes: {
      type: Number,
      required: true,
      min: 15,
      max: 240,
      validate: { validator: (v: number) => v % 15 === 0, message: "Duration must be a multiple of 15 minutes" },
    },
    priceLabel: { type: String, default: "", maxlength: 60 },
    order: { type: Number, default: 0 },
    status: { type: String, enum: PUBLISH, default: "draft" },
  },
  { timestamps: true }
);
export const ConsultationType = getModel<ConsultationTypeDoc>("ConsultationType", ConsultationTypeSchema as Schema);

/* ---------------- Availability ---------------- */
export interface AvailabilityDoc {
  key: string;
  timezone: string;
  weekly: { day: number; start: string; end: string }[];
  blackoutDates: string[];
  slotStepMinutes: number;
  minNoticeHours: number;
  maxDaysAhead: number;
  bufferMinutes: number;
  acceptingBookings: boolean;
}
const hhmm = { type: String, match: /^([01]\d|2[0-3]):[0-5]\d$/ };
const AvailabilitySchema = new Schema<AvailabilityDoc>(
  {
    key: { type: String, default: "default", unique: true },
    timezone: { type: String, default: "America/Toronto", maxlength: 60 },
    weekly: { type: [{ _id: false, day: { type: Number, min: 0, max: 6 }, start: hhmm, end: hhmm }], default: [] },
    blackoutDates: { type: [String], default: [] },
    slotStepMinutes: { type: Number, default: 30, enum: [15, 30, 45, 60] },
    minNoticeHours: { type: Number, default: 24, min: 0, max: 720 },
    maxDaysAhead: { type: Number, default: 45, min: 1, max: 365 },
    bufferMinutes: { type: Number, default: 0, min: 0, max: 120 },
    acceptingBookings: { type: Boolean, default: false },
  },
  { timestamps: true }
);
export const Availability = getModel<AvailabilityDoc>("Availability", AvailabilitySchema as Schema);

/* ---------------- Booking ---------------- */
export const BOOKING_STATUSES = ["pending", "confirmed", "completed", "cancelled", "no_show"] as const;
export type BookingStatus = (typeof BOOKING_STATUSES)[number];
/** Statuses that hold their time slot. */
export const SLOT_HOLDING_STATUSES: BookingStatus[] = ["pending", "confirmed"];

export interface BookingDoc {
  reference: string;
  consultationType: Types.ObjectId;
  consultationName: string;
  durationMinutes: number;
  startUtc: Date;
  endUtc: Date;
  firmTimezone: string;
  clientTimezone: string;
  name: string;
  email: string;
  phone: string;
  service: string;
  notes: string;
  status: BookingStatus;
  adminNotes: string;
  agreementTokenHash?: string;
  agreementTokenCreatedAt?: Date;
  agreementSignedAt?: Date;
  clientEmailStatus: EmailStatus;
  firmEmailStatus: EmailStatus;
  emailError?: string;
  createdAt?: Date;
}
const BookingSchema = new Schema<BookingDoc>(
  {
    reference: { type: String, required: true, unique: true },
    consultationType: { type: Schema.Types.ObjectId, ref: "ConsultationType", required: true },
    consultationName: { type: String, required: true },
    durationMinutes: { type: Number, required: true },
    startUtc: { type: Date, required: true, index: true },
    endUtc: { type: Date, required: true },
    firmTimezone: { type: String, required: true },
    clientTimezone: { type: String, default: "" },
    name: { type: String, required: true, trim: true, maxlength: 120 },
    email: { type: String, required: true, lowercase: true, trim: true, maxlength: 200 },
    phone: { type: String, default: "", maxlength: 40 },
    service: { type: String, default: "", maxlength: 120 },
    notes: { type: String, default: "", maxlength: 2000 },
    status: { type: String, enum: BOOKING_STATUSES, default: "pending", index: true },
    adminNotes: { type: String, default: "", maxlength: 4000 },
    agreementTokenHash: { type: String },
    agreementTokenCreatedAt: Date,
    agreementSignedAt: Date,
    clientEmailStatus: emailStatus,
    firmEmailStatus: emailStatus,
    emailError: { type: String, maxlength: 500 },
  },
  { timestamps: true }
);
BookingSchema.index({ agreementTokenHash: 1 }, { unique: true, partialFilterExpression: { agreementTokenHash: { $type: "string" } } });
export const Booking = getModel<BookingDoc>("Booking", BookingSchema as Schema);

/* ---------------- BookingLock ---------------- */
/**
 * One document per occupied 15-minute block. The unique index on blockStart
 * makes overlapping bookings impossible, even under concurrent requests.
 */
export interface BookingLockDoc {
  blockStart: Date;
  booking: Types.ObjectId;
}
const BookingLockSchema = new Schema<BookingLockDoc>(
  {
    blockStart: { type: Date, required: true, unique: true },
    booking: { type: Schema.Types.ObjectId, ref: "Booking", required: true, index: true },
  },
  { timestamps: true }
);
export const BookingLock = getModel<BookingLockDoc>("BookingLock", BookingLockSchema as Schema);

/* ---------------- Inquiry ---------------- */
export interface InquiryDoc {
  name: string;
  email: string;
  phone: string;
  service: string;
  message: string;
  status: "new" | "in_progress" | "closed";
  adminNotes: string;
  emailStatus: EmailStatus;
  emailError?: string;
  createdAt?: Date;
}
const InquirySchema = new Schema<InquiryDoc>(
  {
    name: { type: String, required: true, trim: true, maxlength: 120 },
    email: { type: String, required: true, lowercase: true, trim: true, maxlength: 200 },
    phone: { type: String, default: "", maxlength: 40 },
    service: { type: String, default: "", maxlength: 120 },
    message: { type: String, required: true, maxlength: 3000 },
    status: { type: String, enum: ["new", "in_progress", "closed"], default: "new", index: true },
    adminNotes: { type: String, default: "", maxlength: 4000 },
    emailStatus,
    emailError: { type: String, maxlength: 500 },
  },
  { timestamps: true }
);
InquirySchema.index({ createdAt: -1 });
export const Inquiry = getModel<InquiryDoc>("Inquiry", InquirySchema as Schema);

/* ---------------- AgreementTemplate ---------------- */
export interface AgreementTemplateDoc {
  version: number;
  title: string;
  body: string;
  status: "draft" | "active" | "archived";
  activatedAt?: Date;
  updatedAt?: Date;
}
const AgreementTemplateSchema = new Schema<AgreementTemplateDoc>(
  {
    version: { type: Number, required: true, unique: true, min: 1 },
    title: { type: String, required: true, trim: true, maxlength: 200 },
    body: { type: String, default: "", maxlength: 60000 },
    status: { type: String, enum: ["draft", "active", "archived"], default: "draft", index: true },
    activatedAt: Date,
  },
  { timestamps: true }
);
export const AgreementTemplate = getModel<AgreementTemplateDoc>("AgreementTemplate", AgreementTemplateSchema as Schema);

/* ---------------- SignedAgreement ---------------- */
export interface SignedAgreementDoc {
  booking: Types.ObjectId;
  bookingReference: string;
  templateId: Types.ObjectId;
  templateVersion: number;
  /** Snapshot of the exact wording signed — never re-rendered from a later template. */
  templateTitle: string;
  templateBody: string;
  clientFullName: string;
  clientEmail: string;
  clientPhone: string;
  clientAddress: string;
  signatureName: string;
  consent: boolean;
  signedAt: Date;
  ipAddress: string;
  userAgent: string;
  pdf: Buffer;
  pdfSize: number;
  pdfSha256: string;
  emailStatus: EmailStatus;
  emailAttempts: number;
  emailLastError?: string;
  emailSentAt?: Date;
}
const SignedAgreementSchema = new Schema<SignedAgreementDoc>(
  {
    booking: { type: Schema.Types.ObjectId, ref: "Booking", required: true, unique: true },
    bookingReference: { type: String, required: true },
    templateId: { type: Schema.Types.ObjectId, ref: "AgreementTemplate", required: true },
    templateVersion: { type: Number, required: true },
    templateTitle: { type: String, required: true },
    templateBody: { type: String, required: true },
    clientFullName: { type: String, required: true, maxlength: 160 },
    clientEmail: { type: String, required: true, maxlength: 200 },
    clientPhone: { type: String, default: "", maxlength: 40 },
    clientAddress: { type: String, default: "", maxlength: 400 },
    signatureName: { type: String, required: true, maxlength: 160 },
    consent: { type: Boolean, required: true },
    signedAt: { type: Date, required: true },
    ipAddress: { type: String, default: "", maxlength: 100 },
    userAgent: { type: String, default: "", maxlength: 400 },
    // Private: only served through the authenticated admin download route.
    pdf: { type: Buffer, required: true, select: false },
    pdfSize: { type: Number, required: true },
    pdfSha256: { type: String, required: true },
    emailStatus,
    emailAttempts: { type: Number, default: 0 },
    emailLastError: { type: String, maxlength: 500 },
    emailSentAt: Date,
  },
  { timestamps: true }
);
SignedAgreementSchema.index({ signedAt: -1 });
export const SignedAgreement = getModel<SignedAgreementDoc>("SignedAgreement", SignedAgreementSchema as Schema);

/* ---------------- SiteSettings ---------------- */
export interface SiteSettingsDoc {
  key: string;
  businessName: string;
  legalName: string;
  logoUrl: string;
  logoAlt: string;
  email: string;
  phone: string;
  contactPerson: string;
  virtualStatement: string;
  social: { facebook: string; instagram: string; linkedin: string; youtube: string; x: string; tiktok: string };
  seoDefaultTitle: string;
  seoDefaultDescription: string;
  ogImage: string;
}
const SiteSettingsSchema = new Schema<SiteSettingsDoc>(
  {
    key: { type: String, default: "site", unique: true },
    businessName: { type: String, default: "Trace Immigration", maxlength: 120 },
    legalName: { type: String, default: "Trace-Canada Immigration Services Inc.", maxlength: 200 },
    logoUrl: { type: String, default: "/brand/logo-transparent.png", maxlength: 500 },
    logoAlt: { type: String, default: "Trace Immigration", maxlength: 120 },
    email: { type: String, default: "myvisa@traceimmigration.com", maxlength: 200 },
    phone: { type: String, default: "+1 (647) 980-2535", maxlength: 40 },
    contactPerson: { type: String, default: "Aarmin Monga", maxlength: 120 },
    virtualStatement: { type: String, default: "Consultations are conducted 100% virtually.", maxlength: 200 },
    social: {
      facebook: { type: String, default: "" },
      instagram: { type: String, default: "" },
      linkedin: { type: String, default: "" },
      youtube: { type: String, default: "" },
      x: { type: String, default: "" },
      tiktok: { type: String, default: "" },
    },
    seoDefaultTitle: { type: String, default: "", maxlength: 120 },
    seoDefaultDescription: { type: String, default: "", maxlength: 320 },
    ogImage: { type: String, default: "", maxlength: 500 },
  },
  { timestamps: true, minimize: false }
);
export const SiteSettings = getModel<SiteSettingsDoc>("SiteSettings", SiteSettingsSchema as Schema);

/* ---------------- StoredUpload ---------------- */
export const UPLOAD_FOLDERS = ["products", "gallery", "pages", "misc"] as const;
export type UploadFolder = (typeof UPLOAD_FOLDERS)[number];
export interface StoredUploadDoc {
  folder: UploadFolder;
  filename: string;
  mimeType: string;
  size: number;
  data: Buffer;
  createdAt?: Date;
  updatedAt?: Date;
}
const StoredUploadSchema = new Schema<StoredUploadDoc>(
  {
    folder: { type: String, enum: UPLOAD_FOLDERS, required: true },
    filename: { type: String, required: true, maxlength: 100 },
    mimeType: { type: String, required: true },
    size: { type: Number, required: true, min: 1 },
    // Excluded by default; only the delivery route selects "+data".
    data: { type: Buffer, required: true, select: false },
  },
  { timestamps: true }
);
StoredUploadSchema.index({ folder: 1, filename: 1 }, { unique: true });
StoredUploadSchema.index({ createdAt: -1 });
export const StoredUpload = getModel<StoredUploadDoc>("StoredUpload", StoredUploadSchema as Schema);

/* ---------------- UploadChunk ---------------- */
/** Temporary chunk storage for uploads larger than the host's request-body limit. */
export interface UploadChunkDoc {
  uploadId: string;
  index: number;
  total: number;
  totalSize: number;
  data: Buffer;
  createdAt?: Date;
}
const UploadChunkSchema = new Schema<UploadChunkDoc>(
  {
    uploadId: { type: String, required: true, match: /^[a-f0-9]{32}$/ },
    index: { type: Number, required: true, min: 0 },
    total: { type: Number, required: true, min: 1 },
    totalSize: { type: Number, required: true, min: 1 },
    data: { type: Buffer, required: true },
  },
  { timestamps: true }
);
UploadChunkSchema.index({ uploadId: 1, index: 1 }, { unique: true });
// Abandoned chunks expire automatically after one hour (MongoDB TTL monitor).
UploadChunkSchema.index({ createdAt: 1 }, { expireAfterSeconds: 3600 });
export const UploadChunk = getModel<UploadChunkDoc>("UploadChunk", UploadChunkSchema as Schema);

/* ---------------- RateLimit ---------------- */
/** Shared, serverless-safe fixed-window rate limiter storage. */
export interface RateLimitDoc {
  key: string;
  count: number;
  expiresAt: Date;
}
const RateLimitSchema = new Schema<RateLimitDoc>({
  key: { type: String, required: true, unique: true },
  count: { type: Number, default: 0 },
  expiresAt: { type: Date, required: true },
});
RateLimitSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
export const RateLimit = getModel<RateLimitDoc>("RateLimit", RateLimitSchema as Schema);
