import {
    Button,
    Checkbox,
    Col,
    Collapse,
    DatePicker,
    Form,
    Input,
    message,
    Row,
    Select,
    Space,
} from "antd";
import React, { useState } from "react";
import { useDispatch } from "react-redux";
import {
    createOrganization,
    type CreateOrganizationPayload,
} from "../../redux/reducers/organization.slice";
import type { AppDispatch } from "../../redux/store";

const { Panel } = Collapse;
const { Option } = Select;

const OrganizationCreate: React.FC = () => {
    const [form] = Form.useForm();
    const [copyAddress, setCopyAddress] = useState(false);

    const dispatch = useDispatch<AppDispatch>();

    const copyBillingAddress = (checked: boolean) => {
        setCopyAddress(checked);

        if (checked) {
            const billing = form.getFieldsValue([
                "billingStreet",
                "billingArea",
                "billingPostal",
                "billingCity",
                "billingState",
                "billingCountry",
            ]);

            form.setFieldsValue({
                shippingStreet: billing.billingStreet,
                shippingArea: billing.billingArea,
                shippingPostal: billing.billingPostal,
                shippingCity: billing.billingCity,
                shippingState: billing.billingState,
                shippingCountry: billing.billingCountry,
            });
        }
    };

    const onFinish = async (values: any) => {
        const payload: CreateOrganizationPayload = {
            name: values.name,
            gst_number: values.gst || null,
            email: values.email || null,
            next_followup_at: values.followup ? values.followup.toISOString() : null,

            type: values.type || null,
            industry: values.industry || null,
            assigned_to: null,

            billing_street: values.billingStreet,
            billing_area: values.billingArea,
            billing_postal_code: values.billingPostal,
            billing_city: values.billingCity,
            billing_state: values.billingState,
            billing_country: values.billingCountry,

            shipping_street: values.shippingStreet || null,
            shipping_area: values.shippingArea || null,
            shipping_postal_code: values.shippingPostal || null,
            shipping_city: values.shippingCity || null,
            shipping_state: values.shippingState || null,
            shipping_country: values.shippingCountry || null,

            is_shipping_same_as_billing: copyAddress,
        };

        try {
            await dispatch(createOrganization(payload)).unwrap();
            message.success("Organization created successfully");
            form.resetFields();
            setCopyAddress(false);
            console.log("payload", payload);
        } catch (error: any) {
            message.error(error || "Failed to create organization");
        }
    };

    return (
        <Form
            layout="vertical"
            form={form}
            onFinish={onFinish}
            style={{ padding: 20 }}
        >
            <Collapse defaultActiveKey={["overview"]}>
                <Panel header="Overview" key="overview">
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item
                                label="Name"
                                name="name"
                                rules={[{ required: true, message: "Name is required" }]}
                            >
                                <Input />
                            </Form.Item>
                        </Col>

                        <Col span={12}>
                            <Form.Item label="GST Number" name="gst">
                                <Input />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item
                                label="Email Address"
                                name="email"
                                rules={[{ type: "email", message: "Invalid email" }]}
                            >
                                <Input />
                            </Form.Item>
                        </Col>

                        <Col span={12}>
                            <Form.Item label="Next Followup Date" name="followup">
                                <DatePicker style={{ width: "100%" }} showTime />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item label="Type" name="type">
                                <Select placeholder="Select type">
                                    <Option value="customer">Customer</Option>
                                    <Option value="vendor">Vendor</Option>
                                    <Option value="partner">Partner</Option>
                                </Select>
                            </Form.Item>
                        </Col>

                        <Col span={12}>
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
                        <Col span={12}>
                            <Form.Item label="Assigned To" name="assignedTo">
                                <Select placeholder="Assign user">
                                    <Option value="user1">User 1</Option>
                                    <Option value="user2">User 2</Option>
                                </Select>
                            </Form.Item>
                        </Col>
                    </Row>
                </Panel>

                <Panel header="Address Information" key="address">
                    <Row gutter={24}>
                        <Col span={12}>
                            <h3>Billing Address</h3>

                            <Form.Item
                                label="Billing Street"
                                name="billingStreet"
                                rules={[{ required: true, message: "Billing street is required" }]}
                            >
                                <Input.TextArea rows={2} />
                            </Form.Item>

                            <Form.Item
                                label="Billing Area"
                                name="billingArea"
                                rules={[{ required: true, message: "Billing area is required" }]}
                            >
                                <Input />
                            </Form.Item>

                            <Form.Item
                                label="Billing Postal Code"
                                name="billingPostal"
                                rules={[
                                    { required: true, message: "Billing postal code is required" },
                                    { pattern: /^[0-9]+$/, message: "Must be number" },
                                ]}
                            >
                                <Input />
                            </Form.Item>

                            <Form.Item
                                label="Billing City"
                                name="billingCity"
                                rules={[{ required: true, message: "Billing city is required" }]}
                            >
                                <Input />
                            </Form.Item>

                            <Form.Item
                                label="Billing State"
                                name="billingState"
                                rules={[{ required: true, message: "Billing state is required" }]}
                            >
                                <Input />
                            </Form.Item>

                            <Form.Item
                                label="Billing Country"
                                name="billingCountry"
                                rules={[{ required: true, message: "Billing country is required" }]}
                            >
                                <Input />
                            </Form.Item>
                        </Col>

                        <Col span={12}>
                            <h3>Shipping Address</h3>

                            <Form.Item label="Shipping Street" name="shippingStreet">
                                <Input.TextArea rows={2} />
                            </Form.Item>

                            <Form.Item label="Shipping Area" name="shippingArea">
                                <Input />
                            </Form.Item>

                            <Form.Item
                                label="Shipping Postal Code"
                                name="shippingPostal"
                                rules={[{ pattern: /^[0-9]+$/, message: "Must be number" }]}
                            >
                                <Input />
                            </Form.Item>

                            <Form.Item label="Shipping City" name="shippingCity">
                                <Input />
                            </Form.Item>

                            <Form.Item label="Shipping State" name="shippingState">
                                <Input />
                            </Form.Item>

                            <Form.Item label="Shipping Country" name="shippingCountry">
                                <Input />
                            </Form.Item>

                            <Checkbox onChange={(e) => copyBillingAddress(e.target.checked)}>
                                Copy Address from Left
                            </Checkbox>
                        </Col>
                    </Row>
                </Panel>
            </Collapse>

            <Space style={{ marginTop: 20 }}>
                <Button type="primary" htmlType="submit">
                    Save
                </Button>

                <Button
                    onClick={() => {
                        form.resetFields();
                        setCopyAddress(false);
                    }}
                >
                    Cancel
                </Button>
            </Space>
        </Form>
    );
};

export default OrganizationCreate;