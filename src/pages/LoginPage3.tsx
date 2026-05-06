import {
  ArrowRightOutlined,
  CheckCircleOutlined,
  CrownOutlined,
  LockOutlined,
  SafetyCertificateOutlined,
  TeamOutlined,
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

export default function LoginPage3() {
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

      <div className="login-page">
        <div className="login-bg-grid" />
        <div className="login-glow login-glow-blue" />
        <div className="login-glow login-glow-red" />
        <div className="login-glow login-glow-purple" />

        <div className="login-float-shape login-shape-1" />
        <div className="login-float-shape login-shape-2" />
        <div className="login-float-shape login-shape-3" />

        <Row
          gutter={[34, 34]}
          align="middle"
          justify="space-around"
          className="login-shell"
          style={{ alignItems: "flex-start" }}
        >
          {!isMobile && (
            <Col xs={24} lg={12} xl={11}>
              <section className="login-left">
                <div className="login-brand-pill">
                  <CrownOutlined />
                  <span>{slug?.toUpperCase()} CRM</span>
                </div>

                <Title level={1} className="login-hero-title">
                  Welcome to your modern business workspace.
                </Title>

                <Text className="login-hero-desc">
                  Manage leads, contacts, teams, quotes, orders and follow-ups from one
                  secure tenant-based CRM.
                </Text>

                <div className="login-visual-board">
                  <div className="login-center-orbit">
                    <LockOutlined />
                  </div>

                  <div className="login-orbit-card login-orbit-card-1">
                    <SafetyCertificateOutlined />
                    <span>Secure Login</span>
                  </div>

                  <div className="login-orbit-card login-orbit-card-2">
                    <TeamOutlined />
                    <span>Team Access</span>
                  </div>

                  <div className="login-orbit-card login-orbit-card-3">
                    <ThunderboltOutlined />
                    <span>Fast CRM</span>
                  </div>

                  <div className="login-orbit-card login-orbit-card-4">
                    <ArrowRightOutlined />
                    <span>Daily Growth</span>
                  </div>
                </div>

                <Space direction="vertical" size={14} className="login-feature-list">
                  <FeatureItem
                    icon={<SafetyCertificateOutlined />}
                    title="Tenant-aware security"
                    description="Every login is scoped to your company workspace and permissions."
                  />

                  <FeatureItem
                    icon={<ThunderboltOutlined />}
                    title="Fast daily operations"
                    description="Work smoothly across leads, contacts, tasks, quotes and orders."
                  />

                  <FeatureItem
                    icon={<ArrowRightOutlined />}
                    title="Built for scale"
                    description="A clean CRM foundation for teams, automation and future modules."
                  />
                </Space>

                <div className="login-stats-row">
                  <StatCard value="360°" label="CRM View" />
                  <StatCard value="10x" label="Workflow Speed" />
                  <StatCard value="24/7" label="Team Access" />
                </div>
              </section>
            </Col>
          )}

          <Col xs={24} lg={12} xl={8}>
            <section className="login-right">
              <Card
                bordered={false}
                className="login-card"
                styles={{
                  body: {
                    padding: isMobile ? 24 : 34,
                  },
                }}
              >
                <div className="login-card-header">
                  <div className="login-card-icon">
                    <LockOutlined />
                  </div>

                  <div>
                    <div className="login-secure-pill">
                      <CheckCircleOutlined />
                      <span>Secure Login</span>
                    </div>

                    <Title level={2} className="login-card-title">
                      Welcome back
                    </Title>

                    <Text className="login-card-subtitle">
                      Sign in to continue to{" "}
                      <span className="login-slug-highlight">{slug}</span>
                    </Text>
                  </div>
                </div>

                <Form layout="vertical" onFinish={onFinish} className="login-form">
                  <Form.Item
                    name="email"
                    label={<span className="login-form-label">Email Address</span>}
                    rules={[
                      { required: true, message: "Email required" },
                      { type: "email", message: "Invalid email" },
                    ]}
                  >
                    <Input
                      className="login-input"
                      size="large"
                      prefix={<UserOutlined />}
                      placeholder="name@company.com"
                      autoComplete="email"
                    />
                  </Form.Item>

                  <Form.Item
                    name="password"
                    label={<span className="login-form-label">Password</span>}
                    rules={[{ required: true, message: "Password required" }]}
                  >
                    <Input.Password
                      className="login-input"
                      size="large"
                      prefix={<LockOutlined />}
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
                    className="login-submit-btn"
                  >
                    Sign in to Workspace
                  </Button>
                </Form>

                <div className="login-bottom-info">
                  <SafetyCertificateOutlined />
                  <Text>
                    Protected workspace • Tenant-aware access • Secure authentication
                  </Text>
                </div>
              </Card>
            </section>
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
    <div className="login-feature-card">
      <div className="login-feature-icon">{icon}</div>
      <div>
        <div className="login-feature-title">{title}</div>
        <div className="login-feature-desc">{description}</div>
      </div>
    </div>
  );
}

function StatCard({ value, label }: { value: string; label: string }) {
  return (
    <div className="login-stat-card">
      <div className="login-stat-value">{value}</div>
      <div className="login-stat-label">{label}</div>
    </div>
  );
}

const loginPageCss = `
  .login-page {
    min-height: 100vh;
    position: relative;
    overflow: hidden;
    background:
      radial-gradient(circle at 15% 15%, rgba(37, 99, 235, 0.35), transparent 30%),
      radial-gradient(circle at 88% 18%, rgba(220, 38, 38, 0.30), transparent 28%),
      radial-gradient(circle at 50% 90%, rgba(124, 58, 237, 0.22), transparent 30%),
      linear-gradient(135deg, #07111f 0%, #0f172a 45%, #1e1b4b 100%);
  }

  .login-bg-grid {
    position: absolute;
    inset: 0;
    opacity: 0.18;
    background-image:
      linear-gradient(rgba(255,255,255,0.08) 1px, transparent 1px),
      linear-gradient(90deg, rgba(255,255,255,0.08) 1px, transparent 1px);
    background-size: 42px 42px;
    mask-image: radial-gradient(circle at center, black, transparent 78%);
  }

  .login-glow {
    position: absolute;
    border-radius: 999px;
    filter: blur(90px);
    pointer-events: none;
  }

  .login-glow-blue {
    width: 430px;
    height: 430px;
    left: -130px;
    top: -110px;
    background: rgba(59, 130, 246, 0.42);
  }

  .login-glow-red {
    width: 390px;
    height: 390px;
    right: -120px;
    top: 90px;
    background: rgba(239, 68, 68, 0.34);
  }

  .login-glow-purple {
    width: 420px;
    height: 420px;
    left: 38%;
    bottom: -180px;
    background: rgba(124, 58, 237, 0.26);
  }

  .login-float-shape {
    position: absolute;
    border-radius: 26px;
    border: 1px solid rgba(255,255,255,0.14);
    background: rgba(255,255,255,0.06);
    backdrop-filter: blur(12px);
    pointer-events: none;
  }

  .login-shape-1 {
    width: 84px;
    height: 84px;
    left: 6%;
    top: 16%;
    animation: loginFloatShape 8s ease-in-out infinite;
  }

  .login-shape-2 {
    width: 52px;
    height: 52px;
    right: 8%;
    bottom: 14%;
    transform: rotate(20deg);
    animation: loginFloatShape 9s ease-in-out infinite reverse;
  }

  .login-shape-3 {
    width: 64px;
    height: 64px;
    left: 45%;
    top: 10%;
    border-radius: 999px;
    animation: loginFloatShape 10s ease-in-out infinite;
  }

  .login-shell {
    min-height: 100vh;
    padding: 42px 6vw;
    position: relative;
    z-index: 2;
  }

  .login-left {
    max-width: 740px;
    animation: loginSlideLeft 720ms ease both;
  }

  .login-brand-pill {
    display: inline-flex;
    align-items: center;
    gap: 9px;
    padding: 9px 15px;
    border-radius: 999px;
    color: #dbeafe;
    background: rgba(255,255,255,0.08);
    border: 1px solid rgba(191, 219, 254, 0.20);
    box-shadow: 0 18px 45px rgba(0,0,0,0.16);
    backdrop-filter: blur(14px);
    font-size: 12px;
    font-weight: 900;
    letter-spacing: 0.8px;
    text-transform: uppercase;
    margin-bottom: 22px;
  }

  .login-hero-title.ant-typography {
    color: #ffffff;
    margin: 0 0 16px;
    font-size: clamp(38px, 4vw, 56px);
    line-height: 1.05;
    letter-spacing: -1.8px;
    font-family: Georgia, "Times New Roman", serif;
    text-shadow: 0 20px 45px rgba(0,0,0,0.30);
  }

  .login-hero-desc {
    display: block;
    max-width: 590px;
    color: rgba(226, 232, 240, 0.78);
    font-size: 16px;
    line-height: 1.9;
    margin-bottom: 28px;
  }

  .login-visual-board {
    width: min(560px, 100%);
    height: 275px;
    position: relative;
    border-radius: 34px;
    border: 1px solid rgba(255,255,255,0.14);
    background:
      linear-gradient(135deg, rgba(255,255,255,0.12), rgba(255,255,255,0.045)),
      radial-gradient(circle at 20% 20%, rgba(96,165,250,0.22), transparent 34%),
      radial-gradient(circle at 80% 65%, rgba(248,113,113,0.20), transparent 34%);
    box-shadow: 0 30px 80px rgba(0,0,0,0.24);
    backdrop-filter: blur(18px);
    overflow: hidden;
    margin-bottom: 20px;
  }

  .login-visual-board::before {
    content: "";
    position: absolute;
    inset: 28px;
    border: 1px dashed rgba(255,255,255,0.20);
    border-radius: 999px;
    animation: loginRotateOrbit 18s linear infinite;
  }

  .login-visual-board::after {
    content: "";
    position: absolute;
    inset: 68px;
    border: 1px dashed rgba(255,255,255,0.14);
    border-radius: 999px;
    animation: loginRotateOrbit 24s linear infinite reverse;
  }

  .login-center-orbit {
    position: absolute;
    left: 50%;
    top: 50%;
    width: 86px;
    height: 86px;
    transform: translate(-50%, -50%);
    border-radius: 30px;
    display: grid;
    place-items: center;
    color: #ffffff;
    font-size: 38px;
    background: linear-gradient(135deg, #2563eb, #dc2626);
    box-shadow:
      0 22px 45px rgba(37, 99, 235, 0.36),
      0 12px 30px rgba(220, 38, 38, 0.22);
    z-index: 2;
    animation: loginCenterPulse 2.8s ease-in-out infinite;
  }

  .login-orbit-card {
    position: absolute;
    z-index: 3;
    display: inline-flex;
    align-items: center;
    gap: 9px;
    padding: 10px 13px;
    border-radius: 18px;
    color: #e5edff;
    background: rgba(15, 23, 42, 0.58);
    border: 1px solid rgba(255,255,255,0.14);
    box-shadow: 0 18px 42px rgba(0,0,0,0.22);
    backdrop-filter: blur(14px);
    font-size: 13px;
    font-weight: 800;
    animation: loginChipFloat 4s ease-in-out infinite;
  }

  .login-orbit-card .anticon {
    color: #93c5fd;
    font-size: 17px;
  }

  .login-orbit-card-1 {
    left: 34px;
    top: 44px;
  }

  .login-orbit-card-2 {
    right: 34px;
    top: 54px;
    animation-delay: 0.4s;
  }

  .login-orbit-card-3 {
    left: 48px;
    bottom: 44px;
    animation-delay: 0.8s;
  }

  .login-orbit-card-4 {
    right: 46px;
    bottom: 46px;
    animation-delay: 1.1s;
  }

  .login-feature-list {
    width: 100%;
    max-width: 590px;
  }

  .login-feature-card {
    display: flex;
    gap: 14px;
    align-items: flex-start;
    padding: 14px 16px;
    border-radius: 20px;
    color: #e5edff;
    background: rgba(255,255,255,0.075);
    border: 1px solid rgba(255,255,255,0.12);
    box-shadow: 0 18px 42px rgba(0,0,0,0.16);
    backdrop-filter: blur(14px);
    transition: transform 220ms ease, background 220ms ease, border-color 220ms ease;
  }

  .login-feature-card:hover {
    transform: translateX(8px);
    background: rgba(255,255,255,0.11);
    border-color: rgba(147,197,253,0.26);
  }

  .login-feature-icon {
    width: 42px;
    height: 42px;
    min-width: 42px;
    border-radius: 15px;
    display: grid;
    place-items: center;
    color: #ffffff;
    font-size: 18px;
    background: linear-gradient(135deg, #2563eb, #dc2626);
    box-shadow: 0 14px 28px rgba(37,99,235,0.28);
  }

  .login-feature-title {
    color: #ffffff;
    font-size: 15px;
    font-weight: 850;
    margin-bottom: 4px;
  }

  .login-feature-desc {
    color: rgba(226,232,240,0.72);
    font-size: 13px;
    line-height: 1.7;
  }

  .login-stats-row {
    display: flex;
    gap: 14px;
    flex-wrap: wrap;
    margin-top: 22px;
  }

  .login-stat-card {
    min-width: 145px;
    padding: 16px 18px;
    border-radius: 22px;
    background: rgba(255,255,255,0.075);
    border: 1px solid rgba(255,255,255,0.12);
    backdrop-filter: blur(14px);
    box-shadow: 0 18px 42px rgba(0,0,0,0.16);
    transition: transform 220ms ease, background 220ms ease;
  }

  .login-stat-card:hover {
    transform: translateY(-5px);
    background: rgba(255,255,255,0.11);
  }

  .login-stat-value {
    color: #ffffff;
    font-size: 25px;
    font-weight: 950;
    line-height: 1;
    margin-bottom: 7px;
    font-family: Georgia, "Times New Roman", serif;
  }

  .login-stat-label {
    color: rgba(226, 232, 240, 0.72);
    font-size: 12px;
  }

  .login-right {
    animation: loginSlideRight 760ms ease both;
  }

  .login-card {
    width: 100%;
    max-width: 520px;
    margin-left: auto;
    border-radius: 34px;
    background:
      linear-gradient(145deg, rgba(255,255,255,0.96), rgba(239,246,255,0.92));
    border: 1px solid rgba(255,255,255,0.62);
    box-shadow:
      0 36px 90px rgba(0,0,0,0.36),
      inset 0 1px 0 rgba(255,255,255,0.9);
    overflow: hidden;
    position: relative;
  }

  .login-card::before {
    content: "";
    position: absolute;
    width: 230px;
    height: 230px;
    right: -110px;
    top: -120px;
    border-radius: 999px;
    background: rgba(59, 130, 246, 0.14);
  }

  .login-card::after {
    content: "";
    position: absolute;
    width: 220px;
    height: 220px;
    left: -110px;
    bottom: -120px;
    border-radius: 999px;
    background: rgba(239, 68, 68, 0.10);
  }

  .login-card-header {
    display: flex;
    gap: 15px;
    align-items: flex-start;
    margin-bottom: 26px;
    position: relative;
    z-index: 2;
  }

  .login-card-icon {
    width: 58px;
    height: 58px;
    min-width: 58px;
    border-radius: 20px;
    display: grid;
    place-items: center;
    color: #ffffff;
    font-size: 27px;
    background: linear-gradient(135deg, #2563eb, #dc2626);
    box-shadow: 0 16px 34px rgba(37, 99, 235, 0.28);
  }

  .login-secure-pill {
    display: inline-flex;
    align-items: center;
    gap: 7px;
    padding: 6px 11px;
    border-radius: 999px;
    color: #1d4ed8;
    background: rgba(219,234,254,0.8);
    border: 1px solid rgba(37,99,235,0.14);
    font-size: 12px;
    font-weight: 900;
    margin-bottom: 10px;
  }

  .login-card-title.ant-typography {
    margin: 0 0 4px;
    color: #0f172a;
    font-family: Georgia, "Times New Roman", serif;
    font-size: 33px;
    line-height: 1.12;
  }

  .login-card-subtitle {
    color: #64748b;
    font-size: 14px;
  }

  .login-slug-highlight {
    display: inline-block;
    color: #ffffff;
    background: linear-gradient(135deg, #2563eb, #dc2626);
    padding: 2px 8px;
    border-radius: 999px;
    font-weight: 900;
  }

  .login-form {
    position: relative;
    z-index: 2;
  }

  .login-form-label {
    color: #0f172a;
    font-weight: 850;
  }

  .login-input.ant-input-affix-wrapper {
    height: 50px;
    border-radius: 16px;
    background: rgba(248,250,252,0.9);
    border: 1px solid rgba(148,163,184,0.32);
    box-shadow: 0 8px 18px rgba(15,23,42,0.04);
    transition: all 220ms ease;
  }

  .login-input.ant-input-affix-wrapper .anticon {
    color: #2563eb;
  }

  .login-input.ant-input-affix-wrapper:hover,
  .login-input.ant-input-affix-wrapper-focused {
    border-color: rgba(37,99,235,0.55);
    box-shadow: 0 0 0 4px rgba(37,99,235,0.10), 0 12px 26px rgba(15,23,42,0.08);
  }

  .login-input .ant-input {
    background: transparent !important;
    color: #0f172a;
    font-weight: 750;
  }

  .login-input .ant-input::placeholder {
    color: rgba(100,116,139,0.70);
  }

  .login-input .ant-input-password-icon {
    color: #64748b;
  }

  .login-submit-btn {
    height: 50px;
    border-radius: 16px;
    border: none;
    font-weight: 950;
    font-size: 15px;
    margin-top: 8px;
    background: linear-gradient(135deg, #2563eb 0%, #4f46e5 45%, #dc2626 100%);
    box-shadow: 0 18px 38px rgba(37,99,235,0.28);
    position: relative;
    overflow: hidden;
    transition: transform 220ms ease, filter 220ms ease, box-shadow 220ms ease;
  }

  .login-submit-btn:hover {
    transform: translateY(-2px);
    filter: brightness(1.04);
    box-shadow: 0 24px 48px rgba(37,99,235,0.34) !important;
  }

  .login-submit-btn::before {
    content: "";
    position: absolute;
    top: 0;
    left: -120%;
    width: 70%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.28), transparent);
    transform: skewX(-20deg);
    animation: loginButtonShine 3s ease-in-out infinite;
  }

  .login-bottom-info {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 8px;
    margin-top: 20px;
    padding: 12px 14px;
    border-radius: 18px;
    background: rgba(240,253,244,0.70);
    border: 1px solid rgba(34,197,94,0.14);
    position: relative;
    z-index: 2;
    text-align: center;
  }

  .login-bottom-info .anticon {
    color: #16a34a;
    font-size: 18px;
  }

  .login-bottom-info .ant-typography {
    color: #64748b;
    font-size: 12px;
  }

  @keyframes loginSlideLeft {
    from {
      opacity: 0;
      transform: translateX(-36px);
    }
    to {
      opacity: 1;
      transform: translateX(0);
    }
  }

  @keyframes loginSlideRight {
    from {
      opacity: 0;
      transform: translateX(36px) scale(0.98);
    }
    to {
      opacity: 1;
      transform: translateX(0) scale(1);
    }
  }

  @keyframes loginFloatShape {
    0%, 100% {
      transform: translate3d(0,0,0) rotate(0deg);
    }
    50% {
      transform: translate3d(18px,-22px,0) rotate(8deg);
    }
  }

  @keyframes loginRotateOrbit {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }

  @keyframes loginCenterPulse {
    0%, 100% {
      transform: translate(-50%, -50%) scale(1);
      box-shadow:
        0 22px 45px rgba(37, 99, 235, 0.36),
        0 12px 30px rgba(220, 38, 38, 0.22);
    }
    50% {
      transform: translate(-50%, -50%) scale(1.06);
      box-shadow:
        0 28px 58px rgba(37, 99, 235, 0.44),
        0 18px 40px rgba(220, 38, 38, 0.28);
    }
  }

  @keyframes loginChipFloat {
    0%, 100% {
      transform: translateY(0);
    }
    50% {
      transform: translateY(-8px);
    }
  }

  @keyframes loginButtonShine {
    0% {
      left: -120%;
    }
    45%, 100% {
      left: 130%;
    }
  }

  @media (max-width: 1199px) {
    .login-shell {
      min-height: 100vh;
      padding: 28px 18px;
    }

    .login-right {
      width: 100%;
      display: flex;
      justify-content: center;
    }

    .login-card {
      margin-left: 0;
      max-width: 560px;
    }
  }

  @media (max-width: 575px) {
    .login-shell {
      padding: 18px 14px;
    }

    .login-card {
      border-radius: 26px;
    }

    .login-card-header {
      flex-direction: column;
    }

    .login-card-title.ant-typography {
      font-size: 29px;
    }
  }
`;

const styles: Record<string, CSSProperties> = {};