import {
    ArrowLeftOutlined,
    CloseOutlined,
    EditOutlined,
    SaveOutlined,
} from "@ant-design/icons";
import { Button, Form, Skeleton, Space, Typography, message } from "antd";
import { useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import {
    clearQuoteDetails,
    fetchQuoteDetails,
    updateQuote,
} from "../../../redux/reducers/quotes.slice";
import type { AppDispatch, RootState } from "../../../redux/store";
import QuoteForm from "./QuoteForm";

const { Title, Text } = Typography;

export default function QuoteDetailsView() {
    const [form] = Form.useForm();
    const dispatch = useDispatch<AppDispatch>();
    const navigate = useNavigate();
    const { slug, id } = useParams();
    const location = useLocation();

    const isEditMode = useMemo(() => location.pathname.endsWith("/edit"), [location.pathname]);

    const { details, detailsLoading, updateLoading } = useSelector(
        (state: RootState) => state.quotes
    );

    useEffect(() => {
        if (!id) return;
        dispatch(fetchQuoteDetails(id));

        return () => {
            dispatch(clearQuoteDetails());
        };
    }, [dispatch, id]);

    const handleUpdate = async (values: any) => {
        if (!id) return;

        try {
            await dispatch(updateQuote({ id, payload: values })).unwrap();
            message.success("Quote updated successfully");
            navigate(`/${slug}/quotes`);
        } catch (error: any) {
            message.error(error || "Failed to update quote");
        }
    };

    if (detailsLoading) {
        return <Skeleton active />;
    }

    if (!details) {
        return <Text>Quote not found</Text>;
    }

    return (
        <div>
            <Space
                style={{
                    width: "100%",
                    justifyContent: "space-between",
                    marginBottom: 16,
                }}
            >
                <Space>
                    <Button icon={<ArrowLeftOutlined />} onClick={() => navigate(`/${slug}/quotes`)}>
                        Back
                    </Button>
                    <Title level={3} style={{ margin: 0 }}>
                        {isEditMode ? "Edit Quote" : "Quote Details"}
                    </Title>
                </Space>

                {!isEditMode ? (
                    <Button
                        type="primary"
                        icon={<EditOutlined />}
                        onClick={() => navigate(`/${slug}/quotes/${id}/edit`)}
                    >
                        Edit
                    </Button>
                ) : (
                    <Space>
                        <Button icon={<CloseOutlined />} onClick={() => navigate(`/${slug}/quotes/${id}`)}>
                            Cancel
                        </Button>
                        <Button
                            type="primary"
                            icon={<SaveOutlined />}
                            loading={updateLoading}
                            onClick={() => form.submit()}
                        >
                            Save
                        </Button>
                    </Space>
                )}
            </Space>

            <QuoteForm
                form={form}
                initialValues={details}
                onSubmit={handleUpdate}
                loading={updateLoading}
                submitText="Save"
                isEdit
            />
        </div>
    );
}