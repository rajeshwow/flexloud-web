import {
    EyeOutlined,
    PlusOutlined,
    ReloadOutlined,
    SearchOutlined,
} from "@ant-design/icons";
import {
    Button,
    Card,
    DatePicker,
    Input,
    Select,
    Space,
    Table,
    Tag,
    Typography
} from "antd";
import dayjs from "dayjs";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { fetchSalesOrders } from "../../redux/reducers/salesOrders.slice";
import type { AppDispatch } from "../../redux/store";
import { getSalesOrderStatusColor, getSalesOrderStatusOptions, toTitleCase } from "../../shared/Utils/utils";

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

export default function SalesOrderListPage() {
    const dispatch = useDispatch<AppDispatch>();
    const navigate = useNavigate();
    const { slug } = useParams();

    const { list, total, loading } = useSelector((s: any) => s.salesOrders);

    const [filters, setFilters] = useState<any>({
        search: "",
        status: undefined,
        limit: 10,
        offset: 0,
    });

    const loadData = () => {
        dispatch(fetchSalesOrders(filters));
    };

    useEffect(() => {
        loadData();
    }, [filters]);

    const columns =
        [
            {
                title: "SO Number",
                dataIndex: "so_number",
                render: (v: string, record: any) => (
                    <Button
                        type="link"
                        style={{ padding: 0, fontWeight: 600 }}
                        onClick={() => navigate(`/${slug}/sales-orders/${record.id}`)}
                    >
                        {v}
                    </Button>
                ),
            },
            {
                title: "Customer",
                dataIndex: "customer_name",
                render: (v: string) => toTitleCase(v) || "-",
            },
            {
                title: "SO Date",
                dataIndex: "so_date",
                render: (v: string) => (v ? dayjs(v).format("DD MMM YYYY") : "-"),
            },
            {
                title: "Delivery Date",
                dataIndex: "expected_delivery_date",
                render: (v: string) => (v ? dayjs(v).format("DD MMM YYYY") : "-"),
            },
            {
                title: "Assigned To",
                dataIndex: "assigned_to_name",
                render: (v: string) => toTitleCase(v as string) || "-",
            },
            {
                title: "Status",
                dataIndex: "status",
                render: (v: string) => {


                    return <Tag color={getSalesOrderStatusColor(v)}>{toTitleCase(v) || "draft"}</Tag>;
                },
            },
            {
                title: "Grand Total",
                dataIndex: "grand_total",
                align: "right" as const,
                render: (v: number, r: any) => `${r.currency || "INR"} ${Number(v || 0).toFixed(2)}`,
            },
            {
                title: "Action",
                width: 90,
                render: (_: any, record: any) => (
                    <Button
                        icon={<EyeOutlined />}
                        onClick={() => navigate(`/${slug}/sales-orders/${record.id}`)}
                    />
                ),
            },
        ];

    return (
        <div>
            <Card style={{ borderRadius: 14, marginBottom: 16 }}>
                <Space style={{ width: "100%", justifyContent: "space-between" }} align="center">
                    <div>
                        <Title level={3} style={{ margin: 0 }}>
                            Sales Orders
                        </Title>
                        <Text type="secondary">Manage customer confirmed orders</Text>
                    </div>

                    <Button
                        type="primary"
                        icon={<PlusOutlined />}
                        onClick={() => navigate(`/${slug}/sales-orders/create`)}
                    >
                        Create Sales Order
                    </Button>
                </Space>
            </Card>

            <Card style={{ borderRadius: 14, marginBottom: 16 }}>
                <Space wrap>
                    <Input
                        allowClear
                        prefix={<SearchOutlined />}
                        placeholder="Search SO number/customer"
                        style={{ width: 260 }}
                        value={filters.search}
                        onChange={(e) =>
                            setFilters((p: any) => ({
                                ...p,
                                search: e.target.value,
                                offset: 0,
                            }))
                        }
                    />

                    <Select
                        allowClear
                        placeholder="Status"
                        style={{ width: 180 }}
                        value={filters.status}
                        onChange={(status) =>
                            setFilters((p: any) => ({
                                ...p,
                                status,
                                offset: 0,
                            }))
                        }
                        options={getSalesOrderStatusOptions()}
                    />

                    <RangePicker
                        onChange={(dates) =>
                            setFilters((p: any) => ({
                                ...p,
                                from_date: dates?.[0] ? dayjs(dates[0]).format("YYYY-MM-DD") : undefined,
                                to_date: dates?.[1] ? dayjs(dates[1]).format("YYYY-MM-DD") : undefined,
                                offset: 0,
                            }))
                        }
                    />

                    <Button icon={<ReloadOutlined />} onClick={loadData}>
                        Refresh
                    </Button>
                </Space>
            </Card>

            <Card style={{ borderRadius: 14 }}>
                <Table
                    rowKey="id"
                    loading={loading}
                    columns={columns}
                    dataSource={list}
                    pagination={{
                        total,
                        current: Math.floor(filters.offset / filters.limit) + 1,
                        pageSize: filters.limit,
                        showSizeChanger: true,
                        onChange: (page, pageSize) => {
                            setFilters((p: any) => ({
                                ...p,
                                limit: pageSize,
                                offset: (page - 1) * pageSize,
                            }));
                        },
                    }}
                />
            </Card>
        </div>
    );
}