"use client";

import { useState } from "react";
import { Check, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { AmenityItem } from "./types";

export interface AmenityPanelProps {
  title: string;
  items: AmenityItem[];
  selectedIds: number[];
  onSave: (ids: number[]) => void;
  onBack: () => void;
}

export function AmenityPanel({ title, items, selectedIds, onSave, onBack }: AmenityPanelProps) {
  const [draft, setDraft] = useState<number[]>(selectedIds);
  const toggle = (id: number) =>
    setDraft(prev => (prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]));

  return (
    <div className="flex flex-col h-full min-h-0 w-full">
      <div className="flex items-center justify-between border-b border-border px-4 py-4 shrink-0">
        <h3 className="text-lg font-semibold">{title}</h3>
        <button
          type="button"
          onClick={onBack}
          className="rounded-md p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          aria-label="Буцах"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-4">
        <div className="grid grid-cols-2 gap-2">
          {items.map(item => {
            const selected = draft.includes(item.id);
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => toggle(item.id)}
                className={cn(
                  "flex items-start gap-2 rounded-xl border p-3 text-left transition-colors",
                  selected ? "border-primary bg-primary/10" : "border-border bg-background hover:bg-muted/40"
                )}
              >
                <div
                  className={cn(
                    "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border",
                    selected ? "border-primary bg-primary text-white" : "border-muted-foreground/30"
                  )}
                >
                  {selected && <Check className="h-3.5 w-3.5 stroke-[3]" />}
                </div>
                <div className="min-w-0">
                  <p className={cn("text-sm font-medium leading-tight", selected ? "text-primary" : "")}>
                    {item.name_mn}
                  </p>
                  <p className="text-sm text-muted-foreground truncate">{item.name_en}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="border-t border-border px-5 py-4 flex gap-3 shrink-0">
        <Button variant="outline" className="flex-1" onClick={onBack}>
          Буцах
        </Button>
        <Button className="flex-1 bg-theme-secondary-gradient shadow-sm" onClick={() => onSave(draft)}>
          Хадгалах
        </Button>
      </div>
    </div>
  );
}
