"use client";

import { Button } from "@/components/ui/button";
import type { ModalTranslate } from "./types";

export interface RoomModalFooterProps {
  step: number;
  addToGroupMode: boolean;
  isActualEdit: boolean;
  isSubmitting: boolean;
  onClose: () => void;
  onBack: () => void;
  onNext: () => void;
  onFinish: () => void;
  t: ModalTranslate;
}

export function RoomModalFooter({
  step,
  addToGroupMode,
  isActualEdit,
  isSubmitting,
  onClose,
  onBack,
  onNext,
  onFinish,
  t,
}: RoomModalFooterProps) {
  return (
    <div className="border-t border-border px-5 py-4 flex gap-3">
      {step === 1 || addToGroupMode ? (
        <Button variant="outline" className="flex-1 h-10 text-sm" type="button" onClick={onClose}>
          {addToGroupMode ? t("cancel") : t("close")}
        </Button>
      ) : (
        <Button variant="outline" className="flex-1 h-10 text-sm" type="button" onClick={onBack}>
          {t("back")}
        </Button>
      )}

      {addToGroupMode ? (
        <Button
          type="button"
          className="flex-1 h-10 text-sm bg-theme-secondary-gradient shadow-sm"
          disabled={isSubmitting}
          onClick={onFinish}
        >
          {isSubmitting ? "..." : t("save")}
        </Button>
      ) : step < 4 ? (
        <Button
          type="button"
          className="flex-1 h-10 text-sm bg-primary-gradient shadow-sm"
          onClick={onNext}
        >
          {t("next")}
        </Button>
      ) : (
        <Button
          type="button"
          className="flex-1 h-10 text-sm bg-theme-secondary-gradient shadow-sm"
          disabled={isSubmitting}
          onClick={onFinish}
        >
          {isSubmitting
            ? isActualEdit
              ? "Хадгалж байна..."
              : "Бүртгэж байна..."
            : isActualEdit
              ? t("save")
              : t("finish")}
        </Button>
      )}
    </div>
  );
}
