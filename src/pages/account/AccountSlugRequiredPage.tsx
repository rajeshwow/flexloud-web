import {
    ApartmentOutlined,
    ArrowRightOutlined,
    CrownOutlined,
    GlobalOutlined,
    LinkOutlined,
    SafetyCertificateOutlined,
    TeamOutlined,
} from "@ant-design/icons";
import {
    Alert,
    Button,
    Card,
    Divider,
    Form,
    Grid,
    Input,
    Space,
    Typography,
} from "antd";
import React from "react";
import { useNavigate } from "react-router-dom";

const { Title, Text, Paragraph } = Typography;
const { useBreakpoint } = Grid;

const AccountSlugRequiredPage: React.FC = () => {
    const navigate = useNavigate();
    const screens = useBreakpoint();

    const handleSubmit = (values: { slug: string }) => {
        const slug = values.slug?.trim();

        if (!slug) return;

        navigate(`/${slug}/login`);
    };

    const isMobile = !screens.md;

    return (
        <>
            <style>{accountPageCss}</style>

            <div style={styles.page}>
                <div style={styles.texture} />
                <div style={styles.goldGlow} />
                <div style={styles.blueGlow} />
                <div style={styles.redGlow} />

                <div className="account-orb account-orb-1" />
                <div className="account-orb account-orb-2" />
                <div className="account-orb account-orb-3" />

                <div style={styles.wrap}>
                    <Card
                        bordered={false}
                        className="classic-account-card"
                        style={{
                            ...styles.card,
                            maxWidth: isMobile ? "100%" : 680,
                        }}
                        styles={{
                            body: {
                                padding: isMobile ? 24 : 38,
                            },
                        }}
                    >
                        <Space direction="vertical" size={24} style={{ width: "100%" }}>
                            <div className="classic-fade-up" style={{ textAlign: "center" }}>
                                <div style={styles.iconWrap}>
                                    <ApartmentOutlined />
                                </div>

                                <div style={styles.badge}>
                                    <CrownOutlined />
                                    <span>Workspace Access</span>
                                </div>

                                <Title
                                    level={2}
                                    style={{
                                        margin: "14px 0 8px",
                                        color: "#211308",
                                        fontFamily: "Georgia, 'Times New Roman', serif",
                                        fontSize: isMobile ? 30 : 36,
                                    }}
                                >
                                    Account name required
                                </Title>

                                <Paragraph
                                    style={{
                                        marginBottom: 0,
                                        color: "#765436",
                                        fontSize: 15,
                                        lineHeight: 1.8,
                                    }}
                                >
                                    Please enter your account name to continue to your CRM workspace.
                                </Paragraph>
                            </div>

                            <Alert
                                className="classic-alert"
                                showIcon
                                icon={<LinkOutlined />}
                                type="info"
                                message={
                                    <Text strong style={{ color: "#2b1709" }}>
                                        Your CRM URL should include your account name
                                    </Text>
                                }
                                description={
                                    <div style={{ color: "#765436", lineHeight: 1.8 }}>
                                        Example:{" "}
                                        <Text code className="classic-url-code">
                                            https://yourdomain.com/
                                            <span className="account-highlight">flexloud-demo</span>
                                            /login
                                        </Text>
                                        <br />
                                        <Text style={{ color: "#7c5b3b" }}>
                                            Here{" "}
                                            <span style={styles.inlineHighlight}>flexloud-demo</span>{" "}
                                            is your account name.
                                        </Text>
                                    </div>
                                }
                            />

                            <div className="classic-admin-note" style={styles.adminNote}>
                                <TeamOutlined style={styles.adminIcon} />
                                <Text style={{ color: "#5f3e22", fontSize: 14 }}>
                                    Contact your team admin to get this account name.
                                </Text>
                            </div>

                            <Form layout="vertical" onFinish={handleSubmit}>
                                <Form.Item
                                    label={<span style={styles.label}>Account name</span>}
                                    name="slug"
                                    rules={[
                                        {
                                            required: true,
                                            message: "Please enter your account name",
                                        },
                                        {
                                            pattern: /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
                                            message:
                                                "Account name can contain lowercase letters, numbers and hyphens only",
                                        },
                                    ]}
                                >
                                    <Input
                                        className="classic-account-input"
                                        size="large"
                                        prefix={<GlobalOutlined style={{ color: "#a16207" }} />}
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
                                    className="classic-account-btn"
                                    style={styles.button}
                                >
                                    Continue to Login
                                </Button>
                            </Form>

                            <Divider style={{ margin: "2px 0", borderColor: "rgba(120,53,15,0.14)" }} />

                            <Space align="start" className="classic-bottom-note">
                                <SafetyCertificateOutlined
                                    style={{
                                        color: "#15803d",
                                        fontSize: 21,
                                        marginTop: 3,
                                    }}
                                />

                                <div>
                                    <Text strong style={{ color: "#2b1709" }}>
                                        Multi-tenant protected access
                                    </Text>
                                    <br />
                                    <Text style={{ color: "#7a5b3e" }}>
                                        Each company uses a separate account name so data stays isolated by tenant.
                                    </Text>
                                </div>
                            </Space>
                        </Space>
                    </Card>
                </div>
            </div>
        </>
    );
};

export default AccountSlugRequiredPage;

const styles: Record<string, React.CSSProperties> = {
    page: {
        minHeight: "100vh",
        position: "relative",
        overflow: "hidden",
        background:
            "radial-gradient(circle at 12% 10%, rgba(251, 191, 36, 0.34), transparent 27%), radial-gradient(circle at 88% 18%, rgba(37, 99, 235, 0.26), transparent 26%), linear-gradient(135deg, #180b05 0%, #331407 35%, #5f1e0b 64%, #111827 100%)",
    },

    wrap: {
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
        position: "relative",
        zIndex: 2,
    },

    texture: {
        position: "absolute",
        inset: 0,
        opacity: 0.13,
        backgroundImage: `
      linear-gradient(45deg, rgba(255,255,255,0.08) 25%, transparent 25%),
      linear-gradient(-45deg, rgba(255,255,255,0.08) 25%, transparent 25%),
      linear-gradient(45deg, transparent 75%, rgba(255,255,255,0.08) 75%),
      linear-gradient(-45deg, transparent 75%, rgba(255,255,255,0.08) 75%)
    `,
        backgroundSize: "36px 36px",
        backgroundPosition: "0 0, 0 18px, 18px -18px, -18px 0px",
        pointerEvents: "none",
    },

    goldGlow: {
        position: "absolute",
        width: 460,
        height: 460,
        borderRadius: "50%",
        background: "rgba(251, 191, 36, 0.28)",
        filter: "blur(95px)",
        top: -140,
        left: -130,
    },

    blueGlow: {
        position: "absolute",
        width: 420,
        height: 420,
        borderRadius: "50%",
        background: "rgba(37, 99, 235, 0.26)",
        filter: "blur(105px)",
        right: -120,
        top: 80,
    },

    redGlow: {
        position: "absolute",
        width: 380,
        height: 380,
        borderRadius: "50%",
        background: "rgba(220, 38, 38, 0.22)",
        filter: "blur(110px)",
        bottom: -140,
        left: "38%",
    },

    card: {
        width: "100%",
        position: "relative",
        borderRadius: 34,
        background:
            "linear-gradient(145deg, rgba(255, 251, 235, 0.97), rgba(255, 237, 213, 0.95))",
        border: "1px solid rgba(120, 53, 15, 0.16)",
        boxShadow: "0 35px 90px rgba(0,0,0,0.35)",
        overflow: "hidden",
    },

    iconWrap: {
        width: 82,
        height: 82,
        borderRadius: "50%",
        margin: "0 auto 16px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #f59e0b, #dc2626)",
        color: "#fff",
        fontSize: 38,
        boxShadow: "0 18px 38px rgba(180, 83, 9, 0.34)",
    },

    badge: {
        display: "inline-flex",
        alignItems: "center",
        gap: 8,
        padding: "7px 14px",
        borderRadius: 999,
        background: "linear-gradient(135deg, #fff7ed, #fed7aa)",
        border: "1px solid rgba(194, 65, 12, 0.22)",
        color: "#9a3412",
        fontSize: 12,
        fontWeight: 900,
        boxShadow: "0 8px 18px rgba(194,65,12,0.12)",
    },

    label: {
        color: "#3f2411",
        fontWeight: 800,
    },

    button: {
        height: 50,
        borderRadius: 15,
        fontWeight: 900,
        fontSize: 15,
        marginTop: 8,
        background: "linear-gradient(135deg, #b45309 0%, #dc2626 48%, #1d4ed8 100%)",
        border: "none",
        boxShadow: "0 16px 34px rgba(180, 83, 9, 0.36)",
    },

    adminNote: {
        display: "flex",
        alignItems: "center",
        gap: 12,
        padding: "13px 15px",
        borderRadius: 18,
        background: "linear-gradient(135deg, rgba(253, 230, 138, 0.42), rgba(254, 215, 170, 0.38))",
        border: "1px solid rgba(180, 83, 9, 0.18)",
    },

    adminIcon: {
        width: 36,
        height: 36,
        minWidth: 36,
        borderRadius: 12,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#fff7ed",
        color: "#b45309",
        fontSize: 17,
        boxShadow: "0 10px 18px rgba(120, 53, 15, 0.1)",
    },

    inlineHighlight: {
        padding: "2px 7px",
        borderRadius: 8,
        background: "linear-gradient(135deg, #f59e0b, #dc2626)",
        color: "#fff",
        fontWeight: 900,
    },
};

const accountPageCss = `
  .classic-account-card {
    animation: classicFadeUp 720ms ease both;
  }

  .classic-account-card::before {
    content: "";
    position: absolute;
    top: -90px;
    right: -90px;
    width: 220px;
    height: 220px;
    border-radius: 50%;
    background: rgba(251, 191, 36, 0.27);
    pointer-events: none;
  }

  .classic-account-card::after {
    content: "";
    position: absolute;
    left: -80px;
    bottom: -100px;
    width: 210px;
    height: 210px;
    border-radius: 50%;
    background: rgba(37, 99, 235, 0.17);
    pointer-events: none;
  }

  .classic-alert {
    border-radius: 20px;
    border: 1px solid rgba(180, 83, 9, 0.16);
    background: linear-gradient(135deg, rgba(255, 247, 237, 0.9), rgba(254, 215, 170, 0.58));
    box-shadow: 0 14px 32px rgba(120, 53, 15, 0.08);
  }

  .classic-alert .ant-alert-icon {
    color: #b45309 !important;
    font-size: 20px;
  }

  .classic-url-code {
    display: inline-block;
    margin-top: 4px;
    padding: 7px 10px !important;
    border-radius: 12px !important;
    background: rgba(67, 34, 10, 0.88) !important;
    color: #ffedd5 !important;
    border: 1px solid rgba(251, 191, 36, 0.22);
    white-space: normal;
    word-break: break-word;
  }

  .account-highlight {
    color: #fde68a;
    font-weight: 900;
    text-decoration: underline;
    text-decoration-thickness: 2px;
    text-underline-offset: 3px;
  }

  .classic-admin-note {
    animation: softPulse 2.8s ease-in-out infinite;
  }

  .classic-account-input.ant-input-affix-wrapper {
    height: 50px;
    border-radius: 15px;
    background: rgba(255, 247, 237, 0.92);
    border: 1px solid rgba(120, 53, 15, 0.16);
    box-shadow: inset 0 1px 0 rgba(255,255,255,0.7), 0 8px 18px rgba(120,53,15,0.06);
    transition: all 220ms ease;
  }

  .classic-account-input.ant-input-affix-wrapper:hover,
  .classic-account-input.ant-input-affix-wrapper-focused {
    border-color: rgba(194, 65, 12, 0.55);
    box-shadow: 0 0 0 4px rgba(251, 146, 60, 0.14), 0 10px 22px rgba(120,53,15,0.08);
  }

  .classic-account-input .ant-input {
    background: transparent !important;
    color: #2b1709;
    font-weight: 700;
  }

  .classic-account-input .ant-input::placeholder {
    color: rgba(120, 53, 15, 0.42);
  }

  .classic-account-btn {
    position: relative;
    overflow: hidden;
    transition: transform 220ms ease, box-shadow 220ms ease, filter 220ms ease;
  }

  .classic-account-btn:hover {
    transform: translateY(-2px);
    filter: brightness(1.06);
    box-shadow: 0 22px 42px rgba(180, 83, 9, 0.42) !important;
  }

  .classic-account-btn::before {
    content: "";
    position: absolute;
    top: 0;
    left: -120%;
    width: 70%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.38), transparent);
    transform: skewX(-20deg);
    animation: buttonShine 2.8s ease-in-out infinite;
  }

  .classic-bottom-note {
    padding: 12px 14px;
    border-radius: 18px;
    background: rgba(255, 247, 237, 0.58);
    border: 1px solid rgba(120, 53, 15, 0.1);
  }

  .account-orb {
    position: absolute;
    border-radius: 999px;
    border: 1px solid rgba(255,255,255,0.16);
    background: rgba(255,255,255,0.08);
    backdrop-filter: blur(10px);
    pointer-events: none;
  }

  .account-orb-1 {
    width: 74px;
    height: 74px;
    top: 16%;
    left: 8%;
    animation: orbFloat 7s ease-in-out infinite;
  }

  .account-orb-2 {
    width: 42px;
    height: 42px;
    top: 72%;
    left: 30%;
    animation: orbFloat 8.5s ease-in-out infinite reverse;
  }

  .account-orb-3 {
    width: 58px;
    height: 58px;
    right: 10%;
    bottom: 12%;
    animation: orbFloat 9s ease-in-out infinite;
  }

  @keyframes classicFadeUp {
    from {
      opacity: 0;
      transform: translateY(32px) scale(0.98);
    }
    to {
      opacity: 1;
      transform: translateY(0) scale(1);
    }
  }

  @keyframes orbFloat {
    0%, 100% {
      transform: translate3d(0, 0, 0);
    }
    50% {
      transform: translate3d(18px, -22px, 0);
    }
  }

  @keyframes buttonShine {
    0% {
      left: -120%;
    }
    45%, 100% {
      left: 130%;
    }
  }

  @keyframes softPulse {
    0%, 100% {
      box-shadow: 0 10px 24px rgba(180, 83, 9, 0.08);
    }
    50% {
      box-shadow: 0 14px 34px rgba(180, 83, 9, 0.18);
    }
  }

  @media (max-width: 767px) {
    .classic-account-card {
      border-radius: 26px !important;
    }

    .classic-url-code {
      font-size: 12px;
    }
  }
`;