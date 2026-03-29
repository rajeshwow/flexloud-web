import { EnvironmentOutlined } from "@ant-design/icons";
import { Card, Empty, Space, Timeline, Typography, theme } from "antd";
import { useMemo } from "react";
import { useSelector } from "react-redux";
import type { RootState } from "../../../redux/store";

const { Text } = Typography;

type Props = {
    moduleName: "lead" | "contact" | "organization" | "task" | "interaction" | "attendance";
    recordId: string;
};

function formatDateTime(value?: string | null) {
    if (!value) return "—";
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return String(value);

    return d.toLocaleString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
}

export default function GeoVisitTimeline({ moduleName, recordId }: Props) {
    const { token } = theme.useToken();
    const { list, loading } = useSelector((state: RootState) => state.geoVisits);

    const filteredList = useMemo(() => {
        return (list || []).filter(
            (item) => item.module_name === moduleName && item.record_id === recordId
        );
    }, [list, moduleName, recordId]);

    return (
        <Card
            title="Geo Visit Timeline"
            style={{ borderRadius: 16, background: token.colorBgContainer }}
            loading={loading}
        >
            {!filteredList.length ? (
                <Empty description="No geo visits found" />
            ) : (
                <Timeline
                    items={filteredList.map((item) => ({
                        color: item.status === "checked_out" ? "green" : "blue",
                        children: (
                            <Space direction="vertical" size={4} style={{ width: "100%" }}>
                                <Space>
                                    <EnvironmentOutlined />
                                    <Text strong>
                                        {item.status === "checked_out" ? "Visit completed" : "Visit started"}
                                    </Text>
                                </Space>

                                <Text type="secondary">
                                    Check-in: {formatDateTime(item.check_in_at)}
                                </Text>

                                {item.check_out_at ? (
                                    <Text type="secondary">
                                        Check-out: {formatDateTime(item.check_out_at)}
                                    </Text>
                                ) : null}

                                {item.check_in_address ? (
                                    <Text>Check-in address: {item.check_in_address}</Text>
                                ) : null}

                                {item.check_out_address ? (
                                    <Text>Check-out address: {item.check_out_address}</Text>
                                ) : null}

                                {item.distance_from_target_meters !== null ? (
                                    <Text>
                                        Distance from target:{" "}
                                        {Number(item.distance_from_target_meters).toFixed(2)} meters
                                    </Text>
                                ) : null}

                                {item.notes ? <Text>Notes: {item.notes}</Text> : null}
                            </Space>
                        ),
                    }))}
                />
            )}
        </Card>
    );
}