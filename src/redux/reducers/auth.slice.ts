import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { Client } from "../../shared/Utils/api-client";
import { withTenant } from "../../shared/Utils/utils";

const config = {
  name: "auth",
};

export const login = createAsyncThunk(
  `${config.name}/login`,
  async (payload: { slug: string; email: string; password: string }) => {
    const { slug, email, password } = payload;

    return await Client.post(withTenant(`/auth/login`), {
      identifier: email,
      password,
    });
  },
);

// ✅ NEW: get my permissions (tenant scoped)
export const fetchMyPermissions = createAsyncThunk(
  `${config.name}/fetchMyPermissions`,
  async (payload: { slug: string }) => {
    const { slug } = payload;
    return await Client.get(withTenant(`/me/permissions`));
  },
);

export const auth = createSlice({
  name: config.name,
  initialState: {
    loading: false,
    token: (localStorage.getItem("token") as string) || "",
    user: null as any,
    error: "" as string,
    // ✅ NEW
    permissions: [] as string[],
    permissionsLoading: false,
    permissionsLoaded: false,
  },
  reducers: {
    reset: (state) => {
      state.loading = false;
      state.token = "";
      state.user = null;
      state.error = "";
      state.permissions = []; // ✅
      state.permissionsLoading = false; // ✅
      // localStorage.removeItem("token");
    },
    setToken: (state, action) => {
      state.token = action.payload;
      localStorage.setItem("token", action.payload);
    },
    // ✅ optional helper (manual set)
    setPermissions: (state, action) => {
      state.permissions = action.payload || [];
    },
  },
  extraReducers(builder) {
    builder
      // Login
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = "";
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;

        state.token = action?.payload?.data?.data?.accessToken || "";

        if (state.token) {
          localStorage.setItem("token", state.token);
        }

        state.user =
          action?.payload?.data?.data?.user ||
          action?.payload?.data?.user ||
          null;
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = (action as any)?.error?.message || "Login failed";
      })
      // ✅ Permissions
      .addCase(fetchMyPermissions.pending, (state) => {
        state.permissionsLoading = true;
      })
      .addCase(fetchMyPermissions.fulfilled, (state, action) => {
        state.permissionsLoading = false;
        state.permissionsLoaded = true;
        state.permissions = action?.payload?.data?.permissions || [];
      })
      .addCase(fetchMyPermissions.rejected, (state) => {
        state.permissionsLoading = false;
        state.permissionsLoaded = true;
        state.permissions = [];
      });
  },
});

export const { reset, setToken, setPermissions } = auth.actions;
export default auth.reducer;
