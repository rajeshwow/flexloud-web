import { ArrowLeftOutlined } from "@ant-design/icons";
import { Button, Form, Space, Typography, message } from "antd";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { createInteraction } from "../../redux/reducers/interactions.slice";
import type { AppDispatch, RootState } from "../../redux/store";
import InteractionForm from "./components/InteractionForm";

const { Title } = Typography;

export default function CreateInteractionPage() {
    const [form] = Form.useForm();
    const dispatch = useDispatch<AppDispatch>();
    const navigate = useNavigate();
    const { slug } = useParams();

    const { createLoading } = useSelector((state: RootState) => state.interactions);

    const handleSubmit = async (values: any) => {
        try {
            const response = await dispatch(createInteraction(values)).unwrap();
            message.success("Event created successfully");
            navigate(`/${slug}/events/${response?.id}`);
        } catch (error: any) {
            message.error(error || "Failed to create Event");
        }
    };

    return (
        <div>
            <Space style={{ marginBottom: 16 }}>
                <Button
                    icon={<ArrowLeftOutlined />}
                    onClick={() => navigate(`/${slug}/events`)}
                >
                    Back
                </Button>
                <Title level={3} style={{ margin: 0 }}>
                    Create Event
                </Title>
            </Space>

            <InteractionForm
                // form={form}
                onSubmit={handleSubmit}
                loading={createLoading}
                submitText="Save"
            />
        </div>
    );
}