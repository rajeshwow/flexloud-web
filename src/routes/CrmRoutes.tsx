import { Navigate, Route, Routes } from "react-router-dom";
import Dashboard from "../pages/Dashboard";
import LoginPage from "../pages/LoginPage";
import ProtectedRoute from './ProtectedRoutes';

export default function CrmRoutes() {
  return (
    <Routes>
      {/* Login */}
      <Route path="/:slug/login" element={<LoginPage />} />

      {/* Redirect root slug to dashboard (after login) */}
      <Route path="/:slug" element={<ProtectedRoute />}>
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
      </Route>

      {/* Catch all */}
      <Route path="*" element={<div>404</div>} />
    </Routes>
  );
}