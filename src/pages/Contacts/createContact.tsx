import { MinusOutlined, PlusOutlined } from "@ant-design/icons";
import {
    Button,
    Checkbox,
    Col,
    DatePicker,
    Divider,
    Form,
    Input,
    Row,
    Select,
    Space,
    Typography,
    message,
} from "antd";
import dayjs, { Dayjs } from "dayjs";
import { useEffect, useMemo, useState } from "react";
import { useDispatch } from "react-redux";
import { createContact } from "../../redux/reducers/contacts.slice";
import {
    getOrganization,
    type OrganizationItem,
} from "../../redux/reducers/organization.slice";
import type { AppDispatch } from "../../redux/store";
const { Title, Text } = Typography;
const { Option } = Select;

type EmailItem = {
    email: string;
    primary?: boolean;
    optOut?: boolean;
    invalid?: boolean;
};

type ContactFormValues = {
    first_name: string;
    last_name: string;
    organization_id?: string;
    mobile: string;
    assigned_to?: string;
    birthdate?: Dayjs;
    primary_contact: string;
    emails: EmailItem[];

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

type Props = {
    assignedUsers?: Array<{ label: string; value: string }>;
    primaryContactOptions?: Array<{ label: string; value: string }>;
    initialValues?: Partial<ContactFormValues>;
    onSuccess?: () => void;
};

const mobileRegex = /^[6-9]\d{9}$/;
const postalCodeRegex = /^[0-9]{4,10}$/;

export default function ContactForm({
    assignedUsers = [],
    primaryContactOptions = [
        { label: "Yes", value: "yes" },
        { label: "No", value: "no" },
    ],
    initialValues,
    onSuccess,
}: Props) {
    const [form] = Form.useForm<ContactFormValues>();
    const [orgLoading, setOrgLoading] = useState(false);
    const [saveLoading, setSaveLoading] = useState(false);
    const [organization, setOrganization] = useState<OrganizationItem[]>([]);

    const copyAddress = Form.useWatch("copy_address", form);
    const dispatch = useDispatch<AppDispatch>();

    useEffect(() => {
        fetchOrganizations();
    }, []);

    useEffect(() => {
        if (copyAddress) {
            syncPrimaryToAlternate();
        }
    }, [
        copyAddress,
        Form.useWatch("primary_address_street", form),
        Form.useWatch("primary_address_area", form),
        Form.useWatch("primary_address_postal_code", form),
        Form.useWatch("primary_address_city", form),
        Form.useWatch("primary_address_state", form),
        Form.useWatch("primary_address_country", form),
    ]);

    const initialFormValues = useMemo<ContactFormValues>(
        () => ({
            first_name: "",
            last_name: "",
            organization_id: undefined,
            mobile: "",
            assigned_to: undefined,
            birthdate: undefined,
            primary_contact: "",
            emails: [{ email: "", primary: true, optOut: false, invalid: false }],

            primary_address_street: "",
            primary_address_area: "",
            primary_address_postal_code: "",
            primary_address_city: "",
            primary_address_state: "",
            primary_address_country: "",

            alternate_address_street: "",
            alternate_address_area: "",
            alternate_address_postal_code: "",
            alternate_address_city: "",
            alternate_address_state: "",
            alternate_address_country: "",

            copy_address: false,
            ...initialValues,
        }),
        [initialValues]
    );

    const fetchOrganizations = async () => {
        try {
            setOrgLoading(true);
            const res = await dispatch(getOrganization()).unwrap();
            setOrganization(res.data || []);
        } catch (error) {
            message.error("Failed to load organizations");
        } finally {
            setOrgLoading(false);
        }
    };

    const syncPrimaryToAlternate = () => {
        const values = form.getFieldsValue();
        form.setFieldsValue({
            alternate_address_street: values.primary_address_street,
            alternate_address_area: values.primary_address_area,
            alternate_address_postal_code: values.primary_address_postal_code,
            alternate_address_city: values.primary_address_city,
            alternate_address_state: values.primary_address_state,
            alternate_address_country: values.primary_address_country,
        });
    };

    const handleCopyAddressChange = (checked: boolean) => {
        form.setFieldValue("copy_address", checked);

        if (checked) {
            syncPrimaryToAlternate();
        }
    };

    const onFinish = async (values: ContactFormValues) => {
        try {
            setSaveLoading(true);

            const payload = {
                first_name: values.first_name.trim(),
                last_name: values.last_name.trim(),
                organization_id: values.organization_id || null,
                mobile: values.mobile.trim(),
                assigned_to: values.assigned_to || null,
                birthdate: values.birthdate ? dayjs(values.birthdate).format("YYYY-MM-DD") : null,
                primary_contact: values.primary_contact,

                emails: (values.emails || [])
                    .filter((item) => item?.email?.trim())
                    .map((item) => ({
                        email: item.email.trim(),
                        primary: !!item.primary,
                        opt_out: !!item.optOut,
                        invalid: !!item.invalid,
                    })),

                primary_address: {
                    street: values.primary_address_street || "",
                    area: values.primary_address_area || "",
                    postal_code: values.primary_address_postal_code || "",
                    city: values.primary_address_city || "",
                    state: values.primary_address_state || "",
                    country: values.primary_address_country || "",
                },

                alternate_address: {
                    street: values.alternate_address_street || "",
                    area: values.alternate_address_area || "",
                    postal_code: values.alternate_address_postal_code || "",
                    city: values.alternate_address_city || "",
                    state: values.alternate_address_state || "",
                    country: values.alternate_address_country || "",
                },
            };

            const primaryEmails = payload.emails.filter((e) => e.primary);
            if (primaryEmails.length > 1) {
                message.error("Only one email can be marked as primary");
                return;
            }

            await dispatch(createContact(payload));
            message.success("Contact created successfully");
            onSuccess?.();
        } catch (error) {
            message.error("Failed to create contact");
        } finally {
            setSaveLoading(false);
        }
    };

    return (
        <div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 20 }}>
                <Title level={3} style={{ margin: 0 }}>
                    Create Contact
                </Title>

                <Space>
                    <Button onClick={() => form.resetFields()}>Cancel</Button>
                    <Button type="primary" loading={saveLoading} onClick={() => form.submit()}>
                        Save
                    </Button>
                </Space>
            </div>

            <Form<ContactFormValues>
                form={form}
                layout="vertical"
                initialValues={initialFormValues}
                onFinish={onFinish}
            >
                <Title level={5} style={{ marginBottom: 16 }}>
                    Basic Details
                </Title>

                <Row gutter={16}>
                    <Col xs={24} md={12}>
                        <Form.Item
                            label="First Name"
                            name="first_name"
                            rules={[
                                { required: true, message: "First name is required" },
                                { min: 2, message: "First name must be at least 2 characters" },
                                { max: 50, message: "First name must be at most 50 characters" },
                            ]}
                        >
                            <Input placeholder="Enter first name" />
                        </Form.Item>
                    </Col>

                    <Col xs={24} md={12}>
                        <Form.Item
                            label="Last Name"
                            name="last_name"
                            rules={[
                                { required: true, message: "Last name is required" },
                                { min: 1, message: "Last name is required" },
                                { max: 50, message: "Last name must be at most 50 characters" },
                            ]}
                        >
                            <Input placeholder="Enter last name" />
                        </Form.Item>
                    </Col>

                    <Col xs={24} md={12}>
                        <Form.Item label="Organization Name" name="organization_id">
                            <Select
                                showSearch
                                allowClear
                                loading={orgLoading}
                                placeholder="Select organization"
                                optionFilterProp="label"
                                options={organization.map((org) => ({
                                    label: org.name,
                                    value: org.id,
                                }))}
                            />
                        </Form.Item>
                    </Col>

                    <Col xs={24} md={12}>
                        <Form.List name="emails">
                            {(fields, { add, remove }) => (
                                <div>
                                    <Text strong>Email Address</Text>

                                    {fields.map((field, index) => (
                                        <Row gutter={12} align="middle" key={field.key} style={{ marginTop: 10 }}>
                                            <Col xs={24} md={12}>
                                                <Form.Item
                                                    {...field}
                                                    name={[field.name, "email"]}
                                                    rules={[
                                                        { required: index === 0, message: "Email is required" },
                                                        { type: "email", message: "Enter a valid email" },
                                                    ]}
                                                    style={{ marginBottom: 0 }}
                                                >
                                                    <Input placeholder="Enter email address" />
                                                </Form.Item>
                                            </Col>

                                            <Col xs={8} md={3}>
                                                <Form.Item
                                                    {...field}
                                                    name={[field.name, "primary"]}
                                                    valuePropName="checked"
                                                    style={{ marginBottom: 0 }}
                                                >
                                                    <Checkbox>Primary</Checkbox>
                                                </Form.Item>
                                            </Col>

                                            <Col xs={8} md={3}>
                                                <Form.Item
                                                    {...field}
                                                    name={[field.name, "optOut"]}
                                                    valuePropName="checked"
                                                    style={{ marginBottom: 0 }}
                                                >
                                                    <Checkbox>Opt Out</Checkbox>
                                                </Form.Item>
                                            </Col>

                                            <Col xs={8} md={3}>
                                                <Form.Item
                                                    {...field}
                                                    name={[field.name, "invalid"]}
                                                    valuePropName="checked"
                                                    style={{ marginBottom: 0 }}
                                                >
                                                    <Checkbox>Invalid</Checkbox>
                                                </Form.Item>
                                            </Col>

                                            <Col xs={24} md={3}>
                                                <Space>
                                                    {fields.length > 1 && (
                                                        <Button
                                                            icon={<MinusOutlined />}
                                                            onClick={() => remove(field.name)}
                                                        />
                                                    )}
                                                    {index === fields.length - 1 && (
                                                        <Button
                                                            icon={<PlusOutlined />}
                                                            onClick={() =>
                                                                add({
                                                                    email: "",
                                                                    primary: false,
                                                                    optOut: false,
                                                                    invalid: false,
                                                                })
                                                            }
                                                        />
                                                    )}
                                                </Space>
                                            </Col>
                                        </Row>
                                    ))}
                                </div>
                            )}
                        </Form.List>
                    </Col>

                    <Col xs={24} md={12}>
                        <Form.Item
                            label="Mobile"
                            name="mobile"
                            rules={[
                                { required: true, message: "Mobile number is required" },
                                {
                                    validator: async (_, value) => {
                                        if (!value) return Promise.resolve();
                                        const clean = String(value).replace(/\D/g, "");
                                        if (!mobileRegex.test(clean)) {
                                            return Promise.reject(new Error("Enter a valid 10 digit Indian mobile number"));
                                        }
                                        return Promise.resolve();
                                    },
                                },
                            ]}
                            getValueFromEvent={(e) => e.target.value.replace(/\D/g, "").slice(0, 10)}
                        >
                            <Input placeholder="Enter mobile number" maxLength={10} />
                        </Form.Item>
                    </Col>

                    <Col xs={24} md={12}>
                        <Form.Item
                            label="Birthdate"
                            name="birthdate"
                            rules={[
                                {
                                    validator: async (_, value) => {
                                        if (!value) return Promise.resolve();
                                        if (dayjs(value).isAfter(dayjs(), "day")) {
                                            return Promise.reject(new Error("Birthdate cannot be in the future"));
                                        }
                                        return Promise.resolve();
                                    },
                                },
                            ]}
                        >
                            <DatePicker
                                format="DD/MM/YYYY"
                                style={{ width: "100%" }}
                                placeholder="Select birthdate"
                                disabledDate={(current) => !!current && current > dayjs().endOf("day")}
                            />
                        </Form.Item>
                    </Col>

                    <Col xs={24} md={12}>
                        <Form.Item label="Assigned To" name="assigned_to">
                            <Select
                                allowClear
                                showSearch
                                placeholder="Select assignee"
                                options={assignedUsers}
                                optionFilterProp="label"
                            />
                        </Form.Item>
                    </Col>

                    <Col xs={24} md={12}>
                        <Form.Item
                            label="Primary Contact"
                            name="primary_contact"
                            rules={[{ required: true, message: "Primary contact is required" }]}
                        >
                            <Select
                                allowClear
                                placeholder="Select primary contact"
                                options={primaryContactOptions}
                            />
                        </Form.Item>
                    </Col>
                </Row>

                <Divider />

                <Title level={5} style={{ marginBottom: 16 }}>
                    Address Details
                </Title>

                <Row gutter={24}>
                    <Col xs={24} md={12}>
                        <Title level={5}>Primary Address</Title>

                        <Form.Item label="Primary Address Street" name="primary_address_street">
                            <Input.TextArea rows={3} placeholder="Enter street" />
                        </Form.Item>

                        <Form.Item label="Primary Address Area" name="primary_address_area">
                            <Input placeholder="Enter area" />
                        </Form.Item>

                        <Form.Item
                            label="Primary Address Postal Code"
                            name="primary_address_postal_code"
                            rules={[
                                {
                                    validator: async (_, value) => {
                                        if (!value) return Promise.resolve();
                                        if (!postalCodeRegex.test(String(value))) {
                                            return Promise.reject(new Error("Enter a valid postal code"));
                                        }
                                        return Promise.resolve();
                                    },
                                },
                            ]}
                        >
                            <Input placeholder="Enter postal code" maxLength={10} />
                        </Form.Item>

                        <Form.Item label="Primary Address City" name="primary_address_city">
                            <Input placeholder="Enter city" />
                        </Form.Item>

                        <Form.Item label="Primary Address State" name="primary_address_state">
                            <Input placeholder="Enter state" />
                        </Form.Item>

                        <Form.Item label="Primary Address Country" name="primary_address_country">
                            <Input placeholder="Enter country" />
                        </Form.Item>
                    </Col>

                    <Col xs={24} md={12}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <Title level={5} style={{ marginBottom: 16 }}>
                                Other Address
                            </Title>

                            <Checkbox
                                checked={!!copyAddress}
                                onChange={(e) => handleCopyAddressChange(e.target.checked)}
                            >
                                Copy Address from Primary
                            </Checkbox>
                        </div>

                        <Form.Item label="Alternate Address Street" name="alternate_address_street">
                            <Input.TextArea rows={3} placeholder="Enter street" />
                        </Form.Item>

                        <Form.Item label="Alternate Address Area" name="alternate_address_area">
                            <Input placeholder="Enter area" />
                        </Form.Item>

                        <Form.Item
                            label="Alternate Address Postal Code"
                            name="alternate_address_postal_code"
                            rules={[
                                {
                                    validator: async (_, value) => {
                                        if (!value) return Promise.resolve();
                                        if (!postalCodeRegex.test(String(value))) {
                                            return Promise.reject(new Error("Enter a valid postal code"));
                                        }
                                        return Promise.resolve();
                                    },
                                },
                            ]}
                        >
                            <Input placeholder="Enter postal code" maxLength={10} />
                        </Form.Item>

                        <Form.Item label="Alternate Address City" name="alternate_address_city">
                            <Input placeholder="Enter city" />
                        </Form.Item>

                        <Form.Item label="Alternate Address State" name="alternate_address_state">
                            <Input placeholder="Enter state" />
                        </Form.Item>

                        <Form.Item label="Alternate Address Country" name="alternate_address_country">
                            <Input placeholder="Enter country" />
                        </Form.Item>
                    </Col>
                </Row>
            </Form>
        </div>
    );
}