"use client";

import { useRef } from "react";
import { Check, ChevronRight, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { SHEET_SELECT_CONTENT_PROPS } from "./constants";
import { ApiRequiredNotice } from "./ApiRequiredNotice";
import type { RoomImageTypeOption } from "./Step4Images";
import type { ModalTranslate } from "./types";

const VALID_TYPES = ["image/png", "image/jpeg", "image/jpg"];
const MAX_BYTES = 5 * 1024 * 1024;
const MIN_KB = 100;

export interface RoomImageDraft {
  images: string;
  image_type: string;
  descriptions: string;
}

export interface RoomImageUploadPanelProps {
  mode: "add" | "edit";
  draft: RoomImageDraft;
  t: ModalTranslate;
  isSaving?: boolean;
  hasImageTypeApi: boolean;
  imageTypeOptions: RoomImageTypeOption[];
  selectedFileSizeBytes: number | null;
  onDraftChange: (patch: Partial<RoomImageDraft>) => void;
  onFileSelected: (file: File) => void;
  onSave: () => void;
  onBack: () => void;
}

function RequirementRow({ met, label }: { met: boolean; label: string }) {
  return (
    <div className="flex items-center gap-2.5">
      <div
        className={cn(
          "flex h-5 w-5 shrink-0 items-center justify-center rounded-full",
          met ? "bg-primary" : "bg-muted-foreground/25"
        )}
      >
        {met && <Check className="h-3 w-3 text-primary-foreground stroke-[3]" />}
      </div>
      <span className={cn("text-sm leading-snug", met ? "text-primary font-medium" : "text-muted-foreground")}>
        {label}
      </span>
    </div>
  );
}

export function RoomImageUploadPanel({
  mode,
  draft,
  t,
  isSaving = false,
  hasImageTypeApi,
  imageTypeOptions,
  selectedFileSizeBytes,
  onDraftChange,
  onFileSelected,
  onSave,
  onBack,
}: RoomImageUploadPanelProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const hasPreview = Boolean(draft.images?.startsWith("data:image/") || draft.images?.startsWith("http"));
  const hasType = Boolean(draft.image_type?.trim());
  const formatOk = hasPreview;
  const minSizeOk =
    selectedFileSizeBytes != null
      ? selectedFileSizeBytes / 1024 >= MIN_KB
      : mode === "edit" && hasPreview;
  const canSave = hasPreview && minSizeOk && (hasImageTypeApi ? hasType : true);

  return (
    <div className="flex h-full min-h-0 w-full flex-col">
      <div className="flex shrink-0 items-center justify-between border-b border-border px-4 py-4">
        <h3 className="text-lg font-semibold">
          {mode === "add" ? t("addImageTitle") : t("editImageTitle")}
        </h3>
        <button
          type="button"
          onClick={onBack}
          className="rounded-md p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          aria-label={t("panelBack")}
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png"
        className="hidden"
        onChange={e => {
          const file = e.target.files?.[0];
          if (file) onFileSelected(file);
          e.target.value = "";
        }}
      />

      <div className="flex-1 min-h-0 overflow-y-auto px-5 py-5 space-y-4">
        <div className="rounded-xl bg-muted/40 px-4 py-3.5 space-y-3">
          <RequirementRow met={formatOk} label={t("uploadConstraint2")} />
          <RequirementRow met={minSizeOk} label={t("uploadConstraint4")} />
        </div>

        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="relative mx-auto flex aspect-square w-full max-w-[280px] items-center justify-center overflow-hidden rounded-xl border-2 border-primary/40 bg-primary/5 transition-colors hover:border-primary hover:bg-primary/10"
        >
          {hasPreview ? (
            <img src={draft.images} alt="" className="absolute inset-0 h-full w-full object-cover" />
          ) : (
            <Upload className="h-10 w-10 text-primary/50" />
          )}
        </button>

        {hasImageTypeApi ? (
          <div className="space-y-1.5">
            <Label className="text-sm font-medium">
              {t("label_imageType")} <span className="text-red">*</span>
            </Label>
            <Select
              value={draft.image_type || undefined}
              onValueChange={v => onDraftChange({ image_type: v })}
            >
              <SelectTrigger className="h-11 rounded-xl">
                <SelectValue placeholder={t("placeholder_imageType")} />
              </SelectTrigger>
              <SelectContent {...SHEET_SELECT_CONTENT_PROPS}>
                {imageTypeOptions.map(opt => (
                  <SelectItem key={opt.id} value={String(opt.id)}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        ) : (
          <div className="space-y-1.5">
            <Label className="text-sm font-medium text-muted-foreground">{t("label_imageType")}</Label>
            <ApiRequiredNotice message={t("apiRequiredImageType")} />
          </div>
        )}

        <div className="flex gap-3 pt-2">
          <Button
            type="button"
            variant="outline"
            className="flex-1 h-11 rounded-xl"
            onClick={() => fileInputRef.current?.click()}
            disabled={isSaving}
          >
            {t("replaceImage")}
          </Button>
          <Button
            type="button"
            className="flex-1 h-11 rounded-xl bg-primary-gradient shadow-sm"
            onClick={onSave}
            disabled={isSaving || !canSave}
          >
            {t("panelSave")}
          </Button>
        </div>
      </div>
    </div>
  );
}

export function validateRoomImageFile(file: File): string | null {
  if (!VALID_TYPES.includes(file.type)) {
    return "Зөвхөн JPG/PNG форматтай зураг оруулна уу.";
  }
  if (file.size / 1024 < MIN_KB) {
    return "Зургийн хэмжээ 100KB-аас доошгүй байх ёстой.";
  }
  if (file.size > MAX_BYTES) {
    return "Зургийн хэмжээ 5MB-аас хэтрэхгүй байх ёстой.";
  }
  return null;
}
