import {
    Button,
    Card,
    Col,
    DatePicker,
    Form,
    Input,
    Row,
    Select,
    Space,
    Typography,
    message,
    theme,
} from "antd";
import dayjs, { Dayjs } from "dayjs";
import { useEffect, useMemo, useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { useMasters } from "../../hooks/useMasters";
import { fetchContacts } from "../../redux/reducers/contacts.slice";
import { fetchLeads } from "../../redux/reducers/leads.slice";
import { fetchOpportunities } from "../../redux/reducers/opportunities.slice";
import { getOrganization } from "../../redux/reducers/organization.slice";

const { Text } = Typography;
const { TextArea } = Input;

export type TaskRelatedType =
    | "organization"
    | "contact"
    | "lead"
    | "opportunity";

export type TaskStatus =
    | "not_started"
    | "in_progress"
    | "completed"
    | "waiting"
    | "deferred";

export type TaskRepeatType =
    | "none"
    | "daily"
    | "weekly"
    | "monthly"
    | "yearly";

type OptionType = {
    label: string;
    value: string;
};

type Props = {
    form: any;
    loading?: boolean;
    mode: "create" | "edit";
    onSubmit: (values: any) => void;
    userOptions?: OptionType[];
    onRelatedTypeChange?: (value: TaskRelatedType | undefined) => void;
};

const STATUS_OPTIONS: OptionType[] = [
    { label: "Not Started", value: "not_started" },
    { label: "In Progress", value: "in_progress" },
    { label: "Completed", value: "completed" },
    { label: "Waiting", value: "waiting" },
    { label: "Deferred", value: "deferred" },
];

const REPEAT_OPTIONS: OptionType[] = [
    { label: "None", value: "none" },
    { label: "Daily", value: "daily" },
    { label: "Weekly", value: "weekly" },
    { label: "Monthly", value: "monthly" },
    { label: "Yearly", value: "yearly" },
];

const RELATED_TO_TYPE_OPTIONS: OptionType[] = [
    { label: "Organization", value: "organization" },
    { label: "Contact", value: "contact" },
    { label: "Lead", value: "lead" },
    { label: "Opportunity", value: "opportunity" },
];

function formatDuration(start?: Dayjs, end?: Dayjs) {
    if (!start || !end) {
        return {
            text: "",
            minutes: null,
        };
    }

    const startValue = dayjs(start);
    const endValue = dayjs(end);

    if (!startValue.isValid() || !endValue.isValid()) {
        return {
            text: "",
            minutes: null,
        };
    }

    const diffMinutes = endValue.diff(startValue, "minute");

    if (diffMinutes < 0) {
        return {
            text: "",
            minutes: null,
        };
    }

    const days = Math.floor(diffMinutes / (60 * 24));
    const hours = Math.floor((diffMinutes % (60 * 24)) / 60);
    const minutes = diffMinutes % 60;

    const parts: string[] = [];
    if (days) parts.push(`${days}d`);
    if (hours) parts.push(`${hours}h`);
    if (minutes || (!days && !hours)) parts.push(`${minutes}m`);

    return {
        text: parts.join(" "),
        minutes: diffMinutes,
    };
}

export default function TaskForm({
    form,
    loading,
    mode,
    onSubmit,
    userOptions = [],
    onRelatedTypeChange,
}: Props) {
    const { token } = theme.useToken();
    const dispatch = useDispatch<any>();
    const navigate = useNavigate();
    const { slug = "" } = useParams();

    const startDate = Form.useWatch("start_date", form);
    const endDate = Form.useWatch("end_date", form);
    const repeatTask = Form.useWatch("repeat_task", form);
    const relatedToType = Form.useWatch("related_to_type", form);

    const priorityMasters = useMasters("priority");

    const priorityOptions = useMemo(() => {
        return (priorityMasters || []).map((item: any) => ({
            label:
                item?.label ||
                item?.name ||
                item?.title ||
                item?.value_label ||
                "Unnamed Priority",
            value: item?.value || item?.id || item?.code,
        }));
    }, [priorityMasters]);

    const [relatedToOptions, setRelatedToOptions] = useState<OptionType[]>([]);
    const [relatedLoading, setRelatedLoading] = useState(false);

    const duration = useMemo(() => {
        return formatDuration(startDate, endDate);
    }, [startDate, endDate]);

    const normalizeOptions = (list: any[], type: string): OptionType[] => {
        switch (type) {
            case "organization":
                return (list || []).map((item: any) => ({
                    label: item?.name || item?.organization_name || "Unnamed Organization",
                    value: item?.id,
                }));

            case "contact":
                return (list || []).map((item: any) => ({
                    label:
                        [item?.first_name, item?.last_name].filter(Boolean).join(" ") ||
                        item?.name ||
                        item?.email ||
                        "Unnamed Contact",
                    value: item?.id,
                }));

            case "lead":
                return (list || []).map((item: any) => ({
                    label:
                        [item?.first_name, item?.last_name].filter(Boolean).join(" ") ||
                        item?.organization_name ||
                        item?.lead_display_id ||
                        item?.lead_number ||
                        "Unnamed Lead",
                    value: item?.id,
                }));

            case "opportunity":
                return (list || []).map((item: any) => ({
                    label:
                        item?.name ||
                        item?.title ||
                        item?.opportunity_name ||
                        "Unnamed Opportunity",
                    value: item?.id,
                }));

            default:
                return [];
        }
    };

    const extractList = (res: any): any[] => {
        if (Array.isArray(res)) return res;
        if (Array.isArray(res?.data)) return res.data;
        if (Array.isArray(res?.items)) return res.items;
        if (Array.isArray(res?.rows)) return res.rows;
        return [];
    };

    const handleRelatedToTypeChange = async (
        value?: string,
        shouldResetRelatedId = true
    ) => {
        if (shouldResetRelatedId) {
            form.setFieldsValue({
                related_to_id: undefined,
            });
        }

        onRelatedTypeChange?.(value as TaskRelatedType | undefined);

        if (!value) {
            setRelatedToOptions([]);
            return;
        }

        try {
            setRelatedLoading(true);

            let list: any[] = [];

            if (value === "organization") {
                const res = await dispatch(getOrganization({ page: 1, limit: 100 })).unwrap();
                list = extractList(res);
            } else if (value === "contact") {
                const res = await dispatch(fetchContacts({ page: 1, limit: 100 })).unwrap();
                list = extractList(res);
            } else if (value === "lead") {
                const res = await dispatch(fetchLeads({ page: 1, limit: 100 })).unwrap();
                list = extractList(res);
            } else if (value === "opportunity") {
                const res = await dispatch(fetchOpportunities({ page: 1, limit: 100 })).unwrap();
                list = extractList(res);
            }

            setRelatedToOptions(normalizeOptions(list, value));
        } catch (error) {
            setRelatedToOptions([]);
            message.error("Failed to load related records");
        } finally {
            setRelatedLoading(false);
        }
    };

    useEffect(() => {
        if (!relatedToType) {
            setRelatedToOptions([]);
            return;
        }

        handleRelatedToTypeChange(relatedToType, false);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [relatedToType]);

    useEffect(() => {
        form.setFieldsValue({
            task_duration: duration.text || undefined,
            task_duration_minutes: duration.minutes ?? undefined,
        });
    }, [duration, form]);

    useEffect(() => {
        if (repeatTask === "none") {
            form.setFieldValue("repeat_task_end", null);
        }
    }, [repeatTask, form]);

    const cardStyle = {
        borderRadius: 16,
        border: `1px solid ${token.colorBorderSecondary}`,
        boxShadow: token.boxShadowTertiary,
        background: token.colorBgContainer,
    };

    const labelStyle = {
        fontWeight: 600,
        color: token.colorTextHeading,
    };

    return (
        <Card style={cardStyle} bodyStyle={{ padding: 20 }}>
            <Form
                form={form}
                layout="vertical"
                onFinish={onSubmit}
                requiredMark
                initialValues={{
                    status: "not_started",
                    repeat_task: "none",
                    related_to_type: undefined,
                }}
            >
                <Row gutter={[20, 8]}>
                    <Col xs={24} lg={8}>
                        <Form.Item
                            label={<span style={labelStyle}>Subject</span>}
                            name="subject"
                            rules={[{ required: true, message: "Please enter subject" }]}
                        >
                            <Input placeholder="Enter subject" size="large" />
                        </Form.Item>
                    </Col>

                    <Col xs={24} lg={8}>
                        <Form.Item
                            label={<span style={labelStyle}>Status</span>}
                            name="status"
                            rules={[{ required: true, message: "Please select status" }]}
                        >
                            <Select
                                size="large"
                                placeholder="Select status"
                                options={STATUS_OPTIONS}
                            />
                        </Form.Item>
                    </Col>

                    <Col xs={24} lg={8}>
                        <Form.Item
                            label={<span style={labelStyle}>Priority</span>}
                            name="priority_id"
                            rules={[{ required: true, message: "Please select priority" }]}
                        >
                            <Select
                                size="large"
                                placeholder="Select priority"
                                options={priorityOptions}
                                allowClear
                                showSearch
                                optionFilterProp="label"
                            />
                        </Form.Item>
                    </Col>

                    <Col xs={24} lg={8}>
                        <Form.Item
                            label={<span style={labelStyle}>Start Date</span>}
                            name="start_date"
                            rules={[{ required: true, message: "Please select start date" }]}
                        >
                            <DatePicker
                                showTime={{ format: "hh:mm a", use12Hours: true }}
                                format="DD/MM/YYYY hh:mm a"
                                style={{ width: "100%" }}
                                size="large"
                                placeholder="dd/mm/yyyy hh:mm a"
                                disabledDate={(current) => {
                                    if (!current) return false;

                                    const existingStart = form.getFieldValue("start_date");
                                    if (mode === "edit" && existingStart) return false;

                                    return current.isBefore(dayjs().startOf("day"));
                                }}
                            />
                        </Form.Item>
                    </Col>

                    <Col xs={24} lg={8}>
                        <Form.Item
                            label={<span style={labelStyle}>End Date</span>}
                            name="end_date"
                            dependencies={["start_date"]}
                            rules={[
                                { required: true, message: "Please select end date" },
                                {
                                    validator: (_, value) => {
                                        const start = form.getFieldValue("start_date");
                                        if (!value || !start) return Promise.resolve();

                                        if (dayjs(value).isBefore(dayjs(start))) {
                                            return Promise.reject(
                                                new Error("End date must be after start date")
                                            );
                                        }

                                        return Promise.resolve();
                                    },
                                },
                            ]}
                            extra={
                                startDate &&
                                    endDate &&
                                    dayjs(endDate).isBefore(dayjs(startDate))
                                    ? "End date must be after start date"
                                    : undefined
                            }
                        >
                            <DatePicker
                                showTime={{ format: "hh:mm a", use12Hours: true }}
                                format="DD/MM/YYYY hh:mm a"
                                style={{ width: "100%" }}
                                size="large"
                                placeholder="dd/mm/yyyy hh:mm a"
                            />
                        </Form.Item>
                    </Col>

                    <Col xs={24} lg={8}>
                        <Form.Item
                            label={<span style={labelStyle}>Assigned To</span>}
                            name="assigned_to"
                        >
                            <Select
                                size="large"
                                placeholder="Select assignee"
                                allowClear
                                showSearch
                                optionFilterProp="label"
                                options={userOptions}
                            />
                        </Form.Item>
                    </Col>

                    <Col xs={24} lg={8}>
                        <Form.Item
                            name="related_to_type"
                            label={<span style={labelStyle}>Related To</span>}
                        >
                            <Select
                                size="large"
                                placeholder="Select type"
                                allowClear
                                options={RELATED_TO_TYPE_OPTIONS}
                                onChange={(value) => handleRelatedToTypeChange(value, true)}
                            />
                        </Form.Item>
                    </Col>

                    <Col xs={24} lg={8}>
                        <Form.Item
                            name="related_to_id"
                            label={<span style={labelStyle}>Related Record</span>}
                        >
                            <Select
                                size="large"
                                placeholder="Select related record"
                                disabled={!relatedToType}
                                allowClear
                                showSearch
                                loading={relatedLoading}
                                optionFilterProp="label"
                                options={relatedToOptions}
                            />
                        </Form.Item>
                    </Col>

                    <Col xs={24} lg={8}>
                        <Row gutter={12}>
                            <Col xs={24} md={12}>
                                <Form.Item
                                    label={<span style={labelStyle}>Repeat Task</span>}
                                    name="repeat_task"
                                >
                                    <Select
                                        size="large"
                                        placeholder="Select repeat type"
                                        options={REPEAT_OPTIONS}
                                    />
                                </Form.Item>
                            </Col>

                            <Col xs={24} md={12}>
                                <Form.Item
                                    label={<span style={labelStyle}>Repeat Task End</span>}
                                    name="repeat_task_end"
                                >
                                    <DatePicker
                                        style={{ width: "100%" }}
                                        size="large"
                                        format="DD/MM/YYYY"
                                        placeholder="dd/mm/yyyy"
                                        disabled={repeatTask === "none"}
                                        disabledDate={(current) => {
                                            if (!current) return false;
                                            return current.isBefore(dayjs().startOf("day"));
                                        }}
                                    />
                                </Form.Item>
                            </Col>
                        </Row>
                    </Col>

                    <Col xs={24} lg={8}>
                        <Form.Item
                            label={<span style={labelStyle}>Task Duration</span>}
                            name="task_duration"
                        >
                            <Input
                                size="large"
                                placeholder="Auto calculated"
                                readOnly
                                disabled
                            />
                        </Form.Item>
                    </Col>

                    <Col xs={24} lg={8}>
                        <Form.Item
                            label={<span style={labelStyle}>Task Duration (in minutes)</span>}
                            name="task_duration_minutes"
                        >
                            <Input
                                size="large"
                                placeholder="Auto calculated"
                                readOnly
                                disabled
                            />
                        </Form.Item>
                    </Col>

                    <Col xs={24} lg={8}>
                        <Form.Item
                            label={<span style={labelStyle}>Description</span>}
                            name="description"
                        >
                            <TextArea
                                rows={6}
                                placeholder="Enter detailed description"
                                showCount
                                maxLength={2000}
                            />
                        </Form.Item>
                    </Col>

                    {mode === "edit" && (
                        <>
                            <Col xs={24} lg={8}>
                                <Form.Item
                                    label={<span style={labelStyle}>Date Created</span>}
                                    name="created_at"
                                >
                                    <Input size="large" readOnly disabled />
                                </Form.Item>
                            </Col>

                            <Col xs={24} lg={8}>
                                <Form.Item
                                    label={<span style={labelStyle}>Date Modified</span>}
                                    name="updated_at"
                                >
                                    <Input size="large" readOnly disabled />
                                </Form.Item>
                            </Col>
                        </>
                    )}
                </Row>

                <div
                    style={{
                        display: "flex",
                        justifyContent: "flex-end",
                        marginTop: 12,
                        paddingTop: 16,
                        borderTop: `1px solid ${token.colorBorderSecondary}`,
                    }}
                >
                    <Space>
                        <Button size="large" onClick={() => navigate(`/${slug}/tasks`)}>
                            Cancel
                        </Button>

                        <Button
                            type="primary"
                            htmlType="submit"
                            size="large"
                            loading={loading}
                        >
                            {mode === "create" ? "Create Task" : "Update Task"}
                        </Button>
                    </Space>
                </div>
            </Form>
        </Card>
    );
}