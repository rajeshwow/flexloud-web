
import {
    EditOutlined,
    MailOutlined,
    MoreOutlined,
    PhoneOutlined,
    PlusOutlined,
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
import { useNavigate, useParams } from "react-router-dom";
import type { AppDispatch, RootState } from "../../redux/store";
const { Title } = Typography;
// import "./leads.css";

// apne actual slice ke hisaab se import change kar lena
import dayjs from "dayjs";
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
    const { slug = "" } = useParams();
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
                dataIndex: "lead_display_id",
                key: "lead_display_id",
                width: 170,
                render: (value: string, record) => (
                    <Link onClick={() => navigate(`/${slug}/leads/${record.id}`)}>
                        {value || "-"}
                    </Link>
                ),
            },
            {
                title: "Name",
                key: "name",
                width: 220,
                render: (_: unknown, record) => {
                    const fullName = [record.first_name, record.last_name]
                        .filter(Boolean)
                        .join(" ");
                    return <Text strong>{fullName || "-"}</Text>;
                },
            },
            {
                title: "Mobile",
                dataIndex: "mobile",
                key: "mobile",
                width: 150,
                render: (value?: string) => value || "-",
            },
            {
                title: "Status",
                dataIndex: "status",
                key: "status",
                width: 140,
                render: (value?: string) => (
                    <Tag color={getLeadStatusColor(value)}>{value || "-"}</Tag>
                ),
            },
            {
                title: "Priority",
                dataIndex: "priority_label",
                key: "priority_label",
                width: 130,
                render: (value?: string) => value || "-",
            },
            {
                title: "Organization Name",
                dataIndex: "organization_name",
                key: "organization_name",
                width: 220,
                render: (value?: string) => value || "-",
            },
            {
                title: "Email",
                key: "email",
                width: 240,
                render: (_: unknown, record) => {
                    const primaryEmail =
                        record.emails?.find((item: any) => item?.primary)?.email ||
                        record.emails?.[0]?.email;
                    return primaryEmail || "-";
                },
            },
            {
                title: "Assigned To",
                dataIndex: "assigned_to_name",
                key: "assigned_to_name",
                width: 180,
                render: (value?: string) => value || "-",
            },
            {
                title: "Lead Source",
                dataIndex: "source_label",
                key: "source_label",
                width: 160,
                render: (value?: string) => value || "-",
            },
            {
                title: "Next Followup",
                dataIndex: "next_followup",
                key: "next_followup",
                width: 190,
                render: (value?: string) => value ? dayjs(value).format("DD MMM YYYY hh:mm A") : "-",
            },
            {
                title: "Date Created",
                dataIndex: "created_at",
                key: "created_at",
                width: 180,
                render: (value?: string) => value ? dayjs(value).format("DD MMM YYYY") : "-",
            },
            {
                title: "Actions",
                key: "actions",
                width: 150,
                fixed: "right",
                render: (_: unknown, record) => {
                    const primaryEmail =
                        record.emails?.find((item: any) => item?.primary)?.email ||
                        record.emails?.[0]?.email;

                    return (
                        <Space size="small">
                            <Tooltip title="Edit">
                                <Button
                                    type="text"
                                    icon={<EditOutlined />}
                                    onClick={() => navigate(`/${slug}/leads/${record.id}/edit`)}
                                />
                            </Tooltip>

                            <Tooltip title="Call">
                                <Button
                                    type="text"
                                    icon={<PhoneOutlined />}
                                    onClick={() => {
                                        if (record.mobile) {
                                            window.location.href = `tel:${record.mobile}`;
                                        } else {
                                            message.info("Mobile number not available");
                                        }
                                    }}
                                />
                            </Tooltip>

                            <Tooltip title="Email">
                                <Button
                                    type="text"
                                    icon={<MailOutlined />}
                                    onClick={() => {
                                        if (primaryEmail) {
                                            window.location.href = `mailto:${primaryEmail}`;
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
                    );
                },
            },
        ],
        [navigate, slug]
    );



    return (
        <div className="fl-page-wrap">
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
                <Title level={4} style={{ margin: 0 }}>
                    Leads
                </Title>

                <Space wrap>
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

                    <Button
                        type="primary"
                        icon={<PlusOutlined />}
                        onClick={() => navigate(`/${slug}/leads/create`)}
                    >
                        Create Lead
                    </Button>
                </Space>
            </div>
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
    );
}