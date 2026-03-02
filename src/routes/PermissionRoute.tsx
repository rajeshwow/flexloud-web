import React from "react";
import { useSelector } from "react-redux";
import { Navigate, useLocation, useParams } from "react-router-dom";

type Props = {
    children: React.ReactNode;
    required?: string | string[]; // single or multiple
    anyOf?: string[];             // any one permission
    allOf?: string[];             // must have all
    redirectTo?: string;          // default: /:slug/dashboard
};

export default function PermissionRoute({
    children,
    required,
    anyOf,
    allOf,
    redirectTo,
}: Props) {
    const location = useLocation();
    const { slug } = useParams();

    const token = useSelector((s: any) => s.auth?.token || "");
    const permissions: string[] = useSelector((s: any) => s.auth?.permissions || []);
    const loadingPerms = useSelector((s: any) => s.auth?.permissionsLoading || false);

    // ✅ if not logged in -> go login
    if (!token) {
        return (
            <Navigate
                to={`/${slug}/login`}
                replace
                state={{ from: location.pathname }}
            />
        );
    }

    // ✅ while permissions loading (avoid false redirects)
    if (loadingPerms) return null; // or a spinner if you want

    const hasAny = (req?: string[]) => !req?.length || req.some((p) => permissions.includes(p));
    const hasAll = (req?: string[]) => !req?.length || req.every((p) => permissions.includes(p));

    // normalize "required"
    const requiredArr =
        typeof required === "string" ? [required] : Array.isArray(required) ? required : undefined;

    const allowed =
        (requiredArr ? hasAny(requiredArr) : true) &&
        (anyOf ? hasAny(anyOf) : true) &&
        (allOf ? hasAll(allOf) : true);

    if (!allowed) {
        const fallback = redirectTo || `/${slug}/dashboard`;
        return <Navigate to={fallback} replace />;
    }

    return <>{children}</>;
}