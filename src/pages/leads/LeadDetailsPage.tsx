import { Col, Form, Row, Space, Spin, message } from "antd";
import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";


import { useMasters } from "../../hooks/useMasters";
import ActivityTimeline from "../../layouts/ActivityTimeline";
import { fetchActivityTimeline } from "../../redux/reducers/activity.slice";
import { fetchLeadAIInsights, resetLeadAIInsightsState } from "../../redux/reducers/aiInsights.slice";
import {
    clearLeadDetails,
    fetchLeadDetails,
    updateLead,
} from "../../redux/reducers/leads.slice";
import { getUsers } from "../../redux/reducers/user.slice";
import type { AppDispatch, RootState } from "../../redux/store";
import { formatDateTime } from "../../shared/Utils/utils";
import AIInsightsCard from "../ai-insights/components/AIInsightsCard";
import DetailsPageHeader from "../Details-page/DetailsPageHeader";
import DetailsSummaryCard from "../Details-page/DetailsSummaryCard";
import GeoVisitActionCard from "../geo-visits/components/GeoVisitActionCard";
import GeoVisitTimeline from "../geo-visits/components/GeoVisitTimeline";
import LeadDetailsContent from "./components/LeadDetailsContent";

type RouteParams = {
    slug: string;
    id: string;
};





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

    const leadStatus = useMasters("lead_status" as any);
    const priority = useMasters("priority" as any);
    const source = useMasters("source" as any);


    const [isEditing, setIsEditing] = useState(false);
    const [timelineData, setTimelineData] = useState<any[]>([]);
    const [timelineLoading, setTimelineLoading] = useState(false);

    const users = useSelector((state: RootState) => state.users?.userList || []);

    const { leadDetails, detailsLoading, updateLoading } = useSelector(
        (state: RootState) => state.leads,
    );

    const { leadInsights, leadInsightsLoading, leadInsightsError } = useSelector(
        (state: RootState) => state.aiInsights
    );

    const {
        insightsByKey,
        insightsLoading,
        followupDraft,
        followupLoading,
        activitySummary,
    } = useSelector((state: RootState) => state.aiAssistant);

    const details = leadDetails;

    const [followupOpen, setFollowupOpen] = useState(false);

    const aiKey = useMemo(() => `lead:${id}`, [id]);
    const aiInsight = insightsByKey[aiKey];

    useEffect(() => {
        if (id) {
            dispatch(fetchLeadAIInsights(id));
        }

        return () => {
            dispatch(resetLeadAIInsightsState());
        };
    }, [dispatch, id]);

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

    const statusOptions = useMemo(() => leadStatus || [], [leadStatus]);
    const priorityOptions = useMemo(() => priority || [], [priority]);
    const sourceOptions = useMemo(() => source || [], [source]);

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

        form.resetFields(); // IMPORTANT

        form.setFieldsValue({
            first_name: details?.first_name || "",
            last_name: details?.last_name || "",
            status_id: details?.status_id ?? undefined,
            priority_id: details?.priority_id ?? undefined,
            source_id: details?.source_id ?? undefined,
            mobile: details?.mobile || "",
            assigned_to: details?.assigned_to || undefined,
            email: details?.emails?.[0]?.email || "",
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

    // useEffect(() => {
    //     if (!id) return;

    //     dispatch(
    //         fetchAIInsights({
    //             entityType: "lead",
    //             entityId: id,
    //         }),
    //     ).catch(() => null);
    // }, [dispatch, id]);

    // const handleRefreshAI = async () => {
    //     if (!id) return;

    //     try {
    //         await dispatch(
    //             fetchAIInsights({
    //                 entityType: "lead",
    //                 entityId: id,
    //                 forceRefresh: true,
    //             }),
    //         ).unwrap();

    //         message.success("AI insight refreshed");
    //     } catch (error: any) {
    //         message.error(error?.message || "Failed to refresh AI insight");
    //     }
    // };

    // const handleGenerateFollowup = async () => {
    //     if (!id) return;

    //     try {
    //         await dispatch(
    //             generateAIFollowup({
    //                 entityType: "lead",
    //                 entityId: id,
    //                 channel: "email",
    //             }),
    //         ).unwrap();

    //         setFollowupOpen(true);
    //         message.success("Follow-up generated");
    //     } catch (error: any) {
    //         message.error(error?.message || "Failed to generate follow-up");
    //     }
    // };

    // const handleSummarizeActivities = async () => {
    //     if (!id) return;

    //     try {
    //         const result = await dispatch(
    //             summarizeAIActivities({
    //                 entityType: "lead",
    //                 entityId: id,
    //             }),
    //         ).unwrap();

    //         message.info(result?.summary || "Activities summarized");
    //     } catch (error: any) {
    //         message.error(error?.message || "Failed to summarize activities");
    //     }
    // };

    const handleSave = async (values: any) => {
        if (!id) return;

        const payload: any = {
            id: String(id),
            first_name: values.first_name || undefined,
            last_name: values.last_name || undefined,
            status_id: values.status_id || undefined,
            priority_id: values.priority_id || undefined,
            source_id: values.source_id || undefined,
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
            await dispatch(fetchLeadAIInsights(id)).unwrap();
            setIsEditing(false);
            fetchTimeline(id);
            await dispatch(fetchLeadDetails(id)).unwrap();
        } catch (error: any) {
            message.error(error || "Failed to update lead");
        }
    };

    console.log("details", details);

    return (
        <div style={{ padding: 4 }}>
            <Row gutter={[16, 16]}>
                <Col xs={24}>
                    <DetailsPageHeader
                        title={getLeadDisplayName(details)}
                        subtitle={details?.lead_display_id || details?.lead_number || ""}
                        status={details?.status_label}
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

                    <ActivityTimeline
                        data={timelineData}
                        loading={timelineLoading}
                        title="Lead Timeline"
                    />
                    <GeoVisitActionCard
                        moduleName="lead"
                        recordId={details?.id || ''}
                    // targetAddress={details?.primary_address_street || details?.primary_address_area || details?.primary_address_city || details?.primary_address_state || details?.primary_address_country || null}
                    />
                    <div style={{ marginTop: 16 }}>
                        <GeoVisitTimeline
                            moduleName="lead"
                            recordId={details?.id || ''}
                        />
                    </div>
                </Col>

                <Col xs={24} xl={8}>
                    <Space direction="vertical" size={16} style={{ width: "100%" }}>
                        <DetailsSummaryCard
                            title="Lead Summary"
                            items={[
                                {
                                    label: "Status",
                                    value: details?.status_label || "-",

                                },
                                {
                                    label: "Source",
                                    value: details?.source_label || "-",
                                },
                                {
                                    label: "Priority",
                                    value: details?.priority_label || "-",
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

                        <AIInsightsCard
                            data={leadInsights}
                            loading={leadInsightsLoading}
                            error={leadInsightsError}
                        />



                        {/* <AIInsightCard
                            loading={insightsLoading}
                            data={aiInsight}
                            onRefresh={handleRefreshAI}
                            onGenerateFollowup={handleGenerateFollowup}
                            onSummarizeActivities={handleSummarizeActivities}
                        /> */}




                    </Space>
                </Col>
            </Row>
        </div>
    );
}