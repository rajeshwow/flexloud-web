import {
    PlusOutlined,
    UserOutlined
} from "@ant-design/icons";
import {
    Button,
    Col,
    DatePicker,
    Divider,
    Form,
    Input,
    Modal,
    Row,
    Select,
    Space,
    Tabs,
    Typography
} from "antd";
import dayjs from "dayjs";
import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import ProductSelectionForm from "../../../layouts/ProductSelection";
import { getOrganization, type OrganizationItem } from "../../../redux/reducers/organization.slice";
import type { ProductItem } from "../../../redux/reducers/products.slice";
import type { AppDispatch, RootState } from "../../../redux/store";
import { toTitleCase } from "../../../shared/Utils/utils";
import OrganizationForm from "../../Organization/components/OrganizationForm";

const { Text, Title } = Typography;

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

const DEFAULT_ITEM = {
    product_id: undefined,
    product_name: "",
    sku: "",
    quantity: 1,
    price: 0,
    discount: 0,
    tax: 18,
    amount: 0,
};

const num = (value: any) => {
    const n = Number(value);
    return Number.isFinite(n) ? n : 0;
};

const calculateItemAmount = (item: any) => {
    const qty = num(item?.quantity);
    const price = num(item?.price);
    const discount = num(item?.discount);
    const gst = num(item?.tax) || 18;

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
    submitText,
}: Props) {
    const [form] = Form.useForm();
    const [orgModalOpen, setOrgModalOpen] = useState(false);
    const dispatch = useDispatch<AppDispatch>();

    const organization = useSelector(
        (state: RootState) => state.organization?.orgList || [],
    );

    const watchedItems = Form.useWatch("items", form) || [];
    const watchedShipping = Form.useWatch("shipping", form);

    const totals = useMemo(() => {
        const total = watchedItems.reduce((sum: number, item: any) => {
            return sum + calculateItemAmount(item).base;
        }, 0);

        const itemDiscount = watchedItems.reduce((sum: number, item: any) => {
            return sum + num(item?.discount);
        }, 0);

        const itemTax = watchedItems.reduce((sum: number, item: any) => {
            return sum + calculateItemAmount(item).taxAmount;
        }, 0);

        const shipping = num(watchedShipping);

        const subtotal = Math.max(total - itemDiscount, 0);
        const grandTotal = subtotal + shipping + itemTax;

        return {
            total,
            discount: itemDiscount,
            subtotal,
            tax: itemTax,
            cgst: itemTax / 2,
            sgst: itemTax / 2,
            shipping,
            grand_total: grandTotal,
            grandTotal,
        };
    }, [watchedItems, watchedShipping]);

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

        const subtotal = Math.max(total - itemDiscount, 0);
        const grandTotal = subtotal + shipping + itemTax;

        form.setFieldsValue({
            total,
            discount: itemDiscount,
            subtotal,
            tax: itemTax,
            cgst: itemTax / 2,
            sgst: itemTax / 2,
            grand_total: grandTotal,
        });
    };

    useEffect(() => {
        form.setFieldsValue({
            total: Number(totals.total.toFixed(2)),
            discount: Number(totals.discount.toFixed(2)),
            subtotal: Number(totals.subtotal.toFixed(2)),
            tax: Number(totals.tax.toFixed(2)),
            cgst: Number(totals.cgst.toFixed(2)),
            sgst: Number(totals.sgst.toFixed(2)),
            grand_total: Number(totals.grand_total.toFixed(2)),
        });
    }, [totals, form]);

    const handleSubmit = (values: any) => {
        const items = (values.items || []).map((item: any) => {
            const normalizedItem = {
                ...item,
                tax: num(item.tax) || 18,
            };

            const calc = calculateItemAmount(normalizedItem);

            return {
                ...normalizedItem,
                quantity: num(normalizedItem.quantity),
                price: num(normalizedItem.price),
                discount: num(normalizedItem.discount),
                tax: num(normalizedItem.tax),
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

        const discount = itemDiscount;
        const shipping = num(values.shipping);

        const subtotal = Math.max(total - discount, 0);
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
                items: initialValues.items?.length
                    ? initialValues.items.map((item: any) => ({
                        ...DEFAULT_ITEM,
                        ...item,
                        product_id: item.product_id || undefined,
                        product_name: item.product_name || item.item_name || item.name || "",
                        sku: item.sku || item.item_code || item.part_number || "",
                        quantity: num(item.quantity) || 1,
                        price: num(item.price || item.rate || item.sale_price || item.list_price),
                        discount: num(item.discount || item.discount_value),
                        tax: num(item.tax || item.tax_rate) || 18,
                        amount: num(item.amount || item.line_total),
                    }))
                    : [DEFAULT_ITEM],
            });

            setTimeout(() => {
                calculateTotals();
            }, 0);
        }
    }, [initialValues, form]);

    return (
        <>
            <Modal
                title="Create Organization"
                open={orgModalOpen}
                footer={null}
                width={1100}
                destroyOnHidden
                onCancel={() => setOrgModalOpen(false)}
            >
                <OrganizationForm
                    mode="create"
                    onSubmit={async (values?: any) => {
                        setOrgModalOpen(false);
                        dispatch(getOrganization());
                        form.setFieldsValue({
                            vendor_id: values?.id,
                        });

                        // message.success("Organization created successfully");
                    }}
                />
            </Modal>

            <Form
                form={form}
                layout="vertical"
                initialValues={{
                    po_date: dayjs(),
                    expected_delivery_date: dayjs(),
                    currency: "₹",
                    total: 0,
                    discount: 0,
                    subtotal: 0,
                    shipping: 0,
                    tax: 0,
                    grand_total: 0,
                    items: initialValues?.items?.length ? initialValues.items : [DEFAULT_ITEM],
                    ...initialValues,
                }}
                onValuesChange={calculateTotals}
                onFinish={handleSubmit}
            >
                <Tabs
                    defaultActiveKey="basic"
                    items={[
                        {
                            key: "basic",
                            label: "Basic",
                            children: (
                                <>
                                    <Row gutter={18}>
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
                                                    options={organization?.map((val: any) => ({
                                                        label: toTitleCase(val.name),
                                                        value: val.id,
                                                    }))}
                                                    optionFilterProp="label"
                                                    dropdownRender={(menu) => (
                                                        <>
                                                            <div style={{ padding: 8 }}>
                                                                <Button
                                                                    type="dashed"
                                                                    icon={<PlusOutlined />}
                                                                    block
                                                                    onMouseDown={(e) => e.preventDefault()}
                                                                    onClick={() => setOrgModalOpen(true)}
                                                                >
                                                                    Add New Organization
                                                                </Button>
                                                            </div>

                                                            <Divider style={{ margin: "4px 0" }} />

                                                            {menu}
                                                        </>
                                                    )}
                                                />
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
                                    </Row>
                                    <Divider />

                                    <Row gutter={18}>
                                        <Col xs={24} md={8}>
                                            <Form.Item label="PO Date" name="po_date">
                                                <DatePicker
                                                    style={{ width: "100%" }}
                                                    format="DD/MM/YYYY"
                                                    disabledDate={(current) => current && current.isBefore(dayjs())}
                                                />
                                            </Form.Item>
                                        </Col>

                                        <Col xs={24} md={8}>
                                            <Form.Item label="Expected Delivery Date" name="expected_delivery_date">
                                                <DatePicker disabledDate={(current) => current && current.isBefore(dayjs())} style={{ width: "100%" }} format="DD/MM/YYYY" />
                                            </Form.Item>
                                        </Col>
                                    </Row>
                                </>
                            ),
                        },
                        {
                            key: "items",
                            label: "Order Items",
                            children: (
                                <>
                                    <ProductSelectionForm
                                        form={form}
                                        products={productOptions || []}
                                        totals={totals}
                                        name="items"
                                        title="Order Items"
                                    />

                                    <Row gutter={[8, 8]}>
                                        <Col xs={24} md={12}>
                                            <Form.Item
                                                label="Payment Terms Description"
                                                name="payment_terms_description"
                                            >
                                                <Input.TextArea rows={4} placeholder="Enter payment terms" />
                                            </Form.Item>
                                        </Col>

                                        <Col xs={24} md={12}>
                                            <Form.Item label="Description" name="description">
                                                <Input.TextArea rows={4} placeholder="Enter description" />
                                            </Form.Item>
                                        </Col>

                                        {/* <Col span={8}>
                                            <Card style={{ borderRadius: 14 }} title="Summary">
                                                <Form.Item shouldUpdate noStyle>
                                                    {() => (
                                                        <Space direction="vertical" style={{ width: "100%" }}>
                                                            <SummaryRow
                                                                label="Subtotal"
                                                                value={form.getFieldValue("subtotal")}
                                                            />
                                                            <SummaryRow
                                                                label="Discount"
                                                                value={form.getFieldValue("discount")}
                                                            />
                                                            <SummaryRow label="CGST" value={form.getFieldValue("cgst")} />
                                                            <SummaryRow label="SGST" value={form.getFieldValue("sgst")} />
                                                            <SummaryRow
                                                                label="Total GST"
                                                                value={form.getFieldValue("tax")}
                                                            />

                                                            <Form.Item name="shipping" label="Shipping">
                                                                <InputNumber min={0} style={{ width: "100%" }} />
                                                            </Form.Item>

                                                            <Divider />

                                                            <Space
                                                                style={{
                                                                    width: "100%",
                                                                    justifyContent: "space-between",
                                                                }}
                                                            >
                                                                <Title level={4}>Grand Total</Title>
                                                                <Title level={4}>
                                                                    ₹
                                                                    {Number(
                                                                        form.getFieldValue("grand_total") || 0
                                                                    ).toFixed(2)}
                                                                </Title>
                                                            </Space>
                                                        </Space>
                                                    )}
                                                </Form.Item>
                                            </Card>
                                        </Col> */}
                                    </Row>

                                    <Divider />

                                    <Space style={{ width: "100%", justifyContent: "flex-end" }}>
                                        <Button>Cancel</Button>
                                        <Button type="primary" htmlType="submit" loading={loading}>
                                            {submitText}
                                        </Button>
                                    </Space>
                                </>
                            ),
                        },
                    ]}
                />
            </Form>
        </>
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