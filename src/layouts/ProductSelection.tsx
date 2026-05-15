/* eslint-disable react-refresh/only-export-components */
import { DeleteOutlined, PlusOutlined, ShoppingCartOutlined } from "@ant-design/icons";
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
    Typography,
} from "antd";
import { toTitleCase } from "../shared/Utils/utils";

const { Text } = Typography;

export type OpportunityLineItem = {
    key: string;
    id?: string;
    product_id?: string;
    product_name?: string;
    sku?: string;
    quantity?: number;
    price?: number;
    discount?: number;
    tax?: number;
    cgst?: number;
    sgst?: number;
    amount?: number;
};

export type OpportunityOrderTotals = {
    subtotal: number;
    discount: number;
    cgst: number;
    sgst: number;
    tax: number;
    grandTotal: number;
};

type Props = {
    products: any[];
    lineItems: OpportunityLineItem[];
    setLineItems: React.Dispatch<React.SetStateAction<OpportunityLineItem[]>>;
    totals: OpportunityOrderTotals;
};

const GST_OPTIONS = [0, 5, 12, 18, 28];

const safeNumber = (value: any, fallback = 0) => {
    const num = Number(value);
    return Number.isFinite(num) ? num : fallback;
};

const getProductGst = (product: any) => {
    const rawTax =
        product?.tax_rate ??
        product?.gst_rate ??
        product?.gst_percent ??
        product?.tax_percent ??
        product?.tax ??
        product?.gst;

    const tax = Number(rawTax);

    return Number.isFinite(tax) && tax > 0 ? tax : 18;
};

const getProductPrice = (product: any) => {
    return safeNumber(
        product?.sale_price ??
        product?.selling_price ??
        product?.price ??
        product?.unit_price,
        0
    );
};


export const createDefaultOpportunityLineItem = (): OpportunityLineItem => ({
    key: crypto.randomUUID(),
    quantity: 1,
    price: 0,
    discount: 0,
    tax: 18,
    cgst: 0,
    sgst: 0,
    amount: 0,
});

export const calculateOpportunityLineItem = (item: OpportunityLineItem) => {
    const quantity = safeNumber(item.quantity, 0);
    const price = safeNumber(item.price, 0);
    const discount = safeNumber(item.discount, 0);
    const tax = safeNumber(item.tax, 0);

    const baseAmount = quantity * price;
    const taxableAmount = Math.max(baseAmount - discount, 0);
    const gstAmount = (taxableAmount * tax) / 100;

    return {
        cgst: gstAmount / 2,
        sgst: gstAmount / 2,
        amount: taxableAmount + gstAmount,
    };
};

export default function OpportunityOrderItems({
    products,
    lineItems,
    setLineItems,
    totals,
}: Props) {
    const addLineItem = () => {
        setLineItems((prev) => [...prev, createDefaultOpportunityLineItem()]);
    };

    const removeLineItem = (key: string) => {
        setLineItems((prev) => prev.filter((item) => item.key !== key));
    };

    const updateLineItem = (
        key: string,
        field: keyof OpportunityLineItem,
        value: string | number | undefined
    ) => {
        setLineItems((prev) =>
            prev.map((item) => {
                if (item.key !== key) return item;

                const updated: OpportunityLineItem = {
                    ...item,
                    [field]: value,
                };

                const calc = calculateOpportunityLineItem(updated);

                return {
                    ...updated,
                    cgst: calc.cgst,
                    sgst: calc.sgst,
                    amount: calc.amount,
                };
            })
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
                        product_name: "",
                        sku: "",
                        price: 0,
                        tax: 18,
                        cgst: 0,
                        sgst: 0,
                        amount: 0,
                    };
                }

                const updated: OpportunityLineItem = {
                    ...item,
                    product_id: productId,
                    product_name: product?.name || product?.product_name || "",
                    sku: product?.sku || product?.part_no || "",
                    price: getProductPrice(product),
                    tax: getProductGst(product),
                    quantity: item.quantity || 1,
                    discount: item.discount || 0,
                };

                const calc = calculateOpportunityLineItem(updated);

                return {
                    ...updated,
                    ...calc,
                };
            })
        );
    };

    const columns = [
        {
            title: "Product",
            dataIndex: "product_id",
            width: 260,
            render: (_: any, record: any) => (
                <Select
                    showSearch
                    allowClear
                    placeholder="Select product"
                    value={record.product_id}
                    optionFilterProp="label"
                    style={{ width: "100%" }}
                    options={products.map((product: any) => ({
                        label: toTitleCase(product.name || product.product_name),
                        value: product.id,
                    }))}
                    onChange={(value) => handleProductChange(record.key, value)}
                />
            ),
        },
        {
            title: "Qty",
            dataIndex: "quantity",
            width: 100,
            render: (_: any, record: any) => (
                <InputNumber
                    min={1}
                    value={record.quantity}
                    onChange={(value) =>
                        updateLineItem(
                            record.key,
                            "quantity",
                            typeof value === "number" ? value : 1
                        )
                    }
                    style={{ width: "100%" }}
                />
            ),
        },
        {
            title: "Price",
            dataIndex: "price",
            width: 130,
            render: (_: any, record: any) => (
                <InputNumber
                    min={0}
                    value={record.price}
                    onChange={(value) =>
                        updateLineItem(
                            record.key,
                            "price",
                            typeof value === "number" ? value : 0
                        )
                    }
                    style={{ width: "100%" }}
                />
            ),
        },
        {
            title: "Discount",
            dataIndex: "discount",
            width: 130,
            render: (_: any, record: any) => (
                <InputNumber
                    min={0}
                    value={record.discount}
                    onChange={(value) =>
                        updateLineItem(
                            record.key,
                            "discount",
                            typeof value === "number" ? value : 0
                        )
                    }
                    style={{ width: "100%" }}
                />
            ),
        },
        {
            title: "GST %",
            dataIndex: "tax",
            width: 120,
            render: (_: any, record: any) => (
                <Select
                    value={safeNumber(record.tax, 18) || 18}
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
            title: "CGST",
            dataIndex: "cgst",
            width: 120,
            render: (_: any, record: any) => `₹${Number(record.cgst || 0).toFixed(2)}`,
        },
        {
            title: "SGST",
            dataIndex: "sgst",
            width: 120,
            render: (_: any, record: any) => `₹${Number(record.sgst || 0).toFixed(2)}`,
        },
        {
            title: "Amount",
            dataIndex: "amount",
            width: 140,
            render: (_: any, record: any) => (
                <Text strong>₹{Number(record.amount || 0).toFixed(2)}</Text>
            ),
        },
        {
            title: "",
            key: "action",
            width: 70,
            fixed: "right",
            render: (_: any, record: any) => (
                <Button
                    danger
                    icon={<DeleteOutlined />}
                    onClick={() => removeLineItem(record.key)}
                    disabled={lineItems.length === 1}
                />
            ),
        },
    ] as any;

    return (
        <Card
            style={{ borderRadius: 14, marginBottom: 16 }}
            title={
                <Space>
                    <ShoppingCartOutlined />
                    <span>Order Items</span>
                </Space>
            }
            extra={
                <Button type="primary" icon={<PlusOutlined />} onClick={addLineItem}>
                    Add Product
                </Button>
            }
        >
            <Table
                rowKey="key"
                columns={columns}
                dataSource={lineItems}
                pagination={false}
                scroll={{ x: 1400 }}
                className="op-line-table"
            />

            <Divider />

            <Row justify="end">
                <Col xs={24} md={8} lg={6}>
                    <Space direction="vertical" style={{ width: "100%" }} size={8}>
                        <Row justify="space-between">
                            <Text type="secondary">Subtotal</Text>
                            <Text>₹{totals.subtotal.toFixed(2)}</Text>
                        </Row>

                        <Row justify="space-between">
                            <Text type="secondary">Discount</Text>
                            <Text>₹{totals.discount.toFixed(2)}</Text>
                        </Row>

                        <Row justify="space-between">
                            <Text type="secondary">CGST</Text>
                            <Text>₹{totals.cgst.toFixed(2)}</Text>
                        </Row>

                        <Row justify="space-between">
                            <Text type="secondary">SGST</Text>
                            <Text>₹{totals.sgst.toFixed(2)}</Text>
                        </Row>

                        <Divider style={{ margin: "8px 0" }} />

                        <Row justify="space-between">
                            <Text strong>Grand Total</Text>
                            <Text strong>₹{totals.grandTotal.toFixed(2)}</Text>
                        </Row>
                    </Space>
                </Col>
            </Row>
        </Card>
    );
}