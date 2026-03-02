import { Navigate, Route, Routes } from "react-router-dom";
import ContactsPage from "../pages/ContactsPage";
import Dashboard from "../pages/Dashboard";
import LeadsPage from "../pages/LeadsPage";
import LoginPage from "../pages/LoginPage";
import ProtectedRoute from "./ProtectedRoutes";



export default function CrmRoutes() {
  return (
    <Routes>
      <Route path="/:slug/login" element={<LoginPage />} />

      {/* ✅ Just auth-protected */}
      <Route path="/:slug" element={<ProtectedRoute />}>
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
      </Route>

      {/* ✅ Permission protected routes */}
      <Route path="/:slug" element={<ProtectedRoute required="LEADS.VIEW" />}>
        <Route path="leads" element={<LeadsPage />} />
      </Route>

      <Route path="/:slug" element={<ProtectedRoute required="CONTACTS.VIEW" />}>
        <Route path="contacts" element={<ContactsPage />} />
      </Route>

      <Route path="*" element={<div>404</div>} />
    </Routes>
  );
}