import { SafetyCertificateOutlined, SettingOutlined } from "@ant-design/icons";
import {
    Button,
    Card,
    Col,
    Divider,
    Form,
    Input,
    Row,
    Space,
    Typography,
    message,
    theme,
} from "antd";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
    createRole,
    fetchPermissions,
    updateRole,
    type RoleDetails,
} from "../../../redux/reducers/rbac.slice";
import type { AppDispatch, RootState } from "../../../redux/store";
import PermissionsMatrix from "./PermissionsMatrix";

const { Title, Text } = Typography;
const { TextArea } = Input;

type Props = {
    mode: "create" | "edit";
    initialValues?: Partial<RoleDetails>;
    onSuccess?: (roleId?: string) => void;
};

type FormValues = {
    name: string;
    code: string;
    description?: string;
    permission_codes: string[];
};

export default function RoleForm({ mode, initialValues, onSuccess }: Props) {
    const dispatch = useDispatch<AppDispatch>();
    const [form] = Form.useForm<FormValues>();
    const { token } = theme.useToken();

    const { permissions, permissionsLoading, submitting } = useSelector(
        (state: RootState) => state.rbac
    );

    useEffect(() => {
        dispatch(fetchPermissions());
    }, [dispatch]);

    useEffect(() => {
        if (initialValues) {
            form.setFieldsValue({
                name: initialValues.name || "",
                code: initialValues.code || "",
                description: initialValues.description || "",
                permission_codes: initialValues.permissions || [],
            });
        }
    }, [form, initialValues]);

    const handleFinish = async (values: FormValues) => {
        try {
            const payload = {
                ...values,
                permission_codes: values.permission_codes || [],
            };

            if (mode === "create") {
                const response = await dispatch(createRole(payload)).unwrap();
                message.success("Role created successfully");
                onSuccess?.(response?.data?.id || response?.id);
                return;
            }

            if (!initialValues?.id) {
                message.error("Role id is missing");
                return;
            }

            await dispatch(
                updateRole({
                    id: initialValues.id,
                    ...payload,
                })
            ).unwrap();

            message.success("Role updated successfully");
            onSuccess?.(initialValues.id);
        } catch (error: any) {
            message.error(error || `Failed to ${mode} role`);
        }
    };

    return (
        <Form<FormValues>
            form={form}
            layout="vertical"
            onFinish={handleFinish}
            initialValues={{
                name: "",
                code: "",
                description: "",
                permission_codes: [],
            }}
        >
            <Space direction="vertical" size={20} style={{ width: "100%" }}>
                <Card
                    bordered={false}
                    style={{
                        borderRadius: 20,
                        background: token.colorBgContainer,
                        boxShadow: token.boxShadowSecondary,
                    }}
                    bodyStyle={{ padding: 24 }}
                >
                    <div
                        style={{
                            display: "flex",
                            alignItems: "flex-start",
                            justifyContent: "space-between",
                            gap: 16,
                            flexWrap: "wrap",
                        }}
                    >
                        <div>
                            <Space align="center" size={10}>
                                <div
                                    style={{
                                        width: 42,
                                        height: 42,
                                        borderRadius: 14,
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        background: token.colorPrimaryBg,
                                        color: token.colorPrimary,
                                        fontSize: 18,
                                    }}
                                >
                                    <SafetyCertificateOutlined />
                                </div>

                                <div>
                                    <Title level={3} style={{ margin: 0 }}>
                                        {mode === "create" ? "Create Role" : "Edit Role"}
                                    </Title>
                                    <Text type="secondary">
                                        Define role details and assign only the permissions that are needed.
                                    </Text>
                                </div>
                            </Space>
                        </div>
                    </div>

                    <Divider style={{ margin: "20px 0" }} />

                    <Row gutter={[16, 4]}>
                        <Col xs={24} md={8}>
                            <Form.Item
                                label="Role Name"
                                name="name"
                                rules={[{ required: true, message: "Please enter role name" }]}
                            >
                                <Input
                                    size="large"
                                    placeholder="Enter role name"
                                    style={{ borderRadius: 12 }}
                                />
                            </Form.Item>
                        </Col>

                        <Col xs={24} md={8}>
                            <Form.Item
                                label="Role Code"
                                name="code"
                                rules={[{ required: true, message: "Please enter role code" }]}
                            >
                                <Input
                                    size="large"
                                    placeholder="Enter role code"
                                    style={{ borderRadius: 12 }}
                                    onChange={(e) => {
                                        const value = e.target.value
                                            .toUpperCase()
                                            .replace(/\s+/g, "_");
                                        form.setFieldValue("code", value);
                                    }}
                                />
                            </Form.Item>
                        </Col>

                        <Col xs={24} md={8}>
                            <Form.Item label="Description" name="description">
                                <TextArea
                                    placeholder="Enter description"
                                    autoSize={{ minRows: 1, maxRows: 3 }}
                                    style={{ borderRadius: 12 }}
                                />
                            </Form.Item>
                        </Col>
                    </Row>
                </Card>

                <Card
                    bordered={false}
                    loading={permissionsLoading}
                    style={{
                        borderRadius: 20,
                        background: token.colorBgContainer,
                        boxShadow: token.boxShadowSecondary,
                    }}
                    bodyStyle={{ padding: 24 }}
                >
                    <div
                        style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            marginBottom: 8,
                            flexWrap: "wrap",
                            gap: 12,
                        }}
                    >
                        {/* LEFT SIDE */}
                        <Space align="center" size={10}>
                            <div
                                style={{
                                    width: 38,
                                    height: 38,
                                    borderRadius: 12,
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    background: token.colorPrimaryBg,
                                    color: token.colorPrimary,
                                    fontSize: 16,
                                }}
                            >
                                <SettingOutlined />
                            </div>

                            <div>
                                <Title level={4} style={{ margin: 0 }}>
                                    Permissions
                                </Title>
                                <Text type="secondary">
                                    Search, review, and assign permissions cleanly.
                                </Text>
                            </div>
                        </Space>

                        {/* RIGHT SIDE BUTTON */}
                        <Button
                            type="primary"
                            size="large"
                            htmlType="submit"
                            loading={submitting}
                            style={{ borderRadius: 12, minWidth: 140 }}
                        >
                            {mode === "create" ? "Create Role" : "Update Role"}
                        </Button>
                    </div>

                    <Form.Item
                        name="permission_codes"
                        style={{ marginTop: 20, marginBottom: 0 }}
                    >
                        <PermissionsMatrix permissions={permissions as any} />
                    </Form.Item>
                </Card>

                <div
                    style={{
                        display: "flex",
                        justifyContent: "flex-end",
                        gap: 12,
                    }}
                >
                    <Button
                        size="large"
                        htmlType="button"
                        style={{ borderRadius: 12 }}
                        onClick={() => form.resetFields()}
                    >
                        Reset
                    </Button>

                    <Button
                        type="primary"
                        size="large"
                        htmlType="submit"
                        loading={submitting}
                        style={{ borderRadius: 12, minWidth: 140 }}
                    >
                        {mode === "create" ? "Create Role" : "Update Role"}
                    </Button>
                </div>
            </Space>
        </Form>
    );
}