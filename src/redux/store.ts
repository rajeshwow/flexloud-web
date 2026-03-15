import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./reducers/auth.slice";
import contactsReducer from "./reducers/contacts.slice";
import leadsReducer from "./reducers/leads.slice";
import opportunitiesReducer from "./reducers/opportunities.slice";
import organizationReducer from "./reducers/organization.slice";
import tenantReducer from "./reducers/tenant.slice";
import usersReducer from "./reducers/user.slice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    tenant: tenantReducer,
    organization: organizationReducer,
    contacts: contactsReducer,
    opportunities: opportunitiesReducer,
    leads: leadsReducer,
    users: usersReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
