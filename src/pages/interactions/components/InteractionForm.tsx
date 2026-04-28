import { MinusCircleOutlined, PlusOutlined } from "@ant-design/icons";
import {
    Button,
    Card,
    Col,
    DatePicker,
    Form,
    Input,
    Row,
    Segmented,
    Select,
    Space,
    Typography,
} from "antd";
import dayjs from "dayjs";
import { useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchContacts } from "../../../redux/reducers/contacts.slice";
import { fetchLeads } from "../../../redux/reducers/leads.slice";
import { fetchOpportunities } from "../../../redux/reducers/opportunities.slice";
import { getOrganization } from "../../../redux/reducers/organization.slice";
import { getUsers } from "../../../redux/reducers/user.slice";
import type { AppDispatch, RootState } from "../../../redux/store";
import { toTitleCase } from "../../../shared/Utils/utils";

const { TextArea } = Input;
const { Title } = Typography;

type OptionItem = {
    label: string;
    value: string;
};

type Props = {
    mode?: "create" | "edit";
    initialValues?: any;
    loading?: boolean;
    submitLoading?: boolean;
    onSubmit: (values: any) => void;
    submitText?: string;
};

const typeOptions = [
    { label: "Meeting", value: "meeting" },
    { label: "Call", value: "call" },
];

const statusOptions = [
    { label: "Planned", value: "planned" },
    { label: "Held", value: "held" },
    { label: "Not Held", value: "not_held" },
    { label: "Completed", value: "completed" },
    { label: "Cancelled", value: "cancelled" },
];

const relatedToOptions = [
    { label: "Lead", value: "lead" },
    { label: "Contact", value: "contact" },
    { label: "Organization", value: "organization" },
    { label: "Opportunity", value: "opportunity" },
];

const callPurposeOptions = [
    { label: "Follow Up", value: "follow_up" },
    { label: "Discussion", value: "discussion" },
    { label: "Demo", value: "demo" },
    { label: "Support", value: "support" },
];

const callOutcomeOptions = [
    { label: "Connected", value: "connected" },
    { label: "No Answer", value: "no_answer" },
    { label: "Interested", value: "interested" },
    { label: "Not Interested", value: "not_interested" },
    { label: "Call Back", value: "call_back" },
];

const reminderOptions = [
    { label: "5 min before", value: 5 },
    { label: "10 min before", value: 10 },
    { label: "15 min before", value: 15 },
    { label: "30 min before", value: 30 },
    { label: "1 hour before", value: 60 },
];

export default function InteractionForm({
    initialValues,
    onSubmit,
    loading,
    submitLoading,
    submitText = "Save",
    mode = "create",
}: Props) {

    const dispatch = useDispatch<AppDispatch>();
    const [form] = Form.useForm();

    const usersList = useSelector((state: RootState) => state.users?.userList || []);
    const leadsList = useSelector((state: RootState) => state.leads?.leads || []);
    const contactsList = useSelector((state: RootState) => state.contacts?.contactList || []);
    const organizationsList = useSelector(
        (state: RootState) => state?.organization?.orgList || []
    );
    const opportunitiesList = useSelector(
        (state: RootState) => state.opportunities?.opportunities || []
    );

    const userOptions = useMemo(
        () =>
            (usersList || []).map((item: any) => ({
                label: toTitleCase(item.name || item.full_name || item.email),
                value: item.id,
            })),
        [usersList]
    );

    const leadOptions = useMemo(
        () =>
            (leadsList || []).map((item: any) => ({
                label: item.lead_display_id
                    ? `${item.lead_display_id} - ${toTitleCase(item.first_name || "")} ${toTitleCase(item.last_name || "")}`.trim()
                    : toTitleCase(`${item.first_name || ""} ${item.last_name || ""}`.trim() || item.mobile),
                value: item.id,
            })),
        [leadsList]
    );

    const contactOptions = useMemo(
        () =>
            (contactsList || []).map((item: any) => ({
                label: toTitleCase(`${item.first_name || ""} ${item.last_name || ""}`.trim() || item.email),
                value: item.id,
            })),
        [contactsList]
    );

    const organizationOptions = useMemo(
        () =>
            (organizationsList || []).map((item: any) => ({
                label: toTitleCase(item.name),
                value: item.id,
            })),
        [organizationsList]
    );

    const opportunityOptions = useMemo(
        () =>
            (opportunitiesList || []).map((item: any) => ({
                label: toTitleCase(item.title || item.name || item.opportunity_name),
                value: item.id,
            })),
        [opportunitiesList]
    );

    const relatedToType = Form.useWatch("related_to_type", form);
    const type = Form.useWatch("type", form);

    const relatedRecordOptions = useMemo(() => {
        if (relatedToType === "lead") return leadOptions;
        if (relatedToType === "contact") return contactOptions;
        if (relatedToType === "organization") return organizationOptions;
        if (relatedToType === "opportunity") return opportunityOptions;
        return [];
    }, [relatedToType, leadOptions, contactOptions, organizationOptions, opportunityOptions]);





    useEffect(() => {
        dispatch(getUsers({ page: 1, limit: 1000 })).unwrap().catch(() => { });
        dispatch(fetchLeads({ page: 1, limit: 100 })).unwrap().catch(() => { });
        dispatch(fetchContacts({ page: 1, limit: 1000 })).unwrap().catch(() => { });
        dispatch(getOrganization({ page: 1, limit: 1000 })).unwrap().catch(() => { });
        dispatch(fetchOpportunities({ page: 1, limit: 1000 })).unwrap().catch(() => { });
    }, [dispatch]);


    useEffect(() => {
        if (initialValues) {
            form.setFieldsValue({
                ...initialValues,
                start_at: initialValues.start_at ? dayjs(initialValues.start_at) : undefined,
                end_at: initialValues.end_at ? dayjs(initialValues.end_at) : undefined,
                reminders: initialValues.reminders?.length
                    ? initialValues.reminders
                    : [{ minutes_before: 15 }],
                invitees:
                    initialValues.invitees?.length ? initialValues.invitees : [{ first_name: "", last_name: "", email: "" }],
            });
            return;
        }

        form.setFieldsValue({
            type: "meeting",
            status: "planned",
            reminders: [{ minutes_before: 15 }],
            invitees: [{ first_name: "", last_name: "", email: "" }],
        });
    }, [initialValues, form]);

    const handleFinish = (values: any) => {
        onSubmit({
            ...values,
            start_at: values.start_at?.toISOString?.() || values.start_at,
            end_at: values.end_at?.toISOString?.() || values.end_at,
            invitees:
                values.type === "meeting"
                    ? (values.invitees || []).filter(
                        (item: any) => item?.first_name || item?.last_name || item?.email
                    )
                    : [],
        });
    };

    if (loading) {
        return <Card bordered={false} loading style={{ borderRadius: 16 }} />;
    }

    return (
        <Form layout="vertical" form={form} onFinish={handleFinish}>
            <Card
                bordered={false}
                style={{ borderRadius: 16 }}
                bodyStyle={{ paddingBottom: 8 }}
            >
                <Row justify="space-between" align="middle" style={{ marginBottom: 16 }}>
                    <Col>
                        <Title level={4} style={{ margin: 0 }}>
                            Event Overview
                        </Title>
                    </Col>
                    <Col>
                        <Form.Item name="type" noStyle>
                            <Segmented options={typeOptions} />
                        </Form.Item>
                    </Col>
                </Row>

                <Row gutter={16}>
                    <Col xs={24} md={8}>
                        <Form.Item
                            name="subject"
                            label="Subject"
                            rules={[{ required: true, message: "Subject is required" }]}
                        >
                            <Input placeholder="Enter subject" />
                        </Form.Item>
                    </Col>

                    <Col xs={24} md={8}>
                        <Form.Item
                            name="status"
                            label="Status"
                            rules={[{ required: true, message: "Status is required" }]}
                        >
                            <Select options={statusOptions} placeholder="Select status" />
                        </Form.Item>
                    </Col>

                    <Col xs={24} md={8}>
                        <Form.Item name="assigned_to" label="Assigned To">
                            <Select
                                allowClear
                                showSearch
                                options={userOptions}
                                placeholder="Select user"
                                optionFilterProp="label"
                            />
                        </Form.Item>
                    </Col>

                    <Col xs={24} md={8}>
                        <Form.Item name="related_to_type" label="Related To">
                            <Select
                                allowClear
                                options={relatedToOptions}
                                placeholder="Select related type"
                                onChange={() => form.setFieldValue("related_to_id", undefined)}
                            />
                        </Form.Item>
                    </Col>

                    <Col xs={24} md={8}>
                        <Form.Item name="related_to_id" label="Related Record">
                            <Select
                                className="capitalize"
                                allowClear
                                showSearch
                                options={relatedRecordOptions}
                                placeholder="Select related record"
                                optionFilterProp="label"
                            />
                        </Form.Item>
                    </Col>

                    {type === "call" ? (
                        <Col xs={24} md={8}>
                            <Form.Item name="call_purpose" label="Call Purpose">
                                <Select
                                    allowClear
                                    options={callPurposeOptions}
                                    placeholder="Select call purpose"
                                />
                            </Form.Item>
                        </Col>
                    ) : (
                        <Col xs={24} md={8}>
                            <Form.Item name="location" label="Location">
                                <Input placeholder="Enter meeting location" />
                            </Form.Item>
                        </Col>
                    )}

                    <Col xs={24} md={8}>
                        <Form.Item
                            name="start_at"
                            label="Start Date & Time"
                            rules={[{ required: true, message: "Start date & time is required" }]}
                        >
                            <DatePicker disabledDate={(current) => current && current.isBefore(dayjs().startOf('day'))} showTime style={{ width: "100%" }} format="DD/MM/YYYY hh:mm A" />
                        </Form.Item>
                    </Col>

                    <Col xs={24} md={8}>
                        <Form.Item
                            name="end_at"
                            label="End Date & Time"
                            rules={[{ required: true, message: "End date & time is required" }]}
                        >
                            <DatePicker disabledDate={(current) => current && current.isBefore(dayjs().startOf('day'))} showTime style={{ width: "100%" }} format="DD/MM/YYYY hh:mm A" />
                        </Form.Item>
                    </Col>

                    {type === "call" ? (
                        <Col xs={24} md={8}>
                            <Form.Item name="call_outcome" label="Call Outcome">
                                <Select
                                    allowClear
                                    options={callOutcomeOptions}
                                    placeholder="Select call outcome"
                                />
                            </Form.Item>
                        </Col>
                    ) : (
                        <Col xs={24} md={8}>
                            <Form.Item name="duration_minutes" label="Duration (minutes)">
                                <Input type="number" placeholder="Enter duration" />
                            </Form.Item>
                        </Col>
                    )}

                    <Col span={24}>
                        <Form.Item name="description" label="Description">
                            <TextArea rows={4} placeholder="Enter description" />
                        </Form.Item>
                    </Col>
                </Row>
            </Card>

            <Card
                bordered={false}
                style={{ marginTop: 16, borderRadius: 16 }}
                title="Reminders"
            >
                <Form.List name="reminders">
                    {(fields, { add, remove }) => (
                        <>
                            {fields.map((field) => (
                                <Row gutter={16} key={field.key} align="middle">
                                    <Col xs={24} md={8}>
                                        <Form.Item
                                            {...field}
                                            name={[field.name, "minutes_before"]}
                                            label="Reminder"
                                            rules={[{ required: true, message: "Reminder is required" }]}
                                        >
                                            <Select options={reminderOptions} placeholder="Select reminder" />
                                        </Form.Item>
                                    </Col>

                                    <Col xs={24} md={4}>
                                        <Button
                                            danger
                                            icon={<MinusCircleOutlined />}
                                            onClick={() => remove(field.name)}
                                            style={{ marginTop: 30 }}
                                        >
                                            Remove
                                        </Button>
                                    </Col>
                                </Row>
                            ))}

                            <Button
                                type="dashed"
                                icon={<PlusOutlined />}
                                onClick={() => add({ minutes_before: 15 })}
                            >
                                Add Reminder
                            </Button>
                        </>
                    )}
                </Form.List>
            </Card>

            {type === "meeting" ? (
                <Card
                    bordered={false}
                    style={{ marginTop: 16, borderRadius: 16 }}
                    title="Invitees"
                >
                    <Form.List name="invitees">
                        {(fields, { add, remove }) => (
                            <>
                                {fields.map((field, index) => (
                                    <Card
                                        key={field.key}
                                        size="small"
                                        style={{ marginBottom: 16, borderRadius: 12 }}
                                        title={`Invitee ${index + 1}`}
                                        extra={
                                            fields.length > 1 ? (
                                                <Button
                                                    danger
                                                    type="text"
                                                    icon={<MinusCircleOutlined />}
                                                    onClick={() => remove(field.name)}
                                                >
                                                    Remove
                                                </Button>
                                            ) : null
                                        }
                                    >
                                        <Row gutter={16}>
                                            <Col xs={24} md={8}>
                                                <Form.Item {...field} name={[field.name, "first_name"]} label="First Name">
                                                    <Input placeholder="Enter first name" />
                                                </Form.Item>
                                            </Col>

                                            <Col xs={24} md={8}>
                                                <Form.Item {...field} name={[field.name, "last_name"]} label="Last Name">
                                                    <Input placeholder="Enter last name" />
                                                </Form.Item>
                                            </Col>

                                            <Col xs={24} md={8}>
                                                <Form.Item {...field} name={[field.name, "email"]} label="Email">
                                                    <Input placeholder="Enter email" />
                                                </Form.Item>
                                            </Col>
                                        </Row>
                                    </Card>
                                ))}

                                <Button
                                    type="dashed"
                                    icon={<PlusOutlined />}
                                    onClick={() => add({ first_name: "", last_name: "", email: "" })}
                                >
                                    Add Invitee
                                </Button>
                            </>
                        )}
                    </Form.List>
                </Card>
            ) : null}

            <Space style={{ marginTop: 16 }}>
                <Button type="primary" htmlType="submit" loading={submitLoading}>
                    {submitText}
                </Button>
            </Space>
        </Form>
    );
}