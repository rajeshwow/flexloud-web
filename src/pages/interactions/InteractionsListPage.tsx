import { PlusOutlined, SearchOutlined } from "@ant-design/icons";
import { Button, Input, Select, Space, Table, Tag, Typography } from "antd";
import type { ColumnsType } from "antd/es/table";
import dayjs from "dayjs";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import {
    fetchInteractions,
    type InteractionItem,
} from "../../redux/reducers/interactions.slice";
import type { AppDispatch, RootState } from "../../redux/store";

const { Title } = Typography;

export default function InteractionsListPage() {
    const dispatch = useDispatch<AppDispatch>();
    const navigate = useNavigate();
    const { slug } = useParams();

    const { list, total, listLoading } = useSelector(
        (state: RootState) => state.interactions
    );

    const [search, setSearch] = useState("");
    const [type, setType] = useState<"meeting" | "call" | undefined>();
    const [status, setStatus] = useState<string | undefined>();
    const [page, setPage] = useState(1);
    const limit = 10;

    useEffect(() => {
        dispatch(fetchInteractions({ search, type, status: status as any, page, limit }));
    }, [dispatch, search, type, status, page]);

    const columns: ColumnsType<InteractionItem> = [
        {
            title: "No.",
            dataIndex: "interaction_number",
            key: "interaction_number",
            width: 150,
        },
        {
            title: "Subject",
            dataIndex: "subject",
            key: "subject",
            render: (_, record) => (
                <Button
                    type="link"
                    style={{ padding: 0 }}
                    onClick={() => navigate(`/${slug}/events/${record.id}`)}
                >
                    {record.subject}
                </Button>
            ),
        },
        {
            title: "Type",
            dataIndex: "type",
            key: "type",
            width: 120,
            render: (value) => <Tag>{String(value || "").toUpperCase()}</Tag>,
        },
        {
            title: "Status",
            dataIndex: "status",
            key: "status",
            width: 130,
            render: (value) => <Tag>{String(value || "").toUpperCase()}</Tag>,
        },
        {
            title: "Start",
            dataIndex: "start_at",
            key: "start_at",
            width: 180,
            render: (value) => (value ? dayjs(value).format("DD MMM YYYY hh:mm A") : "-"),
        },
        {
            title: "End",
            dataIndex: "end_at",
            key: "end_at",
            width: 180,
            render: (value) => (value ? dayjs(value).format("DD MMM YYYY hh:mm A") : "-"),
        },
        {
            title: "Actions",
            key: "actions",
            width: 150,
            render: (_, record) => (
                <Space>
                    <Button size="small" onClick={() => navigate(`/${slug}/events/${record.id}`)}>
                        View
                    </Button>
                    <Button size="small" onClick={() => navigate(`/${slug}/events/${record.id}/edit`)}>
                        Edit
                    </Button>
                </Space>
            ),
        },
    ];

    return (
        <div>
            <Space
                style={{ width: "100%", justifyContent: "space-between", marginBottom: 16 }}
            >
                <Title level={3} style={{ margin: 0 }}>
                    Events
                </Title>

                <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={() => navigate(`/${slug}/events/create`)}
                >
                    Create Event
                </Button>
            </Space>

            <Space style={{ marginBottom: 16 }} wrap>
                <Input
                    allowClear
                    placeholder="Search Events"
                    prefix={<SearchOutlined />}
                    value={search}
                    onChange={(e) => {
                        setSearch(e.target.value);
                        setPage(1);
                    }}
                    style={{ width: 260 }}
                />

                <Select
                    allowClear
                    placeholder="Type"
                    style={{ width: 160 }}
                    value={type}
                    onChange={(value) => {
                        setType(value);
                        setPage(1);
                    }}
                    options={[
                        { label: "Meeting", value: "meeting" },
                        { label: "Call", value: "call" },
                    ]}
                />

                <Select
                    allowClear
                    placeholder="Status"
                    style={{ width: 180 }}
                    value={status}
                    onChange={(value) => {
                        setStatus(value);
                        setPage(1);
                    }}
                    options={[
                        { label: "Planned", value: "planned" },
                        { label: "Held", value: "held" },
                        { label: "Not Held", value: "not_held" },
                        { label: "Completed", value: "completed" },
                        { label: "Cancelled", value: "cancelled" },
                    ]}
                />
            </Space>

            <Table
                rowKey="id"
                columns={columns}
                dataSource={list}
                loading={listLoading}
                pagination={{
                    current: page,
                    pageSize: limit,
                    total,
                    onChange: (nextPage) => setPage(nextPage),
                }}
            />
        </div>
    );
}