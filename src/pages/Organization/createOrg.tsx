import { ArrowLeftOutlined } from "@ant-design/icons";
import { Button, Space } from "antd";
import { useNavigate, useParams } from "react-router-dom";
import OrganizationForm, {
    type OrganizationFormValues,
} from "./components/OrganizationForm";

type RouteParams = {
    slug: string;
};

type SelectOption = {
    label: string;
    value: string;
};

export default function CreateOrganizationPage() {
    const navigate = useNavigate();
    const { slug } = useParams<RouteParams>();

    const handleSubmit = async (values: OrganizationFormValues) => {
        navigate(`/${slug}/organization/view`);

        console.log("");
    };

    return (
        <div>
            <Space style={{ marginBottom: 16 }}>
                <Button icon={<ArrowLeftOutlined />} onClick={() => navigate(`/${slug}/organization/view`)}>
                    Back
                </Button>
            </Space>

            <OrganizationForm
                mode="create"
                onSubmit={handleSubmit}

            />
        </div>
    );
}