import {
    ApartmentOutlined,
    BarChartOutlined,
    EyeOutlined,
    RiseOutlined,
    WalletOutlined
} from "@ant-design/icons";
import {
    Button,
    Card,
    Col,
    Drawer,
    message,
    Row,
    Space,
    Statistic,
    Table,
    Tag,
    Typography,
} from "antd";
import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
    fetchCostCenterOutstandings,
    fetchCostCenterSummary,
} from "../../redux/reducers/costCenters.slice";

const { Title, Text } = Typography;

function money(value: any) {
    const num = Number(value || 0);

    return new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 0,
    }).format(num);
}

export default function CostCenterAnalyticsPage() {
    const dispatch = useDispatch<any>();

    const {
        summary,
        summaryLoading,
        outstandings,
        outstandingsLoading,
    } = useSelector((state: any) => state.costCenters);

    const [drawerOpen, setDrawerOpen] = useState(false);
    const [selectedCostCenter, setSelectedCostCenter] = useState<any>(null);

    useEffect(() => {
        dispatch(fetchCostCenterSummary())
            .unwrap()
            .catch((err: any) => message.error(err || "Failed to fetch cost center summary"));
    }, [dispatch]);

    const totals = summary?.totals || {};
    const rows = summary?.rows || [];

    const openOutstandings = async (record: any) => {
        setSelectedCostCenter(record);
        setDrawerOpen(true);

        try {
            await dispatch(fetchCostCenterOutstandings(record.id)).unwrap();
        } catch (error: any) {
            message.error(error || "Failed to fetch outstandings");
        }
    };

    const columns = useMemo(
        // eslint-disable-next-line react-hooks/preserve-manual-memoization
        () => [
            {
                title: "Cost Center",
                dataIndex: "name",
                key: "name",
                fixed: "left" as const,
                render: (value: string, record: any) => (
                    <Space direction="vertical" size={0}>
                        <Text strong>{value}</Text>
                        {record.parent_name ? <Text type="secondary">{record.parent_name}</Text> : null}
                    </Space>
                ),
            },
            {
                title: "Organizations",
                dataIndex: "total_organizations",
                key: "total_organizations",
                align: "right" as const,
            },
            {
                title: "Sales",
                dataIndex: "total_sales_amount",
                key: "total_sales_amount",
                align: "right" as const,
                render: money,
            },
            {
                title: "Purchase",
                dataIndex: "total_purchase_amount",
                key: "total_purchase_amount",
                align: "right" as const,
                render: money,
            },
            {
                title: "Work Value",
                dataIndex: "total_work_value",
                key: "total_work_value",
                align: "right" as const,
                render: (value: any) => <Text strong>{money(value)}</Text>,
            },
            {
                title: "Receivable",
                dataIndex: "total_receivable",
                key: "total_receivable",
                align: "right" as const,
                render: (value: any) => <Tag color="green">{money(value)}</Tag>,
            },
            {
                title: "Payable",
                dataIndex: "total_payable",
                key: "total_payable",
                align: "right" as const,
                render: (value: any) => <Tag color="red">{money(value)}</Tag>,
            },
            {
                title: "Net Outstanding",
                dataIndex: "net_outstanding",
                key: "net_outstanding",
                align: "right" as const,
                render: (value: any) => <Text strong>{money(value)}</Text>,
            },
            {
                title: "Action",
                key: "action",
                align: "right" as const,
                render: (_: any, record: any) => (
                    <Button
                        icon={<EyeOutlined />}
                        onClick={() => openOutstandings(record)}
                    >
                        View
                    </Button>
                ),
            },
        ],
        [],
    );

    const outstandingColumns = [
        {
            title: "Ledger",
            dataIndex: "ledger_name",
            key: "ledger_name",
            render: (value: string) => <Text strong>{value}</Text>,
        },
        {
            title: "Bill Ref",
            dataIndex: "bill_ref",
            key: "bill_ref",
        },
        {
            title: "Voucher",
            dataIndex: "voucher_number",
            key: "voucher_number",
        },
        {
            title: "Type",
            dataIndex: "bill_type",
            key: "bill_type",
            render: (value: string) => (
                <Tag color={value === "receivable" ? "green" : "red"}>
                    {value}
                </Tag>
            ),
        },
        {
            title: "Bill Amount",
            dataIndex: "bill_amount",
            key: "bill_amount",
            align: "right" as const,
            render: money,
        },
        {
            title: "Pending",
            dataIndex: "pending_amount",
            key: "pending_amount",
            align: "right" as const,
            render: (value: any) => <Text strong>{money(value)}</Text>,
        },
    ];

    return (
        <div style={{ padding: 24 }}>
            <Space direction="vertical" size={20} style={{ width: "100%" }}>
                <div>
                    <Title level={3} style={{ marginBottom: 4 }}>
                        Cost Center Analytics
                    </Title>
                    <Text type="secondary">
                        Track cost center wise work value, ledgers, receivables, payables and outstandings.
                    </Text>
                </div>

                <Row gutter={[16, 16]}>
                    <Col xs={24} sm={12} lg={6}>
                        <Card>
                            <Statistic
                                title="Cost Centers"
                                value={totals.total_cost_centers || 0}
                                prefix={<ApartmentOutlined />}
                            />
                        </Card>
                    </Col>

                    <Col xs={24} sm={12} lg={6}>
                        <Card>
                            <Statistic
                                title="Total Work Value"
                                value={Number(totals.total_work_value || 0)}
                                formatter={(value) => money(value)}
                                prefix={<BarChartOutlined />}
                            />
                        </Card>
                    </Col>

                    <Col xs={24} sm={12} lg={6}>
                        <Card>
                            <Statistic
                                title="Receivable"
                                value={Number(totals.total_receivable || 0)}
                                formatter={(value) => money(value)}
                                prefix={<WalletOutlined />}
                            />
                        </Card>
                    </Col>

                    <Col xs={24} sm={12} lg={6}>
                        <Card>
                            <Statistic
                                title="Net Outstanding"
                                value={Number(totals.net_outstanding || 0)}
                                formatter={(value) => money(value)}
                                prefix={<RiseOutlined />}
                            />
                        </Card>
                    </Col>
                </Row>

                <Card>
                    <Table
                        rowKey="id"
                        loading={summaryLoading}
                        columns={columns}
                        dataSource={rows}
                        scroll={{ x: 1300 }}
                        pagination={{
                            pageSize: 10,
                            showSizeChanger: true,
                        }}
                    />
                </Card>
            </Space>

            <Drawer
                width={900}
                open={drawerOpen}
                onClose={() => setDrawerOpen(false)}
                title={
                    <Space direction="vertical" size={0}>
                        <Text strong>{selectedCostCenter?.name}</Text>
                        <Text type="secondary">Outstandings</Text>
                    </Space>
                }
            >
                <Table
                    rowKey="id"
                    loading={outstandingsLoading}
                    columns={outstandingColumns}
                    dataSource={outstandings}
                    scroll={{ x: 900 }}
                    pagination={{
                        pageSize: 10,
                        showSizeChanger: true,
                    }}
                />
            </Drawer>
        </div>
    );
}