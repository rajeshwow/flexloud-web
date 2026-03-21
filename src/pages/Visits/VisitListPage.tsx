import {
    EditOutlined,
    FilterOutlined,
    PlusOutlined,
    SearchOutlined,
} from "@ant-design/icons";
import {
    Button,
    Card,
    Input,
    Select,
    Space,
    Table,
    Tag,
    Typography,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import dayjs from "dayjs";
import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { getVisits, type VisitItem } from "../../redux/reducers/visits.slice";
import type { AppDispatch, RootState } from "../../redux/store";
import {
    VISIT_REGARDING_OPTIONS,
    VISIT_STATUS_OPTIONS,
} from "./utils/visitForm.utils";

const { Title } = Typography;

type RouteParams = {
    slug: string;
};

export default function VisitListPage() {
    const dispatch = useDispatch<AppDispatch>();
    const navigate = useNavigate();
    const { slug } = useParams<RouteParams>();

    const { list, listLoading, listPagination } = useSelector(
        (state: RootState) => state.visits,
    );

    const [search, setSearch] = useState("");
    const [status, setStatus] = useState<string | undefined>();
    const [regarding, setRegarding] = useState<string | undefined>();
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);

    const fetchList = () => {
        dispatch(
            getVisits({
                page,
                limit,
                search: search || undefined,
                status,
                regarding,
            }),
        );
    };

    useEffect(() => {
        fetchList();
    }, [page, limit, status, regarding]);

    const handleSearch = () => {
        setPage(1);
        dispatch(
            getVisits({
                page: 1,
                limit,
                search: search || undefined,
                status,
                regarding,
            }),
        );
    };

    const columns: ColumnsType<VisitItem> = useMemo(
        () => [
            {
                title: "Name",
                dataIndex: "name",
                key: "name",
                render: (value: string, record) => (
                    <a onClick={() => navigate(`/${slug}/visits/${record.id}/edit`)}>
                        {value}
                    </a>
                ),
            },
            {
                title: "Assigned To",
                dataIndex: "assigned_to_name",
                key: "assigned_to_name",
                render: (value) => value || "-",
            },
            {
                title: "Start Date",
                dataIndex: "start_date",
                key: "start_date",
                render: (value) =>
                    value ? dayjs(value).format("DD/MM/YYYY hh:mm A") : "-",
            },
            {
                title: "End Date",
                dataIndex: "end_date",
                key: "end_date",
                render: (value) =>
                    value ? dayjs(value).format("DD/MM/YYYY hh:mm A") : "-",
            },
            {
                title: "Status",
                dataIndex: "status",
                key: "status",
                render: (value) => value ? <Tag>{value}</Tag> : "-",
            },
            {
                title: "Regarding",
                dataIndex: "regarding",
                key: "regarding",
                render: (value) => value || "-",
            },
            {
                title: "Duration In Minutes",
                dataIndex: "duration_in_minutes",
                key: "duration_in_minutes",
                render: (value) => value ?? "-",
            },
            {
                title: "Checkin Address",
                dataIndex: "checkin_address",
                key: "checkin_address",
                ellipsis: true,
                render: (value) => value || "-",
            },
            {
                title: "Checkout Address",
                dataIndex: "checkout_address",
                key: "checkout_address",
                ellipsis: true,
                render: (value) => value || "-",
            },
            {
                title: "Action",
                key: "action",
                width: 80,
                render: (_, record) => (
                    <Button
                        type="text"
                        icon={<EditOutlined />}
                        onClick={() => navigate(`/${slug}/visits/${record.id}/edit`)}
                    />
                ),
            },
        ],
        [navigate, slug],
    );

    return (
        <Card
            title={<Title level={3} style={{ margin: 0 }}>Visits</Title>}
            extra={
                <Space>
                    <Button icon={<FilterOutlined />}>Filter</Button>
                    <Button
                        type="primary"
                        icon={<PlusOutlined />}
                        onClick={() => navigate(`/${slug}/visits/create`)}
                    >
                        Create
                    </Button>
                </Space>
            }
        >
            <Space style={{ marginBottom: 16 }} wrap>
                <Input
                    placeholder="Search visits"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    onPressEnter={handleSearch}
                    prefix={<SearchOutlined />}
                    style={{ width: 240 }}
                    allowClear
                />

                <Select
                    placeholder="Status"
                    options={VISIT_STATUS_OPTIONS}
                    value={status}
                    onChange={(value) => setStatus(value)}
                    style={{ width: 180 }}
                    allowClear
                />

                <Select
                    placeholder="Regarding"
                    options={VISIT_REGARDING_OPTIONS}
                    value={regarding}
                    onChange={(value) => setRegarding(value)}
                    style={{ width: 180 }}
                    allowClear
                />

                <Button type="primary" onClick={handleSearch}>
                    Search
                </Button>
            </Space>

            <Table
                rowKey="id"
                loading={listLoading}
                columns={columns}
                dataSource={list}
                pagination={{
                    current: page,
                    pageSize: limit,
                    total: listPagination.total,
                    showSizeChanger: true,
                    onChange: (nextPage, nextLimit) => {
                        setPage(nextPage);
                        setLimit(nextLimit || 10);
                    },
                }}
                scroll={{ x: 1200 }}
            />
        </Card>
    );
}