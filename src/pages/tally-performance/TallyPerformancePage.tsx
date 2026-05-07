import {
    BarChartOutlined,
    ClockCircleOutlined,
    EyeOutlined,
    FileSearchOutlined,
    ReloadOutlined,
    RiseOutlined,
    SafetyCertificateOutlined,
    TeamOutlined,
    ThunderboltOutlined,
    WarningOutlined
} from "@ant-design/icons";
import {
    Alert,
    Button,
    Card,
    Col,
    Drawer,
    Empty,
    Progress,
    Row,
    Space,
    Statistic,
    Table,
    Tabs,
    Tag,
    Tooltip,
    Typography,
    message,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import type {
    EmployeeOutstanding,
    EmployeeTallyPerformance,
    RiskyCustomer,
    TallyAgeingRow,
} from "../../redux/reducers/tallyPerformance.slice";
import {
    fetchEmployeeTallyOutstandings,
    fetchEmployeeTallyPerformance,
    fetchRiskyCustomers,
    fetchTallyAgeingReport,
    fetchTallyPerformanceSummary,
    resetEmployeeOutstandings,
} from "../../redux/reducers/tallyPerformance.slice";

const { Title, Text } = Typography;

const formatAmount = (value: any) => {
    const amount = Number(value || 0);

    return new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 0,
    }).format(amount);
};

const toNumber = (value: any) => Number(value || 0);

const getStatusTag = (status?: string) => {
    const value = String(status || "").toLowerCase();

    if (value === "excellent") {
        return <Tag color="success">Excellent</Tag>;
    }

    if (value === "good") {
        return <Tag color="processing">Good</Tag>;
    }

    if (value === "needs attention") {
        return <Tag color="warning">Needs Attention</Tag>;
    }

    if (value === "critical") {
        return <Tag color="error">Critical</Tag>;
    }

    return <Tag>No Outstanding</Tag>;
};

const getRiskTag = (risk?: string) => {
    const value = String(risk || "").toLowerCase();

    if (value === "critical") return <Tag color="error">Critical</Tag>;
    if (value === "high") return <Tag color="volcano">High</Tag>;
    if (value === "medium") return <Tag color="warning">Medium</Tag>;

    return <Tag color="success">Low</Tag>;
};

function SummaryCard({
    title,
    value,
    icon,
    loading,
    suffix,
}: {
    title: string;
    value: any;
    icon: React.ReactNode;
    loading?: boolean;
    suffix?: string;
}) {
    return (
        <Card
            loading={loading}
            style={{
                height: "100%",
                borderRadius: 16,
            }}
            styles={{
                body: {
                    padding: 18,
                },
            }}
        >
            <Space align="start" style={{ width: "100%", justifyContent: "space-between" }}>
                <div>
                    <Text type="secondary">{title}</Text>
                    <div style={{ marginTop: 8 }}>
                        <Statistic
                            value={value}
                            precision={0}
                            prefix={suffix === "money" ? "₹" : undefined}
                            valueStyle={{
                                fontSize: 24,
                                fontWeight: 700,
                            }}
                        />
                    </div>
                </div>

                <div
                    style={{
                        width: 42,
                        height: 42,
                        borderRadius: 14,
                        display: "grid",
                        placeItems: "center",
                        background: "rgba(22,119,255,0.1)",
                        color: "#1677ff",
                        fontSize: 20,
                    }}
                >
                    {icon}
                </div>
            </Space>
        </Card>
    );
}

export default function TallyPerformancePage() {
    const dispatch = useDispatch<any>();

    const {
        summary,
        employees,
        employeeOutstandings,
        ageing,
        riskyCustomers,
        summaryLoading,
        employeesLoading,
        outstandingsLoading,
        ageingLoading,
        riskyCustomersLoading,
        error,
    } = useSelector((state: any) => state.tallyPerformance);

    const [drawerOpen, setDrawerOpen] = useState(false);
    const [selectedEmployee, setSelectedEmployee] =
        useState<EmployeeTallyPerformance | null>(null);

    const loadInitialData = async () => {
        try {
            await Promise.all([
                dispatch(fetchTallyPerformanceSummary()).unwrap(),
                dispatch(fetchEmployeeTallyPerformance()).unwrap(),
                dispatch(fetchTallyAgeingReport()).unwrap(),
                dispatch(fetchRiskyCustomers()).unwrap(),
            ]);
        } catch (err: any) {
            message.error(err || "Failed to load Tally performance");
        }
    };

    useEffect(() => {
        loadInitialData();
    }, []);

    const openOutstandingDrawer = async (record: EmployeeTallyPerformance) => {
        try {
            setSelectedEmployee(record);
            setDrawerOpen(true);
            await dispatch(fetchEmployeeTallyOutstandings(record.employee_id)).unwrap();
        } catch (err: any) {
            message.error(err || "Failed to load employee outstandings");
        }
    };

    const closeDrawer = () => {
        setDrawerOpen(false);
        setSelectedEmployee(null);
        dispatch(resetEmployeeOutstandings());
    };

    const employeeColumns: ColumnsType<EmployeeTallyPerformance> =
        [
            {
                title: "Employee",
                dataIndex: "employee_name",
                key: "employee_name",
                fixed: "left",
                width: 240,
                render: (_: any, record) => (
                    <Space direction="vertical" size={0}>
                        <Text strong>{record.employee_name}</Text>
                        <Text type="secondary" style={{ fontSize: 12 }}>
                            {record.employee_email}
                        </Text>
                        {(record.employee_code || record.department) && (
                            <Text type="secondary" style={{ fontSize: 12 }}>
                                {record.employee_code || "-"} {record.department ? `• ${record.department}` : ""}
                            </Text>
                        )}
                    </Space>
                ),
            },
            {
                title: "Assigned Orgs",
                dataIndex: "assigned_organizations",
                key: "assigned_organizations",
                width: 130,
                align: "center",
            },
            {
                title: "Receivable",
                dataIndex: "total_receivable",
                key: "total_receivable",
                width: 150,
                align: "right",
                sorter: (a, b) => toNumber(a.total_receivable) - toNumber(b.total_receivable),
                render: (value) => <Text strong>{formatAmount(value)}</Text>,
            },
            {
                title: "Overdue",
                dataIndex: "overdue_receivable",
                key: "overdue_receivable",
                width: 150,
                align: "right",
                sorter: (a, b) =>
                    toNumber(a.overdue_receivable) - toNumber(b.overdue_receivable),
                render: (value) => (
                    <Text type={toNumber(value) > 0 ? "danger" : undefined} strong>
                        {formatAmount(value)}
                    </Text>
                ),
            },
            {
                title: "Critical",
                dataIndex: "critical_receivable",
                key: "critical_receivable",
                width: 150,
                align: "right",
                render: (value) => (
                    <Text type={toNumber(value) > 0 ? "danger" : undefined}>
                        {formatAmount(value)}
                    </Text>
                ),
            },
            {
                title: "Bills",
                dataIndex: "receivable_bills",
                key: "receivable_bills",
                width: 100,
                align: "center",
            },
            {
                title: "Score",
                dataIndex: "performance_score",
                key: "performance_score",
                width: 170,
                sorter: (a, b) =>
                    toNumber(a.performance_score) - toNumber(b.performance_score),
                render: (value) => {
                    const score = toNumber(value);

                    return (
                        <Space direction="vertical" size={0} style={{ width: 130 }}>
                            <Text strong>{score.toFixed(0)}%</Text>
                            <Progress percent={score} size="small" showInfo={false} />
                        </Space>
                    );
                },
            },
            {
                title: "Status",
                dataIndex: "performance_status",
                key: "performance_status",
                width: 150,
                render: getStatusTag,
            },
            {
                title: "Action",
                key: "action",
                width: 120,
                fixed: "right",
                render: (_: any, record) => (
                    <Tooltip title="View outstanding bills">
                        <Button
                            icon={<EyeOutlined />}
                            onClick={() => openOutstandingDrawer(record)}
                        >
                            View
                        </Button>
                    </Tooltip>
                ),
            },
        ];

    const outstandingColumns: ColumnsType<EmployeeOutstanding> = [
        {
            title: "Party",
            dataIndex: "organization_name",
            key: "organization_name",
            width: 220,
            render: (_: any, record) => (
                <Space direction="vertical" size={0}>
                    <Text strong>{record.organization_name || record.ledger_name}</Text>
                    <Text type="secondary" style={{ fontSize: 12 }}>
                        {record.organization_email || "-"}
                    </Text>
                </Space>
            ),
        },
        {
            title: "Voucher",
            dataIndex: "voucher_number",
            key: "voucher_number",
            width: 160,
            render: (_: any, record) => (
                <Space direction="vertical" size={0}>
                    <Text>{record.voucher_number || "-"}</Text>
                    <Text type="secondary" style={{ fontSize: 12 }}>
                        {record.voucher_type || "-"}
                    </Text>
                </Space>
            ),
        },
        {
            title: "Bill Ref",
            dataIndex: "bill_ref",
            key: "bill_ref",
            width: 140,
        },
        {
            title: "Voucher Date",
            dataIndex: "voucher_date",
            key: "voucher_date",
            width: 140,
            render: (value) => value || "-",
        },
        {
            title: "Due Date",
            dataIndex: "due_date",
            key: "due_date",
            width: 140,
            render: (value) => value || "-",
        },
        {
            title: "Ageing",
            dataIndex: "ageing_bucket",
            key: "ageing_bucket",
            width: 130,
            render: (value) => <Tag>{value}</Tag>,
        },
        {
            title: "Overdue Days",
            dataIndex: "overdue_days",
            key: "overdue_days",
            width: 130,
            align: "center",
            render: (value) => (
                <Text type={toNumber(value) > 0 ? "danger" : undefined}>{value}</Text>
            ),
        },
        {
            title: "Bill Amount",
            dataIndex: "bill_amount",
            key: "bill_amount",
            width: 140,
            align: "right",
            render: formatAmount,
        },
        {
            title: "Pending",
            dataIndex: "pending_amount",
            key: "pending_amount",
            width: 140,
            align: "right",
            render: (value) => <Text strong>{formatAmount(value)}</Text>,
        },
    ];

    const ageingColumns: ColumnsType<TallyAgeingRow> = [
        {
            title: "Employee",
            dataIndex: "employee_name",
            key: "employee_name",
            fixed: "left",
            width: 220,
            render: (value) => <Text strong>{value}</Text>,
        },
        {
            title: "No Due Date",
            dataIndex: "no_due_date",
            key: "no_due_date",
            align: "right",
            render: formatAmount,
        },
        {
            title: "Not Due",
            dataIndex: "not_due",
            key: "not_due",
            align: "right",
            render: formatAmount,
        },
        {
            title: "1-30",
            dataIndex: "bucket_1_30",
            key: "bucket_1_30",
            align: "right",
            render: formatAmount,
        },
        {
            title: "31-60",
            dataIndex: "bucket_31_60",
            key: "bucket_31_60",
            align: "right",
            render: formatAmount,
        },
        {
            title: "61-90",
            dataIndex: "bucket_61_90",
            key: "bucket_61_90",
            align: "right",
            render: formatAmount,
        },
        {
            title: "90+",
            dataIndex: "bucket_above_90",
            key: "bucket_above_90",
            align: "right",
            render: (value) => (
                <Text type={toNumber(value) > 0 ? "danger" : undefined} strong>
                    {formatAmount(value)}
                </Text>
            ),
        },
        {
            title: "Total",
            dataIndex: "total_pending",
            key: "total_pending",
            align: "right",
            render: (value) => <Text strong>{formatAmount(value)}</Text>,
        },
    ];

    const riskyCustomerColumns: ColumnsType<RiskyCustomer> = [
        {
            title: "Customer",
            dataIndex: "organization_name",
            key: "organization_name",
            width: 260,
            render: (_: any, record) => (
                <Space direction="vertical" size={0}>
                    <Text strong>{record.organization_name}</Text>
                    <Text type="secondary" style={{ fontSize: 12 }}>
                        {record.organization_email || "-"}
                    </Text>
                </Space>
            ),
        },
        {
            title: "Assigned To",
            dataIndex: "assigned_to_name",
            key: "assigned_to_name",
            width: 180,
            render: (value) => value || "-",
        },
        {
            title: "Overdue Bills",
            dataIndex: "overdue_bills",
            key: "overdue_bills",
            width: 130,
            align: "center",
        },
        {
            title: "Overdue Amount",
            dataIndex: "overdue_amount",
            key: "overdue_amount",
            width: 160,
            align: "right",
            render: (value) => <Text strong>{formatAmount(value)}</Text>,
        },
        {
            title: "Max Days",
            dataIndex: "max_overdue_days",
            key: "max_overdue_days",
            width: 120,
            align: "center",
            render: (value) => (
                <Text type={toNumber(value) > 0 ? "danger" : undefined}>{value}</Text>
            ),
        },
        {
            title: "Risk",
            dataIndex: "risk_level",
            key: "risk_level",
            width: 120,
            render: getRiskTag,
        },
    ];

    return (
        <div style={{ padding: 20 }}>
            <Space
                align="center"
                style={{
                    width: "100%",
                    justifyContent: "space-between",
                    marginBottom: 18,
                }}
            >
                <div>
                    <Title level={3} style={{ margin: 0 }}>
                        Tally Performance
                    </Title>
                    <Text type="secondary">
                        Track employee-wise receivables, overdue bills and collection risk.
                    </Text>
                </div>

                <Button
                    icon={<ReloadOutlined />}
                    onClick={loadInitialData}
                    loading={
                        summaryLoading ||
                        employeesLoading ||
                        ageingLoading ||
                        riskyCustomersLoading
                    }
                >
                    Refresh
                </Button>
            </Space>

            {error && (
                <Alert
                    type="error"
                    message={error}
                    showIcon
                    style={{ marginBottom: 16, borderRadius: 12 }}
                />
            )}

            <Row gutter={[16, 16]} style={{ marginBottom: 18 }}>
                <Col xs={24} sm={12} lg={6}>
                    <SummaryCard
                        loading={summaryLoading}
                        title="Total Receivable"
                        value={toNumber(summary?.total_receivable)}
                        suffix="money"
                        icon={<RiseOutlined />}
                    />
                </Col>

                <Col xs={24} sm={12} lg={6}>
                    <SummaryCard
                        loading={summaryLoading}
                        title="Overdue Receivable"
                        value={toNumber(summary?.overdue_receivable)}
                        suffix="money"
                        icon={<WarningOutlined />}
                    />
                </Col>

                <Col xs={24} sm={12} lg={6}>
                    <SummaryCard
                        loading={summaryLoading}
                        title="Critical Receivable"
                        value={toNumber(summary?.critical_receivable)}
                        suffix="money"
                        icon={<ThunderboltOutlined />}
                    />
                </Col>

                <Col xs={24} sm={12} lg={6}>
                    <SummaryCard
                        loading={summaryLoading}
                        title="Receivable Bills"
                        value={toNumber(summary?.receivable_bills)}
                        icon={<FileSearchOutlined />}
                    />
                </Col>

                <Col xs={24} sm={12} lg={6}>
                    <SummaryCard
                        loading={summaryLoading}
                        title="Total Payable"
                        value={toNumber(summary?.total_payable)}
                        suffix="money"
                        icon={<ClockCircleOutlined />}
                    />
                </Col>

                <Col xs={24} sm={12} lg={6}>
                    <SummaryCard
                        loading={summaryLoading}
                        title="Mapped Ledgers"
                        value={toNumber(summary?.mapped_ledgers_with_outstanding)}
                        icon={<SafetyCertificateOutlined />}
                    />
                </Col>

                <Col xs={24} sm={12} lg={6}>
                    <SummaryCard
                        loading={summaryLoading}
                        title="Unmapped Ledgers"
                        value={toNumber(summary?.unmapped_ledgers)}
                        icon={<BarChartOutlined />}
                    />
                </Col>

                <Col xs={24} sm={12} lg={6}>
                    <SummaryCard
                        loading={summaryLoading}
                        title="Unassigned Orgs"
                        value={toNumber(summary?.unassigned_organizations)}
                        icon={<TeamOutlined />}
                    />
                </Col>
            </Row>

            <Card
                style={{ borderRadius: 16 }}
                styles={{
                    body: {
                        padding: 16,
                    },
                }}
            >
                <Tabs
                    defaultActiveKey="employees"
                    items={[
                        {
                            key: "employees",
                            label: "Employee Performance",
                            children: (
                                <Table
                                    rowKey="employee_id"
                                    loading={employeesLoading}
                                    columns={employeeColumns}
                                    dataSource={employees}
                                    scroll={{ x: 1350 }}
                                    pagination={{
                                        pageSize: 10,
                                        showSizeChanger: true,
                                    }}
                                    locale={{
                                        emptyText: (
                                            <Empty description="No employee performance found" />
                                        ),
                                    }}
                                />
                            ),
                        },
                        {
                            key: "ageing",
                            label: "Ageing Report",
                            children: (
                                <Table
                                    rowKey="employee_id"
                                    loading={ageingLoading}
                                    columns={ageingColumns}
                                    dataSource={ageing}
                                    scroll={{ x: 1000 }}
                                    pagination={{
                                        pageSize: 10,
                                        showSizeChanger: true,
                                    }}
                                    locale={{
                                        emptyText: <Empty description="No ageing report found" />,
                                    }}
                                />
                            ),
                        },
                        {
                            key: "risky-customers",
                            label: "Risky Customers",
                            children: (
                                <Table
                                    rowKey="organization_id"
                                    loading={riskyCustomersLoading}
                                    columns={riskyCustomerColumns}
                                    dataSource={riskyCustomers}
                                    scroll={{ x: 1000 }}
                                    pagination={{
                                        pageSize: 10,
                                        showSizeChanger: true,
                                    }}
                                    locale={{
                                        emptyText: <Empty description="No risky customers found" />,
                                    }}
                                />
                            ),
                        },
                    ]}
                />
            </Card>

            <Drawer
                title={
                    <Space direction="vertical" size={0}>
                        <Text strong>Outstanding Bills</Text>
                        <Text type="secondary" style={{ fontSize: 12 }}>
                            {selectedEmployee?.employee_name || "-"}
                        </Text>
                    </Space>
                }
                width={980}
                open={drawerOpen}
                onClose={closeDrawer}
                destroyOnClose
            >
                <Table
                    rowKey="id"
                    loading={outstandingsLoading}
                    columns={outstandingColumns}
                    dataSource={employeeOutstandings}
                    scroll={{ x: 1300 }}
                    pagination={{
                        pageSize: 10,
                        showSizeChanger: true,
                    }}
                    locale={{
                        emptyText: <Empty description="No outstanding bills found" />,
                    }}
                    summary={(pageData) => {
                        const totalPending = pageData.reduce(
                            (sum, item) => sum + toNumber(item.pending_amount),
                            0,
                        );

                        return (
                            <Table.Summary.Row>
                                <Table.Summary.Cell index={0} colSpan={8}>
                                    <Text strong>Total Pending</Text>
                                </Table.Summary.Cell>
                                <Table.Summary.Cell index={8} align="right">
                                    <Text strong>{formatAmount(totalPending)}</Text>
                                </Table.Summary.Cell>
                            </Table.Summary.Row>
                        );
                    }}
                />
            </Drawer>
        </div>
    );
}