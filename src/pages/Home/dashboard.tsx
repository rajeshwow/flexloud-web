import {
    ArrowUpOutlined,
    DollarCircleOutlined,
    MoreOutlined,
    RiseOutlined,
    SearchOutlined,
    ShoppingCartOutlined,
    TeamOutlined
} from "@ant-design/icons";
import {
    Button,
    Card,
    Col,
    Input,
    Row,
    Segmented,
    Select,
    Space,
    Table,
    Tag,
    Typography,
    theme,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import { useMemo, useState } from "react";
import {
    Area,
    AreaChart,
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

const { Title, Text } = Typography;

type MetricItem = {
    title: string;
    value: string;
    delta: string;
    icon: React.ReactNode;
    tone: "success" | "primary" | "warning" | "purple";
};

type PaymentRow = {
    key: string;
    company: string;
    owner: string;
    amount: string;
    status: "Paid" | "Pending" | "Review";
    date: string;
};

const metricData: MetricItem[] = [
    { title: "Total Revenue", value: "$351,251.02", delta: "+20%", icon: <DollarCircleOutlined />, tone: "success" },
    { title: "New Deals", value: "$50,030.00", delta: "+18%", icon: <RiseOutlined />, tone: "primary" },
    { title: "Open Orders", value: "$873.00", delta: "+05%", icon: <ShoppingCartOutlined />, tone: "warning" },
    { title: "Active Users", value: "$473.00", delta: "+12%", icon: <TeamOutlined />, tone: "purple" },
];

const overviewData = [
    { month: "Jan", revenue: 12000, pipeline: 9000, orders: 8000 },
    { month: "Feb", revenue: 15000, pipeline: 11000, orders: 9300 },
    { month: "Mar", revenue: 14000, pipeline: 12500, orders: 9800 },
    { month: "Apr", revenue: 21000, pipeline: 14000, orders: 11000 },
    { month: "May", revenue: 18000, pipeline: 15000, orders: 12100 },
    { month: "Jun", revenue: 26000, pipeline: 18000, orders: 14300 },
    { month: "Jul", revenue: 24000, pipeline: 21000, orders: 15100 },
    { month: "Aug", revenue: 31000, pipeline: 25000, orders: 17200 },
    { month: "Sep", revenue: 28000, pipeline: 23000, orders: 16500 },
    { month: "Oct", revenue: 35000, pipeline: 27000, orders: 19100 },
    { month: "Nov", revenue: 30000, pipeline: 26000, orders: 18200 },
    { month: "Dec", revenue: 39000, pipeline: 30500, orders: 21400 },
];

const miniBars = [
    { label: "M1", value: 8 },
    { label: "M2", value: 14 },
    { label: "M3", value: 10 },
    { label: "M4", value: 18 },
    { label: "M5", value: 12 },
    { label: "M6", value: 22 },
    { label: "M7", value: 16 },
    { label: "M8", value: 25 },
];

const lineTrend = [
    { name: "1", value: 38 },
    { name: "2", value: 52 },
    { name: "3", value: 46 },
    { name: "4", value: 62 },
    { name: "5", value: 58 },
    { name: "6", value: 78 },
    { name: "7", value: 65 },
    { name: "8", value: 88 },
];

const pieData = [
    { name: "Direct", value: 32 },
    { name: "Referral", value: 24 },
    { name: "Paid", value: 19 },
    { name: "Organic", value: 25 },
];

const balanceBars = [
    { name: "Jan", thisYear: 18, lastYear: 10 },
    { name: "Feb", thisYear: 8, lastYear: 13 },
    { name: "Mar", thisYear: 23, lastYear: 17 },
    { name: "Apr", thisYear: 12, lastYear: 19 },
    { name: "May", thisYear: 25, lastYear: 7 },
    { name: "Jun", thisYear: 19, lastYear: 21 },
    { name: "Jul", thisYear: 28, lastYear: 12 },
    { name: "Aug", thisYear: 16, lastYear: 24 },
    { name: "Sep", thisYear: 31, lastYear: 15 },
];

const paymentsData: PaymentRow[] = [
    { key: "1", company: "Acme Health", owner: "Raju", amount: "$12,400", status: "Paid", date: "12 Mar 2026" },
    { key: "2", company: "Orbit Labs", owner: "Nisha", amount: "$8,300", status: "Pending", date: "11 Mar 2026" },
    { key: "3", company: "GreenNova", owner: "Amit", amount: "$15,800", status: "Review", date: "10 Mar 2026" },
    { key: "4", company: "BluePeak", owner: "Karan", amount: "$6,700", status: "Paid", date: "09 Mar 2026" },
    { key: "5", company: "CareGrid", owner: "Ravi", amount: "$19,200", status: "Pending", date: "08 Mar 2026" },
];

function toneStyles(token: any, tone: MetricItem["tone"]) {
    const map = {
        success: { bg: token.colorSuccessBg, color: token.colorSuccess },
        primary: { bg: token.colorPrimaryBg, color: token.colorPrimary },
        warning: { bg: token.colorWarningBg, color: token.colorWarning },
        purple: { bg: token.colorInfoBg, color: token.colorInfo },
    } as const;
    return map[tone];
}

function statusColor(status: PaymentRow["status"]) {
    if (status === "Paid") return "success";
    if (status === "Pending") return "warning";
    return "processing";
}

function ShellCard({ title, extra, children, minHeight }: { title?: React.ReactNode; extra?: React.ReactNode; children: React.ReactNode; minHeight?: number }) {
    const { token } = theme.useToken();

    return (
        <Card
            title={title}
            extra={extra}
            styles={{
                body: { padding: 16 },
                header: { minHeight: 52, borderBottom: `1px solid ${token.colorBorderSecondary}` },
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

function OverviewChart({ mode }: { mode: "revenue" | "pipeline" | "orders" }) {
    const { token } = theme.useToken();
    const dataKey = mode;

    return (
        <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={overviewData}>
                <defs>
                    <linearGradient id="overviewFill" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={token.colorPrimary} stopOpacity={0.28} />
                        <stop offset="100%" stopColor={token.colorPrimary} stopOpacity={0.02} />
                    </linearGradient>
                </defs>
                <CartesianGrid vertical={false} stroke={token.colorBorderSecondary} strokeDasharray="4 6" />
                <XAxis dataKey="month" tick={{ fill: token.colorTextSecondary, fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: token.colorTextSecondary, fontSize: 12 }} axisLine={false} tickLine={false} width={44} />
                <ChartTooltip />
                <Area
                    type="monotone"
                    dataKey={dataKey}
                    stroke={token.colorPrimary}
                    fill="url(#overviewFill)"
                    strokeWidth={3}
                    activeDot={{ r: 6, fill: token.colorPrimary }}
                />
            </AreaChart>
        </ResponsiveContainer>
    );
}

function TinyBarChart() {
    const { token } = theme.useToken();
    return (
        <ResponsiveContainer width="100%" height={90}>
            <BarChart data={miniBars}>
                <ChartTooltip />
                <Bar dataKey="value" radius={[10, 10, 0, 0]}>
                    {miniBars.map((_, i) => (
                        <Cell key={i} fill={i === miniBars.length - 1 ? token.colorPrimary : token.colorFillSecondary} />
                    ))}
                </Bar>
            </BarChart>
        </ResponsiveContainer>
    );
}

function TinyLineChart() {
    const { token } = theme.useToken();
    return (
        <ResponsiveContainer width="100%" height={120}>
            <LineChart data={lineTrend}>
                <ChartTooltip />
                <Line type="monotone" dataKey="value" stroke={token.colorSuccess} strokeWidth={3} dot={false} activeDot={{ r: 5 }} />
            </LineChart>
        </ResponsiveContainer>
    );
}

function SourcePieChart() {
    const { token } = theme.useToken();
    const colors = [token.colorPrimary, token.colorSuccess, token.colorWarning, token.colorInfo];

    return (
        <ResponsiveContainer width="100%" height={200}>
            <PieChart>
                <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={74} innerRadius={42} paddingAngle={4}>
                    {pieData.map((_, i) => (
                        <Cell key={i} fill={colors[i % colors.length]} />
                    ))}
                </Pie>
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <ChartTooltip />
            </PieChart>
        </ResponsiveContainer>
    );
}

function BalanceChart() {
    const { token } = theme.useToken();

    return (
        <ResponsiveContainer width="100%" height={260}>
            <BarChart data={balanceBars} barGap={8}>
                <CartesianGrid vertical={false} stroke={token.colorBorderSecondary} strokeDasharray="4 6" />
                <XAxis dataKey="name" tick={{ fill: token.colorTextSecondary, fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: token.colorTextSecondary, fontSize: 12 }} axisLine={false} tickLine={false} width={30} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <ChartTooltip />
                <Bar dataKey="thisYear" name="This year" radius={[8, 8, 0, 0]} fill={token.colorSuccess} />
                <Bar dataKey="lastYear" name="Last year" radius={[8, 8, 0, 0]} fill={token.colorPrimary} />
            </BarChart>
        </ResponsiveContainer>
    );
}

export default function PremiumDashboard() {
    const { token } = theme.useToken();
    const [mode, setMode] = useState<"revenue" | "pipeline" | "orders">("revenue");

    const columns: ColumnsType<PaymentRow> = useMemo(
        () => [
            {
                title: "Company",
                dataIndex: "company",
                key: "company",
                render: (value, record) => (
                    <Space direction="vertical" size={0}>
                        <Text strong>{value}</Text>
                        <Text type="secondary" style={{ fontSize: 12 }}>
                            Owner: {record.owner}
                        </Text>
                    </Space>
                ),
            },
            {
                title: "Amount",
                dataIndex: "amount",
                key: "amount",
                render: (value) => <Text strong>{value}</Text>,
            },
            {
                title: "Status",
                dataIndex: "status",
                key: "status",
                render: (value) => (
                    <Tag color={statusColor(value)} bordered={false} style={{ borderRadius: 999 }}>
                        {value}
                    </Tag>
                ),
            },
            { title: "Date", dataIndex: "date", key: "date" },
        ],
        []
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
                <Row gutter={[14, 14]} style={{ marginBottom: 14 }}>
                    {metricData.map((item) => {
                        const tone = toneStyles(token, item.tone);
                        return (
                            <Col xs={24} sm={12} xl={6} key={item.title}>
                                <ShellCard minHeight={112}>
                                    <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
                                        <div>
                                            <Text type="secondary" style={{ fontSize: 12 }}>{item.title}</Text>
                                            <Title level={4} style={{ margin: "8px 0 6px" }}>{item.value}</Title>
                                            <Tag bordered={false} style={{ borderRadius: 999, background: tone.bg, color: tone.color, marginInlineEnd: 0 }}>
                                                <ArrowUpOutlined /> {item.delta}
                                            </Tag>
                                        </div>
                                        <div
                                            style={{
                                                width: 42,
                                                height: 42,
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

                <Row gutter={[14, 14]}>
                    <Col xs={24} xl={16}>
                        <ShellCard
                            title={<Text strong>Revenue Analytics</Text>}
                            extra={
                                <Space wrap>
                                    <Segmented
                                        value={mode}
                                        onChange={(v) => setMode(v as typeof mode)}
                                        options={[
                                            { label: "Revenue", value: "revenue" },
                                            { label: "Pipeline", value: "pipeline" },
                                            { label: "Orders", value: "orders" },
                                        ]}
                                    />
                                    <Button type="text" icon={<MoreOutlined />} />
                                </Space>
                            }
                            minHeight={360}
                        >
                            <Row gutter={[14, 14]}>
                                <Col xs={24} lg={16}>
                                    <OverviewChart mode={mode} />
                                </Col>
                                <Col xs={24} lg={8}>
                                    <Space direction="vertical" size={14} style={{ width: "100%" }}>
                                        <div style={{ padding: 14, borderRadius: 16, background: token.colorFillQuaternary }}>
                                            <Text type="secondary">Net balance</Text>
                                            <Title level={3} style={{ margin: "6px 0" }}>$179,080</Title>
                                            <Text type="secondary">Monthly recurring growth and strong close rate.</Text>
                                        </div>
                                        <div style={{ padding: 14, borderRadius: 16, background: token.colorFillQuaternary }}>
                                            <Text type="secondary">Profit estimate</Text>
                                            <Title level={3} style={{ margin: "6px 0" }}>5,276.33</Title>
                                            <Text style={{ color: token.colorError }}>-2.5% vs last month</Text>
                                        </div>
                                        <div style={{ padding: 14, borderRadius: 16, background: token.colorFillQuaternary }}>
                                            <Text type="secondary">Revenue movement</Text>
                                            <TinyLineChart />
                                        </div>
                                    </Space>
                                </Col>
                            </Row>
                        </ShellCard>
                    </Col>

                    <Col xs={24} xl={8}>
                        <ShellCard
                            title={<Text strong>Quarterly reports</Text>}
                            extra={<Select size="small" defaultValue="weekly" options={[{ label: "Weekly", value: "weekly" }, { label: "Monthly", value: "monthly" }]} style={{ width: 96 }} />}
                            minHeight={360}
                        >
                            <div style={{ marginBottom: 10, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                                <div>
                                    <Text type="secondary">Total value</Text>
                                    <Title level={4} style={{ margin: "6px 0 0" }}>$1.36K</Title>
                                </div>
                                <div style={{ width: 140 }}>
                                    <TinyBarChart />
                                </div>
                            </div>

                            <div style={{ padding: 14, borderRadius: 16, background: token.colorFillQuaternary, marginBottom: 14 }}>
                                <Text type="secondary">Data Company</Text>
                                <Title level={4} style={{ margin: "6px 0 2px" }}>$24,001.72</Title>
                                <TinyLineChart />
                            </div>

                            <Space direction="vertical" size={10} style={{ width: "100%" }}>
                                {metricData.map((item) => {
                                    const tone = toneStyles(token, item.tone);
                                    return (
                                        <div key={item.title} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
                                            <Space>
                                                <div style={{ width: 32, height: 32, borderRadius: 12, background: tone.bg, color: tone.color, display: "grid", placeItems: "center" }}>
                                                    {item.icon}
                                                </div>
                                                <div>
                                                    <Text style={{ display: "block", fontSize: 13 }}>{item.title}</Text>
                                                    <Text type="secondary" style={{ fontSize: 12 }}>Analytics summary</Text>
                                                </div>
                                            </Space>
                                            <Text strong>{item.value}</Text>
                                        </div>
                                    );
                                })}
                            </Space>
                        </ShellCard>
                    </Col>

                    <Col xs={24} md={12} xl={6}>
                        <ShellCard title={<Text strong>Traffic Sources</Text>} minHeight={300}>
                            <SourcePieChart />
                        </ShellCard>
                    </Col>

                    <Col xs={24} md={12} xl={6}>
                        <ShellCard title={<Text strong>Progress Ring</Text>} minHeight={300}>
                            <div style={{ display: "grid", placeItems: "center", paddingTop: 6 }}>
                                <SourcePieChart />
                            </div>
                        </ShellCard>
                    </Col>

                    <Col xs={24} md={12} xl={6}>
                        <ShellCard title={<Text strong>Deal Quality</Text>} minHeight={300}>
                            <Space direction="vertical" size={14} style={{ width: "100%" }}>
                                {[
                                    ["Hot leads", "92%"],
                                    ["Qualified", "78%"],
                                    ["Proposal", "65%"],
                                    ["Closing", "48%"],
                                ].map(([label, value], i) => (
                                    <div key={label}>
                                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                                            <Text>{label}</Text>
                                            <Text strong>{value}</Text>
                                        </div>
                                        <div style={{ height: 8, borderRadius: 999, background: token.colorFillSecondary, overflow: "hidden" }}>
                                            <div
                                                style={{
                                                    width: value,
                                                    height: "100%",
                                                    background: i % 2 === 0 ? token.colorPrimary : token.colorSuccess,
                                                    borderRadius: 999,
                                                }}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </Space>
                        </ShellCard>
                    </Col>

                    <Col xs={24} md={12} xl={6}>
                        <ShellCard title={<Text strong>Momentum</Text>} minHeight={300}>
                            <TinyBarChart />
                            <div style={{ marginTop: 18, padding: 14, borderRadius: 16, background: token.colorFillQuaternary }}>
                                <Text type="secondary">Data summary</Text>
                                <Title level={4} style={{ margin: "6px 0" }}>26,968</Title>
                                <Text type="secondary">Stable uplift across acquisition and renewals.</Text>
                            </div>
                        </ShellCard>
                    </Col>

                    <Col xs={24} xl={24}>
                        <ShellCard
                            title={<Text strong>Company Balance</Text>}
                            extra={
                                <Space wrap>
                                    <Input allowClear prefix={<SearchOutlined />} placeholder="Search report" style={{ width: 200 }} />
                                    <Select defaultValue="6m" options={[{ label: "6 months", value: "6m" }, { label: "12 months", value: "12m" }]} style={{ width: 110 }} />
                                    <Button type="text" icon={<MoreOutlined />} />
                                </Space>
                            }
                            minHeight={380}
                        >
                            <BalanceChart />
                        </ShellCard>
                    </Col>

                    <Col xs={24}>
                        <ShellCard title={<Text strong>Recent Transactions</Text>} extra={<Button>View all</Button>}>
                            <Table
                                rowKey="key"
                                columns={columns}
                                dataSource={paymentsData}
                                pagination={{ pageSize: 5 }}
                                scroll={{ x: 760 }}
                            />
                        </ShellCard>
                    </Col>
                </Row>
            </div>
        </div>
    );
}
