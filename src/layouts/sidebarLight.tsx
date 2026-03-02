import {
    BellOutlined,
    DashboardOutlined,
    LogoutOutlined,
    MenuFoldOutlined,
    MenuUnfoldOutlined,
    SettingOutlined,
    TeamOutlined,
    UserOutlined,
} from "@ant-design/icons";
import { Button, Grid, Layout, Menu, Typography } from "antd";
import { useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";

const { Sider, Header, Content } = Layout;
const { Text } = Typography;

type Props = { children: React.ReactNode; onLogout?: () => void };

export default function AppShell({ children, onLogout }: Props) {
    const { slug } = useParams();
    const location = useLocation();
    const navigate = useNavigate();
    const screens = Grid.useBreakpoint();

    const [collapsed, setCollapsed] = useState(false);

    const base = `/${slug}`;
    const items = useMemo(
        () => [
            { key: `${base}/dashboard`, icon: <DashboardOutlined />, label: "Dashboard" },
            { key: `${base}/leads`, icon: <TeamOutlined />, label: "Leads" },
            { key: `${base}/users`, icon: <UserOutlined />, label: "Users" },
            { key: `${base}/notifications`, icon: <BellOutlined />, label: "Notifications" },
            { key: `${base}/settings`, icon: <SettingOutlined />, label: "Settings" },
            { type: "divider" as const },
            { key: "__logout", icon: <LogoutOutlined />, label: "Logout" },
        ],
        [base],
    );

    const selectedKey = useMemo(() => {
        const path = location.pathname;
        // pick the closest match from menu keys
        const match = items
            .filter((i: any) => i?.key && typeof i.key === "string" && i.key !== "__logout")
            .map((i: any) => i.key)
            .sort((a: string, b: string) => b.length - a.length)
            .find((k: string) => path.startsWith(k));
        return match ? [match] : [];
    }, [items, location.pathname]);

    const isMobile = !screens.md;

    return (
        <Layout style={{ minHeight: "100vh" }}>
            <Sider
                collapsible
                collapsed={collapsed}
                trigger={null}
                width={260}
                breakpoint="md"
                collapsedWidth={isMobile ? 0 : 80}
                style={{
                    background: "#fff",
                    borderRight: "1px solid rgba(0,0,0,0.06)",
                }}
            >
                {/* Brand */}
                <div
                    style={{
                        height: 64,
                        display: "flex",
                        alignItems: "center",
                        gap: 10,
                        padding: "0 16px",
                        borderBottom: "1px solid rgba(0,0,0,0.06)",
                    }}
                >
                    <div
                        style={{
                            width: 34,
                            height: 34,
                            borderRadius: 10,
                            background: "linear-gradient(135deg, #1677ff, #69b1ff)",
                            display: "grid",
                            placeItems: "center",
                            color: "#fff",
                            fontWeight: 800,
                        }}
                    >
                        F
                    </div>

                    {!collapsed && (
                        <div style={{ lineHeight: 1.1 }}>
                            <Text style={{ fontWeight: 700, fontSize: 16 }}>FlexLoud</Text>
                            <div>
                                <Text type="secondary" style={{ fontSize: 12 }}>
                                    Tenant: {slug}
                                </Text>
                            </div>
                        </div>
                    )}
                </div>

                <Menu
                    mode="inline"
                    selectedKeys={selectedKey}
                    items={items as any}
                    style={{ borderRight: 0, padding: 8 }}
                    onClick={(e) => {
                        if (e.key === "__logout") {
                            onLogout?.();
                            return;
                        }
                        navigate(e.key);
                    }}
                />
            </Sider>

            <Layout>
                <Header
                    style={{
                        background: "#fff",
                        borderBottom: "1px solid rgba(0,0,0,0.06)",
                        padding: "0 16px",
                        display: "flex",
                        alignItems: "center",
                        gap: 12,
                    }}
                >
                    <Button
                        type="text"
                        icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
                        onClick={() => setCollapsed((v) => !v)}
                    />
                    <Text style={{ fontWeight: 600 }}>CRM</Text>
                    <div style={{ marginLeft: "auto" }} />
                </Header>

                <Content style={{ padding: 16, background: "#f5f7fb" }}>
                    <div
                        style={{
                            background: "#fff",
                            borderRadius: 16,
                            padding: 16,
                            minHeight: "calc(100vh - 64px - 32px)",
                            boxShadow: "0 6px 18px rgba(0,0,0,0.06)",
                        }}
                    >
                        {children}
                    </div>
                </Content>
            </Layout>
        </Layout>
    );
}