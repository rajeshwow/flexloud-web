import {
    ArrowLeftOutlined,
    CalendarOutlined,
    EditOutlined,
    FileTextOutlined,
    MailOutlined,
    PhoneOutlined,
    PrinterOutlined,
    ReloadOutlined,
    ShoppingCartOutlined,
    TruckOutlined,
    UserOutlined,
} from "@ant-design/icons";
import {
    Button,
    Card,
    Col,
    Descriptions,
    Divider,
    Empty,
    message,
    Row,
    Skeleton,
    Space,
    Table,
    Tag,
    Typography,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import dayjs from "dayjs";
import { useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import {
    fetchDeliveryChallanById,
    type DeliveryChallanItem,
} from "../../redux/reducers/deliveryChallans/deliveryChallanSlice";
import type { AppDispatch, RootState } from "../../redux/store";
import { handlePrintDeliveryChallan } from "../../shared/Utils/utils";

const { Title, Text } = Typography;

const formatCurrency = (value?: number | string | null) =>
    `₹${Number(value || 0).toFixed(2)}`;

const formatDate = (value?: string | null) =>
    value ? dayjs(value).format("DD MMM YYYY") : "-";

const formatDateTime = (value?: string | null) =>
    value ? dayjs(value).format("DD MMM YYYY hh:mm A") : "-";

const getStatusColor = (status?: string) => {
    const value = String(status || "").toLowerCase();

    if (value === "created") return "green";
    if (value === "draft") return "gold";
    if (value === "cancelled") return "red";

    return "default";
};

export default function DeliveryChallanDetailsPage() {
    const dispatch = useDispatch<AppDispatch>();
    const navigate = useNavigate();
    const { slug, id } = useParams();

    const { details, detailsLoading } = useSelector(
        (state: RootState) => state.deliveryChallans,
    );

    const loadDetails = async () => {
        if (!id) return;

        try {
            await dispatch(fetchDeliveryChallanById(id)).unwrap();
        } catch (error: any) {
            message.error(error || "Failed to load delivery challan details");
        }
    };

    useEffect(() => {
        loadDetails();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id]);

    const columns: ColumnsType<DeliveryChallanItem> = useMemo(
        () => [
            {
                title: "#",
                key: "index",
                width: 70,
                align: "center",
                render: (_, __, index) => index + 1,
            },
            {
                title: "Item Details",
                dataIndex: "item_name",
                key: "item_name",
                width: 320,
                render: (value: string, record) => (
                    <Space direction="vertical" size={0}>
                        <Text strong>{value || "-"}</Text>
                        {record.sku ? (
                            <Text type="secondary" style={{ fontSize: 12 }}>
                                SKU: {record.sku}
                            </Text>
                        ) : null}
                    </Space>
                ),
            },
            {
                title: "Quantity",
                dataIndex: "quantity",
                key: "quantity",
                width: 130,
                align: "right",
                render: (value) => Number(value || 0).toFixed(2),
            },
            {
                title: "Rate",
                dataIndex: "rate",
                key: "rate",
                width: 140,
                align: "right",
                render: (value) => formatCurrency(value),
            },
            {
                title: "GST %",
                dataIndex: "tax",
                key: "tax",
                width: 110,
                align: "right",
                render: (value) => `${Number(value || 0).toFixed(2)}%`,
            },
            {
                title: "CGST",
                dataIndex: "cgst",
                key: "cgst",
                width: 130,
                align: "right",
                render: (value) => formatCurrency(value),
            },
            {
                title: "SGST",
                dataIndex: "sgst",
                key: "sgst",
                width: 130,
                align: "right",
                render: (value) => formatCurrency(value),
            },
            {
                title: "Amount",
                dataIndex: "amount",
                key: "amount",
                width: 150,
                align: "right",
                render: (value) => <Text strong>{formatCurrency(value)}</Text>,
            },
        ],
        [],
    );

    if (detailsLoading && !details) {
        return (
            <div style={{ padding: 16 }}>
                <Card style={{ borderRadius: 16 }}>
                    <Skeleton active paragraph={{ rows: 10 }} />
                </Card>
            </div>
        );
    }

    if (!details) {
        return (
            <div style={{ padding: 16 }}>
                <Card style={{ borderRadius: 16 }}>
                    <Empty description="Delivery challan not found" />
                    <div style={{ textAlign: "center", marginTop: 16 }}>
                        <Button
                            icon={<ArrowLeftOutlined />}
                            onClick={() => navigate(`/${slug}/delivery-challans`)}
                        >
                            Back to Delivery Challans
                        </Button>
                    </div>
                </Card>
            </div>
        );
    }

    const items = details.items || [];





    return (
        <div style={{ padding: 16 }}>
            <Card
                style={{ borderRadius: 18, marginBottom: 16 }}
                bodyStyle={{ padding: 20 }}
            >
                <Row gutter={[16, 16]} align="middle" justify="space-between">
                    <Col xs={24} lg={14}>
                        <Space align="start">
                            <div
                                style={{
                                    width: 46,
                                    height: 46,
                                    borderRadius: 14,
                                    display: "grid",
                                    placeItems: "center",
                                    background: "var(--ant-color-primary-bg)",
                                    color: "var(--ant-color-primary)",
                                    fontSize: 22,
                                }}
                            >
                                <TruckOutlined />
                            </div>

                            <Space direction="vertical" size={2}>
                                <Space wrap>
                                    <Title level={4} style={{ margin: 0 }}>
                                        {details.challan_number || "Delivery Challan"}
                                    </Title>

                                    <Tag color={getStatusColor(details.status)}>
                                        {String(details.status || "draft").toUpperCase()}
                                    </Tag>
                                </Space>

                                <Text type="secondary">
                                    {details.reference_no
                                        ? `Reference: ${details.reference_no}`
                                        : "No reference number"}
                                </Text>
                            </Space>
                        </Space>
                    </Col>

                    <Col xs={24} lg={10}>
                        <Space wrap style={{ width: "100%", justifyContent: "flex-end" }}>
                            <Button
                                icon={<ArrowLeftOutlined />}
                                onClick={() => navigate(`/${slug}/delivery-challans`)}
                            >
                                Back
                            </Button>

                            <Button icon={<ReloadOutlined />} onClick={loadDetails}>
                                Refresh
                            </Button>

                            <Button icon={<PrinterOutlined />} onClick={() => handlePrintDeliveryChallan(details)}>
                                Print
                            </Button>
                            <Button
                                type="primary"
                                icon={<EditOutlined />}
                                onClick={() =>
                                    navigate(`/${slug}/delivery-challans/${details.id}/edit`)
                                }
                            >
                                Edit
                            </Button>
                        </Space>
                    </Col>
                </Row>
            </Card>

            <Row gutter={[16, 16]}>
                <Col xs={24} xl={16}>
                    <Row gutter={[16, 16]}>
                        <Col xs={24} md={12}>
                            <Card
                                title={
                                    <Space>
                                        <UserOutlined />
                                        Customer Details
                                    </Space>
                                }
                                style={{ borderRadius: 16, height: "100%" }}
                            >
                                <Space direction="vertical" size={10} style={{ width: "100%" }}>
                                    <div>
                                        <Text type="secondary">Customer Name</Text>
                                        <div>
                                            <Text strong style={{ fontSize: 16 }}>
                                                {details.customer_name || "-"}
                                            </Text>
                                        </div>
                                    </div>

                                    <Space>
                                        <MailOutlined />
                                        <Text>{details.customer_email || "-"}</Text>
                                    </Space>

                                    <Space>
                                        <PhoneOutlined />
                                        <Text>{details.customer_phone || "-"}</Text>
                                    </Space>
                                </Space>
                            </Card>
                        </Col>

                        <Col xs={24} md={12}>
                            <Card
                                title={
                                    <Space>
                                        <FileTextOutlined />
                                        Challan Info
                                    </Space>
                                }
                                style={{ borderRadius: 16, height: "100%" }}
                            >
                                <Descriptions column={1} size="small">
                                    <Descriptions.Item label="Challan Type">
                                        {details.challan_type || "-"}
                                    </Descriptions.Item>

                                    <Descriptions.Item label="Challan Date">
                                        <Space>
                                            <CalendarOutlined />
                                            {formatDate(details.challan_date)}
                                        </Space>
                                    </Descriptions.Item>

                                    <Descriptions.Item label="Created At">
                                        {formatDateTime(details.created_at)}
                                    </Descriptions.Item>

                                    <Descriptions.Item label="Updated At">
                                        {formatDateTime(details.updated_at)}
                                    </Descriptions.Item>
                                </Descriptions>
                            </Card>
                        </Col>

                        <Col xs={24}>
                            <Card
                                title={
                                    <Space>
                                        <ShoppingCartOutlined />
                                        Item Details
                                    </Space>
                                }
                                style={{ borderRadius: 16 }}
                            >
                                <Table<DeliveryChallanItem>
                                    rowKey="id"
                                    columns={columns}
                                    dataSource={items}
                                    pagination={false}
                                    scroll={{ x: 1180 }}
                                    locale={{
                                        emptyText: "No items added in this delivery challan",
                                    }}
                                />
                            </Card>
                        </Col>

                        <Col xs={24}>
                            <Card title="Customer Notes" style={{ borderRadius: 16 }}>
                                {details.notes ? (
                                    <Text>{details.notes}</Text>
                                ) : (
                                    <Text type="secondary">No notes added.</Text>
                                )}
                            </Card>
                        </Col>
                    </Row>
                </Col>

                <Col xs={24} xl={8}>
                    <Card
                        title="Amount Summary"
                        style={{
                            borderRadius: 16,
                            // position: "sticky",
                            // top: 16,
                        }}
                    >
                        <Space direction="vertical" size={14} style={{ width: "100%" }}>
                            <Row justify="space-between">
                                <Text>Sub Total</Text>
                                <Text strong>{formatCurrency(details.subtotal)}</Text>
                            </Row>

                            <Row justify="space-between">
                                <Text>
                                    Discount{" "}
                                    {Number(details.discount_percent || 0) > 0
                                        ? `(${Number(details.discount_percent || 0).toFixed(2)}%)`
                                        : ""}
                                </Text>
                                <Text>{formatCurrency(details.discount_amount)}</Text>
                            </Row>

                            <Row justify="space-between">
                                <Text>Adjustment</Text>
                                <Text>{formatCurrency(details.adjustment)}</Text>
                            </Row>

                            <Divider style={{ margin: "6px 0" }} />

                            <Row justify="space-between">
                                <Text strong style={{ fontSize: 16 }}>
                                    Grand Total
                                </Text>
                                <Text strong style={{ fontSize: 20 }}>
                                    {formatCurrency(details.total)}
                                </Text>
                            </Row>
                        </Space>
                    </Card>

                    <Card
                        title="Quick Info"
                        style={{ borderRadius: 16, marginTop: 16 }}
                    >
                        <Descriptions column={1} size="small">
                            <Descriptions.Item label="Status">
                                <Tag color={getStatusColor(details.status)}>
                                    {String(details.status || "draft").toUpperCase()}
                                </Tag>
                            </Descriptions.Item>

                            <Descriptions.Item label="Items">
                                {items.length}
                            </Descriptions.Item>

                            <Descriptions.Item label="Reference">
                                {details.reference_no || "-"}
                            </Descriptions.Item>

                            <Descriptions.Item label="Customer">
                                {details.customer_name || "-"}
                            </Descriptions.Item>
                        </Descriptions>
                    </Card>
                </Col>
            </Row>
        </div>
    );
}