import {
    BankOutlined,
    DownOutlined,
    SearchOutlined,
} from "@ant-design/icons";
import {
    Button,
    Card,
    Col,
    Collapse,
    DatePicker,
    Empty,
    Form,
    Input,
    Popover,
    Row,
    Select,
    Space,
    Spin,
    Statistic,
    Table,
    Tag,
    Typography,
    message
} from "antd";
import dayjs from "dayjs";
import { useEffect, useMemo, useState } from "react";
import { useDispatch } from "react-redux";
import {
    fetchCostCenterPerformance,
    fetchCostCenterPerformanceLedgers,
} from "../../redux/reducers/costCenterPerformance.slice";
import { fetchCostCenters } from "../../redux/reducers/costCenters.slice";
import type { AppDispatch } from "../../redux/store";

const { RangePicker } = DatePicker;
const { Text } = Typography;

function money(value: any) {
    const n = Number(value || 0);

    return n.toLocaleString("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 0,
    });
}

function normalizeList(payload: any): any[] {
    if (Array.isArray(payload)) return payload;
    if (Array.isArray(payload?.data)) return payload.data;
    if (Array.isArray(payload?.data?.data)) return payload.data.data;
    return [];
}

export default function CostCenterPerformancePage() {
    const [form] = Form.useForm();
    const dispatch = useDispatch<AppDispatch>();

    const [loading, setLoading] = useState(false);
    const [costCenterLoading, setCostCenterLoading] = useState(false);
    const [ledgerLoading, setLedgerLoading] = useState(false);

    const [costCenters, setCostCenters] = useState<any[]>([]);
    const [rows, setRows] = useState<any[]>([]);
    const [ledgerMap, setLedgerMap] = useState<Record<string, any[]>>({});

    const getParams = () => {
        const values = form.getFieldsValue();

        return {
            start_date: values.date_range?.[0]
                ? dayjs(values.date_range[0]).format("YYYY-MM-DD")
                : undefined,
            end_date: values.date_range?.[1]
                ? dayjs(values.date_range[1]).format("YYYY-MM-DD")
                : undefined,
            cost_center_id: values.cost_center_id || undefined,
            ledger_name: values.ledger_name || undefined,
            min_amount: values.min_amount || undefined,
            max_amount: values.max_amount || undefined,
        };
    };

    const getLedgerParams = (id: string) => {
        const values = form.getFieldsValue();

        return {
            id,
            start_date: values.date_range?.[0]
                ? dayjs(values.date_range[0]).format("YYYY-MM-DD")
                : undefined,
            end_date: values.date_range?.[1]
                ? dayjs(values.date_range[1]).format("YYYY-MM-DD")
                : undefined,
        };
    };

    const fetchCostCentersForFilter = async () => {
        try {
            setCostCenterLoading(true);

            const response = await dispatch(fetchCostCenters()).unwrap();

            const list = normalizeList(response);

            setCostCenters(list);
        } catch (error: any) {
            message.error(
                error?.response?.data?.message || "Cost centers load nahi hue",
            );
        } finally {
            setCostCenterLoading(false);
        }
    };

    const fetchPerformance = async () => {
        try {
            setLoading(true);
            setLedgerMap({});

            const response = await dispatch(
                fetchCostCenterPerformance(getParams()),
            ).unwrap();

            setRows(normalizeList(response));
        } catch (error: any) {
            message.error(
                error?.response?.data?.message ||
                error ||
                "Cost center performance load nahi hua",
            );
        } finally {
            setLoading(false);
        }
    };

    const fetchLedgers = async (id: string) => {
        if (!id) return;
        if (ledgerMap[id]) return;

        try {
            setLedgerLoading(true);

            const response = await dispatch(
                fetchCostCenterPerformanceLedgers(getLedgerParams(id)),
            ).unwrap();

            setLedgerMap((prev) => ({
                ...prev,
                [id]: normalizeList(response),
            }));
        } catch (error: any) {
            message.error(
                error?.response?.data?.message ||
                error ||
                "Ledger details load nahi hue",
            );
        } finally {
            setLedgerLoading(false);
        }
    };

    useEffect(() => {
        fetchCostCentersForFilter();
        fetchPerformance();
    }, []);

    const costCenterOptions = useMemo(() => {
        return costCenters.map((item) => ({
            label:
                item.name ||
                item.cost_center_name ||
                item.display_name ||
                item.tally_name ||
                "-",
            value: item.id || item.cost_center_id || item.name || item.cost_center_name,
        }));
    }, [costCenters]);

    const ledgerColumns = [
        {
            title: "Party / Ledger",
            dataIndex: "ledger_name",
            key: "ledger_name",
            render: (value: string) => <b>{value || "-"}</b>,
        },
        {
            title: "Bills",
            dataIndex: "bill_count",
            key: "bill_count",
            align: "center" as const,
        },
        {
            title: "Business Done",
            dataIndex: "total_business",
            key: "total_business",
            align: "right" as const,
            render: money,
        },
        {
            title: "Purchase / Cost",
            dataIndex: "total_purchase",
            key: "total_purchase",
            align: "right" as const,
            render: money,
        },

        {
            title: "Collection Pending",
            dataIndex: "receivable",
            key: "receivable",
            align: "right" as const,
            render: (value: any) => <Tag color="red">{money(value)}</Tag>,
        },
        {
            title: "Vendor Payable",
            dataIndex: "payable",
            key: "payable",
            align: "right" as const,
            render: (value: any) => <Tag color="blue">{money(value)}</Tag>,
        },

        {
            title: "Net Outstanding",
            dataIndex: "net_outstanding",
            key: "net_outstanding",
            align: "right" as const,
            render: (value: any) => (
                <Tag color={Number(value) >= 0 ? "green" : "red"}>
                    {money(value)}
                </Tag>
            ),
        },

    ];

    return (
        <div>
            <Card style={{ marginBottom: 16 }}>
                <Form form={form} layout="vertical">
                    <Row gutter={[16, 8]}>
                        <Col xs={24} md={8} lg={6}>
                            <Form.Item label="Date Range" name="date_range">
                                <RangePicker style={{ width: "100%" }} />
                            </Form.Item>
                        </Col>

                        <Col xs={24} md={8} lg={6}>
                            <Form.Item label="Cost Center" name="cost_center_id">
                                <Select
                                    allowClear
                                    showSearch
                                    loading={costCenterLoading}
                                    placeholder="Select cost center"
                                    optionFilterProp="label"
                                    options={costCenterOptions}
                                />
                            </Form.Item>
                        </Col>

                        <Col xs={24} md={8} lg={6}>
                            <Form.Item label="Ledger Name" name="ledger_name">
                                <Input placeholder="Search ledger" />
                            </Form.Item>
                        </Col>

                        {/* <Col xs={24} md={8} lg={3}>
                            <Form.Item label="Min Amount" name="min_amount">
                                <Input placeholder="Min" />
                            </Form.Item>
                        </Col>

                        <Col xs={24} md={8} lg={3}>
                            <Form.Item label="Max Amount" name="max_amount">
                                <Input placeholder="Max" />
                            </Form.Item>
                        </Col> */}

                        <Col xs={6} style={{ display: "flex", }}>
                            <Space>
                                <Button
                                    type="primary"
                                    icon={<SearchOutlined />}
                                    onClick={fetchPerformance}
                                >
                                    Search
                                </Button>

                                <Button
                                    onClick={() => {
                                        form.resetFields();
                                        setLedgerMap({});
                                        setTimeout(() => {
                                            fetchPerformance();
                                        }, 0);
                                    }}
                                >
                                    Clear
                                </Button>
                            </Space>
                        </Col>
                    </Row>
                </Form>
            </Card>

            <div style={{ marginBottom: 12, display: "flex", justifyContent: "flex-end" }}>
                <Popover
                    placement="leftTop"
                    trigger="hover"
                    title="Calculation Logic"
                    content={
                        <Space direction="vertical" size={6} style={{ maxWidth: 420 }}>
                            <Text>
                                <strong>Business Done</strong> = Total sales/business amount mapped with this cost center.
                            </Text>

                            <Text>
                                <strong>Purchase / Cost</strong> = Total purchase or cost amount mapped with this cost center.
                            </Text>

                            <Text>
                                <strong>Collection Pending</strong> = Amount receivable from customers.
                            </Text>

                            <Text>
                                <strong>Vendor Payable</strong> = Amount payable to vendors.
                            </Text>

                            <Text>
                                <strong>Net Outstanding</strong> = Collection Pending - Vendor Payable.
                            </Text>

                            <Text>
                                <strong>Net Business</strong> = Business Done - Purchase / Cost.
                            </Text>
                        </Space>
                    }
                >
                    <Text
                        type="secondary"
                        style={{
                            cursor: "help",
                            fontSize: 13,
                            textDecoration: "underline",
                            textUnderlineOffset: 3,
                        }}
                    >
                        How are these numbers calculated?
                    </Text>
                </Popover>
            </div>

            <Spin spinning={loading}>
                {!rows.length ? (
                    <Card>
                        <Empty description="No cost center performance found" />
                    </Card>
                ) : (
                    <Collapse
                        bordered={false}
                        expandIconPosition="end"
                        expandIcon={({ isActive }) => (
                            <DownOutlined rotate={isActive ? 180 : 0} />
                        )}
                        onChange={(keys) => {
                            const activeKey = Array.isArray(keys)
                                ? keys[keys.length - 1]
                                : keys;

                            if (activeKey) {
                                fetchLedgers(String(activeKey));
                            }
                        }}
                        items={rows.map((item) => ({
                            key: item.id,
                            label: (
                                <div
                                    style={{
                                        display: "flex",
                                        justifyContent: "space-between",
                                        gap: 16,
                                        alignItems: "center",
                                        flexWrap: "wrap",
                                        width: "100%",
                                    }}
                                >
                                    <Space direction="vertical" size={2}>
                                        <Space>
                                            <BankOutlined />
                                            <b>{item.cost_center_name || "-"}</b>
                                        </Space>

                                        <Text type="secondary">
                                            {item.ledger_count || 0} ledgers •{" "}
                                            {item.bill_count || 0} bills
                                        </Text>
                                    </Space>

                                    <Space size="large" wrap>
                                        <Statistic
                                            title={
                                                <>
                                                    Business Done
                                                    <br />
                                                    (A)
                                                </>
                                            }
                                            value={Number(item.total_business || 0)}
                                            prefix="₹"
                                            precision={0}
                                            valueStyle={{ fontSize: 16 }}
                                        />
                                        {/* purchse / cost */}
                                        <Statistic
                                            title={
                                                <>
                                                    Purchase / Cost
                                                    <br />
                                                    (B)
                                                </>
                                            }
                                            value={Number(item.total_purchase || 0)}
                                            prefix="₹"
                                            precision={0}
                                            valueStyle={{ fontSize: 16 }}
                                        />

                                        {/* <Statistic
                                            title="Total Activity"
                                            value={Number(item.total_activity || 0)}
                                            prefix="₹"
                                            precision={0}
                                            valueStyle={{ fontSize: 16 }}
                                        /> */}

                                        <Statistic
                                            title={
                                                <>
                                                    Collection Pending
                                                    <br />
                                                    (C)
                                                </>
                                            }
                                            value={Number(item.receivable || 0)}
                                            prefix="₹"
                                            precision={0}
                                            valueStyle={{ fontSize: 16 }}
                                        />

                                        <Statistic
                                            title={
                                                <>
                                                    Vendor Payable
                                                    <br />
                                                    (D)
                                                </>
                                            }
                                            value={Number(item.payable || 0)}
                                            prefix="₹"
                                            precision={0}
                                            valueStyle={{ fontSize: 16 }}
                                        />
                                        <Statistic
                                            title={
                                                <>
                                                    Net Outstanding
                                                    <br />
                                                    (C - D)
                                                </>
                                            }
                                            value={Number(item.net_outstanding || 0)}
                                            prefix="₹"
                                            precision={0}
                                            valueStyle={{ fontSize: 16 }}
                                        />


                                        <Tag
                                            color={
                                                Number(item.net_business || 0) >= 0
                                                    ? "green"
                                                    : "red"
                                            }
                                        >
                                            Net Business <br /> (A - B) <br />
                                            <Tag color="green">{money(item.net_business)}</Tag>
                                        </Tag>
                                    </Space>
                                </div>
                            ),
                            children: (
                                <Spin spinning={ledgerLoading}>
                                    <Table
                                        rowKey={(row) => row.ledger_name}
                                        size="small"
                                        columns={ledgerColumns}
                                        dataSource={ledgerMap[item.id] || []}
                                        pagination={false}
                                        scroll={{ x: 900 }}
                                    />
                                </Spin>
                            ),
                        }))}
                    />
                )}
            </Spin>
        </div>
    );
}