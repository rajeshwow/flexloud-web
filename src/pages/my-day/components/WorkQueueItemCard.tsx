import {
    CalendarOutlined,
    ClockCircleOutlined,
    ExclamationCircleOutlined,
    FileTextOutlined,
    FlagOutlined,
    ScheduleOutlined,
    UserOutlined,
} from "@ant-design/icons";
import { Button, Card, Space, Tag, Typography, theme } from "antd";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { useNavigate, useParams } from "react-router-dom";
import type { WorkQueueItem } from "../../../redux/reducers/myDay.slice";

dayjs.extend(relativeTime);

const { Text, Title } = Typography;

type Props = {
    item: WorkQueueItem;
};

function getTypeColor(type: WorkQueueItem["type"]) {
    switch (type) {
        case "task":
            return "blue";
        case "lead_followup":
            return "gold";
        case "quote_expiry":
            return "purple";
        case "visit":
            return "cyan";
        case "stale_lead":
            return "red";
        default:
            return "default";
    }
}

function getPriorityColor(priority: WorkQueueItem["priority"]) {
    switch (priority) {
        case "urgent":
            return "red";
        case "high":
            return "orange";
        case "medium":
            return "blue";
        default:
            return "default";
    }
}

function getSectionLabel(section: WorkQueueItem["section"]) {
    switch (section) {
        case "overdue":
            return "Overdue";
        case "today":
            return "Due Today";
        case "upcoming":
            return "Upcoming";
        case "needs_attention":
            return "Need Attention";
        default:
            return section;
    }
}

function formatDue(dueAt?: string | null, section?: WorkQueueItem["section"]) {
    if (!dueAt) return "--";

    const d = dayjs(dueAt);
    if (!d.isValid()) return "--";

    if (section === "overdue") return `Overdue ${d.fromNow()}`;
    if (section === "today") return `Today, ${d.format("hh:mm A")}`;
    if (section === "upcoming") return d.format("DD MMM YYYY, hh:mm A");

    return d.format("DD MMM YYYY, hh:mm A");
}

function getPrimaryActionLabel(item: WorkQueueItem) {
    if (item.action_label?.trim()) return item.action_label;

    switch (item.type) {
        case "task":
            return "Open Task";
        case "lead_followup":
            return "Open Lead";
        case "quote_expiry":
            return "Open Quote";
        case "visit":
            return "Open Visit";
        case "stale_lead":
            return "Open Lead";
        default:
            return "Open";
    }
}

export default function WorkQueueItemCard({ item }: Props) {
    const navigate = useNavigate();
    const { slug = "" } = useParams();
    const { token } = theme.useToken();

    const handleOpen = () => {
        navigate(`/${slug}${item.route}`);
    };

    return (
        <Card
            bordered={false}
            style={{
                borderRadius: Number(token.borderRadiusLG) + 6,
                background: token.colorBgContainer,
                border: `1px solid ${token.colorBorderSecondary}`,
                boxShadow: token.boxShadowSecondary,
            }}
            styles={{
                body: {
                    padding: 18,
                },
            }}
        >
            <div
                style={{
                    display: "flex",
                    justifyContent: "space-between",
                    gap: 18,
                    flexWrap: "wrap",
                }}
            >
                <div style={{ flex: 1, minWidth: 280 }}>
                    <Space wrap size={[8, 8]} style={{ marginBottom: 14 }}>
                        <Tag color={getTypeColor(item.type)}>
                            {item.type.replaceAll("_", " ").toUpperCase()}
                        </Tag>

                        <Tag color={getPriorityColor(item.priority)}>
                            {item.priority.toUpperCase()}
                        </Tag>

                        <Tag>{getSectionLabel(item.section)}</Tag>

                        {item.entity_number ? <Tag>{item.entity_number}</Tag> : null}
                    </Space>

                    <div style={{ marginBottom: 12 }}>
                        <Title level={4} style={{ margin: 0, marginBottom: 4 }}>
                            {item.title || "--"}
                        </Title>

                        {item.subtitle ? (
                            <Text
                                type="secondary"
                                style={{
                                    display: "block",
                                    fontSize: 14,
                                }}
                            >
                                {item.subtitle}
                            </Text>
                        ) : null}

                        {item.description ? (
                            <Text
                                type="secondary"
                                style={{
                                    display: "block",
                                    marginTop: 6,
                                    fontSize: 13,
                                    lineHeight: 1.6,
                                }}
                            >
                                {item.description}
                            </Text>
                        ) : null}
                    </div>

                    <Space
                        direction="vertical"
                        size={8}
                        style={{ width: "100%", marginBottom: 16 }}
                    >
                        <Space size={8}>
                            <ClockCircleOutlined />
                            <Text>{formatDue(item.due_at, item.section)}</Text>
                        </Space>

                        {item.assigned_to_name ? (
                            <Space size={8}>
                                <UserOutlined />
                                <Text>{item.assigned_to_name}</Text>
                            </Space>
                        ) : null}

                        {item.related_to_label ? (
                            <Space size={8}>
                                <CalendarOutlined />
                                <Text>{item.related_to_label}</Text>
                            </Space>
                        ) : null}
                    </Space>

                    <Space wrap size={10}>
                        <Button
                            type="primary"
                            icon={<FileTextOutlined />}
                            onClick={handleOpen}
                            style={{ borderRadius: token.borderRadius }}
                        >
                            {getPrimaryActionLabel(item)}
                        </Button>

                        {item.type === "task" ? (
                            <Button
                                icon={<ScheduleOutlined />}
                                onClick={handleOpen}
                                style={{ borderRadius: token.borderRadius }}
                            >
                                Update
                            </Button>
                        ) : null}

                        {item.type === "lead_followup" || item.type === "stale_lead" ? (
                            <Button
                                icon={<ExclamationCircleOutlined />}
                                onClick={handleOpen}
                                style={{ borderRadius: token.borderRadius }}
                            >
                                Review
                            </Button>
                        ) : null}

                        {item.type === "quote_expiry" ? (
                            <Button
                                icon={<FlagOutlined />}
                                onClick={handleOpen}
                                style={{ borderRadius: token.borderRadius }}
                            >
                                Check Quote
                            </Button>
                        ) : null}
                    </Space>
                </div>

                <div
                    style={{
                        minWidth: 180,
                        flexShrink: 0,
                        display: "flex",
                        alignItems: "stretch",
                    }}
                >
                    <div
                        style={{
                            width: "100%",
                            borderRadius: Number(token.borderRadiusLG),
                            padding: 14,
                            background: token.colorFillQuaternary,
                            border: `1px solid ${token.colorBorderSecondary}`,
                            display: "flex",
                            flexDirection: "column",
                            justifyContent: "space-between",
                            gap: 12,
                        }}
                    >
                        <div>
                            <Text
                                type="secondary"
                                style={{
                                    fontSize: 12,
                                    textTransform: "uppercase",
                                    letterSpacing: 0.6,
                                }}
                            >
                                Queue Status
                            </Text>

                            <div style={{ marginTop: 8 }}>
                                <Tag
                                    color={
                                        item.section === "overdue"
                                            ? "red"
                                            : item.section === "today"
                                                ? "gold"
                                                : item.section === "upcoming"
                                                    ? "blue"
                                                    : "orange"
                                    }
                                    style={{ marginInlineEnd: 0 }}
                                >
                                    {getSectionLabel(item.section)}
                                </Tag>
                            </div>
                        </div>

                        <div>
                            <Text type="secondary" style={{ fontSize: 12 }}>
                                Route
                            </Text>

                            <div style={{ marginTop: 6 }}>
                                <Text
                                    style={{
                                        fontSize: 12,
                                        wordBreak: "break-all",
                                        color: token.colorTextSecondary,
                                    }}
                                >
                                    {item.route || "--"}
                                </Text>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Card>
    );
}