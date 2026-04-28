import {
    AimOutlined,
    CalendarOutlined,
    ClockCircleOutlined,
    DollarOutlined,
    EnvironmentOutlined,
    InfoCircleOutlined,
    LoadingOutlined,
    UserOutlined,
} from "@ant-design/icons";
import {
    Button,
    Card,
    Col,
    DatePicker,
    Form,
    Input,
    InputNumber,
    message,
    Row,
    Select,
    Space,
    Tag,
    Typography,
} from "antd";
import dayjs from "dayjs";
import { useEffect, useMemo, useState } from "react";
import { MapContainer, Marker, Polyline, Popup, TileLayer } from "react-leaflet";
import { useDispatch, useSelector } from "react-redux";
import { fetchContacts } from "../../../redux/reducers/contacts.slice";
import { fetchLeads } from "../../../redux/reducers/leads.slice";
import { getOrganization } from "../../../redux/reducers/organization.slice";
import { getUsers } from "../../../redux/reducers/user.slice";
import type { AppDispatch, RootState } from "../../../redux/store";
import { toTitleCase } from "../../../shared/Utils/utils";
import {
    calculateDurationInMinutes,
    formatDuration,
    getTotalCost,
    toDayjs,
    VISIT_REGARDING_OPTIONS,
    VISIT_STATUS_OPTIONS,
    VISIT_TICKET_STATUS_OPTIONS,
} from "../utils/visitForm.utils";

const { TextArea } = Input;
const { Title, Text } = Typography;

type Props = {
    form: any;
    initialValues?: any;
    isEdit?: boolean;
};

type CaptureType = "checkin" | "checkout";

function SectionCard({
    title,
    icon,
    subtitle,
    children,
}: {
    title: string;
    icon?: React.ReactNode;
    subtitle?: string;
    children: React.ReactNode;
}) {
    return (
        <Card
            bordered={false}
            style={{ borderRadius: 20 }}
            bodyStyle={{ padding: 20 }}
        >
            <Space direction="vertical" size={4} style={{ width: "100%", marginBottom: 16 }}>
                <Space size={10}>
                    <div
                        style={{
                            width: 38,
                            height: 38,
                            borderRadius: 12,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            background: "var(--fl-primary-soft, rgba(22,119,255,0.10))",
                            fontSize: 16,
                        }}
                    >
                        {icon}
                    </div>

                    <div>
                        <Title level={5} style={{ margin: 0 }}>
                            {title}
                        </Title>
                        {subtitle ? <Text type="secondary">{subtitle}</Text> : null}
                    </div>
                </Space>
            </Space>

            {children}
        </Card>
    );
}

async function reverseGeocode(lat: number, lng: number) {
    const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`,
        {
            headers: {
                Accept: "application/json",
            },
        },
    );

    if (!response.ok) {
        throw new Error("Unable to fetch address from coordinates");
    }

    const data = await response.json();
    return data?.display_name || "";
}

function formatDateTime(value?: string | null) {
    if (!value) return "-";
    return dayjs(value).format("DD/MM/YYYY hh:mm A");
}

export default function VisitForm({
    form,
    initialValues,
    isEdit = false,
}: Props) {
    const dispatch = useDispatch<AppDispatch>();
    const [capturing, setCapturing] = useState<CaptureType | null>(null);

    const startDate = Form.useWatch("start_date", form);
    const endDate = Form.useWatch("end_date", form);
    const spareCost = Form.useWatch("spare_cost", form);
    const employeeCost = Form.useWatch("employee_cost", form);
    const travellingCost = Form.useWatch("travelling_cost", form);
    const otherCost = Form.useWatch("other_cost", form);

    const checkinLat = Form.useWatch("checkin_latitude", form);
    const checkinLng = Form.useWatch("checkin_longitude", form);
    const checkoutLat = Form.useWatch("checkout_latitude", form);
    const checkoutLng = Form.useWatch("checkout_longitude", form);
    const checkinCapturedAt = Form.useWatch("checkin_captured_at", form);
    const checkoutCapturedAt = Form.useWatch("checkout_captured_at", form);

    const { orgList } = useSelector((state: RootState) => state.organization);
    const { userList } = useSelector((state: RootState) => state.users);
    const { contactList } = useSelector((state: RootState) => state.contacts);
    const { leads } = useSelector((state: RootState) => state.leads);

    useEffect(() => {
        dispatch(getOrganization({ page: 1, limit: 1000 }));
        dispatch(getUsers({ page: 1, limit: 1000 }));
        dispatch(fetchContacts({ page: 1, limit: 1000 }));
        dispatch(fetchLeads());
    }, [dispatch]);

    const usersOptions = useMemo(
        () =>
            (userList || []).map((item: any) => ({
                label: toTitleCase(item.name || item.full_name || item.email),
                value: item.id,
            })),
        [userList],
    );

    const organizationOptions = useMemo(
        () =>
            (orgList || []).map((item: any) => ({
                label: item.name,
                value: item.id,
            })),
        [orgList],
    );

    const contactOptions = useMemo(
        () =>
            (contactList || []).map((item: any) => ({
                label:
                    [item.first_name, item.last_name].filter(Boolean).join(" ") ||
                    item.email ||
                    item.phone,
                value: item.id,
            })),
        [contactList],
    );

    const leadOptions = useMemo(
        () =>
            (leads || []).map((item: any) => ({
                label:
                    [item.first_name, item.last_name].filter(Boolean).join(" ") ||
                    item.organization_name ||
                    item.mobile,
                value: item.id,
            })),
        [leads],
    );

    const durationInMinutes = useMemo(() => {
        return calculateDurationInMinutes(startDate, endDate);
    }, [startDate, endDate]);

    const durationText = useMemo(() => {
        return formatDuration(durationInMinutes);
    }, [durationInMinutes]);

    const totalCost = useMemo(() => {
        return getTotalCost({
            spare_cost: spareCost,
            employee_cost: employeeCost,
            travelling_cost: travellingCost,
            other_cost: otherCost,
        });
    }, [spareCost, employeeCost, travellingCost, otherCost]);

    useEffect(() => {
        form.setFieldsValue({
            duration: durationText,
            duration_in_minutes: durationInMinutes,
            total_cost: totalCost,
        });
    }, [durationText, durationInMinutes, totalCost, form]);

    useEffect(() => {
        if (!initialValues) return;

        form.setFieldsValue({
            ...initialValues,
            start_date: toDayjs(initialValues.start_date),
            end_date: toDayjs(initialValues.end_date),
            next_followup_date: toDayjs(initialValues.next_followup_date),
            checkin_captured_at: toDayjs(initialValues.checkin_captured_at),
            checkout_captured_at: toDayjs(initialValues.checkout_captured_at),
        });
    }, [initialValues, form]);

    const captureLocation = async (type: CaptureType) => {
        if (!navigator.geolocation) {
            message.error("Geolocation is not supported in this browser");
            return;
        }

        try {
            setCapturing(type);

            const position = await new Promise<GeolocationPosition>((resolve, reject) => {
                navigator.geolocation.getCurrentPosition(resolve, reject, {
                    enableHighAccuracy: true,
                    timeout: 15000,
                    maximumAge: 0,
                });
            });

            const lat = Number(position.coords.latitude.toFixed(7));
            const lng = Number(position.coords.longitude.toFixed(7));

            let address = "";
            try {
                address = await reverseGeocode(lat, lng);
            } catch {
                address = "";
            }

            const now = dayjs();

            if (type === "checkin") {
                form.setFieldsValue({
                    checkin_latitude: lat,
                    checkin_longitude: lng,
                    checkin_address: address || form.getFieldValue("checkin_address"),
                    checkin_captured_at: now,
                });
                message.success("Check-in location captured");
            } else {
                form.setFieldsValue({
                    checkout_latitude: lat,
                    checkout_longitude: lng,
                    checkout_address: address || form.getFieldValue("checkout_address"),
                    checkout_captured_at: now,
                });
                message.success("Checkout location captured");
            }
        } catch (error: any) {
            if (error?.code === 1) {
                message.error("Location permission denied");
            } else if (error?.code === 2) {
                message.error("Location unavailable");
            } else if (error?.code === 3) {
                message.error("Location request timed out");
            } else {
                message.error("Unable to capture location");
            }
        } finally {
            setCapturing(null);
        }
    };

    const mapState = useMemo(() => {
        const checkin =
            checkinLat != null && checkinLng != null
                ? [Number(checkinLat), Number(checkinLng)] as [number, number]
                : null;

        const checkout =
            checkoutLat != null && checkoutLng != null
                ? [Number(checkoutLat), Number(checkoutLng)] as [number, number]
                : null;

        const center = checkin || checkout || [26.9124, 75.7873];
        return { checkin, checkout, center };
    }, [checkinLat, checkinLng, checkoutLat, checkoutLng]);

    return (
        <Space direction="vertical" size={16} style={{ width: "100%" }}>
            <SectionCard
                title="Basic Information"
                subtitle="Primary visit details, ownership and scheduling"
                icon={<InfoCircleOutlined />}
            >
                <Row gutter={[16, 16]}>
                    <Col xs={24} md={12} xl={8}>
                        <Form.Item
                            label="Name"
                            name="name"
                            rules={[{ required: true, message: "Please enter name" }]}
                        >
                            <Input placeholder="Enter visit name" />
                        </Form.Item>
                    </Col>

                    <Col xs={24} md={12} xl={8}>
                        <Form.Item label="Status" name="status">
                            <Select
                                placeholder="Select status"
                                options={VISIT_STATUS_OPTIONS}
                                allowClear
                            />
                        </Form.Item>
                    </Col>

                    <Col xs={24} md={12} xl={8}>
                        <Form.Item
                            label="Regarding"
                            name="regarding"
                            rules={[{ required: true, message: "Please select regarding" }]}
                        >
                            <Select
                                placeholder="Select regarding"
                                options={VISIT_REGARDING_OPTIONS}
                                allowClear
                            />
                        </Form.Item>
                    </Col>

                    <Col xs={24} md={12} xl={8}>
                        <Form.Item label="Ticket Status" name="ticket_status">
                            <Select
                                placeholder="Select ticket status"
                                options={VISIT_TICKET_STATUS_OPTIONS}
                                allowClear
                            />
                        </Form.Item>
                    </Col>

                    <Col xs={24} md={12} xl={8}>
                        <Form.Item label="Assigned To" name="assigned_to_user_id">
                            <Select
                                placeholder="Select user"
                                options={usersOptions}
                                allowClear
                                showSearch
                                optionFilterProp="label"
                            />
                        </Form.Item>
                    </Col>

                    <Col xs={24} md={12} xl={8}>
                        <Form.Item label="Organization" name="organization_id">
                            <Select
                                placeholder="Select organization"
                                options={organizationOptions}
                                allowClear
                                showSearch
                                optionFilterProp="label"
                            />
                        </Form.Item>
                    </Col>

                    <Col xs={24} md={12} xl={8}>
                        <Form.Item label="Contact" name="contact_id">
                            <Select
                                placeholder="Select contact"
                                options={contactOptions}
                                allowClear
                                showSearch
                                optionFilterProp="label"
                            />
                        </Form.Item>
                    </Col>

                    <Col xs={24} md={12} xl={8}>
                        <Form.Item label="Lead" name="lead_id">
                            <Select
                                placeholder="Select lead"
                                options={leadOptions}
                                allowClear
                                showSearch
                                optionFilterProp="label"
                            />
                        </Form.Item>
                    </Col>

                    <Col xs={24} md={12} xl={8}>
                        <Form.Item label="Case ID" name="case_id">
                            <Input placeholder="Enter case id if available" />
                        </Form.Item>
                    </Col>

                    <Col xs={24}>
                        <Form.Item
                            label="Remarks"
                            name="remarks"
                            rules={[{ required: true, message: "Please enter remarks" }]}
                        >
                            <TextArea rows={5} placeholder="Enter visit remarks / summary" />
                        </Form.Item>
                    </Col>
                </Row>
            </SectionCard>

            <SectionCard
                title="Schedule & Follow-up"
                subtitle="Timing, duration and next action planning"
                icon={<CalendarOutlined />}
            >
                <Row gutter={[16, 16]}>
                    <Col xs={24} md={12} xl={8}>
                        <Form.Item label="Start Date" name="start_date">
                            <DatePicker
                                showTime
                                format="DD/MM/YYYY hh:mm A"
                                style={{ width: "100%" }}
                            />
                        </Form.Item>
                    </Col>

                    <Col xs={24} md={12} xl={8}>
                        <Form.Item label="End Date" name="end_date">
                            <DatePicker
                                showTime
                                format="DD/MM/YYYY hh:mm A"
                                style={{ width: "100%" }}
                            />
                        </Form.Item>
                    </Col>

                    <Col xs={24} md={12} xl={8}>
                        <Form.Item
                            label="Next Follow-up Date"
                            name="next_followup_date"
                            rules={[
                                {
                                    required: true,
                                    message: "Please select next followup date",
                                },
                            ]}
                        >
                            <DatePicker
                                showTime
                                format="DD/MM/YYYY hh:mm A"
                                style={{ width: "100%" }}
                            />
                        </Form.Item>
                    </Col>

                    <Col xs={24} md={12} xl={8}>
                        <Form.Item label="Duration" name="duration">
                            <Input disabled placeholder="Auto calculated" />
                        </Form.Item>
                    </Col>

                    <Col xs={24} md={12} xl={8}>
                        <Form.Item label="Duration In Minutes" name="duration_in_minutes">
                            <InputNumber
                                disabled
                                style={{ width: "100%" }}
                                placeholder="Auto calculated"
                            />
                        </Form.Item>
                    </Col>

                    <Col xs={24} md={12} xl={8}>
                        <div
                            style={{
                                height: "100%",
                                minHeight: 78,
                                border: "1px dashed var(--fl-border, #d9d9d9)",
                                borderRadius: 14,
                                padding: 12,
                                display: "flex",
                                flexDirection: "column",
                                justifyContent: "center",
                            }}
                        >
                            <Text type="secondary">Quick Summary</Text>
                            <Space wrap style={{ marginTop: 8 }}>
                                <Tag>{durationText || "No Duration"}</Tag>
                                <Tag color="blue">
                                    {startDate ? dayjs(startDate).format("DD MMM YYYY") : "No Start"}
                                </Tag>
                                <Tag color="gold">
                                    {form.getFieldValue("next_followup_date")
                                        ? dayjs(form.getFieldValue("next_followup_date")).format("DD MMM YYYY")
                                        : "No Follow-up"}
                                </Tag>
                            </Space>
                        </div>
                    </Col>
                </Row>
            </SectionCard>

            <SectionCard
                title="Location Details"
                subtitle="Use live location to auto-fill address, coordinates and capture time"
                icon={<EnvironmentOutlined />}
            >
                <Row gutter={[16, 16]}>
                    <Col xs={24}>
                        <Space wrap>
                            <Button
                                type="primary"
                                icon={capturing === "checkin" ? <LoadingOutlined /> : <AimOutlined />}
                                loading={capturing === "checkin"}
                                onClick={() => captureLocation("checkin")}
                            >
                                {checkinLat && checkinLng ? "Re-capture Check-in" : "Capture Check-in"}
                            </Button>

                            <Button
                                icon={capturing === "checkout" ? <LoadingOutlined /> : <AimOutlined />}
                                loading={capturing === "checkout"}
                                onClick={() => captureLocation("checkout")}
                            >
                                {checkoutLat && checkoutLng ? "Re-capture Checkout" : "Capture Checkout"}
                            </Button>
                        </Space>
                    </Col>

                    <Col xs={24} md={12}>
                        <Space
                            align="center"
                            style={{ width: "100%", justifyContent: "space-between", marginBottom: 8 }}
                        >
                            <Text strong>Check-in Address</Text>
                            <Button
                                size="small"
                                icon={<AimOutlined />}
                                loading={capturing === "checkin"}
                                onClick={() => captureLocation("checkin")}
                            >
                                Use current location
                            </Button>
                        </Space>
                        <Form.Item name="checkin_address" style={{ marginBottom: 0 }}>
                            <TextArea rows={4} placeholder="Auto-filled or enter manually" />
                        </Form.Item>
                    </Col>

                    <Col xs={24} md={12}>
                        <Space
                            align="center"
                            style={{ width: "100%", justifyContent: "space-between", marginBottom: 8 }}
                        >
                            <Text strong>Checkout Address</Text>
                            <Button
                                size="small"
                                icon={<AimOutlined />}
                                loading={capturing === "checkout"}
                                onClick={() => captureLocation("checkout")}
                            >
                                Use current location
                            </Button>
                        </Space>
                        <Form.Item name="checkout_address" style={{ marginBottom: 0 }}>
                            <TextArea rows={4} placeholder="Auto-filled or enter manually" />
                        </Form.Item>
                    </Col>

                    <Col xs={24} md={12} xl={6}>
                        <Form.Item
                            label="Check-in Latitude"
                            name="checkin_latitude"
                            rules={[
                                {
                                    validator: (_, value) => {
                                        if (value === undefined || value === null || value === "") {
                                            return Promise.resolve();
                                        }
                                        if (Number(value) < -90 || Number(value) > 90) {
                                            return Promise.reject(
                                                new Error("Check-in latitude must be between -90 and 90"),
                                            );
                                        }
                                        return Promise.resolve();
                                    },
                                },
                            ]}
                        >
                            <InputNumber
                                step={0.0000001}
                                min={-90}
                                max={90}
                                precision={7}
                                style={{ width: "100%" }}
                                placeholder="Latitude"
                            />
                        </Form.Item>
                    </Col>

                    <Col xs={24} md={12} xl={6}>
                        <Form.Item
                            label="Check-in Longitude"
                            name="checkin_longitude"
                            rules={[
                                {
                                    validator: (_, value) => {
                                        if (value === undefined || value === null || value === "") {
                                            return Promise.resolve();
                                        }
                                        if (Number(value) < -180 || Number(value) > 180) {
                                            return Promise.reject(
                                                new Error("Check-in longitude must be between -180 and 180"),
                                            );
                                        }
                                        return Promise.resolve();
                                    },
                                },
                            ]}
                        >
                            <InputNumber
                                step={0.0000001}
                                min={-180}
                                max={180}
                                precision={7}
                                style={{ width: "100%" }}
                                placeholder="Longitude"
                            />
                        </Form.Item>
                    </Col>

                    <Col xs={24} md={12} xl={6}>
                        <Form.Item label="Check-in Captured At" name="checkin_captured_at">
                            <DatePicker
                                showTime
                                format="DD/MM/YYYY hh:mm A"
                                style={{ width: "100%" }}
                                placeholder="Auto captured"
                            />
                        </Form.Item>
                    </Col>

                    <Col xs={24} md={12} xl={6}>
                        <div
                            style={{
                                minHeight: 78,
                                border: "1px solid var(--fl-border, #f0f0f0)",
                                borderRadius: 14,
                                padding: 12,
                                display: "flex",
                                flexDirection: "column",
                                justifyContent: "center",
                            }}
                        >
                            <Text type="secondary">Check-in Capture</Text>
                            <Space style={{ marginTop: 6 }}>
                                <ClockCircleOutlined />
                                <Text>{formatDateTime(checkinCapturedAt ? dayjs(checkinCapturedAt).toISOString() : null)}</Text>
                            </Space>
                        </div>
                    </Col>

                    <Col xs={24} md={12} xl={6}>
                        <Form.Item
                            label="Checkout Latitude"
                            name="checkout_latitude"
                            rules={[
                                {
                                    validator: (_, value) => {
                                        if (value === undefined || value === null || value === "") {
                                            return Promise.resolve();
                                        }
                                        if (Number(value) < -90 || Number(value) > 90) {
                                            return Promise.reject(
                                                new Error("Checkout latitude must be between -90 and 90"),
                                            );
                                        }
                                        return Promise.resolve();
                                    },
                                },
                            ]}
                        >
                            <InputNumber
                                step={0.0000001}
                                min={-90}
                                max={90}
                                precision={7}
                                style={{ width: "100%" }}
                                placeholder="Latitude"
                            />
                        </Form.Item>
                    </Col>

                    <Col xs={24} md={12} xl={6}>
                        <Form.Item
                            label="Checkout Longitude"
                            name="checkout_longitude"
                            rules={[
                                {
                                    validator: (_, value) => {
                                        if (value === undefined || value === null || value === "") {
                                            return Promise.resolve();
                                        }
                                        if (Number(value) < -180 || Number(value) > 180) {
                                            return Promise.reject(
                                                new Error("Checkout longitude must be between -180 and 180"),
                                            );
                                        }
                                        return Promise.resolve();
                                    },
                                },
                            ]}
                        >
                            <InputNumber
                                step={0.0000001}
                                min={-180}
                                max={180}
                                precision={7}
                                style={{ width: "100%" }}
                                placeholder="Longitude"
                            />
                        </Form.Item>
                    </Col>

                    <Col xs={24} md={12} xl={6}>
                        <Form.Item label="Checkout Captured At" name="checkout_captured_at">
                            <DatePicker
                                showTime
                                format="DD/MM/YYYY hh:mm A"
                                style={{ width: "100%" }}
                                placeholder="Auto captured"
                            />
                        </Form.Item>
                    </Col>

                    <Col xs={24} md={12} xl={6}>
                        <div
                            style={{
                                minHeight: 78,
                                border: "1px solid var(--fl-border, #f0f0f0)",
                                borderRadius: 14,
                                padding: 12,
                                display: "flex",
                                flexDirection: "column",
                                justifyContent: "center",
                            }}
                        >
                            <Text type="secondary">Checkout Capture</Text>
                            <Space style={{ marginTop: 6 }}>
                                <ClockCircleOutlined />
                                <Text>{formatDateTime(checkoutCapturedAt ? dayjs(checkoutCapturedAt).toISOString() : null)}</Text>
                            </Space>
                        </div>
                    </Col>

                    <Col xs={24}>
                        <Card
                            bordered={false}
                            style={{
                                borderRadius: 18,
                                background: "var(--fl-panel, #fff)",
                            }}
                            bodyStyle={{ padding: 12 }}
                        >
                            <div style={{ marginBottom: 10 }}>
                                <Text strong>Map Preview</Text>
                            </div>

                            {mapState.checkin || mapState.checkout ? (
                                <div
                                    style={{
                                        height: 320,
                                        borderRadius: 16,
                                        overflow: "hidden",
                                    }}
                                >
                                    <MapContainer
                                        center={mapState.center}
                                        zoom={13}
                                        scrollWheelZoom
                                        style={{ height: "100%", width: "100%" }}
                                    >
                                        <TileLayer
                                            attribution='&copy; OpenStreetMap contributors'
                                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                        />

                                        {mapState.checkin ? (
                                            <Marker position={mapState.checkin}>
                                                <Popup>
                                                    <div>
                                                        <strong>Check-in</strong>
                                                        <br />
                                                        {form.getFieldValue("checkin_address") || "Address not available"}
                                                    </div>
                                                </Popup>
                                            </Marker>
                                        ) : null}

                                        {mapState.checkout ? (
                                            <Marker position={mapState.checkout}>
                                                <Popup>
                                                    <div>
                                                        <strong>Checkout</strong>
                                                        <br />
                                                        {form.getFieldValue("checkout_address") || "Address not available"}
                                                    </div>
                                                </Popup>
                                            </Marker>
                                        ) : null}

                                        {mapState.checkin && mapState.checkout ? (
                                            <Polyline positions={[mapState.checkin, mapState.checkout]} />
                                        ) : null}
                                    </MapContainer>
                                </div>
                            ) : (
                                <div
                                    style={{
                                        minHeight: 100,
                                        border: "1px dashed var(--fl-border, #d9d9d9)",
                                        borderRadius: 14,
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                    }}
                                >
                                    <Text type="secondary">
                                        Capture check-in or checkout to preview route on map
                                    </Text>
                                </div>
                            )}
                        </Card>
                    </Col>
                </Row>
            </SectionCard>

            <SectionCard
                title="Cost Details"
                subtitle="Track visit expenses with auto total calculation"
                icon={<DollarOutlined />}
            >
                <Row gutter={[16, 16]}>
                    <Col xs={24} md={12} xl={8}>
                        <Form.Item label="Spare Cost" name="spare_cost">
                            <InputNumber min={0} style={{ width: "100%" }} />
                        </Form.Item>
                    </Col>

                    <Col xs={24} md={12} xl={8}>
                        <Form.Item label="Employee Cost" name="employee_cost">
                            <InputNumber min={0} style={{ width: "100%" }} />
                        </Form.Item>
                    </Col>

                    <Col xs={24} md={12} xl={8}>
                        <Form.Item label="Travelling Cost" name="travelling_cost">
                            <InputNumber min={0} style={{ width: "100%" }} />
                        </Form.Item>
                    </Col>

                    <Col xs={24} md={12} xl={8}>
                        <Form.Item label="Other Cost" name="other_cost">
                            <InputNumber min={0} style={{ width: "100%" }} />
                        </Form.Item>
                    </Col>

                    <Col xs={24} md={12} xl={8}>
                        <Form.Item label="Total Cost" name="total_cost">
                            <InputNumber disabled style={{ width: "100%" }} />
                        </Form.Item>
                    </Col>

                    <Col xs={24} md={12} xl={8}>
                        <div
                            style={{
                                height: "100%",
                                minHeight: 78,
                                border: "1px solid var(--fl-border, #f0f0f0)",
                                borderRadius: 14,
                                padding: 12,
                                background: "var(--fl-panel, #fff)",
                                display: "flex",
                                flexDirection: "column",
                                justifyContent: "center",
                            }}
                        >
                            <Text type="secondary">Cost Summary</Text>
                            <Title level={5} style={{ margin: "6px 0 0" }}>
                                ₹{Number(totalCost || 0).toLocaleString("en-IN")}
                            </Title>
                        </div>
                    </Col>
                </Row>
            </SectionCard>

            {isEdit ? (
                <SectionCard
                    title="Audit Information"
                    subtitle="Read-only system generated details"
                    icon={<UserOutlined />}
                >
                    <Row gutter={[16, 16]}>
                        <Col xs={24} md={12} xl={6}>
                            <Form.Item label="Created By Name" name="created_by_name">
                                <Input disabled placeholder="Auto" />
                            </Form.Item>
                        </Col>

                        <Col xs={24} md={12} xl={6}>
                            <Form.Item label="Date Created" name="created_at">
                                <Input
                                    disabled
                                    value={
                                        initialValues?.created_at
                                            ? dayjs(initialValues.created_at).format("DD/MM/YYYY hh:mm A")
                                            : ""
                                    }
                                />
                            </Form.Item>
                        </Col>

                        <Col xs={24} md={12} xl={6}>
                            <Form.Item label="Modified By Name" name="updated_by_name">
                                <Input disabled placeholder="Auto" />
                            </Form.Item>
                        </Col>

                        <Col xs={24} md={12} xl={6}>
                            <Form.Item label="Date Modified" name="updated_at">
                                <Input
                                    disabled
                                    value={
                                        initialValues?.updated_at
                                            ? dayjs(initialValues.updated_at).format("DD/MM/YYYY hh:mm A")
                                            : ""
                                    }
                                />
                            </Form.Item>
                        </Col>
                    </Row>
                </SectionCard>
            ) : null}
        </Space>
    );
}