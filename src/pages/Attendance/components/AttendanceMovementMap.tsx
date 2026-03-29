import { EnvironmentOutlined, LoginOutlined, LogoutOutlined } from "@ant-design/icons";
import { Card, Empty, List, Space, Tag, Typography } from "antd";
import L from "leaflet";
import { useMemo } from "react";
import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";
import type { AttendanceSession } from "../../../redux/reducers/attendance.slice";

const { Text } = Typography;

type Props = {
    sessions: AttendanceSession[];
    loading?: boolean;
    title?: string;
};

type TrackPoint = {
    id: string;
    type: "clock_in" | "clock_out";
    lat: number;
    lng: number;
    address?: string | null;
    attendance_date: string;
    time?: string | null;
    remarks?: string | null;
};

const clockInIcon = new L.Icon({
    iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
    iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
});

const clockOutIcon = new L.Icon({
    iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png",
    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
});

function formatDateTime(value?: string | null) {
    if (!value) return "—";
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return "—";

    return d.toLocaleString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
}

export default function AttendanceMovementMap({
    sessions,
    loading,
    title = "Movement Track",
}: Props) {
    const points = useMemo<TrackPoint[]>(() => {
        const result: TrackPoint[] = [];

        for (const session of sessions || []) {
            if (session.clock_in_lat != null && session.clock_in_lng != null) {
                result.push({
                    id: `${session.id}-in`,
                    type: "clock_in",
                    lat: Number(session.clock_in_lat),
                    lng: Number(session.clock_in_lng),
                    address: session.clock_in_address,
                    attendance_date: session.attendance_date,
                    time: session.clock_in_at,
                    remarks: session.remarks,
                });
            }

            if (session.clock_out_lat != null && session.clock_out_lng != null) {
                result.push({
                    id: `${session.id}-out`,
                    type: "clock_out",
                    lat: Number(session.clock_out_lat),
                    lng: Number(session.clock_out_lng),
                    address: session.clock_out_address,
                    attendance_date: session.attendance_date,
                    time: session.clock_out_at,
                    remarks: session.remarks,
                });
            }
        }

        return result.sort((a, b) => {
            const aTime = a.time ? new Date(a.time).getTime() : 0;
            const bTime = b.time ? new Date(b.time).getTime() : 0;
            return bTime - aTime;
        });
    }, [sessions]);

    const mapCenter: [number, number] = useMemo(() => {
        if (points.length) return [points[0].lat, points[0].lng];
        return [28.6139, 77.209];
    }, [points]);

    const totalClockIns = points.filter((p) => p.type === "clock_in").length;
    const totalClockOuts = points.filter((p) => p.type === "clock_out").length;

    return (
        <Card
            title={title}
            loading={loading}
            style={{ borderRadius: 16, marginTop: 16 }}
            extra={
                <Space wrap>
                    <Tag color="green">Clock In: {totalClockIns}</Tag>
                    <Tag color="red">Clock Out: {totalClockOuts}</Tag>
                </Space>
            }
        >
            {!points.length ? (
                <Empty description="No location data found for selected range" />
            ) : (
                <div
                    style={{
                        display: "grid",
                        gridTemplateColumns: "1.4fr 1fr",
                        gap: 16,
                    }}
                >
                    <div
                        style={{
                            borderRadius: 16,
                            overflow: "hidden",
                            minHeight: 420,
                            border: "1px solid #f0f0f0",
                        }}
                    >
                        <MapContainer
                            center={mapCenter}
                            zoom={12}
                            style={{ height: 420, width: "100%" }}
                            scrollWheelZoom
                        >
                            <TileLayer
                                attribution='&copy; OpenStreetMap contributors'
                                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                            />

                            {points.map((point) => (
                                <Marker
                                    key={point.id}
                                    position={[point.lat, point.lng]}
                                    icon={point.type === "clock_in" ? clockInIcon : clockOutIcon}
                                >
                                    <Popup>
                                        <div style={{ minWidth: 220 }}>
                                            <div style={{ fontWeight: 600, marginBottom: 6 }}>
                                                {point.type === "clock_in" ? "Clock In" : "Clock Out"}
                                            </div>
                                            <div>Date: {point.attendance_date}</div>
                                            <div>Time: {formatDateTime(point.time)}</div>
                                            <div>
                                                Location: {point.lat}, {point.lng}
                                            </div>
                                            {point.address ? <div>Address: {point.address}</div> : null}
                                            {point.remarks ? <div>Remarks: {point.remarks}</div> : null}
                                        </div>
                                    </Popup>
                                </Marker>
                            ))}
                        </MapContainer>
                    </div>

                    <div style={{ maxHeight: 420, overflow: "auto", paddingRight: 4 }}>
                        <List
                            dataSource={points}
                            renderItem={(point) => (
                                <List.Item key={point.id}>
                                    <div style={{ width: "100%" }}>
                                        <Space style={{ marginBottom: 6 }} wrap>
                                            {point.type === "clock_in" ? <LoginOutlined /> : <LogoutOutlined />}
                                            <Text strong>
                                                {point.type === "clock_in" ? "Clock In" : "Clock Out"}
                                            </Text>
                                            <Tag color={point.type === "clock_in" ? "green" : "red"}>
                                                {formatDateTime(point.time)}
                                            </Tag>
                                        </Space>

                                        {/* <div>
                                            <Text type="secondary">{formatDateTime(point.time)}</Text>
                                        </div> */}

                                        {point.address ? (
                                            <div style={{ marginTop: 4 }}>
                                                <Space align="start">
                                                    <EnvironmentOutlined />
                                                    <Text>{point.address}</Text>
                                                </Space>
                                            </div>
                                        ) : (
                                            <div style={{ marginTop: 4 }}>
                                                <Text type="secondary">
                                                    {point.lat}, {point.lng}
                                                </Text>
                                            </div>
                                        )}

                                        {point.remarks ? (
                                            <div style={{ marginTop: 4 }}>
                                                <Text type="secondary">Remarks: {point.remarks}</Text>
                                            </div>
                                        ) : null}
                                    </div>
                                </List.Item>
                            )}
                        />
                    </div>
                </div>
            )}
        </Card>
    );
}