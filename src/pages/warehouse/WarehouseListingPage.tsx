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
    createSoDispatch,
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
type WarehouseStatusStat = {
    key: string;
    label: string;
    count: number;
    color?: string;
};





function formatCurrency(value?: number | string | null) {
    if (!value) return "₹ 0.00";

    return `₹ ${value}`;


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
        salesOrderStatusStats,
        purchaseOrderStatusStats,
    } = useSelector((state: RootState) => state.warehouse);

    const [activeTab, setActiveTab] = useState<ActiveTab>("sales-orders");

    const [receiveForm] = Form.useForm();

    const [receiveModalOpen, setReceiveModalOpen] = useState(false);
    const [selectedPurchaseOrder, setSelectedPurchaseOrder] =
        useState<WarehousePurchaseOrderItem | null>(null);
    const [receiveSubmitting, setReceiveSubmitting] = useState(false);

    const [receiveItems, setReceiveItems] = useState<any[]>([]);

    const [dispatchForm] = Form.useForm();

    const [dispatchModalOpen, setDispatchModalOpen] = useState(false);
    const [selectedSalesOrder, setSelectedSalesOrder] =
        useState<WarehouseSalesOrderItem | null>(null);
    const [dispatchSubmitting, setDispatchSubmitting] = useState(false);
    const [dispatchItems, setDispatchItems] = useState<any[]>([]);

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

    const getOptionText = (label: any) => {
        if (typeof label === "string") return label;
        if (typeof label === "number") return String(label);
        return "";
    };

    const buildStatusStats = (
        rows: any[],
        total: number,
        options: any[],
        getColor: (status: string) => string,
    ): WarehouseStatusStat[] => {
        const statusMap = rows.reduce<Record<string, number>>((acc, item) => {
            const status = String(item?.status || "unknown").toLowerCase();
            acc[status] = (acc[status] || 0) + 1;
            return acc;
        }, {});

        const optionStats = options
            .map((option) => {
                const statusKey = String(option?.value || "").toLowerCase();

                return {
                    key: statusKey,
                    label: getOptionText(option?.label) || titleCaseStatus(statusKey),
                    count: statusMap[statusKey] || 0,
                    color: getColor(statusKey),
                };
            })
            .filter((item) => item.key);

        const unknownStats = Object.entries(statusMap)
            .filter(([status]) => !optionStats.some((item) => item.key === status))
            .map(([status, count]) => ({
                key: status,
                label: titleCaseStatus(status),
                count,
                color: "default",
            }));

        return [
            // {
            //     key: "all",
            //     label: "Total",
            //     count: total || rows.length || 0,
            //     color: "blue",
            // },
            ...optionStats,
            ...unknownStats,
        ];
    };

    const openDispatchModal = (record: WarehouseSalesOrderItem) => {
        setSelectedSalesOrder(record);

        const items = Array.isArray((record as any)?.items)
            ? (record as any).items
            : [];

        const mappedItems = items.map((item: any) => {
            const orderedQty = Number(item.ordered_qty || item.quantity || 0);

            const alreadyDispatchedQty = Number(
                item.already_dispatched_qty ||
                item.dispatched_qty ||
                item.total_dispatched_qty ||
                0,
            );

            const pendingQty = Math.max(
                Number(item.pending_qty ?? orderedQty - alreadyDispatchedQty),
                0,
            );

            return {
                ...item,
                ordered_qty: orderedQty,
                already_dispatched_qty: alreadyDispatchedQty,
                pending_qty: pendingQty,

                // editable current dispatch value
                dispatch_now_qty: pendingQty,
                remarks: item.remarks || null,
            };
        });

        setDispatchItems(mappedItems);

        dispatchForm.setFieldsValue({
            courier_name: (record as any).courier_name || "",
            awb_number: (record as any).awb_number || "",
            tracking_url: (record as any).tracking_url || "",
            delivery_expected_at: (record as any).delivery_expected_at
                ? dayjs((record as any).delivery_expected_at)
                : (record as any).expected_delivery_date
                    ? dayjs((record as any).expected_delivery_date)
                    : null,
            status: "dispatched",
            remarks: "",
        });

        setDispatchModalOpen(true);
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

    const updateDispatchItem = (
        itemId: string,
        key: "dispatch_now_qty" | "remarks",
        value: any,
    ) => {
        setDispatchItems((prev) =>
            prev.map((item) => {
                const currentId = item.sales_order_item_id || item.id;

                if (currentId !== itemId) return item;

                const pendingQty = Number(item.pending_qty || 0);

                if (key === "dispatch_now_qty") {
                    return {
                        ...item,
                        dispatch_now_qty: Math.min(Number(value || 0), pendingQty),
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

    const handleDispatchSubmit = async () => {
        try {
            const values = await dispatchForm.validateFields();

            if (!selectedSalesOrder) return;

            const validItems = dispatchItems
                .map((item: any) => ({
                    sales_order_item_id: item.sales_order_item_id || item.id,
                    dispatched_qty: Number(item.dispatch_now_qty || 0),
                    remarks: item.remarks || null,
                }))
                .filter((item: any) => item.dispatched_qty > 0);

            if (!validItems.length) {
                message.error("Please enter dispatch quantity for at least one item");
                return;
            }

            setDispatchSubmitting(true);

            const payload = {
                sales_order_id: selectedSalesOrder.id,
                courier_name: values.courier_name,
                awb_number: values.awb_number,
                tracking_url: values.tracking_url || null,
                delivery_expected_at: values.delivery_expected_at
                    ? values.delivery_expected_at.toISOString()
                    : null,
                dispatched_at: new Date().toISOString(),
                status: values.status,
                remarks: values.remarks || null,
                items: validItems,
            };

            const res = await dispatch(createSoDispatch(payload)).unwrap();

            if (res.success || res?.statusCode === 201 || res?.statusCode === 200) {
                message.success(res.message || "Dispatch saved successfully");
            } else {
                message.error(res.message || "Failed to save dispatch");
            }

            setDispatchModalOpen(false);
            setSelectedSalesOrder(null);
            setDispatchItems([]);
            dispatchForm.resetFields();

            loadSalesOrders();
        } catch (error: any) {
            if (error?.errorFields) return;

            message.error(error?.message || "Failed to save dispatch");
        } finally {
            setDispatchSubmitting(false);
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
                width: 150,
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
                width: 120,
                render: (status) => (
                    <Tag color={getSalesOrderStatusColor(status)}>{titleCaseStatus(status)}</Tag>
                ),
            },
            {
                title: "Items",
                dataIndex: "items_summary",
                width: 200,
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
                title: "Tracking",
                width: 100,
                render: (_: any, record: any) => (
                    <Space direction="vertical" size={1}>
                        <Text>{record.courier_name || "-"}</Text>
                        <Text type="secondary" style={{ fontSize: 12 }}>
                            {record.awb_number || "No tracking yet"}
                        </Text>
                    </Space>
                ),
            },
            // {
            //     title: "Expected",
            //     dataIndex: "expected_delivery_date",
            //     width: 130,
            //     render: (value) =>
            //         value ? dayjs(value).format("DD MMM YYYY") : <Text type="secondary">-</Text>,
            // },
            {
                title: "Amount",
                dataIndex: "grand_total",
                width: 100,
                align: "right",
                render: (value) => <Text strong>{formatCurrency(value)}</Text>,
            },

            {
                title: "Action",
                width: 200,
                fixed: "right",
                render: (_: any, record: any) => {
                    const status = String(record?.status || "").toLowerCase();

                    const isDraft = status === "draft";
                    const isDelivered = status === "delivered";
                    const isCancelled = status === "cancelled";

                    const canFirstDispatch = ["confirmed", "ready_to_dispatch", "packed"].includes(status);
                    const canContinueDispatch = status === "partially_dispatched";
                    const canUpdateTracking = ["dispatched", "in_transit"].includes(status);

                    if (isDraft) {
                        return <Tag color="warning">Awaiting Confirmation</Tag>;
                    }

                    if (isDelivered) {
                        return <Tag color="success">Delivered</Tag>;
                    }

                    if (isCancelled) {
                        return <Tag color="red">Cancelled</Tag>;
                    }

                    if (canFirstDispatch || canContinueDispatch || canUpdateTracking) {
                        return (
                            <Button
                                type="primary"
                                icon={<TruckOutlined />}
                                onClick={() => openDispatchModal(record)}
                            >
                                {canContinueDispatch
                                    ? "Dispatch Remaining"
                                    : canUpdateTracking
                                        ? "Update"
                                        : "Dispatch"}
                            </Button>
                        );
                    }

                    return <span style={{ color: "#999" }}>—</span>;
                },
            }
        ],
        [token.colorPrimary]
    );

    const purchaseOrderColumns = [
        {
            title: "Purchase Order",
            dataIndex: "po_number",
            width: 150,
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
            width: 180,
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
            width: 100,
            render: (status: any) => (
                <Tag color={getPurchaseOrderStatusColor(status)}>{titleCaseStatus(status)}</Tag>
            ),
        },
        {
            title: "Items",
            dataIndex: "items_summary",
            ellipsis: true,
            width: 200,
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
            title: "Tracking",
            width: 120,
            render: (_: any, record: any) => (
                <Space direction="vertical" size={1}>
                    <Text>{record.courier_name || "-"}</Text>
                    <Text type="secondary" style={{ fontSize: 12 }}>
                        {record.awb_number || "No tracking yet"}
                    </Text>
                </Space>
            ),
        },
        // {
        //     title: "Expected",
        //     dataIndex: "expected_delivery_date",
        //     width: 100,
        //     render: (value: any) =>
        //         value ? dayjs(value).format("DD MMM YYYY") : <Text type="secondary">-</Text>,
        // },
        {
            title: "Amount",
            dataIndex: "grand_total",
            width: 100,
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
                    disabled={record.status === "received"}
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

    const selectedSoTotalQty = dispatchItems.reduce((sum: number, item: any) => {
        return sum + Number(item.ordered_qty || item.quantity || 0);
    }, 0);

    const selectedSoAlreadyDispatchedQty = dispatchItems.reduce(
        (sum: number, item: any) => {
            return sum + Number(item.already_dispatched_qty || 0);
        },
        0,
    );

    const selectedSoPendingQty = dispatchItems.reduce((sum: number, item: any) => {
        return sum + Number(item.pending_qty || 0);
    }, 0);

    const selectedSoDispatchNowQty = dispatchItems.reduce(
        (sum: number, item: any) => {
            return sum + Number(item.dispatch_now_qty || 0);
        },
        0,
    );

    const salesOrderStatsFromDb = useMemo(() => {
        const countMap = new Map(
            (salesOrderStatusStats || []).map((item: any) => [
                item.status,
                Number(item.count || 0),
            ]),
        );

        return [
            {
                key: "all",
                label: "Total",
                count: salesOrdersTotal || 0,
                color: "blue",
            },
            ...getSalesOrderStatusOptions()
                .filter(
                    (item: any) =>
                        !["partially_dispatched",].includes(item.value),
                )
                .map((item: any) => ({
                    key: item.value,
                    label: item.label,
                    count: countMap.get(item.value) || 0,
                    color: getSalesOrderStatusColor(item.value),
                })),
        ];
    }, [salesOrderStatusStats, salesOrdersTotal]);

    const purchaseOrderStatsFromDb = useMemo(() => {
        const countMap = new Map(
            (purchaseOrderStatusStats || []).map((item: any) => [
                item.status,
                Number(item.count || 0),
            ]),
        );

        return [
            {
                key: "all",
                label: "Total",
                count: purchaseOrdersTotal || 0,
                color: "blue",
            },
            ...getPurchaseOrderStatusOptions().map((item: any) => ({
                key: item.value,
                label: item.label,
                count: countMap.get(item.value) || 0,
                color: getPurchaseOrderStatusColor(item.value),
            })),
        ];
    }, [purchaseOrderStatusStats, purchaseOrdersTotal]);
    const activeStatusStats =
        activeTab === "sales-orders" ? salesOrderStatsFromDb : purchaseOrderStatsFromDb;

    const getStatCardColors = (key: string) => {
        const colorMap: Record<
            string,
            {
                bg: string;
                border: string;
                number: string;
                chipBg: string;
                chipColor: string;
            }
        > = {
            all: {
                bg: "linear-gradient(135deg, rgba(22,119,255,0.12), rgba(22,119,255,0.04))",
                border: "rgba(22,119,255,0.22)",
                number: "#1677ff",
                chipBg: "rgba(22,119,255,0.14)",
                chipColor: "#1677ff",
            },
            draft: {
                bg: "linear-gradient(135deg, rgba(250,173,20,0.14), rgba(250,173,20,0.05))",
                border: "rgba(250,173,20,0.24)",
                number: "#d48806",
                chipBg: "rgba(250,173,20,0.16)",
                chipColor: "#d48806",
            },
            confirmed: {
                bg: "linear-gradient(135deg, rgba(82,196,26,0.18), rgba(82,196,26,0.06))",
                border: "rgba(82,196,26,0.28)",
                number: "#389e0d",
                chipBg: "rgba(82,196,26,0.16)",
                chipColor: "#389e0d",
            },
            ready_to_dispatch: {
                bg: "linear-gradient(135deg, rgba(19,194,194,0.14), rgba(19,194,194,0.05))",
                border: "rgba(19,194,194,0.24)",
                number: "#08979c",
                chipBg: "rgba(19,194,194,0.16)",
                chipColor: "#08979c",
            },
            packed: {
                bg: "linear-gradient(135deg, rgba(114,46,209,0.14), rgba(114,46,209,0.05))",
                border: "rgba(114,46,209,0.24)",
                number: "#531dab",
                chipBg: "rgba(114,46,209,0.16)",
                chipColor: "#531dab",
            },
            dispatched: {
                bg: "linear-gradient(135deg, rgba(24,144,255,0.14), rgba(24,144,255,0.05))",
                border: "rgba(24,144,255,0.24)",
                number: "#0958d9",
                chipBg: "rgba(24,144,255,0.16)",
                chipColor: "#0958d9",
            },
            in_transit: {
                bg: "linear-gradient(135deg, rgba(45,183,245,0.14), rgba(45,183,245,0.05))",
                border: "rgba(45,183,245,0.24)",
                number: "#1677ff",
                chipBg: "rgba(45,183,245,0.16)",
                chipColor: "#1677ff",
            },
            delivered: {
                bg: "linear-gradient(135deg, rgba(82,196,26,0.14), rgba(82,196,26,0.05))",
                border: "rgba(82,196,26,0.24)",
                number: "#237804",
                chipBg: "rgba(82,196,26,0.16)",
                chipColor: "#237804",
            },
            pending_receive: {
                bg: "linear-gradient(135deg, rgba(250,140,22,0.14), rgba(250,140,22,0.05))",
                border: "rgba(250,140,22,0.24)",
                number: "#d46b08",
                chipBg: "rgba(250,140,22,0.16)",
                chipColor: "#d46b08",
            },
            partially_received: {
                bg: "linear-gradient(135deg, rgba(114,46,209,0.14), rgba(114,46,209,0.05))",
                border: "rgba(114,46,209,0.24)",
                number: "#531dab",
                chipBg: "rgba(114,46,209,0.16)",
                chipColor: "#531dab",
            },
            received: {
                bg: "linear-gradient(135deg, rgba(82,196,26,0.14), rgba(82,196,26,0.05))",
                border: "rgba(82,196,26,0.24)",
                number: "#237804",
                chipBg: "rgba(82,196,26,0.16)",
                chipColor: "#237804",
            },
            cancelled: {
                bg: "linear-gradient(135deg, rgba(255,77,79,0.14), rgba(255,77,79,0.05))",
                border: "rgba(255,77,79,0.24)",
                number: "#cf1322",
                chipBg: "rgba(255,77,79,0.16)",
                chipColor: "#cf1322",
            },
        };

        return (
            colorMap[key] || {
                bg: token.colorBgContainer,
                border: token.colorBorderSecondary,
                number: token.colorTextHeading,
                chipBg: token.colorFillSecondary,
                chipColor: token.colorText,
            }
        );
    };

    const selectedSoTotalAmount =
        dispatchItems.reduce((sum: number, item: any) => {
            const qty = Number(item.ordered_qty || item.quantity || 0);
            const rate = Number(item.rate || item.price || 0);
            const amount = Number(item.amount || qty * rate || 0);

            return sum + amount;
        }, 0) || Number((selectedSalesOrder as any)?.grand_total || 0);

    return (
        <>
            <style>
                {`
                    @keyframes warehouseHeartbeat {
                        0% { transform: scale(1); }
                        14% { transform: scale(1.08); }
                        28% { transform: scale(1); }
                        42% { transform: scale(1.1); }
                        70% { transform: scale(1); }
                        100% { transform: scale(1); }
                    }
                `}
            </style>
            <div
                style={{
                    padding: 20,
                    background: token.colorBgLayout,
                    minHeight: "100%",
                }}
            >
                {/* <Card
                bordered={false}
                style={{
                    borderRadius: 18,
                    boxShadow: token.boxShadowTertiary,
                    background: token.colorBgContainer,
                }}
                bodyStyle={{ padding: 18 }}
            > */}
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

                <Row gutter={[12, 12]} style={{ marginBottom: 16 }}>
                    {activeStatusStats.map((item) => {
                        const cardColors = getStatCardColors(item.key);
                        const isConfirmed = item.key === "confirmed";

                        return (
                            <Col xs={12} sm={8} md={6} lg={4} xl={4} key={item.key}>
                                <Card
                                    size="small"
                                    bordered
                                    style={{
                                        background: cardColors.bg,
                                        borderColor: cardColors.border,
                                        borderRadius: token.borderRadiusLG,
                                        overflow: "hidden",
                                        position: "relative",
                                        boxShadow: isConfirmed
                                            ? "0 8px 20px rgba(82,196,26,0.18)"
                                            : token.boxShadowSecondary,
                                        animation: isConfirmed
                                            ? "warehouseHeartbeat 1.6s ease-in-out infinite"
                                            : undefined,
                                        transformOrigin: "center",
                                    }}
                                    styles={{
                                        body: {
                                            padding: "12px 14px",
                                        },
                                    }}
                                >
                                    <div
                                        style={{
                                            position: "absolute",
                                            top: 0,
                                            left: 0,
                                            right: 0,
                                            height: 4,
                                            background:
                                                item.key === "all"
                                                    ? "#1677ff"
                                                    : cardColors.number,
                                        }}
                                    />

                                    <Space direction="vertical" size={4} style={{ width: "100%" }}>
                                        <Flex justify="space-between" align="center" gap={8}>
                                            <Text
                                                style={{
                                                    fontSize: 12,
                                                    fontWeight: 500,
                                                    color: token.colorTextSecondary,
                                                }}
                                            >
                                                {item.label}
                                            </Text>

                                            <div
                                                style={{
                                                    minWidth: 34,
                                                    height: 26,
                                                    padding: "0 10px",
                                                    borderRadius: 999,
                                                    display: "inline-flex",
                                                    alignItems: "center",
                                                    justifyContent: "center",
                                                    background: cardColors.chipBg,
                                                    color: cardColors.chipColor,
                                                    fontWeight: 700,
                                                    fontSize: 12,
                                                }}
                                            >
                                                {item.count}
                                            </div>
                                        </Flex>

                                        <Title
                                            level={4}
                                            style={{
                                                margin: 0,
                                                color: cardColors.number,
                                                fontWeight: 700,
                                            }}
                                        >
                                            {item.count}
                                        </Title>
                                    </Space>
                                </Card>
                            </Col>
                        );
                    })}
                </Row>

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
                        scroll={{ x: 1000 }}
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
                        scroll={{ x: 1000 }}
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
                {/* </Card> */}
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

                <Modal
                    open={dispatchModalOpen}
                    title={null}
                    footer={null}
                    centered
                    width={950}
                    destroyOnClose
                    onCancel={() => {
                        setDispatchModalOpen(false);
                        setSelectedSalesOrder(null);
                        dispatchForm.resetFields();
                        setDispatchItems([]);
                    }}
                >
                    <div>
                        <Title level={5} style={{ margin: "4px 0 0" }}>
                            DISPATCH MATERIAL
                        </Title>

                        <Title level={4} style={{ margin: "4px 0 0" }}>
                            {selectedSalesOrder?.so_number || "-"} 🚚
                        </Title>

                        <Text>
                            Customer: {toTitleCase((selectedSalesOrder as any)?.customer_name || "-")}
                        </Text>
                    </div>

                    <Form form={dispatchForm} layout="vertical">
                        <Row gutter={16}>
                            <Col span={8}>
                                <Form.Item
                                    name="courier_name"
                                    label="Courier"
                                    rules={[{ required: true, message: "Please enter courier" }]}
                                >
                                    <Input placeholder="BlueDart, DTDC..." />
                                </Form.Item>
                            </Col>

                            <Col span={8}>
                                <Form.Item
                                    name="awb_number"
                                    label="AWB / Tracking"
                                    rules={[{ required: true, message: "Please enter AWB / Tracking" }]}
                                >
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
                                        options={getSalesOrderStatusOptions().filter((item: any) =>
                                            [
                                                "ready_to_dispatch",
                                                "partially_dispatched",
                                                "dispatched",
                                                "delivered",
                                            ].includes(item.value),
                                        )}
                                    />
                                </Form.Item>
                            </Col>

                            <Col span={12}>
                                <Form.Item name="tracking_url" label="Tracking URL">
                                    <Input placeholder="https://tracking-url.com/awb" />
                                </Form.Item>
                            </Col>

                            <Col span={12}>
                                <Form.Item name="delivery_expected_at" label="Expected Delivery Date">
                                    <DatePicker disabledDate={(current) => current && current.isBefore(dayjs())} style={{ width: "100%" }} />
                                </Form.Item>
                            </Col>

                            <Col span={24}>
                                <Form.Item name="remarks" label="Remarks">
                                    <Input.TextArea rows={3} placeholder="Any dispatch note..." />
                                </Form.Item>
                            </Col>
                        </Row>

                        <Card size="small" title="🚚 Dispatch Items" style={{ marginTop: 10 }}>
                            <Table
                                size="small"
                                rowKey={(record: any, index) =>
                                    record.id || record.sales_order_item_id || String(index)
                                }
                                columns={[
                                    {
                                        title: "Item",
                                        dataIndex: "item_name",
                                        width: 240,
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
                                        title: "Already Dispatched",
                                        width: 150,
                                        align: "right",
                                        render: (_: any, record: any) => (
                                            <Text>{Number(record.already_dispatched_qty || 0)}</Text>
                                        ),
                                    },
                                    {
                                        title: "Pending",
                                        width: 100,
                                        align: "right",
                                        render: (_: any, record: any) => (
                                            <Text
                                                strong
                                                type={Number(record.pending_qty || 0) > 0 ? "danger" : "success"}
                                            >
                                                {Number(record.pending_qty || 0)}
                                            </Text>
                                        ),
                                    },
                                    {
                                        title: "Dispatch Now",
                                        width: 140,
                                        align: "right",
                                        render: (_: any, record: any) => {
                                            const itemId = record.sales_order_item_id || record.id;
                                            const pendingQty = Number(record.pending_qty || 0);

                                            return (
                                                <InputNumber
                                                    min={0}
                                                    max={pendingQty}
                                                    value={Number(record.dispatch_now_qty || 0)}
                                                    style={{ width: "100%" }}
                                                    disabled={pendingQty <= 0}
                                                    onChange={(value) =>
                                                        updateDispatchItem(
                                                            itemId,
                                                            "dispatch_now_qty",
                                                            Number(value || 0),
                                                        )
                                                    }
                                                />
                                            );
                                        },
                                    },
                                    {
                                        title: "Amount",
                                        width: 130,
                                        align: "right",
                                        render: (_: any, record: any) => {
                                            const qty = Number(record.ordered_qty || record.quantity || 0);
                                            const rate = Number(record.rate || record.price || 0);
                                            const amount = Number(record.amount || qty * rate || 0);

                                            return <Text strong>{formatCurrency(amount)}</Text>;
                                        },
                                    },
                                ]}
                                dataSource={dispatchItems}
                                pagination={false}
                                scroll={{ x: 900 }}
                                locale={{
                                    emptyText: <Empty description="No items found" />,
                                }}
                                summary={() => (
                                    <Table.Summary.Row>
                                        <Table.Summary.Cell index={0}>
                                            <Text strong>Total</Text>
                                        </Table.Summary.Cell>

                                        <Table.Summary.Cell index={1} align="right">
                                            <Text strong>{selectedSoTotalQty}</Text>
                                        </Table.Summary.Cell>

                                        <Table.Summary.Cell index={2} align="right">
                                            <Text strong>{selectedSoAlreadyDispatchedQty}</Text>
                                        </Table.Summary.Cell>

                                        <Table.Summary.Cell index={3} align="right">
                                            <Text strong>{selectedSoPendingQty}</Text>
                                        </Table.Summary.Cell>

                                        <Table.Summary.Cell index={4} align="right">
                                            <Text strong>{selectedSoDispatchNowQty}</Text>
                                        </Table.Summary.Cell>

                                        <Table.Summary.Cell index={5} align="right">
                                            <Text strong>{formatCurrency(selectedSoTotalAmount)}</Text>
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
                                    setDispatchModalOpen(false);
                                    setSelectedSalesOrder(null);
                                    dispatchForm.resetFields();
                                    setDispatchItems([]);
                                }}
                            >
                                Cancel
                            </Button>

                            <Button
                                size="large"
                                type="primary"
                                loading={dispatchSubmitting}
                                onClick={handleDispatchSubmit}
                            >
                                🚚 Save Dispatch
                            </Button>
                        </Flex>
                    </Form>
                </Modal>
            </div >
        </>
    );
}