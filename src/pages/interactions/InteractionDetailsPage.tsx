import { Card } from "antd";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import {
    clearInteractionDetails,
    fetchInteractionDetails,
} from "../../redux/reducers/interactions.slice";
import type { AppDispatch, RootState } from "../../redux/store";
import InteractionDetailsView from "./components/InteractionDetailsView";

export default function InteractionDetailsPage() {
    const dispatch = useDispatch<AppDispatch>();
    const { id } = useParams();

    const { details, detailsLoading } = useSelector(
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

    return (
        <Card bordered={false} style={{ background: "transparent", padding: 0 }}>
            <InteractionDetailsView interaction={details} loading={detailsLoading} />
        </Card>
    );
}