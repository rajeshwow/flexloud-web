import {
    ArrowLeftOutlined,
    PlusOutlined,
    SaveOutlined,
} from "@ant-design/icons";
import {
    Button,
    Card,
    Col,
    DatePicker,
    Divider,
    Form,
    Input,
    Modal,
    Row,
    Select,
    Space,
    Typography,
    message
} from "antd";
import dayjs from "dayjs";
import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import ProductSelectionForm from "../../layouts/ProductSelection";
import { getOrganization } from "../../redux/reducers/organization.slice";
import { getProducts } from "../../redux/reducers/products.slice";
import { fetchQuoteById } from "../../redux/reducers/quotes.slice";
import {
    createSalesOrder,
    fetchSalesOrderById,
    resetSalesOrderDetail,
    updateSalesOrder,
} from "../../redux/reducers/salesOrders.slice";
import { getUsers } from "../../redux/reducers/user.slice";
import type { AppDispatch } from "../../redux/store";
import { getSalesOrderStatusOptions, toTitleCase } from "../../shared/Utils/utils";
import OrganizationForm from "../Organization/components/OrganizationForm";

const { Title, Text } = Typography;

const toNumber = (value: any) => Number(value || 0);

const calculateItem = (item: any) => {
    const quantity = toNumber(item?.quantity);
    const price = toNumber(item?.price);
    const discount = toNumber(item?.discount);
    const gstPercent = Number(item?.tax || 18);

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
    isEdit?: boolean;
}

export default function SalesOrderFormPage({ isEdit = false }: Props) {
    const [form] = Form.useForm();
    const dispatch = useDispatch<AppDispatch>();
    const navigate = useNavigate();
    const { slug, id } = useParams();
    const [orgModalOpen, setOrgModalOpen] = useState(false);

    const location = useLocation();

    const quoteIdFromState = (location.state as any)?.quoteId;
    const fromQuote = Boolean((location.state as any)?.fromQuote);

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
                dispatch(getProducts({ limit: 10000 })).unwrap(),
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

    const loadQuoteForSalesOrder = async (quoteId: string) => {
        try {
            const res = await dispatch(fetchQuoteById(quoteId)).unwrap();

            const quote = res?.data?.data || res?.data || res;

            if (!quote) {
                message.error("Quote details Missing");
                return;
            }

            const quoteStage = String(quote?.quote_stage || "").toLowerCase();

            if (quoteStage !== "approved") {
                message.error("Sales order sirf approved quote se create ho sakta hai");
                navigate(`/${slug}/quotes`);
                return;
            }

            const quoteItems = quote?.line_items || quote?.items || [];

            form.setFieldsValue({
                quote_id: quote.id,

                customer_id:
                    quote.organization_id ||
                    quote.related_to_id ||
                    quote.customer_id ||
                    undefined,

                assigned_to: quote.assigned_to || undefined,

                so_date: dayjs(),
                expected_delivery_date: undefined,

                currency: quote.currency || "₹",
                status: "draft",

                notes: quote.description || "",
                terms:
                    quote.terms_condition_description ||
                    quote.terms_condition ||
                    quote.payment_terms_description ||
                    "",

                shipping: Number(quote.freight_charges || 0),

                items: quoteItems.length
                    ? quoteItems.map((item: any) => ({
                        id: item.id,
                        product_id: item.product_id || undefined,
                        sku: item.sku || item.item_code || item.part_number || "",
                        product_name:
                            item.product_display_name ||
                            item.product_name ||
                            item.service_name ||
                            "",

                        quantity: Number(item.quantity || 1),

                        price: Number(
                            item.sale_price ||
                            item.price ||
                            item.list_price ||
                            item.rate ||
                            0
                        ),

                        discount: Number(item.discount_value || item.discount || 0),

                        tax: Number(item.tax_rate || item.tax || 18) || 18,
                    }))
                    : [{ quantity: 1, price: 0, discount: 0, tax: 18 }],
            });
        } catch (error: any) {
            message.error(error?.response?.data?.message || "Quote details load nahi ho paye");
        }
    };

    useEffect(() => {
        fetchDropdowns();

        if (isEdit && id) {
            dispatch(fetchSalesOrderById(id as string));
        }

        if (!isEdit && fromQuote && quoteIdFromState) {
            loadQuoteForSalesOrder(quoteIdFromState);
        }

        return () => {
            dispatch(resetSalesOrderDetail());
        };
    }, [id, isEdit, fromQuote, quoteIdFromState]);

    useEffect(() => {
        if (detail && isEdit) {
            form.setFieldsValue({
                ...detail,
                customer_id: detail.organization_id || detail.customer_id,
                so_date: detail.so_date ? dayjs(detail.so_date) : undefined,
                expected_delivery_date: detail.expected_delivery_date
                    ? dayjs(detail.expected_delivery_date)
                    : undefined,
                items: detail.items?.length
                    ? detail.items.map((x: any) => ({
                        id: x.id,
                        product_id: x.product_id || x.raw_tally_data?.product_id,
                        sku: x.sku || x.item_code || x.product_master_sku || "",
                        product_name:
                            x.product_name || x.item_name || x.product_master_name || "",
                        quantity: Number(x.quantity || 1),
                        price: Number(x.price || x.rate || 0),
                        discount: Number(x.discount || x.raw_tally_data?.discount || 0),
                        tax: Number(x.tax || x.raw_tally_data?.tax || 18) || 18,
                    }))
                    : [{ quantity: 1, price: 0, discount: 0, tax: 18 }],
            });
        }
    }, [detail]);

    const customerOptions = customers.map((x: any) => ({
        label: toTitleCase(x.name),
        value: x.id,
    }));

    const userOptions = users.map((x: any) => ({
        label: toTitleCase(x.name || x.full_name || x.email),
        value: x.id,
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

        return {
            subtotal,
            discount,
            cgst,
            sgst,
            tax,
            shipping,
            grand_total,
            grandTotal: grand_total,
        };
    }, [items, shippingWatch]);

    const onFinish = async (values: any) => {
        const normalizedItems = (values.items || []).map((item: any) => {
            const normalizedItem = {
                ...item,
                tax: Number(item.tax || 18),
            };

            const calc = calculateItem(normalizedItem);

            return {
                ...normalizedItem,
                quantity: toNumber(normalizedItem.quantity),
                price: toNumber(normalizedItem.price),
                discount: toNumber(normalizedItem.discount),
                tax: toNumber(normalizedItem.tax),
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
            currency: values.currency || "₹",
            status: values.status || "draft",
            quote_id: values?.quote_id || null,
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
                    currency: "₹",
                    status: "draft",
                    shipping: 0,
                    items: [{ quantity: 1, price: 0, discount: 0, tax: 18 }],
                }}
            >
                <Card style={{ borderRadius: 14, marginBottom: 16 }}>
                    <Row gutter={16}>
                        <Col span={8}>
                            <Form.Item
                                name="customer_id"
                                label="Customer"
                                rules={[{ required: true }]}
                            >
                                <Select
                                    showSearch
                                    allowClear
                                    loading={loadingOptions}
                                    placeholder="Select customer"
                                    optionFilterProp="label"
                                    options={customerOptions}
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

                        <Col>
                            <Form.Item name="quote_id" initialValue={quoteIdFromState} hidden>
                                <Input />
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
                            <Form.Item
                                name="so_date"
                                label="SO Date"
                                rules={[{ required: true }]}
                            >
                                <DatePicker
                                    style={{ width: "100%" }}
                                    disabledDate={(current) =>
                                        current.isBefore(dayjs().startOf("day"))
                                    }
                                />
                            </Form.Item>
                        </Col>

                        <Col span={8}>
                            <Form.Item
                                name="expected_delivery_date"
                                label="Expected Delivery Date"
                            >
                                <DatePicker
                                    style={{ width: "100%" }}
                                    disabledDate={(current) =>
                                        current.isBefore(dayjs().startOf("day"))
                                    }
                                />
                            </Form.Item>
                        </Col>

                        <Col span={8}>
                            <Form.Item name="status" label="Status">
                                <Select options={getSalesOrderStatusOptions()} />
                            </Form.Item>
                        </Col>
                    </Row>
                </Card>

                <ProductSelectionForm
                    form={form}
                    products={products}
                    totals={totals}
                    loadingOptions={loadingOptions}
                    name="items"
                    title="Order Items"
                />

                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item name="notes" label="Notes">
                            <Input.TextArea rows={3} placeholder="Internal notes" />
                        </Form.Item>
                    </Col>

                    <Col span={12}>
                        <Form.Item name="terms" label="Terms & Conditions">
                            <Input.TextArea rows={3} placeholder="Payment/delivery terms" />
                        </Form.Item>
                    </Col>

                    {/* <Col span={8}>
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

                                <Space
                                    style={{
                                        width: "100%",
                                        justifyContent: "space-between",
                                    }}
                                >
                                    <Title level={4}>Grand Total</Title>
                                    <Title level={4}>
                                        ₹{Number(totals.grand_total || 0).toFixed(2)}
                                    </Title>
                                </Space>
                            </Space>
                        </Card>
                    </Col> */}
                </Row>
            </Form>

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
                    onSubmit={async (createdOrg?: any) => {
                        setOrgModalOpen(false);

                        const res = await dispatch(getOrganization({ limit: 1000 })).unwrap();
                        setCustomers(res?.data || []);

                        if (createdOrg?.id) {
                            form.setFieldValue("customer_id", createdOrg.id);
                        }
                    }}
                />
            </Modal>
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