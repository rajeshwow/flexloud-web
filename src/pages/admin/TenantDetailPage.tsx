import { ArrowLeftOutlined } from "@ant-design/icons";
import { Button, Card, Descriptions, Space, Spin, Tag, Typography } from "antd";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { fetchAdminTenantById } from "../../redux/reducers/adminTenants.slice";
import type { AppDispatch, RootState } from "../../redux/store";

const { Title, Text } = Typography;

export default function TenantDetailPage() {
    const { tenantId } = useParams();
    const navigate = useNavigate();
    const dispatch = useDispatch<AppDispatch>();

    const { selectedTenant, detailLoading } = useSelector(
        (state: RootState) => state.adminTenants
    );

    useEffect(() => {
        if (tenantId) {
            dispatch(fetchAdminTenantById(tenantId));
        }
    }, [dispatch, tenantId]);

    if (detailLoading) {
        return (
            <Card style={{ borderRadius: 16 }}>
                <Spin />
            </Card>
        );
    }

    return (
        <Space direction="vertical" size={16} style={{ width: "100%" }}>
            <Button icon={<ArrowLeftOutlined />} onClick={() => navigate("/admin/tenants")}>
                Back to Tenants
            </Button>

            <Card style={{ borderRadius: 16 }}>
                <Space direction="vertical" size={2} style={{ marginBottom: 20 }}>
                    <Title level={4} style={{ margin: 0 }}>
                        Tenant Details
                    </Title>
                    <Text type="secondary">View tenant basic information.</Text>
                </Space>

                <Descriptions bordered column={1}>
                    <Descriptions.Item label="Tenant Name">
                        {selectedTenant?.name}
                    </Descriptions.Item>

                    <Descriptions.Item label="Slug">
                        {selectedTenant?.slug}
                    </Descriptions.Item>

                    <Descriptions.Item label="Status">
                        <Tag color={selectedTenant?.status === "active" ? "success" : "warning"}>
                            {selectedTenant?.status?.toUpperCase()}
                        </Tag>
                    </Descriptions.Item>

                    <Descriptions.Item label="Bootstrap">
                        {selectedTenant?.is_bootstrapped ? (
                            <Tag color="success">DONE</Tag>
                        ) : (
                            <Tag color="warning">PENDING</Tag>
                        )}
                    </Descriptions.Item>

                    <Descriptions.Item label="Created At">
                        {selectedTenant?.created_at
                            ? new Date(selectedTenant.created_at).toLocaleString()
                            : "-"}
                    </Descriptions.Item>
                </Descriptions>
            </Card>
        </Space>
    );
}