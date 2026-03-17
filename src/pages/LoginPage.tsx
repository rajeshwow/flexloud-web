import {
    ArrowRightOutlined,
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
import type { CSSProperties } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { fetchMyPermissions, login, setToken } from "../redux/reducers/auth.slice";
import { setTenantId, setTenantSlug } from "../redux/reducers/tenant.slice";

const { Title, Text } = Typography;
const { useBreakpoint } = Grid;

export default function LoginPage() {
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
        <div style={styles.page}>
            <div style={styles.bgOverlay} />
            <div style={styles.glowTop} />
            <div style={styles.glowBottom} />
            <div style={styles.gridPattern} />

            <Row
                gutter={[24, 24]}
                align="middle"
                justify="center"
                style={{
                    minHeight: "100vh",
                    padding: isMobile ? 16 : 32,
                    position: "relative",
                    zIndex: 2,
                }}
            >
                {!isMobile && (
                    <Col xs={24} lg={12} xl={11}>
                        <div style={styles.leftPanel}>
                            <div style={styles.brandBadge}>{slug?.toUpperCase()} CRM</div>

                            <Title
                                level={1}
                                style={{
                                    color: "#fff",
                                    marginBottom: 12,
                                    lineHeight: 1.1,
                                    fontSize: screens.xl ? 34 : 24,
                                    maxWidth: 620,
                                }}
                            >
                                Manage leads, teams, and growth from one premium workspace.
                            </Title>

                            <Text
                                style={{
                                    color: "rgba(255,255,255,0.72)",
                                    fontSize: 16,
                                    display: "block",
                                    maxWidth: 560,
                                    lineHeight: 1.8,
                                    marginBottom: 28,
                                }}
                            >
                                A modern multi-tenant CRM experience built for speed, control, and
                                beautiful workflows.
                            </Text>

                            <Space direction="vertical" size={16} style={{ width: "100%" }}>
                                <FeatureItem
                                    icon={<SafetyCertificateOutlined />}
                                    title="Enterprise-grade access"
                                    description="Tenant-aware login, secure permissions, and controlled access."
                                />
                                <FeatureItem
                                    icon={<ThunderboltOutlined />}
                                    title="Fast daily operations"
                                    description="Handle contacts, leads, opportunities, and users without friction."
                                />
                                <FeatureItem
                                    icon={<ArrowRightOutlined />}
                                    title="Built to scale"
                                    description="Clean architecture for multi-tenant CRM products and future modules."
                                />
                            </Space>

                            <div style={styles.statsRow}>
                                <StatCard value="99.9%" label="System reliability" />
                                <StatCard value="10x" label="Faster workflows" />
                                <StatCard value="24/7" label="Team access" />
                            </div>
                        </div>
                    </Col>
                )}

                <Col xs={24} lg={12} xl={8}>
                    <div style={styles.cardWrap}>
                        <Card
                            bordered={false}
                            style={{
                                ...styles.loginCard,
                                width: "100%",
                            }}
                            bodyStyle={{
                                padding: isMobile ? 24 : 32,
                            }}
                        >
                            <div style={{ marginBottom: 20 }}>
                                <div style={styles.smallBadge}>Secure Login</div>

                                <Title level={2} style={{ color: "#fff", margin: "10px 0 6px" }}>
                                    Welcome back
                                </Title>

                                <Text style={{ color: "rgba(255,255,255,0.65)", fontSize: 14 }}>
                                    Sign in to continue to{" "}
                                    <span style={{ color: "#fff", fontWeight: 600 }}>{slug}</span>
                                </Text>
                            </div>

                            <Form layout="vertical" onFinish={onFinish} style={{ marginTop: 8 }}>
                                <Form.Item
                                    name="email"
                                    label={<span style={styles.label}>Email</span>}
                                    rules={[
                                        { required: true, message: "Email required" },
                                        { type: "email", message: "Invalid email" },
                                    ]}
                                >
                                    <Input
                                        size="large"
                                        prefix={<UserOutlined style={{ color: "rgba(255,255,255,0.45)" }} />}
                                        placeholder="name@company.com"
                                        autoComplete="email"
                                        style={styles.input}
                                    />
                                </Form.Item>

                                <Form.Item
                                    name="password"
                                    label={<span style={styles.label}>Password</span>}
                                    rules={[{ required: true, message: "Password required" }]}
                                >
                                    <Input.Password
                                        size="large"
                                        prefix={<LockOutlined style={{ color: "rgba(255,255,255,0.45)" }} />}
                                        placeholder="••••••••"
                                        autoComplete="current-password"
                                        style={styles.input}
                                    />
                                </Form.Item>

                                <Button
                                    type="primary"
                                    htmlType="submit"
                                    block
                                    size="large"
                                    loading={loading}
                                    style={styles.submitBtn}
                                >
                                    Sign in
                                </Button>
                            </Form>

                            <div style={styles.bottomInfo}>
                                <Text style={{ color: "rgba(255,255,255,0.55)", fontSize: 12 }}>
                                    Protected workspace • Tenant-aware access • Secure authentication
                                </Text>
                            </div>
                        </Card>
                    </div>
                </Col>
            </Row>
        </div>
    );
}

function FeatureItem({
    icon,
    title,
    description,
}: {
    icon: React.ReactNode;
    title: string;
    description: string;
}) {
    return (
        <div style={styles.featureItem}>
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
        <div style={styles.statCard}>
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
            "radial-gradient(circle at top left, rgba(39,110,241,0.22), transparent 28%), radial-gradient(circle at bottom right, rgba(91,180,255,0.14), transparent 22%), linear-gradient(135deg, #06101f 0%, #071a33 45%, #041120 100%)",
    },

    bgOverlay: {
        position: "absolute",
        inset: 0,
        background:
            "linear-gradient(180deg, rgba(255,255,255,0.02), rgba(255,255,255,0.00))",
        pointerEvents: "none",
    },

    glowTop: {
        position: "absolute",
        width: 360,
        height: 360,
        borderRadius: "50%",
        background: "rgba(42, 124, 255, 0.24)",
        filter: "blur(90px)",
        top: -80,
        right: -80,
        animation: "floatGlow 7s ease-in-out infinite",
    },

    glowBottom: {
        position: "absolute",
        width: 340,
        height: 340,
        borderRadius: "50%",
        background: "rgba(0, 209, 255, 0.16)",
        filter: "blur(100px)",
        bottom: -80,
        left: -80,
        animation: "floatGlow 9s ease-in-out infinite",
    },

    gridPattern: {
        position: "absolute",
        inset: 0,
        opacity: 0.08,
        backgroundImage: `
      linear-gradient(rgba(255,255,255,0.08) 1px, transparent 1px),
      linear-gradient(90deg, rgba(255,255,255,0.08) 1px, transparent 1px)
    `,
        backgroundSize: "34px 34px",
        maskImage: "radial-gradient(circle at center, black 40%, transparent 90%)",
        pointerEvents: "none",
    },

    leftPanel: {
        padding: "16px 12px 16px 8px",
    },

    brandBadge: {
        display: "inline-flex",
        alignItems: "center",
        padding: "8px 14px",
        borderRadius: 999,
        background: "rgba(255,255,255,0.08)",
        color: "#dbeafe",
        border: "1px solid rgba(255,255,255,0.12)",
        fontSize: 12,
        fontWeight: 700,
        letterSpacing: 1,
        marginBottom: 20,
        backdropFilter: "blur(10px)",
    },

    featureItem: {
        display: "flex",
        gap: 14,
        alignItems: "flex-start",
        padding: "14px 16px",
        borderRadius: 18,
        border: "1px solid rgba(255,255,255,0.10)",
        background: "rgba(255,255,255,0.04)",
        backdropFilter: "blur(12px)",
        boxShadow: "0 12px 40px rgba(0,0,0,0.18)",
    },

    featureIcon: {
        width: 42,
        height: 42,
        minWidth: 42,
        borderRadius: 12,
        display: "grid",
        placeItems: "center",
        background: "linear-gradient(135deg, #2563eb, #3b82f6)",
        color: "#fff",
        fontSize: 18,
        boxShadow: "0 10px 25px rgba(37,99,235,0.35)",
    },

    featureTitle: {
        color: "#fff",
        fontSize: 15,
        fontWeight: 700,
        marginBottom: 4,
    },

    featureDesc: {
        color: "rgba(255,255,255,0.68)",
        fontSize: 13,
        lineHeight: 1.7,
    },

    statsRow: {
        display: "flex",
        gap: 14,
        flexWrap: "wrap",
        marginTop: 24,
    },

    statCard: {
        minWidth: 140,
        padding: "16px 18px",
        borderRadius: 18,
        background: "rgba(255,255,255,0.05)",
        border: "1px solid rgba(255,255,255,0.10)",
        backdropFilter: "blur(12px)",
    },

    statValue: {
        color: "#fff",
        fontSize: 24,
        fontWeight: 800,
        lineHeight: 1,
        marginBottom: 6,
    },

    statLabel: {
        color: "rgba(255,255,255,0.62)",
        fontSize: 12,
    },

    cardWrap: {
        position: "relative",
    },

    loginCard: {
        borderRadius: 28,
        background: "rgba(9, 14, 25, 0.72)",
        border: "1px solid rgba(255,255,255,0.10)",
        boxShadow: "0 30px 80px rgba(0,0,0,0.35)",
        backdropFilter: "blur(18px)",
    },

    smallBadge: {
        display: "inline-block",
        padding: "6px 12px",
        borderRadius: 999,
        background: "rgba(37,99,235,0.16)",
        border: "1px solid rgba(59,130,246,0.35)",
        color: "#bfdbfe",
        fontSize: 12,
        fontWeight: 600,
    },

    label: {
        color: "rgba(255,255,255,0.86)",
        fontWeight: 500,
    },

    input: {
        height: 48,
        borderRadius: 12,
        background: "rgba(255,255,255,0.04)",
        border: "1px solid rgba(255,255,255,0.10)",
        color: "#fff",
    },

    submitBtn: {
        height: 48,
        borderRadius: 12,
        fontWeight: 700,
        fontSize: 15,
        marginTop: 8,
        background: "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)",
        border: "none",
        boxShadow: "0 14px 30px rgba(37,99,235,0.35)",
    },

    bottomInfo: {
        marginTop: 18,
        textAlign: "center",
    },
};