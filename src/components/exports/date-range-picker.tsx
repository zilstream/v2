"use client";

import { format } from "date-fns";
import { CalendarIcon, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import type { DateRange } from "@/lib/export/types";

const currentYear = new Date().getFullYear();

const TAX_YEAR_PRESETS = [
  {
    label: `${currentYear}`,
    start: new Date(currentYear, 0, 1),
    end: new Date(currentYear, 11, 31),
  },
  {
    label: `${currentYear - 1}`,
    start: new Date(currentYear - 1, 0, 1),
    end: new Date(currentYear - 1, 11, 31),
  },
  {
    label: `${currentYear - 2}`,
    start: new Date(currentYear - 2, 0, 1),
    end: new Date(currentYear - 2, 11, 31),
  },
];

interface DateRangePickerProps {
  value: DateRange;
  onChange: (range: DateRange) => void;
}

export function DateRangePicker({ value, onChange }: DateRangePickerProps) {
  const isPresetSelected = (preset: (typeof TAX_YEAR_PRESETS)[0]) =>
    value.start.getTime() === preset.start.getTime() &&
    value.end.getTime() === preset.end.getTime();

  const hasPresetMatch = TAX_YEAR_PRESETS.some(isPresetSelected);

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <label className="text-sm font-medium text-muted-foreground">
          Quick select tax year
        </label>
        <div className="flex gap-2">
          {TAX_YEAR_PRESETS.map((preset) => {
            const isSelected = isPresetSelected(preset);
            return (
              <button
                key={preset.label}
                type="button"
                onClick={() =>
                  onChange({ start: preset.start, end: preset.end })
                }
                className={cn(
                  "relative flex-1 rounded-lg border px-3 py-2 text-center transition-colors",
                  isSelected
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border hover:bg-accent",
                )}
              >
                <span className="font-medium">{preset.label}</span>
                {isSelected && (
                  <Check className="absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-muted-foreground">
          {hasPresetMatch ? "Selected range" : "Custom range"}
        </label>
        <div className="flex flex-wrap items-center gap-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "justify-start text-left",
                  !hasPresetMatch && "border-primary",
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {format(value.start, "MMM d, yyyy")}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={value.start}
                onSelect={(date) => date && onChange({ ...value, start: date })}
                disabled={(date) => date > value.end}
              />
            </PopoverContent>
          </Popover>
          <span className="text-muted-foreground">to</span>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "justify-start text-left",
                  !hasPresetMatch && "border-primary",
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {format(value.end, "MMM d, yyyy")}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={value.end}
                onSelect={(date) => date && onChange({ ...value, end: date })}
                disabled={(date) => date < value.start || date > new Date()}
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>
    </div>
  );
}
