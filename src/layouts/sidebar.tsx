import {
  AppstoreOutlined,
  BankOutlined,
  BarChartOutlined,
  BellOutlined,
  // BoxOutlined,
  BulbOutlined,
  CalendarOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  DashboardOutlined,
  DollarOutlined,
  EyeOutlined,
  FilePdfOutlined,
  FileTextOutlined,
  FolderOutlined,
  GiftOutlined,
  HistoryOutlined,
  // optional extra icons (safe to keep)
  HomeOutlined,
  ImportOutlined,
  LogoutOutlined,
  MailOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  PartitionOutlined,
  PhoneOutlined,
  PlusOutlined,
  RiseOutlined,
  ScheduleOutlined,
  SettingOutlined,
  TagOutlined,
  TeamOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { Avatar, Button, Grid, Layout, Menu, Space, Switch, Typography } from "antd";
import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useAppTheme } from "../theme/ThemeProvider";


// ✅ your registry + builder
import { useSelector } from "react-redux";
import { buildMenuTree } from "../menu/buildMenu";
import { MENU_REGISTRY } from "../menu/menuRegistry";

const { Sider, Header, Content } = Layout;
const { Text } = Typography;

type Props = {
  children: React.ReactNode;
  user?: { name?: string; email?: string };
};

// ✅ map string icon names from registry -> actual icon components
const iconMap: Record<string, React.ReactNode> = {
  DashboardOutlined: <DashboardOutlined />,
  TeamOutlined: <TeamOutlined />,
  UserOutlined: <UserOutlined />,
  BellOutlined: <BellOutlined />,
  SettingOutlined: <SettingOutlined />,

  HomeOutlined: <HomeOutlined />,
  CalendarOutlined: <CalendarOutlined />,
  MailOutlined: <MailOutlined />,
  PhoneOutlined: <PhoneOutlined />,
  ScheduleOutlined: <ScheduleOutlined />,
  CheckCircleOutlined: <CheckCircleOutlined />,
  FileTextOutlined: <FileTextOutlined />,
  FolderOutlined: <FolderOutlined />,
  FilePdfOutlined: <FilePdfOutlined />,
  BarChartOutlined: <BarChartOutlined />,
  GiftOutlined: <GiftOutlined />,
  PartitionOutlined: <PartitionOutlined />,
  AppstoreOutlined: <AppstoreOutlined />,
  TagOutlined: <TagOutlined />,
  ClockCircleOutlined: <ClockCircleOutlined />,
  BankOutlined: <BankOutlined />,
  RiseOutlined: <RiseOutlined />,
  DollarOutlined: <DollarOutlined />,
  BoxOutlined: <DollarOutlined />,

  // action icons (if you used in registry)
  PlusOutlined: <PlusOutlined />,
  EyeOutlined: <EyeOutlined />,
  ImportOutlined: <ImportOutlined />,
  HistoryOutlined: <HistoryOutlined />,
};

export default function AppShell({ children, user }: Props) {
  const { dark, setDark } = useAppTheme();

  const { slug } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const screens = Grid.useBreakpoint();

  const [collapsed, setCollapsed] = useState(false);

  const sanitizeKey = (key: string) => key.replace(/[^a-zA-Z0-9_-]/g, "_");



  const findTopLevelKey = (items: any[], targetKey?: string): string | null => {
    if (!targetKey) return null;

    for (const item of items) {
      if (item.key === targetKey) return item.key;

      if (item.children?.length) {
        const hasChild = (nodes: any[]): boolean => {
          for (const n of nodes) {
            if (n.key === targetKey) return true;
            if (n.children?.length && hasChild(n.children)) return true;
          }
          return false;
        };

        if (hasChild(item.children)) return item.key;
      }
    }

    return null;
  };

  const isMobile = !screens.md;
  const base = `/${slug}`;

  // ✅ TEMP: until backend + redux done
  // Put permissions in localStorage like:
  // localStorage.setItem("fl_permissions", JSON.stringify(["LEADS.VIEW","CONTACTS.VIEW"]))
  const permissions = useSelector((state: any) => state.auth?.permissions || []);


  const onLogout = () => {
    // Clear tokens
    localStorage.clear();

    // Redirect to login
    navigate(`/${slug}/login`); // slug ke saath
  };

  const findParentKeys = (items: any[], targetKey?: string): string[] => {
    if (!targetKey) return [];

    const dfs = (nodes: any[], parents: string[] = []): string[] | null => {
      for (const node of nodes) {
        if (node.key === targetKey) return parents;

        if (node.children?.length) {
          const found = dfs(node.children, [...parents, node.key]);
          if (found) return found;
        }
      }
      return null;
    };

    return dfs(items) || [];
  };


  const rawMenu = useMemo(() => {
    return buildMenuTree(MENU_REGISTRY, permissions, base);
  }, [permissions, base]);

  const rawNavItems = useMemo(() => {
    return buildMenuTree(MENU_REGISTRY, permissions, base);
  }, [permissions, base]);

  // ✅ selectedKey supports nested leaf routes
  const selectedKey = useMemo(() => {
    const path = location.pathname;

    const leafKeys: string[] = [];
    const walk = (arr: any[]) => {
      arr.forEach((n) => {
        if (n?.children?.length) walk(n.children);
        else if (typeof n.key === "string" && n.key.startsWith(base + "/")) leafKeys.push(n.key);
      });
    };
    walk(rawNavItems);

    leafKeys.sort((a, b) => b.length - a.length);
    const match = leafKeys.find((k) => path.startsWith(k));
    return match ? [match] : [];
  }, [rawNavItems, location.pathname, base]);

  const activeTopLevelKey = useMemo(() => {
    return findTopLevelKey(rawNavItems, selectedKey[0]) || null;
  }, [rawNavItems, selectedKey]);

  const parentKeys = useMemo(() => {
    return findParentKeys(rawNavItems, selectedKey[0]);
  }, [rawNavItems, selectedKey]);

  const [openKeys, setOpenKeys] = useState<string[]>([]);

  useEffect(() => {
    setOpenKeys(parentKeys);
  }, [parentKeys]);



  const navItems = useMemo(() => {
    const attachIcons = (items: any[], level = 0): any[] =>
      items.map((i) => {
        const isActiveTop = level === 0 && activeTopLevelKey === i.key;

        return {
          ...i,
          icon: i.icon ? iconMap[i.icon] : i.icon,
          className: [
            `fl-menu-node fl-menu-node-${sanitizeKey(String(i.key))}`,
            level === 0 ? "fl-menu-top" : "fl-menu-child",
            isActiveTop ? "fl-menu-top-active" : "",
          ]
            .filter(Boolean)
            .join(" "),
          children: i.children ? attachIcons(i.children, level + 1) : undefined,
        };
      });

    return attachIcons(rawNavItems);
  }, [rawNavItems, activeTopLevelKey]);



  return (
    <Layout style={{ minHeight: "100vh" }}>
      <style>{`
  :root{
  --fl-bg: ${dark ? "#0b1220" : "#ffffff"};
  --fl-panel: ${dark ? "rgba(255,255,255,0.06)" : "#ffffff"};
  --fl-border: ${dark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)"};
  --fl-text: ${dark ? "rgba(255,255,255,0.90)" : "rgba(15,23,42,0.92)"};
  --fl-text2: ${dark ? "rgba(255,255,255,0.68)" : "rgba(15,23,42,0.58)"};
  --fl-cardbg: ${dark ? "rgba(255,255,255,0.06)" : "#ffffff"};
  --fl-content: ${dark ? "#0b1220" : "#f5f7fb"};
  --fl-shadow: ${dark ? "0 16px 40px rgba(0,0,0,0.35)" : "0 10px 24px rgba(15,23,42,0.06)"};

  --fl-active-bg: ${dark ? "#1668dc" : "#1677ff"};
  --fl-active-text: #ffffff;
  --fl-hover-bg: ${dark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.04)"};
  --fl-child-selected-bg: ${dark ? "rgba(255,255,255,0.10)" : "rgba(22,119,255,0.10)"};
  --fl-child-selected-text: ${dark ? "#ffffff" : "#1677ff"};
}

  .fl-sider {
    background: var(--fl-bg) !important;
    border-right: 1px solid var(--fl-border);
  }

  .fl-sider .ant-layout-sider-children {
    display: flex;
    flex-direction: column;
    height: 100%;
  }

  .fl-brand {
    height: 64px;
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 0 14px;
    border-bottom: 1px solid var(--fl-border);
  }

  .fl-logo {
    width: 38px;
    height: 38px;
    border-radius: 12px;
    background: radial-gradient(circle at 30% 30%, #69b1ff, #1677ff 55%, #10239e);
    box-shadow: 0 12px 28px rgba(22,119,255,0.35);
    display: grid;
    place-items: center;
    color: #fff;
    font-weight: 900;
  }

 .fl-menuWrap{
  padding: 10px 8px;
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
}

  .fl-menuWrap::-webkit-scrollbar {
    width: 5px;
  }
  
  .fl-menuWrap::-webkit-scrollbar-thumb {
    background-color: var(--fl-border);
    border-radius: 4px;
  }

  .fl-pill{
    position: absolute;
    left: 8px;
    right: 8px;
    height: 44px;
    border-radius: 14px;
    background: linear-gradient(135deg, rgba(22,119,255,0.95), rgba(105,177,255,0.55));
    box-shadow: 0 16px 34px rgba(22,119,255,0.25);
    transition: top .18s ease;
    pointer-events: none;
    z-index: 0;
  }

  .fl-menuWrap .ant-menu{
    position: relative;
    z-index: 1;
  }

  .fl-sider .ant-menu{
  background: transparent !important;
  border-inline-end: none !important;
}

.fl-sider .ant-menu-item,
.fl-sider .ant-menu-submenu-title{
  border-radius: 14px !important;
  margin: 6px 6px !important;
  min-height: 44px !important;
  line-height: 44px !important;
  color: var(--fl-text2) !important;
  transition: all .18s ease;
}

  /* hover */
 .fl-sider .ant-menu-item:hover,
.fl-sider .ant-menu-submenu-title:hover{
  background: var(--fl-hover-bg) !important;
  color: var(--fl-text) !important; 
}

 

  /* parent submenu open / selected */
  .fl-sider .ant-menu-submenu-selected > .ant-menu-submenu-title,
  .fl-sider .ant-menu-submenu-open > .ant-menu-submenu-title{
   background: transparent !important;
  color: var(--fl-text) !important;
  font-weight: 600 !important;
  }

  /* submenu wrappers */
  .fl-sider .ant-menu-sub,
  .fl-sider .ant-menu-inline .ant-menu-sub{
    background: transparent !important;
  }

  /* nested submenu items */
 .fl-sider .ant-menu-sub .ant-menu-item{
  min-height: 40px !important;
  line-height: 40px !important;
  margin: 4px 8px 4px 18px !important;
  border-radius: 12px !important;
  color: var(--fl-text2) !important;
  background: transparent !important;
}

  /* nested submenu hover */
 .fl-sider .ant-menu-sub .ant-menu-item:hover{
  background: var(--fl-hover-bg) !important;
  color: var(--fl-text) !important;
}

  /* nested submenu selected */
 .fl-sider .ant-menu-sub .ant-menu-item-selected{
  background: var(--fl-child-selected-bg) !important;
  color: var(--fl-child-selected-text) !important;
  font-weight: 600 !important;
}

  /* arrow */
 .fl-sider .ant-menu-submenu-arrow{
  color: inherit !important;
}

  .fl-sider .ant-menu-submenu-selected > .ant-menu-submenu-title .ant-menu-submenu-arrow,
  .fl-sider .ant-menu-submenu-open > .ant-menu-submenu-title .ant-menu-submenu-arrow{
    color: var(--fl-active-text) !important;
  }

  /* icons inherit color */
  .fl-sider .ant-menu-item .ant-menu-item-icon,
  .fl-sider .ant-menu-submenu-title .ant-menu-item-icon,
  .fl-sider .ant-menu-submenu-title .anticon,
  .fl-sider .ant-menu-item .anticon{
    color: inherit !important;
  }

  .fl-header{
    background: ${dark ? "rgba(11,18,32,0.72)" : "rgba(255,255,255,0.75)"} !important;
    backdrop-filter: blur(12px);
    border-bottom: 1px solid var(--fl-border);
  }

  .fl-contentBg{
    background:
      radial-gradient(circle at 20% 10%, rgba(22,119,255,0.10), transparent 35%),
      radial-gradient(circle at 80% 0%, rgba(105,177,255,0.16), transparent 40%),
      var(--fl-content);
    padding: 16px;
  }

  .fl-card{
    background: var(--fl-cardbg);
    border-radius: 18px;
    padding: 16px;
    min-height: calc(100vh - 64px - 32px);
    box-shadow: var(--fl-shadow);
    border: 1px solid var(--fl-border);
  }

  .fl-profile{
    margin: 10px;
    padding: 12px;
    border-radius: 16px;
    background: var(--fl-panel);
    border: 1px solid var(--fl-border);
    display: flex;
    align-items: center;
    gap: 10px;
  }
    .fl-sider .fl-menu-top-active.ant-menu-item,
.fl-sider .fl-menu-top-active > .ant-menu-submenu-title{
  background: var(--fl-active-bg) !important;
  color: var(--fl-active-text) !important;
  font-weight: 700 !important;
}

.fl-sider .fl-menu-top-active.ant-menu-submenu > .ant-menu-submenu-title{
  background: var(--fl-active-bg) !important;
  color: var(--fl-active-text) !important;
  font-weight: 700 !important;
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
        <div className="fl-brand">
          <div className="fl-logo">F</div>
          {!collapsed && (
            <div style={{ lineHeight: 1.1 }}>
              <div style={{ color: "var(--fl-text)", fontWeight: 800, fontSize: 16 }}>FlexLoud</div>
              <div style={{ color: "var(--fl-text2)", fontSize: 12 }}>Tenant: {slug}</div>
            </div>
          )}
        </div>

        <div className="fl-menuWrap" >
          <Menu
            mode="inline"
            selectedKeys={selectedKey}
            openKeys={openKeys}
            onOpenChange={(keys) => setOpenKeys(keys as string[])}
            items={navItems}
            onClick={(e) => {
              // ✅ only navigate leaf routes (they start with base + "/")
              if (typeof e.key === "string" && e.key.startsWith(base + "/")) navigate(e.key);
            }}
          />
        </div>

        <div>
          <div className="fl-profile" style={{ justifyContent: collapsed ? "center" : "space-between" }}>
            <Space>
              <Avatar style={{ backgroundColor: "#1677ff" }}>
                {(user?.name || "A").slice(0, 1).toUpperCase()}
              </Avatar>
              {!collapsed && (
                <div style={{ lineHeight: 1.1 }}>
                  <div style={{ color: "var(--fl-text)", fontWeight: 800 }}>{user?.name || "Admin"}</div>
                  <div
                    style={{
                      color: "var(--fl-text2)",
                      fontSize: 12,
                      maxWidth: 150,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {user?.email || "admin@flexloud.com"}
                  </div>
                </div>
              )}
            </Space>

            {!collapsed && (
              <Space>
                <BulbOutlined style={{ color: "var(--fl-text2)" }} />
                <Switch checked={dark} onChange={setDark} />
              </Space>
            )}
          </div>

          <div style={{ padding: "0 10px 12px" }}>
            <Button block icon={<LogoutOutlined />} onClick={onLogout}>
              {!collapsed ? "Logout" : null}
            </Button>
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
          <Text style={{ fontWeight: 800, fontSize: 16, color: "var(--fl-text)" }}>CRM</Text>
          <div style={{ marginLeft: "auto" }} />
          <Space>
            <BulbOutlined style={{ color: "var(--fl-text2)" }} />
            <Switch checked={dark} onChange={setDark} />
          </Space>
        </Header>

        <Content className="fl-contentBg">
          <div className="fl-card">{children}</div>
        </Content>
      </Layout>
    </Layout>
  );
}