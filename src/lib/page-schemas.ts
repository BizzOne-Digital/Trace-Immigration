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
      ta("heroSubtitle", "Hero subtitle", "Expert Canadian immigration guidance delivered virtually. Wherever you are, your future deserves thoughtful strategy, clear direction, and dedicated attention."),
      t("heroPrompt", "Hero supporting line", "Ready to Immigrate?"),
      t("heroCta", "Hero button label", "Book a Consultation"),
      img("heroImage", "Hero image", IMAGES.torontoSunrise),
      t("heroImageAlt", "Hero image alt text", "Toronto skyline and CN Tower across the waterfront at sunrise"),
      t("trust1", "Trust strip item 1", "Personalized Guidance"),
      t("trust2", "Trust strip item 2", "100% Virtual Consultations"),
      t("trust3", "Trust strip item 3", "Serving Canada & Beyond"),
      t("servicesEyebrow", "Services eyebrow", "Our Expertise"),
      t("complexText", "Complex cases line", "Complex cases or a previous refusal? Let’s discuss your options."),
      t("aboutHeading", "About heading", "More than paperwork. Your life, your future."),
      ta("aboutBody", "About text", "We bring careful assessment, personalized attention and thoughtful preparation to every immigration application."),
      t("aboutLink", "About link label", "Discover Trace Immigration"),
      img("aboutImage", "About image", IMAGES.consultationDesk),
      t("aboutImageAlt", "About image alt text", "Documents and a laptop on a desk during a planning session"),
      t("whoEyebrow", "Who we help — eyebrow", "Who We Help"),
      t("whoHeading", "Who we help — heading", "Wherever You Are in Your Journey, We’re Here to Guide You."),
      ta("whoIntro", "Who we help — description", "Every immigration journey is different. Whether you’re building a future in Canada, reuniting with family, or navigating a complex application, Trace Immigration provides clear, strategic guidance tailored to your circumstances — entirely virtually."),
      ta(
        "whoItems",
        "Who we help — cards (one per line: Title | Description)",
        "Bringing Loved Ones Together | Helping Canadian citizens and permanent residents reunite with their loved ones through spousal or partner sponsorship, and supporting families looking to bring parents and grandparents to Canada through the Super Visa program.\nBuilding Your Future in Canada | For individuals and professionals pursuing permanent residence in Canada, with guidance tailored to their eligibility, experience, and long-term goals.\nTaking the Next Step Toward Citizenship | For permanent residents ready to pursue Canadian citizenship, with professional support throughout the application process.\nNavigating Refusals & Complex Cases | For applicants facing refusals, previous complications, or uncertainty about their next steps. We carefully assess their circumstances and develop a practical strategy forward."
      ),
      t("processEyebrow", "Process — eyebrow", "Our Process"),
      t("processHeading", "Process — heading", "Your Journey With Trace"),
      ta("processIntro", "Process — description", "A seamless, fully virtual experience designed to make your immigration process clear, organized, and supported — from your first consultation to the final decision."),
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
      t("reviewsEyebrow", "Google reviews — eyebrow", "Google Reviews"),
      t("reviewsHeading", "Google reviews — heading", "What Our Clients Say"),
      ta("reviewsItems", "Google reviews — reviews (one per line: Name | Review, copied exactly from Google)", `Tejas Makwana | I had a great experience with Trace Immigration during my PR process. Special thanks to Aarmin for the excellent support and guidance throughout the process. I’m happy to have received approval for my PR application. Highly recommend their services!
Deepu Surendranadhan | A five-star experience with Trace Immigration! Our case handler, Aarmin, was exceptional. He handled our family PR application with great attention to detail and a high level of expertise. Highly recommend Aarmin and the Trace team to anyone looking to move to Canada! Thank you, Aarmin, for all your support.
Jugraj Singh | I am very thankful to Trace Immigration for handling my Canadian spousal PR visa. Aarmin sir was very supportive, responsive and helpful throughout the process. Highly recommended.
Divyansh | Very professional and best service we received from Aarmin. He got us the approval for the Super Visa application we filed for our parents.
Harmehar Hora | Professional & responsive team. Really appreciate their efforts on our visa application with IRCC and helping us get the approval!
Eman Imran | Helped me fix all my immigration issues!! Best services provided by Aarmin and his team.`),
      t("reviewsButton", "Google reviews — button label", "Read All Reviews on Google"),
      t("reviewsUrl", "Google reviews — Google Maps link", "https://maps.app.goo.gl/6ukeg6Q9rBKGPFH77"),
      t("faqHeading", "FAQ — heading", "Frequently asked questions"),
      ta(
        "faqItems",
        "FAQ — questions (one per line: Question | Answer)",
        "Are consultations really 100% virtual? | Yes. All consultations are conducted online, so you can meet with us from home — whether you are in Canada or abroad.\nCan you guarantee my application will be approved? | No one can honestly guarantee an immigration outcome, because decisions are made by the government. What we offer is careful assessment and thorough preparation.\nMy application was refused before. Can you still help? | Often, yes. A previous refusal is not necessarily the end. We review what happened and explain the options that may be available to you.\nHow much do your services cost? | Fees depend on your matter and are confirmed in writing before any work begins. Book a consultation or contact us for details.\nWhat should I prepare before my consultation? | Have your key documents and any previous application or refusal letters on hand. We will let you know if anything else is needed."
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
        "Experience You Can Trust. Guidance You Can Rely On.",
        "At Trace Immigration, we believe that every immigration journey deserves careful attention, honest advice, and a well-considered strategy."
      ),
      rt(
        "heroBody",
        "Introduction (continued)",
        "With experience in Canadian immigration dating back to 2017, our practice is built on years of helping individuals and families navigate the complexities of Canada’s immigration system.\n\nOver the years, we have assisted numerous clients in achieving their immigration goals, including obtaining permanent residence, reuniting with loved ones, and navigating previous refusals or complex applications.\n\nWe believe that a refusal does not always have to be the end of the road. Our experience extends to handling previously refused applications, identifying potential issues in immigration decisions, and pursuing reconsideration requests or other appropriate legal avenues to challenge IRCC decisions where circumstances warrant.\n\nWe understand that no two immigration cases are alike. That is why we take a thoughtful, individualized approach to every matter, focusing on understanding our clients’ circumstances, assessing their options, and developing practical strategies.\n\nAs a 100% virtual Canadian immigration practice, Trace Immigration serves clients across Canada and internationally, offering convenient access to professional advice without geographical limitations.\n\nOur commitment is simple: to provide dependable representation, transparent communication, and the professional attention your immigration future deserves."
      ),
      t("founderEyebrow", "Founder — eyebrow", "Meet Our Founder"),
      t("founderName", "Founder — name", "Aarmin Monga"),
      t("founderRole", "Founder — title", "Founder & Director | Regulated Canadian Immigration Consultant (RCIC)"),
      t("founderHeading", "Founder — heading", "An Immigration Journey That Inspired a Profession"),
      rt(
        "founderBody",
        "Founder — biography",
        "For Aarmin Monga, immigration is more than a profession — it is a journey he understands personally.\n\nHaving come to Canada as an immigrant himself, Aarmin understands the uncertainty, challenges and important decisions that can come with building a new life in another country. His own experience shaped his commitment to helping others navigate the Canadian immigration system with reliable advice and meaningful professional support.\n\nAarmin began working in the immigration field in 2017, where he gained practical experience and developed a strong understanding of Canadian immigration processes and client needs. He later worked at a law firm in downtown Toronto, further strengthening his professional experience before establishing his own immigration consulting practice.\n\nHe became a licensed Regulated Canadian Immigration Consultant (RCIC) in 2020.\n\nAarmin holds a Bachelor of Business Administration from the University of Guelph-Humber and a Graduate Diploma in Immigration Law from Humber College.\n\nAs Founder and Director of Trace Immigration, Aarmin’s approach is guided by a simple belief: every individual deserves to understand their immigration options and receive professional guidance that respects their unique circumstances.\n\nHe believes in taking the time to listen, explain complex matters clearly, and approach each case with care, professionalism and attention to detail.\n\nThrough Trace Immigration, his goal is to provide the kind of thoughtful and dependable support he knows can make a meaningful difference during an immigration journey."
      ),
      img("founderImage", "Founder — photo", IMAGES.founder),
      t("founderImageAlt", "Founder — photo alt text", "Portrait of Aarmin Monga, Founder and Director of Trace Immigration"),
      t("storyHeading", "Approach heading", "Quality over volume."),
      rt(
        "storyBody",
        "Approach text",
        "Every immigration matter is personal. Behind each application is a relationship, a career or a family’s next chapter — and it deserves more than a checklist.\n\nWe deliberately work with a focused number of clients so that each matter receives careful assessment, clear communication and thorough preparation. Before recommending a path, we take the time to understand your circumstances, your goals and any history that may affect your application."
      ),
      t("valuesEyebrow", "Why us — eyebrow", "Why Choose Trace Immigration?"),
      t("valuesHeading", "Why us — heading", "A More Personal Approach to Immigration"),
      ta("valuesIntro", "Why us — introduction", "At Trace Immigration, we believe immigration guidance should be professional, clear and centered on the individual. We take the time to understand your circumstances, explain your options and support you with care at every stage of the process."),
      ta(
        "values",
        "Why us — points (one per line: Title | Description)",
        "Guidance Grounded in Experience | Led by a regulated immigration professional who understands the immigration journey from both personal and professional perspectives.\nEvery Case Is Unique | We take the time to assess your circumstances carefully and provide guidance tailored to your needs, priorities and long-term goals.\nClarity at Every Step | We believe clients deserve honest communication, practical explanations and a clear understanding of the process from start to finish.\nProfessionalism & Integrity | Our work is guided by professional responsibility, careful preparation and a strong commitment to ethical representation.\nExpertise Without Borders | Our virtual service model allows clients across Canada and internationally to access professional immigration guidance conveniently and confidently."
      ),
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
      t("heroEyebrow", "Eyebrow", "Our Areas of Expertise"),
      ta("heroIntro", "Introduction", "Canadian immigration decisions can shape your future. From permanent residence and family reunification to citizenship and complex applications, we provide strategic, professional advice tailored to your circumstances."),
      t("complexEyebrow", "Complex cases — eyebrow", "Beyond Standard Applications"),
      t("complexHeading", "Complex cases — heading", "When Your Case Isn’t Straightforward."),
      rt(
        "complexBody",
        "Complex cases — text",
        "A refusal or complex immigration history deserves more than a standard approach.\n\nWith immigration experience dating back to 2017, our practice is built on helping clients navigate a wide range of immigration matters, including challenging applications and previous refusals.\n\nWe carefully examine the circumstances, identify potential concerns, and assess available options — including reconsideration requests and appropriate avenues for challenging IRCC decisions when warranted.\n\nBecause sometimes, the right strategy begins with looking beyond the initial decision."
      ),
      t("complexButton", "Complex cases — button", "Discuss Your Case"),
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
    key: "contact",
    label: "Contact Us",
    path: "/contact",
    metaTitle: "Contact Us | Trace Immigration",
    metaDescription: "Contact Trace Immigration by email, phone or online inquiry. Consultations are conducted 100% virtually.",
    fields: [
      ...hero("Contact Us", "Let’s start the conversation.", "Share a few details about your situation and we will be in touch."),
      t("formHeading", "Form heading", "Send an inquiry"),
      t("successText", "Form success message", "Thank you. Your inquiry has been received and we will respond as soon as possible."),
    ],
  },

  {
    key: "agreement",
    label: "Initial Consultation Agreement",
    path: "/initial-consultation-agreement",
    metaTitle: "Initial Consultation Agreement | Trace Immigration",
    metaDescription: "Review and accept the Initial Consultation Agreement before your consultation with Trace Immigration.",
    fields: [
      t("title", "Title", "Initial Consultation Agreement"),
      rt(
        "body",
        "Agreement wording",
        "This Initial Consultation Agreement is made this day (booking through the online booking tool) between Regulated Canadian Immigration Consultant (RCIC) Aarmin Monga (the “RCIC”) of Trace-Canada Immigration Services Inc., Membership Number R707244, and Client (Person(s) booking through this online booking tool and Person(s) going to attend the scheduled Initial Consultation Meeting).\n\nThis Agreement shall be governed by the laws in effect in the Province of Ontario, Canada, and the federal laws of Canada applicable therein.\n\nPlease be advised that Aarmin Monga is a member in good standing of the College of Immigration and Citizenship Consultants (CICC), and as such, is bound by its Bylaw, Code of Professional Ethics, and Regulations.\n\n## 1. Scope of Service\nThe RCIC will provide the Client with Initial Consultation under the terms of this Agreement.\n\n- Review information provided by the Client and provide consultation on the current status of Canadian immigration laws and policies where it relates to Client’s inquiry;\n- The work done under this agreement will be limited to the time as mentioned in the selected consultation option/type used while booking the Initial Consultation;\n- The information provided to the consultant in the Initial Consultation Form and during the consultation is for the purpose of obtaining a consultation only and is not intended for the purpose of retaining the RCIC for application, case, submission or representation in any matter, until a written legal Service Agreement establishing such nature of the relationship has been executed between the parties.\n\n## 2. Limits of Engagement\nThe services to be provided under this Agreement are limited to a single Initial consultation only and on the relevant matters described above. This agreement does not obligate the RCIC to provide further information or advice to the Client or to act for the Client in any application, representation, submissions, or proceedings. Should the Client require further services, advice, or representation from the RCIC following this initial consultation, the Client must sign a separate Service Agreement with the RCIC.\n\n## 3. Client Responsibility\nThe Client must provide the RCIC with such factual information and documentation as are required to perform the consultation. The Client must be accurate and honest and must inform the RCIC of all information, even if negative or adverse, which might be relevant to the advice provided by the RCIC in this matter. Failure to fully disclose all relevant information to the RCIC shall render the consultation provided null and void and shall void this Agreement, or seriously affect the outcome of the application of the Client or the retention of any status that the Client may obtain. In such an event, the RCIC shall not be held responsible or liable for any of the Client’s matters. The consultation fee paid by the Client is non-refundable.\n\nThe Client fully acknowledges that all information given during this consultation is provided as per the Canadian Immigration laws and policies valid until the time of consultation delivery. All information given during this consultation shall be considered null and void if there is a change in policy or immigration law at a later date after the advice is provided to the Client. The consultation fee paid by the Client shall be non-refundable.\n\n## 4. Termination\n\n- This Agreement is considered terminated upon completion of tasks identified under Clause 1 of this agreement. It is the Clients’ responsibility to settle any outstanding fees or dues for work performed by RCIC prior to termination.\n- Upon official termination, if the CLIENT(s) decides to proceed with any future applications that are personally done by the Client(s) as self-application and/or their representatives, lawyers or consultants will be done without the knowledge, approval, or involvement of RCIC and should these cause any impact, refusal, rejection, negative results or future inadmissibility, Trace-Canada Immigration Services Inc., Aarmin Monga and appointed RCIC shall not be held liable or be held legally responsible for any consequences.\n\n## 5. Payment Terms & Refund Policy\n\n- Fees shall be deemed earned by the RCIC immediately upon the commencement of the provision of professional advice and consultation session.\n- Fees paid by the Client under this agreement are non-refundable.\n\nPlease note, you are expected to have your Personal Profile Information with you during the Initial Consultation Session including but not limited to Education, Employment, Language Scores, NOC Codes and/or any other details. Our team will ask you the required information verbally during the session only. Any information sent to us in advance will NOT be reviewed or pre-assessed before the booked consultation time. Information collection, review and assessment is a part of the Initial Consultation session only, no extra time will be allocated for this.\n\nIf you choose to proceed with the booking, it is deemed that you agree to the terms and conditions of the agreement above and of our Privacy Policy and Terms & Conditions."
      ),
      t("agreeLabel", "Agree checkbox text", "I agree with the above Initial Consultation Agreement and its terms & conditions."),
      ta("successText", "Text after submitting", "Thank you. Your signed Initial Consultation Agreement has been received."),
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
