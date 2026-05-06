import {
    ArrowRightOutlined,
    CheckCircleOutlined,
    CrownOutlined,
    LockOutlined,
    SafetyCertificateOutlined,
    ThunderboltOutlined,
    UserOutlined,
} from "@ant-design/icons";
import {
    Button,
    Card,
    Col,
    Form,
    Grid,
    Input,
    Row,
    Space,
    Typography,
    message,
} from "antd";
import type { CSSProperties, ReactNode } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { fetchMyPermissions, login, setToken } from "../redux/reducers/auth.slice";
import { setTenantId, setTenantSlug } from "../redux/reducers/tenant.slice";

const { Title, Text } = Typography;
const { useBreakpoint } = Grid;

export default function LoginPage2() {
    const { slug = "" } = useParams();
    const navigate = useNavigate();
    const dispatch: any = useDispatch();
    const screens = useBreakpoint();

    const loading = useSelector((s: any) => s.auth.loading);

    const onFinish = async (values: any) => {
        if (!slug) return message.error("Tenant slug missing in URL");

        dispatch(setTenantSlug(slug));

        const res = await dispatch(
            login({
                slug,
                email: values.email,
                password: values.password,
            })
        );

        if (res?.payload?.data?.statusCode === 200) {
            const token = res.payload.data.data.accessToken;
            const user = res.payload.data.data.user;

            dispatch(setToken(token));
            dispatch(setTenantId(user?.tenantId));

            await dispatch(fetchMyPermissions({ slug } as any));

            navigate(`/${slug}/dashboard`, { replace: true });
            message.success(`Welcome to ${slug} CRM, ${user?.name}`);
        } else {
            message.error(res?.payload?.message || "Invalid email or password");
        }
    };

    const isMobile = !screens.lg;

    return (
        <>
            <style>{loginPageCss}</style>

            <div style={styles.page}>
                <div style={styles.classicTexture} />
                <div style={styles.goldGlow} />
                <div style={styles.blueGlow} />
                <div style={styles.redGlow} />

                <div className="login-orb login-orb-1" />
                <div className="login-orb login-orb-2" />
                <div className="login-orb login-orb-3" />

                <Row
                    gutter={[28, 28]}
                    align="middle"
                    justify="center"
                    style={{
                        minHeight: "100vh",
                        padding: isMobile ? 16 : 34,
                        position: "relative",
                        zIndex: 2,
                    }}
                >
                    {!isMobile && (
                        <Col xs={24} lg={12} xl={11}>
                            <div className="classic-slide-left" style={styles.leftPanel}>
                                <div style={styles.brandBadge}>
                                    <CrownOutlined />
                                    <span>{slug?.toUpperCase()} CRM</span>
                                </div>

                                <Title
                                    level={1}
                                    style={{
                                        color: "#fff7e6",
                                        marginBottom: 14,
                                        lineHeight: 1.05,
                                        fontSize: screens.xl ? 46 : 36,
                                        maxWidth: 690,
                                        letterSpacing: "-1.5px",
                                        fontFamily: "Georgia, 'Times New Roman', serif",
                                        textShadow: "0 14px 35px rgba(0,0,0,0.35)",
                                    }}
                                >
                                    A classic workspace for modern business growth.
                                </Title>

                                <Text
                                    style={{
                                        color: "rgba(255, 248, 230, 0.76)",
                                        fontSize: 16,
                                        display: "block",
                                        maxWidth: 580,
                                        lineHeight: 1.9,
                                        marginBottom: 30,
                                    }}
                                >
                                    Manage leads, customers, orders, teams and follow-ups from one elegant CRM built
                                    for serious teams.
                                </Text>

                                <Space direction="vertical" size={16} style={{ width: "100%" }}>
                                    <FeatureItem
                                        icon={<SafetyCertificateOutlined />}
                                        title="Secure tenant access"
                                        description="Every workspace opens with tenant-aware authentication and permission control."
                                    />

                                    <FeatureItem
                                        icon={<ThunderboltOutlined />}
                                        title="Fast daily operations"
                                        description="Your leads, contacts, quotes and tasks stay organized without friction."
                                    />

                                    <FeatureItem
                                        icon={<ArrowRightOutlined />}
                                        title="Built for scale"
                                        description="A clean foundation for CRM modules, Tally sync and future growth."
                                    />
                                </Space>

                                <div style={styles.statsRow}>
                                    <StatCard value="360°" label="CRM View" />
                                    <StatCard value="10x" label="Workflow Speed" />
                                    <StatCard value="24/7" label="Team Access" />
                                </div>
                            </div>
                        </Col>
                    )}

                    <Col xs={24} lg={12} xl={8}>
                        <div className="classic-fade-up" style={styles.cardWrap}>
                            <div style={styles.cardShine} />

                            <Card
                                bordered={false}
                                className="classic-login-card"
                                style={{
                                    ...styles.loginCard,
                                    width: "100%",
                                }}
                                bodyStyle={{
                                    padding: isMobile ? 24 : 36,
                                }}
                            >
                                <div style={{ marginBottom: 24 }}>
                                    <div style={styles.smallBadge}>
                                        <CheckCircleOutlined />
                                        <span>Secure Login</span>
                                    </div>

                                    <Title
                                        level={2}
                                        style={{
                                            color: "#201308",
                                            margin: "16px 0 6px",
                                            fontFamily: "Georgia, 'Times New Roman', serif",
                                            fontSize: 34,
                                        }}
                                    >
                                        Welcome back
                                    </Title>

                                    <Text style={{ color: "#7a5b3e", fontSize: 14 }}>
                                        Sign in to continue to{" "}
                                        <span style={{ color: "#9a3412", fontWeight: 800 }}>{slug}</span>
                                    </Text>
                                </div>

                                <Form layout="vertical" onFinish={onFinish} style={{ marginTop: 8 }}>
                                    <Form.Item
                                        name="email"
                                        label={<span style={styles.label}>Email Address</span>}
                                        rules={[
                                            { required: true, message: "Email required" },
                                            { type: "email", message: "Invalid email" },
                                        ]}
                                    >
                                        <Input
                                            className="classic-input"
                                            size="large"
                                            prefix={<UserOutlined style={{ color: "#a16207" }} />}
                                            placeholder="name@company.com"
                                            autoComplete="email"
                                        />
                                    </Form.Item>

                                    <Form.Item
                                        name="password"
                                        label={<span style={styles.label}>Password</span>}
                                        rules={[{ required: true, message: "Password required" }]}
                                    >
                                        <Input.Password
                                            className="classic-input"
                                            size="large"
                                            prefix={<LockOutlined style={{ color: "#a16207" }} />}
                                            placeholder="••••••••"
                                            autoComplete="current-password"
                                        />
                                    </Form.Item>

                                    <Button
                                        type="primary"
                                        htmlType="submit"
                                        block
                                        size="large"
                                        loading={loading}
                                        className="classic-submit-btn"
                                        style={styles.submitBtn}
                                    >
                                        Sign in to Workspace
                                    </Button>
                                </Form>

                                <div style={styles.bottomInfo}>
                                    <Text style={{ color: "#8a6a48", fontSize: 12 }}>
                                        Protected workspace • Tenant-aware access • Secure authentication
                                    </Text>
                                </div>
                            </Card>
                        </div>
                    </Col>
                </Row>
            </div>
        </>
    );
}

function FeatureItem({
    icon,
    title,
    description,
}: {
    icon: ReactNode;
    title: string;
    description: string;
}) {
    return (
        <div className="classic-feature-card" style={styles.featureItem}>
            <div style={styles.featureIcon}>{icon}</div>
            <div>
                <div style={styles.featureTitle}>{title}</div>
                <div style={styles.featureDesc}>{description}</div>
            </div>
        </div>
    );
}

function StatCard({ value, label }: { value: string; label: string }) {
    return (
        <div className="classic-stat-card" style={styles.statCard}>
            <div style={styles.statValue}>{value}</div>
            <div style={styles.statLabel}>{label}</div>
        </div>
    );
}

const styles: Record<string, CSSProperties> = {
    page: {
        minHeight: "100vh",
        position: "relative",
        overflow: "hidden",
        background:
            "radial-gradient(circle at 10% 12%, rgba(255, 197, 87, 0.35), transparent 26%), radial-gradient(circle at 92% 15%, rgba(59, 130, 246, 0.26), transparent 26%), linear-gradient(135deg, #180b05 0%, #331407 34%, #5f1e0b 62%, #111827 100%)",
    },

    classicTexture: {
        position: "absolute",
        inset: 0,
        opacity: 0.14,
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
        width: 480,
        height: 480,
        borderRadius: "50%",
        background: "rgba(251, 191, 36, 0.28)",
        filter: "blur(95px)",
        top: -140,
        left: -120,
    },

    blueGlow: {
        position: "absolute",
        width: 420,
        height: 420,
        borderRadius: "50%",
        background: "rgba(37, 99, 235, 0.28)",
        filter: "blur(105px)",
        right: -130,
        top: 90,
    },

    redGlow: {
        position: "absolute",
        width: 380,
        height: 380,
        borderRadius: "50%",
        background: "rgba(220, 38, 38, 0.22)",
        filter: "blur(110px)",
        bottom: -120,
        left: "42%",
    },

    leftPanel: {
        padding: "16px 16px 16px 8px",
    },

    brandBadge: {
        display: "inline-flex",
        alignItems: "center",
        gap: 9,
        padding: "9px 16px",
        borderRadius: 999,
        background: "linear-gradient(135deg, rgba(255,255,255,0.18), rgba(255,255,255,0.06))",
        color: "#fde68a",
        border: "1px solid rgba(253, 230, 138, 0.38)",
        fontSize: 12,
        fontWeight: 800,
        letterSpacing: 1.1,
        marginBottom: 22,
        backdropFilter: "blur(12px)",
        boxShadow: "0 15px 40px rgba(0,0,0,0.22)",
    },

    featureItem: {
        display: "flex",
        gap: 14,
        alignItems: "flex-start",
        padding: "15px 17px",
        borderRadius: 22,
        border: "1px solid rgba(255, 236, 179, 0.18)",
        background: "linear-gradient(135deg, rgba(255,255,255,0.14), rgba(255,255,255,0.045))",
        backdropFilter: "blur(14px)",
        boxShadow: "0 18px 46px rgba(0,0,0,0.22)",
    },

    featureIcon: {
        width: 44,
        height: 44,
        minWidth: 44,
        borderRadius: 15,
        display: "grid",
        placeItems: "center",
        background: "linear-gradient(135deg, #f59e0b, #dc2626)",
        color: "#fff",
        fontSize: 18,
        boxShadow: "0 14px 28px rgba(245, 158, 11, 0.35)",
    },

    featureTitle: {
        color: "#fff7ed",
        fontSize: 15,
        fontWeight: 800,
        marginBottom: 4,
    },

    featureDesc: {
        color: "rgba(255, 247, 237, 0.72)",
        fontSize: 13,
        lineHeight: 1.75,
    },

    statsRow: {
        display: "flex",
        gap: 14,
        flexWrap: "wrap",
        marginTop: 26,
    },

    statCard: {
        minWidth: 140,
        padding: "17px 18px",
        borderRadius: 22,
        background: "linear-gradient(135deg, rgba(255,255,255,0.16), rgba(255,255,255,0.045))",
        border: "1px solid rgba(255, 236, 179, 0.18)",
        backdropFilter: "blur(12px)",
        boxShadow: "0 16px 40px rgba(0,0,0,0.18)",
    },

    statValue: {
        color: "#fde68a",
        fontSize: 28,
        fontWeight: 900,
        lineHeight: 1,
        marginBottom: 7,
        fontFamily: "Georgia, 'Times New Roman', serif",
    },

    statLabel: {
        color: "rgba(255, 247, 237, 0.7)",
        fontSize: 12,
    },

    cardWrap: {
        position: "relative",
    },

    cardShine: {
        position: "absolute",
        inset: -2,
        borderRadius: 34,
        background: "linear-gradient(135deg, rgba(253,186,116,0.9), rgba(59,130,246,0.65), rgba(220,38,38,0.75))",
        filter: "blur(14px)",
        opacity: 0.55,
    },

    loginCard: {
        position: "relative",
        borderRadius: 32,
        background:
            "linear-gradient(145deg, rgba(255, 251, 235, 0.96), rgba(255, 237, 213, 0.94))",
        border: "1px solid rgba(120, 53, 15, 0.16)",
        boxShadow: "0 35px 90px rgba(0,0,0,0.34)",
        overflow: "hidden",
    },

    smallBadge: {
        display: "inline-flex",
        alignItems: "center",
        gap: 7,
        padding: "7px 13px",
        borderRadius: 999,
        background: "linear-gradient(135deg, #fff7ed, #fed7aa)",
        border: "1px solid rgba(194, 65, 12, 0.22)",
        color: "#9a3412",
        fontSize: 12,
        fontWeight: 800,
        boxShadow: "0 8px 18px rgba(194,65,12,0.12)",
    },

    label: {
        color: "#3f2411",
        fontWeight: 800,
    },

    submitBtn: {
        height: 50,
        borderRadius: 15,
        fontWeight: 900,
        fontSize: 15,
        marginTop: 8,
        background: "linear-gradient(135deg, #b45309 0%, #dc2626 48%, #1d4ed8 100%)",
        border: "none",
        boxShadow: "0 16px 34px rgba(180, 83, 9, 0.36)",
    },

    bottomInfo: {
        marginTop: 20,
        textAlign: "center",
    },
};

const loginPageCss = `
  .classic-slide-left {
    animation: classicSlideLeft 700ms ease both;
  }

  .classic-fade-up {
    animation: classicFadeUp 760ms ease both;
  }

  .classic-login-card::before {
    content: "";
    position: absolute;
    top: -90px;
    right: -90px;
    width: 220px;
    height: 220px;
    border-radius: 50%;
    background: rgba(251, 191, 36, 0.28);
    pointer-events: none;
  }

  .classic-login-card::after {
    content: "";
    position: absolute;
    left: -80px;
    bottom: -100px;
    width: 210px;
    height: 210px;
    border-radius: 50%;
    background: rgba(37, 99, 235, 0.18);
    pointer-events: none;
  }

  .classic-input.ant-input-affix-wrapper {
    height: 50px;
    border-radius: 15px;
    background: rgba(255, 247, 237, 0.92);
    border: 1px solid rgba(120, 53, 15, 0.16);
    box-shadow: inset 0 1px 0 rgba(255,255,255,0.7), 0 8px 18px rgba(120,53,15,0.06);
    transition: all 220ms ease;
  }

  .classic-input.ant-input-affix-wrapper:hover,
  .classic-input.ant-input-affix-wrapper-focused {
    border-color: rgba(194, 65, 12, 0.55);
    box-shadow: 0 0 0 4px rgba(251, 146, 60, 0.14), 0 10px 22px rgba(120,53,15,0.08);
  }

  .classic-input .ant-input,
  .classic-input .ant-input-password {
    background: transparent !important;
    color: #2b1709;
    font-weight: 600;
  }

  .classic-input .ant-input::placeholder {
    color: rgba(120, 53, 15, 0.42);
  }

  .classic-submit-btn {
    position: relative;
    overflow: hidden;
    transition: transform 220ms ease, box-shadow 220ms ease, filter 220ms ease;
  }

  .classic-submit-btn:hover {
    transform: translateY(-2px);
    filter: brightness(1.06);
    box-shadow: 0 22px 42px rgba(180, 83, 9, 0.42) !important;
  }

  .classic-submit-btn::before {
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

  .classic-feature-card {
    transition: transform 240ms ease, border-color 240ms ease, background 240ms ease;
  }

  .classic-feature-card:hover {
    transform: translateX(8px);
    border-color: rgba(253, 230, 138, 0.42) !important;
    background: linear-gradient(135deg, rgba(255,255,255,0.19), rgba(255,255,255,0.07)) !important;
  }

  .classic-stat-card {
    transition: transform 240ms ease;
  }

  .classic-stat-card:hover {
    transform: translateY(-5px);
  }

  .login-orb {
    position: absolute;
    border-radius: 999px;
    border: 1px solid rgba(255,255,255,0.16);
    background: rgba(255,255,255,0.08);
    backdrop-filter: blur(10px);
    pointer-events: none;
  }

  .login-orb-1 {
    width: 74px;
    height: 74px;
    top: 16%;
    left: 6%;
    animation: orbFloat 7s ease-in-out infinite;
  }

  .login-orb-2 {
    width: 42px;
    height: 42px;
    top: 72%;
    left: 48%;
    animation: orbFloat 8.5s ease-in-out infinite reverse;
  }

  .login-orb-3 {
    width: 58px;
    height: 58px;
    right: 8%;
    bottom: 11%;
    animation: orbFloat 9s ease-in-out infinite;
  }

  @keyframes classicSlideLeft {
    from {
      opacity: 0;
      transform: translateX(-34px);
    }
    to {
      opacity: 1;
      transform: translateX(0);
    }
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

  @media (max-width: 991px) {
    .classic-login-card {
      border-radius: 26px !important;
    }
  }
`;