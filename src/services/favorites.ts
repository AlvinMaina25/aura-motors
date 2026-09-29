/**
 * Favorites.
 *
 * Signed-in visitors get durable favorites in the `favorites` table. Guests
 * keep the previous localStorage behaviour so the heart button never breaks,
 * and their saved cars are merged into the database on first sign-in.
 */

import { supabase } from "@/integrations/supabase/client";

const FAVORITES_KEY = "auraauto.favorites";

export function readLocalFavorites(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(FAVORITES_KEY);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
}

export function writeLocalFavorites(ids: string[]) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(FAVORITES_KEY, JSON.stringify(ids));
  } catch {
    /* storage unavailable — favorites stay in memory for this session */
  }
}

export async function listFavoriteCarIds(userId: string): Promise<string[]> {
  const { data, error } = await supabase
    .from("favorites")
    .select("car_id")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  if (error) throw new Error(`Could not load your saved cars: ${error.message}`);
  return (data ?? []).map((row) => row.car_id);
}

export async function addFavorite(userId: string, carId: string): Promise<void> {
  const { error } = await supabase
    .from("favorites")
    .upsert({ user_id: userId, car_id: carId }, { onConflict: "user_id,car_id" });
  if (error) throw new Error(`Could not save this car: ${error.message}`);
}

export async function removeFavorite(userId: string, carId: string): Promise<void> {
  const { error } = await supabase
    .from("favorites")
    .delete()
    .eq("user_id", userId)
    .eq("car_id", carId);
  if (error) throw new Error(`Could not remove this car: ${error.message}`);
}

/** Moves guest favorites into the account, then clears local storage. */
export async function mergeLocalFavorites(userId: string): Promise<void> {
  const local = readLocalFavorites();
  if (local.length === 0) return;
  const { error } = await supabase
    .from("favorites")
    .upsert(
      local.map((car_id) => ({ user_id: userId, car_id })),
      { onConflict: "user_id,car_id" },
    );
  if (!error) writeLocalFavorites([]);
}
