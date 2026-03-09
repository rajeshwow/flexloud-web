import { Navigate, Outlet, Route, Routes } from "react-router-dom";
import AppShell from "../layouts/sidebar";
import ContactsPage from "../pages/Contacts/contacts.page";
import ContactForm from "../pages/Contacts/createContact";
import Dashboard from "../pages/Dashboard";
import LeadsPage from "../pages/leads/LeadsPage";
import LoginPage from "../pages/LoginPage";
import CreateOpportunityPage from "../pages/Opportunities/createOpportunities";
import OpportunitiesPage from "../pages/Opportunities/OpportunitiesPage";
import OrganizationCreate from "../pages/Organization/createOrg";
import OrganizationGet from "../pages/Organization/getOrg";
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
            path="contacts"
            element={
              <ProtectedRoute required="CONTACTS.VIEW">
                <ContactsPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="organization/create"
            element={
              <ProtectedRoute required="org.create">
                <OrganizationCreate />
              </ProtectedRoute>
            }
          />

          <Route
            path="organization/view"
            element={
              <ProtectedRoute required="ORG.VIEW">
                <OrganizationGet />
              </ProtectedRoute>
            }
          />

          <Route
            path="contacts/create"
            element={
              <ProtectedRoute required="contacts.create">
                <ContactForm />
              </ProtectedRoute>
            }
          />

          <Route
            path="opportunities"
            element={
              <ProtectedRoute required="opportunities.view">
                <OpportunitiesPage />
              </ProtectedRoute>
            }
          />
          {/* create opportunies */}
          <Route
            path="opportunities/create"
            element={
              <ProtectedRoute required="opportunities.create">
                <CreateOpportunityPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="leads/create"
            element={
              <ProtectedRoute required="leads.create">
                <LeadsPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="leads/view"
            element={
              <ProtectedRoute required="leads.view">
                <LeadsPage />
              </ProtectedRoute>
            }
          />

        </Route>
      </Route>

      <Route path="*" element={<div>404</div>} />
    </Routes>
  );
}