import { Navigate, Outlet, Route, Routes } from "react-router-dom";
import AppShell from "../layouts/sidebar";
import ContactsPage from "../pages/ContactsPage";
import Dashboard from "../pages/Dashboard";
import LeadsPage from "../pages/LeadsPage";
import LoginPage from "../pages/LoginPage";
import OrganizationCreate from "../pages/Organization/createOrg";
import ProtectedRoute from "./ProtectedRoutes";

export default function CrmRoutes() {
  return (
    <Routes>
      <Route path="/:slug/login" element={<LoginPage />} />

      {/* Auth protected */}
      <Route path="/:slug" element={<ProtectedRoute />}>

        {/* 👇 COMMON LAYOUT */}
        <Route element={<AppShell children={<Outlet />} />}>

          <Route index element={<Navigate to="dashboard" replace />} />

          <Route path="dashboard" element={<Dashboard />} />

          <Route
            path="leads"
            element={
              <ProtectedRoute required="LEADS.VIEW">
                <LeadsPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="contacts"
            element={
              <ProtectedRoute required="CONTACTS.VIEW">
                <ContactsPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="organizations/create"
            element={
              <ProtectedRoute >
                <OrganizationCreate />
              </ProtectedRoute>
            }
          />

        </Route>
      </Route>

      <Route path="*" element={<div>404</div>} />
    </Routes>
  );
}