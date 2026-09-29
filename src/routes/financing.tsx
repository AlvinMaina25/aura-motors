import { Link, createFileRoute } from "@tanstack/react-router";
import { useState } from "react";

import { PageIntro, PublicLayout } from "@/components/layout/PublicLayout";
import { formatPrice, monthlyPayment } from "@/lib/format";

export const Route = createFileRoute("/financing")({
  head: () => ({
    meta: [
      { title: "Financing — AuraAuto" },
      {
        name: "description",
        content:
          "Estimate monthly payments on any AuraAuto listing and see how our financing decisions work.",
      },
      { property: "og:title", content: "Financing — AuraAuto" },
      {
        property: "og:description",
        content: "Estimate monthly payments and understand AuraAuto financing terms.",
      },
    ],
  }),
  component: Financing,
});

const steps = [
  {
    title: "Pick the car",
    body: "Reserve online with a refundable deposit while we prepare your quote.",
  },
  {
    title: "Share the basics",
    body: "A soft check only — your credit score is untouched until you accept an offer.",
  },
  {
    title: "Choose your terms",
    body: "Compare 36, 48 and 60 month structures side by side, with no hidden fees.",
  },
];

function Financing() {
  const [price, setPrice] = useState(9000000);
  const [months, setMonths] = useState(60);
  const [downPct, setDownPct] = useState(10);

  const payment = monthlyPayment(price, months, downPct / 100);

  return (
    <PublicLayout>
      <PageIntro
        eyebrow="Representative APR 7.9%"
        title={
          <>
            Financing that reads
            <br />
            <span className="bg-gradient-to-r from-accent to-glow bg-clip-text text-transparent">
              like plain English.
            </span>
          </>
        }
        lead="Estimate a monthly payment before you speak to anyone. The numbers you see here are the numbers we quote."
      />

      <div className="mx-auto grid max-w-7xl gap-8 px-6 pb-12 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div className="glass rounded-3xl p-6">
          <h2 className="font-grotesk text-lg font-semibold">Payment calculator</h2>

          <div className="mt-7 space-y-8">
            <div>
              <div className="flex items-center justify-between">
                <span className="label-xs">Vehicle price</span>
                <span className="font-grotesk text-sm font-semibold text-accent">
                  {formatPrice(price)}
                </span>
              </div>
              <input
                type="range"
                min={1000000}
                max={30000000}
                step={500000}
                value={price}
                onChange={(e) => setPrice(Number(e.target.value))}
                aria-label="Vehicle price"
                className="mt-3 w-full accent-accent"
              />
            </div>

            <div>
              <div className="flex items-center justify-between">
                <span className="label-xs">Deposit</span>
                <span className="font-grotesk text-sm font-semibold text-accent">
                  {downPct}% · {formatPrice((price * downPct) / 100)}
                </span>
              </div>
              <input
                type="range"
                min={5}
                max={50}
                step={5}
                value={downPct}
                onChange={(e) => setDownPct(Number(e.target.value))}
                aria-label="Deposit percentage"
                className="mt-3 w-full accent-accent"
              />
            </div>

            <div>
              <span className="label-xs mb-2">Term</span>
              <div className="flex flex-wrap gap-2">
                {[36, 48, 60, 72].map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setMonths(m)}
                    aria-pressed={months === m}
                    className={`rounded-full px-4 py-2 text-xs font-semibold transition ${
                      months === m
                        ? "bg-accent text-accent-foreground"
                        : "bg-white/5 text-mist ring-1 ring-white/10 hover:text-foreground"
                    }`}
                  >
                    {m} months
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-8 flex flex-wrap items-end justify-between gap-4 border-t border-border pt-6">
            <div>
              <div className="label-xs">Estimated monthly payment</div>
              <div className="mt-2 font-grotesk text-4xl font-bold">{formatPrice(payment)}</div>
              <p className="mt-2 text-xs text-mist">
                Representative APR 7.9% · Estimate only, not an offer of finance.
              </p>
            </div>
            <Link to="/contact" className="btn-accent">
              Request a quote
            </Link>
          </div>
        </div>

        <aside className="glass h-fit rounded-3xl p-6">
          <h2 className="font-grotesk text-lg font-semibold">How it works</h2>
          <ol className="mt-5 space-y-6">
            {steps.map((step, index) => (
              <li key={step.title} className="flex gap-3">
                <span className="grid size-7 shrink-0 place-items-center rounded-full bg-accent/15 font-grotesk text-xs font-bold text-accent">
                  {index + 1}
                </span>
                <div>
                  <h3 className="font-grotesk text-sm font-semibold">{step.title}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-mist">{step.body}</p>
                </div>
              </li>
            ))}
          </ol>
        </aside>
      </div>
    </PublicLayout>
  );
}
