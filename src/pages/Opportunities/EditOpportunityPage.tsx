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
    message,
    Row,
    Select,
    Space,
    Spin,
    Table,
    Typography,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import dayjs from "dayjs";
import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";

import { fetchContacts } from "../../redux/reducers/contacts.slice";
import {
    getOpportunityById,
    resetOpportunitiesState,
    updateOpportunity,
} from "../../redux/reducers/opportunities.slice";
import {
    getOrganization,
    type OrganizationItem,
} from "../../redux/reducers/organization.slice";
import { getProducts } from "../../redux/reducers/products.slice";
import { getUsers } from "../../redux/reducers/user.slice";
import type { AppDispatch } from "../../redux/store";
import { toTitleCase } from "../../shared/Utils/utils";

const { Title, Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;

type LineItem = {
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
const currencyOptions = ["₹ (INR)"];
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

export default function EditOpportunityPage() {
    const [form] = Form.useForm<FormValues>();
    const dispatch = useDispatch<AppDispatch>();
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();

    const [organization, setOrganization] = useState<OrganizationItem[]>([]);
    const [contactOptions, setContactOptions] = useState<any[]>([]);
    const [saving, setSaving] = useState(false);
    const [pageLoading, setPageLoading] = useState(true);

    const [lineItems, setLineItems] = useState<LineItem[]>([DEFAULT_LINE_ITEM]);

    const users = useSelector((state: any) => state.users?.userList || []);
    const products = useSelector(
        (state: any) =>
            state.products?.productList ||
            state.products?.products ||
            state.products?.data ||
            []
    );

    useEffect(() => {
        loadInitialData();
    }, [id]);

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

    const normalizeLineItem = (item: any): LineItem => {
        const prepared: LineItem = {
            key: item.id || crypto.randomUUID(),
            id: item.id,
            product_id: item.product_id,
            product_name: item.product_name || item.name || "",
            sku: item.sku || item.part_no || "",
            quantity: Number(item.quantity || item.qty || 1),
            price: Number(item.list_price || 0),
            discount: Number(item.discount || 0),
            tax: Number(item.tax || 18),
            cgst: Number(item.cgst || 0),
            sgst: Number(item.sgst || 0),
            amount: Number(item.amount || item.total || 0),
        };

        const calc = calculateLineItem(prepared);

        return {
            ...prepared,
            cgst: prepared.cgst || calc.cgst,
            sgst: prepared.sgst || calc.sgst,
            amount: prepared.amount || calc.amount,
        };
    };

    const loadInitialData = async () => {
        if (!id) return;

        try {
            setPageLoading(true);

            const [orgRes, contactRes, oppRes] = await Promise.all([
                dispatch(getOrganization()).unwrap(),
                dispatch(fetchContacts()).unwrap(),
                dispatch(getOpportunityById(id)).unwrap(),
                dispatch(getUsers()).unwrap(),
                dispatch(getProducts({})).unwrap(),
            ]);

            const orgList = orgRes?.data || [];
            const contacts = contactRes?.data || [];
            const opportunity = oppRes?.data;

            setOrganization(orgList);
            setContactOptions(contacts);

            form.setFieldsValue({
                opportunity_name: opportunity?.name || "",
                contact_name: opportunity?.contact_name || undefined,
                organization_name: opportunity?.organization_name || undefined,
                contact_number: opportunity?.contact_number || opportunity?.phone || "",
                contact_email: opportunity?.contact_email || opportunity?.email || "",
                lead_source: opportunity?.lead_source || undefined,
                company: opportunity?.company || "",
                probability: opportunity?.probability ?? undefined,
                sales_stage: opportunity?.sales_stage || "Qualification",
                type: opportunity?.type || undefined,
                dealer_contact: opportunity?.dealer_contact || "",
                expected_close_date: opportunity?.expected_close_date
                    ? dayjs(opportunity.expected_close_date)
                    : undefined,
                opportunity_amount_currency: opportunity?.currency || "₹",
                opportunity_amount: opportunity?.amount ?? undefined,
                next_followup: opportunity?.next_followup
                    ? dayjs(opportunity.next_followup)
                    : undefined,
                followup_type: opportunity?.followup_type || undefined,
                description: opportunity?.description || "",
                assigned_to: opportunity?.assigned_to || undefined,
                campaign: opportunity?.campaign || "",
                add_description: opportunity?.add_description || "",
                next_step: opportunity?.next_step || "",
                close_date: opportunity?.close_date
                    ? dayjs(opportunity.close_date)
                    : undefined,
            });

            const mappedLineItems =
                opportunity?.line_items?.length > 0
                    ? opportunity.line_items.map(normalizeLineItem)
                    : [{ ...DEFAULT_LINE_ITEM, key: crypto.randomUUID() }];

            setLineItems(mappedLineItems);
        } catch (error) {
            message.error(
                typeof error === "string" ? error : "Failed to load opportunity"
            );
            navigate(-1);
        } finally {
            setPageLoading(false);
        }
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
                    tax: Number(product?.tax || product?.gst || 18),
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
                const amount = Number(item.amount || 0);
                const cgst = Number(item.cgst || 0);
                const sgst = Number(item.sgst || 0);
                const taxAmount = cgst + sgst;

                acc.subtotal += amount - taxAmount;
                acc.discount += Number(item.discount || 0);
                acc.cgst += cgst;
                acc.sgst += sgst;
                acc.tax += taxAmount;
                acc.grandTotal += amount;

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
        if (!id) return;

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

                line_items: lineItems.map(({ key, id: lineItemId, ...item }) => ({
                    id: lineItemId,
                    product_id: item.product_id || null,
                    product_name: item.product_name || null,
                    sku: item.sku || null,
                    quantity: Number(item.quantity || 0),
                    price: Number(item.price || 0),
                    discount: Number(item.discount || 0),
                    tax: Number(item.tax || 0),
                    cgst: Number(item.cgst || 0),
                    sgst: Number(item.sgst || 0),
                    amount: Number(item.amount || 0),
                })),
            };

            const res = await dispatch(
                updateOpportunity({ id, payload } as never)
            ).unwrap();

            message.success(res?.message || "Opportunity updated successfully");
            dispatch(resetOpportunitiesState());
            navigate(-1);
        } catch (error: unknown) {
            message.error(
                typeof error === "string" ? error : "Failed to update opportunity"
            );
        } finally {
            setSaving(false);
        }
    };

    if (pageLoading) {
        return (
            <div style={{ padding: 40, textAlign: "center" }}>
                <Spin />
            </div>
        );
    }

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
                <Title level={4} className="op-create-title">
                    Edit Opportunity
                </Title>

                <Space>
                    <Button onClick={() => navigate(-1)}>Cancel</Button>
                    <Button type="primary" loading={saving} onClick={() => form.submit()}>
                        Update
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
                    opportunity_amount_currency: "₹",
                }}
            >
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
                                    label: `${toTitleCase(contact.first_name || "")} ${toTitleCase(contact.last_name || ""
                                    )}`.trim(),
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
                                placeholder="Select organization"
                                optionFilterProp="label"
                                options={organization.map((org) => ({
                                    label: toTitleCase(org.name),
                                    value: org.id,
                                }))}
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
                            rules={[{ required: true, message: "Please select sales stage" }]}
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
                            rules={[
                                {
                                    required: true,
                                    message: "Please select expected close date",
                                },
                            ]}
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
                                        style={{ width: "72%" }}
                                        placeholder="Auto from items"
                                        value={totals.grandTotal}
                                    />
                                </Form.Item>
                            </Input.Group>
                        </Form.Item>
                    </Col>

                    <Col xs={24} md={8}>
                        <Form.Item
                            label="Next Followup"
                            name="next_followup"
                            rules={[
                                { required: true, message: "Please select next followup" },
                            ]}
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

                    <Col xs={24} md={8}>
                        <Form.Item label="Description" name="description">
                            <TextArea rows={5} placeholder="Enter description" />
                        </Form.Item>
                    </Col>
                </Row>

                <Divider />

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

                <Divider />
            </Form>
        </div>
    );
}