import {
    FilePdfOutlined,
    MailOutlined,
    SendOutlined,
} from "@ant-design/icons";
import {
    Button,
    Checkbox,
    Form,
    Input,
    Modal,
    Space,
    Typography,
    message,
} from "antd";
import React, { useEffect, useMemo, useState } from "react";
import { Client } from "../../../shared/Utils/api-client";
import { withTenant } from "../../../shared/Utils/utils";

const { Text } = Typography;

type QuoteEmailModalProps = {
    open: boolean;
    quote: any;
    onClose: () => void;
    onSent?: () => void;
};

const QuoteEmailModal: React.FC<QuoteEmailModalProps> = ({
    open,
    quote,
    onClose,
    onSent,
}) => {
    const [form] = Form.useForm();
    const [sending, setSending] = useState(false);

    const quoteNo = useMemo(() => {
        return quote?.quote_number || quote?.quote_no || quote?.quote_display_id || "";
    }, [quote]);

    useEffect(() => {
        if (!open || !quote) return;

        const customerEmail =
            quote?.contact_email ||
            quote?.organization_email ||
            quote?.email ||
            "";

        const customerName =
            quote?.contact_name_display ||
            quote?.organization_name_display ||
            quote?.customer_name ||
            "Customer";

        form.setFieldsValue({
            to: customerEmail,
            cc: "",
            bcc: "",
            subject: `Quote - ${quoteNo} is awaiting your approval`,
            attachPdf: true,
            body: `Dear ${customerName},

Thank you for contacting us. Please find attached your quote.

You can review the quote details and let us know if any changes are required.

Regards,
FlexLoud`,
        });
    }, [open, quote, quoteNo, form]);

    const handleSend = async () => {
        try {
            const values = await form.validateFields();

            if (!quote?.id) {
                message.error("Quote id missing");
                return;
            }

            setSending(true);

            await Client.post(withTenant(`/quotes/${quote.id}/email`), {
                to: values.to,
                cc: values.cc || undefined,
                bcc: values.bcc || undefined,
                subject: values.subject,
                body: values.body?.replace(/\n/g, "<br/>"),
                attachPdf: values.attachPdf,
            });

            message.success("Quote email sent successfully");
            onSent?.();
            onClose();
        } catch (error: any) {
            if (error?.errorFields) return;

            message.error(
                error?.response?.data?.message || "Failed to send quote email",
            );
        } finally {
            setSending(false);
        }
    };

    return (
        <Modal
            open={open}
            title={
                <Space>
                    <MailOutlined />
                    <span>Email Quote</span>
                </Space>
            }
            onCancel={onClose}
            width={760}
            destroyOnHidden
            footer={[
                <Button key="cancel" onClick={onClose}>
                    Cancel
                </Button>,
                <Button
                    key="send"
                    type="primary"
                    icon={<SendOutlined />}
                    loading={sending}
                    onClick={handleSend}
                >
                    Send Email
                </Button>,
            ]}
        >
            <Form form={form} layout="vertical">
                <Form.Item
                    label="Send To"
                    name="to"
                    rules={[
                        { required: true, message: "Send To email is required" },
                        { type: "email", message: "Enter valid email" },
                    ]}
                >
                    <Input placeholder="customer@example.com" />
                </Form.Item>

                <Form.Item label="Cc" name="cc">
                    <Input placeholder="optional@example.com" />
                </Form.Item>

                <Form.Item label="Bcc" name="bcc">
                    <Input placeholder="optional@example.com" />
                </Form.Item>

                <Form.Item
                    label="Subject"
                    name="subject"
                    rules={[{ required: true, message: "Subject is required" }]}
                >
                    <Input />
                </Form.Item>

                <Form.Item
                    label="Email Body"
                    name="body"
                    rules={[{ required: true, message: "Email body is required" }]}
                >
                    <Input.TextArea rows={8} />
                </Form.Item>

                <Form.Item name="attachPdf" valuePropName="checked">
                    <Checkbox>
                        <Space>
                            <FilePdfOutlined style={{ color: "#ef4444" }} />
                            <span>Attach Quote PDF</span>
                            {quoteNo ? <Text type="secondary">({quoteNo}.pdf)</Text> : null}
                        </Space>
                    </Checkbox>
                </Form.Item>
            </Form>
        </Modal>
    );
};

export default QuoteEmailModal;