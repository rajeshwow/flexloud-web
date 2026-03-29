import { EyeOutlined, PlusOutlined } from "@ant-design/icons";
import { Button, Input, Space, Table, Tag, Typography } from "antd";
import type { ColumnsType } from "antd/es/table";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { fetchRoles, type RoleItem } from "../../redux/reducers/rbac.slice";
import type { AppDispatch, RootState } from "../../redux/store";

const { Title, Text } = Typography;

export default function RolesListPage() {
    const dispatch = useDispatch<AppDispatch>();
    const navigate = useNavigate();
    const { slug = "" } = useParams();

    const { list, total, loading } = useSelector((state: RootState) => state.rbac);

    const [search, setSearch] = useState("");
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);

    useEffect(() => {
        dispatch(
            fetchRoles({
                page,
                limit,
                search,
            })
        );
    }, [dispatch, page, limit, search]);

    const columns: ColumnsType<RoleItem> = [
        {
            title: "Role Name",
            dataIndex: "name",
            key: "name",
            render: (_, record) => (
                <Space direction="vertical" size={0}>
                    <Text strong>{record.name}</Text>
                    <Text type="secondary">{record.code}</Text>
                </Space>
            ),
        },
        {
            title: "Description",
            dataIndex: "description",
            key: "description",
            render: (value) => value || "—",
        },
        {
            title: "Permissions",
            dataIndex: "permission_count",
            key: "permission_count",
            width: 140,
            render: (value) => value ?? "—",
        },
        {
            title: "Users",
            dataIndex: "user_count",
            key: "user_count",
            width: 120,
            render: (value) => value ?? "—",
        },
        {
            title: "Status",
            dataIndex: "is_active",
            key: "is_active",
            width: 120,
            render: (value) =>
                value === false ? <Tag color="red">Inactive</Tag> : <Tag color="green">Active</Tag>,
        },
        {
            title: "Action",
            key: "action",
            width: 120,
            render: (_, record) => (
                <Button
                    icon={<EyeOutlined />}
                    onClick={() => navigate(`/${slug}/rbac/${record.id}`)}
                >
                    View
                </Button>
            ),
        },
    ];

    return (
        <div>
            <div
                style={{
                    display: "flex",
                    justifyContent: "space-between",
                    gap: 12,
                    marginBottom: 16,
                    flexWrap: "wrap",
                }}
            >
                <div>
                    <Title level={3} style={{ marginBottom: 0 }}>
                        Roles & Permissions
                    </Title>
                    <Text type="secondary">
                        Manage roles and access permissions.
                    </Text>
                </div>

                <Space>
                    <Input.Search
                        placeholder="Search roles"
                        allowClear
                        style={{ width: 280 }}
                        onSearch={(value) => {
                            setPage(1);
                            setSearch(value);
                        }}
                    />

                    <Button
                        type="primary"
                        icon={<PlusOutlined />}
                        onClick={() => navigate(`/${slug}/rbac/create`)}
                    >
                        Create Role
                    </Button>
                </Space>
            </div>

            <Table<RoleItem>
                rowKey="id"
                columns={columns}
                dataSource={list}
                loading={loading}
                pagination={{
                    current: page,
                    pageSize: limit,
                    total,
                    showSizeChanger: true,
                    onChange: (nextPage, nextPageSize) => {
                        setPage(nextPage);
                        setLimit(nextPageSize);
                    },
                }}
            />
        </div>
    );
}