import {
    InboxOutlined,
    ReloadOutlined,
    SearchOutlined,
    SendOutlined,
    ShoppingCartOutlined,
    TruckOutlined,
} from "@ant-design/icons";
import {
    Badge,
    Button,
    Card,
    Col,
    DatePicker,
    Divider,
    Empty,
    Flex,
    Form,
    Input,
    InputNumber,
    Modal,
    Row,
    Select,
    Space,
    Table,
    Tabs,
    Tag,
    Tooltip,
    Typography,
    message,
    theme
} from "antd";
import type { ColumnsType } from "antd/es/table";
import dayjs from "dayjs";
import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
    createPoReceipt,
    fetchWarehousePurchaseOrders,
    fetchWarehouseSalesOrders,
    type WarehousePurchaseOrderItem,
    type WarehouseSalesOrderItem,
} from "../../redux/reducers/warehouse.slice";
import type { AppDispatch, RootState } from "../../redux/store";
import { getPurchaseOrderStatusColor, getPurchaseOrderStatusOptions, getSalesOrderStatusColor, getSalesOrderStatusOptions, toTitleCase } from "../../shared/Utils/utils";

const { RangePicker } = DatePicker;
const { Text, Title } = Typography;

type ActiveTab = "sales-orders" | "purchase-orders";





function formatCurrency(value?: number | string | null) {
    const amount = Number(value || 0);

    return new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 2,
    }).format(amount);
}

function titleCaseStatus(status?: string) {
    if (!status) return "-";

    return status
        .split("_")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");
}



export default function WarehouseListingPage() {
    const dispatch = useDispatch<AppDispatch>();
    const { token } = theme.useToken();

    const {
        salesOrders,
        purchaseOrders,
        salesOrdersTotal,
        purchaseOrdersTotal,
        loading,
    } = useSelector((state: RootState) => state.warehouse);

    const [activeTab, setActiveTab] = useState<ActiveTab>("sales-orders");

    const [receiveForm] = Form.useForm();

    const [receiveModalOpen, setReceiveModalOpen] = useState(false);
    const [selectedPurchaseOrder, setSelectedPurchaseOrder] =
        useState<WarehousePurchaseOrderItem | null>(null);
    const [receiveSubmitting, setReceiveSubmitting] = useState(false);

    const [receiveItems, setReceiveItems] = useState<any[]>([]);

    const openReceiveModal = (record: WarehousePurchaseOrderItem) => {
        setSelectedPurchaseOrder(record);

        const items = Array.isArray((record as any)?.items)
            ? (record as any).items
            : [];

        const mappedItems = items.map((item: any) => {
            const orderedQty = Number(item.ordered_qty || item.quantity || 0);
            const alreadyReceivedQty = Number(
                item.already_received_qty || item.received_qty || 0,
            );
            const alreadyDamagedQty = Number(item.already_damaged_qty ?? item.damaged_qty ?? 0);

            const pendingQty = Math.max(
                Number(
                    item.pending_qty ??
                    orderedQty - alreadyReceivedQty - alreadyDamagedQty,
                ),
                0,
            );

            return {
                ...item,
                ordered_qty: orderedQty,
                already_received_qty: alreadyReceivedQty,
                already_damaged_qty: alreadyDamagedQty,
                pending_qty: pendingQty,

                // editable current receipt values
                receive_now_qty: pendingQty,
                damage_now_qty: 0,
                remarks: item.remarks || null,
            };
        });

        setReceiveItems(mappedItems);

        receiveForm.setFieldsValue({
            courier_name: record.courier_name || "",
            awb_number: record.awb_number || "",
            status: record.status === "received" ? "received" : "partially_received",
            remarks: "",
        });

        setReceiveModalOpen(true);
    };

    const updateReceiveItem = (
        itemId: string,
        key: "receive_now_qty" | "damage_now_qty" | "remarks",
        value: any,
    ) => {
        setReceiveItems((prev) =>
            prev.map((item) => {
                const currentId = item.purchase_order_item_id || item.id;

                if (currentId !== itemId) return item;

                const pendingQty = Number(item.pending_qty || 0);

                if (key === "receive_now_qty") {
                    const receiveQty = Math.min(Number(value || 0), pendingQty);
                    const damageQty = Number(item.damage_now_qty ?? item.damaged_qty ?? 0);

                    return {
                        ...item,
                        receive_now_qty: receiveQty,
                        damage_now_qty: Math.min(damageQty, Math.max(pendingQty - receiveQty, 0)),
                    };
                }

                if (key === "damage_now_qty") {
                    const damageQty = Math.min(Number(value || 0), pendingQty);
                    const receiveQty = Number(item.receive_now_qty || 0);

                    return {
                        ...item,
                        damage_now_qty: damageQty,
                        receive_now_qty: Math.min(receiveQty, Math.max(pendingQty - damageQty, 0)),
                    };
                }

                return {
                    ...item,
                    [key]: value,
                };
            }),
        );
    };

    const [salesFilters, setSalesFilters] = useState({
        search: "",
        status: "",
        page: 1,
        limit: 10,
        date_from: "",
        date_to: "",
    });

    const [purchaseFilters, setPurchaseFilters] = useState({
        search: "",
        status: "",
        page: 1,
        limit: 10,
        date_from: "",
        date_to: "",
    });

    const activeFilters =
        activeTab === "sales-orders" ? salesFilters : purchaseFilters;

    const setActiveFilters =
        activeTab === "sales-orders" ? setSalesFilters : setPurchaseFilters;

    const loadSalesOrders = () => {
        dispatch(fetchWarehouseSalesOrders(salesFilters));
    };

    const handleReceiveSubmit = async () => {
        try {
            const values = await receiveForm.validateFields();

            if (!selectedPurchaseOrder) return;

            const validItems = receiveItems
                .map((item: any) => ({
                    purchase_order_item_id: item.purchase_order_item_id || item.id,
                    received_qty: Number(item.receive_now_qty || 0),
                    damaged_qty: Number(item.damage_now_qty ?? item.damaged_qty ?? 0),
                    remarks: item.remarks || null,
                }))
                .filter((item: any) => item.received_qty > 0 || item.damaged_qty > 0);

            if (!validItems.length) {
                message.error("Please enter received or damaged quantity for at least one item");
                return;
            }

            setReceiveSubmitting(true);

            const payload = {
                purchase_order_id: selectedPurchaseOrder.id,
                remarks: values.remarks || null,
                received_at: new Date().toISOString(),
                courier_name: values.courier_name,
                awb_number: values.awb_number,
                status: values.status,

                items: validItems,
            };

            const res = await dispatch(createPoReceipt(payload)).unwrap();

            if (res.success || res?.statusCode === 201) {
                message.success(res.message || "Receipt saved successfully");
            } else {
                message.error(res.message || "Failed to save receipt");
            }

            setReceiveModalOpen(false);
            setSelectedPurchaseOrder(null);
            setReceiveItems([]);
            receiveForm.resetFields();
            setReceiveItems([]);

            loadPurchaseOrders();
        } catch (error: any) {
            if (error?.errorFields) return;

            message.error(error?.message || "Failed to save receipt");
        } finally {
            setReceiveSubmitting(false);
        }
    };

    const loadPurchaseOrders = () => {
        dispatch(fetchWarehousePurchaseOrders(purchaseFilters));
    };

    useEffect(() => {
        loadSalesOrders();
    }, [
        salesFilters.page,
        salesFilters.limit,
        salesFilters.status,
        salesFilters.date_from,
        salesFilters.date_to,
    ]);

    useEffect(() => {
        loadPurchaseOrders();
    }, [
        purchaseFilters.page,
        purchaseFilters.limit,
        purchaseFilters.status,
        purchaseFilters.date_from,
        purchaseFilters.date_to,
    ]);

    const handleSearch = () => {
        if (activeTab === "sales-orders") {
            dispatch(fetchWarehouseSalesOrders({ ...salesFilters, page: 1 }));
            setSalesFilters((prev) => ({ ...prev, page: 1 }));
            return;
        }

        dispatch(fetchWarehousePurchaseOrders({ ...purchaseFilters, page: 1 }));
        setPurchaseFilters((prev) => ({ ...prev, page: 1 }));
    };

    const handleRefresh = () => {
        if (activeTab === "sales-orders") {
            loadSalesOrders();
            return;
        }

        loadPurchaseOrders();
    };

    const handleDateChange = (dates: any) => {
        setActiveFilters((prev) => ({
            ...prev,
            page: 1,
            date_from: dates?.[0] ? dayjs(dates[0]).format("YYYY-MM-DD") : "",
            date_to: dates?.[1] ? dayjs(dates[1]).format("YYYY-MM-DD") : "",
        }));
    };

    const salesOrderColumns: ColumnsType<WarehouseSalesOrderItem> = useMemo(
        () => [
            {
                title: "Sales Order",
                dataIndex: "so_number",
                width: 180,
                render: (_: any, record: any) => (
                    <Space direction="vertical" size={1}>
                        <Text strong style={{ color: token.colorPrimary }}>
                            🚚 {record.so_number || "-"}
                        </Text>
                        <Text type="secondary" style={{ fontSize: 12 }}>
                            {record.so_date ? dayjs(record.so_date).format("DD MMM YYYY") : "-"}
                        </Text>
                    </Space>
                ),
            },

            {
                title: "Customer",
                dataIndex: "customer_name",
                width: 220,
                render: (_: any, record: any) => (
                    <Space direction="vertical" size={1}>
                        <Text strong>{toTitleCase(record.customer_name) || "-"}</Text>
                        <Text type="secondary" style={{ fontSize: 12 }}>
                            {record.assigned_to_name ? `Sales: ${record.assigned_to_name}` : ""}
                        </Text>
                    </Space>
                ),
            },
            {
                title: "Status",
                dataIndex: "status",
                width: 150,
                render: (status) => (
                    <Tag color={getSalesOrderStatusColor(status)}>{titleCaseStatus(status)}</Tag>
                ),
            },
            {
                title: "Items",
                dataIndex: "items_summary",
                ellipsis: true,
                render: (_: any, record: any) => (
                    <Tooltip title={record.items_summary}>
                        <Space direction="vertical" size={1}>
                            <Text>{record.items_summary || "-"}</Text>
                            <Text type="secondary" style={{ fontSize: 12 }}>
                                {Number(record.items_count || 0)} item(s)
                            </Text>
                        </Space>
                    </Tooltip>
                ),
            },
            {
                title: "Courier / Tracking",
                width: 200,
                render: (_: any, record: any) => (
                    <Space direction="vertical" size={1}>
                        <Text>{record.courier_name || "-"}</Text>
                        <Text type="secondary" style={{ fontSize: 12 }}>
                            {record.awb_number || "No tracking yet"}
                        </Text>
                    </Space>
                ),
            },
            {
                title: "Expected",
                dataIndex: "expected_delivery_date",
                width: 130,
                render: (value) =>
                    value ? dayjs(value).format("DD MMM YYYY") : <Text type="secondary">-</Text>,
            },
            {
                title: "Amount",
                dataIndex: "grand_total",
                width: 140,
                align: "right",
                render: (value) => <Text strong>{formatCurrency(value)}</Text>,
            },

            {
                title: "Action",
                width: 140,
                fixed: "right",
                render: (_: any, record: any) => (
                    <Button
                        type="primary"
                        icon={<TruckOutlined />}
                        onClick={() => {
                            console.log("open dispatch modal", record);
                        }}
                    >
                        Dispatch
                    </Button>
                ),
            },
        ],
        [token.colorPrimary]
    );

    const purchaseOrderColumns = [
        {
            title: "Purchase Order",
            dataIndex: "po_number",
            width: 180,
            render: (_: any, record: any) => (
                <Space direction="vertical" size={1}>
                    <Text strong style={{ color: token.colorPrimary }}>
                        📦 {record.po_number || "-"}
                    </Text>
                    <Text type="secondary" style={{ fontSize: 12 }}>
                        {record.po_date ? dayjs(record.po_date).format("DD MMM YYYY") : "-"}
                    </Text>
                </Space>
            ),
        },
        {
            title: "Vendor",
            dataIndex: "vendor_name",
            width: 220,
            render: (_: any, record: any) => (
                <Space direction="vertical" size={1}>
                    <Text strong>{toTitleCase(record.vendor_name) || "-"}</Text>
                    <Text type="secondary" style={{ fontSize: 12 }}>
                        {record.assigned_to_name ? `Owner: ${record.assigned_to_name}` : ""}
                    </Text>
                </Space>
            ),
        },
        {
            title: "Status",
            dataIndex: "status",
            width: 160,
            render: (status: any) => (
                <Tag color={getPurchaseOrderStatusColor(status)}>{titleCaseStatus(status)}</Tag>
            ),
        },
        {
            title: "Items",
            dataIndex: "items_summary",
            ellipsis: true,
            render: (_: any, record: any) => (
                <Tooltip title={record.items_summary}>
                    <Space direction="vertical" size={1}>
                        <Text>{record.items_summary || "-"}</Text>
                        <Text type="secondary" style={{ fontSize: 12 }}>
                            {Number(record.items_count || 0)} item(s)
                        </Text>
                    </Space>
                </Tooltip>
            ),
        },
        {
            title: "Courier / Tracking",
            width: 200,
            render: (_: any, record: any) => (
                <Space direction="vertical" size={1}>
                    <Text>{record.courier_name || "-"}</Text>
                    <Text type="secondary" style={{ fontSize: 12 }}>
                        {record.awb_number || "No tracking yet"}
                    </Text>
                </Space>
            ),
        },
        {
            title: "Expected",
            dataIndex: "expected_delivery_date",
            width: 130,
            render: (value: any) =>
                value ? dayjs(value).format("DD MMM YYYY") : <Text type="secondary">-</Text>,
        },
        {
            title: "Amount",
            dataIndex: "grand_total",
            width: 140,
            align: "right",
            render: (value: any) => <Text strong>{formatCurrency(value)}</Text>,
        },

        {
            title: "Action",
            width: 130,
            fixed: "right",
            render: (_: any, record: any) => (
                <Button
                    type="primary"
                    icon={<InboxOutlined />}
                    onClick={() => {
                        openReceiveModal(record);
                    }}
                >
                    Receive
                </Button>
            ),
        },
    ] as any;
    const selectedPoTotalQty = receiveItems.reduce((sum: number, item: any) => {
        return sum + Number(item.ordered_qty || item.quantity || 0);
    }, 0);

    const selectedPoAlreadyReceivedQty = receiveItems.reduce(
        (sum: number, item: any) => {
            return sum + Number(item.already_received_qty || 0);
        },
        0,
    );
    const selectedPoAlreadyDamagedQty = receiveItems.reduce(
        (sum: number, item: any) => {
            return sum + Number(item.already_damaged_qty ?? item.damaged_qty ?? 0);
        },
        0,
    );

    const selectedPoPendingQty = receiveItems.reduce((sum: number, item: any) => {
        return sum + Number(item.pending_qty || 0);
    }, 0);

    const selectedPoReceiveNowQty = receiveItems.reduce((sum: number, item: any) => {
        return sum + Number(item.receive_now_qty || 0);
    }, 0);

    const selectedPoDamageNowQty = receiveItems.reduce((sum: number, item: any) => {
        return sum + Number(item.damage_now_qty ?? item.damaged_qty ?? 0);
    }, 0);

    const selectedPoTotalAmount =
        receiveItems.reduce((sum: number, item: any) => {
            const qty = Number(item.ordered_qty || item.quantity || 0);
            const rate = Number(item.rate || item.price || 0);
            const amount = Number(item.amount || qty * rate || 0);

            return sum + amount;
        }, 0) || Number((selectedPurchaseOrder as any)?.grand_total || 0);

    return (
        <div
            style={{
                padding: 20,
                background: token.colorBgLayout,
                minHeight: "100%",
            }}
        >
            <Card
                bordered={false}
                style={{
                    borderRadius: 18,
                    boxShadow: token.boxShadowTertiary,
                    background: token.colorBgContainer,
                }}
                bodyStyle={{ padding: 18 }}
            >
                <div
                    style={{
                        display: "flex",
                        justifyContent: "space-between",
                        gap: 16,
                        alignItems: "flex-start",
                        marginBottom: 18,
                        flexWrap: "wrap",
                    }}
                >
                    <div>
                        <Space align="center">
                            <div
                                style={{
                                    width: 42,
                                    height: 42,
                                    borderRadius: 14,
                                    display: "grid",
                                    placeItems: "center",
                                    background: token.colorPrimaryBg,
                                    color: token.colorPrimary,
                                    fontSize: 22,
                                }}
                            >
                                <TruckOutlined />
                            </div>

                            <div>
                                <Title level={4} style={{ margin: 0 }}>
                                    Warehouse
                                </Title>
                                <Text type="secondary">
                                    Manage sales dispatches and purchase receiving
                                </Text>
                            </div>
                        </Space>
                    </div>

                    <Button icon={<ReloadOutlined />} onClick={handleRefresh}>
                        Refresh
                    </Button>
                </div>

                <Tabs
                    activeKey={activeTab}
                    onChange={(key) => setActiveTab(key as ActiveTab)}
                    items={[
                        {
                            key: "sales-orders",
                            label: (
                                <Space>
                                    <SendOutlined />
                                    Sales Orders
                                    <Badge count={salesOrdersTotal || 0} overflowCount={9999} />
                                </Space>
                            ),
                            children: null,
                        },
                        {
                            key: "purchase-orders",
                            label: (
                                <Space>
                                    <ShoppingCartOutlined />
                                    Purchase Orders
                                    <Badge count={purchaseOrdersTotal || 0} overflowCount={9999} />
                                </Space>
                            ),
                            children: null,
                        },
                    ]}
                />

                <div
                    style={{
                        display: "flex",
                        gap: 12,
                        flexWrap: "wrap",
                        justifyContent: "space-between",
                        marginBottom: 16,
                    }}
                >
                    <Space wrap>
                        <Input
                            allowClear
                            prefix={<SearchOutlined />}
                            placeholder={
                                activeTab === "sales-orders"
                                    ? "Search SO no, customer, item..."
                                    : "Search PO no, vendor, item..."
                            }
                            style={{ width: 280 }}
                            value={activeFilters.search}
                            onChange={(e) =>
                                setActiveFilters((prev) => ({
                                    ...prev,
                                    search: e.target.value,
                                }))
                            }
                            onPressEnter={handleSearch}
                        />

                        <Select
                            allowClear
                            style={{ width: 210 }}
                            value={activeFilters.status || undefined}
                            placeholder="Select Status"
                            options={
                                activeTab === "sales-orders"
                                    ? getSalesOrderStatusOptions()
                                    : getPurchaseOrderStatusOptions()
                            }
                            onChange={(value) =>
                                setActiveFilters((prev) => ({
                                    ...prev,
                                    status: value,
                                    page: 1,
                                }))
                            }
                        />

                        <RangePicker
                            value={
                                activeFilters.date_from && activeFilters.date_to
                                    ? [dayjs(activeFilters.date_from), dayjs(activeFilters.date_to)]
                                    : null
                            }
                            onChange={handleDateChange}
                        />

                        <Button type="primary" icon={<SearchOutlined />} onClick={handleSearch}>
                            Search
                        </Button>
                    </Space>
                </div>

                {activeTab === "sales-orders" ? (
                    <Table
                        rowKey="id"
                        loading={loading}
                        columns={salesOrderColumns}
                        dataSource={salesOrders}
                        scroll={{ x: 1250 }}
                        locale={{
                            emptyText: (
                                <Empty description="No sales orders found for warehouse" />
                            ),
                        }}
                        pagination={{
                            current: salesFilters.page,
                            pageSize: salesFilters.limit,
                            total: salesOrdersTotal,
                            showSizeChanger: true,
                            showTotal: (total) => `${total} sales order(s)`,
                            onChange: (page, limit) => {
                                setSalesFilters((prev) => ({
                                    ...prev,
                                    page,
                                    limit,
                                }));
                            },
                        }}
                    />
                ) : (
                    <Table
                        rowKey="id"
                        loading={loading}
                        columns={purchaseOrderColumns}
                        dataSource={purchaseOrders}
                        scroll={{ x: 1250 }}
                        locale={{
                            emptyText: (
                                <Empty description="No purchase orders found for warehouse" />
                            ),
                        }}
                        pagination={{
                            current: purchaseFilters.page,
                            pageSize: purchaseFilters.limit,
                            total: purchaseOrdersTotal,
                            showSizeChanger: true,
                            showTotal: (total) => `${total} purchase order(s)`,
                            onChange: (page, limit) => {
                                setPurchaseFilters((prev) => ({
                                    ...prev,
                                    page,
                                    limit,
                                }));
                            },
                        }}
                    />
                )}
            </Card>
            <Modal
                open={receiveModalOpen}
                title={null}
                footer={null}
                centered
                width={900}
                destroyOnClose
                onCancel={() => {
                    setReceiveModalOpen(false);
                    setSelectedPurchaseOrder(null);
                    receiveForm.resetFields();
                    setReceiveItems([]);
                }}

            >
                <div

                >
                    <Title level={5} style={{ margin: "4px 0 0" }}>
                        RECEIVE MATERIAL
                    </Title>

                    <Title level={4} style={{ margin: "4px 0 0" }}>
                        {selectedPurchaseOrder?.po_number || "-"} 📦
                    </Title>

                    <Text>
                        From:  {toTitleCase(selectedPurchaseOrder?.vendor_name || "-")}
                    </Text>
                </div>

                <Form
                    form={receiveForm}
                    layout="vertical"
                    style={{
                        // padding: 20,
                        // background: token.colorBgContainer,
                    }}
                >
                    <Row gutter={16}>
                        <Col span={8}>
                            <Form.Item name="courier_name" label="Courier" rules={[{ required: true, message: "Please enter Courier" }]}>
                                <Input placeholder="BlueDart, DTDC..." />
                            </Form.Item>
                        </Col>
                        <Col span={8}>
                            <Form.Item name="awb_number" label="AWB / Tracking" rules={[{ required: true, message: "Please enter AWB / Tracking" }]}>
                                <Input placeholder="AWB123" />
                            </Form.Item>
                        </Col>
                        <Col span={8}>
                            <Form.Item
                                name="status"
                                label="Status"
                                rules={[{ required: true, message: "Please select status" }]}
                            >
                                <Select
                                    options={getPurchaseOrderStatusOptions()}
                                />
                            </Form.Item>
                        </Col>
                        {/* <Col span={8}>
                            <Form.Item
                                name="received_qty"
                                label="Received Qty"
                                rules={[{ required: true, message: "Please enter received qty" }]}
                            >
                                <InputNumber min={0} style={{ width: "100%" }} />
                            </Form.Item>
                        </Col>
                        <Col span={8}>
                            <Form.Item name="damaged_qty" label="Damaged Qty">
                                <InputNumber min={0} style={{ width: "100%" }} />
                            </Form.Item>
                        </Col> */}
                        <Col span={24}>


                            <Form.Item name="remarks" label="Remarks">
                                <Input.TextArea rows={3} placeholder="Any receiving note..." />
                            </Form.Item>
                        </Col>
                    </Row>
                    <Card
                        size="small"
                        title="📦 Items"
                        style={{ marginTop: 10 }}
                    >
                        <Table
                            size="small"
                            rowKey={(record: any, index) =>
                                record.id || record.purchase_order_item_id || String(index)
                            }
                            columns={[
                                {
                                    title: "Item",
                                    dataIndex: "item_name",
                                    width: 220,
                                    render: (_: any, record: any) => (
                                        <Space direction="vertical" size={0}>
                                            <Text strong>
                                                {record.item_name || record.product_name || "Item"}
                                            </Text>

                                            {(record.sku || record.item_code || record.unit) && (
                                                <Text type="secondary" style={{ fontSize: 12 }}>
                                                    {[record.sku || record.item_code, record.unit]
                                                        .filter(Boolean)
                                                        .join(" • ")}
                                                </Text>
                                            )}
                                        </Space>
                                    ),
                                },
                                {
                                    title: "Ordered",
                                    width: 90,
                                    align: "right",
                                    render: (_: any, record: any) => (
                                        <Text>{Number(record.ordered_qty || record.quantity || 0)}</Text>
                                    ),
                                },
                                {
                                    title: "Already Received",
                                    width: 130,
                                    align: "right",
                                    render: (_: any, record: any) => (
                                        <Text>{Number(record.already_received_qty || 0)}</Text>
                                    ),
                                },
                                {
                                    title: "Already Damaged",
                                    width: 130,
                                    align: "right",
                                    render: (_: any, record: any) => (
                                        <Text type={Number(record.already_damaged_qty || 0) > 0 ? "danger" : undefined}>
                                            {Number(record.already_damaged_qty || 0)}
                                        </Text>
                                    ),
                                },
                                {
                                    title: "Pending",
                                    width: 90,
                                    align: "right",
                                    render: (_: any, record: any) => (
                                        <Text strong type={Number(record.pending_qty || 0) > 0 ? "danger" : "success"}>
                                            {Number(record.pending_qty || 0)}
                                        </Text>
                                    ),
                                },
                                {
                                    title: "Receive Now",
                                    width: 130,
                                    align: "right",
                                    render: (_: any, record: any) => {
                                        const itemId = record.purchase_order_item_id || record.id;
                                        const pendingQty = Number(record.pending_qty || 0);
                                        const damageQty = Number(record.damage_now_qty ?? record.damaged_qty ?? 0);

                                        return (
                                            <InputNumber
                                                min={0}
                                                max={Math.max(pendingQty - damageQty, 0)}
                                                value={Number(record.receive_now_qty || 0)}
                                                style={{ width: "100%" }}
                                                disabled={pendingQty <= 0}
                                                onChange={(value) =>
                                                    updateReceiveItem(
                                                        itemId,
                                                        "receive_now_qty",
                                                        Number(value || 0),
                                                    )
                                                }
                                            />
                                        );
                                    },
                                },
                                {
                                    title: "Damaged Now",
                                    width: 130,
                                    align: "right",
                                    render: (_: any, record: any) => {
                                        const itemId = record.purchase_order_item_id || record.id;
                                        const pendingQty = Number(record.pending_qty || 0);
                                        const receiveQty = Number(record.receive_now_qty || 0);


                                        return (
                                            <InputNumber
                                                min={0}
                                                max={Math.max(pendingQty - receiveQty, 0)}
                                                value={Number(record.damage_now_qty || 0)}
                                                style={{ width: "100%" }}
                                                disabled={pendingQty <= 0}
                                                onChange={(value) =>
                                                    updateReceiveItem(
                                                        itemId,
                                                        "damage_now_qty",
                                                        Number(value || 0),
                                                    )
                                                }
                                            />
                                        );
                                    },
                                },
                                {
                                    title: "Amount",
                                    width: 120,
                                    align: "right",
                                    render: (_: any, record: any) => {
                                        const qty = Number(record.ordered_qty || record.quantity || 0);
                                        const rate = Number(record.rate || record.price || 0);
                                        const amount = Number(record.amount || qty * rate || 0);

                                        return <Text strong>{formatCurrency(amount)}</Text>;
                                    },
                                },
                            ]}
                            dataSource={receiveItems}
                            pagination={false}
                            scroll={{ x: 950 }}
                            locale={{
                                emptyText: <Empty description="No items found" />,
                            }}
                            summary={() => (
                                <Table.Summary.Row>
                                    <Table.Summary.Cell index={0}>
                                        <Text strong>Total</Text>
                                    </Table.Summary.Cell>

                                    <Table.Summary.Cell index={1} align="right">
                                        <Text strong>{selectedPoTotalQty}</Text>
                                    </Table.Summary.Cell>

                                    <Table.Summary.Cell index={2} align="right">
                                        <Text strong>{selectedPoAlreadyReceivedQty}</Text>
                                    </Table.Summary.Cell>

                                    <Table.Summary.Cell index={3} align="right">
                                        <Text strong type={selectedPoAlreadyDamagedQty > 0 ? "danger" : undefined}>
                                            {selectedPoAlreadyDamagedQty}
                                        </Text>
                                    </Table.Summary.Cell>

                                    <Table.Summary.Cell index={4} align="right">
                                        <Text strong>{selectedPoPendingQty}</Text>
                                    </Table.Summary.Cell>

                                    <Table.Summary.Cell index={5} align="right">
                                        <Text strong>{selectedPoReceiveNowQty}</Text>
                                    </Table.Summary.Cell>

                                    <Table.Summary.Cell index={6} align="right">
                                        <Text strong>{selectedPoDamageNowQty}</Text>
                                    </Table.Summary.Cell>

                                    <Table.Summary.Cell index={7} align="right">
                                        <Text strong>{formatCurrency(selectedPoTotalAmount)}</Text>
                                    </Table.Summary.Cell>
                                </Table.Summary.Row>
                            )}
                        />
                    </Card>

                    <Divider />

                    <Flex justify="end" gap={12}>
                        <Button
                            size="large"
                            onClick={() => {
                                setReceiveModalOpen(false);
                                setSelectedPurchaseOrder(null);
                                receiveForm.resetFields();
                                setReceiveItems([]);
                            }}
                        >
                            Cancel
                        </Button>

                        <Button
                            size="large"
                            type="primary"
                            loading={receiveSubmitting}
                            onClick={handleReceiveSubmit}
                        >
                            ✅ Save Receipt
                        </Button>
                    </Flex>
                </Form>
            </Modal>
        </div >
    );
}