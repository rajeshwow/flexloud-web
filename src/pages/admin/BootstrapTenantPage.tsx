import {
    ArrowLeftOutlined,
    CheckCircleOutlined,
    ThunderboltOutlined,
} from "@ant-design/icons";
import {
    Alert,
    Button,
    Card,
    Col,
    Form,
    Input,
    message,
    Result,
    Row,
    Space,
    Spin,
    Steps,
    Table,
    Tag,
    Typography,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import {
    bootstrapAdminTenant,
    fetchAdminTenantById,
    fetchTenantBootstrapLogs,
} from "../../redux/reducers/adminTenants.slice";
import type { AppDispatch, RootState } from "../../redux/store";

const { Title, Text } = Typography;

export default function BootstrapTenantPage() {
    const { tenantId } = useParams();
    const navigate = useNavigate();
    const dispatch = useDispatch<AppDispatch>();

    const { selectedTenant, detailLoading, actionLoading, bootstrapLogs } =
        useSelector((state: RootState) => state.adminTenants);

    const [form] = Form.useForm();
    const [bootstrapResult, setBootstrapResult] = useState<any>(null);

    useEffect(() => {
        if (!tenantId) return;

        dispatch(fetchAdminTenantById(tenantId));
        dispatch(fetchTenantBootstrapLogs(tenantId));
    }, [dispatch, tenantId]);

    const handleBootstrap = async () => {
        if (!tenantId) return;

        try {
            const values = await form.validateFields();

            const result = await dispatch(
                bootstrapAdminTenant({
                    tenantId,
                    adminEmail: values.adminEmail,
                    adminName: values.adminName,
                    adminPassword: values.adminPassword,
                })
            ).unwrap();

            setBootstrapResult(result);
            message.success("Tenant bootstrapped successfully");

            dispatch(fetchAdminTenantById(tenantId));
            dispatch(fetchTenantBootstrapLogs(tenantId));
        } catch (error: any) {
            if (error?.errorFields) return;
            message.error(error || "Failed to bootstrap tenant");
        }
    };

    const columns: ColumnsType<any> = useMemo(
        () => [
            {
                title: "Step",
                dataIndex: "step_name",
                key: "step_name",
            },
            {
                title: "Status",
                dataIndex: "status",
                key: "status",
                width: 130,
                render: (value: string) => {
                    const color =
                        value === "success"
                            ? "success"
                            : value === "failed"
                                ? "error"
                                : value === "running"
                                    ? "processing"
                                    : "default";

                    return <Tag color={color}>{value?.toUpperCase()}</Tag>;
                },
            },
            {
                title: "Message",
                dataIndex: "message",
                key: "message",
            },
            {
                title: "Completed At",
                dataIndex: "completed_at",
                key: "completed_at",
                width: 190,
                render: (value: string | null) =>
                    value ? new Date(value).toLocaleString() : "-",
            },
        ],
        []
    );

    if (detailLoading) {
        return (
            <Card style={{ borderRadius: 16 }}>
                <Spin />
            </Card>
        );
    }

    return (
        <Space direction="vertical" size={16} style={{ width: "100%" }}>
            <Button icon={<ArrowLeftOutlined />} onClick={() => navigate("/admin/tenants")}>
                Back to Tenants
            </Button>

            <Card style={{ borderRadius: 16 }}>
                <Row justify="space-between" align="middle" gutter={[16, 16]}>
                    <Col>
                        <Space direction="vertical" size={2}>
                            <Title level={4} style={{ margin: 0 }}>
                                <ThunderboltOutlined /> Tenant Bootstrap
                            </Title>
                            <Text type="secondary">
                                Setup default role, permissions and admin user.
                            </Text>
                        </Space>
                    </Col>

                    <Col>
                        {selectedTenant?.is_bootstrapped ? (
                            <Tag color="success">BOOTSTRAPPED</Tag>
                        ) : (
                            <Tag color="warning">PENDING</Tag>
                        )}
                    </Col>
                </Row>

                {selectedTenant && (
                    <Alert
                        style={{ marginTop: 16 }}
                        type="info"
                        showIcon
                        message={`${selectedTenant.name} / ${selectedTenant.slug}`}
                        description="This action will create tenant admin role, assign permissions and create the first tenant admin user."
                    />
                )}

                <Steps
                    style={{ marginTop: 24 }}
                    current={selectedTenant?.is_bootstrapped ? 4 : 1}
                    items={[
                        { title: "Tenant" },
                        { title: "Role" },
                        { title: "Permissions" },
                        { title: "Admin User" },
                        { title: "Finish" },
                    ]}
                />

                {!selectedTenant?.is_bootstrapped && (
                    <Form
                        form={form}
                        layout="vertical"
                        style={{ marginTop: 24, maxWidth: 520 }}
                    >
                        <Form.Item
                            label="Admin Name"
                            name="adminName"
                            rules={[{ required: true, message: "Admin name is required" }]}
                        >
                            <Input placeholder="Admin User" />
                        </Form.Item>

                        <Form.Item
                            label="Admin Email"
                            name="adminEmail"
                            rules={[
                                { required: true, message: "Admin email is required" },
                                { type: "email", message: "Enter valid email" },
                            ]}
                        >
                            <Input placeholder="admin@betacrm.com" />
                        </Form.Item>

                        <Form.Item
                            label="Admin Password"
                            name="adminPassword"
                            rules={[
                                { required: true, message: "Admin password is required" },
                                { min: 8, message: "Password must be at least 8 characters" },
                                {
                                    pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/,
                                    message: "Password must include uppercase, lowercase and number",
                                },
                            ]}
                            hasFeedback
                        >
                            <Input.Password placeholder="Enter admin password" />
                        </Form.Item>

                        <Form.Item
                            label="Confirm Password"
                            name="confirmPassword"
                            dependencies={["adminPassword"]}
                            hasFeedback
                            rules={[
                                { required: true, message: "Please confirm admin password" },
                                ({ getFieldValue }) => ({
                                    validator(_, value) {
                                        if (!value || getFieldValue("adminPassword") === value) {
                                            return Promise.resolve();
                                        }
                                        return Promise.reject(new Error("Passwords do not match"));
                                    },
                                }),
                            ]}
                        >
                            <Input.Password placeholder="Confirm admin password" />
                        </Form.Item>

                        <Button
                            type="primary"
                            icon={<ThunderboltOutlined />}
                            loading={actionLoading}
                            onClick={handleBootstrap}
                        >
                            Run Bootstrap
                        </Button>
                    </Form>
                )}

                {bootstrapResult && (
                    <Result
                        icon={<CheckCircleOutlined />}
                        status="success"
                        title="Tenant bootstrapped successfully"
                        subTitle="Admin user password configured successfully."
                    />
                )}
            </Card>

            <Card title="Bootstrap Logs" style={{ borderRadius: 16 }}>
                <Table
                    rowKey="id"
                    columns={columns}
                    dataSource={bootstrapLogs}
                    pagination={false}
                    scroll={{ x: 800 }}
                />
            </Card>
        </Space>
    );
}