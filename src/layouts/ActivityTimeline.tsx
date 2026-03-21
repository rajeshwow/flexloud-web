import {
    CheckCircleOutlined,
    ClockCircleOutlined,
    EditOutlined,
    FileTextOutlined,
    PlusCircleOutlined,
    SyncOutlined,
    UserSwitchOutlined,
} from "@ant-design/icons";
import { Card, Empty, Space, Tag, Timeline, Typography } from "antd";
import dayjs from "dayjs";

const { Text, Paragraph } = Typography;

type ActivityItem = {
    id: string;
    title?: string | null;
    description?: string | null;
    metadata?: Record<string, any> | null;
    created_at: string;
    user_name?: string | null;
    action_type: string;
    action: string;
    entity_type: string;
    entity_id: string;
    data?: any;
};

type Props = {
    data: ActivityItem[];
    loading?: boolean;
    title?: string;
};

function getTimelineMeta(actionType?: string) {
    switch (actionType) {
        case "visit_created":
        case "created":
            return {
                color: "green",
                icon: <PlusCircleOutlined />,
            };

        case "status_changed":
            return {
                color: "blue",
                icon: <SyncOutlined />,
            };

        case "assigned":
        case "assignment_changed":
            return {
                color: "purple",
                icon: <UserSwitchOutlined />,
            };

        case "note_added":
            return {
                color: "gold",
                icon: <FileTextOutlined />,
            };

        case "updated":
            return {
                color: "cyan",
                icon: <EditOutlined />,
            };

        case "completed":
        case "visit_completed":
            return {
                color: "green",
                icon: <CheckCircleOutlined />,
            };

        default:
            return {
                color: "gray",
                icon: <ClockCircleOutlined />,
            };
    }
}

function renderMetadata(item: ActivityItem) {
    const metadata = item.metadata || {};

    if (item.action_type === "status_changed") {
        return (
            <Space wrap size={[8, 8]}>
                <Tag>From: {metadata.from || "-"}</Tag>
                <Tag color="blue">To: {metadata.to || "-"}</Tag>
            </Space>
        );
    }

    if (item.action_type === "assignment_changed") {
        return (
            <Space wrap size={[8, 8]}>
                <Tag>From: {metadata.from || "-"}</Tag>
                <Tag color="purple">To: {metadata.to || "-"}</Tag>
            </Space>
        );
    }

    if (item.action_type === "visit_created" && metadata.status) {
        return <Tag color="green">Status: {metadata.status}</Tag>;
    }

    return null;
}

export default function ActivityTimeline({
    data,
    loading = false,
    title = "Activity Timeline",
}: Props) {
    return (
        <Card title={title} className="theme-card" loading={loading}>
            {!data?.length ? (
                <Empty description="No activity found" image={Empty.PRESENTED_IMAGE_SIMPLE} />
            ) : (
                <Timeline
                    items={data.map((item) => {
                        const meta = getTimelineMeta(item.action_type);

                        return {
                            color: meta.color as any,
                            dot: meta.icon,
                            children: (
                                <div style={{ paddingBottom: 8 }}>
                                    <Space direction="vertical" size={4} style={{ width: "100%" }}>
                                        <Text strong>{item.title || "Activity updated"}</Text>

                                        {item.description ? (
                                            <Paragraph
                                                type="secondary"
                                                style={{ marginBottom: 0, whiteSpace: "pre-wrap" }}
                                            >
                                                {item.description}
                                            </Paragraph>
                                        ) : null}

                                        {renderMetadata(item)}

                                        <Text type="secondary" style={{ fontSize: 12 }}>
                                            {item.user_name || "System"} •{" "}
                                            {dayjs(item.created_at).format("DD MMM YYYY, hh:mm A")}
                                        </Text>
                                    </Space>
                                </div>
                            ),
                        };
                    })}
                />
            )}
        </Card>
    );
}