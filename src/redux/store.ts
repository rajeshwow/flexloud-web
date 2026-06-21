import { configureStore } from "@reduxjs/toolkit";
import activityReducer from "./reducers/activity.slice";
import adminTenantsReducer from "./reducers/adminTenants.slice";
import aiAssistantReducer from "./reducers/aiAssistant.slice";
import aiInsightsReducer from "./reducers/aiInsights.slice";
import attendanceReducer from "./reducers/attendance.slice";
import authReducer from "./reducers/auth.slice";
import contactsReducer from "./reducers/contacts.slice";
import costCenterPerformanceReducer from "./reducers/costCenterPerformance.slice";
import costCentersReducer from "./reducers/costCenters.slice";
import dashboardReducer from "./reducers/dashboard.slice";
import deliveryChallanReducer from "./reducers/deliveryChallans/deliveryChallanSlice";
import geoVisitsReducer from "./reducers/geoVisits.slice";
import globalSearchReducer from "./reducers/global-search.slice";
import importsReducer from "./reducers/imports.slice";
import interactionsReducer from "./reducers/interactions.slice";
import leadsReducer from "./reducers/leads.slice";
import leavesReducer from "./reducers/leave.slice";
import mastersReducer from "./reducers/masters.slice";
import myDayReducer from "./reducers/myDay.slice";
import opportunitiesReducer from "./reducers/opportunities.slice";
import organizationReducer from "./reducers/organization.slice";
import outstandingsReducer from "./reducers/outstandings.slice";
import productsReducer from "./reducers/products.slice";
import purchaseOrdersReducer from "./reducers/purchaseOrders.slice";
import quotesReducer from "./reducers/quotes.slice";
import rbacReducer from "./reducers/rbac.slice";
import salesOrdersReducer from "./reducers/salesOrders.slice";
import tableExportReducer from "./reducers/tableExport.slice";
import tallyAnalyticsReportsReducer from "./reducers/tallyAnalyticsReports.slice";
import tallyCompaniesReducer from "./reducers/tallyCompanies.slice";
import tallyEmployeesReducer from "./reducers/tallyEmployees.slice";
import tallyPerformanceReducer from "./reducers/tallyPerformance.slice";
import tallySyncReducer from "./reducers/tallySync.slice";
import tasksReducer from "./reducers/tasks.slice";
import tenantReducer from "./reducers/tenant.slice";
import usersReducer from "./reducers/user.slice";
import visitsReducer from "./reducers/visits.slice";
import warehouseReducer from "./reducers/warehouse.slice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    tenant: tenantReducer,
    organization: organizationReducer,
    contacts: contactsReducer,
    opportunities: opportunitiesReducer,
    leads: leadsReducer,
    users: usersReducer,
    products: productsReducer,
    tasks: tasksReducer,
    attendance: attendanceReducer,
    leaves: leavesReducer,
    imports: importsReducer,
    visits: visitsReducer,
    activity: activityReducer,
    masters: mastersReducer,
    quotes: quotesReducer,
    interactions: interactionsReducer,
    aiAssistant: aiAssistantReducer,
    aiInsights: aiInsightsReducer,
    geoVisits: geoVisitsReducer,
    rbac: rbacReducer,
    dashboard: dashboardReducer,
    myDay: myDayReducer,
    purchaseOrders: purchaseOrdersReducer,
    salesOrders: salesOrdersReducer,
    deliveryChallans: deliveryChallanReducer,
    tallyPerformance: tallyPerformanceReducer,
    tallyEmployees: tallyEmployeesReducer,
    warehouse: warehouseReducer,
    costCenters: costCentersReducer,
    outstandings: outstandingsReducer,
    costCenterPerformance: costCenterPerformanceReducer,
    tallySync: tallySyncReducer,
    tallyCompanies: tallyCompaniesReducer,
    tallyAnalyticsReports: tallyAnalyticsReportsReducer,
    adminTenants: adminTenantsReducer,
    globalSearch: globalSearchReducer,
    tableExport: tableExportReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
