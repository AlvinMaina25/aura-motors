import { createFileRoute } from "@tanstack/react-router";
import { Clock, Mail, MapPin, Phone } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { PageIntro, PublicLayout } from "@/components/layout/PublicLayout";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact AuraAuto — talk to a specialist" },
      {
        name: "description",
        content:
          "Reach the AuraAuto client care team about a listing, a trade-in or a sourcing request.",
      },
      { property: "og:title", content: "Contact AuraAuto" },
      {
        property: "og:description",
        content: "Talk to a specialist about a listing, trade-in or sourcing request.",
      },
    ],
  }),
  component: Contact,
});

const details = [
  { icon: Phone, label: "Phone", value: "+254 700 000 118" },
  { icon: Mail, label: "Email", value: "care@auraauto.example" },
  { icon: MapPin, label: "Showroom", value: "Riverside Drive, Nairobi" },
  { icon: Clock, label: "Hours", value: "Mon–Sat, 9:00–18:00" },
];

function Contact() {
  const [sending, setSending] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", topic: "A listing", message: "" });

  return (
    <PublicLayout>
      <PageIntro
        eyebrow="Client care"
        title={
          <>
            Speak to someone
            <br />
            <span className="bg-gradient-to-r from-accent to-glow bg-clip-text text-transparent">
              who knows the car.
            </span>
          </>
        }
        lead="Every enquiry is answered by a specialist who has driven the vehicle in question — not a call centre."
      />

      <div className="mx-auto grid max-w-7xl gap-8 px-6 pb-12 lg:grid-cols-[minmax(0,1fr)_340px]">
        <form
          className="glass rounded-3xl p-6"
          onSubmit={(e) => {
            e.preventDefault();
            setSending(true);
            setTimeout(() => {
              setSending(false);
              toast.success("Message sent", {
                description: "We reply to every message within one business day.",
              });
              setForm({ name: "", email: "", topic: "A listing", message: "" });
            }, 500);
          }}
        >
          <h2 className="font-grotesk text-lg font-semibold">Send a message</h2>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <div>
              <label className="label-xs mb-1.5" htmlFor="c-name">
                Full name
              </label>
              <input
                required
                id="c-name"
                className="field"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>
            <div>
              <label className="label-xs mb-1.5" htmlFor="c-email">
                Email
              </label>
              <input
                required
                type="email"
                id="c-email"
                className="field"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </div>
          </div>
          <div className="mt-4">
            <label className="label-xs mb-1.5" htmlFor="c-topic">
              What is this about?
            </label>
            <select
              id="c-topic"
              className="field appearance-none bg-brand"
              value={form.topic}
              onChange={(e) => setForm({ ...form, topic: e.target.value })}
            >
              <option>A listing</option>
              <option>Financing</option>
              <option>Trade-in appraisal</option>
              <option>Sourcing request</option>
            </select>
          </div>
          <div className="mt-4">
            <label className="label-xs mb-1.5" htmlFor="c-message">
              Message
            </label>
            <textarea
              required
              id="c-message"
              rows={5}
              className="field resize-none"
              value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
            />
          </div>
          <button type="submit" disabled={sending} className="btn-accent mt-6">
            {sending ? "Sending…" : "Send message"}
          </button>
        </form>

        <aside className="glass h-fit rounded-3xl p-6">
          <h2 className="font-grotesk text-lg font-semibold">Direct lines</h2>
          <ul className="mt-5 space-y-5">
            {details.map((item) => (
              <li key={item.label} className="flex items-start gap-3">
                <span className="icon-btn size-9 shrink-0">
                  <item.icon className="size-4 text-accent" />
                </span>
                <div className="min-w-0">
                  <div className="label-xs">{item.label}</div>
                  <div className="mt-1 text-sm">{item.value}</div>
                </div>
              </li>
            ))}
          </ul>
        </aside>
      </div>
    </PublicLayout>
  );
}
