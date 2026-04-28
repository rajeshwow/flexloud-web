import {
    DeleteOutlined,
    PlusOutlined,
    ShoppingCartOutlined,
    UserOutlined,
} from "@ant-design/icons";
import {
    Button,
    Card,
    Col,
    DatePicker,
    Divider,
    Form,
    Input,
    InputNumber,
    Row,
    Select,
    Space,
    Typography,
} from "antd";
import dayjs from "dayjs";
import { useEffect } from "react";
import type { OrganizationItem } from "../../../redux/reducers/organization.slice";
import type { ProductItem } from "../../../redux/reducers/products.slice";

const { Text, Title } = Typography;

const GST_OPTIONS = [0, 5, 12, 18, 28];

type Option = {
    label: string;
    value: string;
};

type Props = {
    loading?: boolean;
    vendorOptions?: OrganizationItem[];
    userOptions?: Option[];
    productOptions?: ProductItem[];
    onSubmit: (values: any) => void;
    initialValues?: any;
    submitText?: string;
};

const num = (value: any) => {
    const n = Number(value);
    return Number.isFinite(n) ? n : 0;
};

const calculateItemAmount = (item: any) => {
    const qty = num(item?.quantity);
    const price = num(item?.price);
    const discount = num(item?.discount);
    const gst = num(item?.tax);

    const base = qty * price;
    const taxable = Math.max(base - discount, 0);

    const cgst = gst / 2;
    const sgst = gst / 2;

    const cgstAmount = (taxable * cgst) / 100;
    const sgstAmount = (taxable * sgst) / 100;
    const taxAmount = cgstAmount + sgstAmount;

    return {
        base,
        taxable,
        cgst,
        sgst,
        cgstAmount,
        sgstAmount,
        taxAmount,
        amount: taxable + taxAmount,
    };
};

export default function PurchaseOrderForm({
    loading = false,
    vendorOptions = [],
    userOptions = [],
    productOptions = [],
    onSubmit,
    initialValues,
    submitText
}: Props) {
    const [form] = Form.useForm();

    const calculateTotals = () => {
        const items = form.getFieldValue("items") || [];

        const total = items.reduce((sum: number, item: any) => {
            return sum + calculateItemAmount(item).base;
        }, 0);

        const itemDiscount = items.reduce((sum: number, item: any) => {
            return sum + num(item?.discount);
        }, 0);

        const itemTax = items.reduce((sum: number, item: any) => {
            return sum + calculateItemAmount(item).taxAmount;
        }, 0);

        const shipping = num(form.getFieldValue("shipping"));
        const discount = num(form.getFieldValue("discount"));

        const subtotal = total - itemDiscount - discount;
        const grandTotal = subtotal + shipping + itemTax;

        form.setFieldsValue({
            total,
            subtotal,
            tax: itemTax,
            cgst: itemTax / 2,
            sgst: itemTax / 2,
            grand_total: grandTotal,
        });
    };

    const handleSubmit = (values: any) => {
        const items = (values.items || []).map((item: any) => {
            const calc = calculateItemAmount(item);

            return {
                ...item,
                quantity: num(item.quantity),
                price: num(item.price),
                discount: num(item.discount),
                tax: num(item.tax), // GST %
                cgst: calc.cgst,
                sgst: calc.sgst,
                cgst_amount: calc.cgstAmount,
                sgst_amount: calc.sgstAmount,
                tax_amount: calc.taxAmount,
                amount: calc.amount,
            };
        });

        const total = items.reduce((sum: number, item: any) => {
            return sum + num(item.quantity) * num(item.price);
        }, 0);

        const itemDiscount = items.reduce((sum: number, item: any) => {
            return sum + num(item.discount);
        }, 0);

        const itemTax = items.reduce((sum: number, item: any) => {
            return sum + num(item.tax_amount);
        }, 0);

        const discount = num(values.discount);
        const shipping = num(values.shipping);

        const subtotal = total - itemDiscount - discount;
        const grand_total = subtotal + itemTax + shipping;

        onSubmit({
            ...values,
            items,
            total,
            subtotal,
            discount,
            shipping,
            tax: itemTax,
            cgst: itemTax / 2,
            sgst: itemTax / 2,
            grand_total,
        });
    };

    useEffect(() => {
        if (initialValues) {
            form.setFieldsValue({
                ...initialValues,
                po_date: initialValues.po_date ? dayjs(initialValues.po_date) : dayjs(),
                expected_delivery_date: initialValues.expected_delivery_date
                    ? dayjs(initialValues.expected_delivery_date)
                    : dayjs(),
                items: initialValues.items || [],
            });

            setTimeout(() => {
                calculateTotals();
            }, 0);
        }
    }, [initialValues, form]);

    return (
        <Form
            form={form}
            layout="vertical"
            initialValues={{
                po_date: dayjs(),
                expected_delivery_date: dayjs(),
                currency: "INR",
                total: 0,
                discount: 0,
                subtotal: 0,
                shipping: 0,
                tax: 0,
                grand_total: 0,
                items: [],
                ...initialValues,
            }}
            onValuesChange={calculateTotals}
            onFinish={handleSubmit}
        >
            <Card
                title={
                    <Space>
                        <ShoppingCartOutlined />
                        Basic
                    </Space>
                }
                style={{ borderRadius: 14, marginBottom: 18 }}
            >
                <Row gutter={18}>
                    <Col xs={24} md={8}>
                        <Form.Item label="PO Date" name="po_date">
                            <DatePicker style={{ width: "100%" }} format="DD/MM/YYYY" disabledDate={(current) => current && current.isBefore(dayjs())} />
                        </Form.Item>
                    </Col>

                    <Col xs={24} md={8}>
                        <Form.Item label="Expected Delivery Date" name="expected_delivery_date">
                            <DatePicker style={{ width: "100%" }} format="DD/MM/YYYY" />
                        </Form.Item>
                    </Col>

                    <Col xs={24} md={8}>
                        <Form.Item
                            label="Assigned To"
                            name="assigned_to"
                            rules={[{ required: true, message: "Assigned user is required" }]}
                        >
                            <Select
                                showSearch
                                allowClear
                                placeholder="Select user"
                                options={userOptions}
                                suffixIcon={<UserOutlined />}
                                optionFilterProp="label"
                            />
                        </Form.Item>
                    </Col>

                    <Col xs={24} md={8}>
                        <Form.Item
                            label="Vendor"
                            name="vendor_id"
                            rules={[{ required: true, message: "Vendor is required" }]}
                        >
                            <Select
                                showSearch
                                allowClear
                                placeholder="Select vendor"
                                options={vendorOptions?.map((val: any) => ({
                                    label: val.name,
                                    value: val.id,
                                }))}
                                optionFilterProp="label"
                            />
                        </Form.Item>
                    </Col>

                    <Col xs={24} md={8}>
                        <Form.Item label="Currency" name="currency">
                            <Select
                                options={[
                                    { label: "INR", value: "INR" },
                                    { label: "USD", value: "USD" },
                                    { label: "AED", value: "AED" },
                                ]}
                            />
                        </Form.Item>
                    </Col>


                </Row>
            </Card>

            <Card
                title={
                    <Space>
                        <ShoppingCartOutlined />
                        Order Items
                    </Space>
                }
                style={{ borderRadius: 14, marginBottom: 18 }}
            >
                <Form.List name="items">
                    {(fields, { add, remove }) => (
                        <>
                            <Space direction="vertical" size={14} style={{ width: "100%" }}>
                                {fields.map(({ key, name }) => (
                                    <Card key={key} size="small" style={{ borderRadius: 12 }}>
                                        <Row gutter={12} align="middle">
                                            <Col xs={24} md={6}>
                                                <Form.Item
                                                    label="Product"
                                                    name={[name, "product_id"]}
                                                    rules={[{ required: true, message: "Product is required" }]}
                                                >
                                                    <Select
                                                        showSearch
                                                        allowClear
                                                        placeholder="Select product"
                                                        options={productOptions?.map((val: any) => ({
                                                            label: val.name,
                                                            value: val.id,
                                                        }))}
                                                        optionFilterProp="label"
                                                    />
                                                </Form.Item>
                                            </Col>

                                            <Col xs={24} md={3}>
                                                <Form.Item label="SKU" name={[name, "sku"]}>
                                                    <Input placeholder="SKU" />
                                                </Form.Item>
                                            </Col>

                                            <Col xs={24} md={2}>
                                                <Form.Item label="Qty" name={[name, "quantity"]}>
                                                    <InputNumber min={0} style={{ width: "100%" }} />
                                                </Form.Item>
                                            </Col>

                                            <Col xs={24} md={3}>
                                                <Form.Item label="Price" name={[name, "price"]}>
                                                    <InputNumber min={0} style={{ width: "100%" }} />
                                                </Form.Item>
                                            </Col>

                                            <Col xs={24} md={3}>
                                                <Form.Item label="Discount" name={[name, "discount"]}>
                                                    <InputNumber min={0} style={{ width: "100%" }} />
                                                </Form.Item>
                                            </Col>

                                            <Col xs={24} md={3}>
                                                <Form.Item label="GST" name={[name, "tax"]}>
                                                    <Select
                                                        placeholder="GST"
                                                        options={GST_OPTIONS.map((gst) => ({
                                                            label: `${gst}%`,
                                                            value: gst,
                                                        }))}
                                                    />
                                                </Form.Item>
                                            </Col>

                                            <Col xs={20} md={3}>
                                                <Form.Item shouldUpdate noStyle>
                                                    {() => {
                                                        const item = form.getFieldValue(["items", name]) || {};
                                                        const calc = calculateItemAmount(item);

                                                        return (
                                                            <div style={{ paddingTop: 4 }}>
                                                                <Text strong>₹{calc.amount.toFixed(2)}</Text>
                                                                <br />
                                                                <Text type="secondary" style={{ fontSize: 11 }}>
                                                                    CGST {calc.cgst}% + SGST {calc.sgst}%
                                                                </Text>
                                                            </div>
                                                        );
                                                    }}
                                                </Form.Item>
                                            </Col>

                                            <Col xs={4} md={1}>
                                                <Button
                                                    danger
                                                    icon={<DeleteOutlined />}
                                                    onClick={() => remove(name)}
                                                />
                                            </Col>
                                        </Row>
                                    </Card>
                                ))}

                                {!fields.length && (
                                    <div
                                        style={{
                                            padding: 28,
                                            border: "1px dashed var(--ant-color-border)",
                                            borderRadius: 12,
                                            textAlign: "center",
                                        }}
                                    >
                                        <Text type="secondary">No products added yet.</Text>
                                    </div>
                                )}
                            </Space>

                            <Button
                                block
                                type="dashed"
                                icon={<PlusOutlined />}
                                style={{ marginTop: 14 }}
                                onClick={() =>
                                    add({
                                        product_id: undefined,
                                        sku: "",
                                        quantity: 1,
                                        price: 0,
                                        discount: 0,
                                        tax: 0,
                                        amount: 0,
                                    })
                                }
                            >
                                Add Product
                            </Button>
                        </>
                    )}
                </Form.List>
            </Card>

            <Card title="Summary" style={{ borderRadius: 14 }}>
                <Row gutter={[8, 8]}>


                    <Col span={16}>
                        <Col xs={24} md={24}>
                            <Form.Item label="Payment Terms Description" name="payment_terms_description">
                                <Input.TextArea rows={4} placeholder="Enter payment terms" />
                            </Form.Item>
                        </Col>

                        <Col xs={24} md={24}>
                            <Form.Item label="Description" name="description">
                                <Input.TextArea rows={4} placeholder="Enter description" />
                            </Form.Item>
                        </Col>
                    </Col>
                    <Col span={8}>
                        <Card style={{ borderRadius: 14 }} title="Summary">
                            <Form.Item shouldUpdate noStyle>
                                {() => (
                                    <Space direction="vertical" style={{ width: "100%" }}>
                                        <SummaryRow label="Subtotal" value={form.getFieldValue("subtotal")} />
                                        <SummaryRow label="Discount" value={form.getFieldValue("discount")} />
                                        <SummaryRow label="CGST" value={form.getFieldValue("cgst")} />
                                        <SummaryRow label="SGST" value={form.getFieldValue("sgst")} />
                                        <SummaryRow label="Total GST" value={form.getFieldValue("tax")} />

                                        <Form.Item name="shipping" label="Shipping">
                                            <InputNumber min={0} style={{ width: "100%" }} />
                                        </Form.Item>

                                        <Divider />

                                        <Space style={{ width: "100%", justifyContent: "space-between" }}>
                                            <Title level={4}>Grand Total</Title>
                                            <Title level={4}>
                                                ₹{Number(form.getFieldValue("grand_total") || 0).toFixed(2)}
                                            </Title>
                                        </Space>
                                    </Space>
                                )}
                            </Form.Item>
                        </Card>
                    </Col>
                </Row>


                <Divider />

                <Space style={{ width: "100%", justifyContent: "flex-end" }}>
                    <Button>Cancel</Button>
                    <Button type="primary" htmlType="submit" loading={loading}>
                        {submitText}
                    </Button>
                </Space>
            </Card>
        </Form>
    );
}

function SummaryRow({ label, value }: { label: string; value: number }) {
    return (
        <Space style={{ width: "100%", justifyContent: "space-between" }}>
            <Text type="secondary">{label}</Text>
            <Text strong>₹{Number(value || 0).toFixed(2)}</Text>
        </Space>
    );
}