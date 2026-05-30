import {
    LockOutlined,
    MailOutlined,
    SafetyCertificateOutlined,
} from "@ant-design/icons";
import { Button, Card, Form, Input, message, Typography } from "antd";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { adminLogin } from "../../redux/reducers/auth.slice";
import type { AppDispatch, RootState } from "../../redux/store";

const { Title, Text } = Typography;

export default function AdminLoginPage() {
    const navigate = useNavigate();
    const dispatch = useDispatch<AppDispatch>();

    const { loading } = useSelector((state: RootState) => state.auth);

    const handleLogin = async (values: { email: string; password: string }) => {
        try {
            const res: any = await dispatch(
                adminLogin({
                    email: values.email,
                    password: values.password,
                })
            ).unwrap();

            const payload = res?.data?.data || res?.data || res;

            const accessToken =
                payload?.accessToken ||
                payload?.token ||
                null;

            const user =
                payload?.user ||
                null;

            if (!accessToken || !user) {
                message.error("Invalid login response");
                return;
            }

            if (!user?.is_super_admin) {
                message.error("Only super admin can access admin panel");
                return;
            }

            localStorage.setItem("admin_access_token", accessToken);
            localStorage.setItem("admin_user", JSON.stringify(user));

            message.success("Welcome Super Admin");

            navigate("/admin/tenants", { replace: true });
        } catch (error: any) {
            message.error(
                error?.response?.data?.message ||
                error?.message ||
                "Login failed"
            );
        }
    };

    return (
        <div
            style={{
                minHeight: "100vh",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: 16,
            }}
        >
            <Card
                style={{
                    width: "100%",
                    maxWidth: 420,
                    borderRadius: 18,
                }}
            >
                <div style={{ textAlign: "center", marginBottom: 24 }}>
                    <SafetyCertificateOutlined style={{ fontSize: 38 }} />

                    <Title level={3} style={{ marginTop: 12, marginBottom: 4 }}>
                        Super Admin Login
                    </Title>

                    <Text type="secondary">
                        Access global tenant management panel
                    </Text>
                </div>

                <Form layout="vertical" onFinish={handleLogin}>
                    <Form.Item
                        label="Email"
                        name="email"
                        rules={[
                            { required: true, message: "Email is required" },
                            { type: "email", message: "Enter valid email" },
                        ]}
                    >
                        <Input
                            size="large"
                            prefix={<MailOutlined />}
                            placeholder="superadmin@example.com"
                        />
                    </Form.Item>

                    <Form.Item
                        label="Password"
                        name="password"
                        rules={[{ required: true, message: "Password is required" }]}
                    >
                        <Input.Password
                            size="large"
                            prefix={<LockOutlined />}
                            placeholder="Enter password"
                        />
                    </Form.Item>

                    <Button
                        block
                        size="large"
                        type="primary"
                        htmlType="submit"
                        loading={loading}
                    >
                        Login
                    </Button>
                </Form>
            </Card>
        </div>
    );
}