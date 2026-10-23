/**
 * Editable page definitions. Each field has a built-in default so the site renders
 * correctly before anything is published. Admin edits override these per field.
 */
export type FieldType = "text" | "textarea" | "image" | "richtext";
export type FieldDef = { name: string; label: string; type: FieldType; default: string; help?: string };
export type PageDef = { key: string; label: string; path: string; metaTitle: string; metaDescription: string; fields: FieldDef[] };

import { IMAGES } from "./image-assets";
export { IMAGES } from "./image-assets";

const t = (name: string, label: string, def: string, help?: string): FieldDef => ({ name, label, type: "text", default: def, help });
const ta = (name: string, label: string, def: string, help?: string): FieldDef => ({ name, label, type: "textarea", default: def, help });
const rt = (name: string, label: string, def: string): FieldDef => ({
  name, label, type: "richtext", default: def,
  help: "Separate paragraphs with a blank line. Start a line with \"## \" for a heading or \"- \" for a bullet.",
});
const img = (name: string, label: string, def: string): FieldDef => ({ name, label, type: "image", default: def });

const hero = (eyebrow: string, title: string, intro: string) => [
  t("heroEyebrow", "Eyebrow", eyebrow),
  t("heroTitle", "Heading", title),
  ta("heroIntro", "Introduction", intro),
];

export const PAGE_DEFS: PageDef[] = [
  {
    key: "home",
    label: "Home",
    path: "/",
    metaTitle: "Trace Immigration | Personalized Canadian Immigration Guidance",
    metaDescription:
      "Personalized Canadian immigration guidance for spousal sponsorship, permanent residence, citizenship and complex matters. 100% virtual consultations.",
    fields: [
      t("heroEyebrow", "Hero eyebrow", "Personalized Canadian Immigration Guidance"),
      t("heroTitleAccent", "Headline (gold part)", "Your Future"),
      t("heroTitleRest", "Headline (remaining)", "Is Too Important to Leave to Chance."),
      ta("heroSubtitle", "Hero subtitle", "Personalized Canadian immigration guidance for life’s most important transitions."),
      t("heroPrompt", "Hero supporting line", "Ready to Immigrate?"),
      t("heroCta", "Hero button label", "Book a Consultation"),
      img("heroImage", "Hero image", IMAGES.torontoSunrise),
      t("heroImageAlt", "Hero image alt text", "Toronto skyline and CN Tower across the waterfront at sunrise"),
      t("trust1", "Trust strip item 1", "Personalized Guidance"),
      t("trust2", "Trust strip item 2", "100% Virtual Consultations"),
      t("trust3", "Trust strip item 3", "Serving Canada & Beyond"),
      t("servicesEyebrow", "Services eyebrow", "Our Expertise"),
      t("servicesHeading", "Services heading", "Thoughtful guidance. Meaningful futures."),
      t("complexText", "Complex cases line", "Complex cases or a previous refusal? Let’s discuss your options."),
      t("aboutHeading", "About heading", "More than paperwork. Your life, your future."),
      ta("aboutBody", "About text", "We bring careful assessment, personalized attention and thoughtful preparation to every immigration journey."),
      t("aboutLink", "About link label", "Discover Trace Immigration"),
      img("aboutImage", "About image", IMAGES.consultationDesk),
      t("aboutImageAlt", "About image alt text", "Documents and a laptop on a desk during a planning session"),
      t("whoEyebrow", "Who we help — eyebrow", "Who We Help"),
      t("whoHeading", "Who we help — heading", "Guidance for every stage of your journey."),
      ta(
        "whoItems",
        "Who we help — cards (one per line: Title | Description)",
        "Families reuniting | Canadian citizens and permanent residents sponsoring a spouse, partner, parent or grandparent.\nSkilled professionals | Individuals exploring pathways to permanent residence based on their education, work experience and goals.\nNew Canadians | Permanent residents preparing for the important milestone of Canadian citizenship.\nComplex situations | Applicants with a previous refusal or a history that needs careful review before applying again."
      ),
      t("processEyebrow", "Process — eyebrow", "How It Works"),
      t("processHeading", "Process — heading", "A clear path, step by step."),
      ta(
        "processSteps",
        "Process — steps (one per line: Title | Description)",
        "Book a consultation | Choose a time that suits you. Every consultation is conducted virtually.\nCareful assessment | We review your situation, goals and history to understand the options that may be available.\nThoughtful preparation | We help you organize documents and prepare a complete, consistent application.\nSupport to the finish | We stay with you through submission and the next steps that follow."
      ),
      t("whyEyebrow", "Why us — eyebrow", "Why Trace Immigration"),
      t("whyHeading", "Why us — heading", "Personal attention, from first conversation to final step."),
      ta(
        "whyItems",
        "Why us — points (one per line: Title | Description)",
        "Personalized attention | Your matter is handled with individual care — never as just another file.\nTransparency | Clear explanations of your options, requirements and fees before any work begins.\nProfessional integrity | Honest advice, even when the answer is not the one you hoped for.\nVirtual convenience | Consultations from anywhere, scheduled across time zones — no office visit needed."
      ),
      img("whyImage", "Why us — image", IMAGES.virtualMeeting),
      t("whyImageAlt", "Why us — image alt text", "A virtual consultation in progress on a laptop"),
      t("faqHeading", "FAQ — heading", "Frequently asked questions"),
      ta(
        "faqItems",
        "FAQ — questions (one per line: Question | Answer)",
        "Are consultations really 100% virtual? | Yes. All consultations are conducted online, so you can meet with us from home — whether you are in Canada or abroad.\nCan you guarantee my application will be approved? | No one can honestly guarantee an immigration outcome, because decisions are made by the government. What we offer is careful assessment and thorough preparation.\nMy application was refused before. Can you still help? | Often, yes. A previous refusal is not necessarily the end. We review what happened and explain the options that may be available to you.\nHow much do your services cost? | Fees depend on your matter and are confirmed in writing before any work begins. Contact us for consultation details.\nWhat should I prepare before my consultation? | Have your key documents and any previous application or refusal letters on hand. We will let you know if anything else is needed."
      ),
      t("ctaEyebrow", "Booking panel eyebrow", "Your Next Chapter Starts Here"),
      t("ctaHeading", "Booking panel heading", "Let’s plan your future, together."),
      t("ctaText", "Booking panel text", "Book a personalized virtual consultation."),
      t("ctaButton", "Booking panel button", "Book a Consultation"),
    ],
  },
  {
    key: "about",
    label: "About Us",
    path: "/about",
    metaTitle: "About Trace Immigration | Our Approach",
    metaDescription:
      "Trace Immigration offers personalized, strategic Canadian immigration guidance with careful assessment, transparency and fully virtual consultations.",
    fields: [
      ...hero(
        "About Trace Immigration",
        "Considered guidance for life’s most important transitions.",
        "Trace Immigration is a Canadian immigration consulting firm offering personalized, professional and strategic guidance to individuals, families and skilled professionals."
      ),
      img("heroImage", "Hero image", IMAGES.moraineLake),
      t("heroImageAlt", "Hero image alt text", "Mountain lake surrounded by evergreen forest in the Canadian Rockies"),
      t("storyHeading", "Approach heading", "Quality over volume."),
      rt(
        "storyBody",
        "Approach text",
        "Every immigration matter is personal. Behind each application is a relationship, a career or a family’s next chapter — and it deserves more than a checklist.\n\nWe deliberately work with a focused number of clients so that each matter receives careful assessment, clear communication and thorough preparation. Before recommending a path, we take the time to understand your circumstances, your goals and any history that may affect your application."
      ),
      t("valuesHeading", "Values heading", "What guides our work"),
      ta(
        "values",
        "Values (one per line: Title | Description)",
        "Careful assessment | We review your situation thoroughly before recommending a pathway.\nPersonalized attention | Your matter is handled with individual care, not as a file in a queue.\nTransparency | Clear explanations of options, requirements and next steps.\nProfessional integrity | Honest advice, even when the answer is not the one you hoped for.\nQuality over volume | A focused practice that allows thoughtful preparation.\nVirtual convenience | Consultations and representation conducted remotely, wherever you are."
      ),
      t("virtualHeading", "Virtual model heading", "A fully virtual practice."),
      rt(
        "virtualBody",
        "Virtual model text",
        "All consultations are conducted 100% virtually, so you can receive guidance from home — whether you are in Canada or abroad.\n\nDocuments are exchanged securely and meetings are scheduled at a time that works across time zones. There is no office to visit and no travel required."
      ),
      img("virtualImage", "Virtual model image", IMAGES.virtualMeeting),
      t("virtualImageAlt", "Virtual model image alt text", "A video call in progress on a laptop at a shared table"),
    ],
  },
  {
    key: "services",
    label: "Services",
    path: "/services",
    metaTitle: "Immigration Services | Trace Immigration",
    metaDescription:
      "Spousal and partner sponsorship, permanent residence, Canadian citizenship, family immigration and Super Visa, and complex or previously refused matters.",
    fields: [
      ...hero(
        "Our Expertise",
        "Thoughtful guidance. Meaningful futures.",
        "Personalized support across family immigration, permanent residence and citizenship — including matters that need particular care."
      ),
      t("complexHeading", "Complex matters heading", "Complex cases or a previous refusal?"),
      ta("complexBody", "Complex matters text", "A previous refusal or an unusual history does not have to be the end of the conversation. Book a consultation and we will review your situation and discuss your options."),
    ],
  },
  {
    key: "team",
    label: "Our Team",
    path: "/team",
    metaTitle: "Our Team | Trace Immigration",
    metaDescription: "Meet the professionals behind Trace Immigration’s personalized Canadian immigration guidance.",
    fields: [
      ...hero("Our Team", "The people behind your file.", "Personal attention starts with knowing who is working on your matter."),
      ta("emptyText", "Text shown before profiles are published", "Team profiles are being prepared. In the meantime, we would be glad to introduce ourselves during a consultation."),
    ],
  },
  {
    key: "testimonials",
    label: "Testimonials",
    path: "/testimonials",
    metaTitle: "Client Testimonials | Trace Immigration",
    metaDescription: "Approved reflections from clients of Trace Immigration.",
    fields: [
      ...hero("Testimonials", "In our clients’ words.", "Shared with permission by the people we have had the privilege to guide."),
      t("emptyHeading", "Empty state heading", "Client stories are on their way."),
      ta("emptyText", "Empty state text", "We only publish testimonials that clients have approved for sharing. Please check back soon, or book a consultation to discuss your own plans."),
    ],
  },
  {
    key: "pricing",
    label: "Pricing",
    path: "/pricing",
    metaTitle: "Consultation & Service Pricing | Trace Immigration",
    metaDescription: "Consultation and service fee information for Trace Immigration’s Canadian immigration services.",
    fields: [
      ...hero("Our Fees", "Transparent pricing, no surprises.", "No hidden fees, no last-minute charges. Your fee is confirmed in writing before any work begins."),
      t("noPriceText", "Text when no price is published", "Contact us for consultation details."),
      ta("note", "Footnote", "Government processing fees and third-party costs are separate from professional fees."),
    ],
  },
  {
    key: "contact",
    label: "Contact",
    path: "/contact",
    metaTitle: "Contact Trace Immigration",
    metaDescription: "Contact Trace Immigration by email, phone or online inquiry. Consultations are conducted 100% virtually.",
    fields: [
      ...hero("Contact", "Let’s start the conversation.", "Share a few details about your situation and we will be in touch."),
      t("formHeading", "Form heading", "Send an inquiry"),
      t("successText", "Form success message", "Thank you. Your inquiry has been received and we will respond as soon as possible."),
    ],
  },
  {
    key: "booking",
    label: "Booking",
    path: "/booking",
    metaTitle: "Book a Consultation | Trace Immigration",
    metaDescription: "Book a personalized virtual consultation with Trace Immigration.",
    fields: [
      ...hero("Book a Consultation", "Let’s plan your future, together.", "Choose a consultation type and a time that suits you. All consultations are conducted virtually."),
      ta("closedText", "Text when online booking is unavailable", "Online booking is not open at the moment. Please send us an inquiry and we will arrange a time with you directly."),
      ta("confirmationText", "Text after booking", "Your request has been received. We will confirm your consultation by email."),
      ta("paymentNote", "Payment note", "No payment is collected online. Any applicable consultation fee and payment instructions will be confirmed with you directly."),
    ],
  },
  {
    key: "privacy",
    label: "Privacy Policy",
    path: "/privacy",
    metaTitle: "Privacy Policy | Trace Immigration",
    metaDescription: "How Trace Immigration collects, uses and protects personal information submitted through this website.",
    fields: [
      t("title", "Title", "Privacy Policy"),
      t("updated", "Last updated", ""),
      rt(
        "body",
        "Policy text",
        "This policy explains how personal information submitted through this website is handled. It should be reviewed by the firm before publication.\n\n## Information we collect\n- Details you provide in the contact form: name, email, phone number, service of interest and your message.\n- Details you provide when booking a consultation: name, email, phone number, preferred time and notes.\n- Details you provide when signing a consultation agreement, including your electronic signature.\n\n## How we use it\nWe use this information to respond to inquiries, schedule and conduct consultations, and maintain records of agreements. We do not sell personal information.\n\n## Cookies\nThis website does not use advertising or tracking cookies. A secure session cookie is used only for the site’s administration area.\n\n## Storage and security\nInformation is stored in access-controlled systems. Signed agreements are stored privately and are not publicly accessible.\n\n## Contact\nFor privacy questions or to request access to or correction of your information, contact us at the email address shown on this website."
      ),
    ],
  },
  {
    key: "terms",
    label: "Terms of Use",
    path: "/terms",
    metaTitle: "Terms of Use | Trace Immigration",
    metaDescription: "Terms governing the use of the Trace Immigration website.",
    fields: [
      t("title", "Title", "Terms of Use"),
      t("updated", "Last updated", ""),
      rt(
        "body",
        "Terms text",
        "These terms govern your use of this website. They should be reviewed by the firm before publication.\n\n## General information only\nContent on this website is general information and is not legal or immigration advice for your specific situation. Advice is provided only within a consultation or a written engagement.\n\n## No guarantee of outcome\nImmigration decisions are made by the relevant government authorities. No outcome can be guaranteed.\n\n## Bookings\nSubmitting a booking request does not create a client relationship until confirmed by the firm.\n\n## Changes\nThese terms may be updated from time to time. The current version is always available on this page."
      ),
    ],
  },
];

export function getPageDef(key: string) {
  return PAGE_DEFS.find((p) => p.key === key);
}

export function pageDefaults(key: string): Record<string, string> {
  const def = getPageDef(key);
  return Object.fromEntries((def?.fields ?? []).map((f) => [f.name, f.default]));
}
