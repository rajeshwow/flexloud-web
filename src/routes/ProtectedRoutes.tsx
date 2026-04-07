import { Loading3QuartersOutlined } from "@ant-design/icons";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Navigate, Outlet, useLocation, useParams } from "react-router-dom";
import { fetchMyPermissions } from "../redux/reducers/auth.slice";
import type { AppDispatch, RootState } from "../redux/store";

type Props = {
    children?: React.ReactNode;
    required?: string | string[];
    anyOf?: string[];
    allOf?: string[];
    redirectTo?: string;
};

export default function ProtectedRoute({
    children,
    required,
    anyOf,
    allOf,
    redirectTo,
}: Props) {
    const { slug } = useParams();
    const location = useLocation();
    const dispatch = useDispatch<AppDispatch>();

    const token = useSelector((state: RootState) => state.auth?.token || "");
    const permissions = useSelector(
        (state: RootState) => state.auth?.permissions || []
    );
    const loadingPerms = useSelector(
        (state: RootState) => state.auth?.permissionsLoading || false
    );
    const permissionsLoaded = useSelector(
        (state: RootState) => state.auth?.permissionsLoaded || false
    );

    const requiredArr =
        typeof required === "string"
            ? [required]
            : Array.isArray(required)
                ? required
                : undefined;

    const needsPermissionCheck =
        !!requiredArr?.length || !!anyOf?.length || !!allOf?.length;

    useEffect(() => {
        const shouldFetchPermissions = !needsPermissionCheck;

        if (!shouldFetchPermissions) return;
        if (!slug || !token) return;

        if (!loadingPerms && !permissionsLoaded) {
            dispatch(fetchMyPermissions({ slug }));
        }
    }, [dispatch, slug, token, loadingPerms, permissionsLoaded, needsPermissionCheck]);

    if (!token) {
        return (
            <Navigate
                to={`/${slug}/login`}
                replace
                state={{ from: location.pathname }}
            />
        );
    }

    if (!needsPermissionCheck && loadingPerms) {
        return (
            <div
                style={{
                    minHeight: "100vh",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                }}
            >
                <Loading3QuartersOutlined spin style={{ fontSize: 24 }} />
            </div>
        );
    }

    if (needsPermissionCheck && (!permissionsLoaded || loadingPerms)) {
        return (
            <div
                style={{
                    minHeight: "100vh",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                }}
            >
                <Loading3QuartersOutlined spin style={{ fontSize: 24 }} />
            </div>
        );
    }

    const hasAny = (req?: string[]) =>
        !req?.length || req.some((p) => permissions.includes(p));

    const hasAll = (req?: string[]) =>
        !req?.length || req.every((p) => permissions.includes(p));

    const allowed =
        (requiredArr ? hasAny(requiredArr) : true) &&
        (anyOf ? hasAny(anyOf) : true) &&
        (allOf ? hasAll(allOf) : true);

    if (!allowed) {
        return <Navigate to={redirectTo || `/${slug}/dashboard`} replace />;
    }

    return children ? <>{children}</> : <Outlet />;
}