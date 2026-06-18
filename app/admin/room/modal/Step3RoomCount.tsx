"use client";

import { type UseFormRegister, type UseFormSetValue } from "react-hook-form";
import { CheckCircle2, AlertTriangle, X, Settings2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { fieldBorderClass, fieldErrorTextClass, sectionHeaderTextClass, sectionHeaderIconClass, inlineIconClass } from "./formStyles";
import { sanitizeRoomCountInput } from "./roomNumberInput";
import type { FormFields, ModalTranslate, ValidationTranslate } from "./types";

export interface Step3RoomCountProps {
  register: UseFormRegister<FormFields>;
  setValue: UseFormSetValue<FormFields>;
  t: ModalTranslate;
  tv: ValidationTranslate;
  roomCount: number;
  roomNumbers: string[];
  setRoomNumbers: React.Dispatch<React.SetStateAction<string[]>>;
  updateRoomNum: (idx: number, val: string) => void;
  onOpenRoomConfig: (roomIndex: number) => void;
  step3RoomCountError: boolean;
  showStep3FieldError: (invalid: boolean) => boolean;
  getRoomNumberError?: (index: number, value: string) => string | null;
}

export function Step3RoomCount({
  register,
  setValue,
  t,
  tv,
  roomCount,
  roomNumbers,
  setRoomNumbers,
  updateRoomNum,
  onOpenRoomConfig,
  step3RoomCountError,
  showStep3FieldError,
  getRoomNumberError,
}: Step3RoomCountProps) {
  const roomCountRegister = register("number_of_rooms", {
    valueAsNumber: true,
    setValueAs: (v) => {
      const s = sanitizeRoomCountInput(String(v ?? ""));
      return s === "" ? 0 : Number(s);
    },
  });

  return (
    <div className="flex min-h-full flex-col px-5 py-5">
      <div className="flex-1 space-y-5">
        <div className="rounded-xl border border-border overflow-hidden flex items-center justify-between p-4">
          <div className="flex items-center gap-2 bg-muted/30 px-4 py-2.5">
            <CheckCircle2 className={cn(sectionHeaderIconClass, "text-primary")} />
            <span className={sectionHeaderTextClass()}>{t("section_roomCount")}</span>
          </div>

          <div className="flex items-center gap-3 mt-1">
            <Input
              {...roomCountRegister}
              type="text"
              inputMode="numeric"
              maxLength={5}
              className={fieldBorderClass(step3RoomCountError, "h-9 w-[4.5rem] shrink-0 text-center tabular-nums")}
              placeholder="0"
              onChange={e => {
                e.target.value = sanitizeRoomCountInput(e.target.value);
                roomCountRegister.onChange(e);
              }}
            />
          </div>
          {step3RoomCountError && (
            <p className={fieldErrorTextClass()}>{tv("number_of_rooms_min")}</p>
          )}
        </div>

        {roomCount > 0 && (
          <>
            <div className="space-y-2">
              {roomNumbers.map((num, i) => {
                const roomNoMissing = showStep3FieldError(!num.trim());
                const roomNoDuplicate = getRoomNumberError?.(i, num) ?? null;
                const roomNoInvalid = roomNoMissing || !!roomNoDuplicate;
                return (
                  <div key={i} className="space-y-1">
                    <div
                      className={cn(
                        "flex items-center gap-2 rounded-lg border px-3 py-2.5",
                        roomNoInvalid ? "border-red" : "border-border"
                      )}
                    >
                      <span
                        className={cn(
                          "text-sm whitespace-nowrap shrink-0 min-w-[5.5rem]",
                          roomNoInvalid ? "text-red font-medium" : "text-muted-foreground"
                        )}
                      >
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
                      <button
                        type="button"
                        onClick={() => onOpenRoomConfig(i)}
                        className="ml-auto flex items-center gap-1.5 rounded-lg border border-border px-2.5 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:border-primary/40 hover:bg-primary/5 hover:text-primary"
                        title={t("roomConfigBtn")}
                      >
                        <Settings2 className={inlineIconClass} />
                        {t("roomConfigBtn")}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          const next = [...roomNumbers];
                          next.splice(i, 1);
                          setRoomNumbers(next);
                          setValue("number_of_rooms", Math.max(0, roomCount - 1));
                        }}
                        className="p-1 text-muted-foreground/40 hover:text-red"
                      >
                        <X className={inlineIconClass} />
                      </button>
                    </div>
                    {roomNoDuplicate && (
                      <p className={fieldErrorTextClass()}>{roomNoDuplicate}</p>
                    )}
                  </div>
                );
              })}
            </div>
            {showStep3FieldError(roomNumbers.some(n => !n.trim())) && (
              <p className={fieldErrorTextClass()}>{tv("room_no_required")}</p>
            )}
          </>
        )}
      </div>

      <div className="mt-6 flex items-start gap-2 rounded-lg bg-status-warning-muted border border-status-warning/30 p-3">
        <AlertTriangle className={cn(sectionHeaderIconClass, "text-status-warning mt-0.5")} />
        <p className="text-sm text-status-warning">{t("warn_roomCount")}</p>
      </div>
    </div>
  );
}
