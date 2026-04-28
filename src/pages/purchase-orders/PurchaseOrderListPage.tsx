import {
    ClearOutlined,
    EditOutlined,
    EyeOutlined,
    PlusOutlined,
    ReloadOutlined,
    SearchOutlined,
} from "@ant-design/icons";
import {
    Button,
    Card,
    Col,
    Input,
    Row,
    Select,
    Space,
    Table,
    Tag,
    Typography,
} from "antd";
import dayjs from "dayjs";
import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";

import { getOrganization } from "../../redux/reducers/organization.slice";
import { fetchPurchaseOrders } from "../../redux/reducers/purchaseOrders.slice";
import { getUsers } from "../../redux/reducers/user.slice";
import type { RootState } from "../../redux/store";

const { Title } = Typography;

export default function PurchaseOrderListPage() {
    const { slug = "" } = useParams();
    const navigate = useNavigate();
    const dispatch = useDispatch<any>();

    const users = useSelector((state: RootState) => state.users?.userList || []);
    const organizations = useSelector(
        (state: RootState) => state.organization?.orgList || [],
    );

    const [loading, setLoading] = useState(false);
    const [data, setData] = useState<any[]>([]);
    const [search, setSearch] = useState("");

    const [filters, setFilters] = useState<{
        status?: string;
        assigned_to?: string;
        vendor?: string;
    }>({});

    const [pagination, setPagination] = useState({
        current: 1,
        pageSize: 10,
        total: 0,
    });

    const userOptions = useMemo(
        () =>
            (users || []).map((user: any) => ({
                label:
                    user?.name ||
                    `${user?.first_name || ""} ${user?.last_name || ""}`.trim() ||
                    user?.email ||
                    user?.id,
                value: user?.id,
            })),
        [users],
    );

    const vendorOptions = useMemo(
        () =>
            (organizations || []).map((org: any) => ({
                label: org?.name,
                value: org?.id,
            })),
        [organizations],
    );

    const fetchPurchaseOrder = async (page = 1, pageSize = 10) => {
        try {
            setLoading(true);

            const res = await dispatch(
                fetchPurchaseOrders({
                    search: search || undefined,
                    status: filters.status,
                    assigned_to: filters.assigned_to,
                    vendor: filters.vendor,
                    offset: (page - 1) * pageSize,
                    limit: pageSize,
                } as any),
            ).unwrap();

            setData(res?.data || []);
            setPagination({
                current: page,
                pageSize,
                total: res?.total || 0,
            });
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleFilterChange = (key: "status" | "assigned_to" | "vendor", value?: string) => {
        setFilters((prev) => ({
            ...prev,
            [key]: value,
        }));
    };

    const handleClearFilters = () => {
        setSearch("");
        setFilters({});
        setPagination((prev) => ({ ...prev, current: 1 }));
    };

    const columns = [
        {
            title: "PO Number",
            dataIndex: "po_number",
            render: (val: string, record: any) => (
                <a onClick={() => navigate(`/${slug}/purchase-orders/${record.id}`)}>
                    {val}
                </a>
            ),
        },
        {
            title: "Vendor",
            dataIndex: "supplier_name",
        },
        {
            title: "Sales person",
            dataIndex: "assigned_to_name",
            render: (val: string) => val || "-",
        },
        {
            title: "Expected Delivery Date",
            dataIndex: "expected_delivery_date",
            render: (val: string) => (val ? dayjs(val).format("DD MMM YYYY") : "-"),
        },
        {
            title: "Order Date",
            dataIndex: "voucher_date",
            render: (val: string) => (val ? dayjs(val).format("DD MMM YYYY") : "-"),
        },
        {
            title: "Items Count",
            dataIndex: "items_count",
            render: (val: number) => val || 0,
        },
        {
            title: "Amount",
            dataIndex: "total_amount",
            render: (val: number) => `₹ ${Number(val || 0).toLocaleString("en-IN")}`,
        },
        {
            title: "Status",
            dataIndex: "status",
            render: (val: string) => {
                let color = "default";
                if (val === "draft") color = "orange";
                if (val === "approved") color = "green";
                if (val === "cancelled") color = "red";

                return <Tag color={color}>{val?.toUpperCase() || "-"}</Tag>;
            },
        },
        {
            title: "Actions",
            width: 120,
            fixed: "right",
            render: (_: any, record: any) => (
                <Space>
                    <Button
                        type="text"
                        icon={<EyeOutlined />}
                        onClick={() => navigate(`/${slug}/purchase-orders/${record.id}`)}
                    />
                    <Button
                        type="text"
                        icon={<EditOutlined />}
                        onClick={() => navigate(`/${slug}/purchase-orders/${record.id}/edit`)}
                    />
                </Space>
            ),
        },
    ] as any;

    useEffect(() => {
        dispatch(getUsers());
        dispatch(getOrganization());
    }, [dispatch]);

    useEffect(() => {
        fetchPurchaseOrder(1, pagination.pageSize);
    }, [search, filters]);

    const handleTableChange = (pag: any) => {
        fetchPurchaseOrder(pag.current, pag.pageSize);
    };

    return (
        <div>
            <Space
                style={{
                    width: "100%",
                    justifyContent: "space-between",
                    marginBottom: 16,
                }}
            >
                <Title level={4} style={{ margin: 0 }}>
                    Purchase Orders
                </Title>

                <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={() => navigate(`/${slug}/purchase-orders/create`)}
                >
                    Create PO
                </Button>
            </Space>

            <Card style={{ borderRadius: 14, marginBottom: 16 }}>
                <Row gutter={[12, 12]} align="middle">
                    <Col xs={24} md={8} lg={7}>
                        <Input
                            prefix={<SearchOutlined />}
                            placeholder="Search PO, vendor, reference..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            allowClear
                        />
                    </Col>

                    <Col xs={24} md={8} lg={5}>
                        <Select
                            placeholder="Status"
                            value={filters.status}
                            onChange={(val) => handleFilterChange("status", val)}
                            allowClear
                            style={{ width: "100%" }}
                            options={[
                                { label: "Draft", value: "draft" },
                                { label: "Approved", value: "approved" },
                                { label: "Cancelled", value: "cancelled" },
                                { label: "Pending", value: "pending" },
                            ]}
                        />
                    </Col>

                    <Col xs={24} md={8} lg={6}>
                        <Select
                            showSearch
                            placeholder="Sales Person"
                            value={filters.assigned_to}
                            onChange={(val) => handleFilterChange("assigned_to", val)}
                            allowClear
                            optionFilterProp="label"
                            style={{ width: "100%" }}
                            options={userOptions}
                        />
                    </Col>

                    <Col xs={24} md={8} lg={6}>
                        <Select
                            showSearch
                            placeholder="Vendor"
                            value={filters.vendor}
                            onChange={(val) => handleFilterChange("vendor", val)}
                            allowClear
                            optionFilterProp="label"
                            style={{ width: "100%" }}
                            options={vendorOptions}
                        />
                    </Col>

                    <Col xs={24} md={8} lg={4}>
                        <Space>
                            <Button icon={<ClearOutlined />} onClick={handleClearFilters}>
                                Clear
                            </Button>
                            <Button
                                icon={<ReloadOutlined />}
                                onClick={() => fetchPurchaseOrder(1, pagination.pageSize)}
                            />
                        </Space>
                    </Col>
                </Row>
            </Card>

            <Table
                rowKey="id"
                loading={loading}
                columns={columns}
                dataSource={data}
                pagination={pagination}
                onChange={handleTableChange}
                scroll={{ x: 1100 }}
            />
        </div>
    );
}