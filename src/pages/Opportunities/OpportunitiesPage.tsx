import {
    CalendarOutlined,
    EditOutlined,
    MailOutlined,
    PhoneOutlined,
    SearchOutlined,
    UnorderedListOutlined,
} from "@ant-design/icons";
import { Button, Input, Space, Table, Tag, Tooltip, Typography, message } from "antd";
import type { ColumnsType } from "antd/es/table";
import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
    fetchOpportunities,
    resetOpportunitiesListState,
    type OpportunityItem,
} from "../../redux/reducers/opportunities.slice";
import type { AppDispatch, RootState } from "../../redux/store";

const { Text, Link } = Typography;

function getStageTagColor(stage?: string) {
    const value = (stage || "").toLowerCase();

    if (value.includes("qualification")) return "blue";
    if (value.includes("closed won")) return "green";
    if (value.includes("proposal")) return "gold";
    if (value.includes("closed lost")) return "red";

    return "default";
}

export default function OpportunitiesPage() {
    const dispatch = useDispatch<AppDispatch>();
    const navigate = useNavigate();

    const { opportunities, listLoading, total } = useSelector(
        (state: RootState) => state.opportunities
    );

    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(20);
    const [search, setSearch] = useState("");

    useEffect(() => {
        const timer = setTimeout(() => {
            dispatch(
                fetchOpportunities({
                    page,
                    limit: pageSize,
                    search: search || undefined,
                })
            );
        }, 400);

        return () => clearTimeout(timer);
    }, [dispatch, page, pageSize, search]);

    useEffect(() => {
        return () => {
            dispatch(resetOpportunitiesListState());
        };
    }, [dispatch]);

    const columns: ColumnsType<OpportunityItem> = useMemo(
        () => [
            {
                title: "Opportunity Number",
                dataIndex: "opportunity_number",
                key: "opportunity_number",
                width: 190,
                render: (value: string, record) => (
                    <Link onClick={() => navigate(`/opportunities/${record.id}`)}>{value}</Link>
                ),
            },
            {
                title: "Name",
                dataIndex: "name",
                key: "name",
                width: 220,
                render: (value: string) => <Text strong>{value || "-"}</Text>,
            },
            {
                title: "Sales Stage",
                dataIndex: "sales_stage",
                key: "sales_stage",
                width: 150,
                render: (value?: string) => <Tag color={getStageTagColor(value)}>{value || "-"}</Tag>,
            },
            {
                title: "Amount",
                dataIndex: "amount",
                key: "amount",
                width: 140,
                align: "right",
                render: (value?: number | string) =>
                    value !== null && value !== undefined && value !== ""
                        ? `₹${Number(value).toLocaleString("en-IN")}`
                        : "-",
            },
            {
                title: "Close",
                dataIndex: "close_date",
                key: "close_date",
                width: 130,
                render: (value?: string) => value || "-",
            },
            {
                title: "User",
                dataIndex: "user_name",
                key: "user_name",
                width: 180,
                render: (value?: string) => value || "-",
            },
            {
                title: "Date Created",
                dataIndex: "created_at",
                key: "created_at",
                width: 180,
                render: (value?: string) => value || "-",
            },
            {
                title: "Actions",
                key: "actions",
                width: 160,
                fixed: "right",
                render: (_: unknown, record) => (
                    <Space size="small">
                        <Tooltip title="Edit">
                            <Button
                                type="text"
                                icon={<EditOutlined />}
                                onClick={() => navigate(`/opportunities/${record.id}/edit`)}
                            />
                        </Tooltip>

                        <Tooltip title="Call">
                            <Button
                                type="text"
                                icon={<PhoneOutlined />}
                                onClick={() => {
                                    if (record.phone) {
                                        window.location.href = `tel:${record.phone}`;
                                    } else {
                                        message.info("Phone number not available");
                                    }
                                }}
                            />
                        </Tooltip>

                        <Tooltip title="Calendar">
                            <Button type="text" icon={<CalendarOutlined />} />
                        </Tooltip>

                        <Tooltip title="Activity">
                            <Button type="text" icon={<UnorderedListOutlined />} />
                        </Tooltip>

                        <Tooltip title="Email">
                            <Button
                                type="text"
                                icon={<MailOutlined />}
                                onClick={() => {
                                    if (record.email) {
                                        window.location.href = `mailto:${record.email}`;
                                    } else {
                                        message.info("Email not available");
                                    }
                                }}
                            />
                        </Tooltip>
                    </Space>
                ),
            },
        ],
        [navigate]
    );

    const start = total === 0 ? 0 : (page - 1) * pageSize + 1;
    const end = Math.min(page * pageSize, total || 0);

    return (
        <div className="fl-page-wrap">
            <div className="fl-page-header">
                <div>
                    <Text className="fl-page-title">Opportunities</Text>
                </div>

                <div className="fl-page-actions">
                    <Input
                        allowClear
                        value={search}
                        onChange={(e) => {
                            setPage(1);
                            setSearch(e.target.value);
                        }}
                        placeholder="Search by opportunity number, name, phone..."
                        prefix={<SearchOutlined />}
                        className="fl-opportunity-search"
                    />
                </div>
            </div>

            <div className="fl-table-card">
                <div className="fl-table-topbar">
                    <Text className="fl-table-count">
                        {start} - {end} of {total || 0}
                    </Text>
                </div>

                <Table<OpportunityItem>
                    rowKey="id"
                    columns={columns}
                    dataSource={opportunities || []}
                    loading={listLoading}
                    pagination={{
                        current: page,
                        pageSize,
                        total: total || 0,
                        showSizeChanger: true,
                        pageSizeOptions: ["10", "20", "50", "100"],
                        onChange: (nextPage, nextPageSize) => {
                            setPage(nextPage);
                            setPageSize(nextPageSize);
                        },
                    }}
                    scroll={{ x: 1400 }}
                    bordered={false}
                    size="middle"
                    rowClassName={() => "fl-table-row"}
                />
            </div>
        </div>
    );
}