import {
    ArrowLeftOutlined,
    CheckOutlined,
    KeyOutlined,
    ReloadOutlined,
    SaveOutlined,
} from "@ant-design/icons";
import {
    Alert,
    Button,
    Card,
    Checkbox,
    Col,
    Collapse,
    Descriptions,
    Empty,
    Input,
    Modal,
    Row,
    Space,
    Spin,
    Statistic,
    Tabs,
    Tag,
    Typography,
    message,
} from "antd";
import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import {
    fetchAdminTenantById,
    fetchAdminTenantPermissions,
    resetSelectedTenant,
    updateAdminTenantPermissions,
    type AdminPermissionItem,
} from "../../redux/reducers/adminTenants.slice";
import type { AppDispatch, RootState } from "../../redux/store";

const { Title, Text } = Typography;
const { Panel } = Collapse;

type PermissionGroup = {
    moduleKey: string;
    permissions: AdminPermissionItem[];
};

const getStatusColor = (status?: string) => {
    if (status === "active") return "success";
    if (status === "suspended") return "warning";
    return "default";
};

const formatModuleLabel = (value?: string | null) => {
    if (!value) return "General";

    return value
        .replace(/[-_]/g, " ")
        .replace(/\b\w/g, (char) => char.toUpperCase());
};

const formatPermissionLabel = (permission: AdminPermissionItem) => {
    if (permission.action_key) {
        return formatModuleLabel(permission.action_key);
    }

    return permission.code;
};

export default function TenantDetailPage() {
    const { tenantId } = useParams();
    const navigate = useNavigate();
    const dispatch = useDispatch<AppDispatch>();

    const {
        selectedTenant,
        detailLoading,
        tenantPermissionItems,
        allowedPermissionCodes,
        permissionsLoading,
        permissionsSaving,
    } = useSelector((state: RootState) => state.adminTenants);

    const [search, setSearch] = useState("");
    const [checkedCodes, setCheckedCodes] = useState<string[]>([]);

    useEffect(() => {
        if (!tenantId) return;

        dispatch(fetchAdminTenantById(tenantId));
        dispatch(fetchAdminTenantPermissions(tenantId));

        return () => {
            dispatch(resetSelectedTenant());
        };
    }, [dispatch, tenantId]);

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setCheckedCodes(allowedPermissionCodes || []);
    }, [allowedPermissionCodes]);

    const checkedSet = useMemo(() => new Set(checkedCodes), [checkedCodes]);

    const allPermissionCodes = useMemo(() => {
        return tenantPermissionItems.map((item) => item.code).filter(Boolean);
    }, [tenantPermissionItems]);

    const filteredGroups = useMemo<PermissionGroup[]>(() => {
        const query = search.trim().toLowerCase();
        const map = new Map<string, PermissionGroup>();

        tenantPermissionItems.forEach((permission) => {
            const moduleKey = permission.module_key || "general";

            const searchable = [
                permission.code,
                permission.description,
                permission.module_key,
                permission.action_key,
            ]
                .filter(Boolean)
                .join(" ")
                .toLowerCase();

            if (query && !searchable.includes(query)) {
                return;
            }

            if (!map.has(moduleKey)) {
                map.set(moduleKey, {
                    moduleKey,
                    permissions: [],
                });
            }

            map.get(moduleKey)?.permissions.push(permission);
        });

        return Array.from(map.values()).sort((a, b) =>
            a.moduleKey.localeCompare(b.moduleKey),
        );
    }, [tenantPermissionItems, search]);

    const selectedCount = checkedCodes.length;
    const totalCount = allPermissionCodes.length;

    const togglePermission = (code: string, checked: boolean) => {
        setCheckedCodes((prev) => {
            if (checked) {
                return Array.from(new Set([...prev, code]));
            }

            return prev.filter((item) => item !== code);
        });
    };

    const toggleModulePermissions = (codes: string[], checked: boolean) => {
        setCheckedCodes((prev) => {
            if (checked) {
                return Array.from(new Set([...prev, ...codes]));
            }

            const removeSet = new Set(codes);
            return prev.filter((code) => !removeSet.has(code));
        });
    };

    const handleSelectAll = () => {
        setCheckedCodes(Array.from(new Set(allPermissionCodes)));
    };

    const handleClearAll = () => {
        setCheckedCodes([]);
    };

    const handleReset = () => {
        setCheckedCodes(allowedPermissionCodes || []);
    };

    const reloadPermissions = () => {
        if (!tenantId) return;

        dispatch(fetchAdminTenantById(tenantId));
        dispatch(fetchAdminTenantPermissions(tenantId));
    };

    const savePermissions = async () => {
        if (!tenantId) return;

        const runSave = async () => {
            try {
                await dispatch(
                    updateAdminTenantPermissions({
                        tenantId,
                        permissionCodes: checkedCodes,
                    }),
                ).unwrap();

                message.success("Tenant permissions updated successfully");

                dispatch(fetchAdminTenantPermissions(tenantId));
                dispatch(fetchAdminTenantById(tenantId));
            } catch (error: any) {
                message.error(error || "Failed to update tenant permissions");
            }
        };

        if (checkedCodes.length === 0) {
            Modal.confirm({
                title: "Save empty permission list?",
                content:
                    "This tenant admin will not see CRM modules or RBAC permissions until you allow permissions again.",
                okText: "Save Empty",
                okButtonProps: {
                    danger: true,
                },
                onOk: runSave,
            });

            return;
        }

        await runSave();
    };

    if (detailLoading && !selectedTenant) {
        return (
            <Card style={{ borderRadius: 16 }}>
                <Spin />
            </Card>
        );
    }

    return (
        <Space direction="vertical" size={16} style={{ width: "100%" }}>
            <Button
                icon={<ArrowLeftOutlined />}
                onClick={() => navigate("/admin/tenants")}
            >
                Back to Tenants
            </Button>

            <Card style={{ borderRadius: 16 }}>
                <Row justify="space-between" align="middle" gutter={[16, 16]}>
                    <Col>
                        <Space direction="vertical" size={2}>
                            <Title level={4} style={{ margin: 0 }}>
                                Tenant Details
                            </Title>
                            <Text type="secondary">
                                View tenant information and control available permissions.
                            </Text>
                        </Space>
                    </Col>

                    <Col>
                        <Space>
                            <Tag color={getStatusColor(selectedTenant?.status)}>
                                {selectedTenant?.status?.toUpperCase() || "-"}
                            </Tag>

                            {selectedTenant?.is_bootstrapped ? (
                                <Tag color="success">BOOTSTRAPPED</Tag>
                            ) : (
                                <Tag color="warning">BOOTSTRAP PENDING</Tag>
                            )}
                        </Space>
                    </Col>
                </Row>
            </Card>

            <Tabs
                defaultActiveKey="details"
                items={[
                    {
                        key: "details",
                        label: "Details",
                        children: (
                            <Card style={{ borderRadius: 16 }}>
                                <Descriptions bordered column={1}>
                                    <Descriptions.Item label="Tenant Name">
                                        {selectedTenant?.name || "-"}
                                    </Descriptions.Item>

                                    <Descriptions.Item label="Slug">
                                        {selectedTenant?.slug || "-"}
                                    </Descriptions.Item>

                                    <Descriptions.Item label="Status">
                                        <Tag color={getStatusColor(selectedTenant?.status)}>
                                            {selectedTenant?.status?.toUpperCase() || "-"}
                                        </Tag>
                                    </Descriptions.Item>

                                    <Descriptions.Item label="Bootstrap">
                                        {selectedTenant?.is_bootstrapped ? (
                                            <Tag color="success">DONE</Tag>
                                        ) : (
                                            <Tag color="warning">PENDING</Tag>
                                        )}
                                    </Descriptions.Item>

                                    <Descriptions.Item label="Allowed Permissions">
                                        <Tag icon={<KeyOutlined />}>
                                            {selectedTenant?.allowed_permission_count ??
                                                allowedPermissionCodes.length ??
                                                0}
                                        </Tag>
                                    </Descriptions.Item>

                                    <Descriptions.Item label="Created At">
                                        {selectedTenant?.created_at
                                            ? new Date(selectedTenant.created_at).toLocaleString()
                                            : "-"}
                                    </Descriptions.Item>

                                    <Descriptions.Item label="Updated At">
                                        {selectedTenant?.updated_at
                                            ? new Date(selectedTenant.updated_at).toLocaleString()
                                            : "-"}
                                    </Descriptions.Item>
                                </Descriptions>
                            </Card>
                        ),
                    },
                    {
                        key: "permissions",
                        label: "Permissions",
                        children: (
                            <Card
                                style={{ borderRadius: 16 }}
                                bodyStyle={{ padding: 20 }}
                                loading={permissionsLoading}
                            >
                                <Row justify="space-between" align="middle" gutter={[16, 16]}>
                                    <Col>
                                        <Space direction="vertical" size={2}>
                                            <Title level={4} style={{ margin: 0 }}>
                                                <KeyOutlined /> Tenant Permissions
                                            </Title>
                                            <Text type="secondary">
                                                Select permissions available for this tenant. RBAC users
                                                inside this tenant will see only these permissions.
                                            </Text>
                                        </Space>
                                    </Col>

                                    <Col>
                                        <Space>
                                            <Button
                                                icon={<ReloadOutlined />}
                                                onClick={reloadPermissions}
                                                disabled={permissionsSaving}
                                            >
                                                Refresh
                                            </Button>

                                            <Button
                                                type="primary"
                                                icon={<SaveOutlined />}
                                                loading={permissionsSaving}
                                                onClick={savePermissions}
                                            >
                                                Save Permissions
                                            </Button>
                                        </Space>
                                    </Col>
                                </Row>

                                <Row gutter={[16, 16]} style={{ marginTop: 20 }}>
                                    <Col xs={24} md={8}>
                                        <Card size="small">
                                            <Statistic
                                                title="Selected Permissions"
                                                value={selectedCount}
                                                suffix={`/ ${totalCount}`}
                                            />
                                        </Card>
                                    </Col>

                                    <Col xs={24} md={16}>
                                        <Alert
                                            type="info"
                                            showIcon
                                            message="Permission allowlist"
                                            description="Removing a permission will also remove it from tenant roles after save. If no permission is selected, tenant admin will have no CRM module access."
                                        />
                                    </Col>
                                </Row>

                                <Row gutter={[12, 12]} style={{ marginTop: 20 }}>
                                    <Col xs={24} md={10}>
                                        <Input.Search
                                            allowClear
                                            placeholder="Search permission, module or action"
                                            value={search}
                                            onChange={(event) => setSearch(event.target.value)}
                                        />
                                    </Col>

                                    <Col xs={24} md={14}>
                                        <Space wrap>
                                            <Button icon={<CheckOutlined />} onClick={handleSelectAll}>
                                                Select All
                                            </Button>

                                            <Button onClick={handleClearAll}>Clear All</Button>

                                            <Button onClick={handleReset}>Reset</Button>
                                        </Space>
                                    </Col>
                                </Row>

                                <div style={{ marginTop: 20 }}>
                                    {filteredGroups.length ? (
                                        <Collapse defaultActiveKey={filteredGroups.map((g) => g.moduleKey)}>
                                            {filteredGroups.map((group) => {
                                                const moduleCodes = group.permissions.map(
                                                    (permission) => permission.code,
                                                );

                                                const selectedInModule = moduleCodes.filter((code) =>
                                                    checkedSet.has(code),
                                                );

                                                const isAllSelected =
                                                    moduleCodes.length > 0 &&
                                                    selectedInModule.length === moduleCodes.length;

                                                const isIndeterminate =
                                                    selectedInModule.length > 0 &&
                                                    selectedInModule.length < moduleCodes.length;

                                                return (
                                                    <Panel
                                                        key={group.moduleKey}
                                                        header={
                                                            <Row
                                                                justify="space-between"
                                                                align="middle"
                                                                gutter={[12, 12]}
                                                            >
                                                                <Col>
                                                                    <Space>
                                                                        <Text strong>
                                                                            {formatModuleLabel(group.moduleKey)}
                                                                        </Text>
                                                                        <Tag>
                                                                            {selectedInModule.length}/
                                                                            {moduleCodes.length}
                                                                        </Tag>
                                                                    </Space>
                                                                </Col>

                                                                <Col>
                                                                    <Checkbox
                                                                        checked={isAllSelected}
                                                                        indeterminate={isIndeterminate}
                                                                        onClick={(event) => event.stopPropagation()}
                                                                        onChange={(event) =>
                                                                            toggleModulePermissions(
                                                                                moduleCodes,
                                                                                event.target.checked,
                                                                            )
                                                                        }
                                                                    >
                                                                        Select module
                                                                    </Checkbox>
                                                                </Col>
                                                            </Row>
                                                        }
                                                    >
                                                        <Row gutter={[12, 12]}>
                                                            {group.permissions.map((permission) => (
                                                                <Col
                                                                    xs={24}
                                                                    sm={12}
                                                                    lg={8}
                                                                    xl={6}
                                                                    key={permission.code}
                                                                >
                                                                    <Card size="small">
                                                                        <Checkbox
                                                                            checked={checkedSet.has(permission.code)}
                                                                            onChange={(event) =>
                                                                                togglePermission(
                                                                                    permission.code,
                                                                                    event.target.checked,
                                                                                )
                                                                            }
                                                                        >
                                                                            <Space direction="vertical" size={0}>
                                                                                <Text strong>
                                                                                    {formatPermissionLabel(permission)}
                                                                                </Text>
                                                                                <Text type="secondary">
                                                                                    {permission.code}
                                                                                </Text>
                                                                                {permission.description ? (
                                                                                    <Text type="secondary">
                                                                                        {permission.description}
                                                                                    </Text>
                                                                                ) : null}
                                                                            </Space>
                                                                        </Checkbox>
                                                                    </Card>
                                                                </Col>
                                                            ))}
                                                        </Row>
                                                    </Panel>
                                                );
                                            })}
                                        </Collapse>
                                    ) : (
                                        <Empty description="No permissions found" />
                                    )}
                                </div>
                            </Card>
                        ),
                    },
                ]}
            />
        </Space>
    );
}