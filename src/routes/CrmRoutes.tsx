import { Navigate, Outlet, Route, Routes } from "react-router-dom";
import AppShell from "../layouts/sidebar";
import AttendanceView from "../pages/Attendance/AttendanceView";
import ContactDetailsPage from "../pages/Contacts/ContactDetailsPage";
import ContactEditPage from "../pages/Contacts/ContactEditPage";
import ContactForm from "../pages/Contacts/ContactForm";
import ContactsList from "../pages/Contacts/ContactsList";
import StunningDashboard from "../pages/Home/dashboard";
import ImportDataPage from "../pages/Imports/importPage";
import CreateLeadForm from "../pages/leads/CreateLeads";
import LeadDetailsPage from "../pages/leads/LeadDetailsPage";
import LeadsPage from "../pages/leads/LeadsPage";
import LeaveListPage from "../pages/Leaves/LeaveListPage";
import LoginPage from "../pages/LoginPage";
import CreateOpportunityPage from "../pages/Opportunities/createOpportunities";
import OpportunitiesPage from "../pages/Opportunities/OpportunitiesPage";
import { default as CreateOrganizationPage } from "../pages/Organization/createOrg";
import OrganizationGet from "../pages/Organization/getOrg";
import OrgDetailsPage from "../pages/Organization/OrgDetailsPage";
import CreateProductPage from "../pages/Products/CreateProductPage";
import ProductListPage from "../pages/Products/ProductListPage";
import QuoteDetailsPage from "../pages/Quotes/components/QuoteDetailsView";
import CreateQuotePage from "../pages/Quotes/CreateQuotePage";
import QuotesListPage from "../pages/Quotes/QuotesListPage";
import CreateTask from "../pages/Tasks/CreateTask";
import EditTask from "../pages/Tasks/EditTask";
import TasksPage from "../pages/Tasks/TasksPage";
import UserGet from "../pages/Users/UserGet";
import VisitFormPage from "../pages/Visits/VisitFormPage";
import VisitListPage from "../pages/Visits/VisitListPage";
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
            path="organization/view"
            element={
              <ProtectedRoute required="ORG.VIEW">
                <OrganizationGet />
              </ProtectedRoute>
            }
          />
          <Route
            path="organization/view/:id"
            element={
              <ProtectedRoute required="ORG.VIEW">
                <OrgDetailsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="organization/create"
            element={
              <ProtectedRoute required="org.create">
                <CreateOrganizationPage />
              </ProtectedRoute>
            }
          />

          {/* ----------------------------------------------------------------------------------------- */}

          {/* /:slug/contacts */}
          <Route
            path="contacts"
            element={
              <ProtectedRoute required="contacts.view">
                <ContactsList />
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
          {/* /:slug/contacts/:id */}
          <Route
            path="contacts/:id"
            element={
              <ProtectedRoute required="contacts.view">
                <ContactDetailsPage />
              </ProtectedRoute>
            }
          />

          {/* /:slug/contacts/:id/edit */}
          <Route
            path="contacts/:id/edit"
            element={
              <ProtectedRoute required="contacts.edit">
                <ContactEditPage />
              </ProtectedRoute>
            }
          />
          {/* --------------------------------------------------------------------------------------------------- */}

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

          {/* --------------------------------------------------------------------------------------------------- */}

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
            path="leads/:id"
            element={
              <ProtectedRoute required="leads.view">
                <LeadDetailsPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="leads/:id/edit"
            element={
              <ProtectedRoute required="leads.view">
                <LeadDetailsPage />
              </ProtectedRoute>
            }
          />

          {/* --------------------------------------------------------------------------------------------------- */}

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

          {/* --------------------------------------------------------------------------------------------------- */}

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

          {/* --------------------------------------------------------------------------------------------------- */}

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

          {/* --------------------------------------------------------------------------------------------------- */}

          <Route
            path="visits"
            element={
              <ProtectedRoute required="visits.view">
                <VisitListPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="visits/create"
            element={
              <ProtectedRoute required="visits.create">
                <VisitFormPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="visits/edit/:id"
            element={
              <ProtectedRoute required="visits.edit">
                <VisitFormPage />
              </ProtectedRoute>
            }
          />
          {/* ------------------------------------------------------------------------ */}

          {/* //quotes  */}
          <Route
            path="quotes"
            element={
              <ProtectedRoute required="quotes.view">
                <QuotesListPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="quotes/create"
            element={
              <ProtectedRoute required="quotes.create">
                <CreateQuotePage />
              </ProtectedRoute>
            }
          />

          <Route
            path="quotes/edit/:id"
            element={
              <ProtectedRoute required="quotes.edit">
                <QuoteDetailsPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="quotes/:id"
            element={
              <ProtectedRoute required="quotes.view">
                <QuoteDetailsPage />
              </ProtectedRoute>
            }
          />

        </Route>
      </Route>

      <Route path="*" element={<div>404</div>} />
    </Routes>
  );
}