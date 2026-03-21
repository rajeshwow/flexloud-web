import { Navigate, Outlet, Route, Routes } from "react-router-dom";
import AppShell from "../layouts/sidebar";
import AttendanceView from "../pages/Attendance/AttendanceView";
import ContactsPage from "../pages/Contacts/contacts.page";
import ContactForm from "../pages/Contacts/createContact";
import StunningDashboard from "../pages/Home/dashboard";
import ImportDataPage from "../pages/Imports/importPage";
import CreateLeadForm from "../pages/leads/CreateLeads";
import LeadsPage from "../pages/leads/LeadsPage";
import LeaveListPage from "../pages/Leaves/LeaveListPage";
import LoginPage from "../pages/LoginPage";
import CreateOpportunityPage from "../pages/Opportunities/createOpportunities";
import OpportunitiesPage from "../pages/Opportunities/OpportunitiesPage";
import OrganizationCreate from "../pages/Organization/createOrg";
import OrganizationGet from "../pages/Organization/getOrg";
import CreateProductPage from "../pages/Products/CreateProductPage";
import ProductListPage from "../pages/Products/ProductListPage";
import CreateTask from "../pages/Tasks/CreateTask";
import EditTask from "../pages/Tasks/EditTask";
import TasksPage from "../pages/Tasks/TasksPage";
import UserGet from "../pages/Users/UserGet";
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

          <Route path="dashboard" element={<StunningDashboard />} />
          <Route path="home" element={<StunningDashboard />} />

          <Route
            path="users"
            element={
              <ProtectedRoute required="users.view">
                <UserGet />
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
                <CreateLeadForm />
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

          <Route
            path="products"
            element={
              <ProtectedRoute required="products.view">
                <ProductListPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="products/create"
            element={
              <ProtectedRoute required="products.create">
                <CreateProductPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="tasks"
            element={
              <ProtectedRoute required="tasks.view">
                <TasksPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="tasks/create"
            element={
              <ProtectedRoute required="tasks.create">
                <CreateTask />
              </ProtectedRoute>
            }
          />

          <Route
            path="tasks/edit/:id"
            element={
              <ProtectedRoute required="tasks.edit">
                <EditTask />
              </ProtectedRoute>
            }
          />

          <Route
            path="attendance"
            element={
              <ProtectedRoute required="attendance.view">
                <AttendanceView />
              </ProtectedRoute>
            }
          />

          <Route
            path="leaves"
            element={
              <ProtectedRoute required="leaves.view">
                <LeaveListPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="imports"
            element={
              <ProtectedRoute required="imports.view">
                <ImportDataPage />
              </ProtectedRoute>
            }
          />

        </Route>
      </Route>

      <Route path="*" element={<div>404</div>} />
    </Routes>
  );
}