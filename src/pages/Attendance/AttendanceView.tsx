import {
    CalendarOutlined,
    CheckCircleOutlined,
    ClockCircleOutlined,
    DownOutlined,
    LeftOutlined,
    MoreOutlined,
    RightOutlined,
} from "@ant-design/icons";
import {
    Badge,
    Button,
    Card,
    DatePicker,
    Dropdown,
    Space,
    Spin,
    Tag,
    Typography,
    message,
    theme,
    type MenuProps,
} from "antd";
import dayjs, { Dayjs } from "dayjs";
import isToday from "dayjs/plugin/isToday";
import weekday from "dayjs/plugin/weekday";
import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import {
    getAttendanceCalendar,
    getAttendanceHistory,
    getAttendanceMetrics,
    type AttendanceCalendarDay,
} from "../../redux/reducers/attendance.slice";
import type { AppDispatch, RootState } from "../../redux/store";
import AttendanceMovementMap from "./components/AttendanceMovementMap";

dayjs.extend(weekday);
dayjs.extend(isToday);

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

const WEEK_DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function buildCalendarDays(currentMonth: Dayjs) {
    const startOfMonth = currentMonth.startOf("month");
    const endOfMonth = currentMonth.endOf("month");
    const gridStart = startOfMonth.startOf("week");
    const gridEnd = endOfMonth.endOf("week");

    const days: Dayjs[] = [];
    let cursor = gridStart;

    while (cursor.isBefore(gridEnd) || cursor.isSame(gridEnd, "day")) {
        days.push(cursor);
        cursor = cursor.add(1, "day");
    }

    return days;
}

function formatMinutesToHours(minutes?: number) {
    const total = Math.max(0, minutes || 0);
    const hrs = Math.floor(total / 60);
    const mins = total % 60;
    return `${String(hrs).padStart(2, "0")}:${String(mins).padStart(2, "0")} Hrs`;
}

function getStatusView(day?: AttendanceCalendarDay, cellDate?: Dayjs, token?: any) {
    if (!day || !cellDate) return null;

    const today = dayjs().startOf("day");
    const currentDate = cellDate.startOf("day");

    if (currentDate.isAfter(today)) return null;

    switch (day.status) {
        case "present":
            return (
                <Space size={6}>
                    <CheckCircleOutlined style={{ color: token?.colorSuccess || "#16a34a" }} />
                    <Text style={{ color: token?.colorSuccess || "#16a34a", fontSize: 13 }}>
                        Present
                    </Text>
                </Space>
            );

        case "absent":
            return <Tag color="red">Absent</Tag>;

        case "leave":
            return <Tag color="blue">Leave</Tag>;

        case "holiday":
            return <Tag color="purple">Holiday</Tag>;

        case "weekly_off":
            return (
                <Text style={{ color: token?.colorText || "inherit", fontSize: 13 }}>
                    Weekly Off
                </Text>
            );

        case "pending":
            return <Tag color="gold">Pending</Tag>;

        default:
            return null;
    }
}

export default function AttendanceViewPage() {
    const dispatch = useDispatch<AppDispatch>();
    const { token } = theme.useToken();
    const { slug } = useParams();
    const navigate = useNavigate();

    const [currentMonth, setCurrentMonth] = useState(dayjs());

    const [trackRange, setTrackRange] = useState<[Dayjs | null, Dayjs | null] | null>(null);

    const {
        calendarData,
        calendarLoading,
        metrics,
        metricsLoading,
        refreshKey,
        historyList,
        historyLoading,
    } = useSelector((state: RootState) => state.attendance);

    const month = currentMonth.month() + 1;
    const year = currentMonth.year();

    const last7DaysFrom = useMemo(
        () => dayjs().subtract(6, "day").startOf("day").format("YYYY-MM-DD"),
        []
    );
    const last7DaysTo = useMemo(() => dayjs().endOf("day").format("YYYY-MM-DD"), []);

    const historyFrom =
        trackRange?.[0]?.startOf("day").format("YYYY-MM-DD") || last7DaysFrom;

    const historyTo =
        trackRange?.[1]?.endOf("day").format("YYYY-MM-DD") || last7DaysTo;

    useEffect(() => {
        dispatch(getAttendanceCalendar({ month, year }))
            .unwrap()
            .catch((err) => message.error(err || "Failed to load attendance calendar"));

        dispatch(getAttendanceMetrics({ month, year }))
            .unwrap()
            .catch((err) => message.error(err || "Failed to load attendance metrics"));
    }, [dispatch, month, year, refreshKey]);

    useEffect(() => {
        dispatch(
            getAttendanceHistory({
                page: 1,
                limit: 100,
                from: historyFrom,
                to: historyTo,
            })
        )
            .unwrap()
            .catch((err) => message.error(err || "Failed to load attendance history"));
    }, [dispatch, refreshKey, historyFrom, historyTo]);

    const attendanceMap = useMemo(() => {
        const map = new Map<string, AttendanceCalendarDay>();
        (calendarData?.days || []).forEach((item) => {
            map.set(dayjs(item.date).format("YYYY-MM-DD"), item);
        });
        return map;
    }, [calendarData]);

    const monthDays = useMemo(() => buildCalendarDays(currentMonth), [currentMonth]);

    const requestMenuItems: MenuProps["items"] = [{ key: "leave", label: "Leave" }];

    const handleRequestClick: MenuProps["onClick"] = () => {
        navigate(`/${slug}/leaves`);
    };

    const movementTitle = trackRange?.[0] && trackRange?.[1]
        ? `Movement Track (${trackRange[0].format("DD MMM YYYY")} - ${trackRange[1].format("DD MMM YYYY")})`
        : "Movement Track (Last 7 Days)";

    return (
        <div style={{ padding: 16 }}>
            <div
                style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: 12,
                    marginBottom: 16,
                    flexWrap: "wrap",
                }}
            >
                <Title level={4} style={{ margin: 0 }}>
                    Attendance
                </Title>

                <Dropdown menu={{ items: requestMenuItems, onClick: handleRequestClick }} trigger={["click"]}>
                    <Button>
                        <Space>
                            Request
                            <DownOutlined />
                        </Space>
                    </Button>
                </Dropdown>
            </div>

            <Card
                style={{ marginBottom: 16, borderRadius: 14 }}
                bodyStyle={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 16,
                    flexWrap: "wrap",
                }}
            >
                <Space size={32} wrap>
                    <Text strong>Metrics</Text>

                    <Space>
                        <Text type="secondary">Avg. Work Duration:</Text>
                        <Space>
                            <Badge color="#1677ff" />
                            <Text strong>
                                {metricsLoading ? "Loading..." : formatMinutesToHours(metrics?.avg_work_duration_minutes)}
                            </Text>
                        </Space>
                    </Space>

                    <Space>
                        <Text type="secondary">Avg. Late By:</Text>
                        <Space>
                            <Badge color="#faad14" />
                            <Text strong>
                                {metricsLoading ? "Loading..." : formatMinutesToHours(metrics?.avg_late_by_minutes)}
                            </Text>
                        </Space>
                    </Space>

                    <Space>
                        <Text type="secondary">Present Days:</Text>
                        <Text strong>{metrics?.present_days ?? 0}</Text>
                    </Space>
                </Space>

                <DownOutlined style={{ color: "#8c8c8c" }} />
            </Card>

            <Card style={{ borderRadius: 16 }}>
                <div
                    style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginBottom: 16,
                        gap: 12,
                        flexWrap: "wrap",
                    }}
                >
                    <Space>
                        <Button
                            type="text"
                            icon={<LeftOutlined />}
                            onClick={() => setCurrentMonth((prev) => prev.subtract(1, "month"))}
                        />
                        <Button
                            type="text"
                            icon={<RightOutlined />}
                            onClick={() => setCurrentMonth((prev) => prev.add(1, "month"))}
                        />
                        <Title level={5} style={{ margin: 0 }}>
                            {currentMonth.format("MMMM YYYY")}
                        </Title>
                    </Space>

                    <Space>
                        <Button type="default" icon={<CalendarOutlined />} />
                        <Button type="default" icon={<ClockCircleOutlined />} />
                        <Button type="text" icon={<MoreOutlined />} />
                    </Space>
                </div>

                {calendarLoading ? (
                    <div style={{ padding: "48px 0", textAlign: "center" }}>
                        <Spin />
                    </div>
                ) : (
                    <div
                        style={{
                            display: "grid",
                            gridTemplateColumns: "repeat(7, minmax(0, 1fr))",
                            borderTop: `1px solid ${token.colorBorder}`,
                            borderLeft: `1px solid ${token.colorBorder}`,
                        }}
                    >
                        {WEEK_DAYS.map((day) => (
                            <div
                                key={day}
                                style={{
                                    padding: "10px 12px",
                                    borderRight: `1px solid ${token.colorBorder}`,
                                    borderBottom: `1px solid ${token.colorBorder}`,
                                    textAlign: "center",
                                    fontWeight: 600,
                                    color: token.colorTextSecondary,
                                    background: token.colorBgContainer,
                                }}
                            >
                                {day}
                            </div>
                        ))}

                        {monthDays.map((date) => {
                            const dateKey = date.format("YYYY-MM-DD");
                            const attendance = attendanceMap.get(dateKey);
                            const inCurrentMonth = date.month() === currentMonth.month();
                            const today = dayjs().startOf("day");
                            const isFutureDate = date.startOf("day").isAfter(today);

                            return (
                                <div
                                    key={dateKey}
                                    style={{
                                        minHeight: 150,
                                        padding: 10,
                                        borderRight: `1px solid ${token.colorBorder}`,
                                        borderBottom: `1px solid ${token.colorBorder}`,
                                        background: inCurrentMonth ? token.colorBgContainer : token.colorBgLayout,
                                        opacity: inCurrentMonth ? 1 : 0.5,
                                    }}
                                >
                                    <div
                                        style={{
                                            fontSize: 14,
                                            color: date.isToday() ? token.colorPrimary : token.colorTextSecondary,
                                            fontWeight: date.isToday() ? 700 : 500,
                                            marginBottom: 8,
                                        }}
                                    >
                                        {date.date()}
                                    </div>

                                    <div style={{ marginBottom: 8 }}>{getStatusView(attendance, date, token)}</div>

                                    {!isFutureDate && attendance?.request_label ? (
                                        <Tag color="green" style={{ marginBottom: 8 }}>
                                            {attendance.request_label ? String(attendance.request_label) : ""}
                                        </Tag>
                                    ) : null}

                                    {!isFutureDate && attendance?.shift_label ? (
                                        <Text type="secondary" style={{ fontSize: 12 }}>
                                            {attendance.shift_label ? String(attendance.shift_label) : ""}
                                        </Text>
                                    ) : null}
                                </div>
                            );
                        })}
                    </div>
                )}
            </Card>

            <Card
                style={{ borderRadius: 16, marginTop: 16 }}
                bodyStyle={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: 12,
                    flexWrap: "wrap",
                }}
            >
                <div>
                    <Title level={5} style={{ margin: 0 }}>
                        User Track Filter
                    </Title>
                    <Text type="secondary">
                        Default: last 7 days. Select any range to load that period.
                    </Text>
                </div>

                <RangePicker
                    value={trackRange}
                    onChange={(values) => {
                        if (!values || values.length !== 2) {
                            setTrackRange(null);
                            return;
                        }
                        setTrackRange([values[0], values[1]]);
                    }}
                    format="DD MMM YYYY"
                    allowClear
                    disabledDate={(current) => current.isAfter(dayjs().endOf("day"))} // disable future dates
                    placeholder={["Start Date", "End Date"]}
                />
            </Card>

            <AttendanceMovementMap
                sessions={historyList || []}
                loading={historyLoading}
                title={movementTitle}
            />
        </div>
    );
}