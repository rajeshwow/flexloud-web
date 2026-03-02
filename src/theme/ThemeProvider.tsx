import { ConfigProvider, theme as antdTheme } from "antd";
import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

type ThemeCtx = {
    dark: boolean;
    setDark: (v: boolean) => void;
    toggle: () => void;
};

const ThemeContext = createContext<ThemeCtx | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
    const [dark, setDark] = useState<boolean>(() => localStorage.getItem("fl_theme") !== "light");

    useEffect(() => {
        const mode = dark ? "dark" : "light";
        localStorage.setItem("fl_theme", mode);
        document.documentElement.setAttribute("data-theme", mode);
    }, [dark]);

    const value = useMemo(
        () => ({ dark, setDark, toggle: () => setDark((v) => !v) }),
        [dark]
    );

    return (
        <ThemeContext.Provider value={value}>
            <ConfigProvider theme={{ algorithm: dark ? antdTheme.darkAlgorithm : antdTheme.defaultAlgorithm }}>
                {children}
            </ConfigProvider>
        </ThemeContext.Provider>
    );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAppTheme() {
    const ctx = useContext(ThemeContext);
    if (!ctx) throw new Error("useAppTheme must be used inside ThemeProvider");
    return ctx;
}