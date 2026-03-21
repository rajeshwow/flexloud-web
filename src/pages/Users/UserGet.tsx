import { PlusOutlined, SearchOutlined } from "@ant-design/icons";
import { Button, Input, Select, Space, Table, Tag, Typography } from "antd";
import type { ColumnsType } from "antd/es/table";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
    getUsers,
    type UserItem,
} from "../../redux/reducers/user.slice";
import type { AppDispatch, RootState } from "../../redux/store";
import UserCreateModal from "./UserCreate";

const { Option } = Select;
const { Title } = Typography;

export default function UserGet() {
    const dispatch = useDispatch<AppDispatch>();
    const { userList, listLoading, pagination } = useSelector(
        (state: RootState) => state.users
    );

    const [searchText, setSearchText] = useState("");
    const [role, setRole] = useState("");
    const [active, setActive] = useState<"" | "true" | "false">("");
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [openCreate, setOpenCreate] = useState(false);

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

    useEffect(() => {
        fetchUsers();
    }, [dispatch, page, pageSize, searchText, role, active]);

    const columns: ColumnsType<UserItem> = [
        {
            title: "Name",
            dataIndex: "name",
            key: "name",
            width: 180,
            render: (value) => <span style={{ fontWeight: 600 }}>{value}</span>,
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
                    value === "ADMIN" ? "red" : value === "MANAGER" ? "blue" : "green";
                return <Tag color={color}>{value}</Tag>;
            },
        },
        {
            title: "Department",
            dataIndex: "department",
            key: "department",
            width: 150,
            render: (value) => value || "-",
        },
        {
            title: "Designation",
            dataIndex: "designation",
            key: "designation",
            width: 150,
            render: (value) => value || "-",
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
                [record.city, record.state, record.country].filter(Boolean).join(", ") || "-",
        },
        {
            title: "Status",
            dataIndex: "is_active",
            key: "is_active",
            width: 110,
            render: (value) =>
                value ? <Tag color="green">Active</Tag> : <Tag color="red">Inactive</Tag>,
        },
        {
            title: "Created At",
            dataIndex: "created_at",
            key: "created_at",
            width: 180,
            render: (value) => (value ? new Date(value).toLocaleString() : "-"),
        },
    ];

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
                        <Option value="ADMIN">Admin</Option>
                        <Option value="MANAGER">Manager</Option>
                        <Option value="AGENT">Agent</Option>
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
                    <Button type="primary" icon={<PlusOutlined />} onClick={() => setOpenCreate(true)}>
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
                    showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} items`,
                    onChange: (newPage, newPageSize) => {
                        setPage(newPage);
                        setPageSize(newPageSize || 10);
                    },
                }}
                scroll={{ x: 1600 }}
            />

            <UserCreateModal
                open={openCreate}
                onClose={() => setOpenCreate(false)}
                onSuccess={() => {

                    setOpenCreate(false);
                    fetchUsers();
                }}
            />
        </div>
    );
}