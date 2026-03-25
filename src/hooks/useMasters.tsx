import { useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchMasterValues } from "../redux/reducers/masters.slice";
import type { AppDispatch, RootState } from "../redux/store";

type MasterOption = {
    id?: string;
    label: string;
    value?: string;
    parent_id?: string | null;
    is_active?: boolean;
};

export const useMasters = (type_code: string, parent_id?: string) => {
    const dispatch = useDispatch<AppDispatch>();

    const data = useSelector(
        (state: RootState) => state.masters.masterValues[type_code] || []
    ) as MasterOption[];

    useEffect(() => {
        if (!type_code) return;

        if (!data.length) {
            dispatch(fetchMasterValues({ type_code }));
        }
    }, [dispatch, type_code, data.length]);

    const options = useMemo(() => {
        const filtered = parent_id
            ? data.filter((item) => item.parent_id === parent_id)
            : data;

        return filtered.map((item) => ({
            label: item.label,
            value: item.id || "",
        }));
    }, [data, parent_id]);

    return options;
};