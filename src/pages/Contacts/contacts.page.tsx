import { SearchOutlined } from "@ant-design/icons";
import { Input, Space, Table } from "antd";
import type { ColumnsType } from "antd/es/table";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchContacts, type ContactItem } from "../../redux/reducers/contacts.slice";
import type { AppDispatch, RootState } from "../../redux/store";

export default function ContactsList() {
    const dispatch = useDispatch<AppDispatch>();
    const { contactList, listLoading, pagination } = useSelector(
        (state: RootState) => state.contacts,
    );

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
            render: (_, record) =>
                `${record.first_name || ""} ${record.last_name || ""}`.trim() || "-",
        },
        {
            title: "Mobile",
            dataIndex: "mobile",
            key: "mobile",
            render: (value: string | null) => value || "-",
        },
        {
            title: "Email",
            dataIndex: "email",
            key: "email",
            render: (value: string | null) => value || "-",
        },
        {
            title: "City",
            dataIndex: "city",
            key: "city",
            render: (value: string | null) => value || "-",
        },
        {
            title: "Organization",
            dataIndex: "organization_name",
            key: "organization_name",
            render: (value: string | null | undefined) => value || "-",
        },
        {
            title: "Assigned To",
            dataIndex: "assigned_to_name",
            key: "assigned_to_name",
            render: (value: string | null | undefined) => value || "-",
        },
        {
            title: "Date Created",
            dataIndex: "created_at",
            key: "created_at",
            render: (value: string) => new Date(value).toLocaleString(),
        },
    ];

    return (
        <div style={{ padding: 16 }}>
            <Space style={{ marginBottom: 16 }}>
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
            </Space>

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
                scroll={{ x: 1200 }}
            />
        </div>
    );
}