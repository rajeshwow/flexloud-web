import { BgColorsOutlined, CheckOutlined } from "@ant-design/icons";
import { Button, Popover, Space, Tooltip, Typography } from "antd";
import { CRM_ACCENT_THEMES, type CrmAccentThemeKey } from "../theme/crmThemes";
import { useAppTheme } from "../theme/ThemeProvider";

const { Text } = Typography;

export default function HeaderThemeSwitcher() {
    const { dark, accentTheme, setAccentTheme, accentThemes } = useAppTheme();

    const themeList = Object.values(accentThemes || CRM_ACCENT_THEMES);

    const content = (
        <div
            style={{
                width: 260,
                padding: 6,
            }}
        >
            <div style={{ marginBottom: 10 }}>
                <Text strong style={{ color: "var(--fl-text)" }}>
                    Choose Theme
                </Text>
                <div
                    style={{
                        color: "var(--fl-text2)",
                        fontSize: 12,
                        marginTop: 2,
                    }}
                >
                    Applies to buttons, table headers, cards and active tabs
                </div>
            </div>

            <Space direction="vertical" size={8} style={{ width: "100%" }}>
                {themeList.map((item) => {
                    const active = accentTheme === item.key;

                    return (
                        <button
                            key={item.key}
                            type="button"
                            onClick={() => setAccentTheme(item.key as CrmAccentThemeKey)}
                            style={{
                                width: "100%",
                                border: active
                                    ? `1px solid ${item.primary}`
                                    : dark
                                        ? "1px solid rgba(255,255,255,0.12)"
                                        : "1px solid rgba(15,23,42,0.08)",
                                background: active
                                    ? dark
                                        ? "rgba(255,255,255,0.08)"
                                        : item.softBg
                                    : dark
                                        ? "rgba(255,255,255,0.04)"
                                        : "#ffffff",
                                color: dark ? "#f8fafc" : "#111827",
                                borderRadius: 12,
                                padding: "9px 10px",
                                cursor: "pointer",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                                gap: 10,
                            }}
                        >
                            <span style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                <span
                                    style={{
                                        width: 18,
                                        height: 18,
                                        borderRadius: 999,
                                        background: item.primary,
                                        boxShadow: `0 0 0 4px ${dark ? "rgba(255,255,255,0.06)" : item.softBg}`,
                                    }}
                                />
                                <span style={{ fontWeight: 600 }}>{item.label}</span>
                            </span>

                            {active ? <CheckOutlined style={{ color: item.primary }} /> : null}
                        </button>
                    );
                })}
            </Space>
        </div>
    );

    return (
        <Popover
            content={content}
            trigger={["hover", "click"]}
            placement="bottomRight"
            overlayInnerStyle={{
                padding: 10,
                borderRadius: 16,
            }}
        >
            <Tooltip title="Theme colors">
                <Button
                    type="text"
                    icon={<BgColorsOutlined />}
                    style={{
                        color: "var(--fl-text)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                    }}
                />
            </Tooltip>
        </Popover>
    );
}