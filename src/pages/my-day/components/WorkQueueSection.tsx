import { Empty, Space, Typography, theme } from "antd";
import type { WorkQueueItem } from "../../../redux/reducers/myDay.slice";
import WorkQueueItemCard from "./WorkQueueItemCard";

const { Title, Text } = Typography;

type Props = {
    title: string;
    subtitle?: string;
    items?: WorkQueueItem[];
    accent?: "error" | "warning" | "info" | "orange";
};

export default function WorkQueueSection({
    title,
    subtitle,
    items = [],
    accent = "info",
}: Props) {
    const { token } = theme.useToken();

    const getAccentColor = () => {
        switch (accent) {
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

    const accentColor = getAccentColor();

    return (
        <div
            style={{
                borderRadius: Number(token.borderRadiusLG) + 8,
                padding: 18,
                background: token.colorBgLayout,
                border: `1px solid ${token.colorBorderSecondary}`,
            }}
        >
            <div
                style={{
                    display: "flex",
                    alignItems: "flex-start",
                    justifyContent: "space-between",
                    gap: 12,
                    marginBottom: 16,
                }}
            >
                <div>
                    <Title level={3} style={{ margin: 0, marginBottom: 4 }}>
                        {title}
                    </Title>

                    {subtitle ? (
                        <Text type="secondary" style={{ fontSize: 13 }}>
                            {subtitle}
                        </Text>
                    ) : null}
                </div>

                <div
                    style={{
                        width: 10,
                        minWidth: 10,
                        height: 10,
                        marginTop: 8,
                        borderRadius: 999,
                        background: accentColor,
                        boxShadow: `0 0 0 4px ${token.colorFillSecondary}`,
                    }}
                />
            </div>

            {items.length ? (
                <Space direction="vertical" size={14} style={{ width: "100%" }}>
                    {items.map((item) => (
                        <WorkQueueItemCard key={item.id} item={item} />
                    ))}
                </Space>
            ) : (
                <div
                    style={{
                        minHeight: 170,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        borderRadius: Number(token.borderRadiusLG) + 4,
                        background: token.colorBgContainer,
                        border: `1px dashed ${token.colorBorder}`,
                    }}
                >
                    <Empty
                        description={
                            <span style={{ color: token.colorTextSecondary }}>
                                No {title.toLowerCase()} items
                            </span>
                        }
                    />
                </div>
            )}
        </div>
    );
}