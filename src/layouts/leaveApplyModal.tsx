import { CalendarOutlined } from "@ant-design/icons";
import { Button, DatePicker, Form, Input, Modal, Select, Space, Typography, message } from "antd";
import dayjs from "dayjs";
import { useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { applyLeave, getMyLeaves } from "../redux/reducers/leave.slice";
import type { AppDispatch, RootState } from "../redux/store";

const { Text } = Typography;
const { RangePicker } = DatePicker;
const { TextArea } = Input;

type Props = {
    open: boolean;
    onClose: () => void;
};

const leaveTypeOptions = [
    { label: "Casual Leave", value: "casual" },
    { label: "Sick Leave", value: "sick" },
    { label: "Paid Leave", value: "paid" },
    { label: "Unpaid Leave", value: "unpaid" },
    { label: "Optional Leave", value: "optional" },
];

const LEAVE_RULES = {
    casual: {
        maxConsecutiveDays: 3,
        minNoticeDays: 1,
        label: "Casual Leave",
    },
    sick: {
        maxConsecutiveDays: 5,
        minNoticeDays: 0,
        label: "Sick Leave",
    },
    paid: {
        maxConsecutiveDays: 7,
        minNoticeDays: 3,
        label: "Paid Leave",
    },
    unpaid: {
        maxConsecutiveDays: 10,
        minNoticeDays: 0,
        label: "Unpaid Leave",
    },
    optional: {
        maxConsecutiveDays: 1,
        minNoticeDays: 0,
        label: "Optional Leave",
    },
} as const;

export default function LeaveApplyModal({ open, onClose }: Props) {
    const dispatch = useDispatch<AppDispatch>();
    const [form] = Form.useForm();

    const selectedLeaveType = Form.useWatch("leave_type", form);
    const selectedDateRange = Form.useWatch("date_range", form);

    const { loading } = useSelector((state: RootState) => state.leaves);
    const { token } = (window as any)?.antdTheme?.useToken?.() || { token: {} };

    useEffect(() => {
        if (!open) {
            form.resetFields();
        }
    }, [open, form]);

    const modalStyles = useMemo(
        () => ({
            content: {
                borderRadius: 16,
                overflow: "hidden",
            } as React.CSSProperties,
            body: {
                paddingTop: 12,
            } as React.CSSProperties,
        }),
        []
    );

    const disabledDate = (current: dayjs.Dayjs) => {
        return current && current.startOf("day").isBefore(dayjs().startOf("day"));
    };

    const handleSubmit = async () => {
        try {
            const values = await form.validateFields();

            const [start, end] = values.date_range || [];
            const rule = LEAVE_RULES[values.leave_type as keyof typeof LEAVE_RULES];

            if (start && end && rule) {
                const totalDays = end.startOf("day").diff(start.startOf("day"), "day") + 1;
                const noticeDays = start.startOf("day").diff(dayjs().startOf("day"), "day");

                if (totalDays > rule.maxConsecutiveDays) {
                    return message.error(
                        `Maximum ${rule.maxConsecutiveDays} day(s) allowed for ${rule.label}.`
                    );
                }

                if (noticeDays < rule.minNoticeDays) {
                    return message.error(
                        `${rule.label} requires at least ${rule.minNoticeDays} day(s) advance notice.`
                    );
                }
            }


            const payload = {
                leave_type: values.leave_type,
                start_date: values.date_range?.[0]?.format("YYYY-MM-DD"),
                end_date: values.date_range?.[1]?.format("YYYY-MM-DD"),
                reason: values.reason?.trim() || undefined,
            };

            await dispatch(applyLeave(payload)).unwrap();
            message.success("Leave applied successfully");
            form.resetFields();
            onClose();
            dispatch(getMyLeaves({ page: 1, limit: 10 }));
        } catch (error: any) {
            if (error?.errorFields) return;
            message.error(error || "Failed to apply leave");
        }
    };

    useEffect(() => {
        if (selectedDateRange) {
            form.validateFields(["date_range"]).catch(() => { });
        }
    }, [selectedLeaveType, selectedDateRange, form]);

    return (
        <Modal
            open={open}
            onCancel={onClose}
            title={
                <Space size={10}>
                    <CalendarOutlined />
                    <span>Apply Leave</span>
                </Space>
            }
            footer={[
                <Button key="cancel" onClick={onClose}>
                    Cancel
                </Button>,
                <Button key="submit" type="primary" loading={loading} onClick={handleSubmit}>
                    Apply Leave
                </Button>,
            ]}
            destroyOnClose
            width={560}
            styles={modalStyles as any}
        >
            <div
                style={{
                    padding: 12,
                    borderRadius: 14,
                    background: token?.colorFillAlter || "rgba(0,0,0,0.02)",
                    border: `1px solid ${token?.colorBorderSecondary || "#f0f0f0"}`,
                }}
            >
                <Form form={form} layout="vertical" requiredMark={false}>
                    <Form.Item
                        label="Leave Type"
                        name="leave_type"
                        rules={[{ required: true, message: "Please select leave type" }]}
                    >
                        <Select
                            placeholder="Select leave type"
                            options={leaveTypeOptions}
                            size="large"
                            onChange={() => {
                                form.setFieldsValue({ date_range: undefined });
                            }}
                        />
                    </Form.Item>
                    {selectedLeaveType && LEAVE_RULES[selectedLeaveType as keyof typeof LEAVE_RULES] ? (
                        <div style={{ marginTop: -8, marginBottom: 12 }}>
                            <Text type="secondary" style={{ fontSize: 12 }}>
                                Max{" "}
                                {LEAVE_RULES[selectedLeaveType as keyof typeof LEAVE_RULES].maxConsecutiveDays}{" "}
                                day(s) allowed. Advance notice:{" "}
                                {LEAVE_RULES[selectedLeaveType as keyof typeof LEAVE_RULES].minNoticeDays}{" "}
                                day(s).
                            </Text>
                        </div>
                    ) : null}

                    <Form.Item
                        label="Leave Dates"
                        name="date_range"

                        rules={[
                            { required: true, message: "Please select leave dates" },
                            {
                                validator: async (_, value) => {
                                    if (!value || !selectedLeaveType) return Promise.resolve();

                                    const [start, end] = value;
                                    if (!start || !end) return Promise.resolve();

                                    const rule =
                                        LEAVE_RULES[selectedLeaveType as keyof typeof LEAVE_RULES];
                                    if (!rule) return Promise.resolve();

                                    const totalDays = end.startOf("day").diff(start.startOf("day"), "day") + 1;

                                    if (totalDays > rule.maxConsecutiveDays) {
                                        return Promise.reject(
                                            new Error(`Maximum ${rule.maxConsecutiveDays} day(s) allowed for ${rule.label}.`)
                                        );
                                    }

                                    const today = dayjs().startOf("day");
                                    const noticeDays = start.startOf("day").diff(today, "day");

                                    if (noticeDays < rule.minNoticeDays) {
                                        return Promise.reject(
                                            new Error(
                                                `${rule.label} requires at least ${rule.minNoticeDays} day(s) advance notice.`
                                            )
                                        );
                                    }

                                    return Promise.resolve();
                                },
                            },
                        ]}
                    >
                        <RangePicker
                            style={{ width: "100%" }}
                            size="large"
                            disabled={!selectedLeaveType}
                            disabledDate={disabledDate}
                            format="DD MMM YYYY"
                        />
                    </Form.Item>
                    {selectedLeaveType && selectedDateRange?.[0] && selectedDateRange?.[1] ? (
                        <div style={{ marginTop: -8, marginBottom: 12 }}>
                            <Text type="secondary" style={{ fontSize: 12 }}>
                                Total days:{" "}
                                {selectedDateRange[1].startOf("day").diff(selectedDateRange[0].startOf("day"), "day") + 1}
                            </Text>
                        </div>
                    ) : null}

                    <Form.Item
                        label="Reason"
                        name="reason"
                        rules={[
                            { required: true, message: "Please enter reason" },
                            { max: 1000, message: "Reason must be under 1000 characters" },
                        ]}
                    >
                        <TextArea
                            rows={4}
                            placeholder="Write your reason for leave"
                            showCount
                            maxLength={1000}
                        />
                    </Form.Item>

                    <Text type="secondary" style={{ fontSize: 12 }}>
                        Leave request will be submitted for approval.
                    </Text>
                </Form>
            </div>
        </Modal>
    );
}