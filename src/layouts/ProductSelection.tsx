/* eslint-disable react-refresh/only-export-components */
import { DeleteOutlined, PlusOutlined, ShoppingCartOutlined } from "@ant-design/icons";
import {
    Button,
    Card,
    Col,
    Divider,
    Flex,
    Form,
    Input,
    InputNumber,
    Row,
    Select,
    Space,
    Tag,
    Typography,
    type FormInstance
} from "antd";
import { toTitleCase } from "../shared/Utils/utils";

const { Text } = Typography;

export type OpportunityLineItem = {
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
    form: FormInstance;
    products: any[];
    totals: OpportunityOrderTotals;
    loadingOptions?: boolean;
    name?: string;
    title?: string;
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
        product?.unit_price ??
        product?.rate,
        0
    );
};

export const createDefaultOpportunityLineItem = (): OpportunityLineItem => ({
    quantity: 1,
    price: 0,
    discount: 0,
    tax: 18,
    cgst: 0,
    sgst: 0,
    amount: 0,
});

export const calculateOpportunityLineItem = (item: OpportunityLineItem) => {
    const quantity = safeNumber(item?.quantity, 0);
    const price = safeNumber(item?.price, 0);
    const discount = safeNumber(item?.discount, 0);
    const tax = safeNumber(item?.tax, 18) || 18;

    const baseAmount = quantity * price;
    const taxableAmount = Math.max(baseAmount - discount, 0);
    const gstAmount = (taxableAmount * tax) / 100;

    return {
        cgst: gstAmount / 2,
        sgst: gstAmount / 2,
        tax: gstAmount,
        amount: taxableAmount + gstAmount,
    };
};

export default function ProductSelectionForm({
    form,
    products,
    totals,
    loadingOptions = false,
    name = "items",
    title = "Order Items",
}: Props) {
    const items = Form.useWatch(name, form) || [];

    // i want to show here small stock_on_hand also with product name
    const productOptions = products.map((product: any) => {
        const name = toTitleCase(product.name || product.product_name || "");
        const stock = Number(product.stock_on_hand || 0);
        const hasStock = stock > 0;

        return {
            label: (
                <Flex align="center" justify="space-between" gap={12} style={{ width: "100%" }}>
                    <Text
                        ellipsis={{ tooltip: name }}
                        style={{ maxWidth: 260 }}
                    >
                        {name}
                    </Text>

                    <Tag
                        color={hasStock ? "success" : "error"}
                        style={{ marginInlineEnd: 0, flexShrink: 0 }}
                    >
                        Stock: {stock}
                    </Tag>
                </Flex>
            ),
            value: product.id,
            productName: name,
        };
    });

    const handleProductChange = (rowIndex: number, productId?: string) => {
        const currentItems = form.getFieldValue(name) || [];

        if (!productId) {
            currentItems[rowIndex] = {
                ...currentItems[rowIndex],
                product_id: undefined,
                product_name: "",
                sku: "",
                price: 0,
                tax: 18,
                cgst: 0,
                sgst: 0,
                amount: 0,
            };

            form.setFieldsValue({ [name]: currentItems });
            return;
        }

        const product = products.find((p: any) => p.id === productId);
        if (!product) return;

        const updatedItem: OpportunityLineItem = {
            ...currentItems[rowIndex],
            product_id: product.id,
            product_name: product.name || product.product_name || "",
            sku: product.sku || product.part_no || product.item_code || "",
            price: getProductPrice(product),
            quantity: currentItems[rowIndex]?.quantity || 1,
            discount: currentItems[rowIndex]?.discount || 0,
            tax: getProductGst(product),
        };

        const calc = calculateOpportunityLineItem(updatedItem);

        currentItems[rowIndex] = {
            ...updatedItem,
            cgst: calc.cgst,
            sgst: calc.sgst,
            amount: calc.amount,
        };

        form.setFieldsValue({ [name]: currentItems });
    };

    return (
        <Card
            style={{ borderRadius: 14, marginBottom: 16 }}
            title={
                <Space>
                    <ShoppingCartOutlined />
                    <span>{title}</span>
                </Space>
            }
        >
            <Form.List name={name}>
                {(fields, { add, remove }) => (
                    <>
                        {fields.map(({ key, name: fieldName }) => {
                            const item = items?.[fieldName] || {};
                            const calc = calculateOpportunityLineItem(item);

                            return (
                                <Card
                                    key={key}
                                    size="small"
                                    style={{ borderRadius: 12, marginBottom: 12 }}

                                >

                                    <Row>
                                        <Col xs={24} md={12}>
                                            <Form.Item
                                                name={[fieldName, "product_id"]}
                                                label="Product"
                                                rules={[
                                                    {
                                                        required: true,
                                                        message: "Product required",
                                                    },
                                                ]}
                                            >
                                                <Select
                                                    showSearch
                                                    allowClear
                                                    loading={loadingOptions}
                                                    placeholder="Select product"
                                                    optionFilterProp="label"
                                                    optionLabelProp="productName"
                                                    filterOption={(input, option: any) =>
                                                        String(option?.productName || "")
                                                            .toLowerCase()
                                                            .includes(input.toLowerCase())
                                                    }
                                                    options={productOptions}
                                                    onChange={(value) =>
                                                        handleProductChange(fieldName, value)
                                                    }

                                                />
                                            </Form.Item>
                                        </Col>
                                    </Row>

                                    <Row gutter={12} align="middle">


                                        <Col xs={24} md={3}>
                                            <Form.Item name={[fieldName, "sku"]} label="SKU">
                                                <Input placeholder="SKU" />
                                            </Form.Item>
                                        </Col>

                                        <Col xs={12} md={3}>
                                            <Form.Item name={[fieldName, "quantity"]} label="Qty">
                                                <InputNumber
                                                    min={1}
                                                    style={{ width: "100%" }}
                                                />
                                            </Form.Item>
                                        </Col>

                                        <Col xs={12} md={4}>
                                            <Form.Item name={[fieldName, "price"]} label="Price">
                                                <InputNumber
                                                    min={0}
                                                    style={{ width: "100%" }}
                                                />
                                            </Form.Item>
                                        </Col>

                                        <Col xs={12} md={4}>
                                            <Form.Item
                                                name={[fieldName, "discount"]}
                                                label="Discount"
                                            >
                                                <InputNumber
                                                    min={0}
                                                    style={{ width: "100%" }}
                                                />
                                            </Form.Item>
                                        </Col>

                                        <Col xs={12} md={5}>
                                            <Form.Item name={[fieldName, "tax"]} label="GST">
                                                <Select
                                                    placeholder="GST"
                                                    options={GST_OPTIONS.map((gst) => ({
                                                        label: `${gst}%`,
                                                        value: gst,
                                                    }))}
                                                />
                                            </Form.Item>
                                        </Col>

                                        <Col xs={20} md={4}>
                                            <div>
                                                <Text strong>
                                                    ₹{Number(calc.amount || 0).toFixed(2)}
                                                </Text>
                                                <br />
                                                <Text
                                                    type="secondary"
                                                    style={{ fontSize: 11 }}
                                                >
                                                    CGST ₹{Number(calc.cgst || 0).toFixed(2)} + SGST ₹
                                                    {Number(calc.sgst || 0).toFixed(2)}
                                                </Text>
                                            </div>
                                        </Col>

                                        <Col xs={4} md={1}>
                                            <Button
                                                danger
                                                icon={<DeleteOutlined />}
                                                onClick={() => remove(fieldName)}
                                                disabled={fields.length === 1}
                                            />
                                        </Col>

                                        <Form.Item name={[fieldName, "product_name"]} hidden>
                                            <Input />
                                        </Form.Item>

                                        <Form.Item name={[fieldName, "cgst"]} hidden>
                                            <InputNumber />
                                        </Form.Item>

                                        <Form.Item name={[fieldName, "sgst"]} hidden>
                                            <InputNumber />
                                        </Form.Item>

                                        <Form.Item name={[fieldName, "amount"]} hidden>
                                            <InputNumber />
                                        </Form.Item>
                                    </Row>
                                </Card>
                            );
                        })}

                        <Button
                            type="dashed"
                            icon={<PlusOutlined />}
                            onClick={() => add(createDefaultOpportunityLineItem())}
                            block
                        >
                            Add Product
                        </Button>
                    </>
                )}
            </Form.List>

            <Divider />

            <Row justify="end">
                <Col xs={24} md={8} lg={6}>
                    <Space direction="vertical" style={{ width: "100%" }} size={8}>
                        <Row justify="space-between">
                            <Text type="secondary">Subtotal</Text>
                            <Text>₹{Number(totals.subtotal || 0).toFixed(2)}</Text>
                        </Row>

                        <Row justify="space-between">
                            <Text type="secondary">Discount</Text>
                            <Text>₹{Number(totals.discount || 0).toFixed(2)}</Text>
                        </Row>

                        <Row justify="space-between">
                            <Text type="secondary">CGST</Text>
                            <Text>₹{Number(totals.cgst || 0).toFixed(2)}</Text>
                        </Row>

                        <Row justify="space-between">
                            <Text type="secondary">SGST</Text>
                            <Text>₹{Number(totals.sgst || 0).toFixed(2)}</Text>
                        </Row>

                        <Divider style={{ margin: "8px 0" }} />

                        <Row justify="space-between">
                            <Text strong>Grand Total</Text>
                            <Text strong>₹{Number(totals.grandTotal || 0).toFixed(2)}</Text>
                        </Row>
                    </Space>
                </Col>
            </Row>
        </Card>
    );
}