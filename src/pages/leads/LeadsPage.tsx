
import {
    EditOutlined,
    MailOutlined,
    MoreOutlined,
    PhoneOutlined,
    SearchOutlined
} from "@ant-design/icons";
import {
    Button,
    Input,
    Select,
    Space,
    Table,
    Tag,
    Tooltip,
    Typography,
    message
} from "antd";
import type { ColumnsType } from "antd/es/table";
import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import type { AppDispatch, RootState } from "../../redux/store";
// import "./leads.css";

// apne actual slice ke hisaab se import change kar lena
import {
    fetchLeads,
    resetLeadsListState,
    type LeadItem,
} from "../../redux/reducers/leads.slice";

const { Text, Link } = Typography;
const { Option } = Select;

type ChartItem = {
    key: string;
    label: string;
    percent: number;
    total: number;
    strokeColor?: string;
};

function getLeadStatusColor(status?: string) {
    const value = (status || "").toLowerCase();

    if (value.includes("new")) return "blue";
    if (value.includes("converted")) return "cyan";
    if (value.includes("in process")) return "orange";
    if (value.includes("recycled")) return "gold";
    if (value.includes("dead")) return "red";
    if (value.includes("assigned")) return "purple";

    return "default";
}



export default function LeadsPage() {
    const dispatch = useDispatch<AppDispatch>();
    const navigate = useNavigate();

    const { leads, listLoading, total, insights } = useSelector(
        (state: RootState) => state.leads
    );
    console.log(listLoading, 'listLoading')
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(20);
    const [search, setSearch] = useState("");

    useEffect(() => {
        const timer = setTimeout(() => {
            dispatch(
                fetchLeads({
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
            dispatch(resetLeadsListState());
        };
    }, [dispatch]);

    const columns: ColumnsType<LeadItem> = useMemo(
        () => [
            {
                title: "Lead Number",
                dataIndex: "lead_number",
                key: "lead_number",
                width: 170,
                render: (value: string, record) => (
                    <Link onClick={() => navigate(`/leads/${record.id}`)}>{value || "-"}</Link>
                ),
            },
            {
                title: "Name",
                dataIndex: "name",
                key: "name",
                width: 180,
                render: (value?: string) => <Text strong>{value || "-"}</Text>,
            },
            {
                title: "Status",
                dataIndex: "status",
                key: "status",
                width: 140,
                render: (value?: string) => <Tag color={getLeadStatusColor(value)}>{value || "-"}</Tag>,
            },
            {
                title: "Organization Name",
                dataIndex: "organization_name",
                key: "organization_name",
                width: 220,
                render: (value?: string) => value || "-",
            },
            {
                title: "Office Phone",
                dataIndex: "office_phone",
                key: "office_phone",
                width: 150,
                render: (value?: string) => value || "-",
            },
            {
                title: "Email",
                dataIndex: "email",
                key: "email",
                width: 220,
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
                title: "Next Followup",
                dataIndex: "next_followup",
                key: "next_followup",
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
                width: 150,
                fixed: "right",
                render: (_: unknown, record) => (
                    <Space size="small">
                        <Tooltip title="Edit">
                            <Button
                                type="text"
                                icon={<EditOutlined />}
                                onClick={() => navigate(`/leads/${record.id}/edit`)}
                            />
                        </Tooltip>

                        <Tooltip title="Call">
                            <Button
                                type="text"
                                icon={<PhoneOutlined />}
                                onClick={() => {
                                    if (record.office_phone) {
                                        window.location.href = `tel:${record.office_phone}`;
                                    } else {
                                        message.info("Phone number not available");
                                    }
                                }}
                            />
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

                        <Tooltip title="More">
                            <Button type="text" icon={<MoreOutlined />} />
                        </Tooltip>
                    </Space>
                ),
            },
        ],
        [navigate]
    );

    const start = total === 0 ? 0 : (page - 1) * pageSize + 1;
    const end = Math.min(page * pageSize, total || 0);

    const chartData: ChartItem[] =
        insights?.status_breakdown || [
            { key: "new", label: "New", percent: 64.1, total: 1768 },
            { key: "converted", label: "Converted", percent: 6.1, total: 169 },
            { key: "recycled", label: "Recycled", percent: 0.7, total: 18 },
            { key: "dead", label: "Dead", percent: 5.5, total: 151 },
            { key: "in_process", label: "In Process", percent: 23.4, total: 644 },
            { key: "assigned", label: "Assigned", percent: 0.3, total: 7 },
        ];

    return (
        <div className="fl-page-wrap">
            <Space style={{ marginBottom: 16 }}>
                <Input
                    allowClear
                    placeholder="Search by name, mobile, email"
                    prefix={<SearchOutlined />}
                    value={search}
                    onChange={(e) => {
                        setSearch(e.target.value);
                        setPage(1);
                    }}
                    style={{ width: 320 }}
                />
            </Space>

            <div className="fl-leads-layout">
                <div className="fl-table-card fl-leads-table-wrap">

                    <Table<LeadItem>
                        rowKey="id"
                        columns={columns}
                        dataSource={leads || []}
                        loading={listLoading}
                        pagination={{
                            showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} items`,
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
                        scroll={{ x: 1500 }}
                        bordered={false}
                        size="middle"
                        rowClassName={() => "fl-table-row"}
                    />
                </div>


            </div>
        </div>
    );
}