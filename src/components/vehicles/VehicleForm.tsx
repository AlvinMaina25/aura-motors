import { Loader2, Upload, X } from "lucide-react";
import { type ReactNode, useRef, useState } from "react";

import { supabase } from "@/integrations/supabase/client";
import type { BodyStyle, FuelType, Transmission, Vehicle, VehicleStatus } from "@/data/types";

export interface VehicleFormValues {
  make: string;
  model: string;
  trim: string;
  year: number;
  price: number;
  mileage: number;
  bodyStyle: BodyStyle;
  fuel: FuelType;
  transmission: Transmission;
  engine: string;
  horsepower: number;
  zeroToSixty: number;
  drivetrain: string;
  exteriorColor: string;
  interiorColor: string;
  location: string;
  vin: string;
  status: VehicleStatus;
  featured: boolean;
  badge: string;
  description: string;
  highlights: string[];
  images: string[];
}

export const emptyVehicleForm: VehicleFormValues = {
  make: "",
  model: "",
  trim: "",
  year: new Date().getFullYear(),
  price: 50000,
  mileage: 0,
  bodyStyle: "Sedan",
  fuel: "Petrol",
  transmission: "Automatic",
  engine: "",
  horsepower: 0,
  zeroToSixty: 0,
  drivetrain: "All-wheel drive",
  exteriorColor: "",
  interiorColor: "",
  location: "Nairobi Showroom",
  vin: "",
  status: "available",
  featured: false,
  badge: "",
  description: "",
  highlights: [],
  images: [],
};

/** Converts form state into a payload safe for exactOptionalPropertyTypes — omits `badge` entirely when blank. */
export function vehicleFormToPayload(
  values: VehicleFormValues,
): Omit<VehicleFormValues, "badge"> & { badge?: string } {
  const { badge, ...rest } = values;
  return badge ? { ...rest, badge } : { ...rest };
}

export function vehicleToForm(vehicle: Vehicle): VehicleFormValues {
  return {
    make: vehicle.make,
    model: vehicle.model,
    trim: vehicle.trim,
    year: vehicle.year,
    price: vehicle.price,
    mileage: vehicle.mileage,
    bodyStyle: vehicle.bodyStyle,
    fuel: vehicle.fuel,
    transmission: vehicle.transmission,
    engine: vehicle.engine,
    horsepower: vehicle.horsepower,
    zeroToSixty: vehicle.zeroToSixty,
    drivetrain: vehicle.drivetrain,
    exteriorColor: vehicle.exteriorColor,
    interiorColor: vehicle.interiorColor,
    location: vehicle.location,
    vin: vehicle.vin,
    status: vehicle.status,
    featured: vehicle.featured,
    badge: vehicle.badge ?? "",
    description: vehicle.description,
    highlights: vehicle.highlights,
    images: vehicle.images,
  };
}

const bodyStyles: BodyStyle[] = ["Coupe", "Sedan", "SUV", "Convertible", "Grand Tourer"];
const fuels: FuelType[] = ["Petrol", "Hybrid", "Electric"];
const transmissions: Transmission[] = ["Automatic", "Manual"];
const statuses: VehicleStatus[] = ["available", "reserved", "sold"];

const VEHICLE_IMAGES_BUCKET = "vehicle-images";
const MAX_IMAGE_BYTES = 5 * 1024 * 1024; // 5MB
const MIN_IMAGES_PER_LISTING = 3;
const MAX_IMAGES_PER_LISTING = 8;
const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png"];

export function VehicleForm({
  initial,
  onSubmit,
  submitLabel,
  pending,
  mode = "admin",
}: {
  initial: VehicleFormValues;
  onSubmit: (values: VehicleFormValues) => void;
  submitLabel: string;
  pending: boolean;
  /** "seller" hides admin-only curation controls (status, badge, featured) and shows a review notice. */
  mode?: "admin" | "seller";
}) {
  const [form, setForm] = useState<VehicleFormValues>(initial);
  const [highlightsText, setHighlightsText] = useState(initial.highlights.join("\n"));
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const removeImage = (src: string) => {
    setForm((current) => ({ ...current, images: current.images.filter((img) => img !== src) }));
  };

  const handleFiles = async (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;
    setUploadError(null);

    const files = Array.from(fileList);
    const remainingSlots = MAX_IMAGES_PER_LISTING - form.images.length;

    if (remainingSlots <= 0) {
      setUploadError(`You can add up to ${MAX_IMAGES_PER_LISTING} photos per listing.`);
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    const candidates = files.slice(0, remainingSlots);
    const skippedForCount = files.length - candidates.length;

    const valid = candidates.filter(
      (file) => ALLOWED_IMAGE_TYPES.includes(file.type) && file.size <= MAX_IMAGE_BYTES,
    );
    const skippedForValidity = candidates.length - valid.length;

    const messages: string[] = [];
    if (skippedForValidity > 0) {
      messages.push(
        `${skippedForValidity} file(s) skipped — photos must be JPEG or PNG and under 5MB.`,
      );
    }
    if (skippedForCount > 0) {
      messages.push(
        `${skippedForCount} file(s) skipped — ${MAX_IMAGES_PER_LISTING} photo max per listing.`,
      );
    }
    if (messages.length > 0) setUploadError(messages.join(" "));

    if (valid.length === 0) {
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    setUploading(true);
    try {
      const { data: auth, error: authErr } = await supabase.auth.getUser();
      if (authErr || !auth.user) throw new Error("Please sign in to upload photos.");
      const uploadedUrls: string[] = [];
      for (const file of valid) {
        const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
        const path = `${auth.user.id}/${crypto.randomUUID()}.${ext}`;
        const { error: uploadErr } = await supabase.storage
          .from(VEHICLE_IMAGES_BUCKET)
          .upload(path, file, { contentType: file.type, upsert: false });
        if (uploadErr) throw uploadErr;
        const { data } = supabase.storage.from(VEHICLE_IMAGES_BUCKET).getPublicUrl(path);
        uploadedUrls.push(data.publicUrl);
      }
      setForm((current) => ({ ...current, images: [...current.images, ...uploadedUrls] }));
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : "Upload failed. Please try again.");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  return (
    <form
      className="space-y-8"
      onSubmit={(e) => {
        e.preventDefault();
        if (form.images.length < MIN_IMAGES_PER_LISTING) {
          setFormError(
            `Add at least ${MIN_IMAGES_PER_LISTING} photos before publishing this listing — ${form.images.length} added so far.`,
          );
          return;
        }
        setFormError(null);
        onSubmit({
          ...form,
          highlights: highlightsText
            .split("\n")
            .map((line) => line.trim())
            .filter(Boolean),
        });
      }}
    >
      <section>
        <h2 className="font-grotesk text-lg font-semibold">Overview</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          <Field label="Make">
            <input
              required
              className="field"
              value={form.make}
              onChange={(e) => setForm({ ...form, make: e.target.value })}
            />
          </Field>
          <Field label="Model">
            <input
              required
              className="field"
              value={form.model}
              onChange={(e) => setForm({ ...form, model: e.target.value })}
            />
          </Field>
          <Field label="Trim">
            <input
              required
              className="field"
              value={form.trim}
              onChange={(e) => setForm({ ...form, trim: e.target.value })}
            />
          </Field>
          <Field label="Year">
            <input
              required
              type="number"
              className="field"
              value={form.year}
              onChange={(e) => setForm({ ...form, year: Number(e.target.value) })}
            />
          </Field>
          <Field label="Price (KES)">
            <input
              required
              type="number"
              min={0}
              step={1000}
              className="field"
              value={form.price}
              onChange={(e) => setForm({ ...form, price: Number(e.target.value) })}
            />
          </Field>
          <Field label="Mileage">
            <input
              required
              type="number"
              className="field"
              value={form.mileage}
              onChange={(e) => setForm({ ...form, mileage: Number(e.target.value) })}
            />
          </Field>
        </div>
      </section>

      <section>
        <h2 className="font-grotesk text-lg font-semibold">Specification</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          <Field label="Body style">
            <select
              className="field appearance-none bg-brand"
              value={form.bodyStyle}
              onChange={(e) => setForm({ ...form, bodyStyle: e.target.value as BodyStyle })}
            >
              {bodyStyles.map((style) => (
                <option key={style}>{style}</option>
              ))}
            </select>
          </Field>
          <Field label="Fuel">
            <select
              className="field appearance-none bg-brand"
              value={form.fuel}
              onChange={(e) => setForm({ ...form, fuel: e.target.value as FuelType })}
            >
              {fuels.map((fuel) => (
                <option key={fuel}>{fuel}</option>
              ))}
            </select>
          </Field>
          <Field label="Transmission">
            <select
              className="field appearance-none bg-brand"
              value={form.transmission}
              onChange={(e) => setForm({ ...form, transmission: e.target.value as Transmission })}
            >
              {transmissions.map((t) => (
                <option key={t}>{t}</option>
              ))}
            </select>
          </Field>
          <Field label="Engine">
            <input
              required
              className="field"
              value={form.engine}
              onChange={(e) => setForm({ ...form, engine: e.target.value })}
            />
          </Field>
          <Field label="Horsepower">
            <input
              required
              type="number"
              className="field"
              value={form.horsepower}
              onChange={(e) => setForm({ ...form, horsepower: Number(e.target.value) })}
            />
          </Field>
          <Field label="0–60 mph (s)">
            <input
              required
              type="number"
              step="0.1"
              className="field"
              value={form.zeroToSixty}
              onChange={(e) => setForm({ ...form, zeroToSixty: Number(e.target.value) })}
            />
          </Field>
          <Field label="Drivetrain">
            <input
              required
              className="field"
              value={form.drivetrain}
              onChange={(e) => setForm({ ...form, drivetrain: e.target.value })}
            />
          </Field>
          <Field label="Exterior color">
            <input
              required
              className="field"
              value={form.exteriorColor}
              onChange={(e) => setForm({ ...form, exteriorColor: e.target.value })}
            />
          </Field>
          <Field label="Interior color">
            <input
              required
              className="field"
              value={form.interiorColor}
              onChange={(e) => setForm({ ...form, interiorColor: e.target.value })}
            />
          </Field>
          <Field label="Location">
            <input
              required
              className="field"
              value={form.location}
              onChange={(e) => setForm({ ...form, location: e.target.value })}
            />
          </Field>
          <Field label="VIN">
            <input
              required
              className="field"
              value={form.vin}
              onChange={(e) => setForm({ ...form, vin: e.target.value })}
            />
          </Field>
          {mode === "admin" && (
            <Field label="Status">
              <select
                className="field appearance-none bg-brand"
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value as VehicleStatus })}
              >
                {statuses.map((status) => (
                  <option key={status} value={status} className="capitalize">
                    {status}
                  </option>
                ))}
              </select>
            </Field>
          )}
        </div>
      </section>

      <section>
        <h2 className="font-grotesk text-lg font-semibold">Listing content</h2>
        {mode === "seller" && (
          <p className="mt-1 text-sm text-mist">
            Your listing will be reviewed by our team before it appears publicly. This usually takes
            less than a day.
          </p>
        )}
        {mode === "admin" && (
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <Field label="Badge (optional)">
              <input
                className="field"
                placeholder="e.g. Flagship"
                value={form.badge}
                onChange={(e) => setForm({ ...form, badge: e.target.value })}
              />
            </Field>
            <label className="flex items-center gap-2 self-end pb-2.5 text-sm text-mist">
              <input
                type="checkbox"
                checked={form.featured}
                onChange={(e) => setForm({ ...form, featured: e.target.checked })}
                className="size-4 rounded border-border accent-accent"
              />
              Feature on homepage
            </label>
          </div>
        )}
        <div className="mt-4">
          <Field label="Description">
            <textarea
              required
              rows={4}
              className="field resize-none"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </Field>
        </div>
        <div className="mt-4">
          <Field label="Highlights (one per line)">
            <textarea
              rows={4}
              className="field resize-none"
              value={highlightsText}
              onChange={(e) => setHighlightsText(e.target.value)}
            />
          </Field>
        </div>
      </section>

      <section>
        <h2 className="font-grotesk text-lg font-semibold">Gallery</h2>
        <p className="mt-1 text-sm text-mist">
          Upload real photos of this car. {form.images.length}/{MAX_IMAGES_PER_LISTING} added —
          minimum {MIN_IMAGES_PER_LISTING} required. JPEG or PNG, up to 5MB each. First photo is the
          cover image.
        </p>

        {form.images.length > 0 && (
          <div className="mt-4 grid grid-cols-3 gap-3 sm:grid-cols-4 lg:grid-cols-6">
            {form.images.map((src, index) => (
              <div key={src + index} className="group relative overflow-hidden rounded-xl">
                <img
                  src={src}
                  alt=""
                  className="aspect-[4/3] w-full object-cover"
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = "/placeholder-vehicle.svg";
                  }}
                />
                <button
                  type="button"
                  onClick={() => removeImage(src)}
                  aria-label="Remove photo"
                  className="absolute top-1.5 right-1.5 grid size-6 place-items-center rounded-full bg-brand/80 text-foreground opacity-0 transition group-hover:opacity-100"
                >
                  <X className="size-3.5" />
                </button>
                {index === 0 && (
                  <span className="absolute bottom-1.5 left-1.5 rounded-full bg-accent/90 px-2 py-0.5 text-[10px] font-semibold text-accent-foreground">
                    Cover
                  </span>
                )}
              </div>
            ))}
          </div>
        )}

        <div className="mt-4">
          <label
            className={`flex items-center justify-center gap-2 rounded-xl border border-dashed border-border px-4 py-6 text-sm text-mist transition hover:border-accent hover:text-foreground ${
              uploading || form.images.length >= MAX_IMAGES_PER_LISTING
                ? "pointer-events-none opacity-60"
                : "cursor-pointer"
            }`}
          >
            {uploading ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Uploading…
              </>
            ) : (
              <>
                <Upload className="size-4" />
                {form.images.length >= MAX_IMAGES_PER_LISTING
                  ? "Photo limit reached"
                  : "Click to upload photos"}
              </>
            )}
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/jpeg,image/png"
              className="hidden"
              disabled={uploading || form.images.length >= MAX_IMAGES_PER_LISTING}
              onChange={(e) => handleFiles(e.target.files)}
            />
          </label>
          {uploadError && <p className="mt-2 text-sm text-destructive">{uploadError}</p>}
        </div>
      </section>

      {formError && <p className="text-sm text-destructive">{formError}</p>}
      <button type="submit" disabled={pending || uploading} className="btn-accent">
        {pending ? "Saving…" : submitLabel}
      </button>
    </form>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <label className="label-xs mb-1.5 block">{label}</label>
      {children}
    </div>
  );
}
