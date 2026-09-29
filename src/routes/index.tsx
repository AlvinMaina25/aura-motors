import { useQuery } from "@tanstack/react-query";
import { Link, createFileRoute } from "@tanstack/react-router";
import { Heart } from "lucide-react";

import heroCar from "@/assets/hero-car.jpg";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { VehicleCard } from "@/components/vehicles/VehicleCard";
import { listFeaturedVehicles } from "@/data/api";
import { useFavorites } from "@/hooks/useFavorites";
import { formatPrice } from "@/lib/format";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "AuraAuto — Find your next iconic drive" },
      {
        name: "description",
        content:
          "A curated collection of hand-verified performance and luxury vehicles, with transparent pricing and financing built right in.",
      },
      { property: "og:title", content: "AuraAuto — Find your next iconic drive" },
      {
        property: "og:description",
        content:
          "Curated performance and luxury vehicles with transparent pricing, financing and instant reservations.",
      },
    ],
  }),
  component: Home,
});

function Home() {
  const { data: featured = [] } = useQuery({
    queryKey: ["vehicles", "featured"],
    queryFn: listFeaturedVehicles,
  });
  const { isFavorite, toggle } = useFavorites();
  const hero = featured[0];
  const saved = hero ? isFavorite(hero.id) : false;


  return (
    <PublicLayout>
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid items-center gap-10 pt-6 lg:grid-cols-12 lg:pt-10">
          <div className="rise lg:col-span-7">
            <span className="pill">
              <span className="size-1.5 rounded-full bg-accent" />
              The premium marketplace, reimagined
            </span>
            <h1 className="mt-6 font-grotesk text-5xl font-bold leading-[1.05] sm:text-6xl">
              Find your next
              <br />
              <span className="bg-gradient-to-r from-accent to-glow bg-clip-text text-transparent">
                iconic drive.
              </span>
            </h1>
            <p className="mt-6 max-w-md text-base leading-relaxed text-mist">
              A curated collection of hand-verified performance and luxury vehicles, with
              transparent pricing and financing built right in.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/browse" className="btn-accent">
                Browse vehicles
              </Link>
              <Link to="/contact" className="btn-glass">
                Talk to a specialist
              </Link>
            </div>
            <div className="mt-10 flex gap-8">
              <div>
                <div className="font-grotesk text-2xl font-bold">1,200+</div>
                <div className="text-xs text-mist">Verified listings</div>
              </div>
              <div>
                <div className="font-grotesk text-2xl font-bold">98%</div>
                <div className="text-xs text-mist">Buyer satisfaction</div>
              </div>
              <div>
                <div className="font-grotesk text-2xl font-bold">4.9</div>
                <div className="text-xs text-mist">Average rating</div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5">
            <div className="glass rounded-3xl p-6 shadow-glass">
              {hero ? (
                <>
                  <Link
                    to="/vehicles/$vehicleId"
                    params={{ vehicleId: hero.slug }}
                    className="block overflow-hidden rounded-2xl"
                  >
                    <img
                      src={hero.images[0] ?? heroCar}
                      alt={`${hero.year} ${hero.make} ${hero.model}`}
                      width={1024}
                      height={768}
                      className="aspect-[4/3] w-full rounded-2xl object-cover"
                    />
                  </Link>
                  <div className="mt-4 flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <h3 className="truncate font-grotesk text-lg font-semibold">
                        {hero.year} {hero.make} {hero.model}
                      </h3>
                      <p className="truncate text-sm text-mist">
                        {hero.engine} · {hero.horsepower} hp · {hero.transmission}
                      </p>
                    </div>
                    <Link
                      to="/vehicles/$vehicleId"
                      params={{ vehicleId: hero.slug }}
                      className="shrink-0 rounded-full bg-accent/15 px-3 py-1 text-xs font-semibold text-accent"
                    >
                      Reserve
                    </Link>
                  </div>
                  <div className="mt-5 flex items-center justify-between">
                    <span className="font-grotesk text-xl font-bold">
                      {formatPrice(hero.price)}
                    </span>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => toggle(hero.id)}
                        aria-label={saved ? "Remove from favorites" : "Save to favorites"}
                        aria-pressed={saved}
                        className="icon-btn size-10"
                      >
                        <Heart
                          className={`size-4 ${saved ? "fill-accent text-accent" : "text-mist"}`}
                        />
                      </button>
                      <Link
                        to="/vehicles/$vehicleId"
                        params={{ vehicleId: hero.slug }}
                        className="btn-light px-4 py-2"
                      >
                        Enquire
                      </Link>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <img
                    src={heroCar}
                    alt="Featured vehicle in a dark studio"
                    width={1024}
                    height={768}
                    className="aspect-[4/3] w-full rounded-2xl object-cover"
                  />
                  <div className="mt-4 h-5 w-2/3 animate-pulse rounded bg-white/5" />
                  <div className="mt-3 h-4 w-1/2 animate-pulse rounded bg-white/5" />
                  <div className="mt-5 h-6 w-1/3 animate-pulse rounded bg-white/5" />
                </>
              )}
            </div>
          </div>

        </div>

        <section className="mt-16">
          <div className="flex items-end justify-between">
            <h2 className="font-grotesk text-2xl font-bold">Featured this week</h2>
            <Link to="/browse" className="text-sm text-mist transition hover:text-foreground">
              View all →
            </Link>
          </div>
          <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((vehicle) => (
              <VehicleCard key={vehicle.id} vehicle={vehicle} />
            ))}
          </div>
        </section>
      </div>
    </PublicLayout>
  );
}
