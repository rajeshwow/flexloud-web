import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchMasterValues } from "../redux/reducers/masters.slice";
import type { AppDispatch, RootState } from "../redux/store";

export const useMasters = (type_code: string) => {
    const dispatch = useDispatch<AppDispatch>();

    const data = useSelector(
        (state: RootState) => state.masters.masterValues[type_code] || []
    );

    useEffect(() => {
        if (!type_code) return;

        if (!data.length) {
            dispatch(fetchMasterValues({ type_code }));
        }
    }, [dispatch, type_code, data.length]);

    return data;
};