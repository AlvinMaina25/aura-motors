import { useQuery } from "@tanstack/react-query";
import { Link, createFileRoute } from "@tanstack/react-router";

import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { EmptyState } from "@/components/EmptyState";
import { StatusBadge } from "@/components/StatusBadge";
import { listMyReservations } from "@/data/api";
import { accountNav } from "@/lib/nav";
import { formatDate, formatPrice } from "@/lib/format";

export const Route = createFileRoute("/account/reservations")({
  head: () => ({
    meta: [{ title: "My reservations — AuraAuto" }],
  }),
  component: MyReservations,
});

function MyReservations() {
  const { data: reservations = [], isPending } = useQuery({
    queryKey: ["my-reservations"],
    queryFn: listMyReservations,
  });

  return (
    <DashboardLayout eyebrow="Your account" title="My Reservations" nav={accountNav}>
      {isPending ? (
        <div className="space-y-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="glass h-24 animate-pulse rounded-2xl" />
          ))}
        </div>
      ) : reservations.length === 0 ? (
        <EmptyState
          title="No reservations yet"
          description="Reserve a car with a refundable deposit and it will appear here."
          action={
            <Link to="/browse" className="btn-accent">
              Browse vehicles
            </Link>
          }
        />
      ) : (
        <div className="space-y-3">
          {reservations.map((reservation) => (
            <div
              key={reservation.id}
              className="glass flex flex-wrap items-center justify-between gap-4 rounded-2xl p-5"
            >
              <div className="min-w-0">
                <p className="font-grotesk font-semibold">{reservation.vehicleName}</p>
                <p className="mt-1 text-xs text-mist">
                  Requested {formatDate(reservation.createdAt)} · Pickup{" "}
                  {formatDate(reservation.pickupDate)}
                </p>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-sm font-medium">
                  {formatPrice(reservation.depositAmount)} deposit
                </span>
                <StatusBadge status={reservation.status} />
              </div>
            </div>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
}
