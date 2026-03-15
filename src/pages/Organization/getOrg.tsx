import { SearchOutlined } from "@ant-design/icons";
import { Input, Space, Table, Tag } from "antd";
import type { ColumnsType } from "antd/es/table";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
    getOrganization,
    type OrganizationItem,
} from "../../redux/reducers/organization.slice";
import type { AppDispatch, RootState } from "../../redux/store";

export default function OrganizationGet() {
    const dispatch = useDispatch<AppDispatch>();
    const { list, listLoading, pagination } = useSelector(
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

    const columns: ColumnsType<OrganizationItem> = [
        {
            title: "Organization Name",
            dataIndex: "name",
            key: "name",
            width: 220,
            render: (value) => <span style={{ fontWeight: 600 }}>{value}</span>,
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
            width: 120,
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
                    <Tag color={value === "partner" ? "blue" : value === "vendor" ? "orange" : "green"}>
                        {value}
                    </Tag>
                ) : (
                    "-"
                ),
        },
        {
            title: "Industry",
            dataIndex: "industry",
            key: "industry",
            width: 140,
            render: (value) => value || "-",
        },
        {
            title: "Assigned To",
            dataIndex: "assigned_to_name",
            key: "assigned_to_name",
            width: 160,
            render: (value) => value || "-",
        },
        {
            title: "Email Address",
            dataIndex: "email",
            key: "email",
            width: 220,
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
            title: "Date Created",
            dataIndex: "created_at",
            key: "created_at",
            width: 180,
            render: (value) => (value ? new Date(value).toLocaleString() : "-"),
        },
    ];

    return (
        <div style={{ padding: 16 }}>
            <Space style={{ marginBottom: 16 }}>
                <Input
                    allowClear
                    placeholder="Search by name, email, type, industry"
                    prefix={<SearchOutlined />}
                    value={searchText}
                    onChange={(e) => {
                        setSearchText(e.target.value);
                        setPage(1);
                    }}
                    style={{ width: 320 }}
                />
            </Space>

            <Table
                rowKey="id"
                columns={columns}
                dataSource={list}
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
                scroll={{ x: 1500 }}
            />
        </div>
    );
}