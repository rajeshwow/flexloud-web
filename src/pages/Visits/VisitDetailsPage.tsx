import {
    AimOutlined,
    ArrowLeftOutlined,
    CalendarOutlined,
    ClockCircleOutlined,
    DollarOutlined,
    EditOutlined,
    EnvironmentOutlined,
    UserOutlined
} from "@ant-design/icons";
import {
    Alert,
    Button,
    Card,
    Col,
    Divider,
    Empty,
    Row,
    Skeleton,
    Space,
    Spin,
    Tag,
    Timeline,
    Tooltip,
    Typography,
    theme,
} from "antd";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { useEffect, useMemo } from "react";
import { MapContainer, Marker, Polyline, Popup, TileLayer } from "react-leaflet";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { getVisitById, resetVisitDetailsState } from "../../redux/reducers/visits.slice";
import type { AppDispatch, RootState } from "../../redux/store";

dayjs.extend(relativeTime);

const { Title, Text } = Typography;

type RouteParams = {
    id?: string;
    slug?: string;
};

function formatDateTime(value?: string | null) {
    if (!value) return "-";
    return dayjs(value).format("DD MMM YYYY, hh:mm A");
}

function formatCurrency(value?: number | null) {
    return `₹${Number(value || 0).toLocaleString("en-IN")}`;
}

function getStatusColor(status?: string | null) {
    const key = String(status || "").toLowerCase();
    if (["completed", "done", "closed"].includes(key)) return "green";
    if (["in_progress", "ongoing", "working"].includes(key)) return "blue";
    if (["pending", "scheduled"].includes(key)) return "gold";
    if (["cancelled", "rejected"].includes(key)) return "red";
    return "default";
}

function getTicketStatusColor(status?: string | null) {
    const key = String(status || "").toLowerCase();
    if (["closed", "resolved", "done"].includes(key)) return "green";
    if (["open", "pending"].includes(key)) return "gold";
    if (["in_progress", "working"].includes(key)) return "processing";
    return "default";
}

function SummaryItem({
    label,
    value,
    span = 24,
}: {
    label: string;
    value: React.ReactNode;
    span?: number;
}) {
    return (
        <Col xs={24} md={12} xl={span}>
            <div
                style={{
                    border: "1px solid var(--fl-border, #f0f0f0)",
                    borderRadius: 14,
                    padding: 14,
                    height: "100%",
                    background: "var(--fl-panel, #fff)",
                }}
            >
                <div style={{ marginBottom: 6 }}>
                    <Text type="secondary">{label}</Text>
                </div>
                <div>
                    <Text strong>{value || "-"}</Text>
                </div>
            </div>
        </Col>
    );
}

function StatCard({
    title,
    value,
    icon,
    hint,
}: {
    title: string;
    value: React.ReactNode;
    icon: React.ReactNode;
    hint?: React.ReactNode;
}) {
    return (
        <Card
            bordered={false}
            style={{
                borderRadius: 20,
                height: "100%",
            }}
            bodyStyle={{ padding: 18 }}
        >
            <Space align="start" style={{ width: "100%", justifyContent: "space-between" }}>
                <div>
                    <Text type="secondary">{title}</Text>
                    <div style={{ marginTop: 6 }}>
                        <Title level={4} style={{ margin: 0 }}>
                            {value}
                        </Title>
                    </div>
                    {hint ? <div style={{ marginTop: 6 }}><Text type="secondary">{hint}</Text></div> : null}
                </div>

                <div
                    style={{
                        width: 42,
                        height: 42,
                        borderRadius: 14,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        background: "var(--fl-primary-soft, rgba(22,119,255,0.10))",
                        fontSize: 18,
                    }}
                >
                    {icon}
                </div>
            </Space>
        </Card>
    );
}

export default function VisitDetailsPage() {
    const dispatch = useDispatch<AppDispatch>();
    const navigate = useNavigate();
    const { token } = theme.useToken();
    const { id, slug } = useParams<RouteParams>();

    const { selectedVisit, detailsLoading } = useSelector(
        (state: RootState) => state.visits,
    );

    useEffect(() => {
        if (id) {
            dispatch(getVisitById(id));
        }

        return () => {
            dispatch(resetVisitDetailsState());
        };
    }, [dispatch, id]);

    const mapData = useMemo(() => {
        const checkin =
            selectedVisit?.checkin_latitude != null && selectedVisit?.checkin_longitude != null
                ? [Number(selectedVisit.checkin_latitude), Number(selectedVisit.checkin_longitude)] as [number, number]
                : null;

        const checkout =
            selectedVisit?.checkout_latitude != null && selectedVisit?.checkout_longitude != null
                ? [Number(selectedVisit.checkout_latitude), Number(selectedVisit.checkout_longitude)] as [number, number]
                : null;

        const center = checkin || checkout || [26.9124, 75.7873]; // fallback Jaipur
        return { checkin, checkout, center };
    }, [selectedVisit]);

    const durationHours = useMemo(() => {
        const mins = Number(selectedVisit?.duration_in_minutes || 0);
        if (!mins) return 0;
        return mins / 60;
    }, [selectedVisit]);

    const costPerHour = useMemo(() => {
        const total = Number(selectedVisit?.total_cost || 0);
        if (!total || !durationHours) return 0;
        return total / durationHours;
    }, [selectedVisit, durationHours]);

    const highestCostHead = useMemo(() => {
        const heads = [
            { key: "Spare", value: Number(selectedVisit?.spare_cost || 0) },
            { key: "Employee", value: Number(selectedVisit?.employee_cost || 0) },
            { key: "Travel", value: Number(selectedVisit?.travelling_cost || 0) },
            { key: "Other", value: Number(selectedVisit?.other_cost || 0) },
        ].sort((a, b) => b.value - a.value);

        return heads[0]?.value ? `${heads[0].key} (${formatCurrency(heads[0].value)})` : "-";
    }, [selectedVisit]);

    const timelineItems = useMemo(() => {
        if (!selectedVisit) return [];

        const items = [];

        if (selectedVisit.created_at) {
            items.push({
                color: "blue",
                children: (
                    <div>
                        <Text strong>Visit created</Text>
                        <div>
                            <Text type="secondary">
                                {selectedVisit.created_by_name || "System"} • {formatDateTime(selectedVisit.created_at)}
                            </Text>
                        </div>
                    </div>
                ),
            });
        }

        if (selectedVisit.start_date) {
            items.push({
                color: "green",
                children: (
                    <div>
                        <Text strong>Visit started / scheduled</Text>
                        <div>
                            <Text type="secondary">{formatDateTime(selectedVisit.start_date)}</Text>
                        </div>
                    </div>
                ),
            });
        }

        if (selectedVisit.checkin_address || mapData.checkin) {
            items.push({
                color: "cyan",
                children: (
                    <div>
                        <Text strong>Check-in captured</Text>
                        <div>
                            <Text type="secondary">{selectedVisit.checkin_address || "Location coordinates available"}</Text>
                        </div>
                    </div>
                ),
            });
        }

        if (selectedVisit.checkout_address || mapData.checkout) {
            items.push({
                color: "purple",
                children: (
                    <div>
                        <Text strong>Checkout captured</Text>
                        <div>
                            <Text type="secondary">{selectedVisit.checkout_address || "Location coordinates available"}</Text>
                        </div>
                    </div>
                ),
            });
        }

        if (selectedVisit.end_date) {
            items.push({
                color: "green",
                children: (
                    <div>
                        <Text strong>Visit ended</Text>
                        <div>
                            <Text type="secondary">{formatDateTime(selectedVisit.end_date)}</Text>
                        </div>
                    </div>
                ),
            });
        }

        if (selectedVisit.next_followup_date) {
            items.push({
                color: "gold",
                children: (
                    <div>
                        <Text strong>Follow-up planned</Text>
                        <div>
                            <Text type="secondary">
                                {formatDateTime(selectedVisit.next_followup_date)}
                            </Text>
                        </div>
                    </div>
                ),
            });
        }

        if (selectedVisit.updated_at) {
            items.push({
                color: "gray",
                children: (
                    <div>
                        <Text strong>Last updated</Text>
                        <div>
                            <Text type="secondary">
                                {selectedVisit.updated_by_name || "System"} • {formatDateTime(selectedVisit.updated_at)}
                            </Text>
                        </div>
                    </div>
                ),
            });
        }

        return items;
    }, [selectedVisit, mapData]);

    const insights = useMemo(() => {
        if (!selectedVisit) return [];

        const arr: string[] = [];
        const now = dayjs();

        if (selectedVisit.next_followup_date && dayjs(selectedVisit.next_followup_date).isBefore(now)) {
            arr.push("Follow-up date has already passed.");
        }

        if (selectedVisit.start_date && selectedVisit.end_date && Number(selectedVisit.duration_in_minutes || 0) < 15) {
            arr.push("Visit duration is very short. Recheck if time or status needs review.");
        }

        if ((selectedVisit.checkin_latitude || selectedVisit.checkin_longitude) && !selectedVisit.checkin_address) {
            arr.push("Check-in coordinates exist but check-in address is missing.");
        }

        if ((selectedVisit.checkout_latitude || selectedVisit.checkout_longitude) && !selectedVisit.checkout_address) {
            arr.push("Checkout coordinates exist but checkout address is missing.");
        }

        if (Number(selectedVisit.travelling_cost || 0) > Number(selectedVisit.total_cost || 0) * 0.5 && Number(selectedVisit.total_cost || 0) > 0) {
            arr.push("Travelling cost is more than 50% of total visit cost.");
        }

        if (!selectedVisit.remarks) {
            arr.push("Remarks are empty. Add a meaningful summary for better tracking.");
        }

        return arr;
    }, [selectedVisit]);

    const openGoogleMap = (lat?: number | null, lng?: number | null) => {
        if (lat == null || lng == null) return;
        window.open(`https://www.google.com/maps?q=${lat},${lng}`, "_blank");
    };

    return (
        <div>
            <Spin spinning={detailsLoading}>
                {!selectedVisit ? (
                    // <Card bordered={false} style={{ borderRadius: 20 }}>
                    //     <Empty description="Visit details not found" />
                    // </Card>
                    //show here loader or skelton
                    <Skeleton active />
                ) : (
                    <Space direction="vertical" size={16} style={{ width: "100%" }}>
                        <Card
                            bordered={false}
                            style={{
                                borderRadius: 24,
                                overflow: "hidden",
                                background: token.colorBgContainer,
                            }}
                            bodyStyle={{ padding: 20 }}
                        >
                            <Row gutter={[16, 16]} align="middle" justify="space-between">
                                <Col xs={24} lg={16}>
                                    <Space direction="vertical" size={10} style={{ width: "100%" }}>
                                        <Space wrap>
                                            <Button
                                                icon={<ArrowLeftOutlined />}
                                                onClick={() => navigate(`/${slug}/visits`)}
                                            >
                                                Back
                                            </Button>
                                            <Button
                                                type="primary"
                                                icon={<EditOutlined />}
                                                onClick={() => navigate(`/${slug}/visits/${selectedVisit.id}/edit`)}
                                            >
                                                Edit
                                            </Button>
                                        </Space>

                                        <div>
                                            <Title level={2} style={{ margin: 0 }}>
                                                {selectedVisit.name || "Visit Details"}
                                            </Title>
                                            <Text type="secondary">
                                                Premium visit overview with schedule, costs, map and journey timeline
                                            </Text>
                                        </div>

                                        <Space wrap>
                                            <Tag color={getStatusColor(selectedVisit.status)}>{selectedVisit.status || "No Status"}</Tag>
                                            <Tag color={getTicketStatusColor(selectedVisit.ticket_status)}>
                                                {selectedVisit.ticket_status || "No Ticket Status"}
                                            </Tag>
                                            <Tag>{selectedVisit.regarding || "No Regarding"}</Tag>
                                            {selectedVisit.assigned_to_name ? (
                                                <Tag icon={<UserOutlined />}>{selectedVisit.assigned_to_name}</Tag>
                                            ) : null}
                                        </Space>
                                    </Space>
                                </Col>

                                <Col xs={24} lg={8}>
                                    <Card>
                                        <Space direction="vertical" size={8} style={{ width: "100%" }}>
                                            <Text type="secondary">Quick visit health</Text>
                                            <Space wrap>
                                                <Tag icon={<ClockCircleOutlined />}>
                                                    {selectedVisit.duration || "No Duration"}
                                                </Tag>
                                                <Tag icon={<DollarOutlined />}>
                                                    {formatCurrency(selectedVisit.total_cost)}
                                                </Tag>
                                                <Tag icon={<CalendarOutlined />}>
                                                    {selectedVisit.next_followup_date
                                                        ? dayjs(selectedVisit.next_followup_date).fromNow()
                                                        : "No Follow-up"}
                                                </Tag>
                                            </Space>

                                            <Space wrap>
                                                {mapData.checkin ? (
                                                    <Button
                                                        icon={<EnvironmentOutlined />}
                                                        onClick={() =>
                                                            openGoogleMap(
                                                                selectedVisit.checkin_latitude,
                                                                selectedVisit.checkin_longitude,
                                                            )
                                                        }
                                                    >
                                                        Open Check-in Map
                                                    </Button>
                                                ) : null}

                                                {mapData.checkout ? (
                                                    <Button
                                                        icon={<AimOutlined />}
                                                        onClick={() =>
                                                            openGoogleMap(
                                                                selectedVisit.checkout_latitude,
                                                                selectedVisit.checkout_longitude,
                                                            )
                                                        }
                                                    >
                                                        Open Checkout Map
                                                    </Button>
                                                ) : null}
                                            </Space>
                                        </Space>
                                    </Card>

                                </Col>
                            </Row>
                        </Card>

                        <Row gutter={[16, 16]}>
                            <Col xs={24} md={12} xl={6}>
                                <StatCard
                                    title="Duration"
                                    value={selectedVisit.duration || "-"}
                                    hint={
                                        selectedVisit.start_date && selectedVisit.end_date
                                            ? `${formatDateTime(selectedVisit.start_date)} → ${formatDateTime(selectedVisit.end_date)}`
                                            : "Duration auto-calculated"
                                    }
                                    icon={<ClockCircleOutlined />}
                                />
                            </Col>

                            <Col xs={24} md={12} xl={6}>
                                <StatCard
                                    title="Total Cost"
                                    value={formatCurrency(selectedVisit.total_cost)}
                                    hint={`Per hour: ${formatCurrency(costPerHour)}`}
                                    icon={<DollarOutlined />}
                                />
                            </Col>

                            <Col xs={24} md={12} xl={6}>
                                <StatCard
                                    title="Follow-up"
                                    value={
                                        selectedVisit.next_followup_date
                                            ? dayjs(selectedVisit.next_followup_date).format("DD MMM YYYY")
                                            : "-"
                                    }
                                    hint={
                                        selectedVisit.next_followup_date
                                            ? dayjs(selectedVisit.next_followup_date).fromNow()
                                            : "No next follow-up"
                                    }
                                    icon={<CalendarOutlined />}
                                />
                            </Col>

                            <Col xs={24} md={12} xl={6}>
                                <StatCard
                                    title="Route Coverage"
                                    value={
                                        mapData.checkin && mapData.checkout
                                            ? "Check-in + Checkout"
                                            : mapData.checkin || mapData.checkout
                                                ? "Partial Location"
                                                : "No Location"
                                    }
                                    hint={
                                        mapData.checkin && mapData.checkout
                                            ? "Journey path available"
                                            : "Limited route visibility"
                                    }
                                    icon={<EnvironmentOutlined />}
                                />
                            </Col>
                        </Row>

                        <Row gutter={[16, 16]}>
                            <Col xs={24} xl={16}>
                                <Card
                                    title="Visit Summary"
                                    bordered={false}
                                    style={{ borderRadius: 20 }}
                                >
                                    <Row gutter={[12, 12]}>
                                        <SummaryItem label="Assigned To" value={selectedVisit.assigned_to_name || "-"} span={8} />
                                        <SummaryItem label="Regarding" value={selectedVisit.regarding || "-"} span={8} />
                                        <SummaryItem label="Ticket Status" value={selectedVisit.ticket_status || "-"} span={8} />
                                        <SummaryItem label="Start Date" value={formatDateTime(selectedVisit.start_date)} span={8} />
                                        <SummaryItem label="End Date" value={formatDateTime(selectedVisit.end_date)} span={8} />
                                        <SummaryItem label="Next Follow-up" value={formatDateTime(selectedVisit.next_followup_date)} span={8} />
                                        <SummaryItem label="Organization" value={selectedVisit.organization_name || "-"} span={6} />
                                        <SummaryItem label="Contact" value={selectedVisit.contact_name || "-"} span={6} />
                                        <SummaryItem label="Lead" value={selectedVisit.lead_name || "-"} span={6} />
                                        <SummaryItem label="Case" value={selectedVisit.case_name || "-"} span={6} />
                                        <SummaryItem label="Created By" value={selectedVisit.created_by_name || "-"} span={8} />
                                        <SummaryItem label="Updated By" value={selectedVisit.updated_by_name || "-"} span={8} />
                                        <SummaryItem
                                            label="Remarks"
                                            value={selectedVisit.remarks || "-"}
                                            span={24}
                                        />
                                    </Row>
                                </Card>
                            </Col>

                            <Col xs={24} xl={8}>
                                <Card
                                    title="Visit Insights"
                                    bordered={false}
                                    style={{ borderRadius: 20, height: "100%" }}
                                >
                                    <Space direction="vertical" size={12} style={{ width: "100%" }}>
                                        <Alert
                                            type="info"
                                            showIcon
                                            message={`Highest cost head: ${highestCostHead}`}
                                        />

                                        {insights.length ? (
                                            insights.map((item, index) => (
                                                <Alert
                                                    key={index}
                                                    type="warning"
                                                    showIcon
                                                    message={item}
                                                />
                                            ))
                                        ) : (
                                            <Alert
                                                type="success"
                                                showIcon
                                                message="This visit looks well-tracked based on current data."
                                            />
                                        )}
                                    </Space>
                                </Card>
                            </Col>
                        </Row>

                        <Row gutter={[16, 16]}>
                            <Col xs={24} xl={10}>
                                <Card
                                    title="Cost Breakdown"
                                    bordered={false}
                                    style={{ borderRadius: 20, height: "100%" }}
                                >
                                    <Row gutter={[12, 12]}>
                                        <SummaryItem label="Spare Cost" value={formatCurrency(selectedVisit.spare_cost)} span={12} />
                                        <SummaryItem label="Employee Cost" value={formatCurrency(selectedVisit.employee_cost)} span={12} />
                                        <SummaryItem label="Travelling Cost" value={formatCurrency(selectedVisit.travelling_cost)} span={12} />
                                        <SummaryItem label="Other Cost" value={formatCurrency(selectedVisit.other_cost)} span={12} />
                                        <SummaryItem label="Total Cost" value={formatCurrency(selectedVisit.total_cost)} span={24} />
                                    </Row>
                                </Card>
                            </Col>

                            <Col xs={24} xl={14}>
                                <Card
                                    title="Location & Route Map"
                                    bordered={false}
                                    style={{ borderRadius: 20, height: "100%" }}
                                    extra={
                                        <Space>
                                            {mapData.checkin ? (
                                                <Tooltip title="Open check-in in Google Maps">
                                                    <Button
                                                        size="small"
                                                        onClick={() =>
                                                            openGoogleMap(
                                                                selectedVisit.checkin_latitude,
                                                                selectedVisit.checkin_longitude,
                                                            )
                                                        }
                                                    >
                                                        Check-in
                                                    </Button>
                                                </Tooltip>
                                            ) : null}
                                            {mapData.checkout ? (
                                                <Tooltip title="Open checkout in Google Maps">
                                                    <Button
                                                        size="small"
                                                        onClick={() =>
                                                            openGoogleMap(
                                                                selectedVisit.checkout_latitude,
                                                                selectedVisit.checkout_longitude,
                                                            )
                                                        }
                                                    >
                                                        Checkout
                                                    </Button>
                                                </Tooltip>
                                            ) : null}
                                        </Space>
                                    }
                                >
                                    {mapData.checkin || mapData.checkout ? (
                                        <div
                                            style={{
                                                height: 360,
                                                borderRadius: 18,
                                                overflow: "hidden",
                                            }}
                                        >
                                            <MapContainer
                                                center={mapData.center}
                                                zoom={13}
                                                scrollWheelZoom={true}
                                                style={{ height: "100%", width: "100%" }}
                                            >
                                                <TileLayer
                                                    attribution='&copy; OpenStreetMap contributors'
                                                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                                />

                                                {mapData.checkin ? (
                                                    <Marker position={mapData.checkin}>
                                                        <Popup>
                                                            <div>
                                                                <strong>Check-in</strong>
                                                                <br />
                                                                {selectedVisit.checkin_address || "Address not available"}
                                                            </div>
                                                        </Popup>
                                                    </Marker>
                                                ) : null}

                                                {mapData.checkout ? (
                                                    <Marker position={mapData.checkout}>
                                                        <Popup>
                                                            <div>
                                                                <strong>Checkout</strong>
                                                                <br />
                                                                {selectedVisit.checkout_address || "Address not available"}
                                                            </div>
                                                        </Popup>
                                                    </Marker>
                                                ) : null}

                                                {mapData.checkin && mapData.checkout ? (
                                                    <Polyline positions={[mapData.checkin, mapData.checkout]} />
                                                ) : null}
                                            </MapContainer>
                                        </div>
                                    ) : (
                                        <Empty description="No map coordinates available for this visit" />
                                    )}

                                    <Divider />

                                    <Row gutter={[12, 12]}>
                                        <SummaryItem label="Check-in Address" value={selectedVisit.checkin_address || "-"} span={12} />
                                        <SummaryItem label="Checkout Address" value={selectedVisit.checkout_address || "-"} span={12} />
                                        <SummaryItem
                                            label="Check-in Coordinates"
                                            value={
                                                selectedVisit.checkin_latitude != null && selectedVisit.checkin_longitude != null
                                                    ? `${selectedVisit.checkin_latitude}, ${selectedVisit.checkin_longitude}`
                                                    : "-"
                                            }
                                            span={12}
                                        />
                                        <SummaryItem
                                            label="Checkout Coordinates"
                                            value={
                                                selectedVisit.checkout_latitude != null && selectedVisit.checkout_longitude != null
                                                    ? `${selectedVisit.checkout_latitude}, ${selectedVisit.checkout_longitude}`
                                                    : "-"
                                            }
                                            span={12}
                                        />
                                    </Row>
                                </Card>
                            </Col>
                        </Row>

                        <Card
                            title="Visit Journey Timeline"
                            bordered={false}
                            style={{ borderRadius: 20 }}
                        >
                            {timelineItems.length ? (
                                <Timeline items={timelineItems} />
                            ) : (
                                <Empty description="No timeline data available" />
                            )}
                        </Card>
                    </Space>
                )}
            </Spin>
        </div>
    );
}