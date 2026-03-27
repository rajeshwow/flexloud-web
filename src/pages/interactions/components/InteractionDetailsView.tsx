import {
    CalendarOutlined,
    CheckCircleOutlined,
    ClockCircleOutlined,
    EditOutlined,
    FileTextOutlined,
    LinkOutlined,
    PhoneOutlined,
    UserOutlined,
} from "@ant-design/icons";
import {
    Button,
    Card,
    Col,
    Divider,
    Empty,
    Row,
    Space,
    Tag,
    Timeline,
    Typography,
    theme,
} from "antd";
import dayjs from "dayjs";
import { Link, useParams } from "react-router-dom";

const { Title, Text, Paragraph } = Typography;

type InteractionActivity = {
    id: string;
    type: string;
    body: string;
    created_at: string;
    created_by_name?: string | null;
    created_by_email?: string | null;
};

type InteractionDetails = {
    id: string;
    subject?: string | null;
    title?: string | null;
    interaction_type?: string | null;
    type?: string | null;
    status?: string | null;
    direction?: string | null;
    priority?: string | null;
    agenda?: string | null;
    description?: string | null;
    notes?: string | null;
    outcome?: string | null;
    follow_up_action?: string | null;
    related_record_type?: string | null;
    related_record_name?: string | null;
    related_record_id?: string | null;
    assigned_to_name?: string | null;
    assigned_to_email?: string | null;
    assigned_to?: string | null;
    contact_name?: string | null;
    contact_phone?: string | null;
    contact_email?: string | null;
    start_at?: string | null;
    end_at?: string | null;
    due_date?: string | null;
    interaction_date?: string | null;
    scheduled_at?: string | null;
    duration_minutes?: number | null;
    meeting_link?: string | null;
    meeting_location?: string | null;
    created_at?: string | null;
    updated_at?: string | null;
    created_by_name?: string | null;
    updated_by_name?: string | null;
    activities?: InteractionActivity[];
};

type Props = {
    interaction?: InteractionDetails | null;
    loading?: boolean;
};

function formatLabel(value?: string | null) {
    if (!value) return "—";
    return value
        .replace(/_/g, " ")
        .replace(/\b\w/g, (char) => char.toUpperCase());
}

function formatDateTime(value?: string | null) {
    if (!value) return "—";
    const d = dayjs(value);
    if (!d.isValid()) return "—";
    return d.format("DD MMM YYYY, hh:mm A");
}

function formatDate(value?: string | null) {
    if (!value) return "—";
    const d = dayjs(value);
    if (!d.isValid()) return "—";
    return d.format("DD MMM YYYY");
}

function getPrimaryDate(interaction?: InteractionDetails | null) {
    return (
        interaction?.scheduled_at ||
        interaction?.start_at ||
        interaction?.interaction_date ||
        interaction?.due_date ||
        null
    );
}

function getEndDate(interaction?: InteractionDetails | null) {
    return interaction?.end_at || null;
}

function getDuration(interaction?: InteractionDetails | null) {
    if (interaction?.duration_minutes) return `${interaction.duration_minutes} min`;

    const start = interaction?.start_at ? dayjs(interaction.start_at) : null;
    const end = interaction?.end_at ? dayjs(interaction.end_at) : null;

    if (start && end && start.isValid() && end.isValid()) {
        const diff = end.diff(start, "minute");
        if (diff > 0) return `${diff} min`;
    }

    return "—";
}

function getStatusColor(status?: string | null) {
    const normalized = (status || "").toLowerCase();

    if (["scheduled", "planned", "open"].includes(normalized)) return "blue";
    if (["completed", "done", "success"].includes(normalized)) return "green";
    if (["cancelled", "canceled", "failed"].includes(normalized)) return "red";
    if (["pending", "in_progress"].includes(normalized)) return "gold";

    return "default";
}

function getPriorityColor(priority?: string | null) {
    const normalized = (priority || "").toLowerCase();

    if (normalized === "high") return "red";
    if (normalized === "medium") return "gold";
    if (normalized === "low") return "green";

    return "default";
}

function getActivityTagColor(type?: string) {
    if (type === "created") return "green";
    if (type === "updated") return "blue";
    return "default";
}

function getActivityLines(body?: string) {
    if (!body) return [];
    return body
        .split(" | ")
        .map((line) => line.trim())
        .filter(Boolean);
}

const DetailItem = ({
    label,
    value,
}: {
    label: string;
    value?: React.ReactNode;
}) => (
    <div style={{ marginBottom: 16 }}>
        <Text
            type="secondary"
            style={{ display: "block", fontSize: 12, marginBottom: 4 }}
        >
            {label}
        </Text>
        <div>{value ?? <Text>—</Text>}</div>
    </div>
);

const InfoCard = ({
    title,
    icon,
    children,
    extra,
}: {
    title: string;
    icon?: React.ReactNode;
    children: React.ReactNode;
    extra?: React.ReactNode;
}) => (
    <Card
        bordered={false}
        style={{
            borderRadius: 20,
            height: "100%",
            boxShadow: "0 8px 30px rgba(0,0,0,0.06)",
        }}
        bodyStyle={{ padding: 20 }}
        title={
            <Space size={10}>
                {icon}
                <span>{title}</span>
            </Space>
        }
        extra={extra}
    >
        {children}
    </Card>
);

export default function InteractionDetailsView({
    interaction,
    loading,
}: Props) {
    const { token } = theme.useToken();
    const { slug } = useParams();

    const primaryDate = getPrimaryDate(interaction);
    const endDate = getEndDate(interaction);
    const dateObj = primaryDate ? dayjs(primaryDate) : null;

    const entityLabel =
        interaction?.type === "meeting"
            ? "Meeting"
            : interaction?.type === "call"
                ? "Call"
                : "Activity";

    const title =
        interaction?.subject ||
        interaction?.title ||
        formatLabel(interaction?.interaction_type) ||
        `${entityLabel} Details`;

    if (!interaction && !loading) {
        return (
            <Card
                bordered={false}
                style={{
                    borderRadius: 20,
                    boxShadow: "0 8px 30px rgba(0,0,0,0.06)",
                }}
            >
                <Empty description="Details not found" />
            </Card>
        );
    }

    return (
        <Space direction="vertical" size={16} style={{ width: "100%" }}>
            <Card
                loading={loading}
                bordered={false}
                style={{
                    borderRadius: 24,
                    overflow: "hidden",
                    boxShadow: "0 10px 35px rgba(0,0,0,0.08)",
                    background: token.colorBgContainer,
                }}
                bodyStyle={{ padding: 0 }}
            >
                <div
                    style={{
                        padding: 24,
                        background:
                            token.colorBgLayout ||
                            "linear-gradient(135deg, rgba(22,119,255,0.06), rgba(114,46,209,0.06))",
                    }}
                >
                    <Row gutter={[16, 16]} align="middle">
                        <Col xs={24} lg={16}>
                            <Space direction="vertical" size={10} style={{ width: "100%" }}>
                                <Space wrap>
                                    <Tag color="geekblue" style={{ borderRadius: 999 }}>
                                        {formatLabel(interaction?.interaction_type || interaction?.type)}
                                    </Tag>

                                    {interaction?.status ? (
                                        <Tag
                                            color={getStatusColor(interaction.status)}
                                            style={{ borderRadius: 999 }}
                                        >
                                            {formatLabel(interaction.status)}
                                        </Tag>
                                    ) : null}

                                    {interaction?.priority ? (
                                        <Tag
                                            color={getPriorityColor(interaction.priority)}
                                            style={{ borderRadius: 999 }}
                                        >
                                            {formatLabel(interaction.priority)} Priority
                                        </Tag>
                                    ) : null}

                                    {interaction?.direction ? (
                                        <Tag style={{ borderRadius: 999 }}>
                                            {formatLabel(interaction.direction)}
                                        </Tag>
                                    ) : null}
                                </Space>

                                <Title level={3} style={{ margin: 0 }}>
                                    {title}
                                </Title>

                                <Space wrap size={[16, 8]}>
                                    <Space size={8}>
                                        <CalendarOutlined />
                                        <Text>{formatDateTime(primaryDate)}</Text>
                                    </Space>

                                    <Space size={8}>
                                        <ClockCircleOutlined />
                                        <Text>{getDuration(interaction)}</Text>
                                    </Space>

                                    <Space size={8}>
                                        <UserOutlined />
                                        <Text>{interaction?.assigned_to_name || "Unassigned"}</Text>
                                    </Space>
                                </Space>
                            </Space>
                        </Col>

                        <Col xs={24} lg={8}>
                            <div
                                style={{
                                    display: "flex",
                                    justifyContent: "flex-end",
                                    alignItems: "stretch",
                                    height: "100%",
                                }}
                            >
                                <Card
                                    bordered={false}
                                    style={{
                                        width: "100%",
                                        maxWidth: 280,
                                        borderRadius: 20,
                                        background: token.colorBgContainer,
                                        boxShadow: "0 8px 25px rgba(0,0,0,0.06)",
                                    }}
                                    bodyStyle={{ padding: 18 }}
                                >
                                    <Row align="middle" gutter={12}>
                                        <Col>
                                            <div
                                                style={{
                                                    width: 64,
                                                    height: 64,
                                                    borderRadius: 18,
                                                    display: "flex",
                                                    alignItems: "center",
                                                    justifyContent: "center",
                                                    background: token.colorPrimaryBg,
                                                    color: token.colorPrimary,
                                                    fontWeight: 700,
                                                    fontSize: 26,
                                                }}
                                            >
                                                {dateObj?.isValid() ? dateObj.format("DD") : "—"}
                                            </div>
                                        </Col>

                                        <Col flex={1}>
                                            <Text type="secondary" style={{ display: "block" }}>
                                                {dateObj?.isValid() ? dateObj.format("dddd") : "No date"}
                                            </Text>
                                            <Text strong style={{ display: "block", fontSize: 16 }}>
                                                {dateObj?.isValid() ? dateObj.format("MMM YYYY") : "—"}
                                            </Text>
                                            <Text type="secondary" style={{ display: "block" }}>
                                                {dateObj?.isValid() ? dateObj.format("hh:mm A") : "—"}
                                            </Text>
                                        </Col>
                                    </Row>

                                    <Divider style={{ margin: "16px 0" }} />

                                    <Button type="primary" icon={<EditOutlined />} block>
                                        <Link to={`/${slug}/events/${interaction?.id}/edit`}>
                                            Edit {entityLabel}
                                        </Link>
                                    </Button>
                                </Card>
                            </div>
                        </Col>
                    </Row>
                </div>
            </Card>

            <Row gutter={[16, 16]}>
                <Col xs={24} xl={16}>
                    <Space direction="vertical" size={16} style={{ width: "100%" }}>
                        <InfoCard title="Overview" icon={<FileTextOutlined />}>
                            <Row gutter={[16, 0]}>
                                <Col xs={24} md={12}>
                                    <DetailItem
                                        label="Type"
                                        value={formatLabel(interaction?.interaction_type || interaction?.type)}
                                    />
                                </Col>
                                <Col xs={24} md={12}>
                                    <DetailItem
                                        label="Status"
                                        value={
                                            interaction?.status ? (
                                                <Tag color={getStatusColor(interaction.status)}>
                                                    {formatLabel(interaction.status)}
                                                </Tag>
                                            ) : (
                                                "—"
                                            )
                                        }
                                    />
                                </Col>

                                <Col xs={24} md={12}>
                                    <DetailItem
                                        label="Direction"
                                        value={formatLabel(interaction?.direction)}
                                    />
                                </Col>
                                <Col xs={24} md={12}>
                                    <DetailItem
                                        label="Priority"
                                        value={
                                            interaction?.priority ? (
                                                <Tag color={getPriorityColor(interaction.priority)}>
                                                    {formatLabel(interaction.priority)}
                                                </Tag>
                                            ) : (
                                                "—"
                                            )
                                        }
                                    />
                                </Col>

                                <Col xs={24} md={12}>
                                    <DetailItem
                                        label="Assigned To"
                                        value={interaction?.assigned_to_name || "—"}
                                    />
                                </Col>
                                <Col xs={24} md={12}>
                                    <DetailItem
                                        label="Assigned Email"
                                        value={interaction?.assigned_to_email || "—"}
                                    />
                                </Col>

                                <Col xs={24} md={12}>
                                    <DetailItem
                                        label="Related Record Type"
                                        value={formatLabel(interaction?.related_record_type)}
                                    />
                                </Col>
                                <Col xs={24} md={12}>
                                    <DetailItem
                                        label="Related Record"
                                        value={interaction?.related_record_name || "—"}
                                    />
                                </Col>

                                <Col xs={24}>
                                    <DetailItem
                                        label="Meeting Link"
                                        value={
                                            interaction?.meeting_link ? (
                                                <a
                                                    href={interaction.meeting_link}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                >
                                                    <Space size={6}>
                                                        <LinkOutlined />
                                                        Open meeting link
                                                    </Space>
                                                </a>
                                            ) : (
                                                "—"
                                            )
                                        }
                                    />
                                </Col>

                                <Col xs={24}>
                                    <DetailItem
                                        label="Location"
                                        value={interaction?.meeting_location || "—"}
                                    />
                                </Col>
                            </Row>
                        </InfoCard>

                        <InfoCard title="Discussion Notes" icon={<FileTextOutlined />}>
                            <DetailItem
                                label="Agenda"
                                value={
                                    interaction?.agenda ? (
                                        <Paragraph style={{ marginBottom: 0 }}>
                                            {interaction.agenda}
                                        </Paragraph>
                                    ) : (
                                        "—"
                                    )
                                }
                            />

                            <DetailItem
                                label="Description"
                                value={
                                    interaction?.description ? (
                                        <Paragraph style={{ marginBottom: 0 }}>
                                            {interaction.description}
                                        </Paragraph>
                                    ) : (
                                        "—"
                                    )
                                }
                            />

                            <DetailItem
                                label="Notes"
                                value={
                                    interaction?.notes ? (
                                        <Paragraph style={{ marginBottom: 0 }}>
                                            {interaction.notes}
                                        </Paragraph>
                                    ) : (
                                        "—"
                                    )
                                }
                            />

                            <DetailItem
                                label="Outcome"
                                value={
                                    interaction?.outcome ? (
                                        <Paragraph style={{ marginBottom: 0 }}>
                                            {interaction.outcome}
                                        </Paragraph>
                                    ) : (
                                        "—"
                                    )
                                }
                            />

                            <DetailItem
                                label="Follow-up Action"
                                value={
                                    interaction?.follow_up_action ? (
                                        <Paragraph style={{ marginBottom: 0 }}>
                                            {interaction.follow_up_action}
                                        </Paragraph>
                                    ) : (
                                        "—"
                                    )
                                }
                            />
                        </InfoCard>

                        <InfoCard title="Timeline" icon={<ClockCircleOutlined />}>
                            {interaction?.activities?.length ? (
                                <Timeline
                                    items={interaction.activities.map((item) => {
                                        const lines = getActivityLines(item.body);

                                        return {
                                            color: item.type === "created" ? "green" : "blue",
                                            dot:
                                                item.type === "created" ? (
                                                    <CheckCircleOutlined />
                                                ) : (
                                                    <ClockCircleOutlined />
                                                ),
                                            children: (
                                                <Card
                                                    size="small"
                                                    bordered={false}
                                                    style={{
                                                        borderRadius: 14,
                                                        boxShadow: "0 4px 14px rgba(0,0,0,0.05)",
                                                        background: token.colorBgContainer,
                                                        border: `1px solid ${token.colorBorderSecondary}`,
                                                        marginBottom: 8,
                                                    }}
                                                    bodyStyle={{ padding: 14 }}
                                                >
                                                    <Space
                                                        direction="vertical"
                                                        size={8}
                                                        style={{ width: "100%" }}
                                                    >
                                                        <Space wrap size={[8, 8]}>
                                                            <Tag color={getActivityTagColor(item.type)}>
                                                                {item.type === "created" ? "Created" : "Updated"}
                                                            </Tag>

                                                            <Text type="secondary" style={{ fontSize: 12 }}>
                                                                {formatDateTime(item.created_at)}
                                                            </Text>
                                                        </Space>

                                                        <Space
                                                            direction="vertical"
                                                            size={6}
                                                            style={{ width: "100%" }}
                                                        >
                                                            {lines.map((line, index) => (
                                                                <Text key={index}>{line}</Text>
                                                            ))}
                                                        </Space>

                                                        <Text type="secondary" style={{ fontSize: 12 }}>
                                                            By {item.created_by_name || item.created_by_email || "System"}
                                                        </Text>
                                                    </Space>
                                                </Card>
                                            ),
                                        };
                                    })}
                                />
                            ) : (
                                <Empty description="No timeline activity available" />
                            )}
                        </InfoCard>
                    </Space>
                </Col>

                <Col xs={24} xl={8}>
                    <Space direction="vertical" size={16} style={{ width: "100%" }}>
                        <InfoCard title="Schedule" icon={<CalendarOutlined />}>
                            <DetailItem label="Starts At" value={formatDateTime(primaryDate)} />
                            <DetailItem label="Ends At" value={formatDateTime(endDate)} />
                            <DetailItem label="Duration" value={getDuration(interaction)} />
                            <DetailItem label="Date" value={formatDate(primaryDate)} />
                        </InfoCard>

                        <InfoCard title="Contact" icon={<PhoneOutlined />}>
                            <DetailItem
                                label="Contact Name"
                                value={interaction?.contact_name || "—"}
                            />
                            <DetailItem label="Phone" value={interaction?.contact_phone || "—"} />
                            <DetailItem label="Email" value={interaction?.contact_email || "—"} />
                        </InfoCard>

                        <InfoCard title="Audit Info" icon={<UserOutlined />}>
                            <DetailItem
                                label="Created At"
                                value={formatDateTime(interaction?.created_at)}
                            />
                            <DetailItem
                                label="Created By"
                                value={interaction?.created_by_name || "—"}
                            />
                            <DetailItem
                                label="Updated At"
                                value={formatDateTime(interaction?.updated_at)}
                            />
                            <DetailItem
                                label="Updated By"
                                value={interaction?.updated_by_name || "—"}
                            />
                        </InfoCard>
                    </Space>
                </Col>
            </Row>
        </Space>
    );
}