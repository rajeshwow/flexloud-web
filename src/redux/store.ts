import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./reducers/auth.slice";
import tenantReducer from "./reducers/tenant.slice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    tenant: tenantReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
