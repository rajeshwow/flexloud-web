import {
    ApartmentOutlined,
    ArrowRightOutlined,
    CrownOutlined,
    GlobalOutlined,
    LinkOutlined,
    LockOutlined,
    SafetyCertificateOutlined,
    TeamOutlined,
    ThunderboltOutlined,
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

const AccountSlugRequiredPage2: React.FC = () => {
    const navigate = useNavigate();
    const screens = useBreakpoint();

    const handleSubmit = (values: { slug: string }) => {
        const slug = values.slug?.trim();

        if (!slug) return;

        navigate(`/${slug}/login`);
    };

    const isMobile = !screens.lg;

    return (
        <>
            <style>{accountPageCss}</style>

            <div className="account-page">
                <div className="bg-grid" />
                <div className="glow glow-blue" />
                <div className="glow glow-red" />
                <div className="glow glow-purple" />

                <div className="float-shape shape-1" />
                <div className="float-shape shape-2" />
                <div className="float-shape shape-3" />

                <div className="account-shell">
                    {!isMobile && (
                        <section className="account-left">
                            <div className="brand-pill">
                                <CrownOutlined />
                                <span>Flexloud CRM</span>
                            </div>

                            <Title className="hero-title">
                                Enter your account name to open your workspace.
                            </Title>

                            <Paragraph className="hero-desc">
                                Your CRM workspace is protected with tenant-based access. Every company has
                                a unique account name in the URL.
                            </Paragraph>

                            <div className="visual-board">
                                <div className="center-orbit">
                                    <ApartmentOutlined />
                                </div>

                                <div className="orbit-card orbit-card-1">
                                    <SafetyCertificateOutlined />
                                    <span>Secure Access</span>
                                </div>

                                <div className="orbit-card orbit-card-2">
                                    <TeamOutlined />
                                    <span>Team Workspace</span>
                                </div>

                                <div className="orbit-card orbit-card-3">
                                    <ThunderboltOutlined />
                                    <span>Fast CRM</span>
                                </div>

                                <div className="orbit-card orbit-card-4">
                                    <LockOutlined />
                                    <span>Tenant Protected</span>
                                </div>
                            </div>

                            <div className="left-footer-note">
                                <div className="mini-stat">
                                    <strong>360°</strong>
                                    <span>Business View</span>
                                </div>

                                <div className="mini-stat">
                                    <strong>Safe</strong>
                                    <span>Tenant Data</span>
                                </div>

                                <div className="mini-stat">
                                    <strong>CRM</strong>
                                    <span>Ready Access</span>
                                </div>
                            </div>
                        </section>
                    )}

                    <section className="account-right">
                        <Card
                            bordered={false}
                            className="account-card"
                            styles={{
                                body: {
                                    padding: screens.xs ? 24 : 34,
                                },
                            }}
                        >
                            <Space direction="vertical" size={22} style={{ width: "100%" }}>
                                <div className="card-header">
                                    <div className="card-icon">
                                        <ApartmentOutlined />
                                    </div>

                                    <div>
                                        <div className="secure-pill">
                                            <LockOutlined />
                                            <span>Workspace Login</span>
                                        </div>

                                        <Title level={2} className="card-title">
                                            Account name required
                                        </Title>

                                        <Text className="card-subtitle">
                                            Please enter your account name to continue.
                                        </Text>
                                    </div>
                                </div>

                                <Alert
                                    className="url-alert"
                                    showIcon
                                    icon={<LinkOutlined />}
                                    type="info"
                                    message={
                                        <Text strong className="alert-title">
                                            Your CRM URL should include your account name
                                        </Text>
                                    }
                                    description={
                                        <div className="alert-desc">
                                            Example:{" "}
                                            <Text code className="url-code">
                                                https://yourdomain.com/
                                                <span className="account-name-highlight">flexloud-demo</span>
                                                /login
                                            </Text>
                                            <br /><br />
                                            Here{" "}
                                            <span className="inline-account-highlight">flexloud-demo</span>{" "}
                                            is your account name.
                                        </div>
                                    }
                                />

                                <div className="admin-box">
                                    <div className="admin-box-icon">
                                        <TeamOutlined />
                                    </div>

                                    <Text className="admin-text">
                                        Contact your team admin to get this account name.
                                    </Text>
                                </div>

                                <Form layout="vertical" onFinish={handleSubmit}>
                                    <Form.Item
                                        label={<span className="form-label">Account name</span>}
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
                                            className="account-input"
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
                                        className="continue-btn"
                                    >
                                        Continue to Login
                                    </Button>
                                </Form>

                                <Divider className="soft-divider" />

                                <div className="bottom-note">
                                    <SafetyCertificateOutlined />
                                    <div>
                                        <Text strong className="bottom-title">
                                            Multi-tenant protected access
                                        </Text>
                                        <br />
                                        <Text className="bottom-desc">
                                            Each company uses a separate account name so data stays isolated.
                                        </Text>
                                    </div>
                                </div>
                            </Space>
                        </Card>
                    </section>
                </div>
            </div>
        </>
    );
};

export default AccountSlugRequiredPage2;

const accountPageCss = `
  .account-page {
    min-height: 100vh;
    position: relative;
    overflow: hidden;
    background:
      radial-gradient(circle at 15% 15%, rgba(37, 99, 235, 0.35), transparent 30%),
      radial-gradient(circle at 88% 18%, rgba(220, 38, 38, 0.30), transparent 28%),
      radial-gradient(circle at 50% 90%, rgba(124, 58, 237, 0.22), transparent 30%),
      linear-gradient(135deg, #07111f 0%, #0f172a 45%, #1e1b4b 100%);
  }

  .bg-grid {
    position: absolute;
    inset: 0;
    opacity: 0.18;
    background-image:
      linear-gradient(rgba(255,255,255,0.08) 1px, transparent 1px),
      linear-gradient(90deg, rgba(255,255,255,0.08) 1px, transparent 1px);
    background-size: 42px 42px;
    mask-image: radial-gradient(circle at center, black, transparent 78%);
  }

  .glow {
    position: absolute;
    border-radius: 999px;
    filter: blur(90px);
    pointer-events: none;
  }

  .glow-blue {
    width: 430px;
    height: 430px;
    left: -130px;
    top: -110px;
    background: rgba(59, 130, 246, 0.42);
  }

  .glow-red {
    width: 390px;
    height: 390px;
    right: -120px;
    top: 90px;
    background: rgba(239, 68, 68, 0.34);
  }

  .glow-purple {
    width: 420px;
    height: 420px;
    left: 38%;
    bottom: -180px;
    background: rgba(124, 58, 237, 0.26);
  }

  .float-shape {
    position: absolute;
    border-radius: 26px;
    border: 1px solid rgba(255,255,255,0.14);
    background: rgba(255,255,255,0.06);
    backdrop-filter: blur(12px);
    pointer-events: none;
  }

  .shape-1 {
    width: 84px;
    height: 84px;
    left: 6%;
    top: 16%;
    animation: floatShape 8s ease-in-out infinite;
  }

  .shape-2 {
    width: 52px;
    height: 52px;
    right: 8%;
    bottom: 14%;
    transform: rotate(20deg);
    animation: floatShape 9s ease-in-out infinite reverse;
  }

  .shape-3 {
    width: 64px;
    height: 64px;
    left: 45%;
    top: 10%;
    border-radius: 999px;
    animation: floatShape 10s ease-in-out infinite;
  }

  .account-shell {
    min-height: 100vh;
    width: 100%;
    display: grid;
    grid-template-columns: minmax(0, 1.05fr) minmax(420px, 0.75fr);
    align-items: center;
    gap: 42px;
    padding: 42px 6vw;
    position: relative;
    z-index: 2;
  }

  .account-left {
    max-width: 720px;
    animation: slideLeft 720ms ease both;
  }

  .brand-pill {
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

  .hero-title.ant-typography {
    color: #ffffff;
    margin: 0 0 16px;
    font-size: clamp(38px, 4vw, 58px);
    line-height: 1.05;
    letter-spacing: -1.8px;
    font-family: Georgia, "Times New Roman", serif;
    text-shadow: 0 20px 45px rgba(0,0,0,0.30);
  }

  .hero-desc.ant-typography {
    max-width: 590px;
    color: rgba(226, 232, 240, 0.78);
    font-size: 16px;
    line-height: 1.9;
    margin-bottom: 34px;
  }

  .visual-board {
    width: min(560px, 100%);
    height: 310px;
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
  }

  .visual-board::before {
    content: "";
    position: absolute;
    inset: 28px;
    border: 1px dashed rgba(255,255,255,0.20);
    border-radius: 999px;
    animation: rotateOrbit 18s linear infinite;
  }

  .visual-board::after {
    content: "";
    position: absolute;
    inset: 72px;
    border: 1px dashed rgba(255,255,255,0.14);
    border-radius: 999px;
    animation: rotateOrbit 24s linear infinite reverse;
  }

  .center-orbit {
    position: absolute;
    left: 50%;
    top: 50%;
    width: 88px;
    height: 88px;
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
    animation: centerPulse 2.8s ease-in-out infinite;
  }

  .orbit-card {
    position: absolute;
    z-index: 3;
    display: inline-flex;
    align-items: center;
    gap: 9px;
    padding: 11px 14px;
    border-radius: 18px;
    color: #e5edff;
    background: rgba(15, 23, 42, 0.58);
    border: 1px solid rgba(255,255,255,0.14);
    box-shadow: 0 18px 42px rgba(0,0,0,0.22);
    backdrop-filter: blur(14px);
    font-size: 13px;
    font-weight: 800;
    animation: chipFloat 4s ease-in-out infinite;
  }

  .orbit-card .anticon {
    color: #93c5fd;
    font-size: 17px;
  }

  .orbit-card-1 {
    left: 34px;
    top: 48px;
  }

  .orbit-card-2 {
    right: 34px;
    top: 62px;
    animation-delay: 0.4s;
  }

  .orbit-card-3 {
    left: 48px;
    bottom: 48px;
    animation-delay: 0.8s;
  }

  .orbit-card-4 {
    right: 46px;
    bottom: 52px;
    animation-delay: 1.1s;
  }

  .left-footer-note {
    display: flex;
    gap: 14px;
    flex-wrap: wrap;
    margin-top: 24px;
  }

  .mini-stat {
    min-width: 145px;
    padding: 16px 18px;
    border-radius: 22px;
    background: rgba(255,255,255,0.075);
    border: 1px solid rgba(255,255,255,0.12);
    backdrop-filter: blur(14px);
    box-shadow: 0 18px 42px rgba(0,0,0,0.16);
    transition: transform 220ms ease, background 220ms ease;
  }

  .mini-stat:hover {
    transform: translateY(-5px);
    background: rgba(255,255,255,0.11);
  }

  .mini-stat strong {
    display: block;
    color: #ffffff;
    font-size: 24px;
    line-height: 1;
    margin-bottom: 7px;
    font-family: Georgia, "Times New Roman", serif;
  }

  .mini-stat span {
    color: rgba(226, 232, 240, 0.72);
    font-size: 12px;
  }

  .account-right {
    animation: slideRight 760ms ease both;
  }

  .account-card {
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

  .account-card::before {
    content: "";
    position: absolute;
    width: 230px;
    height: 230px;
    right: -110px;
    top: -120px;
    border-radius: 999px;
    background: rgba(59, 130, 246, 0.14);
  }

  .account-card::after {
    content: "";
    position: absolute;
    width: 220px;
    height: 220px;
    left: -110px;
    bottom: -120px;
    border-radius: 999px;
    background: rgba(239, 68, 68, 0.10);
  }

  .card-header {
    display: flex;
    gap: 15px;
    align-items: flex-start;
    position: relative;
    z-index: 2;
  }

  .card-icon {
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

  .secure-pill {
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

  .card-title.ant-typography {
    margin: 0 0 4px;
    color: #0f172a;
    font-family: Georgia, "Times New Roman", serif;
    font-size: 31px;
    line-height: 1.12;
  }

  .card-subtitle {
    color: #64748b;
    font-size: 14px;
  }

  .url-alert {
    border-radius: 20px;
    background: linear-gradient(135deg, rgba(239,246,255,0.95), rgba(254,242,242,0.92));
    border: 1px solid rgba(148,163,184,0.22);
    box-shadow: 0 14px 34px rgba(15,23,42,0.07);
    position: relative;
    z-index: 2;
  }

  .url-alert .ant-alert-icon {
    color: #2563eb !important;
    font-size: 19px;
  }

  .alert-title {
    color: #0f172a;
  }

  .alert-desc {
    color: #475569;
    line-height: 1.8;
  }

  .url-code {
    display: inline-block;
    margin-top: 4px;
    padding: 7px 10px !important;
    border-radius: 12px !important;
    background: #0f172a !important;
    color: #e0f2fe !important;
    border: 1px solid rgba(96,165,250,0.25);
    white-space: normal;
    word-break: break-word;
  }

  .account-name-highlight {
    color: #fca5a5;
    font-weight: 950;
    text-decoration: underline;
    text-decoration-thickness: 2px;
    text-underline-offset: 3px;
  }

  .inline-account-highlight {
    display: inline-block;
    padding: 2px 8px;
    border-radius: 999px;
    color: #ffffff;
    background: linear-gradient(135deg, #2563eb, #dc2626);
    font-weight: 900;
  }

  .admin-box {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 13px 15px;
    border-radius: 18px;
    background: rgba(248,250,252,0.82);
    border: 1px solid rgba(148,163,184,0.20);
    position: relative;
    z-index: 2;
    animation: softPulse 3.2s ease-in-out infinite;
  }

  .admin-box-icon {
    width: 38px;
    height: 38px;
    min-width: 38px;
    display: grid;
    place-items: center;
    border-radius: 14px;
    color: #dc2626;
    background: rgba(254,226,226,0.9);
    font-size: 18px;
  }

  .admin-text {
    color: #334155;
    font-size: 14px;
  }

  .form-label {
    color: #0f172a;
    font-weight: 850;
  }

  .account-input.ant-input-affix-wrapper {
    height: 50px;
    border-radius: 16px;
    background: rgba(248,250,252,0.9);
    border: 1px solid rgba(148,163,184,0.32);
    box-shadow: 0 8px 18px rgba(15,23,42,0.04);
    transition: all 220ms ease;
    position: relative;
    z-index: 2;
  }

  .account-input.ant-input-affix-wrapper .anticon {
    color: #2563eb;
  }

  .account-input.ant-input-affix-wrapper:hover,
  .account-input.ant-input-affix-wrapper-focused {
    border-color: rgba(37,99,235,0.55);
    box-shadow: 0 0 0 4px rgba(37,99,235,0.10), 0 12px 26px rgba(15,23,42,0.08);
  }

  .account-input .ant-input {
    background: transparent !important;
    color: #0f172a;
    font-weight: 750;
  }

  .account-input .ant-input::placeholder {
    color: rgba(100,116,139,0.70);
  }

  .continue-btn {
    height: 50px;
    border-radius: 16px;
    border: none;
    font-weight: 950;
    font-size: 15px;
    background: linear-gradient(135deg, #2563eb 0%, #4f46e5 45%, #dc2626 100%);
    box-shadow: 0 18px 38px rgba(37,99,235,0.28);
    position: relative;
    overflow: hidden;
    transition: transform 220ms ease, filter 220ms ease, box-shadow 220ms ease;
    z-index: 2;
  }

  .continue-btn:hover {
    transform: translateY(-2px);
    filter: brightness(1.04);
    box-shadow: 0 24px 48px rgba(37,99,235,0.34) !important;
  }

  .continue-btn::before {
    content: "";
    position: absolute;
    top: 0;
    left: -120%;
    width: 70%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.28), transparent);
    transform: skewX(-20deg);
    animation: buttonShine 3s ease-in-out infinite;
  }

  .soft-divider {
    margin: 0;
    border-color: rgba(148,163,184,0.22);
  }

  .bottom-note {
    display: flex;
    gap: 11px;
    align-items: flex-start;
    padding: 12px 14px;
    border-radius: 18px;
    background: rgba(240,253,244,0.70);
    border: 1px solid rgba(34,197,94,0.14);
    position: relative;
    z-index: 2;
  }

  .bottom-note > .anticon {
    color: #16a34a;
    font-size: 21px;
    margin-top: 3px;
  }

  .bottom-title {
    color: #0f172a;
  }

  .bottom-desc {
    color: #64748b;
    font-size: 13px;
  }

  @keyframes slideLeft {
    from {
      opacity: 0;
      transform: translateX(-36px);
    }
    to {
      opacity: 1;
      transform: translateX(0);
    }
  }

  @keyframes slideRight {
    from {
      opacity: 0;
      transform: translateX(36px) scale(0.98);
    }
    to {
      opacity: 1;
      transform: translateX(0) scale(1);
    }
  }

  @keyframes floatShape {
    0%, 100% {
      transform: translate3d(0,0,0) rotate(0deg);
    }
    50% {
      transform: translate3d(18px,-22px,0) rotate(8deg);
    }
  }

  @keyframes rotateOrbit {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }

  @keyframes centerPulse {
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

  @keyframes chipFloat {
    0%, 100% {
      transform: translateY(0);
    }
    50% {
      transform: translateY(-8px);
    }
  }

  @keyframes softPulse {
    0%, 100% {
      box-shadow: 0 10px 24px rgba(15,23,42,0.05);
    }
    50% {
      box-shadow: 0 14px 34px rgba(37,99,235,0.12);
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

  @media (max-width: 1199px) {
    .account-shell {
      grid-template-columns: 1fr;
      padding: 28px 18px;
      justify-items: center;
    }

    .account-right {
      width: 100%;
      display: flex;
      justify-content: center;
    }

    .account-card {
      margin-left: 0;
      max-width: 560px;
    }
  }

  @media (max-width: 575px) {
    .account-shell {
      padding: 18px 14px;
    }

    .account-card {
      border-radius: 26px;
    }

    .card-header {
      flex-direction: column;
    }

    .card-title.ant-typography {
      font-size: 28px;
    }

    .url-code {
      font-size: 12px;
    }
  }
`;