import { ArrowLeftOutlined } from "@ant-design/icons";
import { Button, Form, Space, Typography, message } from "antd";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { createQuote } from "../../redux/reducers/quotes.slice";
import type { AppDispatch, RootState } from "../../redux/store";
import QuoteEmailModal from "./components/QuoteEmailModal";
import QuoteForm from "./components/QuoteForm";

const { Title } = Typography;

export default function CreateQuotePage() {
    const [form] = Form.useForm();
    const dispatch = useDispatch<AppDispatch>();
    const navigate = useNavigate();
    const { slug } = useParams();
    const [emailModalOpen, setEmailModalOpen] = useState(false);
    const [createdQuote, setCreatedQuote] = useState<any>(null);

    const { createLoading } = useSelector((state: RootState) => state.quotes);

    const normalizeQuotePayload = (values: any) => {
        const relatedType = String(values?.related_to_type || "").toLowerCase();
        const relatedId =
            values?.related_to_id ||
            values?.related_record_id ||
            values?.related_record ||
            null;

        return {
            ...values,

            related_to_type: relatedType || null,
            related_to_id: relatedId,

            organization_id:
                relatedType === "organization"
                    ? relatedId
                    : values.organization_id || null,

            contact_id:
                relatedType === "contact"
                    ? relatedId
                    : values.contact_id || null,

            opportunity_id:
                relatedType === "opportunity"
                    ? relatedId
                    : values.opportunity_id || null,

            lead_id:
                relatedType === "lead"
                    ? relatedId
                    : values.lead_id || null,
        };
    };

    const handleSubmit = async (values: any) => {
        try {
            const normalized = normalizeQuotePayload(values);
            const response = await dispatch(createQuote(normalized)).unwrap();
            // debugger
            setCreatedQuote(response?.data?.data);
            setEmailModalOpen(true);
            message.success("Quote created successfully");
            // navigate(`/${slug}/quotes`);
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
            <QuoteEmailModal
                open={emailModalOpen}
                quote={createdQuote}
                onClose={() => {
                    setEmailModalOpen(false);
                    navigate(`/${slug}/quotes`);
                }}
                onSent={() => {
                    // optional: email send ke baad details page pe bhejna ho to
                    // navigate(`/${slug}/quotes/${createdQuote?.id}`);
                    navigate(`/${slug}/quotes`);
                }}
            />
        </div>
    );
}