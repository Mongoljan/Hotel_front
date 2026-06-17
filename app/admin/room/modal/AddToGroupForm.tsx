"use client";

import { Minus, Plus, AlertTriangle } from "lucide-react";
import type { UseFormRegister, UseFormSetValue, UseFormWatch } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import type { RoomData, AllData } from "../_lib/types";
import { fieldLabelClass, fieldBorderClass, fieldErrorTextClass, inlineIconClass, sectionHeaderIconClass } from "./formStyles";
import type { FormFields, ModalTranslate, ValidationTranslate } from "./types";

export interface AddToGroupFormProps {
  t: ModalTranslate;
  tv: ValidationTranslate;
  roomToEdit: RoomData;
  lookup: AllData | null;
  register: UseFormRegister<FormFields>;
  watch: UseFormWatch<FormFields>;
  setValue: UseFormSetValue<FormFields>;
  roomNumbers: string[];
  updateRoomNum: (idx: number, val: string) => void;
  showStepErrors: boolean;
  getRoomNumberError?: (index: number, value: string) => string | null;
}

export function AddToGroupForm({
  t,
  tv,
  roomToEdit,
  lookup,
  register,
  watch,
  setValue,
  roomNumbers,
  updateRoomNum,
  showStepErrors,
  getRoomNumberError,
}: AddToGroupFormProps) {
  const roomNoHasError = showStepErrors && roomNumbers.some(n => !n.trim());
  const hasDuplicate = roomNumbers.some((num, i) => Boolean(getRoomNumberError?.(i, num)));

  return (
    <div className="px-5 py-6 space-y-5">
      <div className="rounded-lg border border-border p-4 bg-muted/20">
        <p className="text-sm font-medium">{t("label_sellCount")}</p>
        <p className="text-sm text-muted-foreground mt-1">
          {lookup?.room_category?.find(c => c.id === roomToEdit.room_category)?.name_en ?? "—"}
          {" — "}
          {lookup?.room_types?.find(t2 => t2.id === roomToEdit.room_type)?.name ?? "—"}
        </p>
      </div>

      <div>
        <Label className={fieldLabelClass(false)}>{t("section_roomCount")}</Label>
        <div className="mt-3 flex items-center gap-3">
          <div className="rounded-lg border border-border p-4 flex-1">
            <p className={fieldLabelClass(false)}>{t("label_roomCount")}</p>
            <div className="flex items-center gap-2 mt-2">
              <button type="button" onClick={() => setValue("number_of_rooms", Math.max(0, (Number(watch("number_of_rooms")) || 0) - 1))} className="w-8 h-8 rounded-full border border-border flex items-center justify-center hover:bg-muted"><Minus className={inlineIconClass} /></button>
              <Input {...register("number_of_rooms", { valueAsNumber: true })} type="number" min={0} className="w-16 text-center h-9 text-sm" />
              <button type="button" onClick={() => setValue("number_of_rooms", (Number(watch("number_of_rooms")) || 0) + 1)} className="w-8 h-8 rounded-full border border-border flex items-center justify-center hover:bg-muted"><Plus className={inlineIconClass} /></button>
            </div>
          </div>
        </div>
      </div>

      <div>
        <Label className={fieldLabelClass(roomNoHasError)}>{t("section_roomCount")}</Label>
        <div className="mt-2 space-y-2">
          {roomNumbers.map((num, i) => {
            const roomNoMissing = showStepErrors && !num.trim();
            const roomNoDuplicate = getRoomNumberError?.(i, num) ?? null;
            const roomNoInvalid = roomNoMissing || !!roomNoDuplicate;
            return (
              <div key={i} className={cn("flex items-center gap-2 rounded-lg border px-3 py-2.5", roomNoInvalid ? "border-red" : "border-border")}>
                <span className={cn("text-sm whitespace-nowrap shrink-0 min-w-[5.5rem]", roomNoInvalid ? "text-red font-medium" : "text-muted-foreground")}>
                  {t("label_roomNo", { n: i + 1 })}
                </span>
                <Input
                  value={num}
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={5}
                  onChange={e => updateRoomNum(i, e.target.value)}
                  placeholder="—"
                  className={fieldBorderClass(roomNoInvalid, "h-9 w-[4.5rem] shrink-0 text-sm text-center tabular-nums px-2")}
                />
              </div>
            );
          })}
        </div>
        {roomNoHasError && (
          <p className={fieldErrorTextClass()}>{tv("room_no_required")}</p>
        )}
        {roomNumbers.map((num, i) => {
          const duplicateMsg = getRoomNumberError?.(i, num);
          if (!duplicateMsg) return null;
          return (
            <p key={`dup-${i}`} className={fieldErrorTextClass()}>{duplicateMsg}</p>
          );
        })}
        {showStepErrors && hasDuplicate && !roomNoHasError && (
          <p className={fieldErrorTextClass()}>{tv("enter_valid_room_numbers")}</p>
        )}
      </div>

      {/* Warning */}
      <div className="flex items-start gap-2 rounded-lg bg-status-warning-muted border border-status-warning/30 p-3">
        <AlertTriangle className={cn(sectionHeaderIconClass, "text-status-warning mt-0.5")} />
        <p className="text-sm text-status-warning">{t("warn_roomCount")}</p>
      </div>
    </div>
  );
}
