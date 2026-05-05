import {
    ApartmentOutlined,
    ArrowUpOutlined,
    BarChartOutlined,
    CalendarOutlined,
    CheckCircleOutlined,
    ClockCircleOutlined,
    DatabaseOutlined,
    DollarOutlined,
    FileTextOutlined,
    FilterOutlined,
    LineChartOutlined,
    PhoneOutlined,
    PlusOutlined,
    ReloadOutlined,
    RiseOutlined,
    ShoppingCartOutlined,
    SyncOutlined,
    TeamOutlined,
    UserOutlined,
    WarningOutlined,
} from "@ant-design/icons";
import {
    Alert,
    Button,
    Card,
    Col,
    DatePicker,
    Empty,
    List,
    Progress,
    Row,
    Select,
    Space,
    Spin,
    Statistic,
    Table,
    Tabs,
    Tag,
    Typography,
    theme,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import type { Dayjs } from "dayjs";
import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import {
    Bar,
    BarChart,
    CartesianGrid,
    Cell,
    Legend,
    Line,
    LineChart,
    Pie,
    PieChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from "recharts";
import { fetchDashboardSummary } from "../../redux/reducers/dashboard.slice";
import type { AppDispatch, RootState } from "../../redux/store";

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

type DashboardPeriod = "today" | "week" | "month" | "all";

type DashboardMetric = {
    key: string;
    title: string;
    value: number;
    subtitle: string;
    icon: React.ReactNode;
    colorType: "primary" | "success" | "warning" | "purple" | "danger";
    path?: string;
};

type ModuleUsageRow = {
    key: string;
    module: string;
    total: number;
    trend: string;
    status: "Active" | "Growing" | "Needs Attention";
};

type ActivityRow = {
    id: string;
    title: string;
    description: string;
    time: string;
};

type ChartRow = {
    name: string;
    value: number;
};

type DashboardFilterState = {
    period?: DashboardPeriod;
    assignedTo?: string;
    source?: string;
    dateRange?: [Dayjs, Dayjs] | null;
};

function getToneStyles(token: any, type: DashboardMetric["colorType"]) {
    const map = {
        primary: {
            bg: token.colorPrimaryBg,
            color: token.colorPrimary,
        },
        success: {
            bg: token.colorSuccessBg,
            color: token.colorSuccess,
        },
        warning: {
            bg: token.colorWarningBg,
            color: token.colorWarning,
        },
        purple: {
            bg: token.colorInfoBg,
            color: token.colorInfo,
        },
        danger: {
            bg: token.colorErrorBg,
            color: token.colorError,
        },
    } as const;

    return map[type];
}

function ShellCard({
    title,
    extra,
    children,
    minHeight,
}: {
    title?: React.ReactNode;
    extra?: React.ReactNode;
    children: React.ReactNode;
    minHeight?: number;
}) {
    const { token } = theme.useToken();

    return (
        <Card
            title={title}
            extra={extra}
            styles={{
                body: { padding: 16 },
                header: {
                    minHeight: 52,
                    borderBottom: `1px solid ${token.colorBorderSecondary}`,
                },
            }}
            style={{
                borderRadius: 18,
                border: `1px solid ${token.colorBorderSecondary}`,
                background: token.colorBgContainer,
                boxShadow: token.boxShadowSecondary,
                minHeight,
            }}
        >
            {children}
        </Card>
    );
}

function ChartTooltip() {
    const { token } = theme.useToken();

    return (
        <Tooltip
            contentStyle={{
                background: token.colorBgElevated,
                border: `1px solid ${token.colorBorderSecondary}`,
                borderRadius: 12,
                color: token.colorText,
                boxShadow: token.boxShadowSecondary,
            }}
            labelStyle={{ color: token.colorTextSecondary }}
            cursor={{ fill: token.colorFillSecondary }}
        />
    );
}

function StatusPieChart({ data }: { data: ChartRow[] }) {
    const { token } = theme.useToken();
    const colors = [
        token.colorPrimary,
        token.colorSuccess,
        token.colorWarning,
        token.colorInfo,
        token.colorError,
    ];

    if (!data.length) {
        return <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="No data" />;
    }

    return (
        <ResponsiveContainer width="100%" height={260}>
            <PieChart>
                <Legend />
                <Pie
                    data={data}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={84}
                    innerRadius={48}
                    paddingAngle={4}
                >
                    {data.map((_, i) => (
                        <Cell key={i} fill={colors[i % colors.length]} />
                    ))}
                </Pie>
                <ChartTooltip />
            </PieChart>
        </ResponsiveContainer>
    );
}

function PriorityBarChart({ data }: { data: ChartRow[] }) {
    const { token } = theme.useToken();

    if (!data.length) {
        return <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="No data" />;
    }

    return (
        <ResponsiveContainer width="100%" height={260}>
            <BarChart data={data}>
                <CartesianGrid
                    vertical={false}
                    stroke={token.colorBorderSecondary}
                    strokeDasharray="4 6"
                />
                <XAxis
                    dataKey="name"
                    tick={{ fill: token.colorTextSecondary, fontSize: 12 }}
                    axisLine={false}
                    tickLine={false}
                />
                <YAxis
                    tick={{ fill: token.colorTextSecondary, fontSize: 12 }}
                    axisLine={false}
                    tickLine={false}
                    width={30}
                />
                <ChartTooltip />
                <Bar dataKey="value" radius={[10, 10, 0, 0]} fill={token.colorPrimary} />
            </BarChart>
        </ResponsiveContainer>
    );
}

function SimpleLineChart({ data }: { data: ChartRow[] }) {
    const { token } = theme.useToken();

    if (!data.length) {
        return <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="No data" />;
    }

    return (
        <ResponsiveContainer width="100%" height={260}>
            <LineChart data={data}>
                <CartesianGrid
                    vertical={false}
                    stroke={token.colorBorderSecondary}
                    strokeDasharray="4 6"
                />
                <XAxis
                    dataKey="name"
                    tick={{ fill: token.colorTextSecondary, fontSize: 12 }}
                    axisLine={false}
                    tickLine={false}
                />
                <YAxis
                    tick={{ fill: token.colorTextSecondary, fontSize: 12 }}
                    axisLine={false}
                    tickLine={false}
                    width={36}
                />
                <ChartTooltip />
                <Line
                    type="monotone"
                    dataKey="value"
                    stroke={token.colorPrimary}
                    strokeWidth={3}
                    dot={{ r: 4 }}
                    activeDot={{ r: 6 }}
                />
            </LineChart>
        </ResponsiveContainer>
    );
}

function StatCard({
    title,
    value,
    prefix,
    suffix,
    icon,
    colorType = "primary",
    subtitle,
}: {
    title: string;
    value: number;
    prefix?: React.ReactNode;
    suffix?: string;
    icon: React.ReactNode;
    colorType?: DashboardMetric["colorType"];
    subtitle?: string;
}) {
    const { token } = theme.useToken();
    const tone = getToneStyles(token, colorType);

    return (
        <ShellCard minHeight={126}>
            <div
                style={{
                    display: "flex",
                    alignItems: "flex-start",
                    justifyContent: "space-between",
                    gap: 12,
                }}
            >
                <div>
                    <Text type="secondary" style={{ fontSize: 12 }}>
                        {title}
                    </Text>

                    <Statistic
                        value={value}
                        prefix={prefix}
                        suffix={suffix}
                        valueStyle={{
                            fontSize: 28,
                            fontWeight: 700,
                            color: token.colorText,
                            marginTop: 4,
                        }}
                    />

                    {subtitle ? (
                        <Text type="secondary" style={{ fontSize: 12 }}>
                            {subtitle}
                        </Text>
                    ) : null}
                </div>

                <div
                    style={{
                        width: 44,
                        height: 44,
                        borderRadius: 14,
                        display: "grid",
                        placeItems: "center",
                        background: tone.bg,
                        color: tone.color,
                        fontSize: 18,
                        flexShrink: 0,
                    }}
                >
                    {icon}
                </div>
            </div>
        </ShellCard>
    );
}

function formatRelativeTime(value: string) {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;

    const diffMs = Date.now() - date.getTime();
    const diffMin = Math.floor(diffMs / 60000);
    const diffHr = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHr / 24);

    if (diffMin < 1) return "Just now";
    if (diffMin < 60) return `${diffMin} min ago`;
    if (diffHr < 24) return `${diffHr} hr ago`;
    return `${diffDay} day ago`;
}

function getModuleStatusTag(status: ModuleUsageRow["status"]) {
    if (status === "Active") return "success";
    if (status === "Growing") return "processing";
    return "warning";
}

function getModuleTotal(moduleUsage: ModuleUsageRow[], keywords: string[]) {
    const found = moduleUsage.find((item) =>
        keywords.some((keyword) => item.module.toLowerCase().includes(keyword.toLowerCase()))
    );

    return Number(found?.total || 0);
}

export default function DashboardPage() {
    const { token } = theme.useToken();
    const dispatch = useDispatch<AppDispatch>();
    const navigate = useNavigate();
    const { slug } = useParams<{ slug: string }>();

    const [filters, setFilters] = useState<DashboardFilterState>({
        period: "all",
        assignedTo: undefined,
        source: undefined,
        dateRange: null,
    });
    const buildDashboardFilterPayload = () => {
        const hasDateRange =
            Array.isArray(filters.dateRange) &&
            filters.dateRange.length === 2 &&
            filters.dateRange[0] &&
            filters.dateRange[1];

        return {
            ...(hasDateRange
                ? {
                    start_date: filters.dateRange?.[0]?.format("YYYY-MM-DD"),
                    end_date: filters.dateRange?.[1]?.format("YYYY-MM-DD"),
                }
                : {
                    period: filters.period || "all",
                }),

            ...(filters.assignedTo ? { assigned_to: filters.assignedTo } : {}),
            ...(filters.source ? { source: filters.source } : {}),
        };
    };

    const { summary, summaryLoading, summaryError } = useSelector(
        (state: RootState) => state.dashboard
    );

    useEffect(() => {
        dispatch(fetchDashboardSummary(buildDashboardFilterPayload()));
    }, [dispatch]);

    const rawSummary = summary as any;

    const dashboard = useMemo(
        () => ({
            metrics: {
                totalLeads: summary?.metrics?.totalLeads ?? 0,
                totalContacts: summary?.metrics?.totalContacts ?? 0,
                totalOrganizations: summary?.metrics?.totalOrganizations ?? 0,
                openTasks: summary?.metrics?.openTasks ?? 0,
                overdueTasks: summary?.metrics?.overdueTasks ?? 0,
                totalQuotes: summary?.metrics?.totalQuotes ?? 0,
                visitsThisWeek: summary?.metrics?.visitsThisWeek ?? 0,
                interactionsThisWeek: summary?.metrics?.interactionsThisWeek ?? 0,
                attendanceToday: summary?.metrics?.attendanceToday ?? 0,
                activeUsers: summary?.metrics?.activeUsers ?? 0,
            },
            leadStatusStats: summary?.leadStatusStats ?? [],
            taskPriorityStats: summary?.taskPriorityStats ?? [],
            moduleUsage: (summary?.moduleUsage ?? []) as ModuleUsageRow[],
            recentActivities: (summary?.recentActivities ?? []) as ActivityRow[],
        }),
        [summary]
    );

    const salesMetrics = useMemo(() => {
        const salesOrdersFromModule = getModuleTotal(dashboard.moduleUsage, [
            "sales order",
            "sales orders",
        ]);

        const purchaseOrdersFromModule = getModuleTotal(dashboard.moduleUsage, [
            "purchase order",
            "purchase orders",
        ]);

        return {
            totalQuotes: dashboard.metrics.totalQuotes,
            totalSalesOrders: rawSummary?.salesMetrics?.totalSalesOrders ?? salesOrdersFromModule,
            totalPurchaseOrders:
                rawSummary?.salesMetrics?.totalPurchaseOrders ?? purchaseOrdersFromModule,
            totalRevenue: rawSummary?.salesMetrics?.totalRevenue ?? 0,
            pendingInvoices: rawSummary?.salesMetrics?.pendingInvoices ?? 0,
            conversionRate: rawSummary?.salesMetrics?.conversionRate ?? 0,
            monthlyTrend:
                rawSummary?.salesMetrics?.monthlyTrend ??
                [
                    { name: "Leads", value: dashboard.metrics.totalLeads },
                    { name: "Quotes", value: dashboard.metrics.totalQuotes },
                    { name: "SO", value: salesOrdersFromModule },
                    { name: "PO", value: purchaseOrdersFromModule },
                ],
        };
    }, [dashboard, rawSummary]);

    const tallyMetrics = useMemo(() => {
        const ledgersFromModule = getModuleTotal(dashboard.moduleUsage, ["ledger", "ledgers"]);
        const stockItemsFromModule = getModuleTotal(dashboard.moduleUsage, [
            "stock",
            "items",
            "products",
        ]);

        return {
            ledgersSynced: rawSummary?.tallyMetrics?.ledgersSynced ?? ledgersFromModule,
            stockItemsSynced: rawSummary?.tallyMetrics?.stockItemsSynced ?? stockItemsFromModule,
            salesVouchers: rawSummary?.tallyMetrics?.salesVouchers ?? 0,
            purchaseVouchers: rawSummary?.tallyMetrics?.purchaseVouchers ?? 0,
            syncErrors: rawSummary?.tallyMetrics?.syncErrors ?? 0,
            lastSyncMinutesAgo: rawSummary?.tallyMetrics?.lastSyncMinutesAgo ?? 0,
            syncChart:
                rawSummary?.tallyMetrics?.syncChart ??
                [
                    { name: "Ledgers", value: ledgersFromModule },
                    { name: "Stock", value: stockItemsFromModule },
                    { name: "Sales", value: rawSummary?.tallyMetrics?.salesVouchers ?? 0 },
                    { name: "Purchase", value: rawSummary?.tallyMetrics?.purchaseVouchers ?? 0 },
                    { name: "Errors", value: rawSummary?.tallyMetrics?.syncErrors ?? 0 },
                ],
        };
    }, [dashboard.moduleUsage, rawSummary]);

    const teamMetrics = useMemo(
        () => ({
            activeUsers: dashboard.metrics.activeUsers,
            attendanceToday: dashboard.metrics.attendanceToday,
            visitsThisWeek: dashboard.metrics.visitsThisWeek,
            interactionsThisWeek: dashboard.metrics.interactionsThisWeek,
            openTasks: dashboard.metrics.openTasks,
            overdueTasks: dashboard.metrics.overdueTasks,
            productivityChart:
                rawSummary?.teamMetrics?.productivityChart ??
                [
                    { name: "Users", value: dashboard.metrics.activeUsers },
                    { name: "Present", value: dashboard.metrics.attendanceToday },
                    { name: "Visits", value: dashboard.metrics.visitsThisWeek },
                    { name: "Events", value: dashboard.metrics.interactionsThisWeek },
                    { name: "Tasks", value: dashboard.metrics.openTasks },
                ],
            users: rawSummary?.teamMetrics?.users ?? [],
        }),
        [dashboard, rawSummary]
    );

    const metrics: DashboardMetric[] = useMemo(
        () => [
            {
                key: "leads",
                title: "Total Leads",
                value: dashboard.metrics.totalLeads,
                subtitle: "Current lead base",
                icon: <UserOutlined />,
                colorType: "primary",
                path: `/${slug}/leads/view`,
            },
            {
                key: "contacts",
                title: "Contacts",
                value: dashboard.metrics.totalContacts,
                subtitle: "Saved contact records",
                icon: <TeamOutlined />,
                colorType: "success",
                path: `/${slug}/contacts`,
            },
            {
                key: "organizations",
                title: "Organizations",
                value: dashboard.metrics.totalOrganizations,
                subtitle: "Business accounts",
                icon: <ApartmentOutlined />,
                colorType: "purple",
                path: `/${slug}/organization/view`,
            },
            {
                key: "openTasks",
                title: "Open Tasks",
                value: dashboard.metrics.openTasks,
                subtitle: "Pending work items",
                icon: <ClockCircleOutlined />,
                colorType: "warning",
                path: `/${slug}/tasks`,
            },
            {
                key: "overdueTasks",
                title: "Overdue Tasks",
                value: dashboard.metrics.overdueTasks,
                subtitle: "Need attention today",
                icon: <SyncOutlined />,
                colorType: "danger",
                path: `/${slug}/tasks`,
            },
            {
                key: "quotes",
                title: "Quotes",
                value: dashboard.metrics.totalQuotes,
                subtitle: "Created quotations",
                icon: <FileTextOutlined />,
                colorType: "primary",
                path: `/${slug}/quotes`,
            },
            {
                key: "visits",
                title: "Visits This Week",
                value: dashboard.metrics.visitsThisWeek,
                subtitle: "Field activity",
                icon: <CalendarOutlined />,
                colorType: "success",
                path: `/${slug}/visits`,
            },
            {
                key: "interactions",
                title: "Events",
                value: dashboard.metrics.interactionsThisWeek,
                subtitle: "Calls and meetings",
                icon: <PhoneOutlined />,
                colorType: "purple",
                path: `/${slug}/events`,
            },
        ],
        [dashboard, slug]
    );

    const moduleColumns: ColumnsType<ModuleUsageRow> = useMemo(
        () => [
            {
                title: "Module",
                dataIndex: "module",
                key: "module",
                render: (value) => <Text strong>{value}</Text>,
            },
            {
                title: "Records",
                dataIndex: "total",
                key: "total",
                render: (value) => <Text>{value}</Text>,
            },
            {
                title: "Growth",
                dataIndex: "trend",
                key: "trend",
                render: (value) => (
                    <Tag color="processing" bordered={false} style={{ borderRadius: 999 }}>
                        <ArrowUpOutlined /> {value}
                    </Tag>
                ),
            },
            {
                title: "Status",
                dataIndex: "status",
                key: "status",
                render: (value) => (
                    <Tag
                        color={getModuleStatusTag(value)}
                        bordered={false}
                        style={{ borderRadius: 999 }}
                    >
                        {value}
                    </Tag>
                ),
            },
        ],
        []
    );

    const teamColumns: ColumnsType<any> = useMemo(
        () => [
            {
                title: "User",
                dataIndex: "name",
                key: "name",
                render: (value) => <Text strong>{value || "-"}</Text>,
            },
            {
                title: "Leads",
                dataIndex: "leads",
                key: "leads",
                render: (value) => value ?? 0,
            },
            {
                title: "Tasks",
                dataIndex: "tasks",
                key: "tasks",
                render: (value) => value ?? 0,
            },
            {
                title: "Visits",
                dataIndex: "visits",
                key: "visits",
                render: (value) => value ?? 0,
            },
            {
                title: "Status",
                dataIndex: "status",
                key: "status",
                render: (value) => (
                    <Tag
                        color={value === "Active" ? "success" : "default"}
                        bordered={false}
                        style={{ borderRadius: 999 }}
                    >
                        {value || "Active"}
                    </Tag>
                ),
            },
        ],
        []
    );

    const totalCoreRecords =
        dashboard.metrics.totalLeads +
        dashboard.metrics.totalContacts +
        dashboard.metrics.totalOrganizations +
        dashboard.metrics.totalQuotes +
        dashboard.metrics.interactionsThisWeek +
        dashboard.metrics.visitsThisWeek;

    const moduleHealthPercent = Math.min(
        100,
        Math.round(
            ((dashboard.moduleUsage?.filter((item) => item.total > 0).length || 0) / 7) * 100
        )
    );

    const resetFilters = () => {
        const nextFilters: DashboardFilterState = {
            period: "all",
            assignedTo: undefined,
            source: undefined,
            dateRange: null,
        };

        setFilters(nextFilters);

        dispatch(
            fetchDashboardSummary({
                period: "all",
            })
        );
    };

    const refreshDashboard = () => {
        dispatch(fetchDashboardSummary(buildDashboardFilterPayload()));
    };

    const FilterBar = (
        <ShellCard>
            <Row gutter={[12, 12]} align="middle">
                <Col xs={24} md={6} lg={4}>
                    <Space direction="vertical" size={4} style={{ width: "100%" }}>
                        <Text type="secondary" style={{ fontSize: 12 }}>
                            Period
                        </Text>
                        <Select
                            allowClear
                            value={filters.period}
                            placeholder="Select period"
                            disabled={!!filters.dateRange}
                            style={{ width: "100%" }}
                            onChange={(value) =>
                                setFilters((prev) => ({
                                    ...prev,
                                    period: value,
                                    dateRange: null,
                                }))
                            }
                            options={[
                                { label: "Today", value: "today" },
                                { label: "This Week", value: "week" },
                                { label: "This Month", value: "month" },
                                { label: "All Time", value: "all" },
                            ]}
                        />
                    </Space>
                </Col>

                <Col xs={24} md={10} lg={7}>
                    <Space direction="vertical" size={4} style={{ width: "100%" }}>
                        <Text type="secondary" style={{ fontSize: 12 }}>
                            Date Range
                        </Text>
                        <RangePicker
                            value={filters.dateRange}
                            disabled={!!filters.period}
                            style={{ width: "100%" }}
                            onChange={(value) =>
                                setFilters((prev) => ({
                                    ...prev,
                                    period: undefined,
                                    dateRange: value as [Dayjs, Dayjs] | null,
                                }))
                            }
                        />
                    </Space>
                </Col>

                <Col xs={24} md={6} lg={5}>
                    <Space direction="vertical" size={4} style={{ width: "100%" }}>
                        <Text type="secondary" style={{ fontSize: 12 }}>
                            User
                        </Text>
                        <Select
                            allowClear
                            showSearch
                            value={filters.assignedTo}
                            placeholder="All users"
                            style={{ width: "100%" }}
                            optionFilterProp="label"
                            onChange={(value) =>
                                setFilters((prev) => ({
                                    ...prev,
                                    assignedTo: value,
                                }))
                            }
                            options={(rawSummary?.users ?? rawSummary?.teamMetrics?.users ?? []).map(
                                (user: any) => ({
                                    label: user.name || user.email,
                                    value: user.id,
                                })
                            )}
                        />
                    </Space>
                </Col>

                <Col xs={24} md={6} lg={4}>
                    <Space direction="vertical" size={4} style={{ width: "100%" }}>
                        <Text type="secondary" style={{ fontSize: 12 }}>
                            Source
                        </Text>
                        <Select
                            allowClear
                            value={filters.source}
                            placeholder="All sources"
                            style={{ width: "100%" }}
                            onChange={(value) =>
                                setFilters((prev) => ({
                                    ...prev,
                                    source: value,
                                }))
                            }
                            options={[
                                { label: "System", value: "system" },
                                { label: "Tally", value: "tally" },
                                { label: "Portal", value: "portal" },
                                { label: "Manual", value: "manual" },
                            ]}
                        />
                    </Space>
                </Col>

                <Col xs={24} lg={4}>
                    <Space style={{ width: "100%", justifyContent: "flex-end", marginTop: 22 }} wrap>
                        <Button icon={<FilterOutlined />} onClick={resetFilters}>
                            Reset
                        </Button>
                        <Button
                            type="primary"
                            icon={<ReloadOutlined />}
                            loading={summaryLoading}
                            onClick={refreshDashboard}
                        >
                            Apply
                        </Button>
                    </Space>
                </Col>
            </Row>
        </ShellCard>
    );

    const OverviewTab = (
        <>
            <Row gutter={[14, 14]} style={{ marginBottom: 14 }}>
                {metrics.map((item) => {
                    const tone = getToneStyles(token, item.colorType);

                    return (
                        <Col xs={24} sm={12} lg={8} xl={6} key={item.key}>
                            <ShellCard minHeight={116}>
                                <div
                                    style={{
                                        display: "flex",
                                        alignItems: "flex-start",
                                        justifyContent: "space-between",
                                        gap: 12,
                                        cursor: "pointer",
                                        transition: "all 0.2s ease",
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.transform = "translateY(-4px)";
                                        e.currentTarget.style.boxShadow =
                                            "0 8px 20px rgba(0,0,0,0.08)";
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.transform = "none";
                                        e.currentTarget.style.boxShadow = "none";
                                    }}
                                    onClick={() => navigate(item?.path || "")}
                                >
                                    <div>
                                        <Text type="secondary" style={{ fontSize: 12 }}>
                                            {item.title}
                                        </Text>
                                        <Title level={3} style={{ margin: "8px 0 4px" }}>
                                            {item.value}
                                        </Title>
                                        <Text type="secondary" style={{ fontSize: 12 }}>
                                            {item.subtitle}
                                        </Text>
                                    </div>

                                    <div
                                        style={{
                                            width: 44,
                                            height: 44,
                                            borderRadius: 14,
                                            display: "grid",
                                            placeItems: "center",
                                            background: tone.bg,
                                            color: tone.color,
                                            fontSize: 18,
                                            flexShrink: 0,
                                        }}
                                    >
                                        {item.icon}
                                    </div>
                                </div>
                            </ShellCard>
                        </Col>
                    );
                })}
            </Row>

            <Row gutter={[14, 14]} style={{ marginBottom: 14 }}>
                <Col xs={24}>
                    <ShellCard title={<Text strong>⚡ Action Required</Text>}>
                        <Row gutter={[12, 12]}>
                            <Col xs={24} md={12} lg={8}>
                                <Alert
                                    type="error"
                                    message={`Overdue Tasks: ${dashboard.metrics.overdueTasks}`}
                                    description="These tasks need immediate attention."
                                    showIcon
                                    onClick={() => navigate(`/${slug}/tasks?filter=overdue`)}
                                    style={{ cursor: "pointer", borderRadius: 12 }}
                                />
                            </Col>

                            <Col xs={24} md={12} lg={8}>
                                <Alert
                                    type="warning"
                                    message={`Open Tasks: ${dashboard.metrics.openTasks}`}
                                    description="Pending work items waiting for action."
                                    showIcon
                                    onClick={() => navigate(`/${slug}/tasks`)}
                                    style={{ cursor: "pointer", borderRadius: 12 }}
                                />
                            </Col>

                            <Col xs={24} md={12} lg={8}>
                                <Alert
                                    type="info"
                                    message={`Attendance Today: ${dashboard.metrics.attendanceToday}`}
                                    description="Users marked present for today."
                                    showIcon
                                    onClick={() => navigate(`/${slug}/attendance`)}
                                    style={{ cursor: "pointer", borderRadius: 12 }}
                                />
                            </Col>
                        </Row>
                    </ShellCard>
                </Col>
            </Row>

            <Row gutter={[14, 14]}>
                <Col xs={24} xl={8}>
                    <ShellCard title={<Text strong>Lead Status Distribution</Text>} minHeight={360}>
                        <StatusPieChart data={dashboard.leadStatusStats} />
                    </ShellCard>
                </Col>

                <Col xs={24} xl={8}>
                    <ShellCard title={<Text strong>Task Priority Breakdown</Text>} minHeight={360}>
                        <PriorityBarChart data={dashboard.taskPriorityStats} />
                    </ShellCard>
                </Col>

                <Col xs={24} xl={8}>
                    <ShellCard title={<Text strong>CRM Health Snapshot</Text>} minHeight={360}>
                        <Space direction="vertical" size={18} style={{ width: "100%" }}>
                            <div
                                style={{
                                    padding: 16,
                                    borderRadius: 16,
                                    background: token.colorFillQuaternary,
                                }}
                            >
                                <Text type="secondary">Module coverage</Text>
                                <Title level={3} style={{ margin: "6px 0" }}>
                                    {moduleHealthPercent}%
                                </Title>
                                <Progress
                                    percent={moduleHealthPercent}
                                    strokeColor={token.colorPrimary}
                                />
                            </div>

                            <div
                                style={{
                                    padding: 16,
                                    borderRadius: 16,
                                    background: token.colorFillQuaternary,
                                }}
                            >
                                <Text type="secondary">Core records tracked</Text>
                                <Title level={3} style={{ margin: "6px 0" }}>
                                    {totalCoreRecords}
                                </Title>
                                <Text type="secondary">
                                    Leads, contacts, orgs, quotes, visits and interactions combined
                                </Text>
                            </div>
                        </Space>
                    </ShellCard>
                </Col>

                <Col xs={24} xl={14}>
                    <ShellCard title={<Text strong>Module Usage Summary</Text>} minHeight={380}>
                        <Table
                            rowKey="key"
                            loading={summaryLoading}
                            columns={moduleColumns}
                            dataSource={dashboard.moduleUsage}
                            pagination={false}
                            scroll={{ x: 700 }}
                        />
                    </ShellCard>
                </Col>

                <Col xs={24} xl={10}>
                    <ShellCard title={<Text strong>Recent CRM Activity</Text>} minHeight={380}>
                        {dashboard.recentActivities.length ? (
                            <List
                                dataSource={dashboard.recentActivities}
                                renderItem={(item) => (
                                    <List.Item style={{ paddingInline: 0 }}>
                                        <Space align="start" size={12}>
                                            <div
                                                style={{
                                                    width: 36,
                                                    height: 36,
                                                    borderRadius: 12,
                                                    display: "grid",
                                                    placeItems: "center",
                                                    background: token.colorPrimaryBg,
                                                    color: token.colorPrimary,
                                                    flexShrink: 0,
                                                    marginTop: 2,
                                                }}
                                            >
                                                <CheckCircleOutlined />
                                            </div>

                                            <div>
                                                <Text strong style={{ display: "block" }}>
                                                    {item.title}
                                                </Text>
                                                <Text type="secondary" style={{ display: "block" }}>
                                                    {item.description}
                                                </Text>
                                                <Text type="secondary" style={{ fontSize: 12 }}>
                                                    {formatRelativeTime(item.time)}
                                                </Text>
                                            </div>
                                        </Space>
                                    </List.Item>
                                )}
                            />
                        ) : (
                            <Empty
                                image={Empty.PRESENTED_IMAGE_SIMPLE}
                                description="No recent activity"
                            />
                        )}
                    </ShellCard>
                </Col>
            </Row>
        </>
    );

    const SalesTab = (
        <>
            <Row gutter={[14, 14]} style={{ marginBottom: 14 }}>
                <Col xs={24} sm={12} md={12} lg={6} xl={6}>                    <StatCard
                    title="Quotes"
                    value={salesMetrics.totalQuotes}
                    icon={<FileTextOutlined />}
                    colorType="primary"
                    subtitle="Total quotations"
                />
                </Col>

                <Col xs={24} sm={12} md={12} lg={6} xl={6}>                    <StatCard
                    title="Sales Orders"
                    value={salesMetrics.totalSalesOrders}
                    icon={<ShoppingCartOutlined />}
                    colorType="success"
                    subtitle="Customer orders"
                />
                </Col>

                <Col xs={24} sm={12} md={12} lg={6} xl={6}>                    <StatCard
                    title="Purchase Orders"
                    value={salesMetrics.totalPurchaseOrders}
                    icon={<ShoppingCartOutlined />}
                    colorType="purple"
                    subtitle="Vendor purchase flow"
                />
                </Col>

                <Col xs={24} sm={12} md={12} lg={6} xl={6}>                    <StatCard
                    title="Revenue"
                    value={salesMetrics.totalRevenue}
                    prefix="₹"
                    icon={<DollarOutlined />}
                    colorType="success"
                    subtitle="Backend-ready metric"
                />
                </Col>

                <Col xs={24} sm={12} md={12} lg={6} xl={6}>                    <StatCard
                    title="Pending Invoices"
                    value={salesMetrics.pendingInvoices}
                    icon={<WarningOutlined />}
                    colorType="warning"
                    subtitle="Needs collection"
                />
                </Col>

                <Col xs={24} sm={12} md={12} lg={6} xl={6}>                    <StatCard
                    title="Conversion"
                    value={salesMetrics.conversionRate}
                    suffix="%"
                    icon={<RiseOutlined />}
                    colorType="primary"
                    subtitle="Quote to order"
                />
                </Col>
            </Row>

            <Row gutter={[14, 14]}>
                <Col xs={24} xl={14}>
                    <ShellCard title={<Text strong>Sales Flow</Text>} minHeight={360}>
                        <PriorityBarChart data={salesMetrics.monthlyTrend} />
                    </ShellCard>
                </Col>

                <Col xs={24} xl={10}>
                    <ShellCard title={<Text strong>Suggested Sales Actions</Text>} minHeight={360}>
                        <Space direction="vertical" style={{ width: "100%" }} size={12}>
                            <Alert
                                type="info"
                                showIcon
                                style={{ borderRadius: 12 }}
                                message="Quote to Sales Order tracking"
                                description="Show count/value of quotes converted into sales orders."
                            />

                            <Alert
                                type="warning"
                                showIcon
                                style={{ borderRadius: 12 }}
                                message="Pending PO / SO follow-up"
                                description="Show pending confirmations, expected delivery delays and approval pending orders."
                            />

                            <Alert
                                type="success"
                                showIcon
                                style={{ borderRadius: 12 }}
                                message="Revenue graph"
                                description="Once backend returns amount fields, this tab can show monthly revenue trend."
                            />
                        </Space>
                    </ShellCard>
                </Col>
            </Row>
        </>
    );

    const TallyTab = (
        <>
            <Row gutter={[14, 14]} style={{ marginBottom: 14 }}>
                <Col xs={24} sm={12} md={12} lg={6} xl={6}>                    <StatCard
                    title="Ledgers"
                    value={tallyMetrics.ledgersSynced}
                    icon={<DatabaseOutlined />}
                    colorType="primary"
                    subtitle="Synced parties/accounts"
                />
                </Col>

                <Col xs={24} sm={12} md={12} lg={6} xl={6}>                    <StatCard
                    title="Stock Items"
                    value={tallyMetrics.stockItemsSynced}
                    icon={<ShoppingCartOutlined />}
                    colorType="success"
                    subtitle="Synced products/items"
                />
                </Col>

                <Col xs={24} sm={12} md={12} lg={6} xl={6}>
                    <StatCard
                        title="Sales Vouchers"
                        value={tallyMetrics.salesVouchers}
                        icon={<FileTextOutlined />}
                        colorType="purple"
                        subtitle="Tally sales entries"
                    />
                </Col>

                <Col xs={24} sm={12} md={12} lg={6} xl={6}>
                    <StatCard
                        title="Purchase Vouchers"
                        value={tallyMetrics.purchaseVouchers}
                        icon={<FileTextOutlined />}
                        colorType="warning"
                        subtitle="Tally purchase entries"
                    />
                </Col>

                <Col xs={24} sm={12} md={12} lg={6} xl={6}>
                    <StatCard
                        title="Sync Errors"
                        value={tallyMetrics.syncErrors}
                        icon={<WarningOutlined />}
                        colorType="danger"
                        subtitle="Failed sync records"
                    />
                </Col>

                <Col xs={24} sm={12} md={12} lg={6} xl={6}>
                    <StatCard
                        title="Last Sync"
                        value={tallyMetrics.lastSyncMinutesAgo}
                        suffix="min"
                        icon={<SyncOutlined />}
                        colorType="success"
                        subtitle="Ago"
                    />
                </Col>
            </Row>

            <Row gutter={[14, 14]}>
                <Col xs={24} xl={14}>
                    <ShellCard title={<Text strong>Tally Sync Snapshot</Text>} minHeight={360}>
                        <PriorityBarChart data={tallyMetrics.syncChart} />
                    </ShellCard>
                </Col>

                <Col xs={24} xl={10}>
                    <ShellCard title={<Text strong>Tally Health</Text>} minHeight={360}>
                        <Space direction="vertical" style={{ width: "100%" }} size={12}>
                            <Alert
                                type={tallyMetrics.syncErrors > 0 ? "error" : "success"}
                                showIcon
                                style={{ borderRadius: 12 }}
                                message={
                                    tallyMetrics.syncErrors > 0
                                        ? "Tally sync has errors"
                                        : "Tally sync looks healthy"
                                }
                                description={
                                    tallyMetrics.syncErrors > 0
                                        ? "Open sync errors and retry failed records."
                                        : "No sync error found in current dashboard data."
                                }
                            />

                            <Alert
                                type="info"
                                showIcon
                                style={{ borderRadius: 12 }}
                                message="Useful metric to add"
                                description="Top customers by outstanding, top selling stock items, GST summary and unpaid invoices."
                            />

                            <Alert
                                type="warning"
                                showIcon
                                style={{ borderRadius: 12 }}
                                message="One-way sync friendly"
                                description="Since you want Tally to CRM push only, CRM should show synced data but avoid editing Tally-owned records."
                            />
                        </Space>
                    </ShellCard>
                </Col>
            </Row>
        </>
    );

    const TeamTab = (
        <>
            <Row gutter={[14, 14]} style={{ marginBottom: 14 }}>
                <Col xs={24} sm={12} md={12} lg={6} xl={6}>
                    <StatCard
                        title="Active Users"
                        value={teamMetrics.activeUsers}
                        icon={<TeamOutlined />}
                        colorType="primary"
                        subtitle="CRM users"
                    />
                </Col>

                <Col xs={24} sm={12} md={12} lg={6} xl={6}>
                    <StatCard
                        title="Attendance"
                        value={teamMetrics.attendanceToday}
                        icon={<CheckCircleOutlined />}
                        colorType="success"
                        subtitle="Marked today"
                    />
                </Col>

                <Col xs={24} sm={12} md={12} lg={6} xl={6}>
                    <StatCard
                        title="Visits"
                        value={teamMetrics.visitsThisWeek}
                        icon={<CalendarOutlined />}
                        colorType="purple"
                        subtitle="This week"
                    />
                </Col>

                <Col xs={24} sm={12} md={12} lg={6} xl={6}>
                    <StatCard
                        title="Interactions"
                        value={teamMetrics.interactionsThisWeek}
                        icon={<PhoneOutlined />}
                        colorType="primary"
                        subtitle="Calls/events"
                    />
                </Col>

                <Col xs={24} sm={12} md={12} lg={6} xl={6}>
                    <StatCard
                        title="Open Tasks"
                        value={teamMetrics.openTasks}
                        icon={<ClockCircleOutlined />}
                        colorType="warning"
                        subtitle="Pending"
                    />
                </Col>

                <Col xs={24} sm={12} md={12} lg={6} xl={6}>
                    <StatCard
                        title="Overdue"
                        value={teamMetrics.overdueTasks}
                        icon={<WarningOutlined />}
                        colorType="danger"
                        subtitle="Need attention"
                    />
                </Col>
            </Row>

            <Row gutter={[14, 14]}>
                <Col xs={24} xl={12}>
                    <ShellCard title={<Text strong>Team Productivity</Text>} minHeight={360}>
                        <SimpleLineChart data={teamMetrics.productivityChart} />
                    </ShellCard>
                </Col>

                <Col xs={24} xl={12}>
                    <ShellCard title={<Text strong>User Wise Activity</Text>} minHeight={360}>
                        {teamMetrics.users?.length ? (
                            <Table
                                rowKey={(record) => record.id || record.email || record.name}
                                columns={teamColumns}
                                dataSource={teamMetrics.users}
                                pagination={false}
                                scroll={{ x: 700 }}
                            />
                        ) : (
                            <Empty
                                image={Empty.PRESENTED_IMAGE_SIMPLE}
                                description="User wise backend data not connected yet"
                            />
                        )}
                    </ShellCard>
                </Col>
            </Row>
        </>
    );

    const InsightsTab = (
        <Row gutter={[14, 14]}>
            <Col xs={24} lg={12} xl={8}>
                <ShellCard title={<Text strong>Business Health</Text>} minHeight={260}>
                    <Space direction="vertical" style={{ width: "100%" }} size={12}>
                        <Progress percent={moduleHealthPercent} strokeColor={token.colorPrimary} />
                        <Text type="secondary">
                            Module coverage is calculated from active CRM modules. Improve this by
                            using leads, contacts, quotes, visits, SO/PO and Tally regularly.
                        </Text>
                    </Space>
                </ShellCard>
            </Col>

            <Col xs={24} lg={12} xl={8}>
                <ShellCard title={<Text strong>Attention Needed</Text>} minHeight={260}>
                    <Space direction="vertical" style={{ width: "100%" }} size={12}>
                        <Alert
                            type="error"
                            showIcon
                            style={{ borderRadius: 12 }}
                            message={`${dashboard.metrics.overdueTasks} overdue tasks`}
                            description="Sales team should clear these first."
                        />

                        <Alert
                            type="warning"
                            showIcon
                            style={{ borderRadius: 12 }}
                            message={`${tallyMetrics.syncErrors} Tally sync errors`}
                            description="Failed sync can create mismatch between CRM and Tally."
                        />
                    </Space>
                </ShellCard>
            </Col>

            <Col xs={24} lg={12} xl={8}>
                <ShellCard title={<Text strong>Recommended Next Metrics</Text>} minHeight={260}>
                    <Space direction="vertical" style={{ width: "100%" }} size={12}>
                        <Tag color="processing" bordered={false} style={{ borderRadius: 999 }}>
                            Top customers by order value
                        </Tag>
                        <Tag color="success" bordered={false} style={{ borderRadius: 999 }}>
                            Top products from Tally stock items
                        </Tag>
                        <Tag color="warning" bordered={false} style={{ borderRadius: 999 }}>
                            Pending outstanding amount
                        </Tag>
                        <Tag color="purple" bordered={false} style={{ borderRadius: 999 }}>
                            Quote to order conversion
                        </Tag>
                    </Space>
                </ShellCard>
            </Col>
        </Row>
    );

    return (
        <div
            style={{
                minHeight: "100vh",
                padding: 20,
                background: token.colorBgLayout,
            }}
        >
            <div style={{ maxWidth: 1600, margin: "0 auto" }}>
                <div
                    style={{
                        marginBottom: 16,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: 12,
                        flexWrap: "wrap",
                    }}
                >
                    <div>
                        <Title level={3} style={{ margin: 0 }}>
                            CRM Dashboard
                        </Title>
                        <Text type="secondary">
                            Real usage, sales, Tally and team health of your CRM
                        </Text>
                    </div>

                    <Space wrap>
                        <Button
                            onClick={() => navigate(`/${slug}/leads/create`)}
                            icon={<PlusOutlined />}
                        >
                            Create Lead
                        </Button>
                        <Button
                            type="primary"
                            loading={summaryLoading}
                            onClick={refreshDashboard}
                        >
                            Refresh
                        </Button>
                    </Space>
                </div>

                {summaryError ? (
                    <Alert
                        type="error"
                        showIcon
                        style={{ marginBottom: 16, borderRadius: 12 }}
                        message="Failed to load dashboard"
                        description={summaryError}
                    />
                ) : null}

                <div style={{ marginBottom: 14 }}>{FilterBar}</div>

                <Spin spinning={summaryLoading && !summary}>
                    <Tabs
                        type="card"
                        destroyInactiveTabPane={false}
                        items={[
                            {
                                key: "overview",
                                label: (
                                    <Space>
                                        <BarChartOutlined />
                                        Overview
                                    </Space>
                                ),
                                children: OverviewTab,
                            },
                            {
                                key: "sales",
                                label: (
                                    <Space>
                                        <DollarOutlined />
                                        Sales Metrics
                                    </Space>
                                ),
                                children: SalesTab,
                            },
                            {
                                key: "tally",
                                label: (
                                    <Space>
                                        <DatabaseOutlined />
                                        Tally Metrics
                                    </Space>
                                ),
                                children: TallyTab,
                            },
                            {
                                key: "team",
                                label: (
                                    <Space>
                                        <TeamOutlined />
                                        Team Metrics
                                    </Space>
                                ),
                                children: TeamTab,
                            },
                            {
                                key: "insights",
                                label: (
                                    <Space>
                                        <LineChartOutlined />
                                        Insights
                                    </Space>
                                ),
                                children: InsightsTab,
                            },
                        ]}
                    />
                </Spin>
            </div>
        </div>
    );
}