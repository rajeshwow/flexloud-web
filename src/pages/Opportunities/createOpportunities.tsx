import {
    CalendarOutlined,
    DeleteOutlined,
    PlusOutlined,
} from "@ant-design/icons";
import {
    Button,
    Col,
    DatePicker,
    Divider,
    Form,
    Input,
    InputNumber,
    Row,
    Select,
    Space,
    Table,
    Typography,
    message
} from "antd";
import type { ColumnsType } from "antd/es/table";
import dayjs from "dayjs";
import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { fetchContacts } from "../../redux/reducers/contacts.slice";
import {
    createOpportunity,
    resetOpportunitiesState,
} from "../../redux/reducers/opportunities.slice";
import { getOrganization, type OrganizationItem } from "../../redux/reducers/organization.slice";
import { getUsers } from "../../redux/reducers/user.slice";
import type { AppDispatch } from "../../redux/store";
import { toTitleCase } from "../../shared/Utils/utils";
// import "./create-opportunity.css";

const { Title, Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;

type LineItem = {
    key: string;
    qty?: number;
    product_name?: string;
    part_no?: string;
    list_price?: number;
    discount?: number;
    discount_type?: string;
    sale_price?: number;
    tax_type?: string;
    tax_amount?: number;
    tax_rate?: number;
    total?: number;
};

type FormValues = {
    // opportunity_number?: string;
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
    product_category?: string;
    probability?: number;
    next_step?: string;
    dealer_contact?: string;
    expected_close_date?: dayjs.Dayjs;
    followup_type?: string;
    description?: string;
    assigned_to?: string;
    close_date?: dayjs.Dayjs;

    campaign?: string;
    date_created?: string;
    date_modified?: string;
    create_quote?: string;
    opportunity_flag?: string;
    how_old?: string;
    untouched_since?: string;
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
const discountTypeOptions = ["Flat", "Percentage"];
const taxTypeOptions = ["GST", "IGST", "CGST/SGST", "None"];
const currencyOptions = ["₹ (INR)", "$ (USD)", "AED"];

export default function CreateOpportunityPage() {
    const [form] = Form.useForm<FormValues>();
    const dispatch = useDispatch<AppDispatch>();
    const navigate = useNavigate();

    const [organization, setOrganization] = useState<OrganizationItem[]>([]);
    const [contactOptions, setContactOptions] = useState<Array<{ label: string; value: string }>>([]);

    const users = useSelector((state: any) => state.users?.userList);

    useEffect(() => {
        fetchOrganizations();
        fetchContactsFn();
        dispatch(getUsers());
    }, []);

    const fetchContactsFn = async () => {
        try {
            // setOrgLoading(true);
            const res = await dispatch(fetchContacts()).unwrap();
            setContactOptions(res.data || []);
        } catch (error) {
            message.error("Failed to load contacts");
        } finally {
            // setOrgLoading(false);
        }
    };

    const fetchOrganizations = async () => {
        try {
            // setOrgLoading(true);
            const res = await dispatch(getOrganization()).unwrap();
            setOrganization(res.data || []);
        } catch (error) {
            message.error("Failed to load organizations");
        } finally {
            // setOrgLoading(false);
        }
    };

    const [saving, setSaving] = useState(false);
    const [lineItems, setLineItems] = useState<LineItem[]>([
        {
            key: crypto.randomUUID(),
            qty: 1,
        },
    ]);

    const addLineItem = () => {
        setLineItems((prev) => [
            ...prev,
            {
                key: crypto.randomUUID(),
                qty: 1,
            },
        ]);
    };

    const handleContactChange = (contactId: string) => {
        const selectedContact = contactOptions.find((contact: any) => contact.id === contactId) as any;

        if (!selectedContact) return;

        form.setFieldsValue({
            contact_name: contactId,
            contact_number: selectedContact.mobile || undefined,
            contact_email: selectedContact.email || undefined,
            organization_name: selectedContact.organization_id || undefined,

        });
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

                const updated = {
                    ...item,
                    [field]: value,
                };

                const qty = Number(updated.qty || 0);
                const listPrice = Number(updated.list_price || 0);
                const discount = Number(updated.discount || 0);
                const taxAmount = Number(updated.tax_amount || 0);

                let discountedPrice = listPrice;

                if (updated.discount_type === "Percentage") {
                    discountedPrice = listPrice - (listPrice * discount) / 100;
                } else if (updated.discount_type === "Flat") {
                    discountedPrice = listPrice - discount;
                }

                const salePrice = discountedPrice > 0 ? discountedPrice : 0;
                const total = qty * salePrice + taxAmount;

                return {
                    ...updated,
                    sale_price: Number.isFinite(salePrice) ? salePrice : 0,
                    total: Number.isFinite(total) ? total : 0,
                };
            })
        );
    };

    const productCategory = [
        {
            id: "1",
            name: "Product Category 1",
        },
        {
            id: "2",
            name: "Product Category 2",
        },
        {
            id: "3",
            name: "Product Category 3",
        },
    ];

    const columns: ColumnsType<LineItem> = useMemo(
        () => [
            {
                title: "Qty",
                dataIndex: "qty",
                key: "qty",
                width: 90,
                render: (_, record) => (
                    <InputNumber
                        min={1}
                        value={record.qty}
                        onChange={(value) =>
                            updateLineItem(record.key, "qty", typeof value === "number" ? value : 1)
                        }
                        style={{ width: "100%" }}
                    />
                ),
            },
            {
                title: "Product Name",
                dataIndex: "product_name",
                key: "product_name",
                width: 180,
                render: (_, record) => (
                    <Input
                        value={record.product_name}
                        onChange={(e) => updateLineItem(record.key, "product_name", e.target.value)}
                    />
                ),
            },
            {
                title: "Part No",
                dataIndex: "part_no",
                key: "part_no",
                width: 140,
                render: (_, record) => (
                    <Input
                        value={record.part_no}
                        onChange={(e) => updateLineItem(record.key, "part_no", e.target.value)}
                    />
                ),
            },
            {
                title: "List Price",
                dataIndex: "list_price",
                key: "list_price",
                width: 130,
                render: (_, record) => (
                    <InputNumber
                        min={0}
                        value={record.list_price}
                        onChange={(value) =>
                            updateLineItem(
                                record.key,
                                "list_price",
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
                key: "discount",
                width: 120,
                render: (_, record) => (
                    <InputNumber
                        min={0}
                        value={record.discount}
                        onChange={(value) =>
                            updateLineItem(record.key, "discount", typeof value === "number" ? value : 0)
                        }
                        style={{ width: "100%" }}
                    />
                ),
            },
            {
                title: "Discount Type",
                dataIndex: "discount_type",
                key: "discount_type",
                width: 150,
                render: (_, record) => (
                    <Select
                        value={record.discount_type}
                        onChange={(value) => updateLineItem(record.key, "discount_type", value)}
                        allowClear
                        style={{ width: "100%" }}
                    >
                        {discountTypeOptions.map((item) => (
                            <Option key={item} value={item}>
                                {item}
                            </Option>
                        ))}
                    </Select>
                ),
            },
            {
                title: "Sale Price",
                dataIndex: "sale_price",
                key: "sale_price",
                width: 130,
                render: (_, record) => (
                    <InputNumber
                        min={0}
                        value={record.sale_price}
                        onChange={(value) =>
                            updateLineItem(
                                record.key,
                                "sale_price",
                                typeof value === "number" ? value : 0
                            )
                        }
                        style={{ width: "100%" }}
                    />
                ),
            },
            {
                title: "Tax Type",
                dataIndex: "tax_type",
                key: "tax_type",
                width: 130,
                render: (_, record) => (
                    <Select
                        value={record.tax_type}
                        onChange={(value) => updateLineItem(record.key, "tax_type", value)}
                        allowClear
                        style={{ width: "100%" }}
                    >
                        {taxTypeOptions.map((item) => (
                            <Option key={item} value={item}>
                                {item}
                            </Option>
                        ))}
                    </Select>
                ),
            },
            {
                title: "Tax Amount",
                dataIndex: "tax_amount",
                key: "tax_amount",
                width: 130,
                render: (_, record) => (
                    <InputNumber
                        min={0}
                        value={record.tax_amount}
                        onChange={(value) =>
                            updateLineItem(
                                record.key,
                                "tax_amount",
                                typeof value === "number" ? value : 0
                            )
                        }
                        style={{ width: "100%" }}
                    />
                ),
            },
            {
                title: "Tax Rate",
                dataIndex: "tax_rate",
                key: "tax_rate",
                width: 120,
                render: (_, record) => (
                    <InputNumber
                        min={0}
                        max={100}
                        value={record.tax_rate}
                        onChange={(value) =>
                            updateLineItem(record.key, "tax_rate", typeof value === "number" ? value : 0)
                        }
                        style={{ width: "100%" }}
                    />
                ),
            },
            {
                title: "Total",
                dataIndex: "total",
                key: "total",
                width: 130,
                render: (_, record) => (
                    <InputNumber value={record.total} readOnly style={{ width: "100%" }} />
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
        [lineItems]
    );

    const onFinish = async (values: FormValues) => {
        try {
            setSaving(true);

            const payload = {
                // opportunity_number: values.opportunity_number || "",
                name: values.opportunity_name || "",
                sales_stage: values.sales_stage || null,
                amount: values.opportunity_amount || null,
                close_date: values.close_date ? values.close_date.format("YYYY-MM-DD") : null,
                phone: values.contact_number || null,
                email: values.contact_email || null,

                organization_name: values.organization_name || null,
                contact_name: values.contact_name || null,
                lead_source: values.lead_source || null,
                company: values.company || null,
                type: values.type || null,
                dealer_organization: values.dealer_organization || null,
                probability: values.probability || null,
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
                line_items: lineItems,
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
            <div className="op-create-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>

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
                    create_quote: "No",
                }}
            >
                {/* <Card className="op-card" title="Opportunity Information"> */}
                <Row gutter={[20, 6]}>
                    {/* <Col xs={24} md={8}>
                        <Form.Item label="Opportunity Number" name="opportunity_number">
                            <Input placeholder="Enter opportunity number" />
                        </Form.Item>
                    </Col> */}

                    <Col xs={24} md={8}>
                        <Form.Item
                            label="Opportunity Name"
                            name="opportunity_name"
                            rules={[{ required: true, message: "Please enter opportunity name" }]}
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
                            <Select onChange={handleContactChange}
                                onClear={() => {
                                    form.setFieldsValue({
                                        contact_name: undefined,
                                        contact_number: undefined,
                                        contact_email: undefined,
                                    });
                                }} placeholder="Select contact" allowClear showSearch options={contactOptions?.map((contact: any) => ({
                                    label: contact.first_name + " " + contact.last_name,
                                    value: contact.id,
                                }))} />
                        </Form.Item>
                    </Col>

                    <Col xs={24} md={8}>
                        <Form.Item
                            label="Organization Name"
                            name="organization_name"
                            rules={[{ required: true, message: "Please select organization" }]}
                        >
                            <Select
                                showSearch
                                allowClear
                                // loading={orgLoading}
                                placeholder="Select organization"
                                optionFilterProp="label"
                                options={organization.map((org) => ({
                                    label: toTitleCase(org.name),
                                    value: org.id,
                                }))}
                            />                            </Form.Item>
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

                    {/* <Col xs={24} md={8}>
                        <Form.Item
                            label="Product Category"
                            name="product_category"
                            rules={[{ required: true, message: "Please select product category" }]}
                        >
                            <Select placeholder="Select product category" allowClear showSearch options={productCategory.map((category) => ({
                                label: category.name,
                                value: category.id,
                            }))} />
                        </Form.Item>
                    </Col> */}

                    <Col xs={24} md={8}>
                        <Form.Item
                            label="Company"
                            name="company"
                        // rules={[{ required: true, message: "Please enter company" }]}
                        >
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

                    {/* <Col xs={24} md={8}>
                        <Form.Item label="Next Step" name="next_step">
                            <Input placeholder="Enter next step" />
                        </Form.Item>
                    </Col> */}

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

                    {/* <Col xs={24} md={8}>
                        <Form.Item label="Dealer Organization" name="dealer_organization">
                            <Select placeholder="Select dealer organization" allowClear showSearch />
                        </Form.Item>
                    </Col> */}

                    <Col xs={24} md={8}>
                        <Form.Item
                            label="Expected Close Date"
                            name="expected_close_date"
                            rules={[{ required: true, message: "Please select expected close date" }]}
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
                                        placeholder="Enter amount"
                                    />
                                </Form.Item>
                            </Input.Group>
                        </Form.Item>
                    </Col>

                    <Col xs={24} md={8}>
                        <Form.Item
                            label="Next Followup"
                            name="next_followup"
                            rules={[{ required: true, message: "Please select next followup" }]}
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
                            <Select placeholder="Select assignee" allowClear showSearch options={users?.map((user: any) => ({
                                value: user.id,
                                label: toTitleCase(user.name),
                            }))} />
                        </Form.Item>
                    </Col>


                </Row>
                {/* </Card> */}

                {/* <Card
                    className="op-card"
                    title="Line Items"
                    extra={
                        <Button type="primary" icon={<PlusOutlined />} onClick={addLineItem}>
                            Add Item
                        </Button>
                    }
                > */}
                <Divider />
                <div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                        <Title level={5}>Line Items</Title>
                        <Button type="primary" icon={<PlusOutlined />} onClick={addLineItem}>
                            Add Item
                        </Button>
                    </div>
                    <Table<LineItem>
                        rowKey="key"
                        columns={columns}
                        dataSource={lineItems}
                        pagination={false}
                        scroll={{ x: 1400 }}
                        className="op-line-table"
                    />
                </div>

                <Divider />



                {/* </Card> */}
            </Form>
        </div>
    );
}