import { lazy, Suspense } from "react";
import { Navigate, Outlet, Route, Routes } from "react-router-dom";
const AppShell = lazy(() => import("../layouts/sidebar"));
const AccountSlugRequiredPage2 = lazy(() => import("../pages/account/AccountSlugRequiredPage2"));
const AttendanceView = lazy(() => import("../pages/Attendance/AttendanceView"));
const ContactDetailsPage = lazy(() => import("../pages/Contacts/ContactDetailsPage"));
const ContactEditPage = lazy(() => import("../pages/Contacts/ContactEditPage"));
const ContactForm = lazy(() => import("../pages/Contacts/ContactForm"));
const ContactsList = lazy(() => import("../pages/Contacts/ContactsList"));
const CreateDeliveryChallanPage = lazy(() => import("../pages/deliveryChallans/CreateDeliveryChallanPage"));
const DeliveryChallanDetailsPage = lazy(() => import("../pages/deliveryChallans/DeliveryChallanDetailsPage"));
const DeliveryChallanListPage = lazy(() => import("../pages/deliveryChallans/DeliveryChallanListPage"));
const EditDeliveryChallanPage = lazy(() => import("../pages/deliveryChallans/EditDeliveryChallanPage"));
const DashboardPage = lazy(() => import("../pages/Home/dashboard2"));
const ImportDataPage = lazy(() => import("../pages/Imports/importPage"));
const CreateInteractionPage = lazy(() => import("../pages/interactions/CreateInteractionPage"));
const EditInteractionPage = lazy(() => import("../pages/interactions/EditInteractionPage"));
const InteractionDetailsPage = lazy(() => import("../pages/interactions/InteractionDetailsPage"));
const InteractionsListPage = lazy(() => import("../pages/interactions/InteractionsListPage"));
const CreateLeadForm = lazy(() => import("../pages/leads/CreateLeads"));
const LeadDetailsPage = lazy(() => import("../pages/leads/LeadDetailsPage"));
const LeadsPage = lazy(() => import("../pages/leads/LeadsPage"));
const LeaveListPage = lazy(() => import("../pages/Leaves/LeaveListPage"));
const LoginPage3 = lazy(() => import("../pages/LoginPage3"));
const MyDayPage = lazy(() => import("../pages/my-day/MyDayPage"));
const CreateOpportunityPage = lazy(() => import("../pages/Opportunities/createOpportunities"));
const EditOpportunityPage = lazy(() => import("../pages/Opportunities/EditOpportunityPage"));
const OpportunitiesPage = lazy(() => import("../pages/Opportunities/OpportunitiesPage"));
const OpportunityDetailsPage = lazy(() => import("../pages/Opportunities/OpportunityDetailsPage"));
const CreateOrganizationPage = lazy(() => import("../pages/Organization/createOrg"));
const OrganizationGet = lazy(() => import("../pages/Organization/getOrg"));
const OrgDetailsPage = lazy(() => import("../pages/Organization/OrgDetailsPage"));
const CreateProductPage = lazy(() => import("../pages/Products/CreateProductPage"));
const ProductListPage = lazy(() => import("../pages/Products/ProductListPage"));
const CreatePurchaseOrder = lazy(() => import("../pages/purchase-orders/CreatePurchaseOrder"));
const PurchaseOrderDetailsPage = lazy(() => import("../pages/purchase-orders/PurchaseOrderDetailsPage"));
const PurchaseOrderListPage = lazy(() => import("../pages/purchase-orders/PurchaseOrderListPage"));
const QuoteDetailsView = lazy(() => import("../pages/Quotes/components/QuoteDetailsView"));
const CreateQuotePage = lazy(() => import("../pages/Quotes/CreateQuotePage"));
const QuoteDetailsPage = lazy(() => import("../pages/Quotes/QuoteDetailsPage"));
const QuotesListPage = lazy(() => import("../pages/Quotes/QuotesListPage"));
const CreateRolePage = lazy(() => import("../pages/rbac/CreateRolePage"));
const RoleDetailsPage = lazy(() => import("../pages/rbac/RoleDetailsPage"));
const RolesListPage = lazy(() => import("../pages/rbac/RolesListPage"));
const SalesOrderDetailsPage = lazy(() => import("../pages/salesOrders/SalesOrderDetailsPage"));
const SalesOrderFormPage = lazy(() => import("../pages/salesOrders/SalesOrderFormPage"));
const SalesOrderListPage = lazy(() => import("../pages/salesOrders/SalesOrderListPage"));
const TallyPerformancePage = lazy(() => import("../pages/tally-performance/TallyPerformancePage"));
const TallyEmployeesPage = lazy(() => import("../pages/Tally/TallyEmployeesPage"));
const CreateTask = lazy(() => import("../pages/Tasks/CreateTask"));
const EditTask = lazy(() => import("../pages/Tasks/EditTask"));
const TaskDetailsPage = lazy(() => import("../pages/Tasks/TaskDetailsPage"));
const TasksPage = lazy(() => import("../pages/Tasks/TasksPage"));
const UserCreatePage = lazy(() => import("../pages/Users/UserCreatePage"));
const UserGet = lazy(() => import("../pages/Users/UserGet"));
const VisitDetailsPage = lazy(() => import("../pages/Visits/VisitDetailsPage"));
const VisitFormPage = lazy(() => import("../pages/Visits/VisitFormPage"));
const VisitListPage = lazy(() => import("../pages/Visits/VisitListPage"));
const WarehouseListingPage = lazy(() => import("../pages/warehouse/WarehouseListingPage"));
const ProtectedRoute = lazy(() => import("./ProtectedRoutes"));

const PageLoader = ({ children }: { children: React.ReactNode }) => (
  <Suspense fallback={<div style={{ padding: 16 }}>Loading...</div>}>
    {children}
  </Suspense>
);

export default function CrmRoutes() {
  return (
    <Routes>
      <Route path="/:slug/login" element={<LoginPage3 />} />
      <Route path="/" element={<AccountSlugRequiredPage2 />} />

      {/* Auth protected */}
      <Route path="/:slug" element={<ProtectedRoute />}>
        {/* 👇 COMMON LAYOUT */}
        <Route element={<AppShell children={<Outlet />} />}>

          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="home" element={<DashboardPage />} />

          {/* --------------------------------------------------------------------------------------------------- */}

          <Route
            path="users"
            element={
              <ProtectedRoute required="users.view">
                <PageLoader><UserGet /></PageLoader>
              </ProtectedRoute>
            }
          />

          <Route
            path="users/create"
            element={
              <ProtectedRoute required="users.create">
                <PageLoader><UserCreatePage /></PageLoader>
              </ProtectedRoute>
            }
          />



          {/* ----------------------------------------------------------------------------- */}



          <Route
            path="organization/view"
            element={
              <ProtectedRoute required="org.view">
                <PageLoader><OrganizationGet /></PageLoader>
              </ProtectedRoute>
            }
          />
          <Route
            path="organization/view/:id"
            element={
              <ProtectedRoute required="org.view">
                <PageLoader><OrgDetailsPage /></PageLoader>
              </ProtectedRoute>
            }
          />
          <Route
            path="organization/create"
            element={
              <ProtectedRoute required="org.create">
                <PageLoader><CreateOrganizationPage /></PageLoader>
              </ProtectedRoute>
            }
          />

          {/* ----------------------------------------------------------------------------------------- */}

          {/* /:slug/contacts */}
          <Route
            path="contacts"
            element={
              <ProtectedRoute required="contacts.view">
                <PageLoader><ContactsList /></PageLoader>
              </ProtectedRoute>
            }
          />

          <Route
            path="contacts/create"
            element={
              <ProtectedRoute required="contacts.create">
                <PageLoader><ContactForm /></PageLoader>
              </ProtectedRoute>
            }
          />
          {/* /:slug/contacts/:id */}
          <Route
            path="contacts/:id"
            element={
              <ProtectedRoute required="contacts.view">
                <PageLoader><ContactDetailsPage /></PageLoader>
              </ProtectedRoute>
            }
          />

          {/* /:slug/contacts/:id/edit */}
          <Route
            path="contacts/:id/edit"
            element={
              <ProtectedRoute required="contacts.edit">
                <PageLoader><ContactEditPage /></PageLoader>
              </ProtectedRoute>
            }
          />
          {/* --------------------------------------------------------------------------------------------------- */}

          <Route
            path="opportunities"
            element={
              <ProtectedRoute required="opportunities.view">
                <PageLoader><OpportunitiesPage /></PageLoader>
              </ProtectedRoute>
            }
          />
          {/* create opportunies */}
          <Route
            path="opportunities/create"
            element={
              <ProtectedRoute required="opportunities.create">
                <PageLoader><CreateOpportunityPage /></PageLoader>
              </ProtectedRoute>
            }
          />

          <Route
            path="opportunities/:id"
            element={
              <ProtectedRoute required="opportunities.view">
                <PageLoader><OpportunityDetailsPage /></PageLoader>
              </ProtectedRoute>
            }
          />
          <Route
            path="opportunities/:id/edit"
            element={
              <ProtectedRoute required="opportunities.edit">
                <PageLoader><EditOpportunityPage /></PageLoader>
              </ProtectedRoute>
            }
          />


          {/* --------------------------------------------------------------------------------------------------- */}

          <Route
            path="leads/create"
            element={
              <ProtectedRoute required="leads.create">
                <PageLoader><CreateLeadForm /></PageLoader>
              </ProtectedRoute>
            }
          />

          <Route
            path="leads/view"
            element={
              <ProtectedRoute required="leads.view">
                <PageLoader><LeadsPage /></PageLoader>
              </ProtectedRoute>
            }
          />

          <Route
            path="leads/:id"
            element={
              <ProtectedRoute required="leads.view">
                <PageLoader><LeadDetailsPage /></PageLoader>
              </ProtectedRoute>
            }
          />

          <Route
            path="leads/:id/edit"
            element={
              <ProtectedRoute required="leads.view">
                <PageLoader><LeadDetailsPage /></PageLoader>
              </ProtectedRoute>
            }
          />

          {/* --------------------------------------------------------------------------------------------------- */}

          <Route
            path="products"
            element={
              <ProtectedRoute required="products.view">
                <PageLoader><ProductListPage /></PageLoader>
              </ProtectedRoute>
            }
          />

          <Route
            path="products/create"
            element={
              <ProtectedRoute required="products.create">
                <PageLoader><CreateProductPage /></PageLoader>
              </ProtectedRoute>
            }
          />

          {/* ----------------------------------------------------------------------------------- */}

          <Route
            path="delivery-challans"
            element={
              <ProtectedRoute required="delivery_challans.view">
                <PageLoader><DeliveryChallanListPage /></PageLoader>
              </ProtectedRoute>
            }
          />

          <Route
            path="delivery-challans/create"
            element={
              <ProtectedRoute required="delivery_challans.create">
                <PageLoader><CreateDeliveryChallanPage /></PageLoader>
              </ProtectedRoute>
            }
          />

          <Route
            path="delivery-challans/:id"
            element={
              <ProtectedRoute required="delivery_challans.view">
                <PageLoader><DeliveryChallanDetailsPage /></PageLoader>
              </ProtectedRoute>
            }
          />

          <Route
            path="delivery-challans/:id/edit"
            element={
              <ProtectedRoute required="delivery_challans.update">
                <PageLoader><EditDeliveryChallanPage /></PageLoader>
              </ProtectedRoute>
            }
          />

          {/* --------------------------------------------------------------------------------------------------- */}

          <Route
            path="tasks"
            element={
              <ProtectedRoute required="tasks.view">
                <PageLoader><TasksPage /></PageLoader>
              </ProtectedRoute>
            }
          />

          <Route
            path="tasks/create"
            element={
              <ProtectedRoute required="tasks.create">
                <PageLoader><CreateTask /></PageLoader>
              </ProtectedRoute>
            }
          />

          <Route
            path="tasks/:id/edit"
            element={
              <ProtectedRoute required="tasks.edit">
                <PageLoader><EditTask /></PageLoader>
              </ProtectedRoute>
            }
          />

          <Route
            path="tasks/:id"
            element={
              <ProtectedRoute required="tasks.view">
                <PageLoader><TaskDetailsPage /></PageLoader>
              </ProtectedRoute>
            }
          />

          {/* --------------------------------------------------------------------------------------------------- */}

          <Route
            path="attendance"
            element={
              <ProtectedRoute required="attendance.view">
                <PageLoader><AttendanceView /></PageLoader>
              </ProtectedRoute>
            }
          />

          <Route
            path="leaves"
            element={
              <ProtectedRoute required="leaves.view">
                <PageLoader><LeaveListPage /></PageLoader>
              </ProtectedRoute>
            }
          />

          <Route
            path="imports"
            element={
              <ProtectedRoute required="imports.view">
                <PageLoader><ImportDataPage /></PageLoader>
              </ProtectedRoute>
            }
          />

          {/* --------------------------------------------------------------------------------------------------- */}

          <Route
            path="visits"
            element={
              <ProtectedRoute required="visits.view">
                <PageLoader><VisitListPage /></PageLoader>
              </ProtectedRoute>
            }
          />

          <Route
            path="visits/create"
            element={
              <ProtectedRoute required="visits.create">
                <PageLoader><VisitFormPage /></PageLoader>
              </ProtectedRoute>
            }
          />

          <Route
            path="visits/:id/edit"
            element={
              <ProtectedRoute required="visits.edit">
                <PageLoader><VisitFormPage /></PageLoader>
              </ProtectedRoute>
            }
          />

          <Route
            path="visits/:id"
            element={
              <ProtectedRoute required="visits.view">
                <PageLoader><VisitDetailsPage /></PageLoader>
              </ProtectedRoute>
            }
          />
          {/* ------------------------------------------------------------------------ */}

          {/* //quotes  */}
          <Route
            path="quotes"
            element={
              <ProtectedRoute required="quotes.view">
                <PageLoader><QuotesListPage /></PageLoader>
              </ProtectedRoute>
            }
          />

          <Route
            path="quotes/create"
            element={
              <ProtectedRoute required="quotes.create">
                <PageLoader><CreateQuotePage /></PageLoader>
              </ProtectedRoute>
            }
          />

          <Route
            path="quotes/:id/edit"
            element={
              <ProtectedRoute required="quotes.edit">
                <PageLoader><QuoteDetailsView /></PageLoader>
              </ProtectedRoute>
            }
          />

          <Route
            path="quotes/:id"
            element={
              <ProtectedRoute required="quotes.view">
                <PageLoader><QuoteDetailsPage /></PageLoader>
              </ProtectedRoute>
            }
          />

          {/* ----------------------------------------------------------------------------- */}

          {/* tally operations */}

          <Route
            path="tally-performance"
            element={
              <ProtectedRoute required="tally-performance.view">
                <PageLoader><TallyPerformancePage /></PageLoader>
              </ProtectedRoute>
            }
          />

          <Route
            path="tally-employees"
            element={
              <ProtectedRoute required="tally-employees.view">
                <PageLoader><TallyEmployeesPage /></PageLoader>
              </ProtectedRoute>
            }
          />

          <Route
            path="purchase-orders"
            element={
              <ProtectedRoute required="purchase-orders.view">
                <PageLoader><PurchaseOrderListPage /></PageLoader>
              </ProtectedRoute>
            }
          />

          <Route
            path="purchase-orders/create"
            element={
              <ProtectedRoute required="purchase-orders.create">
                <PageLoader><CreatePurchaseOrder /></PageLoader>
              </ProtectedRoute>
            }
          />

          <Route
            path="purchase-orders/:id/edit"
            element={
              <ProtectedRoute required="purchase-orders.edit">
                <PageLoader><CreatePurchaseOrder isEdit /></PageLoader>
              </ProtectedRoute>
            }
          />

          <Route
            path="purchase-orders/:id"
            element={
              <ProtectedRoute required="purchase-orders.view">
                <PageLoader><PurchaseOrderDetailsPage /></PageLoader>
              </ProtectedRoute>
            }
          />

          {/* ------------------------------------------------------------------------ */}

            //sales order routes

          <Route
            path="sales-orders"
            element={
              <ProtectedRoute required="sales-orders.view">
                <PageLoader><SalesOrderListPage /></PageLoader>
              </ProtectedRoute>
            }
          />

          <Route
            path="sales-orders/create"
            element={
              <ProtectedRoute required="sales-orders.create">
                <PageLoader><SalesOrderFormPage /></PageLoader>
              </ProtectedRoute>
            }
          />

          <Route
            path="sales-orders/:id/edit"
            element={
              <ProtectedRoute required="sales-orders.edit">
                <PageLoader><SalesOrderFormPage isEdit /></PageLoader>
              </ProtectedRoute>
            }
          />

          <Route
            path="sales-orders/:id"
            element={
              <ProtectedRoute required="sales-orders.view">
                <PageLoader><SalesOrderDetailsPage /></PageLoader>
              </ProtectedRoute>
            }
          />

          {/* --------------------------------------------------------------------------------- */}

          {/* //interactions  */}
          <Route
            path="events"
            element={
              <ProtectedRoute required="interactions.view">
                <PageLoader><InteractionsListPage /></PageLoader>
              </ProtectedRoute>
            }
          />

          <Route
            path="events/create"
            element={
              <ProtectedRoute required="interactions.create">
                <PageLoader><CreateInteractionPage /></PageLoader>
              </ProtectedRoute>
            }
          />

          <Route
            path="events/:id/edit"
            element={
              <ProtectedRoute required="interactions.edit">
                <PageLoader><EditInteractionPage /></PageLoader>
              </ProtectedRoute>
            }
          />

          <Route
            path="events/:id"
            element={
              <ProtectedRoute required="interactions.view">
                <PageLoader><InteractionDetailsPage /></PageLoader>
              </ProtectedRoute>
            }
          />

          {/* ------------------------------------------------------------------------ */}

          {/* //rbac  */}
          <Route
            path="rbac"
            element={
              <ProtectedRoute required="rbac.view">
                <PageLoader><RolesListPage /></PageLoader>
              </ProtectedRoute>
            }
          />

          <Route
            path="rbac/create"
            element={
              <ProtectedRoute required="rbac.create">
                <PageLoader><CreateRolePage /></PageLoader>
              </ProtectedRoute>
            }
          />

          <Route
            path="rbac/:id"
            element={
              <ProtectedRoute required="rbac.view">
                <PageLoader><RoleDetailsPage /></PageLoader>
              </ProtectedRoute>
            }
          />

          {/* ------------------------------------------------------------------------ */}

          {/* //my-day  */}
          <Route
            path="my-day"
            element={
              <ProtectedRoute required="my-day.view">
                <PageLoader><MyDayPage /></PageLoader>
              </ProtectedRoute>
            }
          />

          {/* ------------------------------------------------------------------------ */}

          {/* //warehouse  */}
          <Route
            path="warehouse"
            element={
              <ProtectedRoute required="warehouse.view">
                <PageLoader><WarehouseListingPage /></PageLoader>
              </ProtectedRoute>
            }
          />

        </Route>
      </Route>

      <Route path="*" element={<div>404</div>} />
    </Routes>
  );
}
