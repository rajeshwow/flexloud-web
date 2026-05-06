import {
    EnvironmentOutlined,
    LoginOutlined,
    LogoutOutlined,
} from "@ant-design/icons";
import {
    Button,
    Card,
    Input,
    Space,
    Typography,
    message,
    theme,
} from "antd";
import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
    checkOutGeoVisit,
    createGeoVisit,
    fetchGeoVisits,
} from "../../../redux/reducers/geoVisits.slice";
import type { AppDispatch, RootState } from "../../../redux/store";

const { Text } = Typography;
const { TextArea } = Input;

type Props = {
    moduleName: "lead" | "contact" | "organization" | "task" | "interaction" | "attendance";
    recordId: string;
    title?: string;
};

type BrowserLocation = {
    lat: number;
    lng: number;
    accuracy?: number | null;
};

function getCurrentPositionAsync(): Promise<BrowserLocation> {
    return new Promise((resolve, reject) => {
        if (!navigator.geolocation) {
            reject(new Error("Geolocation is not supported in this browser"));
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                resolve({
                    lat: position.coords.latitude,
                    lng: position.coords.longitude,
                    accuracy: position.coords.accuracy ?? null,
                });
            },
            (error) => {
                reject(new Error(error.message || "Unable to get current location"));
            },
            {
                enableHighAccuracy: true,
                timeout: 15000,
                maximumAge: 0,
            }
        );
    });
}


async function reverseGeocode(lat: number, lng: number): Promise<string | null> {
    console.log("lat", lat);
    console.log("lng", lng);
    try {
        const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`,
            {
                headers: {
                    Accept: "application/json",
                },
            }
        );

        if (!response.ok) return null;

        const data = await response.json();
        return data?.display_name || null;
    } catch (error) {
        console.error("reverseGeocode error", error);
        return null;
    }
}

export default function GeoVisitActionCard({
    moduleName,
    recordId,
    title = "Geo Visit",
}: Props) {
    const dispatch = useDispatch<AppDispatch>();
    const { token } = theme.useToken();

    const { list, currentOpenVisit, loading, createLoading, checkOutLoading } =
        useSelector((state: RootState) => state.geoVisits);

    const [notes, setNotes] = useState("");

    useEffect(() => {
        if (!recordId) return;

        dispatch(
            fetchGeoVisits({
                module_name: moduleName,
                record_id: recordId,
                limit: 20,
                offset: 0,
            })
        );
    }, [dispatch, moduleName, recordId]);

    const openVisitForThisRecord = useMemo(() => {
        return (
            list.find(
                (item) =>
                    item.module_name === moduleName &&
                    item.record_id === recordId &&
                    item.status === "checked_in" &&
                    !item.check_out_at
            ) || currentOpenVisit
        );
    }, [list, moduleName, recordId, currentOpenVisit]);

    const handleCheckIn = async () => {
        try {
            const location = await getCurrentPositionAsync();
            const currentAddress = await reverseGeocode(location.lat, location.lng);

            await dispatch(
                createGeoVisit({
                    module_name: moduleName,
                    record_id: recordId,
                    check_in_lat: location.lat,
                    check_in_lng: location.lng,
                    check_in_address: currentAddress,
                    notes: notes?.trim() || null,
                    metadata: {
                        source: "browser",
                        captured_at: new Date().toISOString(),
                        accuracy_meters: location.accuracy ?? null,
                    },
                })
            ).unwrap();

            message.success("Checked in successfully");
            setNotes("");

            dispatch(
                fetchGeoVisits({
                    module_name: moduleName,
                    record_id: recordId,
                    limit: 20,
                    offset: 0,
                })
            );
        } catch (error: any) {
            message.error(error || "Failed to check in");
        }
    };

    const handleCheckOut = async () => {
        try {
            if (!openVisitForThisRecord?.id) {
                message.warning("No active visit found");
                return;
            }

            const location = await getCurrentPositionAsync();
            const currentAddress = await reverseGeocode(location.lat, location.lng);

            await dispatch(
                checkOutGeoVisit({
                    id: openVisitForThisRecord.id,
                    check_out_lat: location.lat,
                    check_out_lng: location.lng,
                    check_out_address: currentAddress,
                    notes: notes?.trim() || null,
                })
            ).unwrap();

            message.success("Checked out successfully");
            setNotes("");

            dispatch(
                fetchGeoVisits({
                    module_name: moduleName,
                    record_id: recordId,
                    limit: 20,
                    offset: 0,
                })
            );
        } catch (error: any) {
            message.error(error || "Failed to check out");
        }
    };

    return (
        <Card
            title={
                <Space>
                    <EnvironmentOutlined />
                    <span>{title}</span>
                </Space>
            }
            style={{
                borderRadius: 16,
                background: token.colorBgContainer,
            }}
            loading={loading}
        >
            <Space direction="vertical" size={14} style={{ width: "100%" }}>
                {openVisitForThisRecord ? (
                    <div
                        style={{
                            padding: 12,
                            borderRadius: 12,
                            background: token.colorSuccessBg,
                            border: `1px solid ${token.colorSuccessBorder}`,
                        }}
                    >
                        <Text strong>Active visit in progress</Text>

                        <div style={{ marginTop: 4 }}>
                            Check-in time:{" "}
                            {new Date(openVisitForThisRecord.check_in_at).toLocaleString("en-IN", {
                                day: "2-digit",
                                month: "short",
                                year: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                            })}
                        </div>

                        {openVisitForThisRecord.check_in_address ? (
                            <div style={{ marginTop: 4 }}>
                                Check-in address: {openVisitForThisRecord.check_in_address}
                            </div>
                        ) : null}
                    </div>
                ) : (
                    <div
                        style={{
                            padding: 12,
                            borderRadius: 12,
                            background: token.colorInfoBg,
                            border: `1px solid ${token.colorInfoBorder}`,
                        }}
                    >
                        <Text>No active visit</Text>
                    </div>
                )}

                <TextArea
                    rows={3}
                    placeholder="Add visit note"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                />

                <Space wrap>
                    {!openVisitForThisRecord ? (
                        <Button
                            type="primary"
                            icon={<LoginOutlined />}
                            loading={createLoading}
                            onClick={handleCheckIn}
                        >
                            Check In
                        </Button>
                    ) : (
                        <Button
                            danger
                            icon={<LogoutOutlined />}
                            loading={checkOutLoading}
                            onClick={handleCheckOut}
                        >
                            Check Out
                        </Button>
                    )}
                </Space>
            </Space>
        </Card>
    );
}