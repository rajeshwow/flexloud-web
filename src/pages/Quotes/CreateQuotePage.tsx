import { ArrowLeftOutlined } from "@ant-design/icons";
import { Button, Form, Space, Typography, message } from "antd";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { createQuote } from "../../redux/reducers/quotes.slice";
import type { AppDispatch, RootState } from "../../redux/store";
import QuoteForm from "./components/QuoteForm";

const { Title } = Typography;

export default function CreateQuotePage() {
    const [form] = Form.useForm();
    const dispatch = useDispatch<AppDispatch>();
    const navigate = useNavigate();
    const { slug } = useParams();

    const { createLoading } = useSelector((state: RootState) => state.quotes);

    const handleSubmit = async (values: any) => {
        try {
            const response = await dispatch(createQuote(values)).unwrap();
            message.success("Quote created successfully");
            navigate(`/${slug}/quotes`);
        } catch (error: any) {
            message.error(error || "Failed to create quote");
        }
    };

    return (
        <div>
            <Space style={{ marginBottom: 16 }}>
                <Button icon={<ArrowLeftOutlined />} onClick={() => navigate(`/${slug}/quotes`)}>
                    Back
                </Button>
                <Title level={3} style={{ margin: 0 }}>
                    Create Quote
                </Title>
            </Space>

            <QuoteForm form={form} onSubmit={handleSubmit} loading={createLoading} submitText="Save" />
        </div>
    );
}