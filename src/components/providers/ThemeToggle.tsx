"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { useTheme } from "./ThemeProvider";
import { Sun, Moon, Monitor } from "lucide-react";

interface ThemeToggleProps {
  variant?: "icon" | "dropdown" | "switch";
  className?: string;
  showLabel?: boolean;
}

export function ThemeToggle({
  variant = "icon",
  className,
  showLabel = false,
}: ThemeToggleProps) {
  const { theme, resolvedTheme, setTheme } = useTheme();

  if (variant === "switch") {
    return (
      <div className={cn("flex items-center gap-2", className)}>
        {showLabel && <span className="text-sm text-gray-600 dark:text-gray-400">테마</span>}
        <button
          onClick={() => setTheme(resolvedTheme === "light" ? "dark" : "light")}
          className={cn(
            "relative w-14 h-7 rounded-full transition-colors duration-300",
            resolvedTheme === "dark" ? "bg-gray-700" : "bg-gray-200"
          )}
          aria-label={resolvedTheme === "dark" ? "라이트 모드로 전환" : "다크 모드로 전환"}
        >
          <span
            className={cn(
              "absolute top-0.5 left-0.5 w-6 h-6 rounded-full bg-white shadow-md flex items-center justify-center transition-transform duration-300",
              resolvedTheme === "dark" && "translate-x-7"
            )}
          >
            {resolvedTheme === "dark" ? (
              <Moon className="w-4 h-4 text-gray-700" />
            ) : (
              <Sun className="w-4 h-4 text-yellow-500" />
            )}
          </span>
        </button>
      </div>
    );
  }

  if (variant === "dropdown") {
    return (
      <div className={cn("relative inline-block", className)}>
        <div className="flex items-center gap-1 p-2 bg-gray-100 dark:bg-gray-800 rounded-lg">
          {[
            { value: "light" as const, icon: Sun, label: "라이트" },
            { value: "dark" as const, icon: Moon, label: "다크" },
            { value: "system" as const, icon: Monitor, label: "시스템" },
          ].map(({ value, icon: Icon, label }) => (
            <button
              key={value}
              onClick={() => setTheme(value)}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm transition-colors",
                theme === value
                  ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm"
                  : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
              )}
              aria-label={`${label} 테마`}
              aria-pressed={theme === value}
            >
              <Icon className="w-4 h-4" />
              {showLabel && <span>{label}</span>}
            </button>
          ))}
        </div>
      </div>
    );
  }

  // Icon variant (default)
  return (
    <button
      onClick={() => setTheme(resolvedTheme === "light" ? "dark" : "light")}
      className={cn(
        "p-2 rounded-lg transition-colors",
        "hover:bg-gray-100 dark:hover:bg-gray-800",
        "text-gray-600 dark:text-gray-400",
        className
      )}
      aria-label={resolvedTheme === "dark" ? "라이트 모드로 전환" : "다크 모드로 전환"}
    >
      {resolvedTheme === "dark" ? (
        <Sun className="w-5 h-5" />
      ) : (
        <Moon className="w-5 h-5" />
      )}
    </button>
  );
}
