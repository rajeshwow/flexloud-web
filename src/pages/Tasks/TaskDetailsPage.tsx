import {
    ApartmentOutlined,
    ArrowLeftOutlined,
    CalendarOutlined,
    CheckCircleOutlined,
    ClockCircleOutlined,
    DeleteOutlined,
    EditOutlined,
    ExclamationCircleOutlined,
    FieldTimeOutlined,
    FileTextOutlined,
    FlagOutlined,
    HistoryOutlined,
    LinkOutlined,
    ReloadOutlined,
    ThunderboltOutlined,
    TrophyOutlined,
    UserOutlined,
} from "@ant-design/icons";
import {
    Button,
    Card,
    Col,
    Descriptions,
    Divider,
    Empty,
    Popconfirm,
    Progress,
    Row,
    Skeleton,
    Space,
    Tag,
    Timeline,
    Typography,
    message,
    theme
} from "antd";
import dayjs from "dayjs";
import { useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { getTaskById, updateTask } from "../../redux/reducers/tasks.slice";
import type { RootState } from "../../redux/store";
import { toTitleCase } from "../../shared/Utils/utils";

const { Title, Text, Paragraph } = Typography;

const STATUS_META: Record<string, { label: string; color: string }> = {
    not_started: { label: "Not Started", color: "default" },
    in_progress: { label: "In Progress", color: "processing" },
    completed: { label: "Completed", color: "success" },
    waiting: { label: "Waiting", color: "warning" },
    deferred: { label: "Deferred", color: "purple" },
};

const PRIORITY_META: Record<string, { label: string; color: string }> = {
    low: { label: "Low", color: "default" },
    medium: { label: "Medium", color: "gold" },
    high: { label: "High", color: "red" },
    urgent: { label: "Urgent", color: "magenta" },
};

function formatDateTime(value?: string | null) {
    if (!value) return "--";
    return dayjs(value).format("DD/MM/YYYY hh:mm a");
}

function formatDate(value?: string | null) {
    if (!value) return "--";
    return dayjs(value).format("DD/MM/YYYY");
}

function humanizeType(value?: string | null) {
    if (!value) return "--";
    return value
        .split("_")
        .map((item) => item.charAt(0).toUpperCase() + item.slice(1))
        .join(" ");
}

function getStatusTag(status?: string) {
    const meta = STATUS_META[status || ""] || {
        label: humanizeType(status),
        color: "default",
    };

    return <Tag color={meta.color}>{meta.label}</Tag>;
}

function getPriorityTag(task: any) {
    const key = task?.priority_value || task?.priority_name?.toLowerCase?.() || "";
    const meta = PRIORITY_META[key] || {
        label: task?.priority_name || humanizeType(key) || "--",
        color: "default",
    };

    return <Tag color={meta.color}>{meta.label}</Tag>;
}

function getScoreColor(score?: number | null) {
    if (score == null) return "#999";
    if (score >= 90) return "#52c41a";
    if (score >= 75) return "#1677ff";
    if (score >= 60) return "#faad14";
    if (score >= 40) return "#fa8c16";
    return "#ff4d4f";
}

function buildPerformanceInsight(task: any) {
    const isCompleted = task?.status === "completed";
    const overdueDays = Number(task?.overdue_days || 0);
    const score = Number(task?.final_score || 0);
    const activityCount = Number(task?.activity_count || 0);

    if (isCompleted && overdueDays <= 0 && score >= 90) {
        return "Excellent execution. Task was completed on time with strong performance discipline.";
    }

    if (isCompleted && overdueDays <= 0) {
        return "Good job. Task was completed on time and contributes positively to performance.";
    }

    if (!isCompleted && overdueDays > 0) {
        return `Task is overdue by ${overdueDays} day(s). Immediate action is recommended to avoid score drop.`;
    }

    if (activityCount === 0) {
        return "No activity has been recorded yet. Add updates to improve visibility and accountability.";
    }

    if (score < 60) {
        return "This task needs stronger execution. Faster response and timely closure will improve the score.";
    }

    return "Task is progressing normally. A few meaningful updates and on-time closure will strengthen performance.";
}

function buildTaskInsightTag(task: any) {
    const isCompleted = task?.status === "completed";
    const overdueDays = Number(task?.overdue_days || 0);

    if (isCompleted && overdueDays <= 0) {
        return <Tag color="success">On Time</Tag>;
    }

    if (!isCompleted && overdueDays > 0) {
        return <Tag color="error">Overdue</Tag>;
    }

    if (task?.status === "in_progress") {
        return <Tag color="processing">Active</Tag>;
    }

    return <Tag>Tracked</Tag>;
}

function buildTimelineItems(task: any) {
    const sourceActivities = task?.activities || task?.activity_logs || task?.task_activities || [];

    if (Array.isArray(sourceActivities) && sourceActivities.length > 0) {
        return sourceActivities.map((item: any) => ({
            color:
                item?.action === "completed"
                    ? "green"
                    : item?.action === "status_changed"
                        ? "blue"
                        : item?.action === "assigned_changed"
                            ? "orange"
                            : "gray",
            children: (
                <div>
                    <Text strong>{humanizeType(item?.action || "updated")}</Text>
                    <div>
                        <Text type="secondary">
                            {item?.description ||
                                `${humanizeType(item?.field_name || "task")} updated`}
                        </Text>
                    </div>
                    <div>
                        <Text type="secondary" style={{ fontSize: 12 }}>
                            {formatDateTime(item?.created_at)}
                        </Text>
                    </div>
                </div>
            ),
        }));
    }

    const fallback = [];

    if (task?.created_at) {
        fallback.push({
            color: "blue",
            children: (
                <div>
                    <Text strong>Task Created</Text>
                    <div>
                        <Text type="secondary">Task was created in the system.</Text>
                    </div>
                    <div>
                        <Text type="secondary" style={{ fontSize: 12 }}>
                            {formatDateTime(task?.created_at)}
                        </Text>
                    </div>
                </div>
            ),
        });
    }

    if (task?.updated_at && task?.updated_at !== task?.created_at) {
        fallback.push({
            color: "gray",
            children: (
                <div>
                    <Text strong>Last Updated</Text>
                    <div>
                        <Text type="secondary">Task details were updated.</Text>
                    </div>
                    <div>
                        <Text type="secondary" style={{ fontSize: 12 }}>
                            {formatDateTime(task?.updated_at)}
                        </Text>
                    </div>
                </div>
            ),
        });
    }

    if (task?.status === "completed") {
        fallback.push({
            color: "green",
            children: (
                <div>
                    <Text strong>Marked Completed</Text>
                    <div>
                        <Text type="secondary">Task has been completed.</Text>
                    </div>
                    <div>
                        <Text type="secondary" style={{ fontSize: 12 }}>
                            {formatDateTime(task?.updated_at)}
                        </Text>
                    </div>
                </div>
            ),
        });
    }

    return fallback;
}

function getRelatedRoute(task: any, slug: string) {
    if (!task?.related_to_type || !task?.related_to_id || !slug) return "";

    switch (task.related_to_type) {
        case "organization":
            return `/${slug}/organizations/${task.related_to_id}`;
        case "contact":
            return `/${slug}/contacts/${task.related_to_id}`;
        case "lead":
            return `/${slug}/leads/${task.related_to_id}`;
        case "opportunity":
            return `/${slug}/opportunities/${task.related_to_id}`;
        default:
            return "";
    }
}

function InfoCard({
    title,
    icon,
    children,
    extra,
}: {
    title: string;
    icon?: React.ReactNode;
    children: React.ReactNode;
    extra?: React.ReactNode;
}) {
    const { token } = theme.useToken();

    return (
        <Card
            style={{
                borderRadius: 20,
                border: `1px solid ${token.colorBorderSecondary}`,
                boxShadow: token.boxShadowTertiary,
                height: "100%",
                background: token.colorBgContainer,
            }}
            bodyStyle={{ padding: 20 }}
        >
            <div
                style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: 16,
                    gap: 12,
                }}
            >
                <Space size={10}>
                    <div
                        style={{
                            width: 38,
                            height: 38,
                            borderRadius: 12,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            background: token.colorPrimaryBg,
                            color: token.colorPrimary,
                            fontSize: 16,
                            flexShrink: 0,
                        }}
                    >
                        {icon}
                    </div>
                    <Text strong style={{ fontSize: 16 }}>
                        {title}
                    </Text>
                </Space>

                {extra}
            </div>

            {children}
        </Card>
    );
}

export default function TaskDetailsPage() {
    const dispatch = useDispatch<any>();
    const navigate = useNavigate();
    const { token } = theme.useToken();
    const { id, slug = "" } = useParams();

    const currentTask = useSelector((state: RootState) => state.tasks?.currentTask);
    const loading = useSelector((state: RootState) => state.tasks?.loading);

    useEffect(() => {
        if (id) {
            dispatch(getTaskById(id));
        }
    }, [dispatch, id]);

    const task = currentTask;

    const performanceInsight = useMemo(() => buildPerformanceInsight(task), [task]);
    const timelineItems = useMemo(() => buildTimelineItems(task), [task]);
    const relatedRoute = useMemo(() => getRelatedRoute(task, slug), [task, slug]);

    const handleDelete = async () => {
        if (!id) return;

        // try {
        //     await dispatch(deleteTask(id)).unwrap();
        //     message.success("Task deleted successfully");
        //     navigate(`/${slug}/tasks`);
        // } catch (error: any) {
        //     message.error(error?.message || "Failed to delete task");
        // }
    };

    const handleQuickStatusUpdate = async (status: string) => {
        if (!id) return;

        try {

            await dispatch(updateTask({ id, body: { status } })).unwrap();
            message.success(`Task marked as ${humanizeType(status)}`);
            await dispatch(getTaskById(id));
        } catch (error: any) {
            message.error(error?.message || "Failed to update task status");
        }
    };

    if (loading) {
        return (
            <div style={{ padding: 4 }}>
                <Card
                    style={{
                        borderRadius: 20,
                        border: `1px solid ${token.colorBorderSecondary}`,
                        boxShadow: token.boxShadowTertiary,
                    }}
                >
                    <Skeleton active paragraph={{ rows: 10 }} />
                </Card>
            </div>
        );
    }

    if (!task) {
        return (
            <Card
                style={{
                    borderRadius: 20,
                    border: `1px solid ${token.colorBorderSecondary}`,
                    boxShadow: token.boxShadowTertiary,
                }}
            >
                <Empty description="Task not found" image={Empty.PRESENTED_IMAGE_SIMPLE}>
                    <Button onClick={() => navigate(`/${slug}/tasks`)}>Back to Tasks</Button>
                </Empty>
            </Card>
        );
    }

    return (
        <div style={{ display: "grid", gap: 20 }}>
            <Card
                style={{
                    borderRadius: 24,
                    border: `1px solid ${token.colorBorderSecondary}`,
                    boxShadow: token.boxShadowTertiary,
                    overflow: "hidden",
                    background: `linear-gradient(135deg, ${token.colorBgContainer} 0%, ${token.colorPrimaryBg} 180%)`,
                }}
                bodyStyle={{ padding: 24 }}
            >
                <div
                    style={{
                        display: "flex",
                        justifyContent: "space-between",
                        gap: 16,
                        flexWrap: "wrap",
                    }}
                >
                    <div style={{ minWidth: 0 }}>
                        <Space align="start" size={12} style={{ marginBottom: 10 }}>
                            <Button
                                icon={<ArrowLeftOutlined />}
                                onClick={() => navigate(`/${slug}/tasks`)}
                            />
                            <div>
                                <Text type="secondary">Task Details</Text>
                                <Title level={2} style={{ margin: "4px 0 8px", lineHeight: 1.2 }}>
                                    {task?.subject || "Untitled Task"}
                                </Title>

                                <Space wrap size={[8, 8]}>
                                    {getStatusTag(task?.status)}
                                    {getPriorityTag(task)}
                                    {buildTaskInsightTag(task)}
                                    <Tag icon={<FileTextOutlined />}>
                                        {task?.task_number || "--"}
                                    </Tag>
                                </Space>
                            </div>
                        </Space>
                    </div>

                    <Space wrap>
                        <Button
                            icon={<ReloadOutlined />}
                            onClick={() => id && dispatch(getTaskById(id))}
                        >
                            Refresh
                        </Button>

                        <Button
                            type="primary"
                            icon={<EditOutlined />}
                            onClick={() => navigate(`/${slug}/tasks/${task.id}/edit`)}
                        >
                            Edit Task
                        </Button>

                        <Popconfirm
                            title="Delete this task?"
                            description="This action will soft delete the task."
                            okText="Delete"
                            cancelText="Cancel"
                            okButtonProps={{ danger: true, loading: loading }}
                            onConfirm={handleDelete}
                        >
                            <Button danger icon={<DeleteOutlined />}>
                                Delete
                            </Button>
                        </Popconfirm>
                    </Space>
                </div>

                <Divider style={{ margin: "20px 0 16px" }} />

                <Row gutter={[16, 16]}>
                    <Col xs={24} md={8}>
                        <Card
                            size="small"
                            style={{
                                borderRadius: 16,
                                background: token.colorBgContainer,
                                border: `1px solid ${token.colorBorderSecondary}`,
                            }}
                        >
                            <Space direction="vertical" size={2}>
                                <Text type="secondary">Assigned To</Text>
                                <Text strong style={{ fontSize: 16 }}>
                                    {toTitleCase(task?.assigned_to_name as string) || "--"}
                                </Text>
                            </Space>
                        </Card>
                    </Col>

                    <Col xs={24} md={8}>
                        <Card
                            size="small"
                            style={{
                                borderRadius: 16,
                                background: token.colorBgContainer,
                                border: `1px solid ${token.colorBorderSecondary}`,
                            }}
                        >
                            <Space direction="vertical" size={2}>
                                <Text type="secondary">Duration</Text>
                                <Text strong style={{ fontSize: 16 }}>
                                    {task?.task_duration || "--"}
                                </Text>
                            </Space>
                        </Card>
                    </Col>

                    <Col xs={24} md={8}>
                        <Card
                            size="small"
                            style={{
                                borderRadius: 16,
                                background: token.colorBgContainer,
                                border: `1px solid ${token.colorBorderSecondary}`,
                            }}
                        >
                            <Space direction="vertical" size={2}>
                                <Text type="secondary">Duration (Minutes)</Text>
                                <Text strong style={{ fontSize: 16 }}>
                                    {task?.task_duration_minutes ?? "--"}
                                </Text>
                            </Space>
                        </Card>
                    </Col>
                </Row>
            </Card>

            <Row gutter={[20, 20]}>
                <Col xs={24} xl={16}>
                    <div style={{ display: "grid", gap: 20 }}>
                        <InfoCard title="Task Summary" icon={<ExclamationCircleOutlined />}>
                            <Descriptions
                                column={1}
                                size="middle"
                                colon={false}
                                labelStyle={{
                                    width: 180,
                                    fontWeight: 600,
                                    color: token.colorTextSecondary,
                                }}
                                contentStyle={{
                                    color: token.colorText,
                                    fontWeight: 500,
                                }}
                            >
                                <Descriptions.Item label="Task Number">
                                    {task?.task_number || "--"}
                                </Descriptions.Item>

                                <Descriptions.Item label="Subject">
                                    {task?.subject || "--"}
                                </Descriptions.Item>

                                <Descriptions.Item label="Status">
                                    {getStatusTag(task?.status)}
                                </Descriptions.Item>

                                <Descriptions.Item label="Priority">
                                    {getPriorityTag(task)}
                                </Descriptions.Item>

                                <Descriptions.Item label="Assigned To">
                                    {toTitleCase(task?.assigned_to_name as string) || "--"}
                                </Descriptions.Item>
                            </Descriptions>
                        </InfoCard>

                        <InfoCard title="Schedule & Timing" icon={<CalendarOutlined />}>
                            <Descriptions
                                column={1}
                                size="middle"
                                colon={false}
                                labelStyle={{
                                    width: 180,
                                    fontWeight: 600,
                                    color: token.colorTextSecondary,
                                }}
                                contentStyle={{
                                    color: token.colorText,
                                    fontWeight: 500,
                                }}
                            >
                                <Descriptions.Item label="Start Date">
                                    {formatDateTime(task?.start_date)}
                                </Descriptions.Item>

                                <Descriptions.Item label="End Date">
                                    {formatDateTime(task?.end_date)}
                                </Descriptions.Item>

                                <Descriptions.Item label="Repeat Task">
                                    {humanizeType(task?.repeat_task)}
                                </Descriptions.Item>

                                <Descriptions.Item label="Repeat Task End">
                                    {task?.repeat_task_end ? formatDate(task?.repeat_task_end) : "--"}
                                </Descriptions.Item>

                                <Descriptions.Item label="Task Duration">
                                    {task?.task_duration || "--"}
                                </Descriptions.Item>

                                <Descriptions.Item label="Task Duration (Minutes)">
                                    {task?.task_duration_minutes ?? "--"}
                                </Descriptions.Item>
                            </Descriptions>
                        </InfoCard>

                        <InfoCard title="Description" icon={<FileTextOutlined />}>
                            {task?.description ? (
                                <Paragraph
                                    style={{
                                        marginBottom: 0,
                                        whiteSpace: "pre-wrap",
                                        color: token.colorText,
                                        fontSize: 14,
                                        lineHeight: 1.8,
                                    }}
                                >
                                    {task.description}
                                </Paragraph>
                            ) : (
                                <Empty
                                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                                    description="No description added"
                                />
                            )}
                        </InfoCard>

                        <InfoCard title="Activity Timeline" icon={<HistoryOutlined />}>
                            {timelineItems.length ? (
                                <Timeline items={timelineItems} />
                            ) : (
                                <Empty
                                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                                    description="No activity available"
                                />
                            )}
                        </InfoCard>
                    </div>
                </Col>

                <Col xs={24} xl={8}>
                    <div style={{ display: "grid", gap: 20 }}>
                        <InfoCard title="Performance Score" icon={<TrophyOutlined />}>
                            <div style={{ display: "grid", gap: 14 }}>
                                <div style={{ textAlign: "center" }}>
                                    <Progress
                                        type="circle"
                                        percent={Math.round(Number(task?.final_score || 0))}
                                        size={120}
                                        strokeColor={getScoreColor(Number(task?.final_score || 0))}
                                        format={() => (
                                            <div>
                                                <div style={{ fontSize: 24, fontWeight: 700 }}>
                                                    {Number(task?.final_score || 0).toFixed(0)}
                                                </div>
                                                <div style={{ fontSize: 12, color: token.colorTextSecondary }}>
                                                    Score
                                                </div>
                                            </div>
                                        )}
                                    />
                                </div>

                                <Descriptions column={1} colon={false} size="small">
                                    <Descriptions.Item label="Score Band">
                                        {task?.score_band || "--"}
                                    </Descriptions.Item>
                                    <Descriptions.Item label="On Time Completion">
                                        {task?.completed_on_time ? "Yes" : "No"}
                                    </Descriptions.Item>
                                    <Descriptions.Item label="Overdue Days">
                                        {task?.overdue_days ?? 0}
                                    </Descriptions.Item>
                                    <Descriptions.Item label="Activity Count">
                                        {task?.activity_count ?? 0}
                                    </Descriptions.Item>
                                    <Descriptions.Item label="First Response (mins)">
                                        {task?.first_response_minutes ?? "--"}
                                    </Descriptions.Item>
                                </Descriptions>
                            </div>
                        </InfoCard>

                        <InfoCard title="Score Breakdown" icon={<ThunderboltOutlined />}>
                            <Descriptions column={1} colon={false} size="small">
                                <Descriptions.Item label="Completion Score">
                                    {task?.completion_score ?? "--"}
                                </Descriptions.Item>
                                <Descriptions.Item label="Activity Score">
                                    {task?.activity_score ?? "--"}
                                </Descriptions.Item>
                                <Descriptions.Item label="Response Score">
                                    {task?.response_score ?? "--"}
                                </Descriptions.Item>
                                <Descriptions.Item label="Overdue Penalty">
                                    {task?.overdue_penalty ?? "--"}
                                </Descriptions.Item>
                                <Descriptions.Item label="Priority Multiplier">
                                    {task?.priority_multiplier ?? "--"}
                                </Descriptions.Item>
                            </Descriptions>
                        </InfoCard>

                        <InfoCard title="Performance Insight" icon={<FlagOutlined />}>
                            <div
                                style={{
                                    padding: 14,
                                    borderRadius: 14,
                                    background: token.colorPrimaryBg,
                                    border: `1px solid ${token.colorBorderSecondary}`,
                                }}
                            >
                                <Text>{performanceInsight}</Text>
                            </div>
                        </InfoCard>

                        <InfoCard title="Quick Actions" icon={<CheckCircleOutlined />}>
                            <Space wrap>
                                <Button
                                    onClick={() => handleQuickStatusUpdate("not_started")}
                                    loading={loading}
                                >
                                    Mark Not Started
                                </Button>
                                <Button
                                    onClick={() => handleQuickStatusUpdate("in_progress")}
                                    loading={loading}
                                >
                                    Mark In Progress
                                </Button>
                                <Button
                                    type="primary"
                                    onClick={() => handleQuickStatusUpdate("completed")}
                                    loading={loading}
                                >
                                    Mark Completed
                                </Button>
                            </Space>
                        </InfoCard>

                        <InfoCard title="Related Information" icon={<LinkOutlined />}>
                            <Descriptions
                                column={1}
                                size="middle"
                                colon={false}
                                labelStyle={{
                                    width: 140,
                                    fontWeight: 600,
                                    color: token.colorTextSecondary,
                                }}
                                contentStyle={{
                                    color: token.colorText,
                                    fontWeight: 500,
                                }}
                            >
                                <Descriptions.Item label="Related To">
                                    {humanizeType(task?.related_to_type)}
                                </Descriptions.Item>

                                <Descriptions.Item label="Related Record">
                                    {relatedRoute ? (
                                        <Button
                                            type="link"
                                            style={{ padding: 0, height: "auto" }}
                                            onClick={() => navigate(relatedRoute)}
                                            icon={<ApartmentOutlined />}
                                        >
                                            {task?.related_to_name || "--"}
                                        </Button>
                                    ) : (
                                        task?.related_to_name || "--"
                                    )}
                                </Descriptions.Item>
                            </Descriptions>
                        </InfoCard>

                        <InfoCard title="Meta & Audit" icon={<ClockCircleOutlined />}>
                            <Descriptions
                                column={1}
                                size="middle"
                                colon={false}
                                labelStyle={{
                                    width: 140,
                                    fontWeight: 600,
                                    color: token.colorTextSecondary,
                                }}
                                contentStyle={{
                                    color: token.colorText,
                                    fontWeight: 500,
                                }}
                            >
                                <Descriptions.Item label="Created At">
                                    {formatDateTime(task?.created_at)}
                                </Descriptions.Item>

                                <Descriptions.Item label="Updated At">
                                    {formatDateTime(task?.updated_at)}
                                </Descriptions.Item>

                                <Descriptions.Item label="Created By">
                                    {task?.created_by_name || task?.created_by || "--"}
                                </Descriptions.Item>

                                <Descriptions.Item label="Updated By">
                                    {task?.updated_by_name || task?.updated_by || "--"}
                                </Descriptions.Item>
                            </Descriptions>
                        </InfoCard>

                        <InfoCard title="Quick Highlights" icon={<UserOutlined />}>
                            <Space direction="vertical" size={14} style={{ width: "100%" }}>
                                <div
                                    style={{
                                        padding: 14,
                                        borderRadius: 14,
                                        background: token.colorPrimaryBg,
                                        border: `1px solid ${token.colorBorderSecondary}`,
                                    }}
                                >
                                    <Space align="start">
                                        <UserOutlined style={{ marginTop: 3 }} />
                                        <div>
                                            <Text strong>Owner</Text>
                                            <div>
                                                <Text type="secondary">
                                                    {task?.assigned_to_name || "Not assigned"}
                                                </Text>
                                            </div>
                                        </div>
                                    </Space>
                                </div>

                                <div
                                    style={{
                                        padding: 14,
                                        borderRadius: 14,
                                        background: token.colorSuccessBg,
                                        border: `1px solid ${token.colorBorderSecondary}`,
                                    }}
                                >
                                    <Space align="start">
                                        <FieldTimeOutlined style={{ marginTop: 3 }} />
                                        <div>
                                            <Text strong>Timeline</Text>
                                            <div>
                                                <Text type="secondary">
                                                    {formatDateTime(task?.start_date)} to{" "}
                                                    {formatDateTime(task?.end_date)}
                                                </Text>
                                            </div>
                                        </div>
                                    </Space>
                                </div>

                                <div
                                    style={{
                                        padding: 14,
                                        borderRadius: 14,
                                        background: token.colorWarningBg,
                                        border: `1px solid ${token.colorBorderSecondary}`,
                                    }}
                                >
                                    <Space align="start">
                                        <ClockCircleOutlined style={{ marginTop: 3 }} />
                                        <div>
                                            <Text strong>Repeat Cycle</Text>
                                            <div>
                                                <Text type="secondary">
                                                    {humanizeType(task?.repeat_task)}{" "}
                                                    {task?.repeat_task_end
                                                        ? `until ${formatDate(task?.repeat_task_end)}`
                                                        : ""}
                                                </Text>
                                            </div>
                                        </div>
                                    </Space>
                                </div>
                            </Space>
                        </InfoCard>
                    </div>
                </Col>
            </Row>
        </div>
    );
}