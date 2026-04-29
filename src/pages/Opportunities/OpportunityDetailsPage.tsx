import {
    ArrowLeftOutlined,
    BankOutlined,
    CalendarOutlined,
    EditOutlined,
    MailOutlined,
    PhoneOutlined,
    UserOutlined,
} from "@ant-design/icons";
import {
    Button,
    Card,
    Col,
    Empty,
    Progress,
    Row,
    Space,
    Spin,
    Statistic,
    Table,
    Tag,
    Typography,
    message
} from "antd";
import type { ColumnsType } from "antd/es/table";
import dayjs from "dayjs";
import { useEffect, useMemo, useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";

import { getOpportunityById } from "../../redux/reducers/opportunities.slice";
import type { AppDispatch } from "../../redux/store";
import { toTitleCase } from "../../shared/Utils/utils";

const { Title, Text, Paragraph } = Typography;

type LineItem = {
    id?: string;
    qty?: number;
    product_name?: string;
    part_no?: string;
    list_price?: number;
    discount?: number;
    discount_type?: string;
    sale_price?: number;
    tax_type?: string;
    tax_amount?: number;
    tax?: number;
    total?: number;
};

type OpportunityDetails = {
    id: string;
    opportunity_number?: string;
    name?: string;
    organization_name?: string;
    organization_display_name?: string;
    contact_name?: string;
    contact_display_name?: string;
    contact_number?: string;
    contact_email?: string;
    lead_source?: string;
    company?: string;
    sales_stage?: string;
    type?: string;
    dealer_organization?: string;
    amount?: number;
    currency?: string;
    probability?: number;
    next_step?: string;
    dealer_contact?: string;
    expected_close_date?: string;
    followup_type?: string;
    next_followup?: string;
    close_date?: string;
    add_description?: string;
    description?: string;
    assigned_to?: string;
    assigned_to_name?: string;
    campaign?: string;
    created_at?: string;
    updated_at?: string;
    line_items?: LineItem[];
};

const stageColorMap: Record<string, string> = {
    Qualification: "blue",
    "Needs Analysis": "cyan",
    "Value Proposition": "geekblue",
    Proposal: "purple",
    Negotiation: "orange",
    "Closed Won": "green",
    "Closed Lost": "red",
};

const formatDate = (value?: string) => {
    if (!value) return "-";
    return dayjs(value).isValid() ? dayjs(value).format("DD MMM YYYY") : "-";
};

const formatDateTime = (value?: string) => {
    if (!value) return "-";
    return dayjs(value).isValid()
        ? dayjs(value).format("DD MMM YYYY, hh:mm A")
        : "-";
};

const formatMoney = (amount?: number, currency?: string) => {
    if (amount === null || amount === undefined) return "-";

    const symbol =
        currency === "$ (USD)"
            ? "$"
            : currency === "AED"
                ? "AED"
                : currency === "₹ (INR)"
                    ? "₹"
                    : currency || "₹";

    return `${symbol} ${Number(amount || 0).toLocaleString("en-IN")}`;
};

const safe = (value?: string | number | null) => {
    if (value === null || value === undefined || value === "") return "-";
    return value;
};

export default function OpportunityDetailsPage() {
    const dispatch = useDispatch<AppDispatch>();
    const navigate = useNavigate();
    const { slug, id } = useParams<{ slug: string; id: string }>();

    const [loading, setLoading] = useState(false);
    const [data, setData] = useState<OpportunityDetails | null>(null);

    useEffect(() => {
        fetchDetails();
    }, [id]);

    const fetchDetails = async () => {
        if (!id) return;

        try {
            setLoading(true);
            const res = await dispatch(getOpportunityById(id)).unwrap();
            setData(res?.data || null);
        } catch (error) {
            message.error(
                typeof error === "string" ? error : "Failed to load opportunity"
            );
            navigate(-1);
        } finally {
            setLoading(false);
        }
    };

    const lineItemColumns: ColumnsType<LineItem> = useMemo(
        () => [
            {
                title: "Product",
                dataIndex: "product_name",
                key: "product_name",
                render: (value) => <Text strong>{safe(value)}</Text>,
            },

            {
                title: "Qty",
                dataIndex: "qty",
                key: "qty",
                align: "right",
                render: (value) => safe(value),
            },
            {
                title: "List Price",
                dataIndex: "list_price",
                key: "list_price",
                align: "right",
                render: (value) => formatMoney(value, data?.currency),
            },
            {
                title: "Discount",
                dataIndex: "discount",
                key: "discount",
                align: "right",
                render: (_, record) =>
                    record.discount_type
                        ? `${record.discount || 0} ${record.discount_type}`
                        : record.discount || "-",
            },
            {
                title: "Sale Price",
                dataIndex: "sale_price",
                key: "sale_price",
                align: "right",
                render: (value) => formatMoney(value, data?.currency),
            },
            {
                title: "Tax",
                dataIndex: "tax_amount",
                key: "tax_amount",
                align: "right",
                render: (_, record) => (
                    <Space direction="vertical" size={0}>
                        <Text>{formatMoney(record.tax_amount || 0, data?.currency)}</Text>
                        <Text type="secondary" style={{ fontSize: 12 }}>
                            {record.tax_type || "-"} {record.tax ? `(${record.tax}%)` : ""}
                        </Text>
                    </Space>
                ),
            },
            {
                title: "Total",
                dataIndex: "total",
                key: "total",
                align: "right",
                render: (value) => <Text strong>{formatMoney(value, data?.currency)}</Text>,
            },
        ],
        [data?.currency]
    );

    const lineItemsTotal = useMemo(() => {
        return (data?.line_items || []).reduce(
            (sum, item) => sum + Number(item.total || 0),
            0
        );
    }, [data?.line_items]);

    if (loading) {
        return (
            <div style={{ padding: 40, textAlign: "center" }}>
                <Spin />
            </div>
        );
    }

    if (!data) {
        return (
            <div style={{ padding: 24 }}>
                <Empty description="Opportunity not found" />
            </div>
        );
    }

    const probability = Number(data.probability || 0);
    const stageColor = data.sales_stage
        ? stageColorMap[data.sales_stage] || "default"
        : "default";

    return (
        <div className="opportunity-details-page" style={{ paddingBottom: 24 }}>
            <Card
                style={{
                    borderRadius: 16,
                    marginBottom: 16,
                }}
                bodyStyle={{ padding: 20 }}
            >
                <Row gutter={[16, 16]} align="middle" justify="space-between">
                    <Col xs={24} lg={16}>
                        <Space direction="vertical" size={4}>
                            <Space wrap>
                                <Button
                                    icon={<ArrowLeftOutlined />}
                                    onClick={() => navigate(-1)}
                                >
                                    Back
                                </Button>

                                {data.sales_stage && (
                                    <Tag color={stageColor}>{data.sales_stage}</Tag>
                                )}

                                {data.type && <Tag>{data.type}</Tag>}
                            </Space>

                            <Title level={3} style={{ margin: 0 }}>
                                {safe(toTitleCase(data.name))}
                            </Title>

                            <Text type="secondary">
                                {safe(data.opportunity_number)} • Created{" "}
                                {formatDateTime(data.created_at)}
                            </Text>
                        </Space>
                    </Col>

                    <Col xs={24} lg={8} style={{ textAlign: "right" }}>
                        <Space>
                            <Button
                                type="primary"
                                icon={<EditOutlined />}
                                onClick={() =>
                                    navigate(`/${slug}/opportunities/${data.id}/edit`)
                                }
                            >
                                Edit
                            </Button>
                        </Space>
                    </Col>
                </Row>
            </Card>

            <Row gutter={[16, 16]}>
                <Col xs={24} sm={12} lg={6}>
                    <Card style={{ borderRadius: 16 }}>
                        <Statistic
                            title="Opportunity Amount"
                            value={formatMoney(data.amount, data.currency)}
                            valueStyle={{ fontSize: 18 }}
                        />
                    </Card>
                </Col>

                <Col xs={24} sm={12} lg={6}>
                    <Card style={{ borderRadius: 16 }}>
                        <Statistic
                            title="Expected Close Date"
                            value={formatDate(data.expected_close_date)}
                            prefix={<CalendarOutlined />}
                            valueStyle={{ fontSize: 18 }}
                        />
                    </Card>
                </Col>

                <Col xs={24} sm={12} lg={6}>
                    <Card style={{ borderRadius: 16 }}>
                        <Statistic
                            title="Next Followup"
                            value={formatDateTime(data.next_followup)}
                            prefix={<CalendarOutlined />}
                            valueStyle={{ fontSize: 16 }}
                        />
                    </Card>
                </Col>

                <Col xs={24} sm={12} lg={6}>
                    <Card style={{ borderRadius: 16 }}>
                        <Text type="secondary">Probability</Text>
                        <div style={{ marginTop: 8 }}>
                            <Progress
                                percent={probability}
                                status={probability >= 75 ? "success" : "active"}
                            />
                        </div>
                    </Card>
                </Col>
            </Row>

            <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
                <Col xs={24} lg={16}>
                    <Card
                        style={{
                            borderRadius: 18,
                            height: "100%",
                            border: "1px solid var(--ant-color-border-secondary)",
                            boxShadow: "0 8px 24px rgba(15, 23, 42, 0.04)",
                        }}
                        bodyStyle={{ padding: 0 }}
                    >
                        <div
                            style={{
                                padding: "18px 22px",
                                borderBottom: "1px solid var(--ant-color-border-secondary)",
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                                gap: 12,
                            }}
                        >
                            <Space>
                                <div
                                    style={{
                                        width: 38,
                                        height: 38,
                                        borderRadius: 12,
                                        display: "grid",
                                        placeItems: "center",
                                        background: "var(--ant-color-primary-bg)",
                                        color: "var(--ant-color-primary)",
                                        fontWeight: 700,
                                    }}
                                >
                                    OP
                                </div>
                                <div>
                                    <Title level={5} style={{ margin: 0 }}>
                                        Opportunity Information
                                    </Title>
                                    <Text type="secondary" style={{ fontSize: 12 }}>
                                        Core sales and followup details
                                    </Text>
                                </div>
                            </Space>

                            {data.sales_stage ? (
                                <Tag color={stageColor} style={{ margin: 0, borderRadius: 999 }}>
                                    {data.sales_stage}
                                </Tag>
                            ) : null}
                        </div>

                        <div style={{ padding: 22 }}>
                            <Row gutter={[14, 14]}>
                                {[
                                    {
                                        label: "Opportunity Name",
                                        value: safe(toTitleCase(data.name)),
                                    },
                                    {
                                        label: "Opportunity Number",
                                        value: safe(data.opportunity_number),
                                    },
                                    {
                                        label: "Type",
                                        value: safe(data.type),
                                    },
                                    {
                                        label: "Lead Source",
                                        value: safe(data.lead_source),
                                    },
                                    {
                                        label: "Company",
                                        value: safe(data.company),
                                    },

                                    {
                                        label: "Followup Type",
                                        value: safe(data.followup_type),
                                    },
                                    {
                                        label: "Dealer Contact",
                                        value: safe(data.dealer_contact),
                                    },

                                    {
                                        label: "Updated At",
                                        value: formatDateTime(data.updated_at),
                                    },
                                    {
                                        label: "Close Date",
                                        value: formatDate(data.expected_close_date),
                                    },
                                ].map((item) => (
                                    <Col xs={24} sm={12} xl={8} key={item.label}>
                                        <div
                                            style={{
                                                minHeight: 86,
                                                padding: "14px 16px",
                                                borderRadius: 14,
                                                background: "var(--ant-color-fill-quaternary)",
                                                border: "1px solid var(--ant-color-border-secondary)",
                                            }}
                                        >
                                            <Text
                                                type="secondary"
                                                style={{
                                                    display: "block",
                                                    fontSize: 12,
                                                    marginBottom: 8,
                                                }}
                                            >
                                                {item.label}
                                            </Text>

                                            <Text
                                                strong
                                                style={{
                                                    fontSize: 14,
                                                    wordBreak: "break-word",
                                                }}
                                            >
                                                {item.value}
                                            </Text>
                                        </div>
                                    </Col>
                                ))}
                            </Row>
                        </div>
                    </Card>
                </Col>

                <Col xs={24} lg={8}>
                    <Card
                        style={{
                            borderRadius: 18,
                            height: "100%",
                            border: "1px solid var(--ant-color-border-secondary)",
                            boxShadow: "0 8px 24px rgba(15, 23, 42, 0.04)",
                        }}
                        bodyStyle={{ padding: 0 }}
                    >
                        <div
                            style={{
                                padding: "18px 22px",
                                borderBottom: "1px solid var(--ant-color-border-secondary)",
                            }}
                        >
                            <Title level={5} style={{ margin: 0 }}>
                                People & Organization
                            </Title>
                            <Text type="secondary" style={{ fontSize: 12 }}>
                                Contact, company and ownership
                            </Text>
                        </div>

                        <div style={{ padding: 18 }}>
                            {[
                                {
                                    icon: <BankOutlined />,
                                    label: "Organization",
                                    value: safe(toTitleCase(data.organization_display_name || data.organization_name)),
                                },
                                {
                                    icon: <UserOutlined />,
                                    label: "Contact",
                                    value: safe(toTitleCase(data.contact_display_name || data.contact_name)),
                                },
                                {
                                    icon: <PhoneOutlined />,
                                    label: "Phone",
                                    value: safe(data.contact_number),
                                },
                                {
                                    icon: <MailOutlined />,
                                    label: "Email",
                                    value: safe(data.contact_email),
                                },
                                {
                                    icon: <UserOutlined />,
                                    label: "Assigned To",
                                    value: safe(toTitleCase(data.assigned_to_name)),
                                },
                            ].map((item) => (
                                <div
                                    key={item.label}
                                    style={{
                                        display: "flex",
                                        gap: 12,
                                        padding: "14px 12px",
                                        borderRadius: 14,
                                        marginBottom: 10,
                                        background: "var(--ant-color-fill-quaternary)",
                                        border: "1px solid var(--ant-color-border-secondary)",
                                    }}
                                >
                                    <div
                                        style={{
                                            width: 38,
                                            height: 38,
                                            borderRadius: 12,
                                            display: "grid",
                                            placeItems: "center",
                                            background: "var(--ant-color-primary-bg)",
                                            color: "var(--ant-color-primary)",
                                            flex: "0 0 auto",
                                        }}
                                    >
                                        {item.icon}
                                    </div>

                                    <div style={{ minWidth: 0 }}>
                                        <Text type="secondary" style={{ fontSize: 12 }}>
                                            {item.label}
                                        </Text>
                                        <div>
                                            <Text strong style={{ wordBreak: "break-word" }}>
                                                {item.value}
                                            </Text>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Card>
                </Col>
            </Row>

            <Card
                title="Line Items"
                style={{ borderRadius: 16, marginTop: 16 }}
                extra={
                    <Text strong>
                        Total: {formatMoney(lineItemsTotal, data.currency)}
                    </Text>
                }
            >
                <Table<LineItem>
                    rowKey={(record) => record.id || `${record.product_name}-${record.part_no}`}
                    columns={lineItemColumns}
                    dataSource={data.line_items || []}
                    pagination={false}
                    scroll={{ x: 1000 }}
                />
            </Card>

            <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
                <Col xs={24} lg={12}>
                    <Card title="Description" style={{ borderRadius: 16 }}>
                        {data.description ? (
                            <Paragraph style={{ marginBottom: 0, whiteSpace: "pre-wrap" }}>
                                {data.description}
                            </Paragraph>
                        ) : (
                            <Text type="secondary">No description added.</Text>
                        )}
                    </Card>
                </Col>

                <Col xs={24} lg={12}>
                    <Card title="Additional Notes" style={{ borderRadius: 16 }}>
                        {data.add_description ? (
                            <Paragraph style={{ marginBottom: 0, whiteSpace: "pre-wrap" }}>
                                {data.add_description}
                            </Paragraph>
                        ) : (
                            <Text type="secondary">No additional notes added.</Text>
                        )}
                    </Card>
                </Col>
            </Row>
        </div>
    );
}