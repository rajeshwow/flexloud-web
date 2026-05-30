import { useSelector } from "react-redux";
import { Navigate, Outlet } from "react-router-dom";
import type { RootState } from "../redux/store";

export default function SuperAdminRoute() {
    const { user: reduxUser, token: reduxToken } = useSelector(
        (state: RootState) => state.auth
    );

    const localToken = localStorage.getItem("admin_access_token");
    const localUserRaw = localStorage.getItem("admin_user");

    let localUser: any = null;

    try {
        localUser = localUserRaw ? JSON.parse(localUserRaw) : null;
    } catch {
        localUser = null;
    }

    const token = reduxToken || localToken;
    const user = reduxUser || localUser;

    if (!token) {
        return <Navigate to="/admin/login" replace />;
    }

    if (!user?.is_super_admin) {
        return <Navigate to="/unauthorized" replace />;
    }

    return <Outlet />;
}