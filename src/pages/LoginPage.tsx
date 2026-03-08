import { Button, Card, Form, Input, Typography, message } from "antd";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { fetchMyPermissions, login } from "../redux/reducers/auth.slice";
import { setTenantId, setTenantSlug } from "../redux/reducers/tenant.slice";

export default function LoginPage() {
    const { slug = "" } = useParams();
    const navigate = useNavigate();
    const dispatch: any = useDispatch();

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
            await dispatch(fetchMyPermissions({ slug })); // ✅ add
            dispatch(setTenantId(res.payload.data.data.user?.tenantId));

            navigate(`/${slug}/dashboard`, { replace: true });
            message.success("Login successful");
        } else {
            message.error(res.payload?.message || "Invalid email or password");
        }
    };

    return (
        <div style={{ minHeight: "100vh", display: "grid", placeItems: "center", padding: 16 }}>
            <Card style={{ width: 380 }}>
                <Typography.Title level={3} style={{ marginBottom: 4 }}>
                    Login
                </Typography.Title>

                <Typography.Text type="secondary">
                    Tenant: <b>{slug}</b>
                </Typography.Text>

                <Form layout="vertical" onFinish={onFinish} style={{ marginTop: 16 }}>
                    <Form.Item
                        name="email"
                        label="Email"
                        rules={[
                            { required: true, message: "Email required" },
                            { type: "email", message: "Invalid email" },
                        ]}
                    >
                        <Input placeholder="name@company.com" autoComplete="email" />
                    </Form.Item>

                    <Form.Item
                        name="password"
                        label="Password"
                        rules={[{ required: true, message: "Password required" }]}
                    >
                        <Input.Password placeholder="••••••••" autoComplete="current-password" />
                    </Form.Item>

                    <Button type="primary" htmlType="submit" block loading={loading}>
                        Sign in
                    </Button>
                </Form>
            </Card>
        </div>
    );
}