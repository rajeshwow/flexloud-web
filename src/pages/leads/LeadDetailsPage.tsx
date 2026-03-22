import { Col, Form, Row, Space, Spin, message } from "antd";
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
import { getUsers } from "../../redux/reducers/user.slice";
import type { AppDispatch, RootState } from "../../redux/store";
import { formatDateTime } from "../../shared/Utils/utils";
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

    const users = useSelector((state: RootState) => state.users?.userList || []);

    const { leadDetails, detailsLoading, updateLoading } = useSelector(
        (state: RootState) => state.leads,
    );

    const details = leadDetails;

    const assignedUserOptions = useMemo(() => {
        return (users || []).map((user: any) => ({
            label:
                user?.name ||
                `${user?.first_name || ""} ${user?.last_name || ""}`.trim() ||
                user?.email ||
                user?.id,
            value: user?.id,
        }));
    }, [users]);

    useEffect(() => {
        dispatch(getUsers());
    }, [dispatch]);

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
            first_name: details?.first_name || "",
            last_name: details?.last_name || "",
            lead_source: details?.lead_source || "",
            email: details?.emails?.[0]?.email || "",
            // next_followup_date: details?.next_followup
            //     ? dayjs(details.next_followup)
            //     : details?.next_followup_date
            //         ? dayjs(details.next_followup_date)
            //         : null,
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
            // next_followup_date: details?.next_followup
            //     ? dayjs(details.next_followup)
            //     : details?.next_followup_date
            //         ? dayjs(details.next_followup_date)
            //         : null,
        });
    };

    const handleSave = async (values: any) => {
        if (!id) return;

        const payload: any = {
            id: String(id),
            first_name: values.first_name || undefined,
            last_name: values.last_name || undefined,
            status: values.status || undefined,
            priority: values.priority || undefined,
            lead_source: values.lead_source || undefined,
            mobile: values.mobile || undefined,
            assigned_to: values.assigned_to || undefined,
            description: values.description || undefined,
            next_followup: values?.next_followup_date
                ? values.next_followup_date.toISOString()
                : undefined,
            emails: values.email
                ? [
                    {
                        email: values.email,
                        primary: true,
                    },
                ]
                : [],
        };

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
                        subtitle={details?.lead_display_id || details?.lead_number || ""}
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
                                    value: details?.lead_source || "-",
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
                                    value: details?.lead_display_id || "-",
                                    span: 24,
                                },
                                {
                                    label: "Assigned To",
                                    value:
                                        details?.assigned_to_name ||
                                        assignedUserOptions?.find((item) => item.value === details?.assigned_to)?.label ||
                                        "-",
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