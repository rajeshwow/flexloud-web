import { MinusCircleOutlined, PlusOutlined } from "@ant-design/icons";
import {
    Button,
    Card,
    Checkbox,
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
    theme,
} from "antd";
import dayjs from "dayjs";
import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { useMasters } from "../../hooks/useMasters";
import AddressSection from "../../layouts/addressSection";
import { createLead } from "../../redux/reducers/leads.slice";
import { fetchMasterValues } from "../../redux/reducers/masters.slice";
import { getUsers } from "../../redux/reducers/user.slice";
import type { AppDispatch, RootState } from "../../redux/store";

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
    priority_id?: string;
    status_id?: string;
    product_category?: string;
    requirements?: string;
    next_followup?: dayjs.Dayjs;
    followup?: string;
    followup_type?: string;
    source_id?: string;
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
    primary_address_postal_code?: string;
    primary_address_city?: string;
    primary_address_state?: string;
    primary_address_country?: string;

    alternate_address_street?: string;
    alternate_address_area?: string;
    alternate_address_postal_code?: string;
    alternate_address_city?: string;
    alternate_address_state?: string;
    alternate_address_country?: string;

    copy_address?: boolean;
};





const dealerOrganizationOptions: SelectOption[] = [
    { label: "Dealer One", value: "dealer-1" },
    { label: "Dealer Two", value: "dealer-2" },
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




export default function CreateLeadForm() {
    const [form] = Form.useForm<CreateLeadFormValues>();
    const { token } = theme.useToken();
    const [loading, setLoading] = useState(false);
    const dispatch = useDispatch<AppDispatch>();
    const navigate = useNavigate();
    const { slug } = useParams();

    const [copyAddress, setCopyAddress] = useState(false);

    const statusOptions = useMasters("lead_status");
    const priorityOptions = useMasters("priority");
    const sourceOptions = useMasters("source");
    const industryOptions = useMasters("industry");


    const { masterValues, masterValuesLoading } = useSelector(
        (state: RootState) => state.masters
    );

    const countryList = useMemo(() => masterValues?.country || [], [masterValues]);
    const stateList = useMemo(() => masterValues?.state || [], [masterValues]);
    const cityList = useMemo(() => masterValues?.city || [], [masterValues]);


    const users = useSelector((state: any) => state.users?.userList);

    useEffect(() => {
        dispatch(getUsers());
    }, [dispatch]);

    useEffect(() => {
        dispatch(fetchMasterValues({ type_code: "country", page: 1, limit: 500 }));
        dispatch(fetchMasterValues({ type_code: "state", page: 1, limit: 1000 }));
        dispatch(fetchMasterValues({ type_code: "city", page: 1, limit: 2000 }));


    }, [dispatch]);


    const handleCopyAddressChange = (checked: boolean) => {
        setCopyAddress(checked);

        if (checked) {
            form.setFieldsValue({
                alternate_address_street: form.getFieldValue("primary_address_street"),
                alternate_address_area: form.getFieldValue("primary_address_area"),
                alternate_address_postal_code: form.getFieldValue("primary_address_postal_code"),
                alternate_address_city: form.getFieldValue("primary_address_city"),
                alternate_address_state: form.getFieldValue("primary_address_state"),
                alternate_address_country: form.getFieldValue("primary_address_country"),
            });
        } else {
            form.setFieldsValue({
                alternate_address_street: "",
                alternate_address_area: "",
                alternate_address_postal_code: "",
                alternate_address_city: "",
                alternate_address_state: "",
                alternate_address_country: "",
            });
        }
    };

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
                priority_id: values.priority_id || undefined,
                status_id: values.status_id || undefined,
                product_category: values.product_category || undefined,
                requirements: values.requirements?.trim() || undefined,

                next_followup: values.next_followup
                    ? values.next_followup.toISOString()
                    : undefined,
                followup: values.followup || undefined,
                followup_type: values.followup_type || undefined,
                source_id: values.source_id || undefined,

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
                primary_address_postal_code:
                    values.primary_address_postal_code?.trim() || undefined,
                primary_address_city: values.primary_address_city?.trim() || undefined,
                primary_address_state: values.primary_address_state?.trim() || undefined,
                primary_address_country:
                    values.primary_address_country?.trim() || undefined,

                alternate_address_street: values.alternate_address_street?.trim() || undefined,
                alternate_address_area: values.alternate_address_area?.trim() || undefined,
                alternate_address_postal_code:
                    values.alternate_address_postal_code?.trim() || undefined,
                alternate_address_city: values.alternate_address_city?.trim() || undefined,
                alternate_address_state: values.alternate_address_state?.trim() || undefined,
                alternate_address_country: values.alternate_address_country?.trim() || undefined,
            } as any;

            const response = await dispatch(createLead(payload)).unwrap();

            if (response?.data) {
                message.success("Lead created successfully", 2);
                form.resetFields();
                setCopyAddress(false);
                form.setFieldsValue({
                    sales_stage: "qualification",
                    emails: [
                        { email: "", primary: true, opt_out: false, invalid: false },
                    ],
                });
                navigate(`${slug}/leads/${response?.data?.id}`);

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





    const sectionTitleStyle: React.CSSProperties = {
        marginBottom: 16,
        color: token.colorTextHeading,
        fontSize: 16,
        fontWeight: 700,
    };

    return (
        <div

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

                </div>

                <Divider />

                <Form<CreateLeadFormValues>
                    form={form}
                    layout="vertical"
                    onFinish={handleFinish}
                    initialValues={{
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
                        {/* <Card style={sectionCardStyle}> */}
                        <div style={sectionTitleStyle}>Basic Details</div>

                        <Row gutter={[16, 4]}>
                            {/* <Col xs={24} md={12} xl={8}>
                                <Form.Item label="Lead Number" name="lead_number">
                                    <Input placeholder="Enter lead number" />
                                </Form.Item>
                            </Col> */}

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
                        {/* </Card> */}

                        {/* Lead Details */}
                        {/* <Card style={sectionCardStyle}> */}
                        <Divider />
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
                                    name="priority_id"
                                    rules={[{ required: true, message: "Priority is required" }]}
                                >
                                    <Select
                                        placeholder="Select priority"
                                        options={priorityOptions.map((item: any) => ({
                                            label: item.label,
                                            value: item.value,
                                        }))}
                                        allowClear
                                    />
                                </Form.Item>
                            </Col>

                            <Col xs={24} md={12} xl={8}>
                                <Form.Item label="Status" name="status_id">
                                    <Select
                                        placeholder="Select status"
                                        options={statusOptions.map((item: any) => ({
                                            label: item.label,
                                            value: item.value,
                                        }))}
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
                                        disabledDate={(current) => current && current.isBefore(dayjs().startOf('day'))}
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
                                <Form.Item label="Lead Source" name="source_id">
                                    <Select
                                        placeholder="Select lead source"
                                        options={sourceOptions.map((item: any) => ({
                                            label: item.label,
                                            value: item.value,
                                        }))}
                                        allowClear
                                    />
                                </Form.Item>
                            </Col>

                            <Col xs={24} md={12} xl={8}>
                                <Form.Item label="Assigned To" name="assigned_to">
                                    <Select
                                        placeholder="Select assignee"
                                        options={users?.map((user: any) => ({
                                            value: user.id,
                                            label: user.name,
                                        }))}
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
                        {/* </Card> */}

                        {/* Opportunity Details */}
                        {/* <Card style={sectionCardStyle}> */}
                        <Divider />
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

                            {/* <Col xs={24} md={12} xl={8}>
                                <Form.Item label="Sales Stage" name="sales_stage">
                                    <Select
                                        placeholder="Select sales stage"
                                        options={salesStageOptions}
                                        allowClear
                                    />
                                </Form.Item>
                            </Col> */}
                        </Row>
                        <Divider />
                        {/* </Card> */}

                        {/* Address Information */}
                        {/* <Card style={sectionCardStyle}> */}
                        <div style={sectionTitleStyle}>Address Information</div>

                        {/* <AddressSection
                            copyAddress={copyAddress}
                            onCopyAddressChange={handleCopyAddressChange}
                        /> */}
                        <AddressSection

                            copyAddress={copyAddress}
                            onCopyAddressChange={handleCopyAddressChange}
                            countryOptions={countryList}
                            stateOptions={stateList}
                            cityOptions={cityList}
                            countriesLoading={masterValuesLoading}
                            statesLoading={masterValuesLoading}
                            citiesLoading={masterValuesLoading}
                        />
                        {/* </Card> */}

                        {/* Footer Actions */}
                        {/* <Card style={sectionCardStyle}> */}
                        <Row justify="end">
                            <Space wrap>
                                <Button htmlType="button">Cancel</Button>
                                <Button type="primary" htmlType="submit" loading={loading}>
                                    Create Lead
                                </Button>
                            </Space>
                        </Row>
                        {/* </Card> */}
                    </Space>
                </Form>
            </Space>
        </div>
    );
}