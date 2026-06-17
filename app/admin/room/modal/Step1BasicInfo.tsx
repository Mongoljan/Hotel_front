"use client";

import { Controller, type Control, type UseFormRegister, type UseFormSetValue, type UseFormWatch, type FieldArrayWithId } from "react-hook-form";
import { CheckCircle2, Minus, Plus, Lock } from "lucide-react";
import { IoPerson } from "react-icons/io5";
import { FaChild } from "react-icons/fa6";
import { LuBedDouble } from "react-icons/lu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { RoomTypePreset } from "../_lib/presets";
import type { AllData } from "../_lib/types";
import { AutoFillInfo } from "./AutoFillInfo";
import { SHEET_SELECT_CONTENT_PROPS } from "./constants";
import { fieldLabelClass, fieldBorderClass, fieldErrorTextClass, sectionHeaderTextClass, sectionHeaderIconClass, inlineIconClass, compactTextClass } from "./formStyles";
import type { FormFields, CombinedBedOption, ModalTranslate, ValidationTranslate } from "./types";

export interface Step1BasicInfoProps {
  control: Control<FormFields>;
  register: UseFormRegister<FormFields>;
  watch: UseFormWatch<FormFields>;
  setValue: UseFormSetValue<FormFields>;
  t: ModalTranslate;
  tv: ValidationTranslate;
  lookup: AllData | null;
  preset: RoomTypePreset;
  combinedBedOptions: CombinedBedOption[];
  bedFields: FieldArrayWithId<FormFields, "room_beds", "id">[];
  appendBed: (value: { bed_type: string; bed_size: string; quantity: number }) => void;
  removeBed: (index: number) => void;
  step1RoomTypeError: boolean;
  step1RoomCategoryError: boolean;
  step1RoomSizeError: boolean;
  step1AdultError: boolean;
  showStep1FieldError: (invalid: boolean) => boolean;
}

export function Step1BasicInfo({
  control,
  register,
  watch,
  setValue,
  t,
  tv,
  lookup,
  preset,
  combinedBedOptions,
  bedFields,
  appendBed,
  removeBed,
  step1RoomTypeError,
  step1RoomCategoryError,
  step1RoomSizeError,
  step1AdultError,
  showStep1FieldError,
}: Step1BasicInfoProps) {
  return (
    <div className="px-5 py-5 space-y-5">
      {/* ӨРӨӨНИЙ НЭР */}
      <div className="rounded-xl border border-border overflow-hidden">
        <div className="flex items-center gap-2 bg-muted/30 px-4 py-2.5">
          <CheckCircle2 className={cn(sectionHeaderIconClass, "text-primary")} />
          <span className={sectionHeaderTextClass()}>{t("section_name")}</span>
        </div>
        <div className="p-4 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            {/*
              Өрөөний ангилал = room classification by BED TYPE
              → form field: room_type, data source: room_types (Single Room, Twin Room…)
              → this drives the preset auto-fill logic (watchedRoomType = watch("room_type"))
            */}
            <div>
              <Label className={fieldLabelClass(step1RoomTypeError)}>{t("label_category")} *</Label>
              <Controller
                control={control}
                name="room_type"
                render={({ field }) => (
                  <Select value={field.value || undefined} onValueChange={field.onChange}>
                    <SelectTrigger className={fieldBorderClass(step1RoomTypeError, "mt-1 h-9")}>
                      <SelectValue placeholder="Сонгоно уу" />
                    </SelectTrigger>
                    <SelectContent {...SHEET_SELECT_CONTENT_PROPS}>
                      {(lookup?.room_types ?? []).map(rt => (
                        <SelectItem key={rt.id} value={String(rt.id)}>
                          {rt.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {step1RoomTypeError && (
                <p className={fieldErrorTextClass()}>{tv("room_type_required")}</p>
              )}
            </div>

            {/*
              Өрөөний төрөл = room QUALITY LEVEL
              → form field: room_category, data source: room_category (Standard, Superior…)
            */}
            <div>
              <Label className={fieldLabelClass(step1RoomCategoryError)}>{t("label_type")} *</Label>
              <Controller
                control={control}
                name="room_category"
                render={({ field }) => (
                  <Select value={field.value || undefined} onValueChange={field.onChange}>
                    <SelectTrigger className={fieldBorderClass(step1RoomCategoryError, "mt-1 h-9")}>
                      <SelectValue placeholder="Сонгоно уу" />
                    </SelectTrigger>
                    <SelectContent {...SHEET_SELECT_CONTENT_PROPS}>
                      {(lookup?.room_category ?? []).map(c => (
                        <SelectItem key={c.id} value={String(c.id)}>
                          {c.name_en}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {step1RoomCategoryError && (
                <p className={fieldErrorTextClass()}>{tv("room_category_required")}</p>
              )}
            </div>
          </div>

          {/* Short name — API шаардлагатай */}
          <div className="relative opacity-60">
            <div className="flex items-center justify-between">
              <Label className={fieldLabelClass(false)}>{t("label_shortName")}</Label>
              <span className={compactTextClass("flex items-center gap-1 bg-status-warning-muted text-status-warning border border-status-warning/40 px-1.5 py-0.5 rounded font-medium")}>
                <Lock className="h-3 w-3" />
                API шаардлагатай
              </span>
            </div>
            <Input
              {...register("room_short_name")}
              placeholder={t("placeholder_shortName")}
              disabled
              className="mt-1 h-9 cursor-not-allowed"
            />
            <p className={compactTextClass("text-muted-foreground/70 mt-1")}>{t("hint_shortName")}</p>
          </div>
        </div>
      </div>

      {/* БАГТААМЖ */}
      <div className="rounded-xl border border-border overflow-hidden">
        <div className="flex items-center gap-2 bg-muted/30 px-4 py-2.5">
          <IoPerson className={cn(sectionHeaderIconClass, "text-primary")} />
          <span className={sectionHeaderTextClass()}>{t("section_capacity")}</span>
        </div>
        <div className="p-4">
          <div className="grid grid-cols-3 gap-3">
            {/* Adult */}
            <div>
              <Label className={fieldLabelClass(step1AdultError)}>{t("label_adult")} *</Label>
              {!preset.manualMode && preset.defaultAdultQty > 0 ? (
                /* Preset type: show locked value with auto-fill indicator */
                <div className="mt-1 h-9 rounded-lg border border-border bg-muted/30 flex items-center gap-2 px-3">
                  <IoPerson className={cn(inlineIconClass, "text-primary")} />
                  <span className="text-sm font-semibold">{preset.defaultAdultQty}</span>
                  <AutoFillInfo text={t("hint_auto_adult")} />
                </div>
              ) : (
                /* Manual type: free dropdown */
                <Controller
                  control={control}
                  name="adultQty"
                  render={({ field }) => (
                    <Select value={field.value || undefined} onValueChange={field.onChange}>
                      <SelectTrigger className={fieldBorderClass(step1AdultError, "mt-1 h-9")}>
                        <SelectValue placeholder="Сонгоно уу">
                          <span className="flex items-center gap-1">
                            <IoPerson className={inlineIconClass} />{field.value || "0"}
                          </span>
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent {...SHEET_SELECT_CONTENT_PROPS}>
                        {[1,2,3,4,5,6,7,8].map(n => (
                          <SelectItem key={n} value={String(n)}>
                            <span className="flex items-center gap-1"><IoPerson className={inlineIconClass} />{n}</span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              )}
              {step1AdultError && (
                <p className={fieldErrorTextClass()}>{tv("adult_qty_required")}</p>
              )}
            </div>
            {/* Child */}
            <div>
              <Label className={fieldLabelClass(false)}>{t("label_child")}</Label>
              {!preset.manualMode ? (
                /* Preset type: child count locked to 0 (default) */
                <div className="mt-1 h-9 rounded-lg border border-border bg-muted/30 flex items-center gap-2 px-3">
                  <FaChild className={inlineIconClass} />
                  <span className="text-sm font-semibold">{preset.defaultChildQty}</span>
                  <AutoFillInfo text={t("hint_auto_child")} />
                </div>
              ) : (
                <Controller
                  control={control}
                  name="childQty"
                  render={({ field }) => (
                    <Select value={field.value || undefined} onValueChange={field.onChange}>
                      <SelectTrigger className="mt-1 h-9">
                        <SelectValue>
                          <span className="flex items-center gap-1">
                            <FaChild className={inlineIconClass} />{field.value || "0"}
                          </span>
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent {...SHEET_SELECT_CONTENT_PROPS}>
                        {[0,1,2,3,4,5,6,7,8].map(n => (
                          <SelectItem key={n} value={String(n)}>
                            <span className="flex items-center gap-1"><FaChild className={inlineIconClass} />{n}</span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              )}
            </div>
            {/* Room size */}
            <div>
              <Label className={fieldLabelClass(step1RoomSizeError)}>{t("label_size")} *</Label>
              <Input
                {...register("room_size")}
                type="number"
                min={1}
                step={0.5}
                placeholder="30"
                className={fieldBorderClass(step1RoomSizeError, "mt-1 h-9")}
              />
              {step1RoomSizeError && (
                <p className={fieldErrorTextClass()}>{tv("room_size_required")}</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ОРНЫ МЭДЭЭЛЭЛ */}
      <div className="rounded-xl border border-border overflow-hidden">
        <div className="flex items-center gap-2 bg-muted/30 px-4 py-2.5">
          <LuBedDouble className={cn(sectionHeaderIconClass, "text-primary")} />
          <span className={sectionHeaderTextClass()}>{t("section_beds")}</span>
        </div>
        <div className="p-4 space-y-3">
          {bedFields.map((field, idx) => {
            const currentBedType = watch(`room_beds.${idx}.bed_type`);
            const currentBedSize = watch(`room_beds.${idx}.bed_size`);
            const combinedVal = currentBedType && currentBedSize
              ? `${currentBedType}:${currentBedSize}` : "";
            const bedInvalid = !currentBedType || !currentBedSize;
            const showBedError = showStep1FieldError(bedInvalid);
            const lockedRow = !preset.manualMode ? preset.defaultBedRows[idx] : undefined;
            const lockedQuantity = lockedRow?.quantity;
            const isBedLocked = !!lockedRow && lockedRow.bedTypeId > 0;
            const isQuantityLocked = isBedLocked && lockedQuantity != null;
            const singleBedOption = isBedLocked && combinedBedOptions.length === 1;
            return (
              <div key={field.id} className="flex items-end gap-2">
                {/* Combined bed type + size dropdown */}
                <div className="flex-1">
                  <Label className={fieldLabelClass(showBedError)}>
                    {t("label_bedType")} {bedFields.length > 1 ? idx + 1 : ""} *
                  </Label>
                  {singleBedOption ? (
                    <div className="mt-1 h-9 rounded-lg border border-border bg-muted/30 flex items-center gap-2 px-3">
                      <LuBedDouble className={cn(inlineIconClass, "text-primary")} />
                      <span className="text-sm truncate">{combinedBedOptions[0].label}</span>
                      <AutoFillInfo text={t("hint_auto_bed")} />
                    </div>
                  ) : (
                    <Select
                      value={combinedVal || undefined}
                      onValueChange={v => {
                        const [btStr, bsStr] = v.split(":");
                        setValue(`room_beds.${idx}.bed_type`, btStr);
                        setValue(`room_beds.${idx}.bed_size`, bsStr);
                      }}
                    >
                      <SelectTrigger className={fieldBorderClass(showBedError, "mt-1 h-9")}>
                        <SelectValue placeholder="Орны төрөл сонгоно уу" />
                      </SelectTrigger>
                      <SelectContent {...SHEET_SELECT_CONTENT_PROPS}>
                        {combinedBedOptions.map(opt => (
                          <SelectItem key={opt.value} value={opt.value}>
                            {opt.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                  {showBedError && (
                    <p className={fieldErrorTextClass()}>{tv("bed_type_required")}</p>
                  )}
                </div>

                <span className="pb-2.5 text-sm text-muted-foreground shrink-0">×</span>

                {/* Quantity — locked for preset types, editable for manual types */}
                {isQuantityLocked ? (
                  <div className="flex items-center gap-1.5 pb-0.5">
                    <div className="h-9 min-w-[2.75rem] rounded-lg border border-border bg-muted/30 flex items-center justify-center px-3">
                      <span className="text-sm font-semibold tabular-nums">{lockedQuantity}</span>
                    </div>
                    <AutoFillInfo text={t("hint_auto_bed_count")} />
                  </div>
                ) : (
                  <div className="flex items-center gap-1 pb-0.5">
                    <button type="button"
                      onClick={() => setValue(`room_beds.${idx}.quantity`, Math.max(1, (watch(`room_beds.${idx}.quantity`) || 1) - 1))}
                      className="w-7 h-7 rounded-full border border-border flex items-center justify-center hover:bg-muted text-muted-foreground">
                      <Minus className={inlineIconClass} />
                    </button>
                    <span className="w-6 text-center text-sm font-medium tabular-nums">
                      {watch(`room_beds.${idx}.quantity`) || 1}
                    </span>
                    <button type="button"
                      onClick={() => setValue(`room_beds.${idx}.quantity`, (watch(`room_beds.${idx}.quantity`) || 1) + 1)}
                      className="w-7 h-7 rounded-full border border-border flex items-center justify-center hover:bg-muted text-muted-foreground">
                      <Plus className={inlineIconClass} />
                    </button>
                  </div>
                )}

                {preset.manualMode && idx === 0 && (
                  <button
                    type="button"
                    onClick={() => appendBed({ bed_type: "", bed_size: "", quantity: 1 })}
                    className="mb-0.5 w-8 h-8 shrink-0 rounded-full bg-primary text-primary-foreground flex items-center justify-center hover:bg-primary/90 shadow-sm"
                  >
                    <Plus className={inlineIconClass} />
                  </button>
                )}
                {preset.manualMode && idx > 0 && (
                  <button
                    type="button"
                    onClick={() => removeBed(idx)}
                    className="mb-0.5 w-8 h-8 shrink-0 rounded-full border border-border bg-muted/40 text-muted-foreground flex items-center justify-center hover:bg-muted hover:text-foreground"
                  >
                    <Minus className={inlineIconClass} />
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
