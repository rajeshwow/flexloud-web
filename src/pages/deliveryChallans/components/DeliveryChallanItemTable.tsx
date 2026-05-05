/* eslint-disable react-refresh/only-export-components */
import {
    DeleteOutlined,
    PlusOutlined,
    ShoppingCartOutlined,
    TagOutlined,
} from "@ant-design/icons";
import {
    Button,
    Card,
    Col,
    Divider,
    InputNumber,
    Row,
    Select,
    Space,
    Table,
    Typography
} from "antd";

const { Text } = Typography;

export type DeliveryChallanLineItem = {
    key: string;
    id?: string;
    product_id?: string;
    item_name?: string;
    sku?: string;
    quantity?: number;
    rate?: number;
    discount?: number;
    tax?: number;
    cgst?: number;
    sgst?: number;
    amount?: number;
};

export type DeliveryChallanTotals = {
    subtotal: number;
    discountPercent: number;
    discountAmount: number;
    adjustment: number;
    cgst: number;
    sgst: number;
    tax: number;
    total: number;
};

type Props = {
    products: any[];
    lineItems: DeliveryChallanLineItem[];
    setLineItems: React.Dispatch<React.SetStateAction<DeliveryChallanLineItem[]>>;
    discountPercent: number;
    setDiscountPercent: React.Dispatch<React.SetStateAction<number>>;
    adjustment: number;
    setAdjustment: React.Dispatch<React.SetStateAction<number>>;
    totals: DeliveryChallanTotals;
};

const GST_OPTIONS = [0, 5, 12, 18, 28];

export const createDefaultDeliveryChallanLineItem = (): DeliveryChallanLineItem => ({
    key: crypto.randomUUID(),
    quantity: 1,
    rate: 0,
    discount: 0,
    tax: 0,
    cgst: 0,
    sgst: 0,
    amount: 0,
});

export const calculateDeliveryChallanLineItem = (item: DeliveryChallanLineItem) => {
    const quantity = Number(item.quantity || 0);
    const rate = Number(item.rate || 0);
    const discount = Number(item.discount || 0);
    const tax = Number(item.tax || 0);

    const baseAmount = quantity * rate;
    const taxableAmount = Math.max(baseAmount - discount, 0);
    const gstAmount = (taxableAmount * tax) / 100;

    return {
        cgst: gstAmount / 2,
        sgst: gstAmount / 2,
        amount: taxableAmount + gstAmount,
    };
};

export const calculateDeliveryChallanTotals = (
    items: DeliveryChallanLineItem[],
    discountPercent = 0,
    adjustment = 0,
): DeliveryChallanTotals => {
    const subtotal = items.reduce((sum, item) => {
        const quantity = Number(item.quantity || 0);
        const rate = Number(item.rate || 0);
        const discount = Number(item.discount || 0);
        return sum + Math.max(quantity * rate - discount, 0);
    }, 0);

    const cgst = items.reduce((sum, item) => sum + Number(item.cgst || 0), 0);
    const sgst = items.reduce((sum, item) => sum + Number(item.sgst || 0), 0);
    const tax = cgst + sgst;
    const discountAmount = (subtotal * Number(discountPercent || 0)) / 100;
    const total = subtotal + tax - discountAmount + Number(adjustment || 0);

    return {
        subtotal,
        discountPercent,
        discountAmount,
        adjustment,
        cgst,
        sgst,
        tax,
        total,
    };
};

export default function DeliveryChallanItemTable({
    products,
    lineItems,
    setLineItems,
    discountPercent,
    setDiscountPercent,
    adjustment,
    setAdjustment,
    totals,
}: Props) {
    const addLineItem = () => {
        setLineItems((prev) => [...prev, createDefaultDeliveryChallanLineItem()]);
    };

    const removeLineItem = (key: string) => {
        setLineItems((prev) => prev.filter((item) => item.key !== key));
    };

    const updateLineItem = (
        key: string,
        field: keyof DeliveryChallanLineItem,
        value: string | number | undefined,
    ) => {
        setLineItems((prev) =>
            prev.map((item) => {
                if (item.key !== key) return item;

                const updated: DeliveryChallanLineItem = {
                    ...item,
                    [field]: value,
                };

                const calc = calculateDeliveryChallanLineItem(updated);

                return {
                    ...updated,
                    cgst: calc.cgst,
                    sgst: calc.sgst,
                    amount: calc.amount,
                };
            }),
        );
    };

    const handleProductChange = (key: string, productId?: string) => {
        const product = products.find((p: any) => p.id === productId);

        setLineItems((prev) =>
            prev.map((item) => {
                if (item.key !== key) return item;

                if (!productId) {
                    return {
                        ...item,
                        product_id: undefined,
                        item_name: "",
                        sku: "",
                        rate: 0,
                        tax: 0,
                        cgst: 0,
                        sgst: 0,
                        amount: 0,
                    };
                }

                const updated: DeliveryChallanLineItem = {
                    ...item,
                    product_id: productId,
                    item_name: product?.name || product?.product_name || "",
                    sku: product?.sku || product?.part_number || product?.part_no || "",
                    rate: Number(
                        product?.sale_price ||
                        product?.selling_price ||
                        product?.price ||
                        product?.unit_price ||
                        0,
                    ),
                    tax: Number(product?.tax || product?.gst || product?.gst_rate || 0),
                    quantity: item.quantity || 1,
                    discount: item.discount || 0,
                };

                const calc = calculateDeliveryChallanLineItem(updated);

                return {
                    ...updated,
                    ...calc,
                };
            }),
        );
    };

    const columns = [
        {
            title: "Item Details",
            dataIndex: "product_id",
            width: 420,
            render: (_: any, record: DeliveryChallanLineItem) => (
                <Space direction="vertical" style={{ width: "100%" }} size={6}>
                    <Select
                        showSearch
                        allowClear
                        placeholder="Type or click to select an item."
                        value={record.product_id}
                        optionFilterProp="label"
                        style={{ width: "100%" }}
                        options={products.map((product: any) => ({
                            label: product.name || product.product_name,
                            value: product.id,
                        }))}
                        onChange={(value) => handleProductChange(record.key, value)}
                    />

                    {record.product_id ? (
                        <Text type="secondary" style={{ fontSize: 12 }}>
                            {record.sku ? `SKU: ${record.sku}` : record.item_name}
                        </Text>
                    ) : null}
                </Space>
            ),
        },
        {
            title: "Quantity",
            dataIndex: "quantity",
            width: 140,
            align: "right" as const,
            render: (_: any, record: DeliveryChallanLineItem) => (
                <InputNumber
                    min={0}
                    value={record.quantity}
                    precision={2}
                    onChange={(value) =>
                        updateLineItem(
                            record.key,
                            "quantity",
                            typeof value === "number" ? value : 0,
                        )
                    }
                    style={{ width: "100%" }}
                />
            ),
        },
        {
            title: "Rate",
            dataIndex: "rate",
            width: 160,
            align: "right" as const,
            render: (_: any, record: DeliveryChallanLineItem) => (
                <InputNumber
                    min={0}
                    value={record.rate}
                    precision={2}
                    onChange={(value) =>
                        updateLineItem(
                            record.key,
                            "rate",
                            typeof value === "number" ? value : 0,
                        )
                    }
                    style={{ width: "100%" }}
                />
            ),
        },
        {
            title: "GST %",
            dataIndex: "tax",
            width: 130,
            align: "right" as const,
            render: (_: any, record: DeliveryChallanLineItem) => (
                <Select
                    value={record.tax}
                    style={{ width: "100%" }}
                    onChange={(value) => updateLineItem(record.key, "tax", value)}
                    options={GST_OPTIONS.map((gst) => ({
                        label: `${gst}%`,
                        value: gst,
                    }))}
                />
            ),
        },
        {
            title: "Amount",
            dataIndex: "amount",
            width: 160,
            align: "right" as const,
            render: (_: any, record: DeliveryChallanLineItem) => (
                <Text strong>₹{Number(record.amount || 0).toFixed(2)}</Text>
            ),
        },
        {
            title: "",
            key: "action",
            width: 64,
            fixed: "right" as const,
            render: (_: any, record: DeliveryChallanLineItem) => (
                <Button
                    danger
                    type="text"
                    icon={<DeleteOutlined />}
                    onClick={() => removeLineItem(record.key)}
                    disabled={lineItems.length === 1}
                />
            ),
        },
    ];

    return (
        <Card
            style={{ borderRadius: 14, marginBottom: 16 }}
            title={
                <Space>
                    <ShoppingCartOutlined />
                    <span>Item Table</span>
                </Space>
            }
        >
            <Table<DeliveryChallanLineItem>
                rowKey="key"
                columns={columns}
                dataSource={lineItems}
                pagination={false}
                scroll={{ x: 980 }}
            />

            <div style={{ padding: "12px 0" }}>
                <Space>
                    <Button icon={<PlusOutlined />} onClick={addLineItem}>
                        Add New Row
                    </Button>

                    <Button icon={<PlusOutlined />} onClick={addLineItem}>
                        Add Items in Bulk
                    </Button>
                </Space>
            </div>

            <Divider style={{ margin: "8px 0 16px" }} />

            <Row gutter={24}>
                <Col xs={24} md={12}>
                    <Space size={6}>
                        <TagOutlined />
                        <Text>Reporting Tags</Text>
                    </Space>

                    {/* <div style={{ marginTop: 120 }}>
                        <Text>Customer Notes</Text>
                        <Input.TextArea
                            rows={3}
                            placeholder="Enter any notes to be displayed in your transaction"
                            style={{ marginTop: 8, maxWidth: 520 }}
                        />
                    </div> */}
                </Col>

                <Col xs={24} md={12}>
                    <Card
                        size="small"
                        style={{
                            borderRadius: 14,
                            background: "var(--ant-color-fill-tertiary)",
                        }}
                    >
                        <Space direction="vertical" style={{ width: "100%" }} size={14}>
                            <Row justify="space-between">
                                <Text strong>Sub Total</Text>
                                <Text strong>{totals.subtotal.toFixed(2)}</Text>
                            </Row>

                            <Row justify="space-between" align="middle">
                                <Text>Discount</Text>
                                <Space>
                                    <InputNumber
                                        min={0}
                                        max={100}
                                        value={discountPercent}
                                        onChange={(value) =>
                                            setDiscountPercent(typeof value === "number" ? value : 0)
                                        }
                                        addonAfter="%"
                                        style={{ width: 120 }}
                                    />
                                    <Text>{totals.discountAmount.toFixed(2)}</Text>
                                </Space>
                            </Row>

                            <Row justify="space-between" align="middle">
                                <Text>Adjustment</Text>
                                <Space>
                                    <InputNumber
                                        value={adjustment}
                                        precision={2}
                                        onChange={(value) =>
                                            setAdjustment(typeof value === "number" ? value : 0)
                                        }
                                        style={{ width: 120 }}
                                    />
                                    <Text>{Number(adjustment || 0).toFixed(2)}</Text>
                                </Space>
                            </Row>

                            <Divider style={{ margin: "4px 0" }} />

                            <Row justify="space-between">
                                <Text strong style={{ fontSize: 16 }}>
                                    Total ( ₹ )
                                </Text>
                                <Text strong style={{ fontSize: 16 }}>
                                    {totals.total.toFixed(2)}
                                </Text>
                            </Row>
                        </Space>
                    </Card>
                </Col>
            </Row>
        </Card>
    );
}