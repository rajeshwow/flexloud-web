import { MinusOutlined, PlusOutlined } from "@ant-design/icons";
import {
    Button,
    Checkbox,
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
    Typography,
    message,
} from "antd";
import dayjs, { Dayjs } from "dayjs";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import AddressSection from "../../layouts/addressSection";
import { createContact } from "../../redux/reducers/contacts.slice";
import { fetchMasterValues } from "../../redux/reducers/masters.slice";
import {
    getOrganization,
    type OrganizationItem,
} from "../../redux/reducers/organization.slice";
import { getUsers } from "../../redux/reducers/user.slice";
import type { AppDispatch, RootState } from "../../redux/store";
import { Client } from "../../shared/Utils/api-client";
import { toTitleCase, withTenant } from "../../shared/Utils/utils";
import OrganizationForm from "../Organization/components/OrganizationForm";

const { Title, Text } = Typography;

type EmailItem = {
    email: string;
    primary?: boolean;
    optOut?: boolean;
    invalid?: boolean;
};

export type ContactFormValues = {
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
    mode?: "create" | "edit";
    contactId?: string;
};

const mobileRegex = /^[6-9]\d{9}$/;

export default function ContactForm({
    assignedUsers,
    primaryContactOptions = [
        { label: "Yes", value: "yes" },
        { label: "No", value: "no" },
    ],
    initialValues,
    onSuccess,
    mode = "create",
    contactId,
}: Props) {
    const [form] = Form.useForm<ContactFormValues>();
    const [orgLoading, setOrgLoading] = useState(false);
    const [saveLoading, setSaveLoading] = useState(false);
    const [organization, setOrganization] = useState<OrganizationItem[]>([]);
    const [copyAddress, setCopyAddress] = useState(!!initialValues?.copy_address);

    const dispatch = useDispatch<AppDispatch>();
    const navigate = useNavigate();
    const { slug = "" } = useParams();

    const users = useSelector((state: RootState) => (state as any).users?.userList || []);
    const { masterValues } = useSelector((state: RootState) => state.masters);

    const countryList = useMemo(() => masterValues?.country || [], [masterValues]);
    const stateList = useMemo(() => masterValues?.state || [], [masterValues]);
    const cityList = useMemo(() => masterValues?.city || [], [masterValues]);
    const [orgModalOpen, setOrgModalOpen] = useState(false);
    useEffect(() => {
        dispatch(fetchMasterValues({ type_code: "country", page: 1, limit: 500 }));
        dispatch(fetchMasterValues({ type_code: "state", page: 1, limit: 1000 }));
        dispatch(fetchMasterValues({ type_code: "city", page: 1, limit: 2000 }));
    }, [dispatch]);

    const fetchOrganizations = useCallback(
        async (selectedOrgId?: string) => {
            try {
                setOrgLoading(true);
                const res = await dispatch(getOrganization({ limit: 100, page: 1 })).unwrap();
                const orgList = res?.data || [];

                setOrganization(orgList);

                if (selectedOrgId) {
                    form.setFieldValue("organization_id", selectedOrgId);
                }

                return orgList;
            } catch (error) {
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
        dispatch(getUsers() as any);
    }, [dispatch, fetchOrganizations]);

    const primaryStreet = Form.useWatch("primary_address_street", form);
    const primaryArea = Form.useWatch("primary_address_area", form);
    const primaryPostalCode = Form.useWatch("primary_address_postal_code", form);
    const primaryCity = Form.useWatch("primary_address_city", form);
    const primaryState = Form.useWatch("primary_address_state", form);
    const primaryCountry = Form.useWatch("primary_address_country", form);

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
        [initialValues],
    );

    useEffect(() => {
        form.setFieldsValue(initialFormValues);
        setCopyAddress(!!initialFormValues.copy_address);
    }, [form, initialFormValues]);

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
        setCopyAddress(checked);

        if (checked) {
            syncPrimaryToAlternate();
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

    useEffect(() => {
        if (copyAddress) {
            syncPrimaryToAlternate();
        }
    }, [
        copyAddress,
        primaryStreet,
        primaryArea,
        primaryPostalCode,
        primaryCity,
        primaryState,
        primaryCountry,
    ]);

    const userOptions = useMemo(() => {
        if (assignedUsers?.length) return assignedUsers;

        return (users || []).map((user: any) => ({
            label: toTitleCase(
                user?.name ||
                `${user?.first_name || ""} ${user?.last_name || ""}`.trim() ||
                user?.email ||
                "Unknown"
            ),
            value: user?.id,
        }));
    }, [assignedUsers, users]);

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

            if (mode === "edit" && contactId) {
                await Client.patch(withTenant(`/contacts/${contactId}`), payload);
                message.success("Contact updated successfully");
                onSuccess?.();
                return;
            }

            const res = await dispatch(createContact(payload)).unwrap();

            if (res?.statusCode === 201 || res?.statusCode === 200) {
                form.resetFields();
                setCopyAddress(false);
                message.success("Contact created successfully");
                onSuccess?.();
                // navigate(`/${slug}/contacts`);
            }
        } catch (error) {
            message.error(mode === "edit" ? "Failed to update contact" : "Failed to create contact");
        } finally {
            setSaveLoading(false);
        }
    };

    return (
        <div>
            <div
                style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: 12,
                    marginBottom: 20,
                    flexWrap: "wrap",
                }}
            >
                <Title level={3} style={{ margin: 0 }}>
                    {mode === "edit" ? "Edit Contact" : "Create Contact"}
                </Title>

                <Space wrap>
                    <Button
                        onClick={() => {
                            if (mode === "edit" && contactId) {
                                navigate(`/${slug}/contacts/${contactId}`);
                                return;
                            }
                            form.resetFields();
                            setCopyAddress(false);
                        }}
                    >
                        Cancel
                    </Button>

                    <Button type="primary" loading={saveLoading} onClick={() => form.submit()}>
                        {mode === "edit" ? "Update" : "Save"}
                    </Button>
                </Space>
            </div>

            <Divider />

            <Form<ContactFormValues>
                form={form}
                layout="vertical"
                initialValues={initialFormValues}
                onFinish={onFinish}
            >
                <Tabs
                    defaultActiveKey="basic"
                    destroyInactiveTabPane={false}
                    items={[
                        {
                            key: "basic",
                            label: "Basic Details",
                            children: (
                                <>
                                    <Title level={5} style={{ marginBottom: 16 }}>
                                        Basic Details
                                    </Title>

                                    <Row gutter={16}>
                                        <Col xs={24} md={12} xl={8}>
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

                                        <Col xs={24} md={12} xl={8}>
                                            <Form.Item
                                                label="Last Name"
                                                name="last_name"
                                                rules={[
                                                    { required: false, message: "Last name is required" },
                                                    // { min: 1, message: "Last name is required" },
                                                    { max: 50, message: "Last name must be at most 50 characters" },
                                                ]}
                                            >
                                                <Input placeholder="Enter last name" />
                                            </Form.Item>
                                        </Col>

                                        <Col xs={24} md={12} xl={8}>
                                            <Form.Item label="Organization Name" name="organization_id">
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

                                        <Col xs={24} md={12} xl={8}>
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
                                                                return Promise.reject(
                                                                    new Error("Enter a valid 10 digit Indian mobile number"),
                                                                );
                                                            }
                                                            return Promise.resolve();
                                                        },
                                                    },
                                                ]}
                                                getValueFromEvent={(e) =>
                                                    e?.target?.value?.replace(/\D/g, "").slice(0, 10)
                                                }
                                            >
                                                <Input placeholder="Enter mobile number" maxLength={10} />
                                            </Form.Item>
                                        </Col>

                                        <Col xs={24} md={12} xl={8}>
                                            <Form.Item label="Assigned To" name="assigned_to">
                                                <Select
                                                    showSearch
                                                    allowClear
                                                    placeholder="Select assigned user"
                                                    optionFilterProp="label"
                                                    options={userOptions}
                                                />
                                            </Form.Item>
                                        </Col>

                                        <Col xs={24} md={12} xl={8}>
                                            <Form.Item label="Birthdate" name="birthdate">
                                                <DatePicker
                                                    style={{ width: "100%" }}
                                                    format="DD MMM YYYY"
                                                    placeholder="Select birthdate"
                                                />
                                            </Form.Item>
                                        </Col>

                                        <Col xs={24} md={12} xl={8}>
                                            <Form.Item
                                                label="Primary Contact"
                                                name="primary_contact"
                                            // rules={[{ required: true, message: "Please select primary contact option" }]}
                                            >
                                                <Select
                                                    placeholder="Select option"
                                                    options={primaryContactOptions}
                                                />
                                            </Form.Item>
                                        </Col>
                                    </Row>
                                </>
                            ),
                        },
                        {
                            key: "emails",
                            label: "Email Addresses",
                            children: (
                                <>
                                    <Title level={5} style={{ marginBottom: 16 }}>
                                        Email Addresses
                                    </Title>

                                    <Form.List name="emails">
                                        {(fields, { add, remove }) => (
                                            <>
                                                {fields.map((field, index) => (
                                                    <div
                                                        key={field.key}
                                                        style={{
                                                            marginBottom: 16,
                                                            padding: 16,
                                                            border: "1px solid var(--ant-color-border, #f0f0f0)",
                                                            borderRadius: 12,
                                                        }}
                                                    >
                                                        <Row gutter={16} align="middle">
                                                            <Col xs={24} md={10} xl={10}>
                                                                <Form.Item
                                                                    {...field}
                                                                    label={index === 0 ? "Email" : `Email ${index + 1}`}
                                                                    name={[field.name, "email"]}
                                                                    rules={[
                                                                        { required: false, message: "Email is required" },
                                                                        {
                                                                            type: "email",
                                                                            message: "Enter a valid email address",
                                                                        },
                                                                    ]}
                                                                >
                                                                    <Input placeholder="Enter email address" />
                                                                </Form.Item>
                                                            </Col>

                                                            <Col xs={24} md={4} xl={4}>
                                                                <Form.Item
                                                                    {...field}
                                                                    label="Primary"
                                                                    name={[field.name, "primary"]}
                                                                    valuePropName="checked"
                                                                >
                                                                    <Checkbox />
                                                                </Form.Item>
                                                            </Col>

                                                            <Col xs={24} md={4} xl={4}>
                                                                <Form.Item
                                                                    {...field}
                                                                    label="Opt Out"
                                                                    name={[field.name, "optOut"]}
                                                                    valuePropName="checked"
                                                                >
                                                                    <Checkbox />
                                                                </Form.Item>
                                                            </Col>

                                                            <Col xs={24} md={4} xl={4}>
                                                                <Form.Item
                                                                    {...field}
                                                                    label="Invalid"
                                                                    name={[field.name, "invalid"]}
                                                                    valuePropName="checked"
                                                                >
                                                                    <Checkbox />
                                                                </Form.Item>
                                                            </Col>

                                                            <Col xs={24} md={2} xl={2}>
                                                                <Space style={{ marginTop: 6 }}>
                                                                    {fields.length > 1 && (
                                                                        <Button
                                                                            danger
                                                                            icon={<MinusOutlined />}
                                                                            onClick={() => remove(field.name)}
                                                                        />
                                                                    )}
                                                                </Space>
                                                            </Col>
                                                        </Row>
                                                    </div>
                                                ))}

                                                <Button
                                                    type="dashed"
                                                    icon={<PlusOutlined />}
                                                    onClick={() =>
                                                        add({
                                                            email: "",
                                                            primary: false,
                                                            optOut: false,
                                                            invalid: false,
                                                        })
                                                    }
                                                >
                                                    Add Email
                                                </Button>
                                            </>
                                        )}
                                    </Form.List>
                                </>
                            ),
                        },
                        {
                            key: "address",
                            label: "Primary Address",
                            children: (
                                <>
                                    <Title level={5} style={{ marginBottom: 16 }}>
                                        Primary Address
                                    </Title>

                                    <AddressSection
                                        countryOptions={countryList}
                                        stateOptions={stateList}
                                        cityOptions={cityList}
                                        copyAddress={copyAddress}
                                        onCopyAddressChange={handleCopyAddressChange}
                                    />
                                </>
                            ),
                        },
                    ]}
                />
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
                            organization_id: values?.id,
                        });

                        // message.success("Organization created successfully");
                    }}
                />
            </Modal>
        </div>
    );
}