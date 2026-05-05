import {
    EditOutlined,
    EyeOutlined,
    FileTextOutlined,
    PlusOutlined,
    ReloadOutlined,
} from "@ant-design/icons";
import {
    Button,
    Input,
    message,
    Select,
    Space,
    Table,
    Tag,
    Typography
} from "antd";
import type { ColumnsType } from "antd/es/table";
import dayjs from "dayjs";
import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import {
    fetchDeliveryChallans,
    type DeliveryChallan,
} from "../../redux/reducers/deliveryChallans/deliveryChallanSlice";
import type { AppDispatch, RootState } from "../../redux/store";

const { Title, Text } = Typography;

const STATUS_OPTIONS = [
    { label: "All Status", value: "" },
    { label: "Draft", value: "draft" },
    { label: "Created", value: "created" },
    { label: "Cancelled", value: "cancelled" },
];

const getStatusColor = (status?: string) => {
    const value = String(status || "").toLowerCase();

    if (value === "created") return "green";
    if (value === "draft") return "gold";
    if (value === "cancelled") return "red";

    return "default";
};

export default function DeliveryChallanListPage() {
    const dispatch = useDispatch<AppDispatch>();
    const navigate = useNavigate();
    const { slug } = useParams();

    const { list, loading, meta } = useSelector(
        (state: RootState) => state.deliveryChallans,
    );

    const [search, setSearch] = useState("");
    const [status, setStatus] = useState("");
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);

    const loadDeliveryChallans = async (
        nextPage = page,
        nextLimit = limit,
        nextSearch = search,
        nextStatus = status,
    ) => {
        try {
            await dispatch(
                fetchDeliveryChallans({
                    page: nextPage,
                    limit: nextLimit,
                    search: nextSearch || undefined,
                    status: nextStatus || undefined,
                }),
            ).unwrap();
        } catch (error: any) {
            message.error(error || "Failed to load delivery challans");
        }
    };

    useEffect(() => {
        loadDeliveryChallans(1, limit, "", "");
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleSearch = () => {
        setPage(1);
        loadDeliveryChallans(1, limit, search, status);
    };

    const handleReset = () => {
        setSearch("");
        setStatus("");
        setPage(1);
        loadDeliveryChallans(1, limit, "", "");
    };

    const handleCreate = () => {
        navigate(`/${slug}/delivery-challans/create`);
    };

    const columns: ColumnsType<DeliveryChallan> = useMemo(
        () => [
            {
                title: "Challan #",
                dataIndex: "challan_number",
                key: "challan_number",
                width: 160,
                fixed: "left",
                render: (value: string, record) => (
                    <Space direction="vertical" size={0}>
                        <Text strong>{value || "-"}</Text>
                        <Text type="secondary" style={{ fontSize: 12 }}>
                            {record.reference_no ? `Ref: ${record.reference_no}` : "No reference"}
                        </Text>
                    </Space>
                ),
            },
            {
                title: "Customer",
                dataIndex: "customer_name",
                key: "customer_name",
                width: 240,
                render: (value: string, record) => (
                    <Space direction="vertical" size={0}>
                        <Text>{value || "-"}</Text>
                        {record.customer_email ? (
                            <Text type="secondary" style={{ fontSize: 12 }}>
                                {record.customer_email}
                            </Text>
                        ) : null}
                    </Space>
                ),
            },
            {
                title: "Date",
                dataIndex: "challan_date",
                key: "challan_date",
                width: 140,
                render: (value: string) =>
                    value ? dayjs(value).format("DD MMM YYYY") : "-",
            },
            {
                title: "Type",
                dataIndex: "challan_type",
                key: "challan_type",
                width: 180,
                render: (value: string) => value || "-",
            },
            {
                title: "Status",
                dataIndex: "status",
                key: "status",
                width: 130,
                render: (value: string) => (
                    <Tag color={getStatusColor(value)}>
                        {String(value || "draft").toUpperCase()}
                    </Tag>
                ),
            },
            {
                title: "Sub Total",
                dataIndex: "subtotal",
                key: "subtotal",
                width: 140,
                align: "right",
                render: (value: number) => `₹${Number(value || 0).toFixed(2)}`,
            },
            {
                title: "Total",
                dataIndex: "total",
                key: "total",
                width: 140,
                align: "right",
                render: (value: number) => (
                    <Text strong>₹{Number(value || 0).toFixed(2)}</Text>
                ),
            },
            {
                title: "Created",
                dataIndex: "created_at",
                key: "created_at",
                width: 160,
                render: (value: string) =>
                    value ? dayjs(value).format("DD MMM YYYY hh:mm A") : "-",
            },
            {
                title: "Action",
                key: "action",
                width: 100,
                fixed: "right",
                align: "center",
                render: (_, record) => (
                    <Space>
                        <Button
                            type="text"
                            icon={<EyeOutlined />}
                            onClick={() =>
                                navigate(`/${slug}/delivery-challans/${record.id}`)
                            }
                        />
                        <Button
                            type="text"
                            icon={<EditOutlined />}
                            onClick={() =>
                                navigate(`/${slug}/delivery-challans/${record.id}/edit`)
                            }
                        />
                    </Space>
                ),
            },
        ],
        [navigate, slug],
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
                <Space>
                    <FileTextOutlined />
                    <Title level={4} style={{ margin: 0 }}>
                        Delivery Challans
                    </Title>

                </Space>
                <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
                    Create Delivery Challan
                </Button>

            </div>

            <Space wrap style={{ width: "100%", justifyContent: "space-between" }}>
                <Space wrap>
                    <Input.Search
                        allowClear
                        placeholder="Search challan, customer, reference..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        onSearch={handleSearch}
                        style={{ width: 320 }}
                    />

                    <Select
                        value={status}
                        options={STATUS_OPTIONS}
                        style={{ width: 180 }}
                        onChange={(value) => {
                            setStatus(value);
                            setPage(1);
                            loadDeliveryChallans(1, limit, search, value);
                        }}
                    />

                    <Button onClick={handleSearch}>Search</Button>

                    <Button icon={<ReloadOutlined />} onClick={handleReset}>
                        Reset
                    </Button>
                </Space>
            </Space>

            <Table<DeliveryChallan>
                rowKey="id"
                loading={loading}
                columns={columns}
                dataSource={list}
                scroll={{ x: 1300 }}
                pagination={{
                    current: meta?.page || page,
                    pageSize: meta?.limit || limit,
                    total: meta?.total || 0,
                    showSizeChanger: true,
                    showTotal: (total) => `Total ${total} delivery challans`,
                    onChange: (nextPage, nextLimit) => {
                        setPage(nextPage);
                        setLimit(nextLimit);
                        loadDeliveryChallans(nextPage, nextLimit, search, status);
                    },
                }}
            />
        </div>
    );
}