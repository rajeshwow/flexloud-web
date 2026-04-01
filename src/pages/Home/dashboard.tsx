import {
    ApartmentOutlined,
    ArrowUpOutlined,
    CalendarOutlined,
    CheckCircleOutlined,
    ClockCircleOutlined,
    FileTextOutlined,
    PhoneOutlined,
    PlusOutlined,
    SyncOutlined,
    TeamOutlined,
    UserOutlined,
} from "@ant-design/icons";
import {
    Alert,
    Button,
    Card,
    Col,
    Empty,
    List,
    Progress,
    Row,
    Space,
    Spin,
    Table,
    Tag,
    Typography,
    theme,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import { useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import {
    Bar,
    BarChart,
    CartesianGrid,
    Cell,
    Legend,
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
            {/* //i want to add legend here */}
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

export default function DashboardPage() {
    const { token } = theme.useToken();
    const dispatch = useDispatch<AppDispatch>();
    const navigate = useNavigate();
    const { slug } = useParams<{ slug: string }>();

    const { summary, summaryLoading, summaryError } = useSelector(
        (state: RootState) => state.dashboard
    );

    useEffect(() => {
        dispatch(fetchDashboardSummary({ period: "month" }));
    }, [dispatch]);

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
        [dashboard]
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
                    <Tag
                        color="processing"
                        bordered={false}
                        style={{ borderRadius: 999 }}
                    >
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
                            Real usage and health of your current CRM implementation
                        </Text>
                    </div>

                    <Space wrap>
                        <Button onClick={() => navigate(`/${slug}/leads/create`)} icon={<PlusOutlined />}>Create Lead</Button>
                        <Button
                            type="primary"
                            loading={summaryLoading}
                            onClick={() => {
                                dispatch(fetchDashboardSummary({ period: "month" }));
                            }}
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

                <Spin spinning={summaryLoading && !summary}>
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
                                                e.currentTarget.style.boxShadow = "0 8px 20px rgba(0,0,0,0.08)";
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
                                        <Progress percent={moduleHealthPercent} strokeColor={token.colorPrimary} />
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

                                    {/* <div
                                        style={{
                                            padding: 16,
                                            borderRadius: 16,
                                            background: token.colorFillQuaternary,
                                            cursor: "pointer",
                                        }}
                                        onClick={() => navigate(`/${slug}/attendance`)}
                                    >
                                        <Text type="secondary">Attendance today</Text>
                                        <Title level={3} style={{ margin: "6px 0" }}>
                                            {dashboard.metrics.attendanceToday}
                                        </Title>
                                        <Text type="secondary">
                                            Users marked in for today
                                        </Text>
                                    </div> */}
                                </Space>
                            </ShellCard>
                        </Col>

                        <Col xs={24} xl={14}>
                            <ShellCard
                                title={<Text strong>Module Usage Summary</Text>}
                                minHeight={380}
                            >
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
                            <ShellCard
                                title={<Text strong>Recent CRM Activity</Text>}
                                minHeight={380}
                            >
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
                                    <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="No recent activity" />
                                )}
                            </ShellCard>
                        </Col>
                    </Row>
                </Spin>
            </div>
        </div>
    );
}