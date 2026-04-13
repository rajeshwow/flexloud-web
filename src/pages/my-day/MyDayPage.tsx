import { CalendarOutlined, ReloadOutlined } from "@ant-design/icons";
import { Button, Segmented, Space, Typography, theme } from "antd";
import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
    fetchMyDay,
    fetchMyDayCounts,
} from "../../redux/reducers/myDay.slice";
import type { AppDispatch, RootState } from "../../redux/store";
import MyDaySummaryCards from "./components/MyDaySummaryCards";
import WorkQueueSection from "./components/WorkQueueSection";

const { Title, Text } = Typography;

type ViewType = "all" | "today" | "overdue" | "upcoming";

export default function MyDayPage() {
    const dispatch = useDispatch<AppDispatch>();
    const { token } = theme.useToken();
    const { data, loading, counts } = useSelector((state: RootState) => state.myDay);

    const [view, setView] = useState<ViewType>("all");

    const loadData = async () => {
        await dispatch(fetchMyDay({ view, assigned: "me" }));
        await dispatch(fetchMyDayCounts({ assigned: "me" }));
    };

    useEffect(() => {
        loadData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [view]);

    const summary = useMemo(() => {
        if (data?.summary) return data.summary;

        return {
            total_today: counts?.today || 0,
            total_overdue: counts?.overdue || 0,
            total_upcoming: counts?.upcoming || 0,
            total_needs_attention: counts?.needs_attention || 0,
        };
    }, [data, counts]);

    const sections = useMemo(() => {
        return {
            overdue: data?.sections?.overdue || [],
            today: data?.sections?.today || [],
            upcoming: data?.sections?.upcoming || [],
            needs_attention: data?.sections?.needs_attention || [],
        };
    }, [data]);

    const totalItems =
        sections.overdue.length +
        sections.today.length +
        sections.upcoming.length +
        sections.needs_attention.length;

    return (
        <Space direction="vertical" size={18} style={{ width: "100%" }}>
            <div
                style={{
                    borderRadius: Number(token.borderRadiusLG) + 8,
                    padding: 20,
                    background: token.colorBgContainer,
                    border: `1px solid ${token.colorBorderSecondary}`,
                    boxShadow: token.boxShadowTertiary,
                }}
            >
                <Space direction="vertical" size={20} style={{ width: "100%" }}>
                    <div
                        style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "flex-start",
                            gap: 12,
                            flexWrap: "wrap",
                        }}
                    >
                        <div>
                            <Title level={2} style={{ margin: 0, marginBottom: 6 }}>
                                My Day
                            </Title>

                            <Text type="secondary" style={{ fontSize: 14 }}>
                                Your smart work queue for followups, tasks, visits, and expiring items
                            </Text>

                            <div style={{ marginTop: 10 }}>
                                <Space size={8} wrap>
                                    <span
                                        style={{
                                            display: "inline-flex",
                                            alignItems: "center",
                                            gap: 8,
                                            padding: "6px 12px",
                                            borderRadius: 999,
                                            background: token.colorFillTertiary,
                                            color: token.colorTextSecondary,
                                            fontSize: 13,
                                            border: `1px solid ${token.colorBorderSecondary}`,
                                        }}
                                    >
                                        <CalendarOutlined />
                                        {totalItems} active queue item{totalItems === 1 ? "" : "s"}
                                    </span>
                                </Space>
                            </div>
                        </div>

                        <Space wrap size={10}>
                            <Segmented
                                value={view}
                                onChange={(val) => setView(val as ViewType)}
                                options={[
                                    { label: "All", value: "all" },
                                    { label: "Today", value: "today" },
                                    { label: "Overdue", value: "overdue" },
                                    { label: "Upcoming", value: "upcoming" },
                                ]}
                            />

                            <Button
                                icon={<ReloadOutlined />}
                                onClick={loadData}
                                loading={loading}
                                style={{ borderRadius: token.borderRadius }}
                            >
                                Refresh
                            </Button>
                        </Space>
                    </div>

                    <MyDaySummaryCards summary={summary} />

                    <WorkQueueSection
                        title="Overdue"
                        subtitle="Items that need immediate attention"
                        items={sections.overdue}
                        accent="error"
                    />

                    <WorkQueueSection
                        title="Due Today"
                        subtitle="Things lined up for today"
                        items={sections.today}
                        accent="warning"
                    />

                    <WorkQueueSection
                        title="Upcoming"
                        subtitle="Planned work queued for the next steps"
                        items={sections.upcoming}
                        accent="info"
                    />

                    <WorkQueueSection
                        title="Need Attention"
                        subtitle="Important items that may slip without review"
                        items={sections.needs_attention}
                        accent="orange"
                    />
                </Space>
            </div>
        </Space>
    );
}