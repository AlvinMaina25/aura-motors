import { Link, createFileRoute } from "@tanstack/react-router";

import interiorImage from "@/assets/car-interior.jpg";
import { PageIntro, PublicLayout } from "@/components/layout/PublicLayout";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About AuraAuto — how we source and verify" },
      {
        name: "description",
        content:
          "AuraAuto inspects, documents and photographs every vehicle before it reaches the showroom floor.",
      },
      { property: "og:title", content: "About AuraAuto" },
      {
        property: "og:description",
        content: "How we source, inspect and document every car we list.",
      },
    ],
  }),
  component: About,
});

const pillars = [
  {
    title: "Sourced, not listed",
    body: "Our acquisition team buys from single-owner collections, main dealers and trusted specialists. Nothing arrives sight-unseen.",
  },
  {
    title: "212-point inspection",
    body: "Every car is mechanically and cosmetically inspected in-house. The full report is attached to the listing before it goes live.",
  },
  {
    title: "Transparent pricing",
    body: "One price, published. No admin fees, no negotiation theatre, and a valuation trail you can read for yourself.",
  },
];

function About() {
  return (
    <PublicLayout>
      <PageIntro
        eyebrow="Since 2019"
        title={
          <>
            A showroom built on
            <br />
            <span className="bg-gradient-to-r from-accent to-glow bg-clip-text text-transparent">
              evidence, not adjectives.
            </span>
          </>
        }
        lead="AuraAuto exists because buying a serious car should feel as considered as the engineering inside it."
      />

      <div className="mx-auto max-w-7xl px-6 pb-12">
        <div className="grid gap-6 lg:grid-cols-3">
          {pillars.map((pillar) => (
            <div key={pillar.title} className="glass glass-hover rounded-2xl p-6">
              <h2 className="font-grotesk text-lg font-semibold">{pillar.title}</h2>
              <p className="mt-3 text-sm leading-relaxed text-mist">{pillar.body}</p>
            </div>
          ))}
        </div>

        <div className="glass mt-8 grid gap-8 rounded-3xl p-6 lg:grid-cols-2 lg:items-center">
          <img
            src={interiorImage}
            alt="Quilted leather interior of a luxury vehicle"
            loading="lazy"
            width={1024}
            height={640}
            className="aspect-[16/10] w-full rounded-2xl object-cover"
          />
          <div>
            <h2 className="font-grotesk text-2xl font-bold">Fourteen specialists. One standard.</h2>
            <p className="mt-4 text-sm leading-relaxed text-mist">
              Our team is split between acquisition, workshop and client care — and all three sign
              off before a car is photographed. If a vehicle cannot be documented to that standard,
              we do not sell it.
            </p>
            <div className="mt-7 grid grid-cols-3 gap-6">
              <div>
                <div className="font-grotesk text-2xl font-bold">1,200+</div>
                <div className="text-xs text-mist">Cars delivered</div>
              </div>
              <div>
                <div className="font-grotesk text-2xl font-bold">98%</div>
                <div className="text-xs text-mist">Buyer satisfaction</div>
              </div>
              <div>
                <div className="font-grotesk text-2xl font-bold">14</div>
                <div className="text-xs text-mist">Specialists</div>
              </div>
            </div>
            <Link to="/browse" className="btn-accent mt-8">
              See the current collection
            </Link>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}
