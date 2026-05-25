export type CrmAccentThemeKey = "blue" | "red" | "sky" | "purple" | "green";

export type CrmAccentTheme = {
  key: CrmAccentThemeKey;
  label: string;
  primary: string;
  primaryHover: string;
  primaryActive: string;
  tableHeaderBg: string;
  cardHeaderBg: string;
  activeTabBg: string;
  activeTabColor: string;
  softBg: string;
};

export const CRM_ACCENT_THEMES: Record<CrmAccentThemeKey, CrmAccentTheme> = {
  blue: {
    key: "blue",
    label: "Classic Blue",
    primary: "#1677ff",
    primaryHover: "#4096ff",
    primaryActive: "#0958d9",
    tableHeaderBg: "#eaf3ff",
    cardHeaderBg: "#f3f8ff",
    activeTabBg: "#e6f4ff",
    activeTabColor: "#0958d9",
    softBg: "#f3f8ff",
  },
  red: {
    key: "red",
    label: "Royal Red",
    primary: "#cf1322",
    primaryHover: "#ff4d4f",
    primaryActive: "#a8071a",
    tableHeaderBg: "#fff1f0",
    cardHeaderBg: "#fff5f5",
    activeTabBg: "#fff1f0",
    activeTabColor: "#a8071a",
    softBg: "#fff5f5",
  },
  sky: {
    key: "sky",
    label: "Sky Blue",
    primary: "#13c2c2",
    primaryHover: "#36cfc9",
    primaryActive: "#08979c",
    tableHeaderBg: "#e6fffb",
    cardHeaderBg: "#f0fffc",
    activeTabBg: "#e6fffb",
    activeTabColor: "#006d75",
    softBg: "#f0fffc",
  },
  purple: {
    key: "purple",
    label: "Purple",
    primary: "#722ed1",
    primaryHover: "#9254de",
    primaryActive: "#531dab",
    tableHeaderBg: "#f9f0ff",
    cardHeaderBg: "#fcf7ff",
    activeTabBg: "#f9f0ff",
    activeTabColor: "#531dab",
    softBg: "#fcf7ff",
  },
  green: {
    key: "green",
    label: "Emerald",
    primary: "#389e0d",
    primaryHover: "#52c41a",
    primaryActive: "#237804",
    tableHeaderBg: "#f6ffed",
    cardHeaderBg: "#fbfff5",
    activeTabBg: "#f6ffed",
    activeTabColor: "#237804",
    softBg: "#fbfff5",
  },
};

export const DEFAULT_CRM_ACCENT_THEME: CrmAccentThemeKey = "blue";

export function getCrmAccentTheme(key?: string | null): CrmAccentTheme {
  if (key && key in CRM_ACCENT_THEMES) {
    return CRM_ACCENT_THEMES[key as CrmAccentThemeKey];
  }

  return CRM_ACCENT_THEMES[DEFAULT_CRM_ACCENT_THEME];
}
