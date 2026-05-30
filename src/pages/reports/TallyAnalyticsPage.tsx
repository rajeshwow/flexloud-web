import {
    BarChartOutlined,
    FilterOutlined,
    ReloadOutlined,
} from "@ant-design/icons";
import {
    Button,
    Card,
    Col,
    DatePicker,
    Form,
    Input,
    Row,
    Select,
    Space,
    Statistic,
    Table,
    Tabs,
    Tag,
    Typography,
    message,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import dayjs from "dayjs";
import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
    fetchCompanyQuarterlySales,
    fetchCostCenterCategorySales,
    fetchPartyCategorySales,
    fetchUserCategoryMonthlySales,
    fetchUserCategoryTargets,
    type TallyAnalyticsFilters,
} from "../../redux/reducers/tallyAnalyticsReports.slice";
import type { AppDispatch, RootState } from "../../redux/store";

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

type TabKey =
    | "user-sales"
    | "company-sales"
    | "targets"
    | "party-sales"
    | "cost-center-sales";

function formatMoney(value: any) {
    const amount = Number(value || 0);

    return amount.toLocaleString("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 0,
    });
}

function formatNumber(value: any) {
    return Number(value || 0).toLocaleString("en-IN");
}

function monthLabel(value: string) {
    if (!value) return "-";
    return dayjs(value).format("MMM YYYY");
}

export default function TallyAnalyticsPage() {
    const dispatch = useDispatch<AppDispatch>();
    const [form] = Form.useForm();
    const [activeTab, setActiveTab] = useState<TabKey>("company-sales");

    const {
        loading,
        userCategoryMonthlySales,
        companyQuarterlySales,
        userCategoryTargets,
        partyCategorySales,
        costCenterCategorySales,
    } = useSelector((state: RootState) => state.tallyAnalyticsReports);

    const filters = Form.useWatch([], form);

    const commonParams = useMemo<TallyAnalyticsFilters>(() => {
        const dateRange = filters?.date_range || [];

        return {
            from_date: dateRange?.[0] ? dayjs(dateRange[0]).format("YYYY-MM-DD") : undefined,
            to_date: dateRange?.[1] ? dayjs(dateRange[1]).format("YYYY-MM-DD") : undefined,
            category: filters?.category || undefined,
            cost_center_name: filters?.cost_center_name || undefined,
            financial_year: filters?.financial_year || undefined,
            page: 1,
            limit: 100,
        };
    }, [filters]);

    const financialYearOptions = useMemo(() => {
        const currentYear = dayjs().month() >= 3 ? dayjs().year() : dayjs().year() - 1;

        return Array.from({ length: 6 }).map((_, index) => {
            const year = currentYear - index;

            return {
                label: `FY ${year}-${String(year + 1).slice(-2)}`,
                value: year,
            };
        });
    }, []);

    const loadActiveReport = async (tab: TabKey = activeTab) => {
        try {
            if (tab === "user-sales") {
                await dispatch(fetchUserCategoryMonthlySales(commonParams)).unwrap();
            }

            if (tab === "company-sales") {
                await dispatch(fetchCompanyQuarterlySales(commonParams)).unwrap();
            }

            if (tab === "targets") {
                await dispatch(fetchUserCategoryTargets(commonParams)).unwrap();
            }

            if (tab === "party-sales") {
                await dispatch(fetchPartyCategorySales(commonParams)).unwrap();
            }

            if (tab === "cost-center-sales") {
                await dispatch(fetchCostCenterCategorySales(commonParams)).unwrap();
            }
        } catch (error: any) {
            message.error(error || "Failed to load report");
        }
    };

    useEffect(() => {
        loadActiveReport(activeTab);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activeTab]);

    const totalCurrentSales = useMemo(() => {
        const source =
            activeTab === "user-sales"
                ? userCategoryMonthlySales
                : activeTab === "company-sales"
                    ? companyQuarterlySales
                    : activeTab === "party-sales"
                        ? partyCategorySales
                        : activeTab === "cost-center-sales"
                            ? costCenterCategorySales
                            : userCategoryTargets;

        return source.reduce((sum: number, row: any) => {
            return sum + Number(row.total_sales || row.achieved_amount || 0);
        }, 0);
    }, [
        activeTab,
        userCategoryMonthlySales,
        companyQuarterlySales,
        partyCategorySales,
        costCenterCategorySales,
        userCategoryTargets,
    ]);

    const totalRows = useMemo(() => {
        if (activeTab === "user-sales") return userCategoryMonthlySales.length;
        if (activeTab === "company-sales") return companyQuarterlySales.length;
        if (activeTab === "targets") return userCategoryTargets.length;
        if (activeTab === "party-sales") return partyCategorySales.length;
        return costCenterCategorySales.length;
    }, [
        activeTab,
        userCategoryMonthlySales,
        companyQuarterlySales,
        userCategoryTargets,
        partyCategorySales,
        costCenterCategorySales,
    ]);

    const userSalesColumns: ColumnsType<any> = [
        {
            title: "User",
            dataIndex: "user_name",
            key: "user_name",
            width: 220,
            render: (value) => value || "Unmapped",
        },
        {
            title: "Month",
            dataIndex: "month",
            key: "month",
            width: 140,
            render: monthLabel,
        },
        {
            title: "Category",
            dataIndex: "category",
            key: "category",
            width: 180,
            render: (value) => <Tag>{value || "Uncategorized"}</Tag>,
        },
        {
            title: "Vouchers",
            dataIndex: "voucher_count",
            key: "voucher_count",
            width: 120,
            align: "right",
            render: formatNumber,
        },
        {
            title: "Qty",
            dataIndex: "total_qty",
            key: "total_qty",
            width: 120,
            align: "right",
            render: formatNumber,
        },
        {
            title: "Sales",
            dataIndex: "total_sales",
            key: "total_sales",
            width: 160,
            align: "right",
            render: formatMoney,
        },
    ];

    const companyPivotData = useMemo(() => {
        const map = new Map<string, any>();

        for (const row of companyQuarterlySales || []) {
            const quarterLabel = row.quarter_label || `Q${row.quarter} ${row.year}`;
            const category = row.category || "Uncategorized";
            const key = `${row.year}-${row.quarter}`;
            const sales = Number(row.total_sales || 0);
            const qty = Number(row.total_qty || 0);
            const vouchers = Number(row.voucher_count || 0);

            if (!map.has(key)) {
                map.set(key, {
                    key,
                    year: row.year,
                    quarter: row.quarter,
                    quarter_label: quarterLabel,
                    total_sales: 0,
                    total_qty: 0,
                    voucher_count: 0,
                });
            }

            const existing = map.get(key);

            existing[category] = Number(existing[category] || 0) + sales;
            existing.total_sales += sales;
            existing.total_qty += qty;
            existing.voucher_count += vouchers;
        }

        return Array.from(map.values()).sort((a, b) => {
            if (Number(a.year) !== Number(b.year)) return Number(b.year) - Number(a.year);
            return Number(a.quarter) - Number(b.quarter);
        });
    }, [companyQuarterlySales]);

    const companyCategories = useMemo(() => {
        return Array.from(
            new Set(
                (companyQuarterlySales || [])
                    .map((row: any) => row.category || "Uncategorized")
                    .filter(Boolean),
            ),
        ).sort((a, b) => a.localeCompare(b));
    }, [companyQuarterlySales]);

    const companyTotals = useMemo(() => {
        const totals: any = {
            total_sales: 0,
            voucher_count: 0,
            total_qty: 0,
        };

        for (const row of companyPivotData || []) {
            for (const category of companyCategories) {
                totals[category] = Number(totals[category] || 0) + Number(row[category] || 0);
            }

            totals.total_sales += Number(row.total_sales || 0);
            totals.voucher_count += Number(row.voucher_count || 0);
            totals.total_qty += Number(row.total_qty || 0);
        }

        return totals;
    }, [companyPivotData, companyCategories]);

    const companyColumns: ColumnsType<any> = [
        {
            title: "Quarter",
            dataIndex: "quarter_label",
            key: "quarter_label",
            width: 180,
            fixed: "left",
            render: (value, record) => value || `Q${record.quarter} ${record.year}`,
        },
        ...companyCategories.map((category) => ({
            title: category,
            dataIndex: category,
            key: `company_category_${category}`,
            width: 170,
            align: "right" as const,
            render: (value: any) => (Number(value || 0) > 0 ? formatMoney(value) : "-"),
        })),
        {
            title: "Total Sales",
            dataIndex: "total_sales",
            key: "total_sales",
            width: 170,
            align: "right",
            fixed: "right",
            render: formatMoney,
        },
        // {
        //     title: "Vouchers",
        //     dataIndex: "voucher_count",
        //     key: "voucher_count",
        //     width: 120,
        //     align: "right",
        //     render: formatNumber,
        // },
        // {
        //     title: "Qty",
        //     dataIndex: "total_qty",
        //     key: "total_qty",
        //     width: 120,
        //     align: "right",
        //     render: formatNumber,
        // },
    ];

    const targetColumns: ColumnsType<any> = [
        {
            title: "User",
            dataIndex: "user_name",
            key: "user_name",
            width: 220,
        },
        {
            title: "Category",
            dataIndex: "category",
            key: "category",
            width: 180,
            render: (value) => <Tag>{value || "Uncategorized"}</Tag>,
        },
        {
            title: "Target",
            dataIndex: "target_amount",
            key: "target_amount",
            width: 160,
            align: "right",
            render: formatMoney,
        },
        {
            title: "Achieved",
            dataIndex: "achieved_amount",
            key: "achieved_amount",
            width: 160,
            align: "right",
            render: formatMoney,
        },
        {
            title: "Pending",
            dataIndex: "pending_amount",
            key: "pending_amount",
            width: 160,
            align: "right",
            render: formatMoney,
        },
        {
            title: "Achievement",
            dataIndex: "achievement_percentage",
            key: "achievement_percentage",
            width: 140,
            align: "right",
            render: (value) => `${Number(value || 0).toFixed(2)}%`,
        },
    ];

    const partyPivotData = useMemo(() => {
        const map = new Map<string, any>();

        for (const row of partyCategorySales || []) {
            const partyName = row.party_name || "Unknown Party";
            const category = row.category || "Uncategorized";
            const key = partyName;
            const sales = Number(row.total_sales || 0);
            const qty = Number(row.total_qty || 0);
            const vouchers = Number(row.voucher_count || 0);

            if (!map.has(key)) {
                map.set(key, {
                    key,
                    party_name: partyName,
                    total_sales: 0,
                    total_qty: 0,
                    voucher_count: 0,
                });
            }

            const existing = map.get(key);

            existing[category] = Number(existing[category] || 0) + sales;
            existing.total_sales += sales;
            existing.total_qty += qty;
            existing.voucher_count += vouchers;
        }

        return Array.from(map.values());
    }, [partyCategorySales]);

    const partyCategories = useMemo(() => {
        return Array.from(
            new Set(
                (partyCategorySales || [])
                    .map((row: any) => row.category || "Uncategorized")
                    .filter(Boolean),
            ),
        ).sort((a, b) => a.localeCompare(b));
    }, [partyCategorySales]);

    const partyTotals = useMemo(() => {
        const totals: any = {
            total_sales: 0,
            voucher_count: 0,
            total_qty: 0,
        };

        for (const row of partyPivotData || []) {
            for (const category of partyCategories) {
                totals[category] = Number(totals[category] || 0) + Number(row[category] || 0);
            }

            totals.total_sales += Number(row.total_sales || 0);
            totals.voucher_count += Number(row.voucher_count || 0);
            totals.total_qty += Number(row.total_qty || 0);
        }

        return totals;
    }, [partyPivotData, partyCategories]);

    const partyColumns: ColumnsType<any> = [
        {
            title: "Party",
            dataIndex: "party_name",
            key: "party_name",
            width: 260,
            fixed: "left",
            render: (value) => value || "Unknown Party",
        },
        ...partyCategories.map((category) => ({
            title: category,
            dataIndex: category,
            key: `party_category_${category}`,
            width: 170,
            align: "right" as const,
            render: (value: any) => (Number(value || 0) > 0 ? formatMoney(value) : "-"),
        })),
        {
            title: "Total Sales",
            dataIndex: "total_sales",
            key: "total_sales",
            width: 170,
            align: "right",
            fixed: "right",
            render: formatMoney,
        },
        {
            title: "Vouchers",
            dataIndex: "voucher_count",
            key: "voucher_count",
            width: 120,
            align: "right",
            render: formatNumber,
        },
        // {
        //     title: "Qty",
        //     dataIndex: "total_qty",
        //     key: "total_qty",
        //     width: 120,
        //     align: "right",
        //     render: formatNumber,
        // },
    ];

    const costCenterPivotData = useMemo(() => {
        const map = new Map<string, any>();

        for (const row of costCenterCategorySales || []) {
            const costCenterName = row.cost_center_name || "Unmapped Cost Center";
            const mappedUserName = row.mapped_user_name || "Unmapped User";
            const category = row.category || "Uncategorized";
            const key = `${costCenterName}__${mappedUserName}`;
            const sales = Number(row.total_sales || 0);
            const qty = Number(row.total_qty || 0);
            const vouchers = Number(row.voucher_count || 0);

            if (!map.has(key)) {
                map.set(key, {
                    key,
                    cost_center_name: costCenterName,
                    mapped_user_name: mappedUserName,
                    total_sales: 0,
                    total_qty: 0,
                    voucher_count: 0,
                });
            }

            const existing = map.get(key);

            existing[category] = Number(existing[category] || 0) + sales;
            existing.total_sales += sales;
            existing.total_qty += qty;
            existing.voucher_count += vouchers;
        }

        return Array.from(map.values());
    }, [costCenterCategorySales]);

    const costCenterCategories = useMemo(() => {
        return Array.from(
            new Set(
                (costCenterCategorySales || [])
                    .map((row: any) => row.category || "Uncategorized")
                    .filter(Boolean),
            ),
        ).sort((a, b) => a.localeCompare(b));
    }, [costCenterCategorySales]);

    const costCenterTotals = useMemo(() => {
        const totals: any = {
            total_sales: 0,
            voucher_count: 0,
            total_qty: 0,
        };

        for (const row of costCenterPivotData || []) {
            for (const category of costCenterCategories) {
                totals[category] = Number(totals[category] || 0) + Number(row[category] || 0);
            }

            totals.total_sales += Number(row.total_sales || 0);
            totals.voucher_count += Number(row.voucher_count || 0);
            totals.total_qty += Number(row.total_qty || 0);
        }

        return totals;
    }, [costCenterPivotData, costCenterCategories]);

    const costCenterColumns: ColumnsType<any> = [
        {
            title: "Cost Center",
            dataIndex: "cost_center_name",
            key: "cost_center_name",
            width: 120,
            fixed: "left",
            render: (value) => value || "Unmapped Cost Center",
        },
        {
            title: "Mapped User",
            dataIndex: "mapped_user_name",
            key: "mapped_user_name",
            width: 120,
            // fixed: "left",
            render: (value: string) => value || "Unmapped User",
        },
        ...costCenterCategories.map((category) => ({
            title: category,
            dataIndex: category,
            key: `category_${category}`,
            width: 100,
            align: "right" as const,
            render: (value: any) => (Number(value || 0) > 0 ? formatMoney(value) : "-"),
        })),
        {
            title: "Total Sales",
            dataIndex: "total_sales",
            key: "total_sales",
            width: 100,
            align: "right",
            fixed: "right",
            render: formatMoney,
        },
        {
            title: "Vouchers",
            dataIndex: "voucher_count",
            key: "voucher_count",
            width: 100,
            align: "right",
            render: formatNumber,
        },
        // {
        //     title: "Qty",
        //     dataIndex: "total_qty",
        //     key: "total_qty",
        //     width: 100,
        //     align: "right",
        //     render: formatNumber,
        // },
    ];

    const tabItems = [
        // {
        //     key: "user-sales",
        //     label: "User Sales",
        //     children: (
        //         <Table
        //             rowKey={(record) =>
        //                 `${record.user_id || record.user_name}-${record.month}-${record.category}`
        //             }
        //             loading={loading}
        //             columns={userSalesColumns}
        //             dataSource={userCategoryMonthlySales}
        //             pagination={{ pageSize: 20, showSizeChanger: true }}
        //             scroll={{ x: 980 }}
        //         />
        //     ),
        // },
        {
            key: "company-sales",
            label: "Company Sales",
            children: (
                <Table
                    rowKey={(record) => record.key}
                    loading={loading}
                    columns={companyColumns}
                    dataSource={companyPivotData}
                    pagination={false}
                    scroll={{
                        x: 180 + companyCategories.length * 170 + 410,
                    }}
                    summary={() => (
                        <Table.Summary fixed>
                            <Table.Summary.Row>
                                <Table.Summary.Cell index={0}>
                                    <strong>Total</strong>
                                </Table.Summary.Cell>

                                {companyCategories.map((category, index) => (
                                    <Table.Summary.Cell
                                        key={category}
                                        index={index + 1}
                                        align="right"
                                    >
                                        <strong>{formatMoney(companyTotals[category] || 0)}</strong>
                                    </Table.Summary.Cell>
                                ))}

                                <Table.Summary.Cell
                                    index={companyCategories.length + 1}
                                    align="right"
                                >
                                    <strong>{formatMoney(companyTotals.total_sales || 0)}</strong>
                                </Table.Summary.Cell>

                                {/* <Table.Summary.Cell
                                    index={companyCategories.length + 2}
                                    align="right"
                                >
                                    <strong>{formatNumber(companyTotals.voucher_count || 0)}</strong>
                                </Table.Summary.Cell>

                                <Table.Summary.Cell
                                    index={companyCategories.length + 3}
                                    align="right"
                                >
                                    <strong>{formatNumber(companyTotals.total_qty || 0)}</strong>
                                </Table.Summary.Cell> */}
                            </Table.Summary.Row>
                        </Table.Summary>
                    )}
                />
            ),
        },
        {
            key: "targets",
            label: "User Targets",
            children: (
                <Table
                    rowKey={(record) => `${record.user_id}-${record.category}`}
                    loading={loading}
                    columns={targetColumns}
                    dataSource={userCategoryTargets}
                    pagination={{ pageSize: 20, showSizeChanger: true }}
                    scroll={{ x: 980 }}
                />
            ),
        },
        {
            key: "party-sales",
            label: "Party Sales",
            children: (
                <Table
                    rowKey={(record) => record.key}
                    loading={loading}
                    columns={partyColumns}
                    dataSource={partyPivotData}
                    pagination={{ pageSize: 20, showSizeChanger: true }}
                    scroll={{
                        x: 260 + partyCategories.length * 170 + 410,
                    }}
                    summary={() => (
                        <Table.Summary fixed>
                            <Table.Summary.Row>
                                <Table.Summary.Cell index={0}>
                                    <strong>Total</strong>
                                </Table.Summary.Cell>

                                {partyCategories.map((category, index) => (
                                    <Table.Summary.Cell
                                        key={category}
                                        index={index + 1}
                                        align="right"
                                    >
                                        <strong>{formatMoney(partyTotals[category] || 0)}</strong>
                                    </Table.Summary.Cell>
                                ))}

                                <Table.Summary.Cell
                                    index={partyCategories.length + 1}
                                    align="right"
                                >
                                    <strong>{formatMoney(partyTotals.total_sales || 0)}</strong>
                                </Table.Summary.Cell>

                                <Table.Summary.Cell
                                    index={partyCategories.length + 2}
                                    align="right"
                                >
                                    <strong>{formatNumber(partyTotals.voucher_count || 0)}</strong>
                                </Table.Summary.Cell>

                                {/* <Table.Summary.Cell
                                    index={partyCategories.length + 3}
                                    align="right"
                                >
                                    <strong>{formatNumber(partyTotals.total_qty || 0)}</strong>
                                </Table.Summary.Cell> */}
                            </Table.Summary.Row>
                        </Table.Summary>
                    )}
                />
            ),
        },
        {
            key: "cost-center-sales",
            label: "Cost Center Sales",
            children: (
                <Table
                    rowKey={(record) => record.key}
                    loading={loading}
                    columns={costCenterColumns}
                    dataSource={costCenterPivotData}
                    pagination={{ pageSize: 20, showSizeChanger: true }}
                    scroll={{
                        x: 520 + costCenterCategories.length * 160 + 410,
                    }}
                    summary={() => (
                        <Table.Summary fixed>
                            <Table.Summary.Row>
                                <Table.Summary.Cell index={0}>
                                    <strong>Total</strong>
                                </Table.Summary.Cell>

                                <Table.Summary.Cell index={1}>
                                    <strong>-</strong>
                                </Table.Summary.Cell>

                                {costCenterCategories.map((category, index) => (
                                    <Table.Summary.Cell
                                        key={category}
                                        index={index + 2}
                                        align="right"
                                    >
                                        <strong>{formatMoney(costCenterTotals[category] || 0)}</strong>
                                    </Table.Summary.Cell>
                                ))}

                                <Table.Summary.Cell
                                    index={costCenterCategories.length + 2}
                                    align="right"
                                >
                                    <strong>{formatMoney(costCenterTotals.total_sales || 0)}</strong>
                                </Table.Summary.Cell>

                                <Table.Summary.Cell
                                    index={costCenterCategories.length + 3}
                                    align="right"
                                >
                                    <strong>{formatNumber(costCenterTotals.voucher_count || 0)}</strong>
                                </Table.Summary.Cell>

                                {/* <Table.Summary.Cell
                                    index={costCenterCategories.length + 4}
                                    align="right"
                                >
                                    <strong>{formatNumber(costCenterTotals.total_qty || 0)}</strong>
                                </Table.Summary.Cell> */}
                            </Table.Summary.Row>
                        </Table.Summary>
                    )}
                />
            ),
        },
    ];

    return (
        <div style={{ padding: 24 }}>
            <Card>
                <Row gutter={[16, 16]} align="middle" justify="space-between">
                    <Col xs={24} lg={14}>
                        <Space direction="vertical" size={2}>
                            <Space>
                                <BarChartOutlined />
                                <Title level={3} style={{ margin: 0 }}>
                                    Tally Analytics
                                </Title>
                            </Space>
                            <Text type="secondary">
                                Analyze Tally sales by user, company quarter, product category,
                                party and cost center.
                            </Text>
                        </Space>
                    </Col>

                    <Col xs={24} lg={10}>
                        <Row gutter={12}>
                            <Col span={12}>
                                <Card size="small">
                                    <Statistic title="Rows" value={totalRows} />
                                </Card>
                            </Col>
                            <Col span={12}>
                                <Card size="small">
                                    <Statistic title="Sales" value={formatMoney(totalCurrentSales)} />
                                </Card>
                            </Col>
                        </Row>
                    </Col>
                </Row>

                <Card size="small" style={{ marginTop: 20 }}>
                    <Form form={form} layout="vertical">
                        <Row gutter={[12, 12]} align="bottom">
                            <Col xs={24} md={8} lg={7}>
                                <Form.Item name="date_range" label="Date Range">
                                    <RangePicker style={{ width: "100%" }} />
                                </Form.Item>
                            </Col>

                            {activeTab === "company-sales" && (
                                <Col xs={24} sm={12} md={6}>
                                    <Form.Item label="Financial Year" name="financial_year">
                                        <Select
                                            allowClear
                                            placeholder="Select financial year"
                                            options={financialYearOptions}
                                        />
                                    </Form.Item>
                                </Col>
                            )}

                            <Col xs={24} md={8} lg={5}>
                                <Form.Item name="category" label="Category">
                                    <Input placeholder="Search category" allowClear />
                                </Form.Item>
                            </Col>

                            <Col xs={24} md={8} lg={5}>
                                <Form.Item name="cost_center_name" label="Cost Center">
                                    <Input placeholder="Search cost center" allowClear />
                                </Form.Item>
                            </Col>

                            <Col xs={24} md={24} lg={7}>
                                <Space wrap>
                                    <Button
                                        type="primary"
                                        icon={<FilterOutlined />}
                                        onClick={() => loadActiveReport(activeTab)}
                                        loading={loading}
                                    >
                                        Apply Filter
                                    </Button>

                                    <Button
                                        icon={<ReloadOutlined />}
                                        onClick={() => {
                                            form.resetFields();
                                            setTimeout(() => loadActiveReport(activeTab), 0);
                                        }}
                                    >
                                        Reset
                                    </Button>
                                </Space>
                            </Col>
                        </Row>
                    </Form>
                </Card>

                <Tabs
                    style={{ marginTop: 20 }}
                    activeKey={activeTab}
                    onChange={(key) => setActiveTab(key as TabKey)}
                    items={tabItems}
                />
            </Card>
        </div>
    );
}