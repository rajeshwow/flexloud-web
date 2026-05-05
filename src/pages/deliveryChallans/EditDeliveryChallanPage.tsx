import {
    ArrowLeftOutlined,
    ReloadOutlined,
    SaveOutlined,
    TruckOutlined,
} from "@ant-design/icons";
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
    Skeleton,
    Space,
    Typography,
} from "antd";
import dayjs from "dayjs";
import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import {
    fetchDeliveryChallanById,
    updateDeliveryChallan,
} from "../../redux/reducers/deliveryChallans/deliveryChallanSlice";
import { getOrganization } from "../../redux/reducers/organization.slice";
import { getProducts } from "../../redux/reducers/products.slice";
import type { AppDispatch, RootState } from "../../redux/store";
import DeliveryChallanItemTable, {
    calculateDeliveryChallanLineItem,
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

const STATUS_OPTIONS = [
    { label: "Draft", value: "draft" },
    { label: "Created", value: "created" },
    { label: "Cancelled", value: "cancelled" },
];

export default function EditDeliveryChallanPage() {
    const [form] = Form.useForm();
    const dispatch = useDispatch<AppDispatch>();
    const navigate = useNavigate();
    const { slug, id } = useParams();

    const { details, detailsLoading, updating } = useSelector(
        (state: RootState) => state.deliveryChallans,
    );

    const [customers, setCustomers] = useState<any[]>([]);
    const [products, setProducts] = useState<any[]>([]);
    const [initialLoading, setInitialLoading] = useState(true);

    const [lineItems, setLineItems] = useState<DeliveryChallanLineItem[]>([
        createDefaultDeliveryChallanLineItem(),
    ]);

    const [discountPercent, setDiscountPercent] = useState(0);
    const [adjustment, setAdjustment] = useState(0);

    const totals = useMemo(
        () => calculateDeliveryChallanTotals(lineItems, discountPercent, adjustment),
        [lineItems, discountPercent, adjustment],
    );

    const fetchOptions = async () => {
        const [customersRes, productsRes] = await Promise.all([
            await dispatch(getOrganization({})).unwrap(),
            await dispatch(getProducts({})).unwrap()
        ]);

        setCustomers(customersRes?.data || []);
        setProducts(productsRes?.data || []);
    };

    const loadPage = async () => {
        if (!id) return;

        try {
            setInitialLoading(true);

            await Promise.all([
                fetchOptions(),
                dispatch(fetchDeliveryChallanById(id)).unwrap(),
            ]);
        } catch (error: any) {
            message.error(error || "Failed to load delivery challan");
        } finally {
            setInitialLoading(false);
        }
    };

    useEffect(() => {
        loadPage();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id]);

    useEffect(() => {
        if (!details) return;

        form.setFieldsValue({
            customer_id: details.customer_id || undefined,
            customer_name: details.customer_name || "",
            customer_email: details.customer_email || "",
            customer_phone: details.customer_phone || "",
            reference_no: details.reference_no || "",
            challan_date: details.challan_date ? dayjs(details.challan_date) : dayjs(),
            challan_type: details.challan_type || "Delivery Challan",
            status: details.status || "draft",
            notes: details.notes || "",
        });

        setDiscountPercent(Number(details.discount_percent || 0));
        setAdjustment(Number(details.adjustment || 0));

        const mappedItems =
            details.items?.map((item: any) => {
                const mapped: DeliveryChallanLineItem = {
                    key: item.id || crypto.randomUUID(),
                    id: item.id,
                    product_id: item.product_id || undefined,
                    item_name: item.item_name || "",
                    sku: item.sku || "",
                    quantity: Number(item.quantity || 1),
                    rate: Number(item.rate || 0),
                    discount: Number(item.discount || 0),
                    tax: Number(item.tax || 0),
                    cgst: Number(item.cgst || 0),
                    sgst: Number(item.sgst || 0),
                    amount: Number(item.amount || 0),
                };

                const calc = calculateDeliveryChallanLineItem(mapped);

                return {
                    ...mapped,
                    ...calc,
                };
            }) || [];

        setLineItems(
            mappedItems.length ? mappedItems : [createDefaultDeliveryChallanLineItem()],
        );
    }, [details, form]);

    const handleCustomerChange = (customerId?: string) => {
        const customer = customers.find((item: any) => item.id === customerId);

        if (!customerId || !customer) {
            form.setFieldsValue({
                customer_id: undefined,
                customer_name: "",
                customer_email: "",
                customer_phone: "",
            });
            return;
        }

        form.setFieldsValue({
            customer_id: customer.id,
            customer_name: customer.name || customer.organization_name || "",
            customer_email: customer.email || customer.organization_email || "",
            customer_phone: customer.phone || customer.mobile || "",
        });
    };

    const handleSubmit = async () => {
        if (!id) return;

        try {
            const values = await form.validateFields();

            const validItems = lineItems
                .filter((item) => item.product_id || item.item_name)
                .map((item) => ({
                    id: item.id || undefined,
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

                status: values.status || "draft",
                items: validItems,
            };

            await dispatch(
                updateDeliveryChallan({
                    id,
                    payload,
                }),
            ).unwrap();

            message.success("Delivery challan updated successfully");
            navigate(`/${slug}/delivery-challans/${id}`);
        } catch (error: any) {
            message.error(error || "Failed to update delivery challan");
        }
    };

    if (initialLoading || detailsLoading) {
        return (
            <div style={{ padding: 16 }}>
                <Card style={{ borderRadius: 16 }}>
                    <Skeleton active paragraph={{ rows: 12 }} />
                </Card>
            </div>
        );
    }

    return (
        <div style={{ padding: 16 }}>
            <Card
                style={{ borderRadius: 16 }}
                title={
                    <Space>
                        <TruckOutlined />
                        <Title level={4} style={{ margin: 0 }}>
                            Edit Delivery Challan
                        </Title>
                    </Space>
                }
                extra={
                    <Space>
                        <Button
                            icon={<ArrowLeftOutlined />}
                            onClick={() =>
                                navigate(`/${slug}/delivery-challans/${id}`)
                            }
                        >
                            Back
                        </Button>

                        <Button icon={<ReloadOutlined />} onClick={loadPage}>
                            Refresh
                        </Button>

                        <Button
                            type="primary"
                            icon={<SaveOutlined />}
                            loading={updating}
                            onClick={handleSubmit}
                        >
                            Update
                        </Button>
                    </Space>
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
                        <Row gutter={16}>
                            <Col xs={24} md={8}>
                                <Form.Item name="customer_id" label="Select Customer">
                                    <Select
                                        showSearch
                                        allowClear
                                        placeholder="Select customer"
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

                            <Col xs={24} md={8}>
                                <Form.Item
                                    label="Customer Name"
                                    name="customer_name"
                                    rules={[
                                        {
                                            required: true,
                                            message: "Customer name is required",
                                        },
                                    ]}
                                >
                                    <Input placeholder="Customer name" />
                                </Form.Item>
                            </Col>

                            <Col xs={24} md={4}>
                                <Form.Item label="Customer Email" name="customer_email">
                                    <Input placeholder="Email" />
                                </Form.Item>
                            </Col>

                            <Col xs={24} md={4}>
                                <Form.Item label="Customer Phone" name="customer_phone">
                                    <Input placeholder="Phone" />
                                </Form.Item>
                            </Col>
                        </Row>
                    </Card>

                    <Row gutter={16}>
                        <Col xs={24} md={8}>
                            <Form.Item label="Reference#" name="reference_no">
                                <Input placeholder="Reference number" />
                            </Form.Item>
                        </Col>

                        <Col xs={24} md={8}>
                            <Form.Item
                                label="Delivery Challan Date"
                                name="challan_date"
                                rules={[
                                    {
                                        required: true,
                                        message: "Date is required",
                                    },
                                ]}
                            >
                                <DatePicker style={{ width: "100%" }} format="DD/MM/YYYY" />
                            </Form.Item>
                        </Col>

                        <Col xs={24} md={8}>
                            <Form.Item
                                label="Challan Type"
                                name="challan_type"
                                rules={[
                                    {
                                        required: true,
                                        message: "Challan type is required",
                                    },
                                ]}
                            >
                                <Select options={CHALLAN_TYPES} />
                            </Form.Item>
                        </Col>

                        <Col xs={24} md={8}>
                            <Form.Item label="Status" name="status">
                                <Select options={STATUS_OPTIONS} />
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
                        <Button
                            icon={<ArrowLeftOutlined />}
                            onClick={() =>
                                navigate(`/${slug}/delivery-challans/${id}`)
                            }
                        >
                            Cancel
                        </Button>

                        <Button
                            type="primary"
                            icon={<SaveOutlined />}
                            loading={updating}
                            onClick={handleSubmit}
                        >
                            Update Delivery Challan
                        </Button>
                    </Space>
                </Form>
            </Card>
        </div>
    );
}