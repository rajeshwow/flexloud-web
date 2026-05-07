import { configureStore } from "@reduxjs/toolkit";
import activityReducer from "./reducers/activity.slice";
import aiAssistantReducer from "./reducers/aiAssistant.slice";
import aiInsightsReducer from "./reducers/aiInsights.slice";
import attendanceReducer from "./reducers/attendance.slice";
import authReducer from "./reducers/auth.slice";
import contactsReducer from "./reducers/contacts.slice";
import dashboardReducer from "./reducers/dashboard.slice";
import deliveryChallanReducer from "./reducers/deliveryChallans/deliveryChallanSlice";
import geoVisitsReducer from "./reducers/geoVisits.slice";
import importsReducer from "./reducers/imports.slice";
import interactionsReducer from "./reducers/interactions.slice";
import leadsReducer from "./reducers/leads.slice";
import leavesReducer from "./reducers/leave.slice";
import mastersReducer from "./reducers/masters.slice";
import myDayReducer from "./reducers/myDay.slice";
import opportunitiesReducer from "./reducers/opportunities.slice";
import organizationReducer from "./reducers/organization.slice";
import productsReducer from "./reducers/products.slice";
import purchaseOrdersReducer from "./reducers/purchaseOrders.slice";
import quotesReducer from "./reducers/quotes.slice";
import rbacReducer from "./reducers/rbac.slice";
import salesOrdersReducer from "./reducers/salesOrders.slice";
import tallyPerformanceReducer from "./reducers/tallyPerformance.slice";
import tasksReducer from "./reducers/tasks.slice";
import tenantReducer from "./reducers/tenant.slice";
import usersReducer from "./reducers/user.slice";
import visitsReducer from "./reducers/visits.slice";

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
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
