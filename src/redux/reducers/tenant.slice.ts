import { createSlice } from "@reduxjs/toolkit";

const config = {
  name: "tenant",
};

export const tenant = createSlice({
  name: config.name,
  initialState: {
    slug: (localStorage.getItem("tenantSlug") as string) || "",
  },
  reducers: {
    setTenantSlug: (state, action) => {
      state.slug = action.payload;
      localStorage.setItem("tenantSlug", action.payload);
    },
    reset: (state) => {
      state.slug = "";
      localStorage.removeItem("tenantSlug");
    },
  },
});

export const { setTenantSlug } = tenant.actions;
export default tenant.reducer;
