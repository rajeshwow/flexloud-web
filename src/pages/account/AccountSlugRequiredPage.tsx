import {
    ApartmentOutlined,
    ArrowRightOutlined,
    GlobalOutlined,
    LinkOutlined,
    SafetyCertificateOutlined,
} from "@ant-design/icons";
import {
    Alert,
    Button,
    Card,
    Divider,
    Form,
    Input,
    Space,
    Typography,
} from "antd";
import React from "react";
import { useNavigate } from "react-router-dom";

const { Title, Text, Paragraph } = Typography;

const AccountSlugRequiredPage: React.FC = () => {
    const navigate = useNavigate();

    const handleSubmit = (values: { slug: string }) => {
        const slug = values.slug?.trim();

        if (!slug) return;

        navigate(`/${slug}/dashboard`);
    };

    return (
        <div
            style={{
                minHeight: "100vh",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: 24,
                background:
                    "linear-gradient(135deg, rgba(24,144,255,0.08), rgba(114,46,209,0.08))",
            }}
        >
            <Card
                style={{
                    width: "100%",
                    maxWidth: 620,
                    borderRadius: 20,
                    boxShadow: "0 18px 50px rgba(0,0,0,0.08)",
                }}
                styles={{
                    body: {
                        padding: 36,
                    },
                }}
            >
                <Space direction="vertical" size={22} style={{ width: "100%" }}>
                    <div style={{ textAlign: "center" }}>
                        <div
                            style={{
                                width: 74,
                                height: 74,
                                borderRadius: "50%",
                                margin: "0 auto 18px",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                background: "rgba(22,119,255,0.1)",
                                color: "#1677ff",
                                fontSize: 34,
                            }}
                        >
                            <ApartmentOutlined />
                        </div>

                        <Title level={2} style={{ marginBottom: 8 }}>
                            Account slug required
                        </Title>

                        <Paragraph type="secondary" style={{ marginBottom: 0 }}>
                            Please enter your account slug to continue to your CRM workspace.
                        </Paragraph>
                    </div>

                    <Alert
                        showIcon
                        icon={<LinkOutlined />}
                        type="info"
                        message="Your CRM URL should include your account slug"
                        description={
                            <div>
                                Example:{" "}
                                <Text code>
                                    https://yourdomain.com/flexloud-demo/dashboard
                                </Text>
                            </div>
                        }
                    />

                    <Form layout="vertical" onFinish={handleSubmit}>
                        <Form.Item
                            label="Account slug"
                            name="slug"
                            rules={[
                                {
                                    required: true,
                                    message: "Please enter your account slug",
                                },
                                {
                                    pattern: /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
                                    message:
                                        "Slug can contain lowercase letters, numbers and hyphens only",
                                },
                            ]}
                        >
                            <Input
                                size="large"
                                prefix={<GlobalOutlined />}
                                placeholder="example: flexloud-demo"
                                autoFocus
                            />
                        </Form.Item>

                        <Button
                            type="primary"
                            htmlType="submit"
                            size="large"
                            block
                            icon={<ArrowRightOutlined />}
                        >
                            Continue to account
                        </Button>
                    </Form>

                    <Divider style={{ margin: "4px 0" }} />

                    <Space align="start">
                        <SafetyCertificateOutlined
                            style={{ color: "#52c41a", fontSize: 20, marginTop: 3 }}
                        />
                        <div>
                            <Text strong>Multi-tenant protected access</Text>
                            <br />
                            <Text type="secondary">
                                Each company uses a separate slug so data stays isolated by
                                tenant.
                            </Text>
                        </div>
                    </Space>
                </Space>
            </Card>
        </div>
    );
};

export default AccountSlugRequiredPage;