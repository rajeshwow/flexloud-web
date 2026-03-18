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
    | "opportunity"
    | "none";

export type TaskStatus =
    | "not_started"
    | "in_progress"
    | "completed"
    | "waiting"
    | "deferred";

export type TaskPriority = "low" | "medium" | "high" | "urgent";

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
    relatedItemOptions?: OptionType[];

    onRelatedTypeChange?: (value: TaskRelatedType) => void;
};

const STATUS_OPTIONS: OptionType[] = [
    { label: "Not Started", value: "not_started" },
    { label: "In Progress", value: "in_progress" },
    { label: "Completed", value: "completed" },
    { label: "Waiting", value: "waiting" },
    { label: "Deferred", value: "deferred" },
];

const PRIORITY_OPTIONS: OptionType[] = [
    { label: "Low", value: "low" },
    { label: "Medium", value: "medium" },
    { label: "High", value: "high" },
    { label: "Urgent", value: "urgent" },
];

const RELATED_TO_OPTIONS: OptionType[] = [
    { label: "None", value: "none" },
    { label: "Organization", value: "organization" },
    { label: "Contact", value: "contact" },
    { label: "Lead", value: "lead" },
    { label: "Opportunity", value: "opportunity" },
];

const REPEAT_OPTIONS: OptionType[] = [
    { label: "None", value: "none" },
    { label: "Daily", value: "daily" },
    { label: "Weekly", value: "weekly" },
    { label: "Monthly", value: "monthly" },
    { label: "Yearly", value: "yearly" },
];

function formatDuration(start?: Dayjs, end?: Dayjs) {
    if (!start || !end) {
        return {
            text: "",
            minutes: null,
        };
    }

    const diffMinutes = end.diff(start, "minute");

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

}: Props) {
    const { token } = theme.useToken();

    const startDate = Form.useWatch("start_date", form);
    const endDate = Form.useWatch("end_date", form);
    const repeatTask = Form.useWatch("repeat_task", form);
    const relatedTo = Form.useWatch("related_to_type", form);

    const dispatch = useDispatch<any>();

    const [relatedToType, setRelatedToType] = useState<string>();
    const [relatedToOptions, setRelatedToOptions] = useState<{ label: string; value: string }[]>([]);


    const duration = useMemo(() => {
        return formatDuration(startDate, endDate);
    }, [startDate, endDate]);

    const normalizeOptions = (list: any[], type: string) => {
        switch (type) {
            case "organization":
                return list.map((item) => ({
                    label: item.name,
                    value: item.id,
                }));

            case "contact":
                return list.map((item) => ({
                    label: `${item.first_name} ${item.last_name || ""}`.trim(),
                    value: item.id,
                }));

            case "lead":
                return list.map((item) => ({
                    label: `${item.first_name} ${item.last_name || ""}`.trim(),
                    value: item.id,
                }));

            case "opportunity":
                return list.map((item) => ({
                    label: item.name || item.title,
                    value: item.id,
                }));

            default:
                return [];
        }
    };


    const handleRelatedToTypeChange = async (value: string) => {
        setRelatedToType(value);

        form.setFieldsValue({
            related_to_id: undefined,
        });

        try {
            let list: any[] = [];

            if (value === "organization") {
                const res = await dispatch(getOrganization({ page: 1, limit: 100 })).unwrap();
                list = res?.data || [];
            } else if (value === "contact") {
                const res = await dispatch(fetchContacts({ page: 1, limit: 100 })).unwrap();
                list = res?.data || [];
            } else if (value === "lead") {
                const res = await dispatch(fetchLeads({ page: 1, limit: 100 })).unwrap();
                list = res?.data || [];
            } else if (value === "opportunity") {
                const res = await dispatch(fetchOpportunities({ page: 1, limit: 100 })).unwrap();
                list = res?.data || [];
            }

            setRelatedToOptions(normalizeOptions(list, value));
        } catch (error) {
            setRelatedToOptions([]);
            message.error("Failed to load related options");
        }
    };

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
                    priority: "medium",
                    related_to_type: "organization",
                    repeat_task: "none",
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
                                disabledDate={(current: any) => current.isBefore(dayjs().startOf("day"))}
                                disabledTime={(current: any) => current.isBefore(dayjs().startOf("day"))}
                            />
                        </Form.Item>
                    </Col>
                    <Col xs={24} lg={8}>
                        <Form.Item
                            label={<span style={labelStyle}>End Date</span>}
                            name="end_date"
                            rules={[{ required: true, message: "Please select end date" }]}
                            dependencies={["start_date"]}
                            extra={
                                startDate && endDate && dayjs(endDate).isBefore(dayjs(startDate))
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
                                disabledDate={(current: any) => current.isBefore(form.getFieldValue("start_date"))}
                                disabledTime={(current: any) => current.isBefore(form.getFieldValue("start_date"))}
                            />
                        </Form.Item>
                    </Col>

                    <Col span={8}>
                        <Form.Item name="related_to_type" label="Related To">
                            <Select placeholder="Select type" onChange={handleRelatedToTypeChange} allowClear>
                                <Select.Option value="organization">Organization</Select.Option>
                                <Select.Option value="contact">Contact</Select.Option>
                                <Select.Option value="lead">Lead</Select.Option>
                                <Select.Option value="opportunity">Opportunity</Select.Option>
                            </Select>
                        </Form.Item>
                    </Col>

                    <Col span={8}>
                        <Form.Item name="related_to_id" label=" ">
                            <Select
                                placeholder="Select an item"
                                disabled={!relatedToType}
                                allowClear
                                showSearch
                                optionFilterProp="children"
                            >
                                {relatedToOptions.map((item) => (
                                    <Select.Option key={item.value} value={item.value}>
                                        {item.label}
                                    </Select.Option>
                                ))}
                            </Select>
                        </Form.Item>
                    </Col>



                    <Col xs={24} lg={8}>
                        <Form.Item
                            label={<span style={labelStyle}>Priority</span>}
                            name="priority"
                            rules={[{ required: true, message: "Please select priority" }]}
                        >
                            <Select
                                size="large"
                                placeholder="Select priority"
                                options={PRIORITY_OPTIONS}
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

                    <Col xs={24} lg={8}>
                        <Form.Item
                            label={<span style={labelStyle}>Assigned To</span>}
                            name="assigned_to"
                        >
                            <Select
                                allowClear
                                showSearch
                                optionFilterProp="label"
                                size="large"
                                placeholder="Select assignee"
                                options={userOptions}
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
                        <Button size="large">
                            Cancel
                        </Button>
                        <Button type="primary" htmlType="submit" size="large" loading={loading}>
                            {mode === "create" ? "Create Task" : "Update Task"}
                        </Button>
                    </Space>
                </div>
            </Form>
        </Card>
    );
}