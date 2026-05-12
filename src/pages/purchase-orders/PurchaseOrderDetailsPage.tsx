import {
    ArrowLeftOutlined,
    CalendarOutlined,
    CheckCircleOutlined,
    EditOutlined,
    FileTextOutlined,
    InboxOutlined,
    NumberOutlined,
    ShopOutlined,
    TeamOutlined,
} from "@ant-design/icons";
import {
    Button,
    Card,
    Col,
    Descriptions,
    Divider,
    Empty,
    Row,
    Space,
    Spin,
    Table,
    Tag,
    Typography,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import dayjs from "dayjs";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";

import {
    getPurchaseOrderById,
    resetSelectedPurchaseOrder,
} from "../../redux/reducers/purchaseOrders.slice";
import type { RootState } from "../../redux/store";
import { getPurchaseOrderStatusColor, toTitleCase } from "../../shared/Utils/utils";

const { Title, Text } = Typography;

const formatDate = (value?: string) =>
    value ? dayjs(value).format("DD MMM YYYY") : "-";

const formatCurrency = (value?: number | string) =>
    `₹ ${Number(value || 0).toLocaleString("en-IN")}`;

const getStatusColor = (status?: string) => {
    const value = String(status || "").toLowerCase();

    if (value === "approved") return "green";
    if (value === "cancelled") return "red";
    if (value === "draft") return "orange";
    if (value === "pending") return "gold";

    return "default";
};

export default function PurchaseOrderDetailsPage() {
    const dispatch = useDispatch<any>();
    const navigate = useNavigate();
    const { slug = "", id = "" } = useParams();

    const { selected, detailLoading } = useSelector(
        (state: RootState) => state.purchaseOrders,
    );

    console.log("selected", selected)

    useEffect(() => {
        if (id) {
            dispatch(getPurchaseOrderById(id)).unwrap();
        }

        return () => {
            dispatch(resetSelectedPurchaseOrder());
        };
    }, [dispatch, id]);

    const rawData = selected?.raw_tally_data || {};
    const items = selected?.items || rawData?.items || [];

    const columns: ColumnsType<any> = [
        {
            title: "#",
            width: 70,
            render: (_: any, __: any, index: number) => index + 1,
        },
        {
            title: "Item Name",
            dataIndex: "item_name",
            render: (_: any, record: any) => (
                <Space direction="vertical" size={0}>
                    <Text strong>
                        {record.item_name || record.product_name || record.name || "-"}
                    </Text>
                    <Text type="secondary">
                        {record.item_code || record.product_id || "-"}
                    </Text>
                </Space>
            ),
        },
        {
            title: "Qty",
            dataIndex: "quantity",
            width: 110,
            render: (value: any) => Number(value || 0),
        },
        {
            title: "Rate",
            dataIndex: "rate",
            width: 140,
            render: (value: any, record: any) =>
                formatCurrency(value ?? record.price),
        },
        {
            title: "Discount",
            dataIndex: "discount",
            width: 140,
            render: (value: any, record: any) =>
                formatCurrency(value ?? record?.raw_tally_data?.discount),
        },
        {
            title: "Unit",
            dataIndex: "unit",
            width: 100,
            render: (value: any) => value || "-",
        },
        {
            title: "Amount",
            dataIndex: "amount",
            width: 160,
            align: "right",
            render: (value: any, record: any) => {
                const amount =
                    value ??
                    Number(record.quantity || 0) * Number(record.rate || record.price || 0) -
                    Number(record.discount || record?.raw_tally_data?.discount || 0);

                return <Text strong>{formatCurrency(amount)}</Text>;
            },
        },
    ];

    if (detailLoading) {
        return (
            <Card>
                <div style={{ minHeight: 320, display: "grid", placeItems: "center" }}>
                    <Spin />
                </div>
            </Card>
        );
    }

    if (!selected) {
        return (
            <Card>
                <Empty description="Purchase order not found" />
            </Card>
        );
    }

    return (
        <div>
            <Card
                style={{ marginBottom: 16 }}
                bodyStyle={{ padding: 20 }}
            >
                <Row gutter={[16, 16]} align="middle" justify="space-between">
                    <Col>
                        <Space size={12} align="start">
                            <Button
                                icon={<ArrowLeftOutlined />}
                                onClick={() => navigate(`/${slug}/purchase-orders`)}
                            />

                            <div>
                                <Space wrap>
                                    <Title level={4} style={{ margin: 0 }}>
                                        {selected.po_number || selected.voucher_number || "-"}
                                    </Title>

                                    <Tag color={getPurchaseOrderStatusColor(selected.status)}>
                                        {toTitleCase(selected.status) || "draft"}
                                    </Tag>
                                </Space>

                                {/* <Text type="secondary">
                                    Purchase order details, supplier, delivery and items
                                </Text> */}
                            </div>
                        </Space>
                    </Col>

                    <Col>
                        <Button
                            type="primary"
                            icon={<EditOutlined />}
                            onClick={() =>
                                navigate(`/${slug}/purchase-orders/${selected.id}/edit`)
                            }
                        >
                            Edit
                        </Button>
                    </Col>
                </Row>
            </Card>

            <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
                <Col xs={24} sm={12} lg={6}>
                    <Card>
                        <Space>
                            <FileTextOutlined />
                            <div>
                                <Text type="secondary">PO Number</Text>
                                <br />
                                <Text strong>{selected.po_number || selected.voucher_number}</Text>
                            </div>
                        </Space>
                    </Card>
                </Col>

                <Col xs={24} sm={12} lg={6}>
                    <Card>
                        <Space>
                            <CalendarOutlined />
                            <div>
                                <Text type="secondary">PO Date</Text>
                                <br />
                                <Text strong>
                                    {formatDate(selected.voucher_date || rawData.po_date)}
                                </Text>
                            </div>
                        </Space>
                    </Card>
                </Col>

                <Col xs={24} sm={12} lg={6}>
                    <Card>
                        <Space>
                            <InboxOutlined />
                            <div>
                                <Text type="secondary">Items</Text>
                                <br />
                                <Text strong>{items.length || selected.items_count || 0}</Text>
                            </div>
                        </Space>
                    </Card>
                </Col>

                <Col xs={24} sm={12} lg={6}>
                    <Card>
                        <Space>
                            <CheckCircleOutlined />
                            <div>
                                <Text type="secondary">Total Amount</Text>
                                <br />
                                <Text strong>{formatCurrency(selected.total_amount)}</Text>
                            </div>
                        </Space>
                    </Card>
                </Col>
            </Row>

            <Row gutter={[16, 16]}>
                <Col xs={24} lg={15}>
                    <Card
                        title={
                            <Space>
                                <NumberOutlined />
                                Purchase Order Information
                            </Space>
                        }
                    >
                        <Descriptions column={1} bordered size="middle">
                            <Descriptions.Item label="PO Number">
                                {selected.po_number || selected.voucher_number || "-"}
                            </Descriptions.Item>

                            <Descriptions.Item label="Reference Number">
                                {selected.reference_number || "-"}
                            </Descriptions.Item>

                            <Descriptions.Item label="Voucher Date">
                                {formatDate(selected.voucher_date || rawData.po_date)}
                            </Descriptions.Item>

                            <Descriptions.Item label="Expected Delivery Date">
                                {formatDate(
                                    selected.expected_delivery_date ||
                                    rawData.expected_delivery_date,
                                )}
                            </Descriptions.Item>

                            <Descriptions.Item label="Status">
                                <Tag color={getPurchaseOrderStatusColor(selected.status)}>
                                    {toTitleCase(selected.status) || "draft"}
                                </Tag>
                            </Descriptions.Item>

                            <Descriptions.Item label="Created At">
                                {formatDate(selected.created_at)}
                            </Descriptions.Item>
                        </Descriptions>
                    </Card>
                </Col>

                <Col xs={24} lg={9}>
                    <Card
                        title={
                            <Space>
                                <ShopOutlined />
                                Supplier & Assignment
                            </Space>
                        }
                    >
                        <Descriptions column={1} bordered size="middle">
                            <Descriptions.Item label="Supplier">
                                {selected.supplier_name || rawData.vendor_name || "-"}
                            </Descriptions.Item>

                            <Descriptions.Item label="Supplier GST">
                                {selected.supplier_gst || "-"}
                            </Descriptions.Item>

                            <Descriptions.Item label="Assigned To">
                                {toTitleCase(selected.assigned_to_name as string) || rawData.assigned_to_name || "-"}
                            </Descriptions.Item>

                            <Descriptions.Item label="Assigned User ID">
                                {selected.assigned_to || rawData.assigned_to || "-"}
                            </Descriptions.Item>

                            <Descriptions.Item label="Currency">
                                {rawData.currency || "INR"}
                            </Descriptions.Item>
                        </Descriptions>
                    </Card>
                </Col>
            </Row>

            <Card
                style={{ marginTop: 16 }}
                title={
                    <Space>
                        <InboxOutlined />
                        Items
                    </Space>
                }
            >
                <Table
                    rowKey={(record) => record.id || record.item_code || record.product_id}
                    columns={columns}
                    dataSource={items}
                    pagination={false}
                    scroll={{ x: 900 }}
                />

                <Divider />

                <Row justify="end">
                    <Col xs={24} md={10} lg={8}>
                        <Descriptions column={1} size="small" bordered>
                            <Descriptions.Item label="Subtotal">
                                {formatCurrency(rawData.subtotal)}
                            </Descriptions.Item>

                            <Descriptions.Item label="Discount">
                                {formatCurrency(rawData.discount)}
                            </Descriptions.Item>

                            <Descriptions.Item label="Shipping">
                                {formatCurrency(rawData.shipping)}
                            </Descriptions.Item>

                            <Descriptions.Item label="Tax">
                                {formatCurrency(rawData.tax)}
                            </Descriptions.Item>

                            <Descriptions.Item label="Grand Total">
                                <Text strong>
                                    {formatCurrency(
                                        rawData.grand_total || selected.total_amount,
                                    )}
                                </Text>
                            </Descriptions.Item>
                        </Descriptions>
                    </Col>
                </Row>
            </Card>

            <Card
                style={{ marginTop: 16 }}
                title={
                    <Space>
                        <TeamOutlined />
                        Audit
                    </Space>
                }
            >
                <Descriptions column={{ xs: 1, sm: 2 }} bordered size="small">
                    <Descriptions.Item label="Created At">
                        {selected.created_at
                            ? dayjs(selected.created_at).format("DD MMM YYYY, hh:mm A")
                            : "-"}
                    </Descriptions.Item>

                    <Descriptions.Item label="Updated At">
                        {selected.updated_at
                            ? dayjs(selected.updated_at).format("DD MMM YYYY, hh:mm A")
                            : "-"}
                    </Descriptions.Item>
                </Descriptions>
            </Card>
        </div>
    );
}