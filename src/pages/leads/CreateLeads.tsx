import { MinusCircleOutlined, PlusOutlined } from "@ant-design/icons";
import {
    Button,
    Card,
    Checkbox,
    Col,
    DatePicker,
    Form,
    Input,
    InputNumber,
    Row,
    Select,
    Space,
    Typography,
    message,
    theme,
} from "antd";
import dayjs from "dayjs";
import { useState } from "react";
import { useDispatch } from "react-redux";
import { createLead } from "../../redux/reducers/leads.slice";
import type { AppDispatch } from "../../redux/store";

const { TextArea } = Input;
const { Title, Text } = Typography;

type SelectOption = {
    label: string;
    value: string;
};

type CreateLeadFormValues = {
    lead_number?: string;
    first_name: string;
    last_name?: string;
    designation?: string;
    industry?: string;
    mobile: string;
    office_phone?: string;
    organization_name?: string;
    emails?: {
        email: string;
        primary?: boolean;
        opt_out?: boolean;
        invalid?: boolean;
    }[];
    dealer_organization?: string;
    priority?: string;
    status?: string;
    product_category?: string;
    requirements?: string;
    next_followup?: dayjs.Dayjs;
    followup?: string;
    followup_type?: string;
    lead_source?: string;
    add_description?: string;
    description?: string;
    assigned_to?: string;
    referred_by?: string;
    opportunity_name?: string;
    opportunity_amount?: number;
    expected_close_date?: dayjs.Dayjs;
    sales_stage?: string;

    primary_address_street?: string;
    primary_address_area?: string;
    primary_address_postalcode?: string;
    primary_address_city?: string;
    primary_address_state?: string;
    primary_address_country?: string;

    alt_address_street?: string;
    alt_address_area?: string;
    alt_address_postalcode?: string;
    alt_address_city?: string;
    alt_address_state?: string;
    alt_address_country?: string;

    copy_address_from_primary?: boolean;
};



const industryOptions: SelectOption[] = [
    { label: "Healthcare", value: "healthcare" },
    { label: "Manufacturing", value: "manufacturing" },
    { label: "Retail", value: "retail" },
    { label: "IT", value: "it" },
];

const dealerOrganizationOptions: SelectOption[] = [
    { label: "Dealer One", value: "dealer-1" },
    { label: "Dealer Two", value: "dealer-2" },
];

const priorityOptions: SelectOption[] = [
    { label: "High", value: "high" },
    { label: "Medium", value: "medium" },
    { label: "Low", value: "low" },
];

const statusOptions: SelectOption[] = [
    { label: "New", value: "new" },
    { label: "Contacted", value: "contacted" },
    { label: "Qualified", value: "qualified" },
    { label: "Closed", value: "closed" },
];

const productCategoryOptions: SelectOption[] = [
    { label: "Category 1", value: "category-1" },
    { label: "Category 2", value: "category-2" },
];

const followupOptions: SelectOption[] = [
    { label: "Call", value: "call" },
    { label: "Email", value: "email" },
    { label: "Meeting", value: "meeting" },
];

const followupTypeOptions: SelectOption[] = [
    { label: "General", value: "general" },
    { label: "Urgent", value: "urgent" },
];

const leadSourceOptions: SelectOption[] = [
    { label: "Website", value: "website" },
    { label: "Referral", value: "referral" },
    { label: "Campaign", value: "campaign" },
    { label: "Direct Call", value: "direct_call" },
];

const assignedToOptions = [
    {
        label: "Artilain",
        value: "9c9d4e7f-124b-4096-b567-5d5bca57e077",
    },
    {
        label: "Raju",
        value: "6e7e2c9c-3e47-4b91-8e6f-b3e6fbbab1b2",
    },
];

const salesStageOptions: SelectOption[] = [
    { label: "Qualification", value: "qualification" },
    { label: "Proposal", value: "proposal" },
    { label: "Negotiation", value: "negotiation" },
    { label: "Won", value: "won" },
    { label: "Lost", value: "lost" },
];

export default function CreateLeadForm() {
    const [form] = Form.useForm<CreateLeadFormValues>();
    const { token } = theme.useToken();
    const [loading, setLoading] = useState(false);
    const dispatch = useDispatch<AppDispatch>();

    const handleFinish = async (values: CreateLeadFormValues) => {
        setLoading(true);

        try {
            const cleanedEmails =
                values.emails
                    ?.filter((item) => item?.email?.trim())
                    .map((item) => ({
                        email: item.email.trim(),
                        primary: !!item.primary,
                        opt_out: !!item.opt_out,
                        invalid: !!item.invalid,
                    })) ?? [];

            const payload = {
                lead_number: values.lead_number?.trim() || undefined,
                first_name: values.first_name?.trim(),
                last_name: values.last_name?.trim() || undefined,
                designation: values.designation?.trim() || undefined,
                industry: values.industry || undefined,
                mobile: values.mobile?.trim(),
                office_phone: values.office_phone?.trim() || undefined,
                organization_name: values.organization_name?.trim() || undefined,

                emails: cleanedEmails,

                dealer_organization: values.dealer_organization || undefined,
                priority: values.priority || undefined,
                status: values.status || undefined,
                product_category: values.product_category || undefined,
                requirements: values.requirements?.trim() || undefined,

                next_followup: values.next_followup
                    ? values.next_followup.toISOString()
                    : undefined,
                followup: values.followup || undefined,
                followup_type: values.followup_type || undefined,
                lead_source: values.lead_source || undefined,

                add_description: values.add_description?.trim() || undefined,
                description: values.description?.trim() || undefined,

                assigned_to: values.assigned_to || undefined,
                referred_by: values.referred_by?.trim() || undefined,

                opportunity_name: values.opportunity_name?.trim() || undefined,
                opportunity_amount:
                    values.opportunity_amount !== undefined &&
                        values.opportunity_amount !== null
                        ? Number(values.opportunity_amount)
                        : undefined,
                expected_close_date: values.expected_close_date
                    ? values.expected_close_date.format("YYYY-MM-DD")
                    : undefined,
                sales_stage: values.sales_stage || undefined,

                primary_address_street: values.primary_address_street?.trim() || undefined,
                primary_address_area: values.primary_address_area?.trim() || undefined,
                primary_address_postalcode:
                    values.primary_address_postalcode?.trim() || undefined,
                primary_address_city: values.primary_address_city?.trim() || undefined,
                primary_address_state: values.primary_address_state?.trim() || undefined,
                primary_address_country:
                    values.primary_address_country?.trim() || undefined,

                alt_address_street: values.alt_address_street?.trim() || undefined,
                alt_address_area: values.alt_address_area?.trim() || undefined,
                alt_address_postalcode:
                    values.alt_address_postalcode?.trim() || undefined,
                alt_address_city: values.alt_address_city?.trim() || undefined,
                alt_address_state: values.alt_address_state?.trim() || undefined,
                alt_address_country: values.alt_address_country?.trim() || undefined,
            } as any;

            const response = await dispatch(createLead(payload)).unwrap();

            if (response?.data) {
                message.success("Lead created successfully", 2);
                form.resetFields();
                form.setFieldsValue({
                    status: "new",
                    sales_stage: "qualification",
                    emails: [
                        { email: "", primary: true, opt_out: false, invalid: false },
                    ],
                });
            } else {
                message.error("Failed to create lead", 2);
            }
        } catch (error: any) {
            message.error(
                error?.message || "Something went wrong while creating lead",
                2
            );
            console.log(error);
        } finally {
            setLoading(false);
        }
    };

    const copyPrimaryAddress = (checked: boolean) => {
        if (!checked) return;

        form.setFieldsValue({
            alt_address_street: form.getFieldValue("primary_address_street"),
            alt_address_area: form.getFieldValue("primary_address_area"),
            alt_address_postalcode: form.getFieldValue("primary_address_postalcode"),
            alt_address_city: form.getFieldValue("primary_address_city"),
            alt_address_state: form.getFieldValue("primary_address_state"),
            alt_address_country: form.getFieldValue("primary_address_country"),
        });
    };

    const sectionCardStyle: React.CSSProperties = {
        borderRadius: 16,
        border: `1px solid ${token.colorBorderSecondary}`,
        background: token.colorBgContainer,
        boxShadow: token.boxShadowTertiary,
    };

    const sectionTitleStyle: React.CSSProperties = {
        marginBottom: 16,
        color: token.colorTextHeading,
        fontSize: 16,
        fontWeight: 700,
    };

    return (
        <div
            style={{
                background: token.colorBgLayout,
                padding: 16,
                borderRadius: 18,
            }}
        >
            <Space
                orientation="vertical"
                size={16}
                style={{ width: "100%" }}
            >
                <div>
                    <Title level={4} style={{ margin: 0 }}>
                        Create Lead
                    </Title>
                    <Text type="secondary">
                        Add lead details, opportunity info, and address information.
                    </Text>
                </div>

                <Form<CreateLeadFormValues>
                    form={form}
                    layout="vertical"
                    onFinish={handleFinish}
                    initialValues={{
                        status: "new",
                        sales_stage: "qualification",
                        emails: [{ email: "", primary: true, opt_out: false, invalid: false }],
                    }}
                >
                    <Space
                        orientation="vertical"
                        size={16}
                        style={{ width: "100%" }}
                    >
                        {/* Basic Details */}
                        <Card style={sectionCardStyle}>
                            <div style={sectionTitleStyle}>Basic Details</div>

                            <Row gutter={[16, 4]}>
                                <Col xs={24} md={12} xl={8}>
                                    <Form.Item label="Lead Number" name="lead_number">
                                        <Input placeholder="Enter lead number" />
                                    </Form.Item>
                                </Col>

                                <Col xs={24} md={12} xl={8}>
                                    <Form.Item
                                        label="First Name"
                                        name="first_name"
                                        rules={[{ required: true, message: "First name is required" }]}
                                    >
                                        <Input placeholder="Enter first name" />
                                    </Form.Item>
                                </Col>

                                <Col xs={24} md={12} xl={8}>
                                    <Form.Item label="Last Name" name="last_name">
                                        <Input placeholder="Enter last name" />
                                    </Form.Item>
                                </Col>

                                <Col xs={24} md={12} xl={8}>
                                    <Form.Item label="Designation" name="designation">
                                        <Input placeholder="Enter designation" />
                                    </Form.Item>
                                </Col>

                                <Col xs={24} md={12} xl={8}>
                                    <Form.Item label="Industry" name="industry">
                                        <Select
                                            placeholder="Select industry"
                                            options={industryOptions}
                                            allowClear
                                        />
                                    </Form.Item>
                                </Col>

                                <Col xs={24} md={12} xl={8}>
                                    <Form.Item
                                        label="Mobile"
                                        name="mobile"
                                        rules={[{ required: true, message: "Mobile is required" }]}
                                    >
                                        <Input placeholder="Enter mobile number" />
                                    </Form.Item>
                                </Col>

                                <Col xs={24} md={12} xl={8}>
                                    <Form.Item label="Office Phone" name="office_phone">
                                        <Input placeholder="Enter office phone" />
                                    </Form.Item>
                                </Col>

                                <Col xs={24} md={12} xl={8}>
                                    <Form.Item label="Organization Name" name="organization_name">
                                        <Input placeholder="Enter organization name" />
                                    </Form.Item>
                                </Col>

                                <Col xs={24}>
                                    <Form.List name="emails">
                                        {(fields, { add, remove }) => (
                                            <>
                                                <div style={{ marginBottom: 12, fontWeight: 600 }}>
                                                    Email Addresses
                                                </div>

                                                {fields.map((field, index) => (
                                                    <Card
                                                        key={field.key}
                                                        size="small"
                                                        style={{
                                                            marginBottom: 12,
                                                            borderRadius: 12,
                                                            background: token.colorFillAlter,
                                                            border: `1px solid ${token.colorBorderSecondary}`,
                                                        }}
                                                    >
                                                        <Row gutter={[12, 0]} align="middle">
                                                            <Col xs={24} md={10} xl={8}>
                                                                <Form.Item
                                                                    {...field}
                                                                    label={index === 0 ? "Email Address" : `Email ${index + 1}`}
                                                                    name={[field.name, "email"]}
                                                                    rules={[
                                                                        { required: true, message: "Email is required" },
                                                                        { type: "email", message: "Enter valid email" },
                                                                    ]}
                                                                    style={{ marginBottom: 0 }}
                                                                >
                                                                    <Input placeholder="Enter email address" />
                                                                </Form.Item>
                                                            </Col>

                                                            <Col xs={8} md={4} xl={3}>
                                                                <Form.Item
                                                                    {...field}
                                                                    label="Primary"
                                                                    name={[field.name, "primary"]}
                                                                    valuePropName="checked"
                                                                    style={{ marginBottom: 0 }}
                                                                >
                                                                    <Checkbox />
                                                                </Form.Item>
                                                            </Col>

                                                            <Col xs={8} md={4} xl={3}>
                                                                <Form.Item
                                                                    {...field}
                                                                    label="Opt Out"
                                                                    name={[field.name, "opt_out"]}
                                                                    valuePropName="checked"
                                                                    style={{ marginBottom: 0 }}
                                                                >
                                                                    <Checkbox />
                                                                </Form.Item>
                                                            </Col>

                                                            <Col xs={8} md={4} xl={3}>
                                                                <Form.Item
                                                                    {...field}
                                                                    label="Invalid"
                                                                    name={[field.name, "invalid"]}
                                                                    valuePropName="checked"
                                                                    style={{ marginBottom: 0 }}
                                                                >
                                                                    <Checkbox />
                                                                </Form.Item>
                                                            </Col>

                                                            <Col xs={24} md={2} xl={2}>
                                                                {fields.length > 1 && (
                                                                    <Button
                                                                        danger
                                                                        type="text"
                                                                        icon={<MinusCircleOutlined />}
                                                                        onClick={() => remove(field.name)}
                                                                    />
                                                                )}
                                                            </Col>
                                                        </Row>
                                                    </Card>
                                                ))}

                                                <Button
                                                    type="dashed"
                                                    icon={<PlusOutlined />}
                                                    onClick={() =>
                                                        add({
                                                            email: "",
                                                            primary: false,
                                                            opt_out: false,
                                                            invalid: false,
                                                        })
                                                    }
                                                >
                                                    Add Email
                                                </Button>
                                            </>
                                        )}
                                    </Form.List>
                                </Col>
                            </Row>
                        </Card>

                        {/* Lead Details */}
                        <Card style={sectionCardStyle}>
                            <div style={sectionTitleStyle}>Lead Details</div>

                            <Row gutter={[16, 4]}>
                                <Col xs={24} md={12} xl={8}>
                                    <Form.Item label="Dealer Organization" name="dealer_organization">
                                        <Select
                                            placeholder="Select dealer organization"
                                            options={dealerOrganizationOptions}
                                            allowClear
                                        />
                                    </Form.Item>
                                </Col>

                                <Col xs={24} md={12} xl={8}>
                                    <Form.Item
                                        label="Priority"
                                        name="priority"
                                        rules={[{ required: true, message: "Priority is required" }]}
                                    >
                                        <Select
                                            placeholder="Select priority"
                                            options={priorityOptions}
                                            allowClear
                                        />
                                    </Form.Item>
                                </Col>

                                <Col xs={24} md={12} xl={8}>
                                    <Form.Item label="Status" name="status">
                                        <Select
                                            placeholder="Select status"
                                            options={statusOptions}
                                            allowClear
                                        />
                                    </Form.Item>
                                </Col>

                                <Col xs={24} md={12} xl={8}>
                                    <Form.Item
                                        label="Product Category"
                                        name="product_category"
                                        rules={[
                                            { required: true, message: "Product category is required" },
                                        ]}
                                    >
                                        <Select
                                            placeholder="Select product category"
                                            options={productCategoryOptions}
                                            allowClear
                                        />
                                    </Form.Item>
                                </Col>

                                <Col xs={24} md={12} xl={16}>
                                    <Form.Item label="Requirements" name="requirements">
                                        <TextArea rows={4} placeholder="Enter requirements" />
                                    </Form.Item>
                                </Col>

                                <Col xs={24} md={12} xl={8}>
                                    <Form.Item
                                        label="Next Followup"
                                        name="next_followup"
                                        rules={[{ required: true, message: "Next followup is required" }]}
                                    >
                                        <DatePicker
                                            showTime
                                            format="DD/MM/YYYY hh:mm a"
                                            style={{ width: "100%" }}
                                            placeholder="Select next followup"
                                        />
                                    </Form.Item>
                                </Col>

                                <Col xs={24} md={12} xl={8}>
                                    <Form.Item label="Followup" name="followup">
                                        <Select
                                            placeholder="Select followup"
                                            options={followupOptions}
                                            allowClear
                                        />
                                    </Form.Item>
                                </Col>

                                <Col xs={24} md={12} xl={8}>
                                    <Form.Item label="Followup Type" name="followup_type">
                                        <Select
                                            placeholder="Select followup type"
                                            options={followupTypeOptions}
                                            allowClear
                                        />
                                    </Form.Item>
                                </Col>

                                <Col xs={24} md={12} xl={8}>
                                    <Form.Item label="Lead Source" name="lead_source">
                                        <Select
                                            placeholder="Select lead source"
                                            options={leadSourceOptions}
                                            allowClear
                                        />
                                    </Form.Item>
                                </Col>

                                <Col xs={24} md={12} xl={8}>
                                    <Form.Item label="Assigned To" name="assigned_to">
                                        <Select
                                            placeholder="Select assignee"
                                            options={assignedToOptions}
                                            allowClear
                                        />
                                    </Form.Item>
                                </Col>

                                <Col xs={24} md={12} xl={8}>
                                    <Form.Item label="Referred By" name="referred_by">
                                        <Input placeholder="Enter referred by" />
                                    </Form.Item>
                                </Col>

                                <Col xs={24} md={12} xl={12}>
                                    <Form.Item label="Add Description" name="add_description">
                                        <TextArea rows={5} placeholder="Enter additional description" />
                                    </Form.Item>
                                </Col>

                                <Col xs={24} md={12} xl={12}>
                                    <Form.Item label="Description" name="description">
                                        <TextArea rows={5} placeholder="Enter description" />
                                    </Form.Item>
                                </Col>
                            </Row>
                        </Card>

                        {/* Opportunity Details */}
                        <Card style={sectionCardStyle}>
                            <div style={sectionTitleStyle}>Opportunity Details</div>

                            <Row gutter={[16, 4]}>
                                <Col xs={24} md={12} xl={8}>
                                    <Form.Item label="Opportunity Name" name="opportunity_name">
                                        <Input placeholder="Enter opportunity name" />
                                    </Form.Item>
                                </Col>

                                <Col xs={24} md={12} xl={8}>
                                    <Form.Item label="Opportunity Amount" name="opportunity_amount">
                                        <InputNumber
                                            style={{ width: "100%" }}
                                            placeholder="Enter opportunity amount"
                                            min={0}
                                        />
                                    </Form.Item>
                                </Col>

                                <Col xs={24} md={12} xl={8}>
                                    <Form.Item label="Expected Close Date" name="expected_close_date">
                                        <DatePicker
                                            style={{ width: "100%" }}
                                            format="DD/MM/YYYY"
                                            placeholder="Select expected close date"
                                        />
                                    </Form.Item>
                                </Col>

                                <Col xs={24} md={12} xl={8}>
                                    <Form.Item label="Sales Stage" name="sales_stage">
                                        <Select
                                            placeholder="Select sales stage"
                                            options={salesStageOptions}
                                            allowClear
                                        />
                                    </Form.Item>
                                </Col>
                            </Row>
                        </Card>

                        {/* Address Information */}
                        <Card style={sectionCardStyle}>
                            <div style={sectionTitleStyle}>Address Information</div>

                            <Row gutter={[16, 4]}>
                                <Col xs={24} xl={12}>
                                    <Card
                                        size="small"
                                        title="Primary Address"
                                        style={{
                                            borderRadius: 14,
                                            background: token.colorFillAlter,
                                            border: `1px solid ${token.colorBorderSecondary}`,
                                        }}
                                    >
                                        <Row gutter={[12, 0]}>
                                            <Col span={24}>
                                                <Form.Item
                                                    label="Primary Address Street"
                                                    name="primary_address_street"
                                                >
                                                    <TextArea rows={3} placeholder="Enter primary street" />
                                                </Form.Item>
                                            </Col>

                                            <Col span={24}>
                                                <Form.Item label="Primary Address Area" name="primary_address_area">
                                                    <Input placeholder="Enter primary area" />
                                                </Form.Item>
                                            </Col>

                                            <Col span={24}>
                                                <Form.Item
                                                    label="Primary Address Postalcode"
                                                    name="primary_address_postalcode"
                                                >
                                                    <Input placeholder="Enter primary postal code" />
                                                </Form.Item>
                                            </Col>

                                            <Col span={24}>
                                                <Form.Item label="Primary Address City" name="primary_address_city">
                                                    <Input placeholder="Enter primary city" />
                                                </Form.Item>
                                            </Col>

                                            <Col span={24}>
                                                <Form.Item label="Primary Address State" name="primary_address_state">
                                                    <Input placeholder="Enter primary state" />
                                                </Form.Item>
                                            </Col>

                                            <Col span={24}>
                                                <Form.Item
                                                    label="Primary Address Country"
                                                    name="primary_address_country"
                                                >
                                                    <Input placeholder="Enter primary country" />
                                                </Form.Item>
                                            </Col>
                                        </Row>
                                    </Card>
                                </Col>

                                <Col xs={24} xl={12}>
                                    <Card
                                        size="small"
                                        title="Other Address"
                                        style={{
                                            borderRadius: 14,
                                            background: token.colorFillAlter,
                                            border: `1px solid ${token.colorBorderSecondary}`,
                                        }}
                                    >
                                        <Row gutter={[12, 0]}>
                                            <Col span={24}>
                                                <Form.Item label="Alt Address Street" name="alt_address_street">
                                                    <TextArea rows={3} placeholder="Enter alternate street" />
                                                </Form.Item>
                                            </Col>

                                            <Col span={24}>
                                                <Form.Item label="Alternate Address Area" name="alt_address_area">
                                                    <Input placeholder="Enter alternate area" />
                                                </Form.Item>
                                            </Col>

                                            <Col span={24}>
                                                <Form.Item label="Alt Address Postalcode" name="alt_address_postalcode">
                                                    <Input placeholder="Enter alternate postal code" />
                                                </Form.Item>
                                            </Col>

                                            <Col span={24}>
                                                <Form.Item label="Alt Address City" name="alt_address_city">
                                                    <Input placeholder="Enter alternate city" />
                                                </Form.Item>
                                            </Col>

                                            <Col span={24}>
                                                <Form.Item label="Alt Address State" name="alt_address_state">
                                                    <Input placeholder="Enter alternate state" />
                                                </Form.Item>
                                            </Col>

                                            <Col span={24}>
                                                <Form.Item label="Alt Address Country" name="alt_address_country">
                                                    <Input placeholder="Enter alternate country" />
                                                </Form.Item>
                                            </Col>

                                            <Col span={24}>
                                                <Form.Item
                                                    name="copy_address_from_primary"
                                                    valuePropName="checked"
                                                    style={{ marginBottom: 0 }}
                                                >
                                                    <Checkbox onChange={(e) => copyPrimaryAddress(e.target.checked)}>
                                                        Copy Address from Primary
                                                    </Checkbox>
                                                </Form.Item>
                                            </Col>
                                        </Row>
                                    </Card>
                                </Col>
                            </Row>
                        </Card>

                        {/* Footer Actions */}
                        <Card style={sectionCardStyle}>
                            <Row justify="end">
                                <Space wrap>
                                    <Button htmlType="button">Cancel</Button>
                                    <Button type="primary" htmlType="submit" loading={loading}>
                                        Create Lead
                                    </Button>
                                </Space>
                            </Row>
                        </Card>
                    </Space>
                </Form>
            </Space>
        </div>
    );
}