import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./reducers/auth.slice";
import contactsReducer from "./reducers/contacts.slice";
import organizationReducer from "./reducers/organization.slice";
import tenantReducer from "./reducers/tenant.slice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    tenant: tenantReducer,
    organization: organizationReducer,
    contacts: contactsReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
