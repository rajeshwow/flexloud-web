import {
    AlertOutlined,
    ClockCircleOutlined,
    RiseOutlined,
    WarningOutlined,
} from "@ant-design/icons";
import { Card, Col, Row, Typography, theme } from "antd";

const { Text, Title } = Typography;

type Summary = {
    total_today: number;
    total_overdue: number;
    total_upcoming: number;
    total_needs_attention: number;
} | null;

type Props = {
    summary: Summary;
};

type CardItem = {
    title: string;
    value: number;
    icon: React.ReactNode;
    hint: string;
    tone: "error" | "warning" | "info" | "orange";
};

export default function MyDaySummaryCards({ summary }: Props) {
    const { token } = theme.useToken();

    const items: CardItem[] = [
        {
            title: "Overdue",
            value: summary?.total_overdue || 0,
            icon: <WarningOutlined />,
            hint: "Requires quick action",
            tone: "error",
        },
        {
            title: "Due Today",
            value: summary?.total_today || 0,
            icon: <ClockCircleOutlined />,
            hint: "Planned for today",
            tone: "warning",
        },
        {
            title: "Upcoming",
            value: summary?.total_upcoming || 0,
            icon: <RiseOutlined />,
            hint: "Coming up next",
            tone: "info",
        },
        {
            title: "Need Attention",
            value: summary?.total_needs_attention || 0,
            icon: <AlertOutlined />,
            hint: "Watch these items",
            tone: "orange",
        },
    ];

    const getToneColor = (tone: CardItem["tone"]) => {
        switch (tone) {
            case "error":
                return token.colorError;
            case "warning":
                return token.colorWarning;
            case "info":
                return token.colorInfo;
            case "orange":
                return "#d97706";
            default:
                return token.colorPrimary;
        }
    };

    return (
        <Row gutter={[16, 16]}>
            {items.map((item) => {
                const toneColor = getToneColor(item.tone);

                return (
                    <Col xs={24} sm={12} lg={6} key={item.title}>
                        <Card
                            bordered={false}
                            style={{
                                borderRadius: Number(token.borderRadiusLG) + 6,
                                background: token.colorBgElevated,
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
                                    alignItems: "flex-start",
                                    justifyContent: "space-between",
                                    gap: 12,
                                }}
                            >
                                <div>
                                    <Text style={{ color: token.colorTextSecondary, fontSize: 13 }}>
                                        {item.title}
                                    </Text>

                                    <Title level={2} style={{ margin: "8px 0 4px", lineHeight: 1 }}>
                                        {item.value}
                                    </Title>

                                    <Text type="secondary" style={{ fontSize: 12 }}>
                                        {item.hint}
                                    </Text>
                                </div>

                                <div
                                    style={{
                                        width: 42,
                                        height: 42,
                                        borderRadius: Number(token.borderRadiusLG),
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        background: token.colorFillSecondary,
                                        border: `1px solid ${token.colorBorderSecondary}`,
                                        color: toneColor,
                                        fontSize: 18,
                                        flexShrink: 0,
                                    }}
                                >
                                    {item.icon}
                                </div>
                            </div>

                            <div
                                style={{
                                    marginTop: 14,
                                    height: 4,
                                    borderRadius: 999,
                                    background: token.colorFillSecondary,
                                    overflow: "hidden",
                                }}
                            >
                                <div
                                    style={{
                                        width: `${Math.min((item.value || 0) * 18, 100)}%`,
                                        height: "100%",
                                        borderRadius: 999,
                                        background: toneColor,
                                    }}
                                />
                            </div>
                        </Card>
                    </Col>
                );
            })}
        </Row>
    );
}