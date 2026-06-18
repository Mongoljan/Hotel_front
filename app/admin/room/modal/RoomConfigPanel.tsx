"use client";

import { Cigarette, ChevronRight, Mountain, Wifi, Waves } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { inlineIconClass } from "./formStyles";
import { ApiRequiredNotice } from "./ApiRequiredNotice";
import type { ModalTranslate, RoomConfig } from "./types";

const TOGGLE_ITEMS = [
  { key: "smoking" as const, label: "Өрөөнд тамхи татах боломжтой эсэх", icon: Cigarette },
  { key: "wifi" as const, label: "Өрөө интернет холболтой эсэх", icon: Wifi },
  { key: "lakeView" as const, label: "Нуур луу харсан", icon: Waves },
  { key: "mountainView" as const, label: "Уул руу харсан", icon: Mountain },
];

export interface RoomConfigPanelProps {
  roomIndex: number;
  roomNumber: string;
  config: RoomConfig;
  t: ModalTranslate;
  onChange: (key: keyof RoomConfig, value: boolean) => void;
  onBack: () => void;
  onSave: () => void;
}

export function RoomConfigPanel({
  roomIndex,
  roomNumber,
  config,
  t,
  onChange,
  onBack,
  onSave,
}: RoomConfigPanelProps) {
  const title = roomNumber.trim()
    ? t("roomConfigTitleWithNo", { n: roomIndex + 1, no: roomNumber })
    : t("roomConfigTitle", { n: roomIndex + 1 });

  return (
    <div className="flex h-full min-h-0 w-full flex-col">
      <div className="flex shrink-0 items-center justify-between border-b border-border px-4 py-4">
        <h3 className="text-lg font-semibold leading-tight">{title}</h3>
        <button
          type="button"
          onClick={onBack}
          className="rounded-md p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          aria-label={t("panelBack")}
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto px-5 py-5 space-y-4">
        <ApiRequiredNotice message={t("apiRequiredRoomConfig")} />

        <div className="rounded-xl border border-border overflow-hidden">
          <div className="bg-muted/30 px-4 py-2.5">
            <span className="text-base font-semibold tracking-wide">{t("roomConfigSection")}</span>
          </div>
          <div className="space-y-1 p-4">
            {TOGGLE_ITEMS.map(({ key, label, icon: Icon }) => (
              <div key={key} className="flex items-center justify-between py-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Icon className={inlineIconClass} />
                  <span>{label}</span>
                </div>
                <button
                  type="button"
                  onClick={() => onChange(key, !config[key])}
                  className={cn(
                    "relative h-5 w-9 shrink-0 rounded-full transition-colors",
                    config[key] ? "bg-primary" : "bg-muted border border-border"
                  )}
                >
                  <span
                    className={cn(
                      "absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform",
                      config[key] ? "translate-x-4" : "translate-x-0.5"
                    )}
                  />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex shrink-0 gap-3 border-t border-border px-5 py-4">
        <Button variant="outline" className="flex-1 h-11 rounded-xl" onClick={onBack}>
          {t("panelBack")}
        </Button>
        <Button className="flex-1 h-11 rounded-xl bg-theme-secondary-gradient shadow-sm" onClick={onSave}>
          {t("panelSave")}
        </Button>
      </div>
    </div>
  );
}
