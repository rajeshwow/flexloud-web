import { Card, message } from "antd";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import {
    clearInteractionDetails,
    fetchInteractionDetails,
    updateInteraction,
} from "../../redux/reducers/interactions.slice";
import type { AppDispatch, RootState } from "../../redux/store";
import InteractionForm from "./components/InteractionForm";

export default function EditInteractionPage() {
    const dispatch = useDispatch<AppDispatch>();
    const navigate = useNavigate();
    const { id, slug } = useParams();

    const { details, detailsLoading, updateLoading } = useSelector(
        (state: RootState) => state.interactions
    );

    useEffect(() => {
        if (id) {
            dispatch(fetchInteractionDetails(id));
        }

        return () => {
            dispatch(clearInteractionDetails());
        };
    }, [dispatch, id]);

    const handleSubmit = async (values: any) => {
        if (!id) return;

        try {
            await dispatch(
                updateInteraction({
                    id,
                    payload: values,
                })
            ).unwrap();

            message.success("Event updated successfully");
            navigate(`/${slug}/events/${id}`);
        } catch (error: any) {
            message.error(error || "Failed to update Event");
        }
    };

    return (
        <Card bordered={false}>
            <InteractionForm
                mode="edit"
                initialValues={details}
                loading={detailsLoading}
                submitLoading={updateLoading}
                submitText="Update Event"
                onSubmit={handleSubmit}
            />
        </Card>
    );
}