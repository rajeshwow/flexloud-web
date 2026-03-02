import {
    BellOutlined,
    DashboardOutlined,
    DownOutlined,
    LogoutOutlined,
    MenuFoldOutlined,
    MenuUnfoldOutlined,
    SettingOutlined,
    TeamOutlined,
    UserOutlined,
} from "@ant-design/icons";
import type { MenuProps } from "antd";
import { Avatar, Button, Dropdown, Grid, Layout, Menu, Space, Typography } from "antd";
import { useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";

const { Sider, Header, Content } = Layout;
const { Text } = Typography;

type Props = {
    children: React.ReactNode;
    user?: { name?: string; email?: string };
    onLogout?: () => void;
};

export default function AppShell({ children, user, onLogout }: Props) {
    const { slug } = useParams();
    const location = useLocation();
    const navigate = useNavigate();
    const screens = Grid.useBreakpoint();

    const [collapsed, setCollapsed] = useState(false);
    const isMobile = !screens.md;

    const base = `/${slug}`;

    const items = useMemo(
        () => [
            { key: `${base}/dashboard`, icon: <DashboardOutlined />, label: "Dashboard" },
            { key: `${base}/leads`, icon: <TeamOutlined />, label: "Leads" },
            { key: `${base}/users`, icon: <UserOutlined />, label: "Users" },
            { key: `${base}/notifications`, icon: <BellOutlined />, label: "Notifications" },
            { key: `${base}/settings`, icon: <SettingOutlined />, label: "Settings" },
        ],
        [base],
    );

    const selectedKey = useMemo(() => {
        const path = location.pathname;
        const keys = items.map((i) => i.key).sort((a, b) => b.length - a.length);
        const match = keys.find((k) => path.startsWith(k));
        return match ? [match] : [];
    }, [items, location.pathname]);

    const profileMenu: MenuProps = {
        items: [
            { key: "profile", label: "Profile (soon)", disabled: true },
            { key: "divider", type: "divider" },
            { key: "logout", icon: <LogoutOutlined />, label: "Logout" },
        ],
        onClick: (e) => {
            if (e.key === "logout") onLogout?.();
        },
    };

    return (
        <Layout style={{ minHeight: "100vh" }}>
            {/* CSS (inline) */}
            <style>{`
        .fl-sider {
          background: #0b1220 !important;
          border-right: 1px solid rgba(255,255,255,0.06);
        }
        .fl-brand {
          height: 64px;
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 0 16px;
          border-bottom: 1px solid rgba(255,255,255,0.06);
        }
        .fl-logo {
          width: 38px;
          height: 38px;
          border-radius: 12px;
          background: radial-gradient(circle at 30% 30%, #69b1ff, #1677ff 55%, #10239e);
          box-shadow: 0 12px 28px rgba(22, 119, 255, 0.35);
          display: grid;
          place-items: center;
          color: #fff;
          font-weight: 900;
          letter-spacing: 0.5px;
        }
        .fl-brandText {
          color: #fff;
          line-height: 1.1;
        }
        .fl-sider .ant-menu {
          background: transparent !important;
          border-inline-end: none !important;
          padding: 10px;
        }
        .fl-sider .ant-menu-item {
          color: rgba(255,255,255,0.78) !important;
          border-radius: 14px !important;
          margin: 6px 6px !important;
          height: 44px !important;
          line-height: 44px !important;
          transition: all .18s ease;
        }
        .fl-sider .ant-menu-item:hover {
          background: rgba(255,255,255,0.08) !important;
          color: #fff !important;
        }
        .fl-sider .ant-menu-item-selected {
          background: linear-gradient(135deg, rgba(22,119,255,0.95), rgba(105,177,255,0.65)) !important;
          box-shadow: 0 14px 30px rgba(22,119,255,0.25);
          color: #fff !important;
        }
        .fl-sider .ant-menu-item-selected::after {
          border-right: none !important;
        }
        .fl-sider ::-webkit-scrollbar { width: 6px; }
        .fl-sider ::-webkit-scrollbar-thumb {
          background: rgba(255,255,255,0.18);
          border-radius: 999px;
        }
        .fl-header {
          background: rgba(255,255,255,0.75) !important;
          backdrop-filter: blur(12px);
          border-bottom: 1px solid rgba(0,0,0,0.06);
        }
        .fl-contentBg {
          background: radial-gradient(circle at 20% 10%, rgba(22,119,255,0.10), transparent 35%),
                      radial-gradient(circle at 80% 0%, rgba(105,177,255,0.18), transparent 40%),
                      #f5f7fb;
          padding: 16px;
        }
        .fl-card {
          background: #fff;
          border-radius: 18px;
          padding: 16px;
          min-height: calc(100vh - 64px - 32px);
          box-shadow: 0 10px 24px rgba(15, 23, 42, 0.06);
          border: 1px solid rgba(0,0,0,0.04);
        }
        .fl-profile {
          margin: 10px;
          padding: 12px;
          border-radius: 16px;
          background: rgba(255,255,255,0.06);
          border: 1px solid rgba(255,255,255,0.08);
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .fl-profileName {
          color: #fff;
          font-weight: 700;
          line-height: 1.1;
        }
        .fl-profileEmail {
          color: rgba(255,255,255,0.7);
          font-size: 12px;
        }
      `}</style>

            <Sider
                className="fl-sider"
                collapsible
                trigger={null}
                width={270}
                collapsed={collapsed}
                collapsedWidth={isMobile ? 0 : 86}
                breakpoint="md"
            >
                {/* Brand */}
                <div className="fl-brand">
                    <div className="fl-logo">F</div>
                    {!collapsed && (
                        <div className="fl-brandText">
                            <div style={{ fontWeight: 800, fontSize: 16 }}>FlexLoud</div>
                            <div style={{ fontSize: 12, color: "rgba(255,255,255,0.72)" }}>
                                Tenant: {slug}
                            </div>
                        </div>
                    )}
                </div>

                {/* Menu */}
                <Menu
                    mode="inline"
                    selectedKeys={selectedKey}
                    items={items as any}
                    onClick={(e) => navigate(e.key)}
                />

                {/* Profile block bottom */}
                <div style={{ position: "absolute", bottom: 0, left: 0, right: 0 }}>
                    <div className="fl-profile" style={{ justifyContent: collapsed ? "center" : "flex-start" }}>
                        <Avatar size={40} style={{ backgroundColor: "#1677ff" }}>
                            {(user?.name || "A").slice(0, 1).toUpperCase()}
                        </Avatar>
                        {!collapsed && (
                            <div style={{ flex: 1, minWidth: 0 }}>
                                <div className="fl-profileName">{user?.name || "Admin"}</div>
                                <div className="fl-profileEmail" style={{ overflow: "hidden", textOverflow: "ellipsis" }}>
                                    {user?.email || "admin@flexloud.com"}
                                </div>
                            </div>
                        )}

                        {!collapsed && (
                            <Dropdown menu={profileMenu} trigger={["click"]} placement="topRight">
                                <Button type="text" style={{ color: "#fff" }}>
                                    <Space size={4}>
                                        <DownOutlined />
                                    </Space>
                                </Button>
                            </Dropdown>
                        )}
                    </div>
                </div>
            </Sider>

            <Layout>
                <Header
                    className="fl-header"
                    style={{
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
                    <Text style={{ fontWeight: 700, fontSize: 16 }}>CRM</Text>

                    <div style={{ marginLeft: "auto" }} />

                    <Button
                        onClick={() => onLogout?.()}
                        icon={<LogoutOutlined />}
                    >
                        Logout
                    </Button>
                </Header>

                <Content className="fl-contentBg">
                    <div className="fl-card">{children}</div>
                </Content>
            </Layout>
        </Layout>
    );
}