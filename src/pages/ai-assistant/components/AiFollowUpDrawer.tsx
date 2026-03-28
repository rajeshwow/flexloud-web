import { CopyOutlined, MailOutlined, WhatsAppOutlined } from "@ant-design/icons";
import { Button, Drawer, Input, Space, Typography, message } from "antd";

const { TextArea } = Input;
const { Text } = Typography;

type Props = {
    open: boolean;
    loading?: boolean;
    data?: {
        subject: string;
        message: string;
        channel: "email" | "whatsapp";
    } | null;
    onClose: () => void;
};

export default function AIFollowupDrawer({ open, loading, data, onClose }: Props) {
    const handleCopy = async () => {
        const textToCopy = `${data?.subject ? `Subject: ${data.subject}\n\n` : ""}${data?.message || ""}`;
        await navigator.clipboard.writeText(textToCopy);
        message.success("Draft copied");
    };

    return (
        <Drawer
            title="AI Follow-up Draft"
            width={560}
            open={open}
            onClose={onClose}
        >
            <Space direction="vertical" size={16} style={{ width: "100%" }}>
                <Space>
                    {data?.channel === "whatsapp" ? <WhatsAppOutlined /> : <MailOutlined />}
                    <Text strong>{data?.channel?.toUpperCase() || "DRAFT"}</Text>
                </Space>

                <Input
                    value={data?.subject || ""}
                    readOnly
                    placeholder="Subject"
                // loading={loading }
                />

                <TextArea
                    rows={12}
                    value={data?.message || ""}
                    readOnly
                    placeholder="Draft message"
                />

                <Space>
                    <Button type="primary" icon={<CopyOutlined />} onClick={handleCopy} disabled={!data}>
                        Copy
                    </Button>
                    <Button onClick={onClose}>Close</Button>
                </Space>
            </Space>
        </Drawer>
    );
}