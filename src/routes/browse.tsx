import { useQuery } from "@tanstack/react-query";
import { Link, createFileRoute } from "@tanstack/react-router";
import { useState } from "react";

import { EmptyState } from "@/components/EmptyState";
import { PageIntro, PublicLayout } from "@/components/layout/PublicLayout";
import { VehicleCard } from "@/components/vehicles/VehicleCard";
import { VehicleFilterPanel } from "@/components/vehicles/VehicleFilters";
import { listVehicles } from "@/data/api";
import type { VehicleFilters } from "@/data/types";

export const Route = createFileRoute("/browse")({
  head: () => ({
    meta: [
      { title: "Browse vehicles — AuraAuto" },
      {
        name: "description",
        content:
          "Search and filter the full AuraAuto inventory by body style, fuel, transmission and price.",
      },
      { property: "og:title", content: "Browse vehicles — AuraAuto" },
      {
        property: "og:description",
        content: "Filter hand-verified performance and luxury vehicles by spec and budget.",
      },
    ],
  }),
  component: Browse,
});

const defaultFilters: VehicleFilters = {
  query: "",
  bodyStyle: "all",
  fuel: "all",
  transmission: "all",
  maxPrice: 15000000,
  sort: "newest",
};

function Browse() {
  const [filters, setFilters] = useState<VehicleFilters>(defaultFilters);

  const { data: vehicles = [], isPending } = useQuery({
    queryKey: ["vehicles", filters],
    queryFn: () => listVehicles(filters),
  });

  const patch = (next: Partial<VehicleFilters>) =>
    setFilters((current) => ({ ...current, ...next }));

  return (
    <PublicLayout>
      <PageIntro
        eyebrow="1,200+ verified listings"
        title={
          <>
            The showroom,
            <br />
            <span className="bg-gradient-to-r from-accent to-glow bg-clip-text text-transparent">
              filtered to you.
            </span>
          </>
        }
        lead="Narrow the collection by body style, drivetrain and budget. Every car is inspected, documented and ready to reserve."
      />

      <div className="mx-auto grid max-w-7xl gap-8 px-6 pb-12 lg:grid-cols-[300px_minmax(0,1fr)]">
        <aside className="lg:sticky lg:top-6 lg:self-start">
          <VehicleFilterPanel
            filters={filters}
            onChange={patch}
            onReset={() => setFilters(defaultFilters)}
            resultCount={vehicles.length}
          />
        </aside>

        <div>
          {isPending ? (
            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {[0, 1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="glass h-72 animate-pulse rounded-2xl" />
              ))}
            </div>
          ) : vehicles.length === 0 ? (
            <EmptyState
              title="No vehicles match those filters"
              description="Try widening your price range or clearing a filter to see more of the collection."
              action={
                <button
                  type="button"
                  onClick={() => setFilters(defaultFilters)}
                  className="btn-accent"
                >
                  Clear filters
                </button>
              }
            />
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {vehicles.map((vehicle) => (
                <VehicleCard key={vehicle.id} vehicle={vehicle} />
              ))}
            </div>
          )}

          <p className="mt-8 text-sm text-mist">
            Looking for something specific?{" "}
            <Link to="/contact" className="text-accent hover:underline">
              Tell us what to source
            </Link>
            .
          </p>
        </div>
      </div>
    </PublicLayout>
  );
}
