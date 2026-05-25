// import { ConfigProvider, theme as antdTheme } from "antd";
// import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

// type ThemeCtx = {
//     dark: boolean;
//     setDark: (v: boolean) => void;
//     toggle: () => void;
// };

// const ThemeContext = createContext<ThemeCtx | null>(null);

// export function ThemeProvider({ children }: { children: React.ReactNode }) {
//     const [dark, setDark] = useState<boolean>(() => localStorage.getItem("fl_theme") !== "light");

//     useEffect(() => {
//         const mode = dark ? "dark" : "light";
//         localStorage.setItem("fl_theme", mode);
//         document.documentElement.setAttribute("data-theme", mode);
//     }, [dark]);

//     const value = useMemo(
//         () => ({ dark, setDark, toggle: () => setDark((v) => !v) }),
//         [dark]
//     );

//     return (
//         <ThemeContext.Provider value={value}>
//             <ConfigProvider theme={{ algorithm: dark ? antdTheme.darkAlgorithm : antdTheme.defaultAlgorithm }}>
//                 {children}
//             </ConfigProvider>
//         </ThemeContext.Provider>
//     );
// }

// export function useAppTheme() {
//     const ctx = useContext(ThemeContext);
//     if (!ctx) throw new Error("useAppTheme must be used inside ThemeProvider");
//     return ctx;
// }

import { ConfigProvider, theme as antdTheme } from "antd";
import React, {
    createContext,
    useContext,
    useEffect,
    useMemo,
    useState,
} from "react";
import {
    CRM_ACCENT_THEMES,
    type CrmAccentThemeKey,
    DEFAULT_CRM_ACCENT_THEME,
    getCrmAccentTheme,
} from "./crmThemes";

type ThemeCtx = {
    dark: boolean;
    accentTheme: CrmAccentThemeKey;
    setDark: (v: boolean) => void;
    toggle: () => void;
    setAccentTheme: (v: CrmAccentThemeKey) => void;
    accentThemes: typeof CRM_ACCENT_THEMES;
};

const ThemeContext = createContext<ThemeCtx | null>(null);

function applyAccentCssVariables(themeKey: CrmAccentThemeKey, dark: boolean) {
    const theme = getCrmAccentTheme(themeKey);
    const root = document.documentElement;

    root.setAttribute("data-theme", dark ? "dark" : "light");
    root.setAttribute("data-accent-theme", theme.key);

    root.style.setProperty("--crm-primary", theme.primary);
    root.style.setProperty("--crm-primary-hover", theme.primaryHover);
    root.style.setProperty("--crm-primary-active", theme.primaryActive);
    root.style.setProperty("--crm-active-tab-color", theme.activeTabColor);

    if (dark) {
        root.style.setProperty("--crm-table-header-bg", "rgba(255,255,255,0.06)");
        root.style.setProperty("--crm-card-header-bg", "rgba(255,255,255,0.04)");
        root.style.setProperty("--crm-active-tab-bg", "rgba(255,255,255,0.08)");
        root.style.setProperty("--crm-soft-bg", "rgba(255,255,255,0.04)");
    } else {
        root.style.setProperty("--crm-table-header-bg", theme.tableHeaderBg);
        root.style.setProperty("--crm-card-header-bg", theme.cardHeaderBg);
        root.style.setProperty("--crm-active-tab-bg", theme.activeTabBg);
        root.style.setProperty("--crm-soft-bg", theme.softBg);
    }
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
    const [dark, setDark] = useState<boolean>(() => {
        return localStorage.getItem("fl_theme") === "dark";
    });

    const [accentTheme, setAccentThemeState] = useState<CrmAccentThemeKey>(() => {
        const savedTheme = localStorage.getItem("fl_accent_theme");

        if (savedTheme && savedTheme in CRM_ACCENT_THEMES) {
            return savedTheme as CrmAccentThemeKey;
        }

        return DEFAULT_CRM_ACCENT_THEME;
    });

    useEffect(() => {
        const mode = dark ? "dark" : "light";

        localStorage.setItem("fl_theme", mode);
        localStorage.setItem("fl_accent_theme", accentTheme);

        applyAccentCssVariables(accentTheme, dark);
    }, [dark, accentTheme]);

    const setAccentTheme = (value: CrmAccentThemeKey) => {
        setAccentThemeState(value);
    };

    const selectedTheme = getCrmAccentTheme(accentTheme);

    const value = useMemo(
        () => ({
            dark,
            accentTheme,
            setDark,
            toggle: () => setDark((v) => !v),
            setAccentTheme,
            accentThemes: CRM_ACCENT_THEMES,
        }),
        [dark, accentTheme],
    );

    return (
        <ThemeContext.Provider value={value}>
            <ConfigProvider
                theme={{
                    algorithm: dark
                        ? antdTheme.darkAlgorithm
                        : antdTheme.defaultAlgorithm,
                    token: {
                        colorPrimary: selectedTheme.primary,
                        colorLink: selectedTheme.primary,
                        borderRadius: 10,
                    },
                    components: {
                        Button: {
                            colorPrimary: selectedTheme.primary,
                            colorPrimaryHover: selectedTheme.primaryHover,
                            colorPrimaryActive: selectedTheme.primaryActive,
                        },
                        Tabs: {
                            inkBarColor: selectedTheme.primary,
                            itemSelectedColor: selectedTheme.primary,
                            itemHoverColor: selectedTheme.primaryHover,
                        },
                        Table: {
                            headerBg: dark
                                ? "rgba(255,255,255,0.06)"
                                : selectedTheme.tableHeaderBg,
                            headerColor: dark ? "rgba(255,255,255,0.88)" : "#111827",
                        },
                        Card: {
                            headerBg: dark
                                ? "rgba(255,255,255,0.04)"
                                : selectedTheme.cardHeaderBg,
                        },
                    },
                }}
            >
                {children}
            </ConfigProvider>
        </ThemeContext.Provider>
    );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAppTheme() {
    const ctx = useContext(ThemeContext);

    if (!ctx) {
        throw new Error("useAppTheme must be used inside ThemeProvider");
    }

    return ctx;
}