import {
    CalendarOutlined,
    DeleteOutlined,
    PlusOutlined,
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
    Modal,
    Row,
    Select,
    Space,
    Table,
    Tabs,
    Typography,
    message,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import dayjs from "dayjs";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { fetchContacts } from "../../redux/reducers/contacts.slice";
import {
    createOpportunity,
    resetOpportunitiesState,
} from "../../redux/reducers/opportunities.slice";
import {
    getOrganization,
    type OrganizationItem,
} from "../../redux/reducers/organization.slice";
import { getProducts } from "../../redux/reducers/products.slice";
import { getUsers } from "../../redux/reducers/user.slice";
import type { AppDispatch } from "../../redux/store";
import { toTitleCase } from "../../shared/Utils/utils";
import OrganizationForm from "../Organization/components/OrganizationForm";

const { Title, Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;

type LineItem = {
    key: string;
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

type FormValues = {
    organization_name?: string;
    contact_number?: string;
    lead_source?: string;
    company?: string;
    sales_stage?: string;
    type?: string;
    dealer_organization?: string;
    opportunity_amount_currency?: string;
    opportunity_amount?: number;
    next_followup?: dayjs.Dayjs;
    add_description?: string;

    opportunity_name?: string;
    contact_name?: string;
    contact_email?: string;
    probability?: number;
    next_step?: string;
    dealer_contact?: string;
    expected_close_date?: dayjs.Dayjs;
    followup_type?: string;
    description?: string;
    assigned_to?: string;
    close_date?: dayjs.Dayjs;
    campaign?: string;
};

const salesStageOptions = [
    "Qualification",
    "Needs Analysis",
    "Value Proposition",
    "Proposal",
    "Negotiation",
    "Closed Won",
    "Closed Lost",
];

const followupTypeOptions = ["Call", "Email", "Meeting", "Demo", "WhatsApp"];
const currencyOptions = ["₹ (INR)", "$ (USD)", "AED"];
const GST_OPTIONS = [0, 5, 12, 18, 28];

const DEFAULT_LINE_ITEM: LineItem = {
    key: crypto.randomUUID(),
    quantity: 1,
    price: 0,
    discount: 0,
    tax: 18,
    cgst: 0,
    sgst: 0,
    amount: 0,
};

export default function CreateOpportunityPage() {
    const [form] = Form.useForm<FormValues>();
    const dispatch = useDispatch<AppDispatch>();
    const navigate = useNavigate();

    const [organization, setOrganization] = useState<OrganizationItem[]>([]);
    const [orgModalOpen, setOrgModalOpen] = useState(false);
    const [orgLoading, setOrgLoading] = useState(false);
    const [contactOptions, setContactOptions] = useState<any[]>([]);
    const [saving, setSaving] = useState(false);
    const [lineItems, setLineItems] = useState<LineItem[]>([DEFAULT_LINE_ITEM]);

    const users = useSelector((state: any) => state.users?.userList || []);
    const products = useSelector(
        (state: any) =>
            state.products?.productList ||
            state.products?.products ||
            state.products?.data ||
            []
    );
    const fetchOrganizations = useCallback(
        async (selectedOrgId?: string) => {
            try {
                setOrgLoading(true);

                const res = await dispatch(getOrganization()).unwrap();
                const orgList = res?.data || [];

                setOrganization(orgList);

                if (selectedOrgId) {
                    form.setFieldValue("organization_name", selectedOrgId);
                }

                return orgList;
            } catch {
                message.error("Failed to load organizations");
                return [];
            } finally {
                setOrgLoading(false);
            }
        },
        [dispatch, form],
    );

    useEffect(() => {
        fetchOrganizations();
        fetchContactsFn();
        dispatch(getUsers());
        dispatch(getProducts({}));
    }, [fetchOrganizations, dispatch]);

    const fetchContactsFn = async () => {
        try {
            const res = await dispatch(fetchContacts()).unwrap();
            setContactOptions(res.data || []);
        } catch {
            message.error("Failed to load contacts");
        }
    };



    const calculateLineItem = (item: LineItem) => {
        const quantity = Number(item.quantity || 0);
        const price = Number(item.price || 0);
        const discount = Number(item.discount || 0);
        const tax = Number(item.tax || 0);

        const baseAmount = quantity * price;
        const taxableAmount = Math.max(baseAmount - discount, 0);
        const gstAmount = (taxableAmount * tax) / 100;

        return {
            cgst: gstAmount / 2,
            sgst: gstAmount / 2,
            amount: taxableAmount + gstAmount,
        };
    };

    const handleContactChange = (contactId: string) => {
        const selectedContact = contactOptions.find(
            (contact: any) => contact.id === contactId
        );

        if (!selectedContact) return;

        form.setFieldsValue({
            contact_name: contactId,
            contact_number: selectedContact.mobile || undefined,
            contact_email: selectedContact.email || undefined,
            organization_name: selectedContact.organization_id || undefined,
        });
    };

    const addLineItem = () => {
        setLineItems((prev) => [
            ...prev,
            {
                key: crypto.randomUUID(),
                quantity: 1,
                price: 0,
                discount: 0,
                tax: 18,
                cgst: 0,
                sgst: 0,
                amount: 0,
            },
        ]);
    };

    const removeLineItem = (key: string) => {
        setLineItems((prev) => prev.filter((item) => item.key !== key));
    };

    const updateLineItem = (
        key: string,
        field: keyof LineItem,
        value: string | number | undefined
    ) => {
        setLineItems((prev) =>
            prev.map((item) => {
                if (item.key !== key) return item;

                const updated: LineItem = {
                    ...item,
                    [field]: value,
                };

                const calc = calculateLineItem(updated);

                return {
                    ...updated,
                    ...calc,
                };
            })
        );
    };

    const safeNumber = (value: any, fallback = 0) => {
        const num = Number(value);
        return Number.isFinite(num) ? num : fallback;
    };

    const getProductTax = (product: any) => {
        return safeNumber(
            product?.tax_percentage ??
            product?.tax_percent ??
            product?.gst_percentage ??
            product?.gst_percent ??
            product?.tax ??
            product?.gst ??
            product?.tax,
            18
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

                const updated: LineItem = {
                    ...item,
                    product_id: productId,
                    product_name: product?.name || product?.product_name || "",
                    sku: product?.sku || product?.part_no || "",
                    price: Number(
                        product?.sale_price ||
                        product?.selling_price ||
                        product?.price ||
                        product?.unit_price ||
                        0
                    ),
                    tax: getProductTax(product),
                    quantity: item.quantity || 1,
                    discount: item.discount || 0,
                };

                const calc = calculateLineItem(updated);

                return {
                    ...updated,
                    ...calc,
                };
            })
        );
    };

    const totals = useMemo(() => {
        return lineItems.reduce(
            (acc, item) => {
                const quantity = Number(item.quantity || 0);
                const price = Number(item.price || 0);
                const discount = Number(item.discount || 0);
                const baseAmount = quantity * price;

                acc.subtotal += baseAmount;
                acc.discount += discount;
                acc.cgst += Number(item.cgst || 0);
                acc.sgst += Number(item.sgst || 0);
                acc.tax += Number(item.cgst || 0) + Number(item.sgst || 0);
                acc.grandTotal += Number(item.amount || 0);

                return acc;
            },
            {
                subtotal: 0,
                discount: 0,
                cgst: 0,
                sgst: 0,
                tax: 0,
                grandTotal: 0,
            }
        );
    }, [lineItems]);

    useEffect(() => {
        form.setFieldsValue({
            opportunity_amount: totals.grandTotal,
        });
    }, [totals.grandTotal, form]);

    const columns: ColumnsType<LineItem> = useMemo(
        () => [
            {
                title: "Product",
                dataIndex: "product_id",
                width: 260,
                render: (_, record) => (
                    <Select
                        showSearch
                        allowClear
                        placeholder="Select product"
                        value={record.product_id}
                        optionFilterProp="label"
                        style={{ width: "100%" }}
                        options={products.map((product: any) => ({
                            label: product.name || product.product_name,
                            value: product.id,
                        }))}
                        onChange={(value) => handleProductChange(record.key, value)}
                    />
                ),
            },
            // {
            //     title: "SKU",
            //     dataIndex: "sku",
            //     width: 140,
            //     render: (_, record) => <Input value={record.sku} readOnly />,
            // },
            {
                title: "Qty",
                dataIndex: "quantity",
                width: 100,
                render: (_, record) => (
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
                render: (_, record) => (
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
                render: (_, record) => (
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
                render: (_, record) => (
                    <Select
                        value={Number.isFinite(Number(record.tax)) ? Number(record.tax) : 18}
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
                render: (_, record) => `₹${Number(record.cgst || 0).toFixed(2)}`,
            },
            {
                title: "SGST",
                dataIndex: "sgst",
                width: 120,
                render: (_, record) => `₹${Number(record.sgst || 0).toFixed(2)}`,
            },
            {
                title: "Amount",
                dataIndex: "amount",
                width: 140,
                render: (_, record) => (
                    <Text strong>₹{Number(record.amount || 0).toFixed(2)}</Text>
                ),
            },
            {
                title: "",
                key: "action",
                width: 70,
                fixed: "right",
                render: (_, record) => (
                    <Button
                        danger
                        icon={<DeleteOutlined />}
                        onClick={() => removeLineItem(record.key)}
                        disabled={lineItems.length === 1}
                    />
                ),
            },
        ],
        [lineItems, products]
    );

    const onFinish = async (values: FormValues) => {
        try {
            setSaving(true);

            const payload = {
                name: values.opportunity_name || "",
                sales_stage: values.sales_stage || null,
                amount: totals.grandTotal || values.opportunity_amount || null,
                currency: values.opportunity_amount_currency || null,
                close_date: values.close_date
                    ? values.close_date.format("YYYY-MM-DD")
                    : null,
                phone: values.contact_number || null,
                email: values.contact_email || null,

                organization_name: values.organization_name || null,
                contact_name: values.contact_name || null,
                contact_number: values.contact_number || null,
                contact_email: values.contact_email || null,
                lead_source: values.lead_source || null,
                company: values.company || null,
                type: values.type || null,
                dealer_organization: values.dealer_organization || null,
                probability: values.probability ?? null,
                next_step: values.next_step || null,
                dealer_contact: values.dealer_contact || null,
                expected_close_date: values.expected_close_date
                    ? values.expected_close_date.format("YYYY-MM-DD")
                    : null,
                followup_type: values.followup_type || null,
                assigned_to: values.assigned_to || null,
                next_followup: values.next_followup
                    ? values.next_followup.format("YYYY-MM-DD HH:mm:ss")
                    : null,
                add_description: values.add_description || null,
                description: values.description || null,
                campaign: values.campaign || null,

                subtotal: totals.subtotal,
                discount: totals.discount,
                tax: totals.tax,
                cgst: totals.cgst,
                sgst: totals.sgst,
                grand_total: totals.grandTotal,

                line_items: lineItems.map(({ key, ...item }) => {
                    const quantity = Number(item.quantity || 0);
                    const price = Number(item.price || 0);
                    const discount = Number(item.discount || 0);
                    const taxRate = Number(item.tax || 0);

                    const baseAmount = quantity * price;
                    const taxableAmount = Math.max(baseAmount - discount, 0);
                    const taxAmount = (taxableAmount * taxRate) / 100;
                    const total = taxableAmount + taxAmount;

                    return {
                        product_id: item.product_id || null,
                        product_name: item.product_name || null,
                        part_no: item.sku || null,

                        qty: quantity,
                        list_price: price,
                        discount,
                        discount_type: "Flat",
                        sale_price: taxableAmount,

                        tax_type: "GST",
                        tax_amount: taxAmount,
                        tax: taxRate,
                        total,
                    };
                }),
            };

            const res = await dispatch(createOpportunity(payload as never)).unwrap();
            message.success(res?.message || "Opportunity created successfully");
            dispatch(resetOpportunitiesState());
            navigate(-1);
        } catch (error: unknown) {
            message.error(
                typeof error === "string" ? error : "Failed to create opportunity"
            );
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="op-create-page">
            <div
                className="op-create-header"
                style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                }}
            >
                <div>
                    <Title level={4} className="op-create-title">
                        Create Opportunity
                    </Title>
                </div>

                <Space>
                    <Button onClick={() => navigate(-1)}>Cancel</Button>
                    <Button type="primary" loading={saving} onClick={() => form.submit()}>
                        Save
                    </Button>
                </Space>
            </div>

            <Divider />

            <Form<FormValues>
                form={form}
                layout="vertical"
                onFinish={onFinish}
                initialValues={{
                    sales_stage: "Qualification",
                    opportunity_amount_currency: "₹ (INR)",
                }}
            >
                <Tabs
                    defaultActiveKey="details"
                    destroyInactiveTabPane={false}
                    items={[
                        {
                            key: "details",
                            label: "Opportunity Details",
                            children: (
                                <>
                                    <Row gutter={[20, 6]}>
                                        <Col xs={24} md={8}>
                                            <Form.Item
                                                label="Opportunity Name"
                                                name="opportunity_name"
                                                rules={[
                                                    { required: true, message: "Please enter opportunity name" },
                                                ]}
                                            >
                                                <Input placeholder="Enter opportunity name" />
                                            </Form.Item>
                                        </Col>

                                        <Col xs={24} md={8}>
                                            <Form.Item
                                                label="Sales Person"
                                                name="contact_name"
                                                rules={[{ required: true, message: "Please select contact" }]}
                                            >
                                                <Select
                                                    onChange={handleContactChange}
                                                    onClear={() => {
                                                        form.setFieldsValue({
                                                            contact_name: undefined,
                                                            contact_number: undefined,
                                                            contact_email: undefined,
                                                        });
                                                    }}
                                                    placeholder="Select contact"
                                                    allowClear
                                                    showSearch
                                                    optionFilterProp="label"
                                                    options={contactOptions?.map((contact: any) => ({
                                                        label: `${toTitleCase(contact.first_name || "")} ${toTitleCase(contact.last_name || "")}`.trim(),
                                                        value: contact.id,
                                                    }))}
                                                />
                                            </Form.Item>
                                        </Col>

                                        <Col xs={24} md={8}>
                                            <Form.Item
                                                label="Organization Name"
                                                name="organization_name"
                                                rules={[
                                                    { required: true, message: "Please select organization" },
                                                ]}
                                            >
                                                <Select
                                                    showSearch
                                                    allowClear
                                                    loading={orgLoading}
                                                    placeholder="Select organization"
                                                    optionFilterProp="label"
                                                    options={organization.map((org) => ({
                                                        label: toTitleCase(org.name),
                                                        value: org.id,
                                                    }))}
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
                                            <Form.Item label="Contact Number" name="contact_number">
                                                <Input placeholder="Enter contact number" />
                                            </Form.Item>
                                        </Col>

                                        <Col xs={24} md={8}>
                                            <Form.Item label="Contact Email" name="contact_email">
                                                <Input placeholder="Enter contact email" />
                                            </Form.Item>
                                        </Col>

                                        <Col xs={24} md={8}>
                                            <Form.Item label="Lead Source" name="lead_source">
                                                <Input placeholder="Enter lead source" />
                                            </Form.Item>
                                        </Col>

                                        <Col xs={24} md={8}>
                                            <Form.Item label="Company" name="company">
                                                <Input placeholder="My company" />
                                            </Form.Item>
                                        </Col>

                                        <Col xs={24} md={8}>
                                            <Form.Item label="Probability (%)" name="probability">
                                                <InputNumber min={0} max={100} style={{ width: "100%" }} />
                                            </Form.Item>
                                        </Col>

                                        <Col xs={24} md={8}>
                                            <Form.Item
                                                label="Sales Stage"
                                                name="sales_stage"
                                            // rules={[
                                            //     { required: true, message: "Please select sales stage" },
                                            // ]}
                                            >
                                                <Select placeholder="Select sales stage">
                                                    {salesStageOptions.map((item) => (
                                                        <Option key={item} value={item}>
                                                            {item}
                                                        </Option>
                                                    ))}
                                                </Select>
                                            </Form.Item>
                                        </Col>

                                        <Col xs={24} md={8}>
                                            <Form.Item label="Type" name="type">
                                                <Select placeholder="Select type" allowClear>
                                                    <Option value="New Business">New Business</Option>
                                                    <Option value="Existing Business">Existing Business</Option>
                                                </Select>
                                            </Form.Item>
                                        </Col>

                                        <Col xs={24} md={8}>
                                            <Form.Item label="Dealer Contact" name="dealer_contact">
                                                <Input placeholder="Enter dealer contact" />
                                            </Form.Item>
                                        </Col>

                                        <Col xs={24} md={8}>
                                            <Form.Item
                                                label="Expected Close Date"
                                                name="expected_close_date"
                                            // rules={[
                                            //     {
                                            //         required: true,
                                            //         message: "Please select expected close date",
                                            //     },
                                            // ]}
                                            >
                                                <DatePicker
                                                    style={{ width: "100%" }}
                                                    format="DD/MM/YYYY"
                                                    suffixIcon={<CalendarOutlined />}
                                                />
                                            </Form.Item>
                                        </Col>

                                        <Col xs={24} md={8}>
                                            <Form.Item label="Opportunity Amount">
                                                <Input.Group compact>
                                                    <Form.Item name="opportunity_amount_currency" noStyle>
                                                        <Select style={{ width: "28%" }}>
                                                            {currencyOptions.map((item) => (
                                                                <Option key={item} value={item}>
                                                                    {item}
                                                                </Option>
                                                            ))}
                                                        </Select>
                                                    </Form.Item>

                                                    <Form.Item name="opportunity_amount" noStyle>
                                                        <InputNumber
                                                            min={0}
                                                            readOnly
                                                            style={{ width: "72%" }}
                                                            placeholder="Auto from items"
                                                        />
                                                    </Form.Item>
                                                </Input.Group>
                                            </Form.Item>
                                        </Col>

                                        <Col xs={24} md={8}>
                                            <Form.Item
                                                label="Next Followup"
                                                name="next_followup"
                                            // rules={[
                                            //     { required: true, message: "Please select next followup" },
                                            // ]}
                                            >
                                                <DatePicker
                                                    showTime={{ format: "hh:mm a", use12Hours: true }}
                                                    style={{ width: "100%" }}
                                                    format="DD/MM/YYYY hh:mm a"
                                                    suffixIcon={<CalendarOutlined />}
                                                />
                                            </Form.Item>
                                        </Col>

                                        <Col xs={24} md={8}>
                                            <Form.Item label="Followup Type" name="followup_type">
                                                <Select placeholder="Select followup type" allowClear>
                                                    {followupTypeOptions.map((item) => (
                                                        <Option key={item} value={item}>
                                                            {item}
                                                        </Option>
                                                    ))}
                                                </Select>
                                            </Form.Item>
                                        </Col>

                                        <Col xs={24} md={8}>
                                            <Form.Item label="Description" name="description">
                                                <TextArea rows={5} placeholder="Enter description" />
                                            </Form.Item>
                                        </Col>

                                        <Col xs={24} md={8}>
                                            <Form.Item label="Assigned To" name="assigned_to">
                                                <Select
                                                    placeholder="Select assignee"
                                                    allowClear
                                                    showSearch
                                                    optionFilterProp="label"
                                                    options={users?.map((user: any) => ({
                                                        value: user.id,
                                                        label: toTitleCase(user.name || user.full_name || user.email),
                                                    }))}
                                                />
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
                                        <Table<LineItem>
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
                                </>
                            ),
                        },
                    ]}
                />

                <Divider />
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
                    onSubmit={async (values?: any) => {
                        setOrgModalOpen(false);

                        await fetchOrganizations();
                        form.setFieldsValue({
                            organization_name: values?.id,
                        });

                        // message.success("Organization created successfully");
                    }}
                />
            </Modal>
        </div>
    );
}