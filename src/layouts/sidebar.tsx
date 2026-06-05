

import {
  ApartmentOutlined,
  AppstoreOutlined,
  AuditOutlined,
  BankOutlined,
  BarChartOutlined,
  BellOutlined,
  BgColorsOutlined,
  // BoxOutlined,
  BulbOutlined,
  CalendarOutlined,
  CheckCircleOutlined,
  CheckSquareOutlined,
  ClockCircleOutlined,
  CloudSyncOutlined,
  CloudUploadOutlined,
  ContactsOutlined,
  DashboardOutlined,
  DollarOutlined,
  EnvironmentOutlined,
  EyeOutlined,
  FieldTimeOutlined,
  FileDoneOutlined,
  FilePdfOutlined,
  FileProtectOutlined,
  FileTextOutlined,
  FireOutlined,
  FolderOutlined,
  FundProjectionScreenOutlined,
  GiftOutlined,
  HistoryOutlined,
  // optional extra icons (safe to keep)
  HomeOutlined,
  ImportOutlined,
  InboxOutlined,
  LineChartOutlined,
  LoginOutlined,
  LogoutOutlined,
  MailOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  MoonOutlined,
  PartitionOutlined,
  PhoneOutlined,
  PlusOutlined,
  RiseOutlined,
  SafetyCertificateOutlined,
  ScheduleOutlined,
  SettingOutlined,
  ShoppingOutlined,
  SolutionOutlined,
  TagOutlined,
  TeamOutlined,
  TrophyOutlined,
  TruckOutlined,
  UserOutlined
} from "@ant-design/icons";
import { Avatar, Badge, Button, Divider, Grid, Layout, Menu, message, Popover, Progress, Space, Switch, theme, Tooltip, Typography } from "antd";
import { startTransition, useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useAppTheme } from "../theme/ThemeProvider";


// ✅ your registry + builder
import { useDispatch, useSelector } from "react-redux";
import { buildMenuTree } from "../menu/buildMenu";
import { MENU_REGISTRY } from "../menu/menuRegistry";
import GlobalHeaderSearch from "../pages/global-search/GlobalHeaderSearch";
import NotificationCenterDrawer from "../pages/my-day/components/NotificationCenterDrawer";
import { clockInAttendance, clockOutAttendance, getTodayAttendance } from "../redux/reducers/attendance.slice";
import { fetchMyDayCounts, setNotificationDrawerOpen } from "../redux/reducers/myDay.slice";
import { getTargetProgress } from "../redux/reducers/user.slice";
import type { AppDispatch, RootState } from "../redux/store";
import GlobalQuickCreate from "./GlobalQuickCreate";
import HeaderThemeSwitcher from "./HeaderThemeSwitcher";

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
  ContactsOutlined: <ContactsOutlined />,
  FireOutlined: <FireOutlined />,
  TrophyOutlined: <TrophyOutlined />,
  FileProtectOutlined: <FileProtectOutlined />,
  TruckOutlined: <TruckOutlined />,
  FieldTimeOutlined: <FieldTimeOutlined />,
  ShoppingOutlined: <ShoppingOutlined />,
  SolutionOutlined: <SolutionOutlined />,
  CheckSquareOutlined: <CheckSquareOutlined />,
  EnvironmentOutlined: <EnvironmentOutlined />,
  SafetyCertificateOutlined: <SafetyCertificateOutlined />,
  CloudUploadOutlined: <CloudUploadOutlined />,
  AuditOutlined: <AuditOutlined />,
  FundProjectionScreenOutlined: <FundProjectionScreenOutlined />,
  LineChartOutlined: <LineChartOutlined />,
  InboxOutlined: <InboxOutlined />,
  FileDoneOutlined: <FileDoneOutlined />,
  ApartmentOutlined: <ApartmentOutlined />,
  CloudSyncOutlined: <CloudSyncOutlined />,
  BgColorsOutlined: <BgColorsOutlined />,

};

type AttendanceWatchProps = {
  dark: boolean;
};

type HeaderTargetProgress = {
  target_amount: number;
  achieved_amount: number;
  remaining_amount: number;
  progress_percent: number;
};

function TargetProgressMini({ dark }: { dark: boolean }) {
  const { token } = theme.useToken();
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState<HeaderTargetProgress | null>(null);
  const dispatch = useDispatch<AppDispatch>();
  const { slug } = useParams();

  useEffect(() => {
    let mounted = true;

    const STORAGE_KEY = `fl_target_progress_cache_${slug || "default"}`;
    const TIME_KEY = `fl_target_progress_last_fetch_${slug || "default"}`;
    const MIN_GAP_MS = 60_000;

    const cached = sessionStorage.getItem(STORAGE_KEY);

    if (cached) {
      try {
        setProgress(JSON.parse(cached));
      } catch {
        sessionStorage.removeItem(STORAGE_KEY);
      }
    }

    const normalizeProgressResponse = (response: any): HeaderTargetProgress | null => {
      const payload =
        response?.data?.data ||
        response?.data ||
        response;

      if (!payload) return null;

      return {
        target_amount: Number(payload.target_amount || 0),
        achieved_amount: Number(payload.achieved_amount || 0),
        remaining_amount: Number(payload.remaining_amount || 0),
        progress_percent: Number(payload.progress_percent || 0),
      };
    };

    const loadTargetProgress = async () => {
      const lastFetch = Number(sessionStorage.getItem(TIME_KEY) || 0);
      const now = Date.now();

      if (now - lastFetch < MIN_GAP_MS && cached) return;

      try {
        setLoading(true);
        sessionStorage.setItem(TIME_KEY, String(now));

        const response = await dispatch(getTargetProgress()).unwrap();

        if (!mounted) return;

        const nextProgress = normalizeProgressResponse(response);
        setProgress(nextProgress);

        if (nextProgress) {
          sessionStorage.setItem(STORAGE_KEY, JSON.stringify(nextProgress));
        } else {
          sessionStorage.removeItem(STORAGE_KEY);
        }
      } catch {
        if (!mounted) return;
        setProgress(null);
        sessionStorage.removeItem(STORAGE_KEY);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadTargetProgress();

    return () => {
      mounted = false;
    };
  }, [dispatch, slug]);

  const targetAmount = Number(progress?.target_amount || 0);
  const achievedAmount = Number(progress?.achieved_amount || 0);
  const remainingAmount = Number(progress?.remaining_amount || 0);
  const percent = Math.min(Number(progress?.progress_percent || 0), 100);

  const hasTarget = targetAmount > 0;

  return (
    <Tooltip
      title={
        hasTarget ? (
          <span style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <span>Achieved - ₹{achievedAmount.toLocaleString("en-IN")}</span>
            <span>Target - ₹{targetAmount.toLocaleString("en-IN")}</span>
            <span>Left - ₹{remainingAmount.toLocaleString("en-IN")}</span>
          </span>
        ) : (
          "No target set"
        )
      }
    >
      <div
        style={{
          width: 240,
          height: 38,
          padding: "6px 10px",
          borderRadius: token.borderRadiusLG,
          border: `1px solid ${token.colorBorderSecondary}`,
          background: token.colorBgContainer,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 8,
            lineHeight: 1,
            marginBottom: 4,
          }}
        >
          <Space size={5}>
            <TrophyOutlined
              style={{
                color: hasTarget ? token.colorWarning : token.colorTextTertiary,
                fontSize: 12,
              }}
            />
            <Text style={{ fontSize: 11, lineHeight: 1 }} type="secondary">
              ₹{achievedAmount.toLocaleString("en-IN")}
            </Text>
          </Space>

          <Text
            style={{
              fontSize: 11,
              lineHeight: 1,
              color: hasTarget
                ? percent >= 100
                  ? token.colorSuccess
                  : token.colorPrimary
                : token.colorTextTertiary,
              fontWeight: 700,
            }}
          >
            {loading ? "..." : `${percent}%`}
          </Text>

          <Space size={5}>
            <RiseOutlined
              style={{
                color: hasTarget
                  ? percent >= 100
                    ? token.colorSuccess
                    : token.colorPrimary
                  : token.colorTextTertiary,
                fontSize: 12,
              }}
            />
            <Text style={{ fontSize: 11, lineHeight: 1 }} type="secondary">
              ₹{targetAmount.toLocaleString("en-IN")}
            </Text>
          </Space>
        </div>

        <Progress
          percent={percent}
          showInfo={false}
          size="small"
          status={percent >= 100 ? "success" : "active"}
          style={{
            lineHeight: 1,
            margin: 0,
          }}
        />
      </div>
    </Tooltip>
  );
}

type BrowserLocation = {
  lat: number;
  lng: number;
  accuracy_meters: number | null;
};

function getCurrentPositionAsync(): Promise<BrowserLocation> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("Geolocation is not supported in this browser"));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          accuracy_meters: position.coords.accuracy ?? null,
        });
      },
      (error) => {
        reject(new Error(error.message || "Unable to fetch location"));
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0,
      }
    );
  });
}

async function reverseGeocode(lat: number, lng: number): Promise<string | null> {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`
    );

    if (!response.ok) return null;

    const data = await response.json();
    return data?.display_name || null;
  } catch {
    return null;
  }
}

function AttendanceWatch({ dark }: AttendanceWatchProps) {
  const [popoverOpen, setPopoverOpen] = useState(false);
  const currentTime = new Date();
  const [now, setNow] = useState(currentTime.getTime());

  const dispatch = useDispatch<AppDispatch>();

  const {
    todayAttendance,
    todayAttendanceLoading,
    clockInLoading,
    clockOutLoading,
  } = useSelector((state: RootState) => state.attendance);

  useEffect(() => {
    const interval = setInterval(() => {
      setNow(Date.now());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (todayAttendanceLoading) return;
    if (todayAttendance) return;

    dispatch(getTodayAttendance());
  }, [dispatch, todayAttendanceLoading, todayAttendance]);

  const handleClockIn = async () => {
    try {
      const currentLocation = await getCurrentPositionAsync();
      const currentAddress = await reverseGeocode(
        currentLocation.lat,
        currentLocation.lng
      );

      await dispatch(
        clockInAttendance({
          source: "web",
          remarks: "",
          location: {
            lat: currentLocation.lat,
            lng: currentLocation.lng,
            address: currentAddress,
            accuracy_meters: currentLocation.accuracy_meters,
          },
        })
      ).unwrap();

      message.success("Clock-in successful");
      dispatch(getTodayAttendance());
    } catch (error: any) {
      message.error(error || "Clock-in failed");
    }
  };

  const handleClockOut = async () => {
    try {
      const currentLocation = await getCurrentPositionAsync();
      const currentAddress = await reverseGeocode(
        currentLocation.lat,
        currentLocation.lng
      );

      await dispatch(
        clockOutAttendance({
          remarks: "",
          location: {
            lat: currentLocation.lat,
            lng: currentLocation.lng,
            address: currentAddress,
            accuracy_meters: currentLocation.accuracy_meters,
          },
        })
      ).unwrap();

      message.success("Clock-out successful");
      dispatch(getTodayAttendance());
    } catch (error: any) {
      message.error(error || "Clock-out failed");
    }
  };

  const currentDate = new Date(now);

  const formattedDate = currentDate.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    weekday: "long",
  });

  const activeSession = todayAttendance?.active_session;
  const latestSession =
    activeSession ||
    (todayAttendance?.today_sessions?.length
      ? todayAttendance.today_sessions[0]
      : null);

  const clockInTimeText: any = todayAttendance?.today_sessions?.length
    ? new Date(todayAttendance.today_sessions[todayAttendance?.today_sessions?.length - 1].clock_in_at as any).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    } as any)
    : "--:--:--";

  const clockOutTimeText = latestSession?.clock_out_at
    ? new Date(latestSession.clock_out_at as any).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    } as any)
    : "--:--:--";

  const rightSideTimeText = todayAttendance?.is_clocked_in
    ? new Date(now).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    })
    : latestSession?.clock_out_at
      ? clockOutTimeText
      : "--:--:--";

  const formatDuration = (totalSeconds: number) => {
    const safeSeconds = Math.max(0, totalSeconds);

    const hours = Math.floor(safeSeconds / 3600);
    const minutes = Math.floor((safeSeconds % 3600) / 60);
    const seconds = safeSeconds % 60;

    return [hours, minutes, seconds]
      .map((unit) => String(unit).padStart(2, "0"))
      .join(":");
  };

  const workedSeconds =
    latestSession?.clock_in_at && todayAttendance?.is_clocked_in
      ? Math.floor((now - new Date(latestSession.clock_in_at).getTime()) / 1000)
      : (todayAttendance?.total_worked_minutes_today || 0) * 60;

  const workedDurationText = formatDuration(workedSeconds);

  const shiftMinutes = 9 * 60;
  const workedMinutes =
    latestSession?.clock_in_at && todayAttendance?.is_clocked_in
      ? Math.floor(workedSeconds / 60)
      : todayAttendance?.total_worked_minutes_today || 0;

  const progressPercent = Math.min((workedMinutes / shiftMinutes) * 100, 100);

  const popoverContent = (
    <div
      style={{
        width: 320,
        borderRadius: 14,
      }}
    >
      <div
        style={{
          border: "1px solid #1677ff",
          borderRadius: 14,
          padding: 16,
          background: dark ? "#111827" : "#ffffff",
          boxShadow: dark
            ? "0 10px 30px rgba(0,0,0,0.35)"
            : "0 10px 30px rgba(0,0,0,0.08)",
        }}
      >
        <div
          style={{
            fontWeight: 400,
            fontSize: 16,
            color: dark ? "#f5f5f5" : "#111827",
            marginBottom: 16,
          }}
        >
          Let&apos;s Get the Ball Rolling
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 8,
          }}
        >
          <span
            style={{
              color: dark ? "rgba(255,255,255,0.75)" : "#666",
              fontSize: 14,
            }}
          >
            {formattedDate}
          </span>

          <span
            style={{
              color: dark ? "#fff" : "#111",
              fontWeight: 700,
              fontSize: 16,
              lineHeight: 1,
            }}
          >
            {workedDurationText}
          </span>
        </div>

        <div
          style={{
            height: 6,
            background: dark ? "rgba(255,255,255,0.12)" : "#e5e7eb",
            borderRadius: 999,
            marginBottom: 12,
            overflow: "hidden",
          }}
        >
          <div
            style={{
              width: `${progressPercent}%`,
              height: "100%",
              background: "#bfbfbf",
              transition: "width 0.3s ease",
            }}
          />
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            color: dark ? "rgba(255,255,255,0.75)" : "#666",
            fontSize: 14,
            marginBottom: 18,

          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, }}>
            <ClockCircleOutlined />
            <span>{clockInTimeText}</span>
          </div>

          <span style={{ fontSize: 12, }}>{rightSideTimeText}</span>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 16,
            fontSize: 14,
          }}
        >
          <span style={{ color: dark ? "#e5e7eb" : "#222" }}>
            Shift: 09:30 AM - 06:30 PM
          </span>

          <Button type="link" size="small" style={{ padding: 0 }}>
            View Policies
          </Button>
        </div>

        <Button
          block
          // size="large"
          type="primary"
          icon={todayAttendance?.is_clocked_in ? <LogoutOutlined /> : <LoginOutlined />}
          loading={clockInLoading || clockOutLoading}
          onClick={todayAttendance?.is_clocked_in ? handleClockOut : handleClockIn}

        >
          {todayAttendance?.is_clocked_in ? "Clockout" : "Clockin"}
        </Button>
      </div>
    </div>
  );



  return (
    <Popover
      content={popoverContent}
      trigger={["hover"]}
      placement="bottomRight"
      open={popoverOpen}
      onOpenChange={setPopoverOpen}
      overlayInnerStyle={{
        padding: 0,
        background: "transparent",
        boxShadow: "none",
      }}
    >
      <Button
        type="default"
        icon={todayAttendance?.is_clocked_in ? <LogoutOutlined /> : <LoginOutlined />}
        style={{ minWidth: 110 }}
      >
        {todayAttendance?.is_clocked_in ? "Clock Out" : "Clock In"}
      </Button>
    </Popover>
  );
}

export default function AppShell({ children, user }: Props) {
  const { dark, setDark, accentTheme } = useAppTheme();

  const { slug } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const screens = Grid.useBreakpoint();

  const dispatch = useDispatch<AppDispatch>();
  const { counts } = useSelector((state: RootState) => state.myDay);

  const [collapsed, setCollapsed] = useState(false);

  const sanitizeKey = (key: string) => key.replace(/[^a-zA-Z0-9_-]/g, "_");



  useEffect(() => {
    const STORAGE_KEY = "fl_my_day_counts_last_fetch";
    const MIN_GAP_MS = 60_000;

    const fetchCountsSafely = () => {
      const lastFetch = Number(sessionStorage.getItem(STORAGE_KEY) || 0);
      const now = Date.now();

      if (now - lastFetch < MIN_GAP_MS) return;

      sessionStorage.setItem(STORAGE_KEY, String(now));
      dispatch(fetchMyDayCounts({ assigned: "me" }));
    };

    fetchCountsSafely();

    const timer = window.setInterval(fetchCountsSafely, MIN_GAP_MS);

    return () => window.clearInterval(timer);
  }, [dispatch]);


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
  const permissions = useSelector((state: RootState) => state.auth?.permissions || []);


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
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setOpenKeys((prev) => {
      // route change pe selected menu ka parent open karo
      // but user manually submenu open kar raha hai to usko baar-baar reset mat karo
      const routeParentKey = parentKeys.slice(-1);

      if (!routeParentKey.length) return prev;

      const alreadySame =
        prev.length === routeParentKey.length &&
        prev.every((key, index) => key === routeParentKey[index]);

      return alreadySame ? prev : routeParentKey;
    });
  }, [location.pathname]);

  const handleOpenChange = (keys: string[]) => {
    setOpenKeys((prev) => {
      const latestOpenKey = keys.find((key) => !prev.includes(key));

      if (!latestOpenKey) {
        return [];
      }

      return [latestOpenKey];
    });
  };



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

 --fl-active-bg: var(--crm-primary);
--fl-active-text: #ffffff;
--fl-hover-bg: ${dark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.04)"};
--fl-child-selected-bg: var(--crm-active-tab-bg);
--fl-child-selected-text: ${dark ? "#ffffff" : "var(--crm-primary)"};
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
      background: radial-gradient(circle at 30% 30%, var(--crm-primary-hover), var(--crm-primary) 58%, var(--crm-primary-active));
  box-shadow: 0 12px 28px color-mix(in srgb, var(--crm-primary) 35%, transparent);
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
    radial-gradient(circle at 20% 10%, color-mix(in srgb, var(--crm-primary) 10%, transparent), transparent 35%),
    radial-gradient(circle at 80% 0%, color-mix(in srgb, var(--crm-primary-hover) 14%, transparent), transparent 40%),
    var(--fl-content);
  padding: 6px;
}

  .fl-card{
    background: var(--fl-cardbg);
    border-radius: 18px;
    padding: 6px;
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
            onOpenChange={(keys) => handleOpenChange(keys as string[])}
            items={navItems}
            onClick={(e) => {
              if (typeof e.key !== "string") return;
              if (!e.key.startsWith(base + "/")) return;
              if (e.key === location.pathname) return;

              startTransition(() => {
                navigate(e.key);
              });
            }}
          />
        </div>

        <div>
          <div className="fl-profile" style={{ justifyContent: collapsed ? "center" : "space-between" }}>
            <Space>
              <Avatar style={{ backgroundColor: "var(--crm-primary)" }}>
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

          <Space size={12}>
            <GlobalHeaderSearch />
            <Divider type="vertical" />
            <TargetProgressMini dark={dark} />
            <Divider type="vertical" />
            <AttendanceWatch dark={dark} />
            <Divider type="vertical" />
            <HeaderThemeSwitcher />
            <Divider type="vertical" />

            {/* here i want half moon icon */}
            <MoonOutlined onClick={() => setDark(!dark)} style={{ color: "var(--fl-text2)" }} />
            <Divider type="vertical" />
            <Button
              type="text"
              onClick={() => dispatch(setNotificationDrawerOpen(true))}
              style={{ display: "flex", alignItems: "center", justifyContent: "center" }}
            >
              <Badge count={counts.total} size="small">
                <BellOutlined style={{ fontSize: 18 }} />
              </Badge>
            </Button>
          </Space>
        </Header>

        <Content className="fl-contentBg">
          <div className="fl-card">{children}</div>
        </Content>
        <GlobalQuickCreate />
        <NotificationCenterDrawer />
      </Layout>
    </Layout>
  );
}