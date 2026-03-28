import {
    CalendarOutlined,
    FireOutlined,
    InfoCircleOutlined,
    ThunderboltOutlined,
} from "@ant-design/icons";
import {
    Alert,
    Card,
    Col,
    Progress,
    Row,
    Skeleton,
    Space,
    Tag,
    Typography,
    theme,
} from "antd";
import type { LeadAIInsights } from "../../../redux/reducers/aiInsights.slice";

const { Title, Text } = Typography;

type Props = {
    data: LeadAIInsights | null;
    loading?: boolean;
    error?: string | null;
};

function getPriorityColor(priority?: string) {
    switch (priority) {
        case "high":
            return "red";
        case "medium":
            return "orange";
        case "low":
            return "blue";
        default:
            return "default";
    }
}

function getScoreStatus(score: number): "success" | "normal" | "exception" {
    if (score >= 80) return "success";
    if (score >= 50) return "normal";
    return "exception";
}

function getTemperatureColor(label?: string) {
    switch (label) {
        case "Hot":
            return "red";
        case "Warm":
            return "orange";
        case "Cold":
            return "blue";
        default:
            return "default";
    }
}

export default function AIInsightsCard({
    data,
    loading = false,
    error = null,
}: Props) {
    const { token } = theme.useToken();

    if (loading) {
        return (
            <Card
                title="AI Insights"
                bordered
                style={{
                    borderRadius: 16,
                }}
            >
                <Skeleton active paragraph={{ rows: 6 }} />
            </Card>
        );
    }

    if (error) {
        return (
            <Card
                title="AI Insights"
                bordered
                style={{
                    borderRadius: 16,
                }}
            >
                <Alert
                    type="error"
                    showIcon
                    message="Unable to load AI insights"
                    description={error}
                />
            </Card>
        );
    }

    if (!data) {
        return (
            <Card
                title="AI Insights"
                bordered
                style={{
                    borderRadius: 16,
                }}
            >
                <Alert
                    type="info"
                    showIcon
                    message="No insights available"
                    description="AI insights will appear once enough lead activity data is available."
                />
            </Card>
        );
    }

    const { nextBestAction, leadScore, reminderSuggestion } = data;

    return (
        <Card
            title="AI Insights"
            bordered
            style={{
                borderRadius: 16,
            }}
            bodyStyle={{
                padding: 16,
            }}
        >
            <Space direction="vertical" size={16} style={{ width: "100%" }}>
                <Card
                    size="small"
                    bordered={false}
                    style={{
                        background: token.colorFillAlter,
                        borderRadius: 14,
                    }}
                    bodyStyle={{ padding: 14 }}
                >
                    <Row gutter={[12, 12]} align="middle">
                        <Col flex="32px">
                            <ThunderboltOutlined
                                style={{
                                    fontSize: 20,
                                    color: token.colorPrimary,
                                }}
                            />
                        </Col>

                        <Col flex="auto">
                            <Space direction="vertical" size={4} style={{ width: "100%" }}>
                                <Space wrap>
                                    <Text strong>Next Best Action</Text>
                                    <Tag color={getPriorityColor(nextBestAction?.priority)}>
                                        {String(nextBestAction?.priority || "low").toUpperCase()}
                                    </Tag>
                                </Space>

                                <Text strong style={{ fontSize: 15 }}>
                                    {nextBestAction?.title || "—"}
                                </Text>

                                <Text type="secondary">
                                    {nextBestAction?.description || "—"}
                                </Text>
                            </Space>
                        </Col>
                    </Row>
                </Card>

                <Card
                    size="small"
                    bordered={false}
                    style={{
                        background: token.colorFillAlter,
                        borderRadius: 14,
                    }}
                    bodyStyle={{ padding: 14 }}
                >
                    <Row gutter={[16, 16]} align="middle">
                        <Col xs={24} md={8}>
                            <Space direction="vertical" size={8} style={{ width: "100%" }}>
                                <Space wrap>
                                    <FireOutlined
                                        style={{
                                            color: token.colorPrimary,
                                        }}
                                    />
                                    <Text strong>Lead Score</Text>
                                    <Tag color={getTemperatureColor(leadScore?.label)}>
                                        {leadScore?.label || "Cold"}
                                    </Tag>
                                </Space>

                                <div>
                                    <Title level={3} style={{ margin: 0 }}>
                                        {leadScore?.score ?? 0}/100
                                    </Title>
                                </div>

                                <Progress
                                    percent={leadScore?.score ?? 0}
                                    status={getScoreStatus(leadScore?.score ?? 0)}
                                    showInfo={false}
                                />
                            </Space>
                        </Col>

                        <Col xs={24} md={16}>
                            <Space direction="vertical" size={8} style={{ width: "100%" }}>
                                <Space>
                                    <InfoCircleOutlined
                                        style={{
                                            color: token.colorTextSecondary,
                                        }}
                                    />
                                    <Text strong>Why this score?</Text>
                                </Space>

                                <Space direction="vertical" size={6} style={{ width: "100%" }}>
                                    {(leadScore?.reasons || []).length ? (
                                        leadScore.reasons.map((reason, index) => (
                                            <div
                                                key={`${reason}-${index}`}
                                                style={{
                                                    padding: "8px 10px",
                                                    borderRadius: 10,
                                                    background: token.colorBgElevated,
                                                    border: `1px solid ${token.colorBorderSecondary}`,
                                                }}
                                            >
                                                <Text>{reason}</Text>
                                            </div>
                                        ))
                                    ) : (
                                        <Text type="secondary">No score reasons available.</Text>
                                    )}
                                </Space>
                            </Space>
                        </Col>
                    </Row>
                </Card>

                <Card
                    size="small"
                    bordered={false}
                    style={{
                        background: token.colorFillAlter,
                        borderRadius: 14,
                    }}
                    bodyStyle={{ padding: 14 }}
                >
                    <Row gutter={[12, 12]} align="middle">
                        <Col flex="32px">
                            <CalendarOutlined
                                style={{
                                    fontSize: 20,
                                    color: token.colorPrimary,
                                }}
                            />
                        </Col>

                        <Col flex="auto">
                            <Space direction="vertical" size={4} style={{ width: "100%" }}>
                                <Space wrap>
                                    <Text strong>Reminder Suggestion</Text>
                                    <Tag color={reminderSuggestion?.shouldCreateReminder ? "gold" : "default"}>
                                        {reminderSuggestion?.shouldCreateReminder ? "SUGGESTED" : "NOT NEEDED"}
                                    </Tag>
                                </Space>

                                <Text strong style={{ fontSize: 15 }}>
                                    {reminderSuggestion?.dueLabel || "No reminder planned"}
                                </Text>

                                <Text type="secondary">
                                    {reminderSuggestion?.reason || "—"}
                                </Text>
                            </Space>
                        </Col>
                    </Row>
                </Card>
            </Space>
        </Card>
    );
}