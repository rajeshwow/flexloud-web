import { Col, Form, Row, Space, Spin, message } from "antd";
import dayjs from "dayjs";
import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";


import ActivityTimeline from "../../layouts/ActivityTimeline";
import { fetchActivityTimeline } from "../../redux/reducers/activity.slice";
import {
    clearLeadDetails,
    fetchLeadDetails,
    updateLead,
} from "../../redux/reducers/leads.slice";
import type { AppDispatch, RootState } from "../../redux/store";
import DetailsPageHeader from "../Details-page/DetailsPageHeader";
import DetailsSummaryCard from "../Details-page/DetailsSummaryCard";
import LeadDetailsContent from "./components/LeadDetailsContent";

type RouteParams = {
    slug: string;
    id: string;
};

const statusOptions = [
    { label: "Open", value: "open" },
    { label: "In Progress", value: "in_progress" },
    { label: "Qualified", value: "qualified" },
    { label: "Won", value: "won" },
    { label: "Lost", value: "lost" },
];

const sourceOptions = [
    { label: "Website", value: "website" },
    { label: "Referral", value: "referral" },
    { label: "Manual", value: "manual" },
    { label: "Campaign", value: "campaign" },
];

const priorityOptions = [
    { label: "Low", value: "low" },
    { label: "Medium", value: "medium" },
    { label: "High", value: "high" },
];

function formatDateTime(value?: string | null) {
    if (!value) return "-";
    const parsed = dayjs(value);
    return parsed.isValid() ? parsed.format("DD MMM YYYY, hh:mm A") : "-";
}

function getLeadDisplayName(details: any) {
    return (
        details?.name ||
        `${details?.first_name || ""} ${details?.last_name || ""}`.trim() ||
        "Lead Details"
    );
}

export default function LeadDetailsPage() {
    const [form] = Form.useForm();
    const dispatch = useDispatch<AppDispatch>();
    const navigate = useNavigate();
    const { slug, id } = useParams<RouteParams>();

    const [isEditing, setIsEditing] = useState(false);
    const [timelineData, setTimelineData] = useState<any[]>([]);
    const [timelineLoading, setTimelineLoading] = useState(false);

    const { leadDetails, detailsLoading, updateLoading } = useSelector(
        (state: RootState) => state.leads,
    );

    const details = leadDetails;

    const assignedUserOptions = useMemo(() => {
        return [];
    }, []);

    useEffect(() => {
        if (!id) return;

        dispatch(fetchLeadDetails(id));

        return () => {
            dispatch(clearLeadDetails());
        };
    }, [dispatch, id]);

    const fetchTimeline = async (id: any) => {
        try {
            setTimelineLoading(true);
            const res = await dispatch(fetchActivityTimeline({ entityType: "lead", entityId: id })).unwrap();
            setTimelineData(res);
        } catch (error) {
            console.error("timeline fetch failed", error);
        } finally {
            setTimelineLoading(false);
        }
    };

    useEffect(() => {
        if (!id) return;
        fetchTimeline(id);
    }, [id]);

    useEffect(() => {
        if (!details) return;

        form.setFieldsValue({
            ...details,
            next_followup_date: details?.next_followup
                ? dayjs(details.next_followup)
                : details?.next_followup_date
                    ? dayjs(details.next_followup_date)
                    : null,
        });
    }, [details, form]);

    const handleEdit = () => {

        setIsEditing(true);

    };

    const handleCancel = () => {
        setIsEditing(false);

        if (!details) return;

        form.setFieldsValue({
            ...details,
            next_followup_date: details?.next_followup
                ? dayjs(details.next_followup)
                : details?.next_followup_date
                    ? dayjs(details.next_followup_date)
                    : null,
        });
    };

    const handleSave = async (values: any) => {
        if (!id) return;

        const payload: any = {
            id: String(id),
            ...values,
            next_followup: values?.next_followup_date
                ? values.next_followup_date.toISOString()
                : undefined,
        };

        delete payload.next_followup_date;

        try {
            await dispatch(updateLead(payload)).unwrap();
            message.success("Lead updated successfully");
            setIsEditing(false);
            fetchTimeline(id);
            await dispatch(fetchLeadDetails(id)).unwrap();
        } catch (error: any) {
            message.error(error || "Failed to update lead");
        }
    };

    return (
        <div style={{ padding: 4 }}>
            <Row gutter={[16, 16]}>
                <Col xs={24}>
                    <DetailsPageHeader
                        title={getLeadDisplayName(details)}
                        subtitle={details?.lead_number || details?.email || ""}
                        status={details?.status}
                        isEditing={isEditing}
                        saveLoading={updateLoading}
                        onBack={() => navigate(`/${slug}/leads/view`)}
                        onEdit={handleEdit}
                        onCancel={handleCancel}
                        onSave={() => form.submit()}
                    />
                </Col>

                <Col xs={24} xl={16}>
                    <Spin spinning={detailsLoading}>
                        <Form form={form} layout="vertical" onFinish={handleSave}>
                            <LeadDetailsContent
                                details={details}
                                isEditing={isEditing}
                                statusOptions={statusOptions}
                                sourceOptions={sourceOptions}
                                priorityOptions={priorityOptions}
                                assignedUserOptions={assignedUserOptions}
                            />
                        </Form>
                    </Spin>
                </Col>

                <Col xs={24} xl={8}>
                    <Space direction="vertical" size={16} style={{ width: "100%" }}>
                        <DetailsSummaryCard
                            title="Lead Summary"
                            items={[
                                {
                                    label: "Status",
                                    value: details?.status
                                        ? String(details.status).replaceAll("_", " ")
                                        : "-",
                                },
                                {
                                    label: "Source",
                                    value: details?.source || "-",
                                },
                                {
                                    label: "Priority",
                                    value: details?.priority || "-",
                                },
                                {
                                    label: "Created",
                                    value: formatDateTime(details?.created_at),
                                },
                                {
                                    label: "Lead ID",
                                    value: details?.id || "-",
                                    span: 24,
                                },
                                {
                                    label: "Assigned To",
                                    value: details?.assigned_to_name || details?.assigned_to || "-",
                                    span: 24,
                                },
                                {
                                    label: "Next Followup",
                                    value: formatDateTime(
                                        details?.next_followup || details?.next_followup_date,
                                    ),
                                    span: 24,
                                },
                            ]}
                        />

                        <ActivityTimeline
                            data={timelineData}
                            loading={timelineLoading}
                            title="Lead Timeline"
                        />
                    </Space>
                </Col>
            </Row>
        </div>
    );
}