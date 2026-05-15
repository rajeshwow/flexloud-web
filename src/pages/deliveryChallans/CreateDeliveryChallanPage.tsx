import { CloseOutlined, SearchOutlined, TruckOutlined } from "@ant-design/icons";
import {
    Button,
    Card,
    Col,
    DatePicker,
    Form,
    Input,
    message,
    Row,
    Select,
    Space,
    Typography,
} from "antd";
import dayjs from "dayjs";
import { useEffect, useMemo, useState } from "react";
import { useDispatch } from "react-redux";
import { createDeliveryChallan } from "../../redux/reducers/deliveryChallans/deliveryChallanSlice";
import { getOrganization } from "../../redux/reducers/organization.slice";
import { getProducts } from "../../redux/reducers/products.slice";
import type { AppDispatch } from "../../redux/store";
import DeliveryChallanItemTable, {
    calculateDeliveryChallanTotals,
    createDefaultDeliveryChallanLineItem,
    type DeliveryChallanLineItem,
} from "./components/DeliveryChallanItemTable";

const { Title } = Typography;

const CHALLAN_TYPES = [
    { label: "Delivery Challan", value: "Delivery Challan" },
    { label: "Job Work", value: "Job Work" },
    { label: "Supply on Approval", value: "Supply on Approval" },
    { label: "Others", value: "Others" },
];

export default function CreateDeliveryChallanPage() {
    const [form] = Form.useForm();

    const [saving, setSaving] = useState(false);
    const [customers, setCustomers] = useState<any[]>([]);
    const [products, setProducts] = useState<any[]>([]);
    const dispatch = useDispatch<AppDispatch>();

    const [lineItems, setLineItems] = useState<DeliveryChallanLineItem[]>([
        createDefaultDeliveryChallanLineItem(),
    ]);

    const [discountPercent, setDiscountPercent] = useState(0);
    const [adjustment, setAdjustment] = useState(0);

    const totals = useMemo(
        () => calculateDeliveryChallanTotals(lineItems, discountPercent, adjustment),
        [lineItems, discountPercent, adjustment],
    );

    const fetchInitialData = async () => {
        try {
            const [customersRes, productsRes] = await Promise.all([

                await dispatch(getOrganization({})).unwrap(),
                await dispatch(getProducts({ limit: 10000 })).unwrap()

                // Client.get(withTenant("/organizations"), {
                //     params: { page: 1, limit: 500 },
                // }),
                // Client.get(withTenant("/products"), {
                //     params: { page: 1, limit: 500 },
                // }),
            ]);

            setCustomers(customersRes?.data || []);
            setProducts(productsRes?.data || []);
        } catch (error) {
            console.error(error);
            message.error("Failed to load customers/products");
        }
    };

    useEffect(() => {
        fetchInitialData();

        form.setFieldsValue({
            challan_date: dayjs(),
            challan_type: "Delivery Challan",
        });
    }, []);

    const handleCustomerChange = (customerId?: string) => {
        const customer = customers.find((item: any) => item.id === customerId);

        if (!customerId || !customer) {
            form.setFieldsValue({
                customer_id: undefined,
                customer_name: undefined,
                customer_email: undefined,
                customer_phone: undefined,
            });
            return;
        }

        form.setFieldsValue({
            customer_id: customer.id,
            customer_name: customer.name || customer.organization_name,
            customer_email: customer.email || customer.organization_email || "",
            customer_phone: customer.phone || customer.mobile || "",
        });
    };

    const handleSubmit = async (status: "draft" | "created" = "draft") => {
        try {
            const values = await form.validateFields();

            const validItems = lineItems
                .filter((item) => item.product_id || item.item_name)
                .map((item) => ({
                    product_id: item.product_id || null,
                    item_name: item.item_name || "Item",
                    sku: item.sku || null,
                    quantity: Number(item.quantity || 0),
                    rate: Number(item.rate || 0),
                    discount: Number(item.discount || 0),
                    tax: Number(item.tax || 0),
                    cgst: Number(item.cgst || 0),
                    sgst: Number(item.sgst || 0),
                    amount: Number(item.amount || 0),
                }));

            if (!validItems.length) {
                message.error("Please add at least one item");
                return;
            }

            setSaving(true);

            const payload = {
                customer_id: values.customer_id || null,
                customer_name: values.customer_name,
                customer_email: values.customer_email || null,
                customer_phone: values.customer_phone || null,

                reference_no: values.reference_no || null,
                challan_date: values.challan_date
                    ? values.challan_date.format("YYYY-MM-DD")
                    : dayjs().format("YYYY-MM-DD"),
                challan_type: values.challan_type,

                notes: values.notes || null,

                subtotal: totals.subtotal,
                discount_percent: discountPercent,
                discount_amount: totals.discountAmount,
                adjustment,
                total: totals.total,

                status,
                items: validItems,
            };

            await dispatch(createDeliveryChallan(payload)).unwrap();
            message.success("Delivery challan created successfully");

            form.resetFields();
            form.setFieldsValue({
                challan_date: dayjs(),
                challan_type: "Delivery Challan",
            });
            setLineItems([createDefaultDeliveryChallanLineItem()]);
            setDiscountPercent(0);
            setAdjustment(0);
        } catch (error: any) {
            console.error(error);
            message.error(
                error?.response?.data?.message || "Failed to create delivery challan",
            );
        } finally {
            setSaving(false);
        }
    };

    return (
        <div style={{ padding: 16 }}>
            <Card
                style={{ borderRadius: 16 }}
                title={
                    <Space>
                        <TruckOutlined />
                        <Title level={4} style={{ margin: 0 }}>
                            New Delivery Challan
                        </Title>
                    </Space>
                }
                extra={
                    <Button type="text" icon={<CloseOutlined />}>
                        Close
                    </Button>
                }
            >
                <Form form={form} layout="vertical">
                    <Card
                        size="small"
                        style={{
                            borderRadius: 14,
                            marginBottom: 16,
                            background: "var(--ant-color-fill-tertiary)",
                        }}
                    >
                        <Row gutter={16} align="bottom">
                            <Col xs={24} md={4}>
                                <Form.Item
                                    label="Customer Name"
                                    name="customer_name"
                                    rules={[{ required: true, message: "Customer is required" }]}
                                >
                                    <Input placeholder="Customer name" />
                                </Form.Item>
                            </Col>

                            <Col xs={24} md={8}>
                                <Form.Item name="customer_id" label="Select Customer">
                                    <Select
                                        showSearch
                                        allowClear
                                        placeholder="Select or add a customer"
                                        optionFilterProp="label"
                                        onChange={handleCustomerChange}
                                        options={customers.map((customer: any) => ({
                                            label:
                                                customer.name ||
                                                customer.organization_name ||
                                                customer.email,
                                            value: customer.id,
                                        }))}
                                    />
                                </Form.Item>
                            </Col>

                            <Col xs={24} md={2}>
                                <Button
                                    type="primary"
                                    icon={<SearchOutlined />}
                                    style={{ width: "100%", marginBottom: 24 }}
                                />
                            </Col>

                            <Col xs={24} md={5}>
                                <Form.Item label="Customer Email" name="customer_email">
                                    <Input placeholder="Email" />
                                </Form.Item>
                            </Col>

                            <Col xs={24} md={5}>
                                <Form.Item label="Customer Phone" name="customer_phone">
                                    <Input placeholder="Phone" />
                                </Form.Item>
                            </Col>
                        </Row>
                    </Card>

                    <Row gutter={16}>
                        <Col xs={24} md={8}>
                            <Form.Item label="Delivery Challan#" name="challan_number">
                                <Input disabled placeholder="Auto generated after save" />
                            </Form.Item>
                        </Col>

                        <Col xs={24} md={8}>
                            <Form.Item label="Reference#" name="reference_no">
                                <Input placeholder="Reference number" />
                            </Form.Item>
                        </Col>

                        <Col xs={24} md={8}>
                            <Form.Item
                                label="Delivery Challan Date"
                                name="challan_date"
                                rules={[{ required: true, message: "Date is required" }]}
                            >
                                <DatePicker style={{ width: "100%" }} format="DD/MM/YYYY" />
                            </Form.Item>
                        </Col>

                        <Col xs={24} md={8}>
                            <Form.Item
                                label="Challan Type"
                                name="challan_type"
                                rules={[{ required: true, message: "Challan type is required" }]}
                            >
                                <Select
                                    placeholder="Choose a proper challan type."
                                    options={CHALLAN_TYPES}
                                />
                            </Form.Item>
                        </Col>
                    </Row>

                    <DeliveryChallanItemTable
                        products={products}
                        lineItems={lineItems}
                        setLineItems={setLineItems}
                        discountPercent={discountPercent}
                        setDiscountPercent={setDiscountPercent}
                        adjustment={adjustment}
                        setAdjustment={setAdjustment}
                        totals={totals}
                    />

                    <Form.Item label="Customer Notes" name="notes">
                        <Input.TextArea
                            rows={3}
                            placeholder="Enter any notes to be displayed in your transaction"
                        />
                    </Form.Item>

                    <Space>
                        <Button loading={saving} onClick={() => handleSubmit("draft")}>
                            Save as Draft
                        </Button>

                        <Button type="primary" loading={saving} onClick={() => handleSubmit("created")}>
                            Save Delivery Challan
                        </Button>

                        <Button>Cancel</Button>
                    </Space>
                </Form>
            </Card>
        </div>
    );
}