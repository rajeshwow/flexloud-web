import {
    BankOutlined,
    CalendarOutlined,
    DownloadOutlined,
    FilterOutlined,
    ReloadOutlined,
    SearchOutlined,
    WalletOutlined,
} from "@ant-design/icons";
import {
    Button,
    Card,
    Col,
    DatePicker,
    Empty,
    Input,
    Row,
    Select,
    Space,
    Statistic,
    Table,
    Tag,
    Typography,
    message
} from "antd";
import type { ColumnsType } from "antd/es/table";
import dayjs from "dayjs";
import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
    fetchOutstandingCostCenters,
    fetchOutstandings,
    fetchOutstandingsSummary,
    type GetOutstandingsParams,
    type OutstandingItem,
    type OutstandingType,
} from "../../redux/reducers/outstandings.slice";
import type { AppDispatch, RootState } from "../../redux/store";

const { RangePicker } = DatePicker;
const { Title, Text } = Typography;

function formatCurrency(value: any) {
    const amount = Number(value || 0);

    return new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 0,
    }).format(amount);
}

function formatDate(value?: string | null) {
    if (!value) return "-";
    const date = dayjs(value);
    return date.isValid() ? date.format("DD MMM YYYY") : "-";
}

function getTypeColor(type?: string | null) {
    const value = String(type || "").toLowerCase();

    if (value === "receivable") return "green";
    if (value === "payable") return "red";

    return "default";
}

function getAgeingColor(days?: number) {
    const value = Number(days || 0);

    if (value >= 90) return "red";
    if (value >= 60) return "orange";
    if (value >= 30) return "gold";

    return "green";
}

const OutstandingListingPage: React.FC = () => {
    const dispatch = useDispatch<AppDispatch>();

    const { loading, summaryLoading, costCentersLoading, rows, summary, costCenters, pagination } =
        useSelector((state: RootState) => state.outstandings);

    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(20);
    const [type, setType] = useState<OutstandingType>("receivable");
    const [costCenterId, setCostCenterId] = useState<string | undefined>();
    const [dateRange, setDateRange] = useState<any>(null);
    const [search, setSearch] = useState("");
    const [appliedSearch, setAppliedSearch] = useState("");

    const params = useMemo<GetOutstandingsParams>(() => {
        return {
            page,
            limit,
            type,
            cost_center_id: costCenterId,
            date_from: dateRange?.[0] ? dayjs(dateRange[0]).format("YYYY-MM-DD") : undefined,
            date_to: dateRange?.[1] ? dayjs(dateRange[1]).format("YYYY-MM-DD") : undefined,
            search: appliedSearch || undefined,
            sort_by: "pending_amount",
            sort_order: "desc",
        };
    }, [page, limit, type, costCenterId, dateRange, appliedSearch]);

    const loadData = async () => {
        try {
            await Promise.all([
                dispatch(fetchOutstandings(params)).unwrap(),
                dispatch(fetchOutstandingsSummary(params)).unwrap(),
            ]);
        } catch (error: any) {
            message.error(error || "Failed to load outstandings");
        }
    };

    useEffect(() => {
        dispatch(fetchOutstandingCostCenters());
    }, [dispatch]);

    useEffect(() => {
        loadData();
    }, [params]);

    const handleApply = () => {
        setPage(1);
        setAppliedSearch(search.trim());
    };

    const handleReset = () => {
        setPage(1);
        setLimit(20);
        setType("receivable");
        setCostCenterId(undefined);
        setDateRange(null);
        setSearch("");
        setAppliedSearch("");
    };

    const handleExport = () => {
        const header = [
            "Ledger Name",
            "Organization",
            "Cost Center",
            "Bill Ref",
            "Voucher No",
            "Voucher Date",
            "Due Date",
            "Type",
            "Bill Amount",
            "Pending Amount",
            "Ageing Days",
        ];

        const csvRows = rows.map((item) => [
            item.ledger_name || "",
            item.organization_name || "",
            item.cost_center_name || "",
            item.bill_ref || "",
            item.voucher_number || "",
            formatDate(item.voucher_date),
            formatDate(item.due_date),
            item.bill_type || "",
            Number(item.bill_amount || 0),
            Number(item.pending_amount_abs || item.pending_amount || 0),
            Number(item.ageing_days || 0),
        ]);

        const csv = [header, ...csvRows]
            .map((row) =>
                row
                    .map((cell) => `"${String(cell).replace(/"/g, '""')}"`)
                    .join(","),
            )
            .join("\n");

        const blob = new Blob([csv], {
            type: "text/csv;charset=utf-8;",
        });

        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");

        link.href = url;
        link.download = `outstandings-${dayjs().format("YYYY-MM-DD-HHmm")}.csv`;
        link.click();

        URL.revokeObjectURL(url);
    };

    const columns: ColumnsType<OutstandingItem> = [
        {
            title: "Ledger",
            dataIndex: "ledger_name",
            key: "ledger_name",
            width: 240,
            fixed: "left",
            render: (_, record) => (
                <Space direction="vertical" size={0}>
                    <Text strong>{record.ledger_name || "-"}</Text>
                    <Text type="secondary" style={{ fontSize: 12 }}>
                        {record.organization_name || "No organization mapped"}
                    </Text>
                </Space>
            ),
        },
        {
            title: "Cost Center",
            dataIndex: "cost_center_name",
            key: "cost_center_name",
            width: 180,
            render: (value) =>
                value ? <Tag color="blue">{value}</Tag> : <Text type="secondary">Unassigned</Text>,
        },
        {
            title: "Bill Ref",
            dataIndex: "bill_ref",
            key: "bill_ref",
            width: 150,
            render: (value) => value || "-",
        },
        {
            title: "Voucher No",
            dataIndex: "voucher_number",
            key: "voucher_number",
            width: 150,
            render: (value, record) => (
                <Space direction="vertical" size={0}>
                    <Text>{value || "-"}</Text>
                    <Text type="secondary" style={{ fontSize: 12 }}>
                        {record.voucher_type || "-"}
                    </Text>
                </Space>
            ),
        },
        {
            title: "Voucher Date",
            dataIndex: "voucher_date",
            key: "voucher_date",
            width: 150,
            render: formatDate,
        },
        {
            title: "Due Date",
            dataIndex: "due_date",
            key: "due_date",
            width: 150,
            render: formatDate,
        },
        {
            title: "Type",
            dataIndex: "bill_type",
            key: "bill_type",
            width: 130,
            render: (value) => (
                <Tag color={getTypeColor(value)}>
                    {String(value || "-").toUpperCase()}
                </Tag>
            ),
        },
        {
            title: "Bill Amount",
            dataIndex: "bill_amount",
            key: "bill_amount",
            width: 150,
            align: "right",
            render: (value) => formatCurrency(value),
        },
        {
            title: "Pending Amount",
            dataIndex: "pending_amount",
            key: "pending_amount",
            width: 170,
            align: "right",
            sorter: false,
            render: (_, record) => (
                <Text strong>
                    {formatCurrency(record.pending_amount_abs || record.pending_amount)}
                </Text>
            ),
        },
        {
            title: "Ageing",
            dataIndex: "ageing_days",
            key: "ageing_days",
            width: 120,
            align: "center",
            render: (value) => (
                <Tag color={getAgeingColor(value)}>{Number(value || 0)} days</Tag>
            ),
        },
    ];

    return (
        <div style={{ padding: 24 }}>
            <Space
                align="start"
                style={{
                    width: "100%",
                    justifyContent: "space-between",
                    marginBottom: 20,
                }}
            >
                <div>
                    <Title level={3} style={{ margin: 0 }}>
                        Outstandings
                    </Title>
                    <Text type="secondary">
                        Cost center wise receivables, payables, pending bills and ageing.
                    </Text>
                </div>

                <Space>
                    <Button icon={<DownloadOutlined />} onClick={handleExport} disabled={!rows.length}>
                        Export
                    </Button>
                    <Button icon={<ReloadOutlined />} onClick={loadData} loading={loading || summaryLoading}>
                        Refresh
                    </Button>
                </Space>
            </Space>

            <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
                <Col xs={24} sm={12} lg={6}>
                    <Card loading={summaryLoading}>
                        <Statistic
                            title="Total Receivable"
                            value={summary.total_receivable}
                            prefix={<WalletOutlined />}
                            formatter={(value) => formatCurrency(value)}
                        />
                    </Card>
                </Col>

                <Col xs={24} sm={12} lg={6}>
                    <Card loading={summaryLoading}>
                        <Statistic
                            title="Total Payable"
                            value={summary.total_payable}
                            prefix={<BankOutlined />}
                            formatter={(value) => formatCurrency(value)}
                        />
                    </Card>
                </Col>

                <Col xs={24} sm={12} lg={6}>
                    <Card loading={summaryLoading}>
                        <Statistic
                            title="Net Outstanding"
                            value={summary.net_outstanding}
                            prefix={<WalletOutlined />}
                            formatter={(value) => formatCurrency(value)}
                        />
                    </Card>
                </Col>

                <Col xs={24} sm={12} lg={6}>
                    <Card loading={summaryLoading}>
                        <Statistic
                            title="Total Ledgers"
                            value={summary.total_ledgers}
                            prefix={<BankOutlined />}
                        />
                    </Card>
                </Col>
            </Row>

            <Card
                style={{
                    marginBottom: 16,
                    borderRadius: 14,
                }}
            >
                <Row gutter={[12, 12]} align="bottom">
                    <Col xs={24} md={6}>
                        <Text type="secondary">Type</Text>
                        <Select
                            value={type}
                            onChange={(value) => {
                                setPage(1);
                                setType(value);
                            }}
                            style={{ width: "100%", marginTop: 6 }}
                            options={[
                                { label: "Receivable", value: "receivable" },
                                { label: "Payable", value: "payable" },
                                { label: "All", value: "all" },
                            ]}
                        />
                    </Col>

                    <Col xs={24} md={6}>
                        <Text type="secondary">Cost Center</Text>
                        <Select
                            allowClear
                            showSearch
                            value={costCenterId}
                            loading={costCentersLoading}
                            placeholder="All cost centers"
                            optionFilterProp="label"
                            onChange={(value) => {
                                setPage(1);
                                setCostCenterId(value);
                            }}
                            style={{ width: "100%", marginTop: 6 }}
                            options={costCenters.map((item) => ({
                                label: `${item.name} - ${formatCurrency(item.receivable)}`,
                                value: item.id,
                            }))}
                        />
                    </Col>

                    <Col xs={24} md={6}>
                        <Text type="secondary">Date Range</Text>
                        <RangePicker
                            value={dateRange}
                            onChange={(value) => {
                                setPage(1);
                                setDateRange(value);
                            }}
                            style={{ width: "100%", marginTop: 6 }}
                            suffixIcon={<CalendarOutlined />}
                        />
                    </Col>

                    <Col xs={24} md={6}>
                        <Text type="secondary">Search</Text>
                        <Input
                            allowClear
                            value={search}
                            placeholder="Ledger / bill / voucher"
                            prefix={<SearchOutlined />}
                            onChange={(event) => setSearch(event.target.value)}
                            onPressEnter={handleApply}
                            style={{ marginTop: 6 }}
                        />
                    </Col>

                    <Col xs={24}>
                        <Space style={{ justifyContent: "flex-end", width: "100%" }}>
                            <Button icon={<FilterOutlined />} onClick={handleReset}>
                                Reset
                            </Button>
                            <Button type="primary" icon={<SearchOutlined />} onClick={handleApply}>
                                Apply
                            </Button>
                        </Space>
                    </Col>
                </Row>
            </Card>

            <Card
                style={{
                    borderRadius: 14,
                }}
            >
                <Table
                    rowKey="id"
                    columns={columns}
                    dataSource={rows}
                    loading={loading}
                    scroll={{ x: 1450 }}
                    locale={{
                        emptyText: (
                            <Empty
                                description="No outstanding records found"
                                image={Empty.PRESENTED_IMAGE_SIMPLE}
                            />
                        ),
                    }}
                    pagination={{
                        current: pagination.page || page,
                        pageSize: pagination.limit || limit,
                        total: pagination.total || 0,
                        showSizeChanger: true,
                        pageSizeOptions: [10, 20, 50, 100],
                        showTotal: (total, range) =>
                            `${range[0]}-${range[1]} of ${total} records`,
                        onChange: (nextPage, nextLimit) => {
                            setPage(nextPage);
                            setLimit(nextLimit);
                        },
                    }}
                />
            </Card>
        </div>
    );
};

export default OutstandingListingPage;