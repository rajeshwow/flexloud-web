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
import { useDispatch } from "react-redux";
import { sendDeliveryChallanEmail } from "../../../redux/reducers/deliveryChallans/deliveryChallanSlice";
import type { AppDispatch } from "../../../redux/store";

const { Text } = Typography;

type DeliveryChallanEmailModalProps = {
    open: boolean;
    challan: any;
    onClose: () => void;
    onSent?: () => void;
};

const DeliveryChallanEmailModal: React.FC<DeliveryChallanEmailModalProps> = ({
    open,
    challan,
    onClose,
    onSent,
}) => {
    const [form] = Form.useForm();
    const [sending, setSending] = useState(false);
    const dispatch = useDispatch<AppDispatch>();

    const challanNo = useMemo(() => {
        return challan?.challan_number || challan?.delivery_challan_number || "";
    }, [challan]);

    useEffect(() => {
        if (!open || !challan) return;

        const customerEmail =
            challan?.customer_email ||
            challan?.organization_email ||
            challan?.contact_email ||
            challan?.email ||
            "";

        const customerName =
            challan?.customer_name ||
            challan?.organization_name ||
            challan?.contact_name ||
            "Customer";

        form.setFieldsValue({
            to: customerEmail,
            cc: "",
            bcc: "",
            subject: `Delivery Challan - ${challanNo}`,
            attachPdf: true,
            body: `Dear ${customerName},

Please find attached your delivery challan.

Kindly confirm once the goods/items are received.

Regards,
FlexLoud`,
        });
    }, [open, challan, challanNo, form]);

    const handleSend = async () => {
        try {
            const values = await form.validateFields();

            if (!challan?.id) {
                message.error("Delivery challan id missing");
                return;
            }

            setSending(true);

            const res = await dispatch(sendDeliveryChallanEmail({
                id: challan.id,
                to: values.to,
                cc: values.cc || undefined,
                bcc: values.bcc || undefined,
                subject: values.subject,
                body: values.body?.replace(/\n/g, "<br/>"),
                attachPdf: values.attachPdf,
            }));

            message.success("Delivery challan email sent successfully");
            onSent?.();
            onClose();
        } catch (error: any) {
            if (error?.errorFields) return;

            message.error(
                error?.response?.data?.message ||
                "Failed to send delivery challan email",
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
                    <span>Email Delivery Challan</span>
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
                            <span>Attach Delivery Challan PDF</span>
                            {challanNo ? (
                                <Text type="secondary">({challanNo}.pdf)</Text>
                            ) : null}
                        </Space>
                    </Checkbox>
                </Form.Item>
            </Form>
        </Modal>
    );
};

export default DeliveryChallanEmailModal;