import {
    ArrowLeftOutlined,
    DeleteOutlined,
    PlusOutlined,
    SaveOutlined,
    ShoppingCartOutlined,
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
    message,
} from "antd";
import dayjs from "dayjs";
import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { getOrganization } from "../../redux/reducers/organization.slice";
import { getProducts } from "../../redux/reducers/products.slice";
import {
    createSalesOrder,
    fetchSalesOrderById,
    resetSalesOrderDetail,
    updateSalesOrder,
} from "../../redux/reducers/salesOrders.slice";
import { getUsers } from "../../redux/reducers/user.slice";
import type { AppDispatch } from "../../redux/store";
import { toTitleCase } from "../../shared/Utils/utils";

const { Title, Text } = Typography;

const GST_OPTIONS = [0, 5, 12, 18, 28];

const toNumber = (value: any) => Number(value || 0);

const calculateItem = (item: any) => {
    const quantity = toNumber(item?.quantity);
    const price = toNumber(item?.price);
    const discount = toNumber(item?.discount);
    const gstPercent = toNumber(item?.tax);

    const grossAmount = quantity * price;
    const taxableAmount = Math.max(grossAmount - discount, 0);

    const cgstPercent = gstPercent / 2;
    const sgstPercent = gstPercent / 2;

    const cgstAmount = (taxableAmount * cgstPercent) / 100;
    const sgstAmount = (taxableAmount * sgstPercent) / 100;
    const taxAmount = cgstAmount + sgstAmount;

    const amount = taxableAmount + taxAmount;

    return {
        grossAmount,
        taxableAmount,
        cgstPercent,
        sgstPercent,
        cgstAmount,
        sgstAmount,
        taxAmount,
        amount,
    };
};

interface Props {
    isEdit?: boolean,
}

export default function SalesOrderFormPage({ isEdit = false }: Props) {
    const [form] = Form.useForm();
    const dispatch = useDispatch<AppDispatch>();
    const navigate = useNavigate();
    const { slug, id } = useParams();

    const { detail, detailLoading } = useSelector((s: any) => s.salesOrders);

    const [customers, setCustomers] = useState<any[]>([]);
    const [users, setUsers] = useState<any[]>([]);
    const [products, setProducts] = useState<any[]>([]);
    const [loadingOptions, setLoadingOptions] = useState(false);

    const items = Form.useWatch("items", form) || [];
    const shippingWatch = Form.useWatch("shipping", form);

    const fetchDropdowns = async () => {
        try {
            setLoadingOptions(true);

            const [orgRes, userRes, productRes] = await Promise.all([
                dispatch(getOrganization({ limit: 1000 })).unwrap(),
                dispatch(getUsers({ limit: 1000 })).unwrap(),
                dispatch(getProducts({ limit: 100 })).unwrap(),
            ]);

            setCustomers(orgRes?.data || []);
            setUsers(userRes?.data || []);
            setProducts(productRes?.data || []);
        } catch (err) {
            message.error("Dropdown data load nahi ho paya");
        } finally {
            setLoadingOptions(false);
        }
    };

    useEffect(() => {
        fetchDropdowns();

        if (isEdit && id) {
            dispatch(fetchSalesOrderById(id as string));
        }

        return () => {
            dispatch(resetSalesOrderDetail());
        };
    }, [id]);

    useEffect(() => {
        if (detail && isEdit) {
            form.setFieldsValue({
                ...detail,
                customer_id: detail.organization_id || detail.customer_id,
                so_date: detail.so_date ? dayjs(detail.so_date) : undefined,
                expected_delivery_date: detail.expected_delivery_date
                    ? dayjs(detail.expected_delivery_date)
                    : undefined,
                items: detail.items?.map((x: any) => ({
                    product_id: x.product_id || x.raw_tally_data?.product_id,
                    sku: x.sku || x.item_code || x.product_master_sku || "",
                    product_name: x.product_name || x.item_name || x.product_master_name || "",
                    quantity: Number(x.quantity || 1),
                    price: Number(x.price || x.rate || 0),
                    discount: Number(x.discount || x.raw_tally_data?.discount || 0),
                    tax: Number(x.tax || x.raw_tally_data?.tax || 0),
                })),
            });
        }
    }, [detail]);

    const customerOptions = customers.map((x: any) => ({
        label: x.name,
        value: x.id,
    }));

    const userOptions = users.map((x: any) => ({
        label: toTitleCase(x.name || x.full_name || x.email),
        value: x.id,
    }));

    const productOptions = products.map((x: any) => ({
        label: x.name || x.product_name,
        value: x.id,
        data: x,
    }));

    const totals = useMemo(() => {
        const subtotal = items.reduce(
            (sum: number, item: any) => sum + calculateItem(item).grossAmount,
            0
        );

        const discount = items.reduce(
            (sum: number, item: any) => sum + toNumber(item?.discount),
            0
        );

        const cgst = items.reduce(
            (sum: number, item: any) => sum + calculateItem(item).cgstAmount,
            0
        );

        const sgst = items.reduce(
            (sum: number, item: any) => sum + calculateItem(item).sgstAmount,
            0
        );

        const tax = cgst + sgst;
        const shipping = toNumber(shippingWatch);
        const grand_total = subtotal - discount + tax + shipping;

        return { subtotal, discount, cgst, sgst, tax, shipping, grand_total };
    }, [items, shippingWatch]);

    const handleProductChange = (rowIndex: number, productId: string) => {
        const product = products.find((p: any) => p.id === productId);
        if (!product) return;

        const currentItems = form.getFieldValue("items") || [];

        currentItems[rowIndex] = {
            ...currentItems[rowIndex],
            product_id: product.id,
            product_name: product.name || product.product_name || "",
            sku: product.sku || product.item_code || "",
            price: Number(product.price || product.selling_price || product.rate || 0),
            quantity: currentItems[rowIndex]?.quantity || 1,
            discount: currentItems[rowIndex]?.discount || 0,
            tax: currentItems[rowIndex]?.tax || 0,
        };

        form.setFieldsValue({ items: currentItems });
    };

    const onFinish = async (values: any) => {
        const normalizedItems = (values.items || []).map((item: any) => {
            const calc = calculateItem(item);

            return {
                ...item,
                quantity: toNumber(item.quantity),
                price: toNumber(item.price),
                discount: toNumber(item.discount),
                tax: toNumber(item.tax), // GST %
                cgst: calc.cgstPercent,
                sgst: calc.sgstPercent,
                cgst_amount: calc.cgstAmount,
                sgst_amount: calc.sgstAmount,
                tax_amount: calc.taxAmount,
                amount: calc.amount,
            };
        });

        const payload = {
            ...values,
            items: normalizedItems,
            so_date: values.so_date ? dayjs(values.so_date).format("YYYY-MM-DD") : undefined,
            expected_delivery_date: values.expected_delivery_date
                ? dayjs(values.expected_delivery_date).format("YYYY-MM-DD")
                : null,
            subtotal: totals.subtotal,
            discount: totals.discount,
            cgst: totals.cgst,
            sgst: totals.sgst,
            tax: totals.tax,
            shipping: totals.shipping,
            grand_total: totals.grand_total,
            currency: values.currency || "INR",
            status: values.status || "draft",
        };

        try {
            if (isEdit && id) {
                await dispatch(updateSalesOrder({ id, payload })).unwrap();
                message.success("Sales order updated successfully");
            } else {
                await dispatch(createSalesOrder(payload)).unwrap();
                message.success("Sales order created successfully");
            }

            navigate(`/${slug}/sales-orders`);
        } catch (error: any) {
            message.error(error?.message || "Something went wrong");
        }
    };

    return (
        <div>
            <Card style={{ borderRadius: 14, marginBottom: 16 }}>
                <Space style={{ width: "100%", justifyContent: "space-between" }}>
                    <Space>
                        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate(-1)} />
                        <div>
                            <Title level={3} style={{ margin: 0 }}>
                                {isEdit ? "Edit Sales Order" : "Create Sales Order"}
                            </Title>
                            <Text type="secondary">
                                Customer order with products, pricing and delivery
                            </Text>
                        </div>
                    </Space>

                    <Button
                        type="primary"
                        icon={<SaveOutlined />}
                        onClick={() => form.submit()}
                        loading={detailLoading}
                    >
                        Save
                    </Button>
                </Space>
            </Card>

            <Form
                form={form}
                layout="vertical"
                onFinish={onFinish}
                initialValues={{
                    so_date: dayjs(),
                    currency: "INR",
                    status: "draft",
                    shipping: 0,
                    items: [{ quantity: 1, price: 0, discount: 0, tax: 0 }],
                }}
            >
                <Card style={{ borderRadius: 14, marginBottom: 16 }}>
                    <Row gutter={16}>
                        <Col span={8}>
                            <Form.Item name="customer_id" label="Customer" rules={[{ required: true }]}>
                                <Select
                                    showSearch
                                    loading={loadingOptions}
                                    placeholder="Select customer"
                                    optionFilterProp="label"
                                    options={customerOptions}
                                />
                            </Form.Item>
                        </Col>

                        <Col span={8}>
                            <Form.Item name="assigned_to" label="Assigned To">
                                <Select
                                    allowClear
                                    showSearch
                                    loading={loadingOptions}
                                    placeholder="Select user"
                                    optionFilterProp="label"
                                    options={userOptions}
                                />
                            </Form.Item>
                        </Col>

                        <Col span={8}>
                            <Form.Item name="so_date" label="SO Date" rules={[{ required: true }]}>
                                <DatePicker
                                    style={{ width: "100%" }}
                                    disabledDate={(current) => current.isBefore(dayjs().startOf("day"))}
                                />
                            </Form.Item>
                        </Col>

                        <Col span={8}>
                            <Form.Item name="expected_delivery_date" label="Expected Delivery Date">
                                <DatePicker
                                    style={{ width: "100%" }}
                                    disabledDate={(current) => current.isBefore(dayjs().startOf("day"))}
                                />
                            </Form.Item>
                        </Col>

                        <Col span={8}>
                            <Form.Item name="currency" label="Currency">
                                <Select
                                    options={[
                                        { label: "INR", value: "INR" },
                                        { label: "USD", value: "USD" },
                                        { label: "AED", value: "AED" },
                                    ]}
                                />
                            </Form.Item>
                        </Col>

                        <Col span={8}>
                            <Form.Item name="status" label="Status">
                                <Select
                                    options={[
                                        { label: "Draft", value: "draft" },
                                        { label: "Confirmed", value: "confirmed" },
                                        { label: "Packed", value: "packed" },
                                        { label: "Shipped", value: "shipped" },
                                        { label: "Delivered", value: "delivered" },
                                        { label: "Cancelled", value: "cancelled" },
                                    ]}
                                />
                            </Form.Item>
                        </Col>
                    </Row>
                </Card>

                <Card
                    style={{ borderRadius: 14, marginBottom: 16 }}
                    title={
                        <Space>
                            <ShoppingCartOutlined />
                            <span>Order Items</span>
                        </Space>
                    }
                >
                    <Form.List name="items">
                        {(fields, { add, remove }) => (
                            <>
                                {fields.map(({ key, name }) => {
                                    const itemCalc = calculateItem(items?.[name]);

                                    return (
                                        <Card key={key} size="small" style={{ borderRadius: 12, marginBottom: 12 }}>
                                            <Row gutter={12} align="middle">
                                                <Col span={6}>
                                                    <Form.Item
                                                        name={[name, "product_id"]}
                                                        label="Product"
                                                        rules={[{ required: true }]}
                                                    >
                                                        <Select
                                                            showSearch
                                                            loading={loadingOptions}
                                                            placeholder="Select product"
                                                            optionFilterProp="label"
                                                            options={productOptions}
                                                            onChange={(value) => handleProductChange(name, value)}
                                                        />
                                                    </Form.Item>
                                                </Col>

                                                <Col span={3}>
                                                    <Form.Item name={[name, "sku"]} label="SKU">
                                                        <Input placeholder="SKU" />
                                                    </Form.Item>
                                                </Col>

                                                <Col span={2}>
                                                    <Form.Item name={[name, "quantity"]} label="Qty">
                                                        <InputNumber min={1} style={{ width: "100%" }} />
                                                    </Form.Item>
                                                </Col>

                                                <Col span={3}>
                                                    <Form.Item name={[name, "price"]} label="Price">
                                                        <InputNumber min={0} style={{ width: "100%" }} />
                                                    </Form.Item>
                                                </Col>

                                                <Col span={3}>
                                                    <Form.Item name={[name, "discount"]} label="Discount">
                                                        <InputNumber min={0} style={{ width: "100%" }} />
                                                    </Form.Item>
                                                </Col>

                                                <Col span={3}>
                                                    <Form.Item name={[name, "tax"]} label="GST">
                                                        <Select
                                                            placeholder="GST"
                                                            options={GST_OPTIONS.map((gst) => ({
                                                                label: `${gst}%`,
                                                                value: gst,
                                                            }))}
                                                        />
                                                    </Form.Item>
                                                </Col>

                                                <Col span={3}>
                                                    <div>
                                                        <Text strong>₹{itemCalc.amount.toFixed(2)}</Text>
                                                        <br />
                                                        <Text type="secondary" style={{ fontSize: 11 }}>
                                                            CGST {itemCalc.cgstPercent}% + SGST {itemCalc.sgstPercent}%
                                                        </Text>
                                                    </div>
                                                </Col>

                                                <Col span={1}>
                                                    <Button
                                                        danger
                                                        icon={<DeleteOutlined />}
                                                        onClick={() => remove(name)}
                                                        disabled={fields.length === 1}
                                                    />
                                                </Col>
                                            </Row>
                                        </Card>
                                    );
                                })}

                                <Button
                                    type="dashed"
                                    icon={<PlusOutlined />}
                                    onClick={() => add({ quantity: 1, price: 0, discount: 0, tax: 0 })}
                                    block
                                >
                                    Add Product
                                </Button>
                            </>
                        )}
                    </Form.List>
                </Card>

                <Row gutter={16}>
                    <Col span={16}>
                        <Card style={{ borderRadius: 14 }}>
                            <Form.Item name="notes" label="Notes">
                                <Input.TextArea rows={3} placeholder="Internal notes" />
                            </Form.Item>

                            <Form.Item name="terms" label="Terms & Conditions">
                                <Input.TextArea rows={3} placeholder="Payment/delivery terms" />
                            </Form.Item>
                        </Card>
                    </Col>

                    <Col span={8}>
                        <Card style={{ borderRadius: 14 }} title="Summary">
                            <Space direction="vertical" style={{ width: "100%" }}>
                                <SummaryRow label="Subtotal" value={totals.subtotal} />
                                <SummaryRow label="Discount" value={totals.discount} />
                                <SummaryRow label="CGST" value={totals.cgst} />
                                <SummaryRow label="SGST" value={totals.sgst} />
                                <SummaryRow label="Total GST" value={totals.tax} />

                                <Form.Item name="shipping" label="Shipping">
                                    <InputNumber min={0} style={{ width: "100%" }} />
                                </Form.Item>

                                <Divider />

                                <Space style={{ width: "100%", justifyContent: "space-between" }}>
                                    <Title level={4}>Grand Total</Title>
                                    <Title level={4}>₹{totals.grand_total.toFixed(2)}</Title>
                                </Space>
                            </Space>
                        </Card>
                    </Col>
                </Row>
            </Form>
        </div>
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