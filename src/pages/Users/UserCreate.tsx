import {
    Alert,
    Col,
    Form,
    Input,
    Modal,
    Row,
    Select,
    message,
} from "antd";
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { createUser } from "../../redux/reducers/user.slice";
import type { AppDispatch } from "../../redux/store";

type Props = {
    open: boolean;
    onClose: () => void;
    onSuccess: () => void;
};

const { Option } = Select;

export default function UserCreateModal({ open, onClose, onSuccess }: Props) {
    const [form] = Form.useForm();
    const dispatch = useDispatch<AppDispatch>();
    const [generatedPassword, setGeneratedPassword] = useState("");

    useEffect(() => {
        if (!open) {
            form.resetFields();
            // setGeneratedPassword("");
        }
    }, [open, form]);

    const onFinish = async (values: any) => {
        try {
            const res = await dispatch(
                createUser({
                    email: values.email,
                    name: values.name,
                    role: values.role,

                    phone_country_code: values.phone_country_code || null,
                    phone: values.phone || null,

                    city: values.city || null,
                    district: values.district || null,
                    state: values.state || null,
                    country: values.country || null,
                    postal_code: values.postal_code || null,

                    designation: values.designation || null,
                    department: values.department || null,
                    employee_code: values.employee_code || null,

                    tempPassword: values.tempPassword || undefined,
                })
            ).unwrap();

            if (res?.tempPassword) {
                setGeneratedPassword(res.tempPassword);
            }

            message.success("User created successfully");
            onSuccess();
        } catch (error: any) {
            message.error(error || "Failed to create user");
        }
    };

    return (
        <Modal
            title="Create User"
            open={open}
            onCancel={onClose}
            onOk={() => form.submit()}
            okText="Create"
            destroyOnHidden
            width={900}
        >
            {generatedPassword ? (
                <Alert
                    type="success"
                    showIcon
                    style={{ marginBottom: 16 }}
                    message={`Temporary password: ${generatedPassword}`}
                    description="Please copy and share this password securely with the user."
                />
            ) : null}

            <Form form={form} layout="vertical" onFinish={onFinish}>
                <Row gutter={16}>
                    <Col span={8}>
                        <Form.Item
                            label="Full Name"
                            name="name"
                            rules={[{ required: true, message: "Name is required" }]}
                        >
                            <Input placeholder="Enter full name" />
                        </Form.Item>
                    </Col>

                    <Col span={8}>
                        <Form.Item
                            label="Email"
                            name="email"
                            rules={[
                                { required: true, message: "Email is required" },
                                { type: "email", message: "Invalid email" },
                            ]}
                        >
                            <Input placeholder="Enter email" />
                        </Form.Item>
                    </Col>

                    <Col span={8}>
                        <Form.Item
                            label="Role"
                            name="role"
                            initialValue="AGENT"
                            rules={[{ required: true, message: "Role is required" }]}
                        >
                            <Select>
                                <Option value="ADMIN">Admin</Option>
                                <Option value="MANAGER">Manager</Option>
                                <Option value="AGENT">Agent</Option>
                            </Select>
                        </Form.Item>
                    </Col>
                </Row>

                <Row gutter={16}>
                    <Col span={6}>
                        <Form.Item label="Phone Code" name="phone_country_code" initialValue="+91">
                            <Input placeholder="+91" />
                        </Form.Item>
                    </Col>

                    <Col span={10}>
                        <Form.Item
                            label="Phone"
                            name="phone"
                            rules={[{ pattern: /^[0-9]*$/, message: "Only digits allowed" }]}
                        >
                            <Input placeholder="Enter phone number" />
                        </Form.Item>
                    </Col>

                    <Col span={8}>
                        <Form.Item label="Temporary Password" name="tempPassword">
                            <Input.Password placeholder="Leave empty to auto-generate" />
                        </Form.Item>
                    </Col>
                </Row>

                <Row gutter={16}>
                    <Col span={8}>
                        <Form.Item label="Department" name="department">
                            <Input placeholder="Sales / Operations / HR" />
                        </Form.Item>
                    </Col>

                    <Col span={8}>
                        <Form.Item label="Designation" name="designation">
                            <Input placeholder="Manager / Agent / Executive" />
                        </Form.Item>
                    </Col>

                    <Col span={8}>
                        <Form.Item label="Employee Code" name="employee_code">
                            <Input placeholder="EMP001" />
                        </Form.Item>
                    </Col>
                </Row>

                <Row gutter={16}>
                    <Col span={6}>
                        <Form.Item label="City" name="city">
                            <Input />
                        </Form.Item>
                    </Col>

                    <Col span={6}>
                        <Form.Item label="District" name="district">
                            <Input />
                        </Form.Item>
                    </Col>

                    <Col span={6}>
                        <Form.Item label="State" name="state">
                            <Input />
                        </Form.Item>
                    </Col>

                    <Col span={6}>
                        <Form.Item label="Country" name="country" initialValue="India">
                            <Input />
                        </Form.Item>
                    </Col>
                </Row>

                <Row gutter={16}>
                    <Col span={8}>
                        <Form.Item
                            label="Postal Code"
                            name="postal_code"
                            rules={[{ pattern: /^[0-9]*$/, message: "Only digits allowed" }]}
                        >
                            <Input />
                        </Form.Item>
                    </Col>
                </Row>
            </Form>
        </Modal>
    );
}