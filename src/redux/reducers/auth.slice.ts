import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { Client } from "../../shared/Utils/api-client";
import { withTenant } from "../../shared/Utils/utils";
import type { RootState } from "../store";

const permissionsInflightBySlug = new Set<string>();

const getPermissionsStorageKey = (slug: string) =>
  `fl_permissions_loaded_${slug}`;

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
export const fetchMyPermissions = createAsyncThunk<
  any,
  { slug: string },
  { state: RootState; rejectValue: string }
>(
  `${config.name}/fetchMyPermissions`,
  async (payload, thunkAPI) => {
    const { slug } = payload;

    try {
      const response = await Client.get(withTenant(`/me/permissions`));
      return {
        slug,
        response,
      };
    } catch (error: any) {
      return thunkAPI.rejectWithValue(
        error?.data?.message || error?.message || "Failed to fetch permissions",
      );
    } finally {
      permissionsInflightBySlug.delete(slug);
    }
  },
  {
    condition: (payload, { getState }) => {
      const slug = payload?.slug;
      if (!slug) return false;

      const state = getState();
      const authState = state.auth as any;

      const storageKey = getPermissionsStorageKey(slug);
      const alreadyLoadedForSlug =
        authState.permissionsLoaded &&
        authState.permissionsSlug === slug &&
        sessionStorage.getItem(storageKey) === "true";

      if (alreadyLoadedForSlug) return false;

      if (authState.permissionsLoading && authState.permissionsSlug === slug) {
        return false;
      }

      if (permissionsInflightBySlug.has(slug)) {
        return false;
      }

      permissionsInflightBySlug.add(slug);
      return true;
    },
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
    permissionsSlug: "" as string | null,
  },
  reducers: {
    reset: (state) => {
      state.loading = false;
      state.token = "";
      state.user = null;
      state.error = "";
      state.permissions = [];
      state.permissionsLoading = false;
      state.permissionsLoaded = false;
      state.permissionsSlug = "";
      sessionStorage.clear();
      // localStorage.removeItem("token");
    },
    setToken: (state, action) => {
      state.token = action.payload;
      state.permissions = [];
      state.permissionsLoading = false;
      state.permissionsLoaded = false;
      state.permissionsSlug = "";
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
      .addCase(fetchMyPermissions.pending, (state, action) => {
        state.permissionsLoading = true;
        state.permissionsSlug = action.meta.arg.slug;
      })
      .addCase(fetchMyPermissions.fulfilled, (state, action) => {
        const slug = action.payload?.slug || action.meta.arg.slug;
        const response = action.payload?.response;

        state.permissionsLoading = false;
        state.permissionsLoaded = true;
        state.permissionsSlug = slug;
        state.permissions = response?.data?.permissions || [];

        sessionStorage.setItem(getPermissionsStorageKey(slug), "true");
      })
      .addCase(fetchMyPermissions.rejected, (state, action) => {
        state.permissionsLoading = false;
        state.permissionsLoaded = true;
        state.permissionsSlug = action.meta.arg.slug;
        state.permissions = [];
      });
  },
});

export const { reset, setToken, setPermissions } = auth.actions;
export default auth.reducer;
