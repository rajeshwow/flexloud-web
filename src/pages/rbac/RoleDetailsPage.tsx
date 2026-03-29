import {
    EditOutlined,
    TeamOutlined,
} from "@ant-design/icons";
import {
    Button,
    Card,
    Col,
    Descriptions,
    Empty,
    Row,
    Skeleton,
    Space,
    Tag,
    Typography,
} from "antd";
import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import {
    fetchRoleById,
    resetCurrentRoleState,
} from "../../redux/reducers/rbac.slice";
import type { AppDispatch, RootState } from "../../redux/store";
import RoleForm from "./components/RoleForm";
import UserRoleAssignDrawer from "./components/UserRoleAssignDrawer";

const { Title, Text } = Typography;

function humanizePermission(code: string) {
    return code.replace(/\./g, " / ");
}

export default function RoleDetailsPage() {
    const dispatch = useDispatch<AppDispatch>();
    const { id = "" } = useParams();

    const { currentRole, currentRoleLoading } = useSelector(
        (state: RootState) => state.rbac
    );

    const [isEditMode, setIsEditMode] = useState(false);
    const [assignDrawerOpen, setAssignDrawerOpen] = useState(false);

    useEffect(() => {
        if (id) {
            dispatch(fetchRoleById(id));
        }

        return () => {
            dispatch(resetCurrentRoleState());
        };
    }, [dispatch, id]);

    const groupedPermissions = useMemo(() => {
        const list = currentRole?.permissions || [];
        return list.reduce((acc, code) => {
            const moduleName = code.split(".")[0] || "general";
            if (!acc[moduleName]) acc[moduleName] = [];
            acc[moduleName].push(code);
            return acc;
        }, {} as Record<string, string[]>);
    }, [currentRole]);

    if (currentRoleLoading && !currentRole) {
        return <Skeleton active />;
    }

    if (!currentRole) {
        return <Empty description="Role not found" />;
    }

    console.log("currentRole", currentRole);

    return (
        <Space direction="vertical" size={16} style={{ width: "100%" }}>
            <Card>
                <div
                    style={{
                        display: "flex",
                        justifyContent: "space-between",
                        gap: 12,
                        flexWrap: "wrap",
                    }}
                >
                    <div>
                        <Title level={3} style={{ marginTop: 0, marginBottom: 0 }}>
                            {currentRole.name}
                        </Title>
                        <Text type="secondary">{currentRole.code}</Text>
                    </div>

                    <Space wrap>
                        <Button
                            icon={<TeamOutlined />}
                            onClick={() => setAssignDrawerOpen(true)}
                        >
                            Assign Users
                        </Button>

                        <Button
                            type={isEditMode ? "default" : "primary"}
                            icon={<EditOutlined />}
                            onClick={() => setIsEditMode((prev) => !prev)}
                        >
                            {isEditMode ? "Cancel Edit" : "Edit Role"}
                        </Button>
                    </Space>
                </div>
            </Card>

            {isEditMode ? (
                <Card>
                    <RoleForm
                        mode="edit"
                        initialValues={currentRole}
                        onSuccess={() => {
                            setIsEditMode(false);
                            dispatch(fetchRoleById(id));
                        }}
                    />
                </Card>
            ) : (
                <>
                    <Row gutter={[16, 16]}>
                        <Col xs={24} lg={10}>
                            <Card title="Role Details">
                                <Descriptions column={1} size="middle">
                                    <Descriptions.Item label="Role Name">
                                        {currentRole.name}
                                    </Descriptions.Item>
                                    <Descriptions.Item label="Role Code">
                                        {currentRole.code}
                                    </Descriptions.Item>
                                    <Descriptions.Item label="Description">
                                        {currentRole.description || "—"}
                                    </Descriptions.Item>
                                    <Descriptions.Item label="Status">
                                        {currentRole.is_active === false ? (
                                            <Tag color="red">Inactive</Tag>
                                        ) : (
                                            <Tag color="green">Active</Tag>
                                        )}
                                    </Descriptions.Item>
                                </Descriptions>
                            </Card>
                        </Col>

                        <Col xs={24} lg={14}>
                            <Card title={`Assigned Users (${currentRole.users?.length || 0})`}>
                                {currentRole.users?.length ? (
                                    <Space wrap>
                                        {currentRole.users.map((user) => (
                                            <Tag key={user.id}>
                                                {user.name ||
                                                    `${user.first_name || ""} ${user.last_name || ""}`.trim() ||
                                                    user.email ||
                                                    user.id}
                                            </Tag>
                                        ))}
                                    </Space>
                                ) : (
                                    <Empty description="No users assigned" />
                                )}
                            </Card>
                        </Col>
                    </Row>

                    <Card title={`Permissions (${currentRole.permissions?.length || 0})`}>
                        {Object.keys(groupedPermissions).length ? (
                            <Space direction="vertical" size={16} style={{ width: "100%" }}>
                                {Object.entries(groupedPermissions).map(([moduleName, items]) => (
                                    <div
                                        key={moduleName}
                                        style={{
                                            border: "1px solid var(--border-color, #f0f0f0)",
                                            borderRadius: 12,
                                            padding: 16,
                                        }}
                                    >
                                        <Title level={5} style={{ marginTop: 0 }}>
                                            {moduleName.replace(/\b\w/g, (s) => s.toUpperCase())}
                                        </Title>

                                        <Space wrap>
                                            {items.map((code) => (
                                                <Tag key={code}>{humanizePermission(code)}</Tag>
                                            ))}
                                        </Space>
                                    </div>
                                ))}
                            </Space>
                        ) : (
                            <Empty description="No permissions assigned" />
                        )}
                    </Card>
                </>
            )}

            <UserRoleAssignDrawer
                open={assignDrawerOpen}
                onClose={() => setAssignDrawerOpen(false)}
                roleId={id}
            />
        </Space>
    );
}