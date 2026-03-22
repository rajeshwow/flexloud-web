import {
    CheckCircleOutlined,
    ClockCircleOutlined,
    EditOutlined,
    FileTextOutlined,
    PlusCircleOutlined,
    SyncOutlined,
    UserSwitchOutlined,
} from "@ant-design/icons";
import { Card, Empty, Space, Timeline, Typography } from "antd";
import dayjs from "dayjs";

const { Text, Paragraph } = Typography;

type ActivityChangeItem = {
    field: string;
    label: string;
    old_value: any;
    new_value: any;
    old_display?: string;
    new_display?: string;
};

type ActivityItem = {
    id: string;
    title?: string | null;
    description?: string | null;
    metadata?: {
        changes?: ActivityChangeItem[];
        updated_fields?: string[];
        remarks?: string | null;
        [key: string]: any;
    } | null;
    created_at: string;
    user_name?: string | null;
    action_type: string;
    entity_type: string;
    entity_id: string;
};

type Props = {
    data: ActivityItem[];
    loading?: boolean;
    title?: string;
};

function getTimelineMeta(actionType?: string) {
    switch (actionType) {
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

        case "completed":
            return {
                color: "green",
                icon: <CheckCircleOutlined />,
            };

        case "updated":
        case "followup_changed":
        case "email_changed":
            return {
                color: "cyan",
                icon: <EditOutlined />,
            };

        default:
            return {
                color: "gray",
                icon: <ClockCircleOutlined />,
            };
    }
}

function renderChanges(item: ActivityItem) {
    const changes = item.metadata?.changes || [];

    if (!changes.length) return null;

    const uniqueChanges = changes.filter((change, index, arr) => {
        const key = [
            change.field,
            change.old_display ?? "",
            change.new_display ?? "",
        ].join("__");

        return (
            index ===
            arr.findIndex((item) => {
                const itemKey = [
                    item.field,
                    item.old_display ?? "",
                    item.new_display ?? "",
                ].join("__");

                return itemKey === key;
            })
        );
    });

    return (
        <Space direction="vertical" size={6} style={{ width: "100%" }}>
            {uniqueChanges.map((change, index) => (
                <div key={`${change.field}-${index}`}>
                    <Text strong>{change.label}: </Text>
                    <Text type="secondary">{change.old_display || "-"}</Text>
                    <Text type="secondary"> → </Text>
                    <Text>{change.new_display || "-"}</Text>
                </div>
            ))}
        </Space>
    );
}

function renderRemarks(item: ActivityItem) {
    const remarks = item.metadata?.remarks;

    if (!remarks) return null;

    return (
        <Paragraph
            type="secondary"
            style={{
                marginBottom: 0,
                fontStyle: "italic",
                whiteSpace: "pre-wrap",
            }}
        >
            Remark: {remarks}
        </Paragraph>
    );
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
                        const uniqueChanges = (item.metadata?.changes || []).filter((change, index, arr) => {
                            const key = [
                                change.field,
                                change.old_display ?? "",
                                change.new_display ?? "",
                            ].join("__");

                            return (
                                index ===
                                arr.findIndex((item) => {
                                    const itemKey = [
                                        item.field,
                                        item.old_display ?? "",
                                        item.new_display ?? "",
                                    ].join("__");

                                    return itemKey === key;
                                })
                            );
                        });

                        const hasChanges = uniqueChanges.length > 0;

                        return {
                            color: meta.color as any,
                            dot: meta.icon,
                            children: (
                                <div style={{ paddingBottom: 10 }}>
                                    <Space direction="vertical" size={6} style={{ width: "100%" }}>
                                        <Text strong style={{ fontSize: 15 }}>
                                            {item.title || "Activity updated"}
                                        </Text>

                                        {item.description && !hasChanges ? (
                                            <Paragraph
                                                type="secondary"
                                                style={{
                                                    marginBottom: 0,
                                                    whiteSpace: "pre-wrap",
                                                }}
                                            >
                                                {item.description}
                                            </Paragraph>
                                        ) : null}

                                        {renderChanges({
                                            ...item,
                                            metadata: {
                                                ...item.metadata,
                                                changes: uniqueChanges,
                                            },
                                        })}

                                        {renderRemarks(item)}

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