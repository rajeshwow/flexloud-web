import {
    EditOutlined,
    EyeOutlined,
    PlusOutlined,
    SearchOutlined,
    UserOutlined,
} from "@ant-design/icons";
import { Button, Input, Space, Table, Tag, Tooltip, Typography } from "antd";
import type { ColumnsType } from "antd/es/table";
import dayjs from "dayjs";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { fetchContacts, type ContactItem } from "../../redux/reducers/contacts.slice";
import type { AppDispatch, RootState } from "../../redux/store";
import { toTitleCase } from "../../shared/Utils/utils";

const { Title, Text, Link } = Typography;

export default function ContactsList() {
    const dispatch = useDispatch<AppDispatch>();
    const { contactList, listLoading, pagination } = useSelector(
        (state: RootState) => state.contacts,
    );
    const { slug = "" } = useParams();
    const navigate = useNavigate();

    const [searchText, setSearchText] = useState("");
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);

    useEffect(() => {
        const timer = setTimeout(() => {
            dispatch(fetchContacts({ page, limit: pageSize, search: searchText }));
        }, 400);

        return () => clearTimeout(timer);
    }, [dispatch, page, pageSize, searchText]);

    const columns: ColumnsType<ContactItem> = [
        {
            title: "Name",
            key: "name",
            width: 220,
            render: (_, record) => {
                const fullName =
                    `${record.first_name || ""} ${record.last_name || ""}`.trim() || "-";

                return (
                    <Space direction="vertical" size={0}>
                        <Link onClick={() => navigate(`/${slug}/contacts/${record.id}`)}>
                            <Space size={8}>
                                <UserOutlined />
                                <Text strong>{toTitleCase(fullName)}</Text>
                            </Space>
                        </Link>

                        {record.primary_contact ? (
                            <Tag color={record.primary_contact === "yes" ? "green" : "default"}>
                                {record.primary_contact === "yes" ? "Primary" : "Secondary"}
                            </Tag>
                        ) : null}
                    </Space>
                );
            },
        },
        {
            title: "Mobile",
            dataIndex: "mobile",
            key: "mobile",
            width: 150,
            render: (value: string | null) => value || "-",
        },
        {
            title: "Email",
            dataIndex: "email",
            key: "email",
            width: 220,
            render: (value: string | null) => value || "-",
        },
        {
            title: "City",
            dataIndex: "city",
            key: "city",
            width: 140,
            render: (value: string | null) =>
                value ? <Tag>{toTitleCase(value)}</Tag> : "-",
        },
        {
            title: "Organization",
            dataIndex: "organization_name",
            key: "organization_name",
            width: 200,
            render: (value: string | null | undefined) =>
                value ? <Tag color="blue">{toTitleCase(value)}</Tag> : "-",
        },
        {
            title: "Assigned To",
            dataIndex: "assigned_to_name",
            key: "assigned_to_name",
            width: 180,
            render: (value: string | null | undefined) =>
                value ? <Tag color="purple">{toTitleCase(value)}</Tag> : "-",
        },
        {
            title: "Date Created",
            dataIndex: "created_at",
            key: "created_at",
            width: 180,
            render: (value: string) => (value ? dayjs(value).format("DD MMM YYYY, hh:mm A") : "-"),
        },
        {
            title: "Actions",
            key: "actions",
            fixed: "right",
            width: 140,
            render: (_, record) => (
                <Space>
                    <Tooltip title="View Details">
                        <Button
                            icon={<EyeOutlined />}
                            onClick={() => navigate(`/${slug}/contacts/${record.id}`)}
                        />
                    </Tooltip>

                    <Tooltip title="Edit Contact">
                        <Button
                            icon={<EditOutlined />}
                            onClick={() => navigate(`/${slug}/contacts/${record.id}/edit`)}
                        />
                    </Tooltip>
                </Space>
            ),
        },
    ];

    return (
        <div style={{ padding: 16 }}>
            <div
                style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: 12,
                    marginBottom: 16,
                    flexWrap: "wrap",
                }}
            >
                <Title level={4} style={{ margin: 0 }}>
                    Contacts
                </Title>

                <Space wrap>
                    <Input
                        allowClear
                        placeholder="Search by name, mobile, email"
                        prefix={<SearchOutlined />}
                        value={searchText}
                        onChange={(e) => {
                            setSearchText(e.target.value);
                            setPage(1);
                        }}
                        style={{ width: 320 }}
                    />

                    <Button
                        type="primary"
                        icon={<PlusOutlined />}
                        onClick={() => navigate(`/${slug}/contacts/create`)}
                    >
                        Create Contact
                    </Button>
                </Space>
            </div>

            <Table
                rowKey="id"
                columns={columns}
                dataSource={contactList || []}
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
                        setPageSize(newPageSize);
                    },
                }}
                scroll={{ x: 1400 }}
            />
        </div>
    );
}