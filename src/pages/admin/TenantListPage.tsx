import {
    ApartmentOutlined,
    EyeOutlined,
    PlusOutlined,
    ReloadOutlined,
    ThunderboltOutlined,
} from "@ant-design/icons";
import {
    Button,
    Card,
    Col,
    Form,
    Input,
    message,
    Modal,
    Row,
    Select,
    Space,
    Table,
    Tag,
    Typography,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
    createAdminTenant,
    fetchAdminTenants,
    updateAdminTenantStatus,
    type AdminTenant,
    type TenantStatus,
} from "../../redux/reducers/adminTenants.slice";
import type { AppDispatch, RootState } from "../../redux/store";

const { Title, Text } = Typography;

export default function TenantListPage() {
    const dispatch = useDispatch<AppDispatch>();
    const navigate = useNavigate();

    const { items, loading, actionLoading, pagination } = useSelector(
        (state: RootState) => state.adminTenants
    );

    const [search, setSearch] = useState("");
    const [status, setStatus] = useState<TenantStatus | undefined>();
    const [createOpen, setCreateOpen] = useState(false);
    const [form] = Form.useForm();

    const loadTenants = (page = pagination.page, limit = pagination.limit) => {
        dispatch(
            fetchAdminTenants({
                page,
                limit,
                search: search || undefined,
                status,
            })
        );
    };

    useEffect(() => {
        loadTenants(1, 10);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleSearch = () => {
        loadTenants(1, pagination.limit);
    };

    const handleCreateTenant = async () => {
        try {
            const values = await form.validateFields();

            await dispatch(
                createAdminTenant({
                    name: values.name,
                    slug: values.slug,
                })
            ).unwrap();

            message.success("Tenant created successfully");
            form.resetFields();
            setCreateOpen(false);
            loadTenants(1, pagination.limit);
        } catch (error: any) {
            if (error?.errorFields) return;
            message.error(error || "Failed to create tenant");
        }
    };

    const handleStatusChange = async (tenant: AdminTenant, nextStatus: TenantStatus) => {
        try {
            await dispatch(
                updateAdminTenantStatus({
                    tenantId: tenant.id,
                    status: nextStatus,
                })
            ).unwrap();

            message.success("Tenant status updated");
            loadTenants();
        } catch (error: any) {
            message.error(error || "Failed to update status");
        }
    };

    const columns: ColumnsType<AdminTenant> = useMemo(
        () => [
            {
                title: "Tenant",
                dataIndex: "name",
                key: "name",
                render: (_, record) => (
                    <Space direction="vertical" size={0}>
                        <Text strong>{record.name}</Text>
                        {/* <Text type="secondary">{record.slug}</Text> */}
                    </Space>
                ),
                width: 120
            },
            //slug
            {
                title: "Slug",
                dataIndex: "slug",
                key: "slug",
                width: 120,
            },
            {
                title: "Permissions",
                dataIndex: "allowed_permission_count",
                key: "allowed_permission_count",
                width: 140,
                render: (value: number) => <Tag>{value || 0}</Tag>,
            },
            {
                title: "Status",
                dataIndex: "status",
                key: "status",
                width: 150,
                render: (value: TenantStatus) => {
                    const color =
                        value === "active"
                            ? "success"
                            : value === "inactive"
                                ? "default"
                                : "warning";

                    return <Tag color={color}>{value.toUpperCase()}</Tag>;
                },
            },
            {
                title: "Bootstrap",
                dataIndex: "is_bootstrapped",
                key: "is_bootstrapped",
                width: 160,
                render: (value: boolean) =>
                    value ? <Tag color="success">DONE</Tag> : <Tag color="warning">PENDING</Tag>,
            },
            {
                title: "Created At",
                dataIndex: "created_at",
                key: "created_at",
                width: 190,
                render: (value: string) => new Date(value).toLocaleString(),
            },
            {
                title: "Actions",
                key: "actions",
                width: 300,
                fixed: "right",
                render: (_, record) => (
                    <Space>
                        <Button
                            // size="small"
                            icon={<EyeOutlined />}
                            onClick={() => navigate(`/admin/tenants/${record.id}`)}
                        >
                            View
                        </Button>

                        <Button
                            // size="small"
                            type="primary"
                            icon={<ThunderboltOutlined />}
                            disabled={record.is_bootstrapped}
                            onClick={() => navigate(`/admin/tenants/${record.id}/bootstrap`)}
                        >
                            Bootstrap
                        </Button>

                        <Select
                            // size="small"
                            value={record.status}
                            // style={{ width: 115 }}
                            onChange={(nextStatus) => handleStatusChange(record, nextStatus)}
                            options={[
                                { label: "Active", value: "active" },
                                { label: "Inactive", value: "inactive" },
                                { label: "Suspended", value: "suspended" },
                            ]}
                        />
                    </Space>
                ),
            },
        ],
        [navigate]
    );

    return (
        <Card
            style={{ borderRadius: 16 }}
            bodyStyle={{ padding: 20 }}
        >
            <Row justify="space-between" align="middle" gutter={[16, 16]}>
                <Col>
                    <Space direction="vertical" size={2}>
                        <Title level={4} style={{ margin: 0 }}>
                            <ApartmentOutlined /> Tenant Management
                        </Title>
                        <Text type="secondary">
                            Create tenants, run bootstrap and manage tenant status.
                        </Text>
                    </Space>
                </Col>

                <Col>
                    <Space>
                        <Button icon={<ReloadOutlined />} onClick={() => loadTenants()}>
                            Refresh
                        </Button>

                        <Button
                            type="primary"
                            icon={<PlusOutlined />}
                            onClick={() => setCreateOpen(true)}
                        >
                            Create Tenant
                        </Button>
                    </Space>
                </Col>
            </Row>

            <Row gutter={[12, 12]} style={{ marginTop: 20, marginBottom: 16 }}>
                <Col xs={24} md={10}>
                    <Input.Search
                        allowClear
                        placeholder="Search by tenant name or slug"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        onSearch={handleSearch}
                    />
                </Col>

                <Col xs={24} md={6}>
                    <Select
                        allowClear
                        placeholder="Filter by status"
                        style={{ width: "100%" }}
                        value={status}
                        onChange={setStatus}
                        options={[
                            { label: "Active", value: "active" },
                            { label: "Inactive", value: "inactive" },
                            { label: "Suspended", value: "suspended" },
                        ]}
                    />
                </Col>

                <Col xs={24} md={4}>
                    <Button block onClick={handleSearch}>
                        Apply
                    </Button>
                </Col>
            </Row>

            <Table
                rowKey="id"
                loading={loading || actionLoading}
                columns={columns}
                dataSource={items}
                scroll={{ x: 1000 }}
                pagination={{
                    current: pagination.page,
                    pageSize: pagination.limit,
                    total: pagination.total,
                    showSizeChanger: true,
                    onChange: (page, limit) => loadTenants(page, limit),
                }}
            />

            <Modal
                title="Create Tenant"
                open={createOpen}
                onCancel={() => setCreateOpen(false)}
                onOk={handleCreateTenant}
                confirmLoading={actionLoading}
                okText="Create"
                destroyOnClose
            >
                <Form form={form} layout="vertical">
                    <Form.Item
                        label="Tenant Name"
                        name="name"
                        rules={[{ required: true, message: "Tenant name is required" }]}
                    >
                        <Input placeholder="Beta CRM" />
                    </Form.Item>

                    <Form.Item
                        label="Slug"
                        name="slug"
                        rules={[
                            { required: true, message: "Slug is required" },
                            {
                                pattern: /^[a-z0-9-]+$/,
                                message: "Only lowercase letters, numbers and hyphen allowed",
                            },
                        ]}
                    >
                        <Input placeholder="betacrm" />
                    </Form.Item>
                </Form>
            </Modal>
        </Card>
    );
}