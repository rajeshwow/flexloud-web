import { createSlice } from "@reduxjs/toolkit";

const config = {
  name: "tenant",
};

export const tenant = createSlice({
  name: config.name,
  initialState: {
    slug: (localStorage.getItem("tenantSlug") as string) || "",
    id: (localStorage.getItem("tenantId") as string) || "",
  },
  reducers: {
    setTenantSlug: (state, action) => {
      state.slug = action.payload;
      localStorage.setItem("tenantSlug", action.payload);
    },
    setTenantId: (state, action) => {
      state.id = action.payload;
      localStorage.setItem("tenantId", action.payload);
    },
    reset: (state) => {
      state.slug = "";
      state.id = "";
      localStorage.removeItem("tenantSlug");
      localStorage.removeItem("tenantId");
    },
  },
});

export const { setTenantSlug, setTenantId } = tenant.actions;
export default tenant.reducer;
