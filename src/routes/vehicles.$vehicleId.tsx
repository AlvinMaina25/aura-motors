import { useMutation, useQuery } from "@tanstack/react-query";
import { Link, createFileRoute } from "@tanstack/react-router";
import { Check, Heart } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { EmptyState } from "@/components/EmptyState";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { StatusBadge } from "@/components/StatusBadge";
import { VehicleGallery } from "@/components/vehicles/VehicleGallery";
import { createInquiry, createReservation, getVehicle } from "@/data/api";
import { useFavorites } from "@/hooks/useFavorites";
import { formatMileage, formatPrice, monthlyPayment, vehicleName } from "@/lib/format";

export const Route = createFileRoute("/vehicles/$vehicleId")({
  head: () => ({
    meta: [
      { title: "Vehicle details — AuraAuto" },
      {
        name: "description",
        content: "Full specification, gallery and reservation options for this AuraAuto listing.",
      },
      { property: "og:title", content: "Vehicle details — AuraAuto" },
      {
        property: "og:description",
        content: "Gallery, specification and reservation options for this listing.",
      },
    ],
  }),
  component: VehicleDetail,
});

function VehicleDetail() {
  const { vehicleId } = Route.useParams();
  const { data: vehicle, isPending } = useQuery({
    queryKey: ["vehicle", vehicleId],
    queryFn: () => getVehicle(vehicleId),
  });
  const { isFavorite, toggle } = useFavorites();
  const [tab, setTab] = useState<"inquire" | "reserve">("inquire");

  if (isPending) {
    return (
      <PublicLayout>
        <div className="mx-auto max-w-7xl px-6 py-12">
          <div className="glass h-[60vh] animate-pulse rounded-3xl" />
        </div>
      </PublicLayout>
    );
  }

  if (!vehicle) {
    return (
      <PublicLayout>
        <div className="mx-auto max-w-2xl px-6 py-20">
          <EmptyState
            title="This listing is no longer available"
            description="The vehicle may have been sold or removed. Browse the current collection instead."
            action={
              <Link to="/browse" className="btn-accent">
                Browse vehicles
              </Link>
            }
          />
        </div>
      </PublicLayout>
    );
  }

  const name = vehicleName(vehicle);
  const saved = isFavorite(vehicle.id);

  const specs = [
    ["Engine", vehicle.engine],
    ["Power", `${vehicle.horsepower} hp`],
    ["0–60 mph", `${vehicle.zeroToSixty}s`],
    ["Transmission", vehicle.transmission],
    ["Drivetrain", vehicle.drivetrain],
    ["Fuel", vehicle.fuel],
    ["Mileage", formatMileage(vehicle.mileage)],
    ["Body style", vehicle.bodyStyle],
    ["Exterior", vehicle.exteriorColor],
    ["Interior", vehicle.interiorColor],
    ["Location", vehicle.location],
    ["VIN", vehicle.vin],
  ] as const;

  return (
    <PublicLayout>
      <div className="mx-auto max-w-7xl px-6 pt-4 pb-12">
        <nav className="flex items-center gap-2 text-xs text-mist">
          <Link to="/browse" className="transition hover:text-foreground">
            Browse
          </Link>
          <span>/</span>
          <span className="truncate text-foreground">{name}</span>
        </nav>

        <div className="mt-6 grid gap-8 lg:grid-cols-[minmax(0,1fr)_380px]">
          <div className="rise">
            <VehicleGallery images={vehicle.images} alt={name} />

            <div className="glass mt-6 rounded-2xl p-6">
              <h2 className="font-grotesk text-lg font-semibold">About this car</h2>
              <p className="mt-3 text-sm leading-relaxed text-mist">{vehicle.description}</p>

              <h3 className="mt-7 font-grotesk text-base font-semibold">Highlights</h3>
              <ul className="mt-3 grid gap-2 sm:grid-cols-2">
                {vehicle.highlights.map((item) => (
                  <li key={item} className="flex items-start gap-2 text-sm text-mist">
                    <Check className="mt-0.5 size-4 shrink-0 text-accent" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div className="glass mt-6 rounded-2xl p-6">
              <h2 className="font-grotesk text-lg font-semibold">Specification</h2>
              <dl className="mt-4 grid gap-x-8 sm:grid-cols-2">
                {specs.map(([label, value]) => (
                  <div
                    key={label}
                    className="flex justify-between gap-4 border-b border-border py-2.5 text-sm"
                  >
                    <dt className="text-mist">{label}</dt>
                    <dd className="text-right font-medium">{value}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>

          <aside className="lg:sticky lg:top-6 lg:self-start">
            <div className="glass rounded-3xl p-6 shadow-glass">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="label-xs">
                    {vehicle.year} · {vehicle.trim}
                  </p>
                  <h1 className="mt-1 font-grotesk text-2xl font-bold">
                    {vehicle.make} {vehicle.model}
                  </h1>
                </div>
                <StatusBadge status={vehicle.status} />
              </div>

              <p className="mt-4 font-grotesk text-3xl font-bold">{formatPrice(vehicle.price)}</p>
              <p className="mt-1 text-sm text-mist">
                or {formatPrice(monthlyPayment(vehicle.price))}/mo · 60 months · 10% down
              </p>

              <div className="mt-6 flex gap-2">
                <button
                  type="button"
                  onClick={() => setTab("inquire")}
                  className={`flex-1 rounded-full py-2.5 text-sm font-semibold transition ${
                    tab === "inquire"
                      ? "bg-accent text-accent-foreground"
                      : "bg-white/5 text-mist ring-1 ring-white/10"
                  }`}
                >
                  Inquire
                </button>
                <button
                  type="button"
                  onClick={() => setTab("reserve")}
                  className={`flex-1 rounded-full py-2.5 text-sm font-semibold transition ${
                    tab === "reserve"
                      ? "bg-accent text-accent-foreground"
                      : "bg-white/5 text-mist ring-1 ring-white/10"
                  }`}
                >
                  Reserve
                </button>
                <button
                  type="button"
                  onClick={() => toggle(vehicle.id)}
                  aria-label={saved ? "Remove from favorites" : "Save to favorites"}
                  aria-pressed={saved}
                  className="icon-btn size-10 shrink-0"
                >
                  <Heart className={`size-4 ${saved ? "fill-accent text-accent" : "text-mist"}`} />
                </button>
              </div>

              <div className="mt-5">
                {tab === "inquire" ? (
                  <InquiryForm vehicleId={vehicle.id} vehicleName={name} />
                ) : (
                  <ReservationForm vehicleId={vehicle.id} vehicleName={name} />
                )}
              </div>

              <p className="mt-4 text-center text-[11px] text-mist">
                No payment is taken today · Cancel any time
              </p>
            </div>
          </aside>
        </div>
      </div>
    </PublicLayout>
  );
}

function InquiryForm({ vehicleId, vehicleName }: { vehicleId: string; vehicleName: string }) {
  const [form, setForm] = useState({ name: "", email: "", phone: "", message: "" });

  const mutation = useMutation({
    mutationFn: () => createInquiry({ vehicleId, vehicleName, ...form }),
    onSuccess: () => {
      toast.success("Inquiry sent", {
        description: "A specialist will reply within one business day.",
      });
      setForm({ name: "", email: "", phone: "", message: "" });
    },
  });

  return (
    <form
      className="space-y-3"
      onSubmit={(e) => {
        e.preventDefault();
        mutation.mutate();
      }}
    >
      <input
        required
        className="field"
        placeholder="Full name"
        aria-label="Full name"
        value={form.name}
        onChange={(e) => setForm({ ...form, name: e.target.value })}
      />
      <input
        required
        type="email"
        className="field"
        placeholder="Email address"
        aria-label="Email address"
        value={form.email}
        onChange={(e) => setForm({ ...form, email: e.target.value })}
      />
      <input
        className="field"
        placeholder="Phone (optional)"
        aria-label="Phone number"
        value={form.phone}
        onChange={(e) => setForm({ ...form, phone: e.target.value })}
      />
      <textarea
        required
        rows={3}
        className="field resize-none"
        placeholder="What would you like to know?"
        aria-label="Message"
        value={form.message}
        onChange={(e) => setForm({ ...form, message: e.target.value })}
      />
      <button type="submit" disabled={mutation.isPending} className="btn-accent w-full">
        {mutation.isPending ? "Sending…" : "Send inquiry"}
      </button>
    </form>
  );
}

function ReservationForm({ vehicleId, vehicleName }: { vehicleId: string; vehicleName: string }) {
  const [form, setForm] = useState({
    customerName: "",
    email: "",
    pickupDate: "",
    depositAmount: 150000,
  });

  const mutation = useMutation({
    mutationFn: () => createReservation({ vehicleId, vehicleName, ...form }),
    onSuccess: () => {
      toast.success("Reservation requested", {
        description: "We'll hold the car for 48 hours while we confirm.",
      });
      setForm({ customerName: "", email: "", pickupDate: "", depositAmount: 150000 });
    },
  });

  return (
    <form
      className="space-y-3"
      onSubmit={(e) => {
        e.preventDefault();
        mutation.mutate();
      }}
    >
      <input
        required
        className="field"
        placeholder="Full name"
        aria-label="Full name"
        value={form.customerName}
        onChange={(e) => setForm({ ...form, customerName: e.target.value })}
      />
      <input
        required
        type="email"
        className="field"
        placeholder="Email address"
        aria-label="Email address"
        value={form.email}
        onChange={(e) => setForm({ ...form, email: e.target.value })}
      />
      <div>
        <label className="label-xs mb-1.5" htmlFor="pickup">
          Preferred collection date
        </label>
        <input
          required
          id="pickup"
          type="date"
          className="field"
          value={form.pickupDate}
          onChange={(e) => setForm({ ...form, pickupDate: e.target.value })}
        />
      </div>
      <div>
        <label className="label-xs mb-1.5" htmlFor="deposit">
          Refundable deposit
        </label>
        <select
          id="deposit"
          className="field appearance-none bg-brand"
          value={form.depositAmount}
          onChange={(e) => setForm({ ...form, depositAmount: Number(e.target.value) })}
        >
          <option value={100000}>Ksh 100,000</option>
          <option value={150000}>Ksh 150,000</option>
          <option value={250000}>Ksh 250,000</option>
        </select>
      </div>
      <button type="submit" disabled={mutation.isPending} className="btn-accent w-full">
        {mutation.isPending ? "Reserving…" : "Reserve this car"}
      </button>
    </form>
  );
}
