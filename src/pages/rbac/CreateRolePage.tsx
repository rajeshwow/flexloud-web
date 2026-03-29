import { Card, Typography } from "antd";
import { useNavigate, useParams } from "react-router-dom";
import RoleForm from "./components/RoleForm";

const { Title, Text } = Typography;

export default function CreateRolePage() {
    const navigate = useNavigate();
    const { slug = "" } = useParams();

    return (
        <Card>
            <Title level={3} style={{ marginTop: 0, marginBottom: 0 }}>
                Create Role
            </Title>
            <Text type="secondary">
                Create a new role and assign permissions.
            </Text>

            <div style={{ marginTop: 20 }}>
                <RoleForm
                    mode="create"
                    onSuccess={(roleId) => {
                        if (roleId) {
                            navigate(`/${slug}/rbac/${roleId}`);
                            return;
                        }
                        navigate(`/${slug}/rbac`);
                    }}
                />
            </div>
        </Card>
    );
}