import { Loading3QuartersOutlined } from "@ant-design/icons";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Navigate, Outlet, useLocation, useParams } from "react-router-dom";
import { fetchMyPermissions } from "../redux/reducers/auth.slice";

type Props = {
    children?: React.ReactNode;

    required?: string | string[]; // any-of
    anyOf?: string[];             // any-of
    allOf?: string[];             // all-of
    redirectTo?: string;          // default dashboard
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

    const token = useSelector((s: any) => s.auth?.token || "");
    const permissions: string[] = useSelector((s: any) => s.auth?.permissions || []);
    const loadingPerms = useSelector((s: any) => s.auth?.permissionsLoading || false);
    const permissionsLoaded = useSelector((s: any) => s.auth?.permissionsLoaded || false);
    const dispatch = useDispatch();

    useEffect(() => {
        if (!slug || !token) return;

        if (!loadingPerms && !permissionsLoaded) {
            dispatch(fetchMyPermissions({ slug }) as any);
        }
    }, [dispatch, slug, token, loadingPerms, permissionsLoaded]);

    // 1) auth check
    if (!token) {
        return (
            <Navigate
                to={`/${slug}/login`}
                replace
                state={{ from: location.pathname }}
            />
        );
    }

    // 2) while permissions loading: avoid wrong redirects
    if (loadingPerms) return null; // or return <Spinner />

    const requiredArr =
        typeof required === "string"
            ? [required]
            : Array.isArray(required)
                ? required
                : undefined;

    const needsPermissionCheck =
        !!requiredArr?.length || !!anyOf?.length || !!allOf?.length;

    // important: permission based route pe tab tak wait karo jab tak permissions fetch na ho jaye
    if (needsPermissionCheck && (!permissionsLoaded || loadingPerms)) {
        return <Loading3QuartersOutlined />; // loader bhi dikha sakte ho
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