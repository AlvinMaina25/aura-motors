import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";

import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { EmptyState } from "@/components/EmptyState";
import { StatusBadge } from "@/components/StatusBadge";
import { listReservations, updateReservationStatus } from "@/data/api";
import type { ReservationStatus } from "@/data/types";
import { adminNav } from "@/lib/nav";
import { formatDate, formatPrice } from "@/lib/format";

export const Route = createFileRoute("/admin/reservations")({
  head: () => ({
    meta: [{ title: "Reservations — AuraAuto Admin" }],
  }),
  component: AdminReservations,
});

const statuses: ReservationStatus[] = ["pending", "confirmed", "completed", "cancelled"];

function AdminReservations() {
  const queryClient = useQueryClient();
  const { data: reservations = [], isPending } = useQuery({
    queryKey: ["admin-reservations"],
    queryFn: listReservations,
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: ReservationStatus }) =>
      updateReservationStatus(id, status),
    onSuccess: () => {
      toast.success("Reservation updated");
      queryClient.invalidateQueries({ queryKey: ["admin-reservations"] });
      queryClient.invalidateQueries({ queryKey: ["admin-metrics"] });
    },
  });

  return (
    <DashboardLayout eyebrow="Admin control center" title="Reservations" nav={adminNav}>
      <div className="glass rounded-2xl p-4">
        {isPending ? (
          <div className="space-y-2">
            {[0, 1, 2].map((i) => (
              <div key={i} className="h-16 animate-pulse rounded-xl bg-white/5" />
            ))}
          </div>
        ) : reservations.length === 0 ? (
          <EmptyState
            title="No reservations yet"
            description="Reservations will appear here as customers make them."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead>
                <tr className="text-xs text-mist">
                  <th className="pb-3 font-medium">Vehicle</th>
                  <th className="pb-3 font-medium">Customer</th>
                  <th className="pb-3 font-medium">Pickup</th>
                  <th className="pb-3 font-medium">Deposit</th>
                  <th className="pb-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {reservations.map((reservation) => (
                  <tr key={reservation.id} className="border-t border-border">
                    <td className="py-3 pr-4">{reservation.vehicleName}</td>
                    <td className="py-3 pr-4">
                      <p>{reservation.customerName}</p>
                      <p className="text-xs text-mist">{reservation.email}</p>
                    </td>
                    <td className="py-3 pr-4 text-mist">{formatDate(reservation.pickupDate)}</td>
                    <td className="py-3 pr-4">{formatPrice(reservation.depositAmount)}</td>
                    <td className="py-3">
                      <div className="flex items-center gap-2">
                        <StatusBadge status={reservation.status} />
                        <select
                          aria-label={`Update status for ${reservation.vehicleName} reservation`}
                          className="field w-auto appearance-none bg-brand py-1.5 text-xs"
                          value={reservation.status}
                          onChange={(e) =>
                            statusMutation.mutate({
                              id: reservation.id,
                              status: e.target.value as ReservationStatus,
                            })
                          }
                        >
                          {statuses.map((status) => (
                            <option key={status} value={status} className="capitalize">
                              {status}
                            </option>
                          ))}
                        </select>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
