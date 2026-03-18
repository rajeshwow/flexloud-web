import {
    Button,
    Card,
    Checkbox,
    Col,
    Collapse,
    DatePicker,
    Divider,
    Form,
    Input,
    message,
    Row,
    Select,
    Space,
    Switch,
    Typography,
} from "antd";
import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
    createOrganization,
    type CreateOrganizationPayload,
} from "../../redux/reducers/organization.slice";
import { getUsers } from "../../redux/reducers/user.slice";
import type { AppDispatch } from "../../redux/store";

const { Panel } = Collapse;
const { Option } = Select;
const { Title } = Typography;

const OrganizationCreate: React.FC = () => {
    const [form] = Form.useForm();
    const dispatch = useDispatch<AppDispatch>();

    const users = useSelector((state: any) => state.users?.userList);

    useEffect(() => {
        dispatch(getUsers());
    }, [dispatch]);

    const copyRegisteredToBranchBilling = (branchIndex: number, checked: boolean) => {
        if (!checked) return;

        const values = form.getFieldsValue();
        const registered = values.registeredAddress || {};

        const branches = [...(values.branches || [])];
        branches[branchIndex] = {
            ...(branches[branchIndex] || {}),
            billingStreet: registered.street || "",
            billingArea: registered.area || "",
            billingPostal: registered.postal || "",
            billingCity: registered.city || "",
            billingState: registered.state || "",
            billingCountry: registered.country || "",
        };

        form.setFieldsValue({ branches });
    };

    const copyBillingToShipping = (branchIndex: number, checked: boolean) => {
        const values = form.getFieldsValue();
        const branches = [...(values.branches || [])];
        const currentBranch = branches[branchIndex] || {};

        if (checked) {
            branches[branchIndex] = {
                ...currentBranch,
                shippingStreet: currentBranch.billingStreet || "",
                shippingArea: currentBranch.billingArea || "",
                shippingPostal: currentBranch.billingPostal || "",
                shippingCity: currentBranch.billingCity || "",
                shippingState: currentBranch.billingState || "",
                shippingCountry: currentBranch.billingCountry || "",
                isShippingSameAsBilling: true,
            };
        } else {
            branches[branchIndex] = {
                ...currentBranch,
                isShippingSameAsBilling: false,
            };
        }

        form.setFieldsValue({ branches });
    };

    const onFinish = async (values: any) => {
        const headOfficeBranches =
            values?.branches?.filter((b: any) => b?.isHeadOffice) || [];

        if (!values?.branches?.length) {
            return message.error("At least one branch is required");
        }

        if (headOfficeBranches.length > 1) {
            return message.error("Only one head office branch is allowed");
        }

        const payload: CreateOrganizationPayload = {
            name: values.name,
            gst_number: values.gst || null,
            email: values.email || null,
            next_followup_at: values.followup ? values.followup.toISOString() : null,

            type: values.type || null,
            industry: values.industry || null,

            assigned_to: values.assignedTo || null,

            registered_address: {
                street: values.registeredAddress?.street || null,
                area: values.registeredAddress?.area || null,
                postal_code: values.registeredAddress?.postal || null,
                city: values.registeredAddress?.city || null,
                state: values.registeredAddress?.state || null,
                country: values.registeredAddress?.country || null,
            },

            branches: (values.branches || []).map((branch: any) => ({
                name: branch.name,
                code: branch.code || null,
                is_head_office: !!branch.isHeadOffice,

                contact_person: branch.contactPerson || null,
                phone: branch.phone || null,
                email: branch.email || null,
                gst_number: branch.gst || null,

                assigned_to: branch.assignedTo || null,

                billing_street: branch.billingStreet || null,
                billing_area: branch.billingArea || null,
                billing_postal_code: branch.billingPostal || null,
                billing_city: branch.billingCity || null,
                billing_state: branch.billingState || null,
                billing_country: branch.billingCountry || null,

                shipping_street: branch.shippingStreet || null,
                shipping_area: branch.shippingArea || null,
                shipping_postal_code: branch.shippingPostal || null,
                shipping_city: branch.shippingCity || null,
                shipping_state: branch.shippingState || null,
                shipping_country: branch.shippingCountry || null,

                is_shipping_same_as_billing: !!branch.isShippingSameAsBilling,
                status: branch.status || "active",
            })),
        };

        try {
            await dispatch(createOrganization(payload)).unwrap();
            message.success("Organization created successfully");
            form.resetFields();

            form.setFieldsValue({
                branches: [
                    {
                        name: "Head Office",
                        isHeadOffice: true,
                        status: "active",
                        isShippingSameAsBilling: false,
                    },
                ],
            });
        } catch (error: any) {
            message.error(error || "Failed to create organization");
        }
    };

    return (
        <Space orientation="vertical"
            size={16}
            style={{ width: "100%" }}>
            <div>
                <Title level={4} style={{ margin: 0 }}>
                    Create Organization
                </Title>

            </div>

            <Divider />
            <Form
                layout="vertical"
                form={form}
                onFinish={onFinish}
                style={{ padding: 20 }}
                initialValues={{
                    branches: [
                        {
                            name: "Head Office",
                            isHeadOffice: true,
                            status: "active",
                            isShippingSameAsBilling: false,
                        },
                    ],
                }}
            >
                <div>
                    <Title level={4} style={{ marginBottom: 16 }}>
                        Overview
                    </Title>

                    <Row gutter={16}>
                        <Col span={8}>
                            <Form.Item
                                label="Organization Name"
                                name="name"
                                rules={[{ required: true, message: "Organization name is required" }]}
                            >
                                <Input />
                            </Form.Item>
                        </Col>

                        <Col span={8}>
                            <Form.Item label="GST Number" name="gst">
                                <Input />
                            </Form.Item>
                        </Col>

                        <Col span={8}>
                            <Form.Item
                                label="Email Address"
                                name="email"
                                rules={[{ type: "email", message: "Invalid email" }]}
                            >
                                <Input />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Row gutter={16}>
                        <Col span={8}>
                            <Form.Item label="Next Followup Date" name="followup">
                                <DatePicker style={{ width: "100%" }} showTime />
                            </Form.Item>
                        </Col>

                        <Col span={8}>
                            <Form.Item label="Type" name="type">
                                <Select placeholder="Select type">
                                    <Option value="customer">Customer</Option>
                                    <Option value="vendor">Vendor</Option>
                                    <Option value="partner">Partner</Option>
                                </Select>
                            </Form.Item>
                        </Col>

                        <Col span={8}>
                            <Form.Item label="Industry" name="industry">
                                <Select placeholder="Select industry">
                                    <Option value="health">Healthcare</Option>
                                    <Option value="it">IT</Option>
                                    <Option value="finance">Finance</Option>
                                </Select>
                            </Form.Item>
                        </Col>
                    </Row>

                    <Row gutter={16}>
                        <Col span={8}>
                            <Form.Item label="Assigned To" name="assignedTo">
                                <Select placeholder="Assign user" allowClear>
                                    {users?.map((user: any) => (
                                        <Option key={user.id} value={user.id}>
                                            {user.name}
                                        </Option>
                                    ))}
                                </Select>
                            </Form.Item>
                        </Col>
                    </Row>
                </div>

                <Divider />

                <div>
                    <Title level={4} style={{ marginBottom: 16 }}>
                        Registered Address
                    </Title>

                    <Row gutter={24}>
                        <Col span={12}>
                            <Form.Item label="Street" name={["registeredAddress", "street"]}>
                                <Input.TextArea rows={2} />
                            </Form.Item>
                        </Col>

                        <Col span={12}>
                            <Form.Item label="Area" name={["registeredAddress", "area"]}>
                                <Input />
                            </Form.Item>
                        </Col>

                        <Col span={8}>
                            <Form.Item
                                label="Postal Code"
                                name={["registeredAddress", "postal"]}
                                rules={[{ pattern: /^[0-9]+$/, message: "Must be number" }]}
                            >
                                <Input />
                            </Form.Item>
                        </Col>

                        <Col span={8}>
                            <Form.Item label="City" name={["registeredAddress", "city"]}>
                                <Input />
                            </Form.Item>
                        </Col>

                        <Col span={8}>
                            <Form.Item label="State" name={["registeredAddress", "state"]}>
                                <Input />
                            </Form.Item>
                        </Col>

                        <Col span={8}>
                            <Form.Item label="Country" name={["registeredAddress", "country"]}>
                                <Input />
                            </Form.Item>
                        </Col>
                    </Row>
                </div>

                <Divider />

                <div>
                    <Title level={4} style={{ marginBottom: 16 }}>
                        Branches
                    </Title>

                    <Form.List name="branches">
                        {(fields, { add, remove }) => (
                            <>
                                {fields.map(({ key, name, ...restField }, index) => (
                                    <Card
                                        key={key}
                                        title={`Branch ${index + 1}`}
                                        style={{ marginBottom: 16 }}
                                        extra={
                                            fields.length > 1 ? (
                                                <Button danger onClick={() => remove(name)}>
                                                    Remove
                                                </Button>
                                            ) : null
                                        }
                                    >
                                        <Row gutter={16}>
                                            <Col span={8}>
                                                <Form.Item
                                                    {...restField}
                                                    label="Branch Name"
                                                    name={[name, "name"]}
                                                    rules={[{ required: true, message: "Branch name is required" }]}
                                                >
                                                    <Input placeholder="Enter branch name" />
                                                </Form.Item>
                                            </Col>

                                            <Col span={8}>
                                                <Form.Item {...restField} label="Branch Code" name={[name, "code"]}>
                                                    <Input placeholder="Enter branch code" />
                                                </Form.Item>
                                            </Col>

                                            <Col span={8}>
                                                <Form.Item
                                                    {...restField}
                                                    label="Status"
                                                    name={[name, "status"]}
                                                    initialValue="active"
                                                >
                                                    <Select>
                                                        <Option value="active">Active</Option>
                                                        <Option value="inactive">Inactive</Option>
                                                    </Select>
                                                </Form.Item>
                                            </Col>
                                        </Row>

                                        <Row gutter={16}>
                                            <Col span={6}>
                                                <Form.Item
                                                    {...restField}
                                                    label="Head Office"
                                                    name={[name, "isHeadOffice"]}
                                                    valuePropName="checked"
                                                >
                                                    <Switch />
                                                </Form.Item>
                                            </Col>

                                            <Col span={6}>
                                                <Form.Item
                                                    {...restField}
                                                    label="Use Registered Address"
                                                    name={[name, "useRegisteredAsBilling"]}
                                                    valuePropName="checked"
                                                >
                                                    <Checkbox
                                                        onChange={(e) =>
                                                            copyRegisteredToBranchBilling(index, e.target.checked)
                                                        }
                                                    >
                                                        Copy
                                                    </Checkbox>
                                                </Form.Item>
                                            </Col>
                                        </Row>

                                        <Row gutter={16}>
                                            <Col span={8}>
                                                <Form.Item
                                                    {...restField}
                                                    label="Contact Person"
                                                    name={[name, "contactPerson"]}
                                                >
                                                    <Input />
                                                </Form.Item>
                                            </Col>

                                            <Col span={8}>
                                                <Form.Item
                                                    {...restField}
                                                    label="Phone"
                                                    name={[name, "phone"]}
                                                    rules={[{ pattern: /^[0-9]*$/, message: "Must be number" }]}
                                                >
                                                    <Input />
                                                </Form.Item>
                                            </Col>

                                            <Col span={8}>
                                                <Form.Item
                                                    {...restField}
                                                    label="Email"
                                                    name={[name, "email"]}
                                                    rules={[{ type: "email", message: "Invalid email" }]}
                                                >
                                                    <Input />
                                                </Form.Item>
                                            </Col>
                                        </Row>

                                        <Row gutter={16}>
                                            <Col span={8}>
                                                <Form.Item {...restField} label="GST Number" name={[name, "gst"]}>
                                                    <Input />
                                                </Form.Item>
                                            </Col>

                                            <Col span={8}>
                                                <Form.Item {...restField} label="Assigned To" name={[name, "assignedTo"]}>
                                                    <Select placeholder="Assign user" allowClear>
                                                        {users?.map((user: any) => (
                                                            <Option key={user.id} value={user.id}>
                                                                {user.name}
                                                            </Option>
                                                        ))}
                                                    </Select>
                                                </Form.Item>
                                            </Col>
                                        </Row>

                                        <Title level={5} style={{ marginTop: 8, marginBottom: 12 }}>
                                            Billing Address
                                        </Title>

                                        <Row gutter={16}>
                                            <Col span={12}>
                                                <Form.Item {...restField} label="Street" name={[name, "billingStreet"]}>
                                                    <Input.TextArea rows={2} />
                                                </Form.Item>
                                            </Col>

                                            <Col span={12}>
                                                <Form.Item {...restField} label="Area" name={[name, "billingArea"]}>
                                                    <Input />
                                                </Form.Item>
                                            </Col>

                                            <Col span={8}>
                                                <Form.Item
                                                    {...restField}
                                                    label="Postal Code"
                                                    name={[name, "billingPostal"]}
                                                    rules={[{ pattern: /^[0-9]*$/, message: "Must be number" }]}
                                                >
                                                    <Input />
                                                </Form.Item>
                                            </Col>

                                            <Col span={8}>
                                                <Form.Item {...restField} label="City" name={[name, "billingCity"]}>
                                                    <Input />
                                                </Form.Item>
                                            </Col>

                                            <Col span={8}>
                                                <Form.Item {...restField} label="State" name={[name, "billingState"]}>
                                                    <Input />
                                                </Form.Item>
                                            </Col>

                                            <Col span={8}>
                                                <Form.Item {...restField} label="Country" name={[name, "billingCountry"]}>
                                                    <Input />
                                                </Form.Item>
                                            </Col>
                                        </Row>

                                        <Title level={5} style={{ marginTop: 8, marginBottom: 12 }}>
                                            Shipping Address
                                        </Title>

                                        <Form.Item
                                            {...restField}
                                            name={[name, "isShippingSameAsBilling"]}
                                            valuePropName="checked"
                                        >
                                            <Checkbox
                                                onChange={(e) => copyBillingToShipping(index, e.target.checked)}
                                            >
                                                Same as billing
                                            </Checkbox>
                                        </Form.Item>

                                        <Row gutter={16}>
                                            <Col span={12}>
                                                <Form.Item {...restField} label="Street" name={[name, "shippingStreet"]}>
                                                    <Input.TextArea rows={2} />
                                                </Form.Item>
                                            </Col>

                                            <Col span={12}>
                                                <Form.Item {...restField} label="Area" name={[name, "shippingArea"]}>
                                                    <Input />
                                                </Form.Item>
                                            </Col>

                                            <Col span={8}>
                                                <Form.Item
                                                    {...restField}
                                                    label="Postal Code"
                                                    name={[name, "shippingPostal"]}
                                                    rules={[{ pattern: /^[0-9]*$/, message: "Must be number" }]}
                                                >
                                                    <Input />
                                                </Form.Item>
                                            </Col>

                                            <Col span={8}>
                                                <Form.Item {...restField} label="City" name={[name, "shippingCity"]}>
                                                    <Input />
                                                </Form.Item>
                                            </Col>

                                            <Col span={8}>
                                                <Form.Item {...restField} label="State" name={[name, "shippingState"]}>
                                                    <Input />
                                                </Form.Item>
                                            </Col>

                                            <Col span={8}>
                                                <Form.Item {...restField} label="Country" name={[name, "shippingCountry"]}>
                                                    <Input />
                                                </Form.Item>
                                            </Col>
                                        </Row>
                                    </Card>
                                ))}

                                <Button
                                    type="dashed"
                                    onClick={() =>
                                        add({
                                            name: "",
                                            isHeadOffice: false,
                                            status: "active",
                                            isShippingSameAsBilling: false,
                                        })
                                    }
                                    block
                                >
                                    + Add Branch
                                </Button>
                            </>
                        )}
                    </Form.List>
                </div>

                <Space style={{ marginTop: 20 }}>
                    <Button type="primary" htmlType="submit">
                        Save
                    </Button>

                    <Button
                        onClick={() => {
                            form.resetFields();
                            form.setFieldsValue({
                                branches: [
                                    {
                                        name: "Head Office",
                                        isHeadOffice: true,
                                        status: "active",
                                        isShippingSameAsBilling: false,
                                    },
                                ],
                            });
                        }}
                    >
                        Cancel
                    </Button>
                </Space>
            </Form>

        </Space>

    );
};

export default OrganizationCreate;