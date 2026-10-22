"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { MessageCircle, Send, X } from "lucide-react";

type ServiceInfo = { title: string; slug: string; tagline: string };
type Props = { services: ServiceInfo[]; email: string; phone: string; virtualStatement: string };

type Action = { label: string; href: string };
type Msg = { from: "bot" | "user"; text: string; actions?: Action[] };

const QUICK = ["Our services", "Book a consultation", "Fees", "Contact details", "Previous refusal"];

/** Keyword sets in English and Roman Urdu/Hindi. */
const has = (q: string, words: string[]) => words.some((w) => q.includes(w));
const SERVICE_KEYWORDS: Record<string, string[]> = {
  "spousal-partner-sponsorship": ["spous", "partner", "wife", "husband", "marriage", "married", "shadi", "biwi", "common-law", "fiance"],
  "permanent-residence": [" pr ", "permanent", "express entry", "skilled", "pnp", "residence"],
  "canadian-citizenship": ["citizen", "passport", "shehriyat"],
  "family-immigration-super-visa": ["super visa", "parent", "grandparent", "family", "mother", "father", "walid", "ammi", "abbu"],
  "refusals-complex-matters": ["refus", "reject", "denied", "complex", "inadmiss", "misrep"],
};

/** Simple, on-device answers. No external services are called. */
function reply(input: string, p: Props): Msg {
  const q = ` ${input.toLowerCase().trim()} `;
  const contact: Action = { label: "Contact us", href: "/contact" };
  const book: Action = { label: "Book a consultation", href: "/booking" };

  for (const s of p.services) {
    if (has(q, SERVICE_KEYWORDS[s.slug] ?? [s.title.toLowerCase()])) {
      return {
        from: "bot",
        text: `${s.title}: ${s.tagline} Every situation is different, so the best next step is a personalized consultation where we review your details.`,
        actions: [{ label: `About ${s.title}`, href: `/services/${s.slug}` }, book],
      };
    }
  }
  if (has(q, ["hi ", "hello", "hey", "salam", "assalam", "aoa"])) {
    return { from: "bot", text: "Hello! Welcome to Trace Immigration. How can I help you today? You can ask about our services, booking, fees or contact details." };
  }
  if (has(q, ["service", "help with", "what do you", "kya kart", "offer"])) {
    return {
      from: "bot",
      text: `We help with: ${p.services.map((s) => s.title).join(", ")}.`,
      actions: [{ label: "View all services", href: "/services" }, book],
    };
  }
  if (has(q, ["book", "appointment", "consult", "meeting", "slot", "milna", "time"])) {
    return { from: "bot", text: `You can request a consultation online. ${p.virtualStatement}`, actions: [book] };
  }
  if (has(q, ["fee", "price", "cost", "charge", "kitna", "paise", "pricing"])) {
    return { from: "bot", text: "Fees depend on your matter and are confirmed in writing before any work begins. Please see our pricing page or contact us for consultation details.", actions: [{ label: "Pricing", href: "/pricing" }, contact] };
  }
  if (has(q, ["contact", "email", "phone", "call", "number", "whatsapp", "rabta"])) {
    return { from: "bot", text: `Email: ${p.email}\nPhone: ${p.phone}`, actions: [contact] };
  }
  if (has(q, ["office", "address", "location", "where", "virtual", "online", "kahan"])) {
    return { from: "bot", text: `${p.virtualStatement} We serve clients in Canada and abroad, so no office visit is needed.`, actions: [book] };
  }
  if (has(q, ["guarantee", "chance", "approve", "success", "100%", "pakka"])) {
    return { from: "bot", text: "No one can honestly guarantee an immigration outcome — decisions are made by the government. What we offer is careful assessment and thorough preparation. A consultation is the best way to understand your options.", actions: [book] };
  }
  if (has(q, ["thank", "shukria", "thanks"])) {
    return { from: "bot", text: "You're welcome! Let us know if there's anything else we can help with." };
  }
  return {
    from: "bot",
    text: "I'm a simple assistant and may not have the answer to that. Our team can help you directly — send an inquiry or book a consultation.",
    actions: [contact, book],
  };
}

const STORE_KEY = "trace-chat";
const WELCOME: Msg = { from: "bot", text: "Hello! I'm the Trace Immigration assistant. Ask me about our services, booking, fees or how to reach us." };

export default function ChatWidget(props: Props) {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Msg[]>([WELCOME]);
  const listRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    try {
      const saved = sessionStorage.getItem(STORE_KEY);
      if (saved) setMessages(JSON.parse(saved));
    } catch {
      /* storage unavailable — start fresh */
    }
  }, []);

  useEffect(() => {
    try {
      sessionStorage.setItem(STORE_KEY, JSON.stringify(messages.slice(-40)));
    } catch {
      /* ignore */
    }
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (!open) return;
    inputRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        buttonRef.current?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  function ask(text: string) {
    const t = text.trim().slice(0, 500);
    if (!t) return;
    setMessages((m) => [...m, { from: "user", text: t }, reply(t, props)]);
    setInput("");
  }

  return (
    <>
      {open && (
        <div
          role="dialog"
          aria-label="Chat with Trace Immigration"
          className="fixed bottom-24 right-4 z-50 flex h-[min(560px,calc(100vh-8rem))] w-[calc(100vw-2rem)] max-w-sm flex-col overflow-hidden rounded-sm border border-line bg-ivory shadow-xl"
        >
          <div className="flex items-center justify-between bg-charcoal px-4 py-3 text-white">
            <div>
              <p className="font-serif text-lg leading-tight">Trace Immigration</p>
              <p className="text-xs text-champagne">Quick answers · general information only</p>
            </div>
            <button type="button" aria-label="Close chat" onClick={() => setOpen(false)} className="rounded-sm p-1.5 hover:bg-white/10">
              <X aria-hidden className="h-5 w-5" />
            </button>
          </div>

          <div ref={listRef} aria-live="polite" className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
            {messages.map((m, i) => (
              <div key={i} className={m.from === "user" ? "flex justify-end" : ""}>
                <div className={`max-w-[85%] whitespace-pre-line rounded-sm px-3 py-2 text-sm leading-relaxed ${m.from === "user" ? "bg-charcoal text-white" : "border border-line bg-white text-ink"}`}>
                  <span className="sr-only">{m.from === "user" ? "You: " : "Assistant: "}</span>
                  {m.text}
                  {m.actions && (
                    <span className="mt-2 flex flex-wrap gap-2">
                      {m.actions.map((a) => (
                        <Link key={a.href + a.label} href={a.href} onClick={() => setOpen(false)} className="rounded-sm border border-gold px-2 py-1 text-xs font-medium text-gold-ink hover:bg-cream">
                          {a.label}
                        </Link>
                      ))}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="flex gap-2 overflow-x-auto border-t border-line px-3 py-2">
            {QUICK.map((q) => (
              <button key={q} type="button" onClick={() => ask(q)} className="shrink-0 rounded-full border border-line bg-white px-3 py-1 text-xs text-ink hover:border-gold">
                {q}
              </button>
            ))}
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              ask(input);
            }}
            className="flex gap-2 border-t border-line bg-white p-3"
          >
            <label htmlFor="chat-input" className="sr-only">Type your question</label>
            <input
              ref={inputRef}
              id="chat-input"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              maxLength={500}
              placeholder="Type your question…"
              autoComplete="off"
              className="field !py-2 text-sm"
            />
            <button type="submit" aria-label="Send" disabled={!input.trim()} className="btn-dark !px-3 disabled:opacity-50">
              <Send aria-hidden className="h-4 w-4" />
            </button>
          </form>
        </div>
      )}

      <button
        ref={buttonRef}
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-label={open ? "Close chat" : "Open chat"}
        className="fixed bottom-5 right-4 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-gold-deep text-white shadow-lg transition-colors hover:bg-charcoal"
      >
        {open ? <X aria-hidden className="h-6 w-6" /> : <MessageCircle aria-hidden className="h-6 w-6" />}
      </button>
    </>
  );
}
