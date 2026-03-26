import { PlusOutlined, SearchOutlined } from "@ant-design/icons";
import { Button, Input, Space, Table, Tag, Typography } from "antd";
import type { ColumnsType } from "antd/es/table";
import dayjs from "dayjs";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { fetchQuotes, type QuoteItem } from "../../redux/reducers/quotes.slice";
import type { AppDispatch, RootState } from "../../redux/store";

const { Title } = Typography;

export default function QuotesListPage() {
    const dispatch = useDispatch<AppDispatch>();
    const navigate = useNavigate();
    const { slug } = useParams();

    const { list, listLoading } = useSelector((state: RootState) => state.quotes);
    const [search, setSearch] = useState("");

    useEffect(() => {
        dispatch(fetchQuotes({ search }));
    }, [dispatch, search]);

    const columns: ColumnsType<QuoteItem> = [
        {
            title: "Quote No",
            dataIndex: "quote_number",
            key: "quote_number",
            width: 140,
        },
        {
            title: "Title",
            dataIndex: "title",
            key: "title",
            render: (_, record) => (
                <Button type="link" style={{ padding: 0 }} onClick={() => navigate(`/${slug}/quotes/${record.id}`)}>
                    {record.title}
                </Button>
            ),
        },
        {
            title: "Stage",
            dataIndex: "quote_stage",
            key: "quote_stage",
            width: 120,
            render: (value) => <Tag>{String(value || "").toUpperCase()}</Tag>,
        },
        {
            title: "Quotation Date",
            dataIndex: "quotation_date",
            key: "quotation_date",
            width: 130,
            render: (value) => dayjs(value).format("DD MMM YYYY"),
        },
        {
            title: "Valid Until",
            dataIndex: "valid_until",
            key: "valid_until",
            width: 130,
            render: (value) => dayjs(value).format("DD MMM YYYY"),
        },
        {
            title: "Grand Total",
            dataIndex: "grand_total",
            key: "grand_total",
            width: 130,
            render: (value) => Number(value || 0).toFixed(2),
        },
        {
            title: "Actions",
            key: "actions",
            width: 140,
            render: (_, record) => (
                <Space>
                    <Button size="small" onClick={() => navigate(`/${slug}/quotes/${record.id}`)}>
                        View
                    </Button>
                    <Button size="small" onClick={() => navigate(`/${slug}/quotes/${record.id}/edit`)}>
                        Edit
                    </Button>
                </Space>
            ),
        },
    ];

    return (
        <div>
            <Space
                style={{
                    width: "100%",
                    justifyContent: "space-between",
                    marginBottom: 16,
                }}
            >
                <Title level={3} style={{ margin: 0 }}>
                    Quotes
                </Title>

                <Space>
                    <Input
                        allowClear
                        placeholder="Search quotes"
                        prefix={<SearchOutlined />}
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        style={{ width: 260 }}
                    />
                    <Button type="primary" icon={<PlusOutlined />} onClick={() => navigate(`/${slug}/quotes/create`)}>
                        Create Quote
                    </Button>
                </Space>
            </Space>

            <Table
                rowKey="id"
                columns={columns}
                dataSource={list}
                loading={listLoading}
                pagination={{ pageSize: 10 }}
            />
        </div>
    );
}