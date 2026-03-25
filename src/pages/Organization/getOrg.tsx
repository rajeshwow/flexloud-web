import {
    EditOutlined,
    EyeOutlined,
    PlusOutlined,
    SearchOutlined,
} from "@ant-design/icons";
import { Button, Input, Space, Table, Tag, Tooltip, Typography } from "antd";
import type { ColumnsType } from "antd/es/table";
import dayjs from "dayjs";
import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";

import {
    getOrganization,
    type OrganizationItem,
} from "../../redux/reducers/organization.slice";
import type { AppDispatch, RootState } from "../../redux/store";

const { Title, Text, Link } = Typography;

export default function OrganizationGet() {
    const dispatch = useDispatch<AppDispatch>();
    const navigate = useNavigate();
    const { slug = "" } = useParams();

    const { orgList, listLoading, pagination } = useSelector(
        (state: RootState) => state.organization
    );

    const [searchText, setSearchText] = useState("");
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);

    useEffect(() => {
        dispatch(
            getOrganization({
                page,
                limit: pageSize,
                search: searchText.trim(),
            })
        );
    }, [dispatch, page, pageSize, searchText]);

    const columns: ColumnsType<OrganizationItem> = useMemo(
        () => [
            {
                title: "Organization",
                dataIndex: "name",
                key: "name",
                width: 240,
                render: (_, record) => (
                    <Space direction="vertical" size={0}>
                        <Link onClick={() => navigate(`/${slug}/organization/view/${record.id}`)}>
                            <Text strong>{record.name || "-"}</Text>
                        </Link>
                        <Text type="secondary">{record.email || "-"}</Text>
                    </Space>
                ),
            },
            {
                title: "Head Office",
                dataIndex: "head_office_name",
                key: "head_office_name",
                width: 180,
                render: (value) => value || "-",
            },
            {
                title: "Branches",
                dataIndex: "branch_count",
                key: "branch_count",
                width: 110,
                align: "center",
                render: (value) => <Tag color="blue">{value ?? 0}</Tag>,
            },
            {
                title: "Type",
                dataIndex: "type",
                key: "type",
                width: 130,
                render: (value) =>
                    value ? (
                        <Tag
                            color={
                                value === "partner"
                                    ? "blue"
                                    : value === "vendor"
                                        ? "orange"
                                        : value === "customer"
                                            ? "green"
                                            : "default"
                            }
                        >
                            {String(value).charAt(0).toUpperCase() + String(value).slice(1)}
                        </Tag>
                    ) : (
                        "-"
                    ),
            },
            {
                title: "Industry",
                dataIndex: "industry_name",
                key: "industry_name",
                width: 180,
                render: (value, record) => value || record.industry || "-",
            },
            {
                title: "Assigned To",
                dataIndex: "assigned_to_name",
                key: "assigned_to_name",
                width: 180,
                render: (value) => value || "-",
            },
            {
                title: "GST Number",
                dataIndex: "gst_number",
                key: "gst_number",
                width: 180,
                render: (value) => value || "-",
            },
            {
                title: "Created At",
                dataIndex: "created_at",
                key: "created_at",
                width: 180,
                render: (value) => (value ? dayjs(value).format("DD MMM YYYY, hh:mm A") : "-"),
            },
            {
                title: "Action",
                key: "action",
                fixed: "right",
                width: 120,
                render: (_, record) => (
                    <Space size="small">
                        <Tooltip title="View details">
                            <Button
                                icon={<EyeOutlined />}
                                onClick={() => navigate(`/${slug}/organization/view/${record.id}`)}
                            />
                        </Tooltip>

                        <Tooltip title="Edit organization">
                            <Button
                                icon={<EditOutlined />}
                                onClick={() =>
                                    navigate(`/${slug}/organization/view/${record.id}`, {
                                        state: { edit: true },
                                    })
                                }
                            />
                        </Tooltip>
                    </Space>
                ),
            },
        ],
        [navigate, slug]
    );

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
                    Organizations
                </Title>

                <Space wrap>
                    <Input
                        allowClear
                        placeholder="Search organizations"
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
                        onClick={() => navigate(`/${slug}/organizations/create`)}
                    >
                        Create
                    </Button>
                </Space>
            </div>

            <Table
                rowKey="id"
                columns={columns}
                dataSource={orgList}
                loading={listLoading}
                bordered
                scroll={{ x: 1600 }}
                onRow={(record) => ({
                    onDoubleClick: () => navigate(`/${slug}/organization/view/${record.id}`),
                })}
                pagination={{
                    current: page,
                    pageSize,
                    total: pagination?.total || 0,
                    showSizeChanger: true,
                    pageSizeOptions: ["10", "20", "50", "100"],
                    showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} items`,
                    onChange: (newPage, newPageSize) => {
                        setPage(newPage);
                        setPageSize(newPageSize || 10);
                    },
                }}
            />
        </div>
    );
}