import { ArrowLeftOutlined, SaveOutlined } from "@ant-design/icons";
import { Button, Card, Form, Space, Spin, message } from "antd";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import {
    createVisit,
    getVisitById,
    resetVisitDetailsState,
    updateVisit,
} from "../../redux/reducers/visits.slice";
import type { AppDispatch, RootState } from "../../redux/store";
import VisitForm from "./components/VisitForm";
import { toIsoString } from "./utils/visitForm.utils";

type RouteParams = {
    id?: string;
    slug?: string;
};

export default function VisitFormPage() {
    const [form] = Form.useForm();
    const dispatch = useDispatch<AppDispatch>();
    const navigate = useNavigate();
    const { id, slug } = useParams<RouteParams>();

    const isEdit = Boolean(id);

    const { selectedVisit, detailsLoading, actionLoading } = useSelector(
        (state: RootState) => state.visits,
    );

    useEffect(() => {
        if (id) {
            dispatch(getVisitById(id));
        }
        return () => {
            dispatch(resetVisitDetailsState());
        };
    }, [dispatch, id]);

    const handleSubmit = async (values: any) => {
        const payload = {
            ...values,
            start_date: toIsoString(values.start_date),
            end_date: toIsoString(values.end_date),
            next_followup_date: toIsoString(values.next_followup_date),
        };

        delete payload.duration;
        delete payload.duration_in_minutes;
        delete payload.total_cost;
        delete payload.created_at;
        delete payload.updated_at;
        delete payload.created_by_name;
        delete payload.updated_by_name;

        try {
            if (isEdit && id) {
                await dispatch(updateVisit({ id, data: payload })).unwrap();
                message.success("Visit updated successfully");
            } else {
                await dispatch(createVisit(payload)).unwrap();
                message.success("Visit created successfully");
            }

            navigate(`/${slug}/visits`);
        } catch (error: any) {
            message.error(error?.message || "Something went wrong");
        }
    };

    return (
        <div>
            <Card
                title={isEdit ? "Edit Visit" : "Create Visit"}
                extra={
                    <Space>
                        <Button
                            icon={<ArrowLeftOutlined />}
                            onClick={() => navigate(`/${slug}/visits`)}
                        >
                            Back
                        </Button>
                        <Button
                            type="primary"
                            icon={<SaveOutlined />}
                            loading={actionLoading}
                            onClick={() => form.submit()}
                        >
                            Save
                        </Button>
                    </Space>
                }
            >
                <Spin spinning={detailsLoading}>
                    <Form
                        form={form}
                        layout="vertical"
                        onFinish={handleSubmit}
                        initialValues={{
                            spare_cost: 0,
                            employee_cost: 0,
                            travelling_cost: 0,
                            other_cost: 0,
                        }}
                    >
                        <VisitForm
                            form={form}
                            initialValues={selectedVisit}
                            isEdit={isEdit}
                        />
                    </Form>
                </Spin>
            </Card>
        </div>
    );
}