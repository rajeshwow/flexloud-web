import {
    CalendarOutlined,
    CloseCircleOutlined,
    PlusOutlined,
    ReloadOutlined,
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
    Tooltip,
    Typography,
    message,
    theme,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import dayjs from "dayjs";
import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import LeaveApplyModal from "../../layouts/leaveApplyModal";
import { cancelLeave, getMyLeaves, type LeaveItem } from "../../redux/reducers/leave.slice";
import type { AppDispatch, RootState } from "../../redux/store";

const { Title, Text } = Typography;
const { Search } = Input;

const leaveTypeOptions = [
    { label: "All Types", value: "" },
    { label: "Casual", value: "casual" },
    { label: "Sick", value: "sick" },
    { label: "Paid", value: "paid" },
    { label: "Unpaid", value: "unpaid" },
    { label: "Optional", value: "optional" },
];

const statusOptions = [
    { label: "All Status", value: "" },
    { label: "Pending", value: "pending" },
    { label: "Approved", value: "approved" },
    { label: "Rejected", value: "rejected" },
    { label: "Cancelled", value: "cancelled" },
];

function getStatusTag(status: LeaveItem["status"]) {
    switch (status) {
        case "pending":
            return <Tag color="orange">Pending</Tag>;
        case "approved":
            return <Tag color="green">Approved</Tag>;
        case "rejected":
            return <Tag color="red">Rejected</Tag>;
        case "cancelled":
            return <Tag>Cancelled</Tag>;
        default:
            return <Tag>{status}</Tag>;
    }
}

function formatLeaveType(type: string) {
    return type
        .split("_")
        .map((item) => item.charAt(0).toUpperCase() + item.slice(1))
        .join(" ");
}

export default function LeaveListPage() {
    const dispatch = useDispatch<AppDispatch>();
    const { token } = theme.useToken();

    const { items, total, page, limit, listLoading, loading } = useSelector(
        (state: RootState) => state.leaves
    );

    const [search, setSearch] = useState("");
    const [status, setStatus] = useState("");
    const [leaveType, setLeaveType] = useState("");
    const [applyOpen, setApplyOpen] = useState(false);

    const fetchLeaves = (pageNo = 1, pageSize = limit || 10) => {
        dispatch(
            getMyLeaves({
                page: pageNo,
                limit: pageSize,
                search: search.trim() || undefined,
                status: status || undefined,
                leave_type: leaveType || undefined,
            })
        );
    };

    useEffect(() => {
        fetchLeaves(1, 10);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleReset = () => {
        setSearch("");
        setStatus("");
        setLeaveType("");
        dispatch(getMyLeaves({ page: 1, limit: 10 }));
    };

    const handleCancelLeave = async (id: string) => {
        try {
            await dispatch(cancelLeave(id)).unwrap();
            message.success("Leave cancelled successfully");
            fetchLeaves(page, limit);
        } catch (error: any) {
            message.error(error || "Failed to cancel leave");
        }
    };

    const columns: ColumnsType<LeaveItem> = useMemo(
        () => [
            {
                title: "Leave Type",
                dataIndex: "leave_type",
                key: "leave_type",
                width: 150,
                render: (value: string) => <Text strong>{formatLeaveType(value)}</Text>,
            },
            {
                title: "Start Date",
                dataIndex: "start_date",
                key: "start_date",
                width: 130,
                render: (value: string) => dayjs(value).format("DD MMM YYYY"),
            },
            {
                title: "End Date",
                dataIndex: "end_date",
                key: "end_date",
                width: 130,
                render: (value: string) => dayjs(value).format("DD MMM YYYY"),
            },
            {
                title: "Days",
                dataIndex: "total_days",
                key: "total_days",
                width: 90,
                align: "center",
                render: (value: number) => <Text>{value}</Text>,
            },
            {
                title: "Reason",
                dataIndex: "reason",
                key: "reason",
                ellipsis: true,
                render: (value: string | null) => value || "-",
            },
            {
                title: "Status",
                dataIndex: "status",
                key: "status",
                width: 120,
                render: (value: LeaveItem["status"]) => getStatusTag(value),
            },
            {
                title: "Applied On",
                dataIndex: "created_at",
                key: "created_at",
                width: 150,
                render: (value: string) => dayjs(value).format("DD MMM YYYY"),
            },
            {
                title: "Action",
                key: "action",
                width: 110,
                fixed: "right",
                render: (_, record) => (
                    <Space>
                        {record.status === "pending" ? (
                            <Tooltip title="Cancel Leave">
                                <Button
                                    danger
                                    type="text"
                                    icon={<CloseCircleOutlined />}
                                    loading={loading}
                                    onClick={() => handleCancelLeave(record.id)}
                                />
                            </Tooltip>
                        ) : (
                            <Text type="secondary">-</Text>
                        )}
                    </Space>
                ),
            },
        ],
        [loading]
    );

    return (
        <>
            <Card
                bordered={false}
                style={{
                    borderRadius: 20,
                    background: token.colorBgContainer,
                    boxShadow: token.boxShadowTertiary,
                }}
                bodyStyle={{ padding: 20 }}
            >
                <Row
                    justify="space-between"
                    align="middle"
                    gutter={[16, 16]}
                    style={{ marginBottom: 18 }}
                >
                    <Col xs={24} md={12}>
                        <Space direction="vertical" size={2}>
                            <Title level={4} style={{ margin: 0 }}>
                                Leave Management
                            </Title>
                            {/* <Text type="secondary">Apply and track your leave requests</Text> */}
                        </Space>
                    </Col>

                    <Col xs={24} md={12} style={{ textAlign: "right" }}>
                        <Button
                            type="primary"
                            icon={<PlusOutlined />}
                            // size="large"
                            onClick={() => setApplyOpen(true)}
                        >
                            Apply Leave
                        </Button>
                    </Col>
                </Row>

                <Row gutter={[12, 12]} style={{ marginBottom: 16 }}>
                    <Col xs={24} md={8}>
                        <Search
                            placeholder="Search by reason"
                            allowClear
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            onSearch={() => fetchLeaves(1, limit)}
                        />
                    </Col>

                    <Col xs={24} md={5}>
                        <Select
                            style={{ width: "100%" }}
                            placeholder="Status"
                            value={status}
                            options={statusOptions}
                            onChange={(value) => setStatus(value)}
                        />
                    </Col>

                    <Col xs={24} md={5}>
                        <Select
                            style={{ width: "100%" }}
                            placeholder="Leave Type"
                            value={leaveType}
                            options={leaveTypeOptions}
                            onChange={(value) => setLeaveType(value)}
                        />
                    </Col>

                    <Col xs={24} md={6}>
                        <Space wrap>
                            <Button
                                type="primary"
                                icon={<CalendarOutlined />}
                                onClick={() => fetchLeaves(1, limit)}
                            >
                                Filter
                            </Button>
                            <Button icon={<ReloadOutlined />} onClick={handleReset}>
                                Reset
                            </Button>
                        </Space>
                    </Col>
                </Row>

                <Table<LeaveItem>
                    rowKey="id"
                    columns={columns}
                    dataSource={items}
                    loading={listLoading}
                    scroll={{ x: 1000 }}
                    pagination={{
                        current: page,
                        pageSize: limit,
                        total,
                        showSizeChanger: true,
                        onChange: (nextPage, nextPageSize) => {
                            fetchLeaves(nextPage, nextPageSize);
                        },
                    }}
                />
            </Card>

            <LeaveApplyModal open={applyOpen} onClose={() => setApplyOpen(false)} />
        </>
    );
}