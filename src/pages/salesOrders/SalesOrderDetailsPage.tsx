import {
    ArrowLeftOutlined,
    CalendarOutlined,
    CheckCircleOutlined,
    ClockCircleOutlined,
    EditOutlined,
    FileTextOutlined,
    NumberOutlined,
    ShoppingCartOutlined,
    TeamOutlined,
    UserOutlined,
    WalletOutlined,
} from "@ant-design/icons";
import {
    Button,
    Card,
    Col,
    Divider,
    Empty,
    Row,
    Space,
    Spin,
    Statistic,
    Table,
    Tag,
    Typography,
} from "antd";
import dayjs from "dayjs";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import {
    fetchSalesOrderById,
    resetSalesOrderDetail,
} from "../../redux/reducers/salesOrders.slice";
import type { AppDispatch } from "../../redux/store";
import { toTitleCase } from "../../shared/Utils/utils";

const { Title, Text } = Typography;

const getStatusColor = (status?: string) => {
    switch (status) {
        case "confirmed":
            return "blue";
        case "packed":
            return "purple";
        case "shipped":
            return "cyan";
        case "delivered":
            return "green";
        case "cancelled":
            return "red";
        default:
            return "default";
    }
};

const formatMoney = (value: any, currency = "₹") =>
    `${currency} ${Number(value || 0).toFixed(2)}`;

const formatDate = (value?: string) =>
    value ? dayjs(value).format("DD MMM YYYY") : "-";

export default function SalesOrderDetailsPage() {
    const dispatch = useDispatch<AppDispatch>();
    const navigate = useNavigate();
    const { slug, id } = useParams();

    const { detail, detailLoading } = useSelector((s: any) => s.salesOrders);

    useEffect(() => {
        if (id) dispatch(fetchSalesOrderById(id));

        return () => {
            dispatch(resetSalesOrderDetail());
        };
    }, [id]);

    if (detailLoading) {
        return (
            <Card style={{ borderRadius: 18 }}>
                <Spin />
            </Card>
        );
    }

    if (!detail) {
        return (
            <Card style={{ borderRadius: 18 }}>
                <Empty description="Sales order not found" />
            </Card>
        );
    }

    const currency = detail.currency || "₹";

    const columns = [
        {
            title: "Product",
            render: (_: any, r: any) => (
                <Space direction="vertical" size={0}>
                    <Text strong>{r.product_name || r.item_name || "-"}</Text>
                    <Text type="secondary" style={{ fontSize: 12 }}>
                        SKU: {r.sku || r.item_code || "-"}
                    </Text>
                </Space>
            ),
        },
        {
            title: "Qty",
            align: "right" as const,
            render: (_: any, r: any) => Number(r.quantity || 0),
        },
        {
            title: "Rate",
            align: "right" as const,
            render: (_: any, r: any) => formatMoney(r.price || r.rate, currency),
        },
        {
            title: "Amount",
            align: "right" as const,
            render: (_: any, r: any) => (
                <Text strong>{formatMoney(r.amount, currency)}</Text>
            ),
        },
    ];

    return (
        <div>
            <Card
                style={{
                    borderRadius: 18,
                    marginBottom: 16,
                }}
            >
                <Space style={{ width: "100%", justifyContent: "space-between" }}>
                    <Space align="center">
                        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate(-1)} />

                        <div>
                            <Space align="center" wrap>
                                <Title level={3} style={{ margin: 0 }}>
                                    {detail.so_number || detail.voucher_number}
                                </Title>

                                <Tag color={getStatusColor(detail.status)}>
                                    {(detail.status || "draft").toUpperCase()}
                                </Tag>
                            </Space>

                            <Text type="secondary">
                                Sales order for {detail.customer_name || "customer"}
                            </Text>
                        </div>
                    </Space>

                    <Button
                        type="primary"
                        icon={<EditOutlined />}
                        onClick={() => navigate(`/${slug}/sales-orders/${id}/edit`)}
                    >
                        Edit Sales Order
                    </Button>
                </Space>
            </Card>

            <Row gutter={[16, 16]}>
                <Col xs={24} sm={12} lg={6}>
                    <InfoCard
                        icon={<NumberOutlined />}
                        label="SO Number"
                        value={detail.so_number || detail.voucher_number || "-"}
                    />
                </Col>

                <Col xs={24} sm={12} lg={6}>
                    <InfoCard
                        icon={<TeamOutlined />}
                        label="Customer"
                        value={detail.customer_name || "-"}
                    />
                </Col>

                <Col xs={24} sm={12} lg={6}>
                    <InfoCard
                        icon={<CalendarOutlined />}
                        label="Order Date"
                        value={formatDate(detail.so_date || detail.voucher_date)}
                    />
                </Col>

                <Col xs={24} sm={12} lg={6}>
                    <InfoCard
                        icon={<ClockCircleOutlined />}
                        label="Delivery Date"
                        value={formatDate(detail.expected_delivery_date)}
                    />
                </Col>
            </Row>

            <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
                <Col xs={24} lg={16}>
                    <Card
                        title={
                            <Space>
                                <ShoppingCartOutlined />
                                <span>Ordered Products</span>
                            </Space>
                        }
                        style={{ borderRadius: 18 }}
                    >
                        <Table
                            rowKey="id"
                            columns={columns}
                            dataSource={detail.items || []}
                            pagination={false}
                        />
                    </Card>
                </Col>

                <Col xs={24} lg={8}>
                    <Card
                        title={
                            <Space>
                                <WalletOutlined />
                                <span>Amount Summary</span>
                            </Space>
                        }
                        style={{ borderRadius: 18 }}
                    >
                        <Statistic
                            title="Grand Total"
                            value={Number(detail.grand_total || detail.total_amount || 0)}
                            precision={2}
                            prefix={currency}
                        />

                        <Divider />

                        <SummaryRow label="Subtotal" value={formatMoney(detail.subtotal, currency)} />
                        <SummaryRow label="Discount" value={formatMoney(detail.discount, currency)} />
                        <SummaryRow label="Tax" value={formatMoney(detail.tax, currency)} />
                        <SummaryRow label="Shipping" value={formatMoney(detail.shipping, currency)} />

                        <Divider />

                        <SummaryRow
                            strong
                            label="Total Payable"
                            value={formatMoney(detail.grand_total || detail.total_amount, currency)}
                        />
                    </Card>

                    <Card
                        title={
                            <Space>
                                <UserOutlined />
                                <span>Ownership</span>
                            </Space>
                        }
                        style={{ borderRadius: 18, marginTop: 16 }}
                    >
                        <SummaryRow label="Assigned To" value={toTitleCase(detail.assigned_to_name as string) || "-"} />
                        <SummaryRow label="Contact" value={detail.contact_name || "-"} />
                        <SummaryRow label="Reference" value={detail.reference_number || "-"} />
                    </Card>
                </Col>
            </Row>

            <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
                <Col xs={24} lg={12}>
                    <Card
                        title={
                            <Space>
                                <FileTextOutlined />
                                <span>Notes</span>
                            </Space>
                        }
                        style={{ borderRadius: 18 }}
                    >
                        <Text>{detail.notes || "No notes added."}</Text>
                    </Card>
                </Col>

                <Col xs={24} lg={12}>
                    <Card
                        title={
                            <Space>
                                <CheckCircleOutlined />
                                <span>Terms & Conditions</span>
                            </Space>
                        }
                        style={{ borderRadius: 18 }}
                    >
                        <Text>{detail.terms || "No terms added."}</Text>
                    </Card>
                </Col>
            </Row>
        </div>
    );
}

function InfoCard({
    icon,
    label,
    value,
}: {
    icon: React.ReactNode;
    label: string;
    value: React.ReactNode;
}) {
    return (
        <Card style={{ borderRadius: 18, height: "100%" }}>
            <Space align="start">
                <div
                    style={{
                        width: 42,
                        height: 42,
                        borderRadius: 14,
                        display: "grid",
                        placeItems: "center",
                        background: "var(--ant-color-fill-tertiary)",
                        color: "var(--ant-color-primary)",
                        fontSize: 18,
                    }}
                >
                    {icon}
                </div>

                <Space direction="vertical" size={0}>
                    <Text type="secondary">{label}</Text>
                    <Text strong style={{ fontSize: 16 }}>
                        {value}
                    </Text>
                </Space>
            </Space>
        </Card>
    );
}

function SummaryRow({
    label,
    value,
    strong,
}: {
    label: string;
    value: React.ReactNode;
    strong?: boolean;
}) {
    return (
        <Space
            style={{
                width: "100%",
                justifyContent: "space-between",
                marginBottom: 10,
            }}
        >
            <Text type={strong ? undefined : "secondary"} strong={strong}>
                {label}
            </Text>
            <Text strong={strong}>{value}</Text>
        </Space>
    );
}