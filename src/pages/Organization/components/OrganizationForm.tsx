import { MinusCircleOutlined, PlusOutlined } from "@ant-design/icons";
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
    Typography,
} from "antd";

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
    form: any;
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
    form,
    mode,
    loading,
    onSubmit,
    onCancel,
    industryOptions = [],
    typeOptions = [],
    userOptions = [],
    cityOptions = [],
    stateOptions = [],
    countryOptions = [],
}: Props) {
    return (
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
            <Card>
                <Title level={4} style={{ marginBottom: 20 }}>
                    {mode === "create" ? "Create Organization" : "Edit Organization"}
                </Title>

                <Row gutter={16}>
                    <Col xs={24} md={8}>
                        <Form.Item
                            label="Organization Name"
                            name="name"
                            rules={[{ required: true, message: "Please enter organization name" }]}
                        >
                            <Input placeholder="Enter organization name" />
                        </Form.Item>
                    </Col>

                    <Col xs={24} md={8}>
                        <Form.Item label="GST Number" name="gst_number">
                            <Input placeholder="Enter GST number" />
                        </Form.Item>
                    </Col>

                    <Col xs={24} md={8}>
                        <Form.Item
                            label="Email"
                            name="email"
                            rules={[{ type: "email", message: "Please enter valid email" }]}
                        >
                            <Input placeholder="Enter email" />
                        </Form.Item>
                    </Col>

                    <Col xs={24} md={8}>
                        <Form.Item label="Type" name="type">
                            <Select
                                allowClear
                                showSearch
                                placeholder="Select type"
                                options={typeOptions}
                            />
                        </Form.Item>
                    </Col>

                    <Col xs={24} md={8}>
                        <Form.Item label="Industry" name="industry">
                            <Select
                                allowClear
                                showSearch
                                placeholder="Select industry"
                                options={industryOptions}
                            />
                        </Form.Item>
                    </Col>

                    <Col xs={24} md={8}>
                        <Form.Item label="Assigned To" name="assigned_to">
                            <Select
                                allowClear
                                showSearch
                                placeholder="Select user"
                                options={userOptions}
                            />
                        </Form.Item>
                    </Col>
                </Row>

                <Divider >Registered Address</Divider>

                <Row gutter={16}>
                    <Col xs={24} md={8}>
                        <Form.Item label="Street" name={["registered_address", "street"]}>
                            <Input placeholder="Enter street" />
                        </Form.Item>
                    </Col>

                    <Col xs={24} md={8}>
                        <Form.Item label="Area" name={["registered_address", "area"]}>
                            <Input placeholder="Enter area" />
                        </Form.Item>
                    </Col>

                    <Col xs={24} md={8}>
                        <Form.Item label="Postal Code" name={["registered_address", "postal_code"]}>
                            <Input placeholder="Enter postal code" />
                        </Form.Item>
                    </Col>

                    <Col xs={24} md={8}>
                        <Form.Item label="City" name={["registered_address", "city_id"]}>
                            <Select
                                allowClear
                                showSearch
                                placeholder="Select city"
                                options={cityOptions}
                            />
                        </Form.Item>
                    </Col>

                    <Col xs={24} md={8}>
                        <Form.Item label="State" name={["registered_address", "state_id"]}>
                            <Select
                                allowClear
                                showSearch
                                placeholder="Select state"
                                options={stateOptions}
                            />
                        </Form.Item>
                    </Col>

                    <Col xs={24} md={8}>
                        <Form.Item label="Country" name={["registered_address", "country_id"]}>
                            <Select
                                allowClear
                                showSearch
                                placeholder="Select country"
                                options={countryOptions}
                            />
                        </Form.Item>
                    </Col>
                </Row>

                <Divider >Branches</Divider>

                <Form.List name="branches">
                    {(fields, { add, remove }) => (
                        <>
                            {fields.map((field, index) => (
                                <Card
                                    key={field.key}
                                    size="small"
                                    style={{ marginBottom: 16 }}
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
                                    <Row gutter={16}>
                                        <Col xs={24} md={8}>
                                            <Form.Item
                                                label="Branch Name"
                                                name={[field.name, "name"]}
                                                rules={[{ required: true, message: "Please enter branch name" }]}
                                            >
                                                <Input placeholder="Enter branch name" />
                                            </Form.Item>
                                        </Col>

                                        <Col xs={24} md={8}>
                                            <Form.Item label="Code" name={[field.name, "code"]}>
                                                <Input placeholder="Enter branch code" />
                                            </Form.Item>
                                        </Col>

                                        <Col xs={24} md={8}>
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

                                        <Col xs={24} md={8}>
                                            <Form.Item
                                                label="Contact Person"
                                                name={[field.name, "contact_person"]}
                                            >
                                                <Input placeholder="Enter contact person" />
                                            </Form.Item>
                                        </Col>

                                        <Col xs={24} md={8}>
                                            <Form.Item label="Phone" name={[field.name, "phone"]}>
                                                <Input placeholder="Enter phone" />
                                            </Form.Item>
                                        </Col>

                                        <Col xs={24} md={8}>
                                            <Form.Item
                                                label="Email"
                                                name={[field.name, "email"]}
                                                rules={[{ type: "email", message: "Please enter valid email" }]}
                                            >
                                                <Input placeholder="Enter email" />
                                            </Form.Item>
                                        </Col>

                                        <Col xs={24} md={8}>
                                            <Form.Item label="GST Number" name={[field.name, "gst_number"]}>
                                                <Input placeholder="Enter GST number" />
                                            </Form.Item>
                                        </Col>

                                        <Col xs={24} md={8}>
                                            <Form.Item label="Assigned To" name={[field.name, "assigned_to"]}>
                                                <Select
                                                    allowClear
                                                    showSearch
                                                    placeholder="Select user"
                                                    options={userOptions}
                                                />
                                            </Form.Item>
                                        </Col>

                                        <Col xs={24} md={8}>
                                            <Form.Item
                                                label="Head Office"
                                                name={[field.name, "is_head_office"]}
                                                valuePropName="checked"
                                            >
                                                <Switch />
                                            </Form.Item>
                                        </Col>
                                    </Row>

                                    <Divider style={{ marginTop: 0 }}>
                                        Billing Address
                                    </Divider>

                                    <Row gutter={16}>
                                        <Col xs={24} md={8}>
                                            <Form.Item label="Street" name={[field.name, "billing_street"]}>
                                                <Input placeholder="Enter street" />
                                            </Form.Item>
                                        </Col>

                                        <Col xs={24} md={8}>
                                            <Form.Item label="Area" name={[field.name, "billing_area"]}>
                                                <Input placeholder="Enter area" />
                                            </Form.Item>
                                        </Col>

                                        <Col xs={24} md={8}>
                                            <Form.Item
                                                label="Postal Code"
                                                name={[field.name, "billing_postal_code"]}
                                            >
                                                <Input placeholder="Enter postal code" />
                                            </Form.Item>
                                        </Col>

                                        <Col xs={24} md={8}>
                                            <Form.Item label="City" name={[field.name, "billing_city_id"]}>
                                                <Select
                                                    allowClear
                                                    showSearch
                                                    placeholder="Select city"
                                                    options={cityOptions}
                                                />
                                            </Form.Item>
                                        </Col>

                                        <Col xs={24} md={8}>
                                            <Form.Item label="State" name={[field.name, "billing_state_id"]}>
                                                <Select
                                                    allowClear
                                                    showSearch
                                                    placeholder="Select state"
                                                    options={stateOptions}
                                                />
                                            </Form.Item>
                                        </Col>

                                        <Col xs={24} md={8}>
                                            <Form.Item label="Country" name={[field.name, "billing_country_id"]}>
                                                <Select
                                                    allowClear
                                                    showSearch
                                                    placeholder="Select country"
                                                    options={countryOptions}
                                                />
                                            </Form.Item>
                                        </Col>
                                    </Row>

                                    <Row gutter={16}>
                                        <Col xs={24} md={8}>
                                            <Form.Item
                                                label="Shipping Same As Billing"
                                                name={[field.name, "is_shipping_same_as_billing"]}
                                                valuePropName="checked"
                                            >
                                                <Switch />
                                            </Form.Item>
                                        </Col>
                                    </Row>

                                    <Form.Item
                                        shouldUpdate={(prev, curr) =>
                                            prev?.branches?.[index]?.is_shipping_same_as_billing !==
                                            curr?.branches?.[index]?.is_shipping_same_as_billing
                                        }
                                        noStyle
                                    >
                                        {() => {
                                            const sameAsBilling = form.getFieldValue([
                                                "branches",
                                                field.name,
                                                "is_shipping_same_as_billing",
                                            ]);

                                            if (sameAsBilling) return null;

                                            return (
                                                <>
                                                    <Divider >Shipping Address</Divider>

                                                    <Row gutter={16}>
                                                        <Col xs={24} md={8}>
                                                            <Form.Item
                                                                label="Street"
                                                                name={[field.name, "shipping_street"]}
                                                            >
                                                                <Input placeholder="Enter street" />
                                                            </Form.Item>
                                                        </Col>

                                                        <Col xs={24} md={8}>
                                                            <Form.Item
                                                                label="Area"
                                                                name={[field.name, "shipping_area"]}
                                                            >
                                                                <Input placeholder="Enter area" />
                                                            </Form.Item>
                                                        </Col>

                                                        <Col xs={24} md={8}>
                                                            <Form.Item
                                                                label="Postal Code"
                                                                name={[field.name, "shipping_postal_code"]}
                                                            >
                                                                <Input placeholder="Enter postal code" />
                                                            </Form.Item>
                                                        </Col>

                                                        <Col xs={24} md={8}>
                                                            <Form.Item
                                                                label="City"
                                                                name={[field.name, "shipping_city_id"]}
                                                            >
                                                                <Select
                                                                    allowClear
                                                                    showSearch
                                                                    placeholder="Select city"
                                                                    options={cityOptions}
                                                                />
                                                            </Form.Item>
                                                        </Col>

                                                        <Col xs={24} md={8}>
                                                            <Form.Item
                                                                label="State"
                                                                name={[field.name, "shipping_state_id"]}
                                                            >
                                                                <Select
                                                                    allowClear
                                                                    showSearch
                                                                    placeholder="Select state"
                                                                    options={stateOptions}
                                                                />
                                                            </Form.Item>
                                                        </Col>

                                                        <Col xs={24} md={8}>
                                                            <Form.Item
                                                                label="Country"
                                                                name={[field.name, "shipping_country_id"]}
                                                            >
                                                                <Select
                                                                    allowClear
                                                                    showSearch
                                                                    placeholder="Select country"
                                                                    options={countryOptions}
                                                                />
                                                            </Form.Item>
                                                        </Col>
                                                    </Row>
                                                </>
                                            );
                                        }}
                                    </Form.Item>
                                </Card>
                            ))}

                            <Button
                                type="dashed"
                                block
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
                        </>
                    )}
                </Form.List>

                <Space style={{ marginTop: 24 }}>
                    <Button type="primary" htmlType="submit" loading={loading}>
                        {mode === "create" ? "Create Organization" : "Save Changes"}
                    </Button>

                    {onCancel ? <Button onClick={onCancel}>Cancel</Button> : null}
                </Space>

                <div style={{ marginTop: 12 }}>
                    <Text type="secondary">
                        Keep exactly one branch as head office.
                    </Text>
                </div>
            </Card>
        </Form>
    );
}