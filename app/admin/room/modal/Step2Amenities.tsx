"use client";

import type { UseFormRegister } from "react-hook-form";
import { ChevronRight, Plus } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { fieldErrorTextClass, sectionHeaderTextClass, sectionHeaderIconClass, inlineIconClass } from "./formStyles";
import type { FormFields, AmenityKey, ModalTranslate, ValidationTranslate } from "./types";

export interface AmenityDef {
  key: AmenityKey;
  label: string;
  required: boolean;
  icon: LucideIcon;
}

export interface Step2AmenitiesProps {
  register: UseFormRegister<FormFields>;
  t: ModalTranslate;
  tv: ValidationTranslate;
  amenityDefs: AmenityDef[];
  getSelectedCount: (key: AmenityKey) => number;
  setActivePanel: (key: AmenityKey) => void;
  showStepErrors: boolean;
}

export function Step2Amenities({
  register,
  t,
  tv,
  amenityDefs,
  getSelectedCount,
  setActivePanel,
  showStepErrors,
}: Step2AmenitiesProps) {
  return (
    <div className="px-5 py-5 space-y-3">
      {amenityDefs.map(({ key, label, required, icon: AmenityIcon }) => {
        const count = getSelectedCount(key);
        const isRequired = required;
        const isMissing = isRequired && count === 0;
        const showError = showStepErrors && isMissing;
        return (
          <div key={key} className="space-y-1">
            <button
              type="button"
              onClick={() => setActivePanel(key)}
              className={cn(
                "w-full flex items-center justify-between rounded-xl border p-4 text-left transition-colors hover:bg-muted/20",
                showError ? "border-red bg-red/5" : count > 0 ? "border-primary/30 bg-primary/10" : "border-border"
              )}
            >
              <div className="flex items-center gap-3 min-w-0">
                <div
                  className={cn(
                    "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border",
                    showError ? "border-red bg-red/5" : count > 0 ? "border-primary/30 bg-primary/15" : "border-border bg-muted/20"
                  )}
                >
                  <AmenityIcon className={cn("h-5 w-5", showError ? "text-red" : "text-primary")} />
                </div>
                <span className={cn("text-sm font-medium", showError ? "text-red" : "")}>
                  {label} {isRequired ? "*" : ""}
                </span>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {count > 0 && (
                  <span className="text-sm text-muted-foreground">{count} сонгосон</span>
                )}
                <ChevronRight className={cn(inlineIconClass, "text-muted-foreground")} />
              </div>
            </button>
            {showError && (
              <p className={fieldErrorTextClass()}>{tv("facility_required")}</p>
            )}
          </div>
        );
      })}

      {/* Description */}
      <div className="rounded-xl border border-border overflow-hidden mt-4">
        <div className="flex items-center gap-2 bg-muted/30 px-4 py-2.5">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-border bg-background">
            <Plus className={cn(sectionHeaderIconClass, "text-primary")} />
          </div>
          <span className={sectionHeaderTextClass()}>{t("label_description")}</span>
        </div>
        <div className="p-4">
          <Textarea
            {...register("room_Description")}
            placeholder={t("placeholder_description")}
            rows={4}
            className="resize-none text-sm"
          />
        </div>
      </div>
    </div>
  );
}
