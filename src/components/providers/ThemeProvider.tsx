"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";

export type Theme = "light" | "dark" | "system";

interface ThemeContextType {
  theme: Theme;
  resolvedTheme: "light" | "dark";
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | null>(null);

const STORAGE_KEY = "jahr-theme";

interface ThemeProviderProps {
  children: React.ReactNode;
  defaultTheme?: Theme;
  storageKey?: string;
}

export function ThemeProvider({
  children,
  defaultTheme = "system",
  storageKey = STORAGE_KEY,
}: ThemeProviderProps) {
  const [theme, setThemeState] = useState<Theme>(defaultTheme);
  const [resolvedTheme, setResolvedTheme] = useState<"light" | "dark">("light");
  const [mounted, setMounted] = useState(false);

  // 시스템 테마 감지
  const getSystemTheme = useCallback((): "light" | "dark" => {
    if (typeof window === "undefined") return "light";
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  }, []);

  // 실제 테마 결정
  const resolveTheme = useCallback((themeValue: Theme): "light" | "dark" => {
    if (themeValue === "system") {
      return getSystemTheme();
    }
    return themeValue;
  }, [getSystemTheme]);

  // 테마 적용
  const applyTheme = useCallback((resolved: "light" | "dark") => {
    const root = document.documentElement;
    
    // 클래스 제거 후 추가
    root.classList.remove("light", "dark");
    root.classList.add(resolved);
    
    // data 속성 설정
    root.setAttribute("data-theme", resolved);
    
    // 메타 테마 색상 업데이트
    const metaTheme = document.querySelector('meta[name="theme-color"]');
    if (metaTheme) {
      metaTheme.setAttribute("content", resolved === "dark" ? "#0a0a0a" : "#ffffff");
    }
  }, []);

  // 초기화
  useEffect(() => {
    const stored = localStorage.getItem(storageKey) as Theme | null;
    const initialTheme = stored || defaultTheme;
    
    setThemeState(initialTheme);
    const resolved = resolveTheme(initialTheme);
    setResolvedTheme(resolved);
    applyTheme(resolved);
    setMounted(true);
  }, [storageKey, defaultTheme, resolveTheme, applyTheme]);

  // 시스템 테마 변경 감지
  useEffect(() => {
    if (!mounted) return;

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    
    const handleChange = () => {
      if (theme === "system") {
        const resolved = getSystemTheme();
        setResolvedTheme(resolved);
        applyTheme(resolved);
      }
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, [theme, mounted, getSystemTheme, applyTheme]);

  // 테마 설정
  const setTheme = useCallback((newTheme: Theme) => {
    setThemeState(newTheme);
    localStorage.setItem(storageKey, newTheme);
    
    const resolved = resolveTheme(newTheme);
    setResolvedTheme(resolved);
    applyTheme(resolved);
  }, [storageKey, resolveTheme, applyTheme]);

  // SSR 깜빡임 방지
  if (!mounted) {
    return (
      <ThemeContext.Provider value={{ theme: defaultTheme, resolvedTheme: "light", setTheme: () => {} }}>
        {children}
      </ThemeContext.Provider>
    );
  }

  return (
    <ThemeContext.Provider value={{ theme, resolvedTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

// 훅
export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
