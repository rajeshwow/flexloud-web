import { MinusCircleOutlined, PlusOutlined, UserAddOutlined } from "@ant-design/icons";
import {
    Button,
    Card,
    Col,
    Divider,
    Form,
    Input,
    Row,
    Select,
    Space,
    Switch,
    Tabs,
    Typography
} from "antd";
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { fetchMasterValues } from "../../../redux/reducers/masters.slice";
import { getUsers } from "../../../redux/reducers/user.slice";
import type { AppDispatch } from "../../../redux/store";
import { toTitleCase, typeOptions } from "../../../shared/Utils/utils";
import UserCreateModal from "../../Users/UserCreate";

const { Title, Text } = Typography;
const { TextArea } = Input;

export type OrganizationBranchFormValue = {
    id?: string;
    name: string;
    code?: string;
    is_head_office?: boolean;
    contact_person?: string;
    phone?: string;
    email?: string;
    gst_number?: string;
    assigned_to?: string;

    billing_street?: string;
    billing_area?: string;
    billing_postal_code?: string;
    billing_city_id?: string;
    billing_state_id?: string;
    billing_country_id?: string;

    shipping_street?: string;
    shipping_area?: string;
    shipping_postal_code?: string;
    shipping_city_id?: string;
    shipping_state_id?: string;
    shipping_country_id?: string;

    is_shipping_same_as_billing?: boolean;
    status?: "active" | "inactive";
};

export type OrganizationFormValues = {
    name: string;
    gst_number?: string;
    email?: string;
    type?: string;
    industry?: string;
    assigned_to?: string;

    registered_address?: {
        street?: string;
        area?: string;
        postal_code?: string;
        city_id?: string;
        state_id?: string;
        country_id?: string;
    };

    branches: OrganizationBranchFormValue[];
};

type SelectOption = {
    label: string;
    value: string;
};

type Props = {
    // form: any;
    mode: "create" | "edit";
    loading?: boolean;
    onSubmit: (values: OrganizationFormValues) => void | Promise<void>;
    onCancel?: () => void;

    industryOptions?: SelectOption[];
    typeOptions?: SelectOption[];
    userOptions?: SelectOption[];
    cityOptions?: SelectOption[];
    stateOptions?: SelectOption[];
    countryOptions?: SelectOption[];
};

export default function OrganizationForm({
    // form,
    mode,
    loading,
    onSubmit,
    onCancel,

}: Props) {
    const [isUserModalOpen, setIsUserModalOpen] = useState(false);

    const [form] = Form.useForm<OrganizationFormValues>();

    const copyBillingToShipping = (branchIndex: number) => {
        const branches = form.getFieldValue("branches") || [];
        const branch = branches?.[branchIndex] || {};
        form.setFieldValue(["branches", branchIndex, "shipping_street"], branch.billing_street);
        form.setFieldValue(["branches", branchIndex, "shipping_area"], branch.billing_area);
        form.setFieldValue(["branches", branchIndex, "shipping_postal_code"], branch.billing_postal_code);
        form.setFieldValue(["branches", branchIndex, "shipping_city_id"], branch.billing_city_id);
        form.setFieldValue(["branches", branchIndex, "shipping_state_id"], branch.billing_state_id);
        form.setFieldValue(["branches", branchIndex, "shipping_country_id"], branch.billing_country_id);
        form.setFieldValue(["branches", branchIndex, "is_shipping_same_as_billing"], true);
    };
    const dispatch = useDispatch<AppDispatch>();

    const [industryOptions, setIndustryOptions] = useState([] as any[]);
    const [userOptions, setUserOptions] = useState([] as any[]);
    const [cityOptions, setCityOptions] = useState([] as any[]);
    const [stateOptions, setStateOptions] = useState([] as any[]);
    const [countryOptions, setCountryOptions] = useState([] as any[]);


    const fetchMasterOptions = async () => {
        try {
            const [industryRes, usersRes, cityRes, stateRes, countryRes] = await Promise.all([
                dispatch(
                    fetchMasterValues({
                        type_code: "industry",
                        limit: 500,
                    })
                ).unwrap(),

                dispatch(
                    getUsers({
                        page: 1,
                        limit: 500,
                    })
                ).unwrap(),

                dispatch(
                    fetchMasterValues({
                        type_code: "city",
                        limit: 500,
                    })
                ).unwrap(),

                dispatch(
                    fetchMasterValues({
                        type_code: "state",
                        limit: 500,
                    })
                ).unwrap(),

                dispatch(
                    fetchMasterValues({
                        type_code: "country",
                        limit: 500,
                    })
                ).unwrap(),
            ]);

            setIndustryOptions(
                (industryRes?.data || []).map((item: any) => ({
                    label: item.label,
                    value: item.id,
                }))
            );

            setUserOptions(
                (usersRes?.data || []).map((item: any) => ({
                    label: toTitleCase(item.name),
                    value: item.id,
                }))
            );

            setCityOptions(
                (cityRes?.data || []).map((item: any) => ({
                    label: item.label,
                    value: item.id,
                }))
            );

            setStateOptions(
                (stateRes?.data || []).map((item: any) => ({
                    label: item.label,
                    value: item.id,
                }))
            );

            setCountryOptions(
                (countryRes?.data || []).map((item: any) => ({
                    label: item.label,
                    value: item.id,
                }))
            );
        } catch (error) {
            console.error("Failed to load dropdown options", error);
        }
    };

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        fetchMasterOptions();
    }, [dispatch]);

    return (
        <>
            <Form
                form={form}
                layout="vertical"
                onFinish={onSubmit}
                initialValues={{
                    registered_address: {},
                    branches: [
                        {
                            name: "Head Office",
                            is_head_office: true,
                            is_shipping_same_as_billing: false,
                            status: "active",
                        },
                    ],
                }}
            >
                <Card
                    bordered={false}
                    style={{
                        borderRadius: 14,
                        minHeight: "calc(100vh - 150px)",
                    }}
                    bodyStyle={{ padding: 24 }}
                >
                    <Title level={4} style={{ marginBottom: 22 }}>
                        {mode === "create" ? "Create Organization" : "Edit Organization"}
                    </Title>

                    <Row gutter={24}>
                        <Col xs={24} md={12} lg={8}>
                            <Form.Item
                                label="Organization Name"
                                name="name"
                                rules={[{ required: true, message: "Please enter organization name" }]}
                            >
                                <Input placeholder="Enter organization name" />
                            </Form.Item>
                        </Col>

                        <Col xs={24} md={12} lg={8}>
                            <Form.Item label="Type" name="type">
                                <Select
                                    allowClear
                                    showSearch
                                    placeholder="Select type"
                                    options={typeOptions}
                                    optionFilterProp="label"
                                />
                            </Form.Item>
                        </Col>

                        <Col xs={24} md={12} lg={8}>
                            <Form.Item label="Industry" name="industry">
                                <Select
                                    allowClear
                                    showSearch
                                    placeholder="Select industry"
                                    options={industryOptions}
                                    optionFilterProp="label"
                                />
                            </Form.Item>
                        </Col>

                        <Col xs={24} md={12} lg={8}>
                            <Form.Item
                                label="Email Address"
                                name="email"
                                rules={[{ type: "email", message: "Please enter valid email" }]}
                            >
                                <Input placeholder="Enter email" />
                            </Form.Item>
                        </Col>

                        <Col xs={24} md={12} lg={8}>
                            <Form.Item label="GST Number" name="gst_number">
                                <Input placeholder="Enter GST number" />
                            </Form.Item>
                        </Col>

                        <Col xs={24} md={12} lg={8}>
                            <Form.Item label="Assigned To" name="assigned_to">
                                <Select
                                    allowClear
                                    showSearch
                                    placeholder="Select user"
                                    options={userOptions}
                                    optionFilterProp="label"
                                    dropdownRender={(menu) => (
                                        <>
                                            <Button
                                                type="primary"
                                                icon={<UserAddOutlined />}
                                                block
                                                style={{ textAlign: "left", marginBottom: 6, }}
                                                onClick={() => setIsUserModalOpen(true)}
                                            >
                                                New User
                                            </Button>

                                            <Divider style={{ margin: "6px 0" }} />

                                            {menu}
                                        </>
                                    )}
                                />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Tabs
                        defaultActiveKey="other"
                        style={{ marginTop: 12 }}
                        items={[
                            {
                                key: "other",
                                label: "Other Details",
                                children: (
                                    <>
                                        <Form.List name="branches">
                                            {(fields, { add, remove }) => (
                                                <>
                                                    {fields.map((field, index) => (
                                                        <Card
                                                            key={field.key}
                                                            size="small"
                                                            style={{
                                                                marginBottom: 16,
                                                                borderRadius: 12,
                                                            }}
                                                            title={`Branch ${index + 1}`}
                                                            extra={
                                                                fields.length > 1 ? (
                                                                    <Button
                                                                        danger
                                                                        type="text"
                                                                        icon={<MinusCircleOutlined />}
                                                                        onClick={() => remove(field.name)}
                                                                    >
                                                                        Remove
                                                                    </Button>
                                                                ) : null
                                                            }
                                                        >
                                                            <Row gutter={20}>
                                                                <Col xs={24} md={12} lg={8}>
                                                                    <Form.Item
                                                                        label="Branch Name"
                                                                        name={[field.name, "name"]}
                                                                    // rules={[
                                                                    //     {
                                                                    //         required: true,
                                                                    //         message: "Please enter branch name",
                                                                    //     },
                                                                    // ]}
                                                                    >
                                                                        <Input placeholder="Enter branch name" />
                                                                    </Form.Item>
                                                                </Col>

                                                                <Col xs={24} md={12} lg={8}>
                                                                    <Form.Item label="Code" name={[field.name, "code"]}>
                                                                        <Input placeholder="Enter branch code" />
                                                                    </Form.Item>
                                                                </Col>

                                                                <Col xs={24} md={12} lg={8}>
                                                                    <Form.Item
                                                                        label="Status"
                                                                        name={[field.name, "status"]}
                                                                        initialValue="active"
                                                                    >
                                                                        <Select
                                                                            options={[
                                                                                { label: "Active", value: "active" },
                                                                                { label: "Inactive", value: "inactive" },
                                                                            ]}
                                                                        />
                                                                    </Form.Item>
                                                                </Col>

                                                                <Col xs={24} md={12} lg={8}>
                                                                    <Form.Item
                                                                        label="Contact Person"
                                                                        name={[field.name, "contact_person"]}
                                                                    >
                                                                        <Input placeholder="Enter contact person" />
                                                                    </Form.Item>
                                                                </Col>

                                                                <Col xs={24} md={12} lg={8}>
                                                                    <Form.Item label="Phone" name={[field.name, "phone"]}>
                                                                        <Input placeholder="Enter phone" />
                                                                    </Form.Item>
                                                                </Col>

                                                                <Col xs={24} md={12} lg={8}>
                                                                    <Form.Item
                                                                        label="Email"
                                                                        name={[field.name, "email"]}
                                                                        rules={[
                                                                            {
                                                                                type: "email",
                                                                                message: "Please enter valid email",
                                                                            },
                                                                        ]}
                                                                    >
                                                                        <Input placeholder="Enter email" />
                                                                    </Form.Item>
                                                                </Col>

                                                                <Col xs={24} md={12} lg={8}>
                                                                    <Form.Item
                                                                        label="GST Number"
                                                                        name={[field.name, "gst_number"]}
                                                                    >
                                                                        <Input placeholder="Enter GST number" />
                                                                    </Form.Item>
                                                                </Col>

                                                                <Col xs={24} md={12} lg={8}>
                                                                    <Form.Item
                                                                        label="Assigned To"
                                                                        name={[field.name, "assigned_to"]}
                                                                    >
                                                                        <Select
                                                                            allowClear
                                                                            showSearch
                                                                            placeholder="Select user"
                                                                            options={userOptions}
                                                                            optionFilterProp="label"
                                                                        />
                                                                    </Form.Item>
                                                                </Col>

                                                                <Col xs={24} md={12} lg={8}>
                                                                    <Form.Item
                                                                        label="Head Office"
                                                                        name={[field.name, "is_head_office"]}
                                                                        valuePropName="checked"
                                                                    >
                                                                        <Switch />
                                                                    </Form.Item>
                                                                </Col>
                                                            </Row>
                                                        </Card>
                                                    ))}

                                                    <Button
                                                        type="dashed"
                                                        icon={<PlusOutlined />}
                                                        onClick={() =>
                                                            add({
                                                                name: "",
                                                                is_head_office: false,
                                                                is_shipping_same_as_billing: false,
                                                                status: "active",
                                                            })
                                                        }
                                                    >
                                                        Add Branch
                                                    </Button>

                                                    <div style={{ marginTop: 12 }}>
                                                        <Text type="secondary">
                                                            Keep exactly one branch as head office.
                                                        </Text>
                                                    </div>
                                                </>
                                            )}
                                        </Form.List>
                                    </>
                                ),
                            },
                            {
                                key: "address",
                                label: "Address",
                                children: (
                                    <>
                                        <Card
                                            size="small"
                                            bordered={false}
                                            style={{
                                                borderRadius: 12,
                                                marginBottom: 18,
                                            }}
                                        >
                                            <Title level={5} style={{ marginBottom: 18 }}>
                                                Registered Address
                                            </Title>

                                            <Row gutter={24}>
                                                <Col xs={24} md={12} lg={8}>
                                                    <Form.Item label="Street" name={["registered_address", "street"]}>
                                                        <TextArea rows={2} placeholder="Street" />
                                                    </Form.Item>
                                                </Col>

                                                <Col xs={24} md={12} lg={8}>
                                                    <Form.Item label="Area" name={["registered_address", "area"]}>
                                                        <TextArea rows={2} placeholder="Area" />
                                                    </Form.Item>
                                                </Col>

                                                <Col xs={24} md={12} lg={8}>
                                                    <Form.Item
                                                        label="Postal Code"
                                                        name={["registered_address", "postal_code"]}
                                                    >
                                                        <Input placeholder="Enter postal code" />
                                                    </Form.Item>
                                                </Col>

                                                <Col xs={24} md={12} lg={8}>
                                                    <Form.Item label="City" name={["registered_address", "city_id"]}>
                                                        <Select
                                                            allowClear
                                                            showSearch
                                                            placeholder="Select city"
                                                            options={cityOptions}
                                                            optionFilterProp="label"
                                                        />
                                                    </Form.Item>
                                                </Col>

                                                <Col xs={24} md={12} lg={8}>
                                                    <Form.Item label="State" name={["registered_address", "state_id"]}>
                                                        <Select
                                                            allowClear
                                                            showSearch
                                                            placeholder="Select state"
                                                            options={stateOptions}
                                                            optionFilterProp="label"
                                                        />
                                                    </Form.Item>
                                                </Col>

                                                <Col xs={24} md={12} lg={8}>
                                                    <Form.Item
                                                        label="Country"
                                                        name={["registered_address", "country_id"]}
                                                    >
                                                        <Select
                                                            allowClear
                                                            showSearch
                                                            placeholder="Select country"
                                                            options={countryOptions}
                                                            optionFilterProp="label"
                                                        />
                                                    </Form.Item>
                                                </Col>
                                            </Row>
                                        </Card>

                                        <Form.List name="branches">
                                            {(fields) => (
                                                <>
                                                    {fields.map((field, index) => (
                                                        <Card
                                                            key={field.key}
                                                            size="small"
                                                            style={{
                                                                borderRadius: 12,
                                                                marginBottom: 16,
                                                            }}
                                                            title={`Branch ${index + 1} Address`}
                                                        >
                                                            <Row gutter={32}>
                                                                <Col xs={24} lg={12}>
                                                                    <Title level={5}>Billing Address</Title>

                                                                    <Form.Item
                                                                        label="Street"
                                                                        name={[field.name, "billing_street"]}
                                                                    >
                                                                        <TextArea rows={2} placeholder="Street" />
                                                                    </Form.Item>

                                                                    <Form.Item
                                                                        label="Area"
                                                                        name={[field.name, "billing_area"]}
                                                                    >
                                                                        <TextArea rows={2} placeholder="Area" />
                                                                    </Form.Item>

                                                                    <Row gutter={16}>
                                                                        <Col xs={24} md={12}>
                                                                            <Form.Item
                                                                                label="Country"
                                                                                name={[field.name, "billing_country_id"]}
                                                                            >
                                                                                <Select
                                                                                    allowClear
                                                                                    showSearch
                                                                                    placeholder="Select country"
                                                                                    options={countryOptions}
                                                                                    optionFilterProp="label"
                                                                                />
                                                                            </Form.Item>
                                                                        </Col>

                                                                        <Col xs={24} md={12}>
                                                                            <Form.Item
                                                                                label="State"
                                                                                name={[field.name, "billing_state_id"]}
                                                                            >
                                                                                <Select
                                                                                    allowClear
                                                                                    showSearch
                                                                                    placeholder="Select state"
                                                                                    options={stateOptions}
                                                                                    optionFilterProp="label"
                                                                                />
                                                                            </Form.Item>
                                                                        </Col>

                                                                        <Col xs={24} md={12}>
                                                                            <Form.Item
                                                                                label="City"
                                                                                name={[field.name, "billing_city_id"]}
                                                                            >
                                                                                <Select
                                                                                    allowClear
                                                                                    showSearch
                                                                                    placeholder="Select city"
                                                                                    options={cityOptions}
                                                                                    optionFilterProp="label"
                                                                                />
                                                                            </Form.Item>
                                                                        </Col>

                                                                        <Col xs={24} md={12}>
                                                                            <Form.Item
                                                                                label="Pin Code"
                                                                                name={[
                                                                                    field.name,
                                                                                    "billing_postal_code",
                                                                                ]}
                                                                            >
                                                                                <Input placeholder="Enter pin code" />
                                                                            </Form.Item>
                                                                        </Col>
                                                                    </Row>
                                                                </Col>

                                                                <Col xs={24} lg={12}>
                                                                    <Space
                                                                        align="center"
                                                                        style={{
                                                                            width: "100%",
                                                                            justifyContent: "space-between",
                                                                            marginBottom: 8,
                                                                        }}
                                                                    >
                                                                        <Title level={5} style={{ marginBottom: 0 }}>
                                                                            Shipping Address
                                                                        </Title>

                                                                        <Button
                                                                            type="link"
                                                                            size="small"
                                                                            onClick={() => copyBillingToShipping(index)}
                                                                        >
                                                                            Copy billing address
                                                                        </Button>
                                                                    </Space>

                                                                    <Form.Item
                                                                        label="Street"
                                                                        name={[field.name, "shipping_street"]}
                                                                    >
                                                                        <TextArea rows={2} placeholder="Street" />
                                                                    </Form.Item>

                                                                    <Form.Item
                                                                        label="Area"
                                                                        name={[field.name, "shipping_area"]}
                                                                    >
                                                                        <TextArea rows={2} placeholder="Area" />
                                                                    </Form.Item>

                                                                    <Row gutter={16}>
                                                                        <Col xs={24} md={12}>
                                                                            <Form.Item
                                                                                label="Country"
                                                                                name={[
                                                                                    field.name,
                                                                                    "shipping_country_id",
                                                                                ]}
                                                                            >
                                                                                <Select
                                                                                    allowClear
                                                                                    showSearch
                                                                                    placeholder="Select country"
                                                                                    options={countryOptions}
                                                                                    optionFilterProp="label"
                                                                                />
                                                                            </Form.Item>
                                                                        </Col>

                                                                        <Col xs={24} md={12}>
                                                                            <Form.Item
                                                                                label="State"
                                                                                name={[field.name, "shipping_state_id"]}
                                                                            >
                                                                                <Select
                                                                                    allowClear
                                                                                    showSearch
                                                                                    placeholder="Select state"
                                                                                    options={stateOptions}
                                                                                    optionFilterProp="label"
                                                                                />
                                                                            </Form.Item>
                                                                        </Col>

                                                                        <Col xs={24} md={12}>
                                                                            <Form.Item
                                                                                label="City"
                                                                                name={[field.name, "shipping_city_id"]}
                                                                            >
                                                                                <Select
                                                                                    allowClear
                                                                                    showSearch
                                                                                    placeholder="Select city"
                                                                                    options={cityOptions}
                                                                                    optionFilterProp="label"
                                                                                />
                                                                            </Form.Item>
                                                                        </Col>

                                                                        <Col xs={24} md={12}>
                                                                            <Form.Item
                                                                                label="Pin Code"
                                                                                name={[
                                                                                    field.name,
                                                                                    "shipping_postal_code",
                                                                                ]}
                                                                            >
                                                                                <Input placeholder="Enter pin code" />
                                                                            </Form.Item>
                                                                        </Col>
                                                                    </Row>

                                                                    <Form.Item
                                                                        label="Shipping Same As Billing"
                                                                        name={[
                                                                            field.name,
                                                                            "is_shipping_same_as_billing",
                                                                        ]}
                                                                        valuePropName="checked"
                                                                    >
                                                                        <Switch />
                                                                    </Form.Item>
                                                                </Col>
                                                            </Row>
                                                        </Card>
                                                    ))}
                                                </>
                                            )}
                                        </Form.List>
                                    </>
                                ),
                            },
                            {
                                key: "contacts",
                                label: "Contact Persons",
                                children: (
                                    <Form.List name="branches">
                                        {(fields) => (
                                            <>
                                                {fields.map((field, index) => (
                                                    <Card
                                                        key={field.key}
                                                        size="small"
                                                        style={{
                                                            borderRadius: 12,
                                                            marginBottom: 16,
                                                        }}
                                                        title={`Contact Person - Branch ${index + 1}`}
                                                    >
                                                        <Row gutter={16}>
                                                            <Col xs={24} md={12} lg={6}>
                                                                <Form.Item
                                                                    label="Contact Person"
                                                                    name={[field.name, "contact_person"]}
                                                                >
                                                                    <Input placeholder="Enter contact person" />
                                                                </Form.Item>
                                                            </Col>

                                                            <Col xs={24} md={12} lg={6}>
                                                                <Form.Item label="Email Address" name={[field.name, "email"]}>
                                                                    <Input placeholder="Enter email" />
                                                                </Form.Item>
                                                            </Col>

                                                            <Col xs={24} md={12} lg={6}>
                                                                <Form.Item label="Phone" name={[field.name, "phone"]}>
                                                                    <Input placeholder="Enter phone" />
                                                                </Form.Item>
                                                            </Col>

                                                            <Col xs={24} md={12} lg={6}>
                                                                <Form.Item label="Assigned To" name={[field.name, "assigned_to"]}>
                                                                    <Select
                                                                        allowClear
                                                                        showSearch
                                                                        placeholder="Select user"
                                                                        options={userOptions}
                                                                        optionFilterProp="label"
                                                                    />
                                                                </Form.Item>
                                                            </Col>
                                                        </Row>
                                                    </Card>
                                                ))}
                                            </>
                                        )}
                                    </Form.List>
                                ),
                            },

                            {
                                key: "remarks",
                                label: "Remarks",
                                children: (
                                    <Card size="small" style={{ borderRadius: 12 }}>
                                        <TextArea rows={5} placeholder="Add remarks..." />
                                    </Card>
                                ),
                            },
                        ]}
                    />

                    <Divider />

                    <Space>
                        <Button type="primary" htmlType="submit" loading={loading}>
                            {mode === "create" ? "Save" : "Save Changes"}
                        </Button>

                        {onCancel ? <Button onClick={onCancel}>Cancel</Button> : null}
                    </Space>
                </Card>
            </Form>



            <UserCreateModal open={isUserModalOpen} onClose={() => setIsUserModalOpen(false)} onSuccess={() => setIsUserModalOpen(false)} />

        </>

    );
}