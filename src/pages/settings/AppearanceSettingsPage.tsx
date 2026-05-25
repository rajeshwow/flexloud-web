import {
    BgColorsOutlined,
    CheckCircleFilled,
    MoonOutlined,
    SunOutlined,
} from "@ant-design/icons";
import { Button, Card, Col, Row, Space, Switch, Typography } from "antd";
import { CRM_ACCENT_THEMES, type CrmAccentThemeKey } from "../../theme/crmThemes";
import { useAppTheme } from "../../theme/ThemeProvider";

const { Title, Text } = Typography;

export default function AppearanceSettingsPage() {
    const { dark, setDark, accentTheme, setAccentTheme, accentThemes } =
        useAppTheme();

    const themes = Object.values(accentThemes || CRM_ACCENT_THEMES);

    return (
        <div style={{ padding: 18 }}>
            <Card
                bordered={false}
                style={{
                    borderRadius: 18,
                    background: "var(--fl-cardbg)",
                    border: "1px solid var(--fl-border)",
                }}
                bodyStyle={{ padding: 22 }}
            >
                <div
                    style={{
                        display: "flex",
                        alignItems: "flex-start",
                        justifyContent: "space-between",
                        gap: 16,
                        marginBottom: 22,
                    }}
                >
                    <div>
                        <Space align="center" size={10}>
                            <BgColorsOutlined
                                style={{ fontSize: 24, color: "var(--crm-primary)" }}
                            />
                            <Title
                                level={3}
                                style={{
                                    margin: 0,
                                    color: "var(--fl-text)",
                                }}
                            >
                                Appearance
                            </Title>
                        </Space>

                        <Text style={{ color: "var(--fl-text2)" }}>
                            Customize CRM colors for tables, cards, buttons, tabs and active
                            states.
                        </Text>
                    </div>

                    <Space
                        style={{
                            padding: "8px 12px",
                            borderRadius: 999,
                            background: "var(--crm-soft-bg)",
                            border: "1px solid var(--fl-border)",
                        }}
                    >
                        {dark ? <MoonOutlined /> : <SunOutlined />}
                        <Text style={{ color: "var(--fl-text)", fontWeight: 600 }}>
                            {dark ? "Dark Mode" : "Light Mode"}
                        </Text>
                        <Switch checked={dark} onChange={setDark} />
                    </Space>
                </div>

                <div style={{ marginBottom: 14 }}>
                    <Title
                        level={5}
                        style={{
                            margin: 0,
                            color: "var(--fl-text)",
                        }}
                    >
                        Brand Theme
                    </Title>
                    <Text style={{ color: "var(--fl-text2)" }}>
                        Pick one color theme. This is saved in browser for now.
                    </Text>
                </div>

                <Row gutter={[16, 16]}>
                    {themes.map((item) => {
                        const active = accentTheme === item.key;

                        return (
                            <Col xs={24} sm={12} lg={8} xl={6} key={item.key}>
                                <button
                                    type="button"
                                    onClick={() => setAccentTheme(item.key as CrmAccentThemeKey)}
                                    style={{
                                        width: "100%",
                                        padding: 0,
                                        textAlign: "left",
                                        border: active
                                            ? `2px solid ${item.primary}`
                                            : "1px solid var(--fl-border)",
                                        borderRadius: 18,
                                        overflow: "hidden",
                                        cursor: "pointer",
                                        background: "var(--fl-panel)",
                                        boxShadow: active
                                            ? `0 14px 34px color-mix(in srgb, ${item.primary} 24%, transparent)`
                                            : "var(--fl-shadow)",
                                    }}
                                >
                                    <div
                                        style={{
                                            height: 70,
                                            background: `linear-gradient(135deg, ${item.primary}, ${item.primaryHover})`,
                                            position: "relative",
                                        }}
                                    >
                                        {active ? (
                                            <CheckCircleFilled
                                                style={{
                                                    position: "absolute",
                                                    right: 14,
                                                    top: 14,
                                                    color: "#ffffff",
                                                    fontSize: 22,
                                                }}
                                            />
                                        ) : null}
                                    </div>

                                    <div style={{ padding: 14 }}>
                                        <div
                                            style={{
                                                color: "var(--fl-text)",
                                                fontWeight: 800,
                                                fontSize: 15,
                                                marginBottom: 10,
                                            }}
                                        >
                                            {item.label}
                                        </div>

                                        <div
                                            style={{
                                                borderRadius: 12,
                                                overflow: "hidden",
                                                border: "1px solid var(--fl-border)",
                                                background: dark ? "rgba(255,255,255,0.04)" : "#ffffff",
                                            }}
                                        >
                                            <div
                                                style={{
                                                    height: 30,
                                                    background: dark
                                                        ? "rgba(255,255,255,0.07)"
                                                        : item.tableHeaderBg,
                                                    borderBottom: "1px solid var(--fl-border)",
                                                }}
                                            />

                                            <div style={{ padding: 10 }}>
                                                <div
                                                    style={{
                                                        height: 9,
                                                        width: "78%",
                                                        borderRadius: 999,
                                                        background: dark
                                                            ? "rgba(255,255,255,0.18)"
                                                            : "rgba(15,23,42,0.12)",
                                                        marginBottom: 8,
                                                    }}
                                                />
                                                <div
                                                    style={{
                                                        height: 9,
                                                        width: "55%",
                                                        borderRadius: 999,
                                                        background: dark
                                                            ? "rgba(255,255,255,0.12)"
                                                            : "rgba(15,23,42,0.08)",
                                                    }}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </button>
                            </Col>
                        );
                    })}
                </Row>

                <div
                    style={{
                        marginTop: 24,
                        padding: 16,
                        borderRadius: 16,
                        background: "var(--crm-soft-bg)",
                        border: "1px solid var(--fl-border)",
                    }}
                >
                    <Space wrap>
                        <Button type="primary">Primary Action</Button>
                        <Button>Default Button</Button>
                        <Button type="link">Link Action</Button>
                    </Space>

                    <div
                        style={{
                            marginTop: 16,
                            border: "1px solid var(--fl-border)",
                            borderRadius: 12,
                            overflow: "hidden",
                            background: "var(--fl-panel)",
                        }}
                    >
                        <div
                            style={{
                                padding: "10px 14px",
                                background: "var(--crm-table-header-bg)",
                                color: "var(--fl-text)",
                                fontWeight: 700,
                            }}
                        >
                            Preview Table Header
                        </div>

                        <div style={{ padding: 14, color: "var(--fl-text2)" }}>
                            Card headers, active tabs, table headers and primary buttons will
                            follow selected theme.
                        </div>
                    </div>
                </div>
            </Card>
        </div>
    );
}