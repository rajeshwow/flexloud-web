import {
    DeleteOutlined,
    EditOutlined,
    EyeOutlined,
    PlusOutlined,
    SearchOutlined
} from "@ant-design/icons";
import {
    Button,
    Card,
    Input,
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
import { useNavigate, useParams } from "react-router-dom";
// import { deleteTask, getTasks, type GetTasksParams } from "../../redux/reducers/tasks.slice";
import { getTasks } from "../../redux/reducers/tasks.slice";
import type { AppDispatch, RootState } from "../../redux/store";

const { Title, Text } = Typography;

type TaskItem = {
    id: string;
    task_number?: string;
    subject: string;
    start_date: string | null;
    end_date: string | null;
    task_duration_minutes?: number | null;
    status: "not_started" | "in_progress" | "completed" | "waiting" | "deferred";
    latest_remark?: string | null;
    assigned_to_name?: string | null;
    created_at: string | null;
    priority?: "low" | "medium" | "high" | "urgent";
};

function formatDateTime(value?: string | null) {
    if (!value) return "-";
    return dayjs(value).format("DD/MM/YYYY hh:mm A");
}

function formatDuration(minutes?: number | null) {
    if (minutes === null || minutes === undefined) return "-";

    const hrs = Math.floor(minutes / 60);
    const mins = minutes % 60;

    return `${hrs} Hours ${mins} Minutes`;
}

function getStatusTagColor(status: TaskItem["status"]) {
    switch (status) {
        case "completed":
            return "success";
        case "in_progress":
            return "processing";
        case "waiting":
            return "warning";
        case "deferred":
            return "default";
        case "not_started":
        default:
            return "default";
    }
}

function getStatusLabel(status: TaskItem["status"]) {
    switch (status) {
        case "not_started":
            return "Not Started";
        case "in_progress":
            return "In Progress";
        case "completed":
            return "Completed";
        case "waiting":
            return "Waiting";
        case "deferred":
            return "Deferred";
        default:
            return status;
    }
}

export default function TasksPage() {
    const { token } = theme.useToken();
    const dispatch = useDispatch<AppDispatch>();
    const navigate = useNavigate();
    const { slug = "" } = useParams();

    const [search, setSearch] = useState("");

    const { taskList = [], taskListLoading = false } =
        useSelector((state: RootState) => state.tasks) || {};

    useEffect(() => {
        dispatch(getTasks({}));
    }, [dispatch]);



    const handleDelete = async (record: TaskItem) => {
        try {
            // await dispatch(deleteTask(record.id)).unwrap();
            message.success(`Task "${record.subject}" deleted successfully`, 2);
        } catch (error: any) {
            message.error(error?.message || "Failed to delete task", 3);
        }
    };

    const filteredTaskList = useMemo(() => {
        const query = search.trim().toLowerCase();
        if (!query) return taskList;

        return taskList.filter((item: TaskItem) => {
            return (
                item.subject?.toLowerCase().includes(query) ||
                item.task_number?.toLowerCase().includes(query) ||
                item.status?.toLowerCase().includes(query) ||
                item.latest_remark?.toLowerCase().includes(query) ||
                item.assigned_to_name?.toLowerCase().includes(query)
            );
        });
    }, [taskList, search]);

    const columns: ColumnsType<TaskItem> = [
        {
            title: "Subject",
            dataIndex: "subject",
            key: "subject",
            width: 240,
            render: (_, record) => (
                <Button
                    type="link"
                    style={{
                        padding: 0,
                        height: "auto",
                        textAlign: "left",
                        whiteSpace: "normal",
                        // color: token.colorError,
                        fontWeight: 600,
                    }}
                    onClick={() => navigate(`/${slug}/tasks/${record.id}/edit`)}
                >
                    {record.subject}
                </Button>
            ),
        },
        {
            title: "Start Date",
            dataIndex: "start_date",
            key: "start_date",
            width: 180,
            render: (value) => formatDateTime(value),
        },
        {
            title: "End Date",
            dataIndex: "end_date",
            key: "end_date",
            width: 180,
            render: (value) => formatDateTime(value),
        },
        {
            title: "Task Duration",
            dataIndex: "task_duration_minutes",
            key: "task_duration_minutes",
            width: 180,
            render: (value) => formatDuration(value),
        },
        {
            title: "Status",
            dataIndex: "status",
            key: "status",
            width: 140,
            render: (value: TaskItem["status"]) => (
                <Tag color={getStatusTagColor(value)}>{getStatusLabel(value)}</Tag>
            ),
        },
        {
            title: "Latest Remark",
            dataIndex: "latest_remark",
            key: "latest_remark",
            width: 180,
            render: (value) => value || "-",
        },
        {
            title: "Assigned User",
            dataIndex: "assigned_to_name",
            key: "assigned_to_name",
            width: 180,
            render: (value) => (
                <Text
                    style={{
                        // color: token.colorError,
                        fontWeight: 600,
                    }}
                >
                    {value || "-"}
                </Text>
            ),
        },
        {
            title: "Date Created",
            dataIndex: "created_at",
            key: "created_at",
            width: 180,
            render: (value) => formatDateTime(value),
        },
        {
            title: "Actions",
            key: "actions",
            fixed: "right",
            width: 130,
            render: (_, record) => (
                <Space size="small">
                    <Tooltip title="View">
                        <Button
                            type="text"
                            icon={<EyeOutlined />}
                            onClick={() => navigate(`/${slug}/tasks/${record.id}`)}
                        />
                    </Tooltip>

                    <Tooltip title="Edit">
                        <Button
                            type="text"
                            icon={<EditOutlined />}
                            onClick={() => navigate(`/${slug}/tasks/${record.id}/edit`)}
                        />
                    </Tooltip>

                    <Tooltip title="Delete">
                        <Button
                            type="text"
                            danger
                            icon={<DeleteOutlined />}
                            onClick={() => handleDelete(record)}
                        />
                    </Tooltip>
                </Space>
            ),
        },
    ];

    return (
        <div>
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
                    Tasks
                </Title>

                <Space wrap>
                    <Input
                        allowClear
                        placeholder="Search by subject, task no, status, remark, assigned user..."
                        prefix={<SearchOutlined />}
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        style={{ width: 340 }}
                    />



                    <Button
                        type="primary"
                        icon={<PlusOutlined />}
                        onClick={() => navigate(`/${slug}/tasks/create`)}
                    >
                        Create Task
                    </Button>
                </Space>
            </div>

            <Card
                styles={{
                    body: {
                        padding: 16,
                    },
                }}
                style={{
                    borderRadius: 12,
                    border: `1px solid ${token.colorBorderSecondary}`,
                    boxShadow: token.boxShadowTertiary,
                    background: token.colorBgContainer,
                }}
            >
                <Table<TaskItem>
                    rowKey="id"
                    columns={columns}
                    dataSource={filteredTaskList}
                    loading={taskListLoading}
                    bordered={false}
                    pagination={{
                        current: 1,
                        pageSize: 10,
                        total: filteredTaskList.length,
                        showSizeChanger: true,
                        pageSizeOptions: [10, 20, 50, 100],
                        showTotal: (total, range) => `${range[0]} - ${range[1]} of ${total}`,
                    }}
                    scroll={{ x: 1400 }}
                    size="middle"
                />
            </Card>
        </div>
    );
}