import { IMAGES } from "./page-schemas";
import type { ServiceDoc, ConsultationTypeDoc } from "./models";

/** Starter service content. Describes scope only — no outcomes, fees or credentials. */
export const DEFAULT_SERVICES: ServiceDoc[] = [
  {
    slug: "spousal-partner-sponsorship",
    title: "Spousal & Partner Sponsorship",
    tagline: "Helping you build a future together.",
    summary:
      "Guidance for Canadian citizens and permanent residents sponsoring a spouse, common-law partner or conjugal partner.",
    body:
      "Sponsoring a partner is one of the most personal applications you will ever prepare. It asks you to document a relationship — and to present it clearly and credibly.\n\nWe help you understand the requirements, organize supporting evidence thoughtfully and prepare an application that tells your story accurately and completely.",
    scope: [
      "Eligibility review for the sponsor and the sponsored partner",
      "Guidance on relationship evidence and supporting documents",
      "Preparation and review of forms and submissions",
      "Inland and outland pathway considerations",
      "Communication support throughout processing",
    ],
    process: [
      { title: "Consultation", description: "A virtual conversation to understand your relationship, history and goals." },
      { title: "Assessment", description: "A careful review of eligibility and any factors that need attention." },
      { title: "Preparation", description: "Organizing evidence and preparing a complete, consistent application." },
      { title: "Submission & follow-up", description: "Submitting the application and supporting you through next steps." },
    ],
    icon: "rings",
    image: IMAGES.weddingChairs,
    imageAlt: "Two decorated chairs set side by side on a lawn for a ceremony",
    featured: true,
    order: 1,
    status: "published",
    metaTitle: "Spousal & Partner Sponsorship | Trace Immigration",
    metaDescription: "Personalized guidance for sponsoring a spouse, common-law or conjugal partner to Canada.",
  },
  {
    slug: "permanent-residence",
    title: "Permanent Residence",
    tagline: "A considered path to your next chapter.",
    summary: "Strategic guidance for skilled professionals and individuals exploring pathways to Canadian permanent residence.",
    body:
      "There are several routes to permanent residence, each with its own requirements and timing. Choosing the right one starts with an honest assessment of your profile.\n\nWe review your education, work experience, language results and goals, explain the options that may suit you, and help you prepare a complete application.",
    scope: [
      "Profile assessment across available economic pathways",
      "Guidance on documentation and supporting evidence",
      "Preparation and review of application forms",
      "Strategy for strengthening your profile where possible",
      "Support through requests and next steps",
    ],
    process: [
      { title: "Consultation", description: "Understanding your background, timeline and priorities." },
      { title: "Pathway assessment", description: "Reviewing which programs may fit your profile." },
      { title: "Preparation", description: "Assembling documents and preparing a thorough application." },
      { title: "Submission & follow-up", description: "Submitting and supporting you as your file progresses." },
    ],
    icon: "maple-leaf",
    image: IMAGES.houseKeys,
    imageAlt: "A small model house and a set of keys on a wooden table",
    featured: true,
    order: 2,
    status: "published",
    metaTitle: "Permanent Residence Guidance | Trace Immigration",
    metaDescription: "Strategic, personalized guidance on pathways to Canadian permanent residence.",
  },
  {
    slug: "canadian-citizenship",
    title: "Canadian Citizenship",
    tagline: "Guidance for an important milestone.",
    summary: "Support for permanent residents preparing to apply for Canadian citizenship.",
    body:
      "Citizenship is a meaningful milestone. A careful review of your physical presence, documents and history helps you apply with confidence.\n\nWe help you confirm eligibility, prepare your application and understand what to expect along the way.",
    scope: [
      "Eligibility and physical presence review",
      "Guidance on required documents",
      "Preparation and review of the application",
      "Guidance on next steps after submission",
    ],
    process: [
      { title: "Consultation", description: "Discussing your timeline and residence history." },
      { title: "Eligibility review", description: "Confirming requirements and identifying any concerns." },
      { title: "Preparation", description: "Preparing a complete and accurate application." },
      { title: "Submission & follow-up", description: "Submitting and guiding you through the remaining steps." },
    ],
    icon: "file-text",
    image: IMAGES.torontoPark,
    imageAlt: "Toronto skyline with the CN Tower seen from a waterfront park",
    featured: true,
    order: 3,
    status: "published",
    metaTitle: "Canadian Citizenship Guidance | Trace Immigration",
    metaDescription: "Guidance for permanent residents applying for Canadian citizenship.",
  },
  {
    slug: "family-immigration-super-visa",
    title: "Family Immigration & Super Visa",
    tagline: "Bringing family closer.",
    summary: "Assistance with family sponsorship options and Super Visa applications for parents and grandparents.",
    body:
      "Keeping family close matters. Whether you are exploring sponsorship or a Super Visa for parents or grandparents, we help you understand the requirements and prepare carefully.",
    scope: [
      "Review of family sponsorship and Super Visa options",
      "Guidance on financial and supporting documents",
      "Preparation and review of applications",
      "Support through the process",
    ],
    process: [
      { title: "Consultation", description: "Understanding your family’s situation and goals." },
      { title: "Assessment", description: "Reviewing eligibility for the options available." },
      { title: "Preparation", description: "Preparing documents and applications thoroughly." },
      { title: "Submission & follow-up", description: "Submitting and supporting you through next steps." },
    ],
    icon: "users",
    image: IMAGES.familyBeach,
    imageAlt: "A family standing together holding hands on a beach at sunset",
    featured: false,
    order: 4,
    status: "published",
    metaTitle: "Family Immigration & Super Visa | Trace Immigration",
    metaDescription: "Guidance on family sponsorship and Super Visa applications for parents and grandparents.",
  },
  {
    slug: "refusals-complex-matters",
    title: "Previous Refusals & Complex Matters",
    tagline: "A careful second look.",
    summary: "Review and strategy for previously refused applications and matters that need particular care.",
    body:
      "A refusal or a complicated history can feel discouraging. A careful review of what happened is the first step toward understanding your options.\n\nWe examine the decision and your circumstances, explain the options that may be available and help you decide how to proceed.",
    scope: [
      "Review of previous refusals and available records",
      "Assessment of options going forward",
      "Strategy for addressing concerns in a new application",
      "Preparation of submissions where appropriate",
    ],
    process: [
      { title: "Consultation", description: "Discussing what happened and what you hope to achieve." },
      { title: "Review", description: "Examining the decision, records and supporting materials." },
      { title: "Strategy", description: "Explaining realistic options and recommended next steps." },
      { title: "Preparation", description: "Preparing a considered application or submission where appropriate." },
    ],
    icon: "shield-alert",
    image: IMAGES.reviewMeeting,
    imageAlt: "Two people reviewing documents together at a desk",
    featured: false,
    order: 5,
    status: "published",
    metaTitle: "Previous Refusals & Complex Immigration Matters | Trace Immigration",
    metaDescription: "Careful review and strategy for previously refused applications and complex immigration matters.",
  },
];

/** Starter consultation type. Price is intentionally blank until approved by the firm. */
export const DEFAULT_CONSULTATION_TYPES: ConsultationTypeDoc[] = [
  {
    name: "Initial Consultation",
    slug: "initial-consultation",
    description: "A personalized virtual consultation to review your situation and discuss your options.",
    durationMinutes: 60,
    priceLabel: "",
    order: 1,
    status: "published",
  },
];
