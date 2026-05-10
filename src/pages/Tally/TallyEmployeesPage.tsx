import {
    CloudSyncOutlined,
    MailOutlined,
    PhoneOutlined,
    ReloadOutlined,
    SearchOutlined,
    TeamOutlined,
    UserOutlined,
} from "@ant-design/icons";
import {
    Avatar,
    Button,
    Card,
    Col,
    Empty,
    Input,
    message,
    Row,
    Space,
    Table,
    Tag,
    Tooltip,
    Typography,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import dayjs from "dayjs";
import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
    fetchTallyEmployees,
    pullTallyEmployees,
    type TallyEmployeeItem,
} from "../../redux/reducers/tallyEmployees.slice";
import type { AppDispatch } from "../../redux/store";

const { Title, Text } = Typography;

function TallyEmployeesPage() {
    const dispatch = useDispatch<AppDispatch>();

    const { list, total, loading, pulling } = useSelector(
        (state: any) => state.tallyEmployees,
    );

    const [search, setSearch] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(20);

    useEffect(() => {
        const timer = window.setTimeout(() => {
            setDebouncedSearch(search.trim());
            setPage(1);
        }, 450);

        return () => window.clearTimeout(timer);
    }, [search]);

    const fetchList = () => {
        dispatch(
            fetchTallyEmployees({
                search: debouncedSearch,
                page,
                limit,
            }),
        );
    };

    useEffect(() => {
        fetchList();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [dispatch, debouncedSearch, page, limit]);

    const handlePullEmployees = async () => {
        try {
            await dispatch(pullTallyEmployees()).unwrap();

            message.success("Tally employees pulled successfully");

            dispatch(
                fetchTallyEmployees({
                    search: debouncedSearch,
                    page: 1,
                    limit,
                }),
            );

            setPage(1);
        } catch (error: any) {
            message.error(error || "Failed to pull Tally employees");
        }
    };

    const columns: ColumnsType<TallyEmployeeItem> = useMemo(
        () => [
            {
                title: "Employee",
                dataIndex: "name",
                key: "name",
                width: 280,
                fixed: "left",
                render: (_, record) => (
                    <Space>
                        <Avatar icon={<UserOutlined />} />
                        <div>
                            <div style={{ fontWeight: 600 }}>{record.name || "-"}</div>
                            <Text type="secondary" style={{ fontSize: 12 }}>
                                {record.employee_number ||
                                    record.master_id ||
                                    record.tally_guid ||
                                    "-"}
                            </Text>
                        </div>
                    </Space>
                ),
            },
            {
                title: "Department",
                dataIndex: "department",
                key: "department",
                width: 170,
                render: (value) => value || "-",
            },
            {
                title: "Designation",
                dataIndex: "designation",
                key: "designation",
                width: 180,
                render: (value) => value || "-",
            },
            {
                title: "Contact",
                key: "contact",
                width: 260,
                render: (_, record) => (
                    <Space direction="vertical" size={2}>
                        {record.mobile ? (
                            <Text>
                                <PhoneOutlined /> {record.mobile}
                            </Text>
                        ) : null}

                        {record.email ? (
                            <Text>
                                <MailOutlined /> {record.email}
                            </Text>
                        ) : null}

                        {!record.mobile && !record.email ? <Text>-</Text> : null}
                    </Space>
                ),
            },
            {
                title: "PAN",
                dataIndex: "pan",
                key: "pan",
                width: 140,
                render: (value) => value || "-",
            },
            {
                title: "Aadhaar",
                dataIndex: "aadhaar",
                key: "aadhaar",
                width: 150,
                render: (value) => value || "-",
            },
            {
                title: "Status",
                dataIndex: "is_active",
                key: "is_active",
                width: 120,
                render: (value) =>
                    value === false ? (
                        <Tag color="red">Inactive</Tag>
                    ) : (
                        <Tag color="green">Active</Tag>
                    ),
            },
            {
                title: "Synced At",
                dataIndex: "synced_at",
                key: "synced_at",
                width: 190,
                render: (value) =>
                    value ? dayjs(value).format("DD MMM YYYY, hh:mm A") : "-",
            },
        ],
        [],
    );

    return (
        <div style={{ padding: 20 }}>
            <Space direction="vertical" size={18} style={{ width: "100%" }}>
                <Card
                    bordered={false}
                    style={{
                        borderRadius: 18,
                        background:
                            "linear-gradient(135deg, rgba(22,119,255,0.12), rgba(19,194,194,0.10))",
                        boxShadow: "0 10px 28px rgba(15, 23, 42, 0.06)",
                    }}
                >
                    <Row gutter={[16, 16]} align="middle" justify="space-between">
                        <Col xs={24} lg={12}>
                            <Space align="start">
                                <Avatar
                                    size={52}
                                    icon={<TeamOutlined />}
                                    style={{
                                        background:
                                            "linear-gradient(135deg, #1677ff 0%, #13c2c2 100%)",
                                    }}
                                />

                                <div>
                                    <Title level={3} style={{ margin: 0 }}>
                                        Tally Employees
                                    </Title>
                                    <Text type="secondary">
                                        Employees synced from Tally into CRM.
                                    </Text>
                                </div>
                            </Space>
                        </Col>

                        <Col xs={24} lg={12}>
                            <Row gutter={[10, 10]} justify="end">
                                <Col xs={24} md={14}>
                                    <Input
                                        allowClear
                                        prefix={<SearchOutlined />}
                                        placeholder="Search by name, email, mobile..."
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                    />
                                </Col>

                                <Col xs={12} md={5}>
                                    <Tooltip title="Refresh list">
                                        <Button
                                            block
                                            icon={<ReloadOutlined />}
                                            onClick={fetchList}
                                            loading={loading}
                                        >
                                            Refresh
                                        </Button>
                                    </Tooltip>
                                </Col>

                                <Col xs={12} md={5}>
                                    <Button
                                        block
                                        type="primary"
                                        icon={<CloudSyncOutlined />}
                                        loading={pulling}
                                        onClick={handlePullEmployees}
                                    >
                                        Pull
                                    </Button>
                                </Col>
                            </Row>
                        </Col>
                    </Row>
                </Card>

                <Card bordered={false} style={{ borderRadius: 18 }}>
                    <Row gutter={[16, 16]} align="middle" justify="space-between">
                        <Col>
                            <Title level={4} style={{ margin: 0 }}>
                                Employee List
                            </Title>
                            <Text type="secondary">
                                Total {total || 0} employee{Number(total || 0) === 1 ? "" : "s"}
                            </Text>
                        </Col>
                    </Row>

                    <div style={{ marginTop: 18 }}>
                        <Table
                            rowKey={(record) =>
                                record.id ||
                                record.tally_guid ||
                                record.master_id ||
                                record.name
                            }
                            loading={loading}
                            columns={columns}
                            dataSource={list}
                            scroll={{ x: 1300 }}
                            locale={{
                                emptyText: (
                                    <Empty
                                        image={Empty.PRESENTED_IMAGE_SIMPLE}
                                        description="No Tally employees found"
                                    />
                                ),
                            }}
                            pagination={{
                                current: page,
                                pageSize: limit,
                                total,
                                showSizeChanger: true,
                                showTotal: (count) => `Total ${count} employees`,
                                onChange: (nextPage, nextLimit) => {
                                    setPage(nextPage);
                                    setLimit(nextLimit);
                                },
                            }}
                        />
                    </div>
                </Card>
            </Space>
        </div>
    );
}

export default TallyEmployeesPage;