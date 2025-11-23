"use client";

import { Monitor, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export function ThemeToggle() {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="flex w-full items-center gap-0.5 rounded-md border border-border bg-muted/50 p-1">
        <div className="h-7 flex-1" />
        <div className="h-7 flex-1" />
        <div className="h-7 flex-1" />
      </div>
    );
  }

  return (
    <div className="flex w-full items-center gap-0.5 rounded-md border border-border bg-muted/50 p-1">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme("light")}
              suppressHydrationWarning
              className={`h-7 flex-1 ${
                theme === "light"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Sun className="h-4 w-4" />
              <span className="sr-only">Light mode</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Light</p>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme("dark")}
              suppressHydrationWarning
              className={`h-7 flex-1 ${
                theme === "dark"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Moon className="h-4 w-4" />
              <span className="sr-only">Dark mode</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Dark</p>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme("system")}
              suppressHydrationWarning
              className={`h-7 flex-1 ${
                theme === "system"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Monitor className="h-4 w-4" />
              <span className="sr-only">System mode</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>System</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
}
