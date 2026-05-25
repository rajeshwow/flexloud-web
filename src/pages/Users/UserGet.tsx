import {
    EditOutlined,
    PlusOutlined,
    SearchOutlined,
    TrophyOutlined,
} from "@ant-design/icons";
import {
    Button,
    Input,
    InputNumber,
    Modal,
    Select,
    Space,
    Switch,
    Table,
    Tag,
    Typography,
    message
} from "antd";
import type { ColumnsType } from "antd/es/table";
import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchRoles } from "../../redux/reducers/rbac.slice";
import {
    getUsers,
    setUserTarget,
    updateUserStatus,
    type UserItem,
} from "../../redux/reducers/user.slice";
import type { AppDispatch, RootState } from "../../redux/store";
import { toTitleCase } from "../../shared/Utils/utils";
import UserCreateModal from "./UserCreate";

const { Option } = Select;
const { Title, Text } = Typography;

export default function UserGet() {
    const dispatch = useDispatch<AppDispatch>();

    const { userList, listLoading, pagination } = useSelector(
        (state: RootState) => state.users
    );

    const { list: rolesList } = useSelector((state: RootState) => state.rbac);

    const [searchText, setSearchText] = useState("");
    const [role, setRole] = useState("");
    const [active, setActive] = useState<"" | "true" | "false">("");
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [openCreate, setOpenCreate] = useState(false);

    const [targetModalOpen, setTargetModalOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState<UserItem | null>(null);
    const [targetAmount, setTargetAmount] = useState<number | null>(null);
    const [targetSubmitting, setTargetSubmitting] = useState(false);
    const [statusUpdatingId, setStatusUpdatingId] = useState<string | null>(null);

    const fetchUsers = async () => {
        await dispatch(
            getUsers({
                page,
                limit: pageSize,
                search: searchText.trim(),
                role,
                active,
            })
        );
    };

    const handleStatusChange = async (record: UserItem, checked: boolean) => {
        try {
            setStatusUpdatingId(record.id);
            // debugger
            const res = await dispatch(
                updateUserStatus({
                    id: record.id,
                    is_active: checked,
                })
            ).unwrap();

            if (res?.statusCode === 200) {
                message.success(res?.message);
                fetchUsers();
            }

        } catch (error: any) {
            message.error(error || "Failed to update user status");
        } finally {
            setStatusUpdatingId(null);
        }
    };

    useEffect(() => {
        dispatch(fetchRoles());
    }, [dispatch]);

    useEffect(() => {
        fetchUsers();
    }, [dispatch, page, pageSize, searchText, role, active]);

    const openTargetModal = (record: UserItem) => {
        setSelectedUser(record);

        const existingTarget = record.target_amount
            ? Number(record.target_amount)
            : null;

        setTargetAmount(Number.isFinite(existingTarget as number) ? existingTarget : null);
        setTargetModalOpen(true);
    };

    const closeTargetModal = () => {
        setTargetModalOpen(false);
        setSelectedUser(null);
        setTargetAmount(null);
    };

    const handleSubmitTarget = async () => {
        if (!selectedUser?.id) return;

        if (targetAmount === null || targetAmount < 0) {
            message.error("Please enter a valid target amount");
            return;
        }

        try {
            setTargetSubmitting(true);

            await dispatch(
                setUserTarget({
                    id: selectedUser.id,
                    target_amount: targetAmount,
                })
            ).unwrap();

            message.success("Target updated successfully");
            closeTargetModal();
            fetchUsers();
        } catch (error: any) {
            message.error(error || "Failed to update target");
        } finally {
            setTargetSubmitting(false);
        }
    };

    const columns: ColumnsType<UserItem> = useMemo(
        () => [
            {
                title: "Name",
                dataIndex: "name",
                key: "name",
                width: 180,
                render: (value) => (
                    <span style={{ fontWeight: 600 }}>{toTitleCase(value)}</span>
                ),
            },
            {
                title: "Target",
                dataIndex: "target_amount",
                key: "target_amount",
                width: 150,
                render: (value) => {
                    if (!value) {
                        return <Text type="secondary">Not set</Text>;
                    }

                    return (
                        <Tag icon={<TrophyOutlined />} color="gold">
                            ₹{Number(value).toLocaleString("en-IN")}
                        </Tag>
                    );
                },
            },
            {
                title: "Email",
                dataIndex: "email",
                key: "email",
                width: 220,
                render: (value) => value || "-",
            },
            {
                title: "Phone",
                key: "phone",
                width: 150,
                render: (_, record) =>
                    record.phone
                        ? `${record.phone_country_code || ""} ${record.phone}`.trim()
                        : "-",
            },
            {
                title: "Role",
                dataIndex: "role",
                key: "role",
                width: 120,
                render: (value) => {
                    const color =
                        value === "ADMIN"
                            ? "red"
                            : value === "MANAGER"
                                ? "blue"
                                : "green";

                    return <Tag color={color}>{toTitleCase(value)}</Tag>;
                },
            },
            {
                title: "Department",
                dataIndex: "department",
                key: "department",
                width: 150,
                render: (value) => toTitleCase(value) || "-",
            },
            {
                title: "Designation",
                dataIndex: "designation",
                key: "designation",
                width: 150,
                render: (value) => toTitleCase(value) || "-",
            },
            {
                title: "Employee Code",
                dataIndex: "employee_code",
                key: "employee_code",
                width: 140,
                render: (value) => value || "-",
            },
            {
                title: "Location",
                key: "location",
                width: 160,
                render: (_, record) =>
                    [record.city, record.state, record.country].filter(Boolean).join(", ") ||
                    "-",
            },
            // {
            //     title: "Target",
            //     dataIndex: "target_amount",
            //     key: "target_amount",
            //     width: 150,
            //     render: (value) => {
            //         if (!value) {
            //             return <Text type="secondary">Not set</Text>;
            //         }

            //         return (
            //             <Tag icon={<TrophyOutlined />} color="gold">
            //                 ₹{Number(value).toLocaleString("en-IN")}
            //             </Tag>
            //         );
            //     },
            // },
            {
                title: "Status",
                dataIndex: "is_active",
                key: "is_active",
                width: 110,
                render: (value, record) =>
                    value ? <Tag color="green">Active</Tag> : <Tag color="red">Inactive</Tag>,
            },
            {
                title: "Created At",
                dataIndex: "created_at",
                key: "created_at",
                width: 180,
                render: (value) => (value ? new Date(value).toLocaleString() : "-"),
            },
            {
                title: "Action",
                key: "action",
                width: 220,
                fixed: "right",
                render: (_, record) => {
                    const hasTarget = !!record.target_amount;

                    return (
                        <Space>
                            <Switch
                                checked={!!record.is_active}
                                checkedChildren="Enable"
                                unCheckedChildren="Disable"
                                loading={statusUpdatingId === record.id}
                                onChange={(checked) => handleStatusChange(record, checked)}
                            />
                            <Button
                                size="small"
                                type={hasTarget ? "default" : "primary"}
                                icon={hasTarget ? <EditOutlined /> : <TrophyOutlined />}
                                onClick={() => openTargetModal(record)}
                            >
                                {hasTarget ? "Edit Target" : "Set Target"}
                            </Button>


                        </Space>
                    );
                },
            },
        ],
        []
    );

    return (
        <div style={{ padding: 16 }}>
            <Space
                style={{
                    marginBottom: 16,
                    width: "100%",
                    justifyContent: "space-between",
                }}
                wrap
            >
                <Title level={4} style={{ margin: 0 }}>
                    Users
                </Title>

                <Space wrap>
                    <Input
                        allowClear
                        placeholder="Search by name, email, phone, department"
                        prefix={<SearchOutlined />}
                        value={searchText}
                        onChange={(e) => {
                            setSearchText(e.target.value);
                            setPage(1);
                        }}
                        style={{ width: 320 }}
                    />

                    <Select
                        allowClear
                        placeholder="Filter by role"
                        value={role || undefined}
                        onChange={(value) => {
                            setRole(value || "");
                            setPage(1);
                        }}
                        style={{ width: 160 }}
                    >
                        {rolesList?.map((role: any) => (
                            <Option key={role.id} value={role.id}>
                                {role.name}
                            </Option>
                        ))}
                    </Select>

                    <Select
                        allowClear
                        placeholder="Filter by status"
                        value={active || undefined}
                        onChange={(value) => {
                            setActive((value as "" | "true" | "false") || "");
                            setPage(1);
                        }}
                        style={{ width: 160 }}
                    >
                        <Option value="true">Active</Option>
                        <Option value="false">Inactive</Option>
                    </Select>

                    <Button
                        type="primary"
                        icon={<PlusOutlined />}
                        onClick={() => setOpenCreate(true)}
                    >
                        Create User
                    </Button>
                </Space>
            </Space>

            <Table
                rowKey="id"
                columns={columns}
                dataSource={userList}
                loading={listLoading}
                bordered
                pagination={{
                    current: page,
                    pageSize,
                    total: pagination?.total,
                    showSizeChanger: true,
                    pageSizeOptions: ["10", "20", "50", "100"],
                    showTotal: (total, range) =>
                        `${range[0]}-${range[1]} of ${total} items`,
                    onChange: (newPage, newPageSize) => {
                        setPage(newPage);
                        setPageSize(newPageSize || 10);
                    },
                }}
                scroll={{ x: 1750 }}
            />

            <UserCreateModal
                open={openCreate}
                onClose={() => setOpenCreate(false)}
                onSuccess={() => {
                    setOpenCreate(false);
                    fetchUsers();
                }}
            />

            <Modal
                title={selectedUser?.target_amount ? "Edit Target" : "Set Target"}
                open={targetModalOpen}
                onCancel={closeTargetModal}
                onOk={handleSubmitTarget}
                confirmLoading={targetSubmitting}
                okText="Submit"
                destroyOnClose
            >
                <Space direction="vertical" size={12} style={{ width: "100%" }}>
                    <div>
                        <Text type="secondary">User</Text>
                        <div style={{ fontWeight: 600 }}>
                            {toTitleCase(selectedUser?.name || selectedUser?.email || "-")}
                        </div>
                    </div>

                    <div>
                        <Text type="secondary">Target Amount</Text>
                        <InputNumber
                            value={targetAmount}
                            onChange={(value) => setTargetAmount(value ?? null)}
                            min={0}
                            precision={2}
                            placeholder="Enter target amount e.g. 500000"
                            style={{ width: "100%", marginTop: 6 }}
                            formatter={(value) =>
                                value
                                    ? `₹ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                                    : ""
                            }
                            parser={(value) =>
                                value?.replace(/₹\s?|(,*)/g, "") as unknown as number
                            }
                        />
                    </div>
                </Space>
            </Modal>
        </div>
    );
}