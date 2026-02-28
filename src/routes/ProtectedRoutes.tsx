import { useSelector } from "react-redux";
import { Navigate, Outlet, useParams } from "react-router-dom";

export default function ProtectedRoute() {
    const token = useSelector((state: any) => state.auth.token);
    const { slug } = useParams();

    if (!token) {
        return <Navigate to={`/${slug}/login`} replace />;
    }

    return <Outlet />;
}