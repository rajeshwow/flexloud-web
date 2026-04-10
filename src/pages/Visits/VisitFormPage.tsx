import {
    ArrowLeftOutlined,
    CalendarOutlined,
    EditOutlined,
    EnvironmentOutlined,
    LoadingOutlined,
    PlusOutlined,
    SaveOutlined,
} from "@ant-design/icons";
import {
    Button,
    Card,
    Col,
    Form,
    Row,
    Space,
    Spin,
    Tag,
    Typography,
    message
} from "antd";
import dayjs from "dayjs";
import { useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import {
    createVisit,
    getVisitById,
    resetVisitDetailsState,
    updateVisit,
} from "../../redux/reducers/visits.slice";
import type { AppDispatch, RootState } from "../../redux/store";
import VisitForm from "./components/VisitForm";
import { toIsoString } from "./utils/visitForm.utils";

const { Title, Text } = Typography;

type RouteParams = {
    id?: string;
    slug?: string;
};

function formatDateTime(value?: string | null) {
    if (!value) return "-";
    return dayjs(value).format("DD MMM YYYY, hh:mm A");
}

export default function VisitFormPage() {
    const [form] = Form.useForm();
    const dispatch = useDispatch<AppDispatch>();
    const navigate = useNavigate();
    const { id, slug } = useParams<RouteParams>();

    const isEdit = Boolean(id);

    const { selectedVisit, detailsLoading, actionLoading } = useSelector(
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

    const pageTitle = isEdit ? "Edit Visit" : "Create Visit";
    const pageSubtitle = isEdit
        ? "Update visit schedule, location, costs and follow-up information."
        : "Create a new visit with complete tracking details and expense summary.";

    const visitStatus = useMemo(() => {
        if (!selectedVisit?.status) return null;
        return selectedVisit.status;
    }, [selectedVisit]);

    const routeAvailability = useMemo(() => {
        const hasCheckin =
            selectedVisit?.checkin_latitude != null &&
            selectedVisit?.checkin_longitude != null;
        const hasCheckout =
            selectedVisit?.checkout_latitude != null &&
            selectedVisit?.checkout_longitude != null;

        if (hasCheckin && hasCheckout) return "Check-in + Checkout";
        if (hasCheckin || hasCheckout) return "Partial Route";
        return "No Route";
    }, [selectedVisit]);

    const handleSubmit = async (values: any) => {
        const payload: any = {
            ...values,
            start_date: toIsoString(values.start_date),
            end_date: toIsoString(values.end_date),
            next_followup_date: toIsoString(values.next_followup_date),
            checkin_captured_at: toIsoString(values.checkin_captured_at),
            checkout_captured_at: toIsoString(values.checkout_captured_at),

            assigned_to_user_id: values.assigned_to_user_id || undefined,
            organization_id: values.organization_id || undefined,
            contact_id: values.contact_id || undefined,
            lead_id: values.lead_id || undefined,
            case_id: values.case_id || undefined,
        };

        delete payload.duration;
        delete payload.duration_in_minutes;
        delete payload.total_cost;
        delete payload.created_at;
        delete payload.updated_at;
        delete payload.created_by_name;
        delete payload.updated_by_name;
        delete payload.organization_name;
        delete payload.contact_name;
        delete payload.lead_name;
        delete payload.case_name;
        delete payload.assigned_to_name;

        try {
            if (isEdit && id) {
                await dispatch(updateVisit({ id, data: payload })).unwrap();
                message.success("Visit updated successfully");
                navigate(`/${slug}/visits/${id}`);
            } else {
                await dispatch(createVisit(payload)).unwrap();
                message.success("Visit created successfully");
                navigate(`/${slug}/visits`);
            }
        } catch (error: any) {
            message.error(error?.message || "Something went wrong");
        }
    };

    return (
        <div>
            <Space direction="vertical" size={16} style={{ width: "100%" }}>
                <Card
                    bordered={false}
                    style={{
                        borderRadius: 24,
                        overflow: "hidden",
                    }}
                    bodyStyle={{ padding: 20 }}
                >
                    <Row gutter={[16, 16]} align="middle" justify="space-between">
                        <Col xs={24} lg={15}>
                            <Space direction="vertical" size={10} style={{ width: "100%" }}>
                                <Space wrap>
                                    <Button
                                        icon={<ArrowLeftOutlined />}
                                        onClick={() =>
                                            navigate(
                                                isEdit
                                                    ? `/${slug}/visits/${id}`
                                                    : `/${slug}/visits`,
                                            )
                                        }
                                    >
                                        Back
                                    </Button>

                                    {isEdit ? (
                                        <Tag icon={<EditOutlined />} color="blue">
                                            Edit Mode
                                        </Tag>
                                    ) : (
                                        <Tag icon={<PlusOutlined />} color="green">
                                            Create Mode
                                        </Tag>
                                    )}

                                    {visitStatus ? <Tag>{visitStatus}</Tag> : null}
                                </Space>

                                <div>
                                    <Title level={2} style={{ margin: 0 }}>
                                        {pageTitle}
                                    </Title>
                                    <Text type="secondary">{pageSubtitle}</Text>
                                </div>

                                {isEdit && selectedVisit ? (
                                    <Space wrap>
                                        <Tag icon={<CalendarOutlined />}>
                                            Start: {formatDateTime(selectedVisit.start_date)}
                                        </Tag>
                                        <Tag icon={<CalendarOutlined />}>
                                            Follow-up: {formatDateTime(selectedVisit.next_followup_date)}
                                        </Tag>
                                        <Tag icon={<EnvironmentOutlined />}>
                                            {routeAvailability}
                                        </Tag>
                                    </Space>
                                ) : null}
                            </Space>
                        </Col>

                        <Col xs={24} lg={9}>
                            {/* <Affix offsetTop={12}> */}
                            <Card
                                bordered={false}
                                style={{
                                    borderRadius: 20,
                                    boxShadow: "0 8px 24px rgba(0,0,0,0.06)",
                                }}
                                bodyStyle={{ padding: 16 }}
                            >
                                <Space
                                    direction="vertical"
                                    size={12}
                                    style={{ width: "100%" }}
                                >
                                    <div>
                                        <Text strong>Actions</Text>
                                        <div>
                                            <Text type="secondary">
                                                Save your visit details after reviewing all sections.
                                            </Text>
                                        </div>
                                    </div>

                                    <Space wrap style={{ width: "100%" }}>
                                        <Button
                                            icon={<ArrowLeftOutlined />}
                                            onClick={() =>
                                                navigate(
                                                    isEdit
                                                        ? `/${slug}/visits/${id}`
                                                        : `/${slug}/visits`,
                                                )
                                            }
                                        >
                                            Cancel
                                        </Button>

                                        <Button
                                            type="primary"
                                            icon={
                                                actionLoading ? (
                                                    <LoadingOutlined />
                                                ) : (
                                                    <SaveOutlined />
                                                )
                                            }
                                            loading={actionLoading}
                                            onClick={() => form.submit()}
                                        >
                                            {isEdit ? "Update Visit" : "Create Visit"}
                                        </Button>
                                    </Space>

                                    {isEdit && selectedVisit ? (
                                        <Space wrap>
                                            <Tag>
                                                Created: {formatDateTime(selectedVisit.created_at)}
                                            </Tag>
                                            <Tag>
                                                Updated: {formatDateTime(selectedVisit.updated_at)}
                                            </Tag>
                                        </Space>
                                    ) : (
                                        <Text type="secondary">
                                            Default costs will start from 0 and auto totals will be calculated.
                                        </Text>
                                    )}
                                </Space>
                            </Card>
                            {/* </Affix> */}
                        </Col>
                    </Row>
                </Card>

                <Spin spinning={detailsLoading}>
                    <Form
                        form={form}
                        layout="vertical"
                        onFinish={handleSubmit}
                        initialValues={{
                            spare_cost: 0,
                            employee_cost: 0,
                            travelling_cost: 0,
                            other_cost: 0,
                        }}
                    >
                        <VisitForm
                            form={form}
                            initialValues={selectedVisit}
                            isEdit={isEdit}
                        />
                    </Form>
                </Spin>
            </Space>
        </div>
    );
}