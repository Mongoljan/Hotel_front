"use client";

import { CheckCircle2, ImageIcon, Star, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { inlineIconClass } from "./formStyles";
import { ApiRequiredNotice } from "./ApiRequiredNotice";
import type { FieldArrayWithId } from "react-hook-form";
import type { FormFields, ModalTranslate } from "./types";

export interface RoomImageTypeOption {
  id: number;
  label: string;
}

export interface Step4ImagesProps {
  t: ModalTranslate;
  imageFields: FieldArrayWithId<FormFields, "entries", "id">[];
  getImageValue: (idx: number) => string;
  getImageType: (idx: number) => string;
  getIsProfile: (idx: number) => boolean;
  imageTypeOptions: RoomImageTypeOption[];
  hasImageTypeApi: boolean;
  hasProfileImageApi: boolean;
  onOpenAddPanel: () => void;
  onOpenEditPanel: (idx: number) => void;
  onRemoveImage: (idx: number) => void;
  onSetProfile: (idx: number) => void;
}

function RequirementRow({ met, label }: { met: boolean; label: string }) {
  return (
    <div className="flex items-center gap-2.5">
      <CheckCircle2
        className={cn(inlineIconClass, met ? "text-theme-secondary" : "text-muted-foreground/35")}
      />
      <span className={cn("text-sm leading-snug", met ? "text-foreground" : "text-muted-foreground")}>
        {label}
      </span>
    </div>
  );
}

export function Step4Images({
  t,
  imageFields,
  getImageValue,
  getImageType,
  getIsProfile,
  imageTypeOptions,
  hasImageTypeApi,
  hasProfileImageApi,
  onOpenAddPanel,
  onOpenEditPanel,
  onRemoveImage,
  onSetProfile,
}: Step4ImagesProps) {
  const typeLabelById = Object.fromEntries(imageTypeOptions.map(o => [String(o.id), o.label]));

  const hasMinImages = imageFields.some((_, i) => {
    const v = getImageValue(i);
    return v && (v.startsWith("http") || v.startsWith("data:image/"));
  });

  const hasProfileSelected = imageFields.some((_, i) => {
    const v = getImageValue(i);
    const valid = v && (v.startsWith("http") || v.startsWith("data:image/"));
    return valid && getIsProfile(i);
  });

  const filledImages = imageFields
    .map((field, idx) => ({
      field,
      idx,
      src: getImageValue(idx),
      type: getImageType(idx),
      isProfile: getIsProfile(idx),
    }))
    .filter(item => item.src && (item.src.startsWith("http") || item.src.startsWith("data:image/")));

  return (
    <div className="px-5 py-5 space-y-4">
      <p className="text-sm text-muted-foreground">{t("uploadHint")}</p>

      <div className="rounded-xl bg-muted/40 px-4 py-3.5 space-y-3">
        <RequirementRow met={hasMinImages} label={t("uploadConstraint1")} />
        <RequirementRow met={hasProfileSelected} label={t("uploadConstraint3")} />
        <RequirementRow met label={t("uploadConstraint2")} />
        <RequirementRow met label={t("uploadConstraint4")} />
        {!hasProfileImageApi && (
          <ApiRequiredNotice message={t("apiRequiredProfile")} />
        )}
        {!hasImageTypeApi && (
          <ApiRequiredNotice message={t("apiRequiredImageType")} />
        )}
      </div>

      <div className="grid grid-cols-3 gap-3">
        <button
          type="button"
          onClick={onOpenAddPanel}
          className="flex aspect-square flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-primary/40 bg-primary/5 text-primary transition-colors hover:border-primary hover:bg-primary/10"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
            <ImageIcon className={inlineIconClass} />
          </div>
          <span className="text-sm font-medium leading-tight px-2 text-center">{t("uploadBtn")}</span>
        </button>

        {filledImages.map(({ field, idx, src, type, isProfile }) => (
          <div
            key={field.id}
            className={cn(
              "group relative aspect-square overflow-hidden rounded-xl border transition-colors",
              isProfile ? "border-primary ring-2 ring-primary ring-offset-2" : "border-border"
            )}
          >
            <button type="button" onClick={() => onOpenEditPanel(idx)} className="absolute inset-0 z-0">
              <img src={src} alt="Room" className="h-full w-full object-cover" />
            </button>

            <button
              type="button"
              onClick={e => {
                e.stopPropagation();
                if (!isProfile) onSetProfile(idx);
              }}
              className={cn(
                "group/star absolute top-1.5 left-1.5 z-10 rounded-full p-1.5 shadow transition-all",
                isProfile
                  ? "bg-warning text-warning-foreground"
                  : "bg-white/90 text-muted-foreground hover:bg-white"
              )}
              aria-label={!isProfile ? t("setAsProfile") : undefined}
            >
              <Star className={cn("h-3.5 w-3.5", isProfile && "fill-current")} />
              {!isProfile && (
                <span className="pointer-events-none absolute left-full top-1/2 z-30 ml-1.5 -translate-y-1/2 whitespace-nowrap rounded-md bg-black/80 px-2 py-0.5 text-xs font-medium text-white opacity-0 transition-opacity group-hover/star:opacity-100">
                  {t("setAsProfile")}
                </span>
              )}
            </button>

            {hasImageTypeApi && type && (
              <span className="absolute bottom-1.5 left-1.5 z-10 rounded-md bg-black/60 px-2 py-0.5 text-xs text-white">
                {typeLabelById[type] ?? t("label_imageType")}
              </span>
            )}

            <button
              type="button"
              onClick={e => {
                e.stopPropagation();
                onRemoveImage(idx);
              }}
              className="absolute top-1.5 right-1.5 z-10 rounded-full bg-black/55 p-1 text-white opacity-0 shadow transition-opacity group-hover:opacity-100 hover:bg-black/75"
            >
              <X className={inlineIconClass} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
