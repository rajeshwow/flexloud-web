import {
    BulbOutlined,
    ExclamationCircleOutlined,
    FireOutlined,
    ReloadOutlined,
    RobotOutlined,
} from "@ant-design/icons";
import {
    Button,
    Card,
    Divider,
    List,
    Space,
    Tag,
    Typography,
    theme,
} from "antd";

const { Text, Title } = Typography;

type Props = {
    loading?: boolean;
    data?: {
        summary: string;
        priority: "hot" | "warm" | "cold";
        sentiment: "positive" | "neutral" | "negative";
        confidence: number;
        risk_flags: string[];
        next_best_actions: string[];
        suggested_task: {
            title: string;
            due_in_days: number;
            note: string;
        } | null;
        generated_at?: string;
        is_cached?: boolean;
    } | null;
    onRefresh?: () => void;
    onGenerateFollowup?: () => void;
    onSummarizeActivities?: () => void;
};

function getPriorityTag(priority?: string) {
    switch (priority) {
        case "hot":
            return <Tag color="red">HOT</Tag>;
        case "warm":
            return <Tag color="orange">WARM</Tag>;
        default:
            return <Tag color="blue">COLD</Tag>;
    }
}

export default function AIInsightCard({
    loading,
    data,
    onRefresh,
    onGenerateFollowup,
    onSummarizeActivities,
}: Props) {
    const { token } = theme.useToken();

    return (
        <Card
            loading={loading}
            title={
                <Space>
                    <RobotOutlined />
                    <span>AI Assistant</span>
                </Space>
            }
            extra={
                <Button
                    icon={<ReloadOutlined />}
                    onClick={onRefresh}
                    size="small"
                >
                    Refresh
                </Button>
            }
            style={{
                borderRadius: 16,
            }}
        >
            {!data ? (
                <Text type="secondary">No AI insight available yet.</Text>
            ) : (
                <Space direction="vertical" size={14} style={{ width: "100%" }}>
                    <div>
                        <Space align="center" wrap>
                            {getPriorityTag(data.priority)}
                            <Tag>{data.sentiment}</Tag>
                            <Tag>{Math.round(data.confidence || 0)}% confidence</Tag>
                            {data.is_cached ? <Tag color="default">cached</Tag> : <Tag color="green">fresh</Tag>}
                        </Space>
                    </div>

                    <div>
                        <Title level={5} style={{ marginBottom: 6 }}>
                            Summary
                        </Title>
                        <Text>{data.summary}</Text>
                    </div>

                    <Divider style={{ margin: "6px 0" }} />

                    <div>
                        <Title level={5} style={{ marginBottom: 8 }}>
                            <Space>
                                <ExclamationCircleOutlined style={{ color: token.colorWarning }} />
                                <span>Risks</span>
                            </Space>
                        </Title>
                        {data.risk_flags?.length ? (
                            <List
                                size="small"
                                dataSource={data.risk_flags}
                                renderItem={(item) => <List.Item>{item}</List.Item>}
                            />
                        ) : (
                            <Text type="secondary">No major risks detected.</Text>
                        )}
                    </div>

                    <Divider style={{ margin: "6px 0" }} />

                    <div>
                        <Title level={5} style={{ marginBottom: 8 }}>
                            <Space>
                                <BulbOutlined style={{ color: token.colorPrimary }} />
                                <span>Next Best Actions</span>
                            </Space>
                        </Title>
                        {data.next_best_actions?.length ? (
                            <List
                                size="small"
                                dataSource={data.next_best_actions}
                                renderItem={(item) => <List.Item>{item}</List.Item>}
                            />
                        ) : (
                            <Text type="secondary">No action suggestions available.</Text>
                        )}
                    </div>

                    {data.suggested_task ? (
                        <>
                            <Divider style={{ margin: "6px 0" }} />
                            <div>
                                <Title level={5} style={{ marginBottom: 8 }}>
                                    <Space>
                                        <FireOutlined />
                                        <span>Suggested Task</span>
                                    </Space>
                                </Title>
                                <Text strong>{data.suggested_task.title}</Text>
                                <br />
                                <Text type="secondary">
                                    Due in {data.suggested_task.due_in_days} day(s)
                                </Text>
                                <br />
                                <Text>{data.suggested_task.note}</Text>
                            </div>
                        </>
                    ) : null}

                    <Divider style={{ margin: "8px 0" }} />

                    <Space wrap>
                        <Button type="primary" onClick={onGenerateFollowup}>
                            Generate Follow-up
                        </Button>
                        <Button onClick={onSummarizeActivities}>Summarize Activities</Button>
                    </Space>
                </Space>
            )}
        </Card>
    );
}