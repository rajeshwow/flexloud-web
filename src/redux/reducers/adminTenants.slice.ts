import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { Client } from "../../shared/Utils/api-client";

export type TenantStatus = "active" | "inactive" | "suspended";

export type AdminTenant = {
  id: string;
  name: string;
  slug: string;
  status: TenantStatus;
  is_bootstrapped: boolean;
  bootstrapped_at?: string | null;
  created_at: string;
  updated_at?: string;
};

export type GetAdminTenantsParams = {
  page?: number;
  limit?: number;
  search?: string;
  status?: TenantStatus;
};

export type CreateTenantPayload = {
  name: string;
  slug: string;
};

export type BootstrapTenantPayload = {
  tenantId: string;
  adminEmail: string;
  adminName: string;
  adminPassword: string;
};

export type UpdateTenantStatusPayload = {
  tenantId: string;
  status: TenantStatus;
};

type AdminTenantsState = {
  items: AdminTenant[];
  selectedTenant: AdminTenant | null;
  bootstrapLogs: any[];
  loading: boolean;
  detailLoading: boolean;
  actionLoading: boolean;
  error: string | null;
  pagination: {
    page: number;
    limit: number;
    total: number;
  };
};

const initialState: AdminTenantsState = {
  items: [],
  selectedTenant: null,
  bootstrapLogs: [],
  loading: false,
  detailLoading: false,
  actionLoading: false,
  error: null,
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
  },
};

const getAdminAuthHeaders = (): Record<string, string> => {
  const token =
    localStorage.getItem("admin_access_token") ||
    localStorage.getItem("adminToken") ||
    localStorage.getItem("token") ||
    localStorage.getItem("accessToken");

  return token
    ? {
        Authorization: `Bearer ${token}`,
      }
    : {};
};

const getErrorMessage = (error: any, fallback: string) => {
  return (
    error?.response?.data?.message ||
    error?.response?.data?.error ||
    error?.message ||
    fallback
  );
};

export const fetchAdminTenants = createAsyncThunk(
  "adminTenants/fetchAdminTenants",
  async (params: GetAdminTenantsParams = {}, { rejectWithValue }) => {
    try {
      const res = await Client.get(`/v1/admin/tenants`, {
        params,
        headers: getAdminAuthHeaders(),
      });

      return res.data;
    } catch (error: any) {
      return rejectWithValue(getErrorMessage(error, "Failed to fetch tenants"));
    }
  },
);

export const createAdminTenant = createAsyncThunk(
  "adminTenants/createAdminTenant",
  async (payload: CreateTenantPayload, { rejectWithValue }) => {
    try {
      const res = await Client.post("/v1/admin/tenants", payload, {
        headers: getAdminAuthHeaders(),
      });

      return res.data.data;
    } catch (error: any) {
      return rejectWithValue(getErrorMessage(error, "Failed to create tenant"));
    }
  },
);

export const fetchAdminTenantById = createAsyncThunk(
  "adminTenants/fetchAdminTenantById",
  async (tenantId: string, { rejectWithValue }) => {
    try {
      const res = await Client.get(`/v1/admin/tenants/${tenantId}`, {
        headers: getAdminAuthHeaders(),
      });

      return res.data.data;
    } catch (error: any) {
      return rejectWithValue(getErrorMessage(error, "Failed to fetch tenant"));
    }
  },
);

export const bootstrapAdminTenant = createAsyncThunk(
  "adminTenants/bootstrapAdminTenant",
  async (payload: BootstrapTenantPayload, { rejectWithValue }) => {
    try {
      const { tenantId, ...body } = payload;

      const res = await Client.post(
        `/v1/admin/tenants/${tenantId}/bootstrap`,
        body,
        {
          headers: getAdminAuthHeaders(),
        },
      );

      return res.data.data;
    } catch (error: any) {
      return rejectWithValue(
        getErrorMessage(error, "Failed to bootstrap tenant"),
      );
    }
  },
);

export const updateAdminTenantStatus = createAsyncThunk(
  "adminTenants/updateAdminTenantStatus",
  async (payload: UpdateTenantStatusPayload, { rejectWithValue }) => {
    try {
      const { tenantId, status } = payload;

      const res = await Client.patch(
        `/v1/admin/tenants/${tenantId}/status`,
        { status },
        {
          headers: getAdminAuthHeaders(),
        },
      );

      return res.data.data;
    } catch (error: any) {
      return rejectWithValue(
        getErrorMessage(error, "Failed to update tenant status"),
      );
    }
  },
);

export const fetchTenantBootstrapLogs = createAsyncThunk(
  "adminTenants/fetchTenantBootstrapLogs",
  async (tenantId: string, { rejectWithValue }) => {
    try {
      const res = await Client.get(
        `/v1/admin/tenants/${tenantId}/bootstrap/logs`,
        {
          headers: getAdminAuthHeaders(),
        },
      );

      return res.data.data;
    } catch (error: any) {
      return rejectWithValue(
        getErrorMessage(error, "Failed to fetch bootstrap logs"),
      );
    }
  },
);

const adminTenantsSlice = createSlice({
  name: "adminTenants",
  initialState,
  reducers: {
    resetAdminTenantState: () => initialState,
    resetSelectedTenant: (state) => {
      state.selectedTenant = null;
      state.bootstrapLogs = [];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAdminTenants.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAdminTenants.fulfilled, (state, action) => {
        state.loading = false;

        const payload = action.payload?.data || action.payload;

        state.items = payload?.items || [];

        state.pagination = payload?.pagination || {
          page: 1,
          limit: 10,
          total: 0,
        };
      })
      .addCase(fetchAdminTenants.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      .addCase(createAdminTenant.pending, (state) => {
        state.actionLoading = true;
        state.error = null;
      })
      .addCase(createAdminTenant.fulfilled, (state) => {
        state.actionLoading = false;
      })
      .addCase(createAdminTenant.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload as string;
      })

      .addCase(fetchAdminTenantById.pending, (state) => {
        state.detailLoading = true;
        state.error = null;
      })
      .addCase(fetchAdminTenantById.fulfilled, (state, action) => {
        state.detailLoading = false;
        state.selectedTenant = action.payload;
      })
      .addCase(fetchAdminTenantById.rejected, (state, action) => {
        state.detailLoading = false;
        state.error = action.payload as string;
      })

      .addCase(bootstrapAdminTenant.pending, (state) => {
        state.actionLoading = true;
        state.error = null;
      })
      .addCase(bootstrapAdminTenant.fulfilled, (state) => {
        state.actionLoading = false;
      })
      .addCase(bootstrapAdminTenant.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload as string;
      })

      .addCase(updateAdminTenantStatus.pending, (state) => {
        state.actionLoading = true;
        state.error = null;
      })
      .addCase(updateAdminTenantStatus.fulfilled, (state, action) => {
        state.actionLoading = false;

        const updatedTenant = action.payload;

        if (updatedTenant?.id) {
          state.items = state.items.map((tenant) =>
            tenant.id === updatedTenant.id
              ? {
                  ...tenant,
                  ...updatedTenant,
                }
              : tenant,
          );

          if (state.selectedTenant?.id === updatedTenant.id) {
            state.selectedTenant = {
              ...state.selectedTenant,
              ...updatedTenant,
            };
          }
        }
      })
      .addCase(updateAdminTenantStatus.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload as string;
      })

      .addCase(fetchTenantBootstrapLogs.pending, (state) => {
        state.detailLoading = true;
        state.error = null;
      })
      .addCase(fetchTenantBootstrapLogs.fulfilled, (state, action) => {
        state.detailLoading = false;
        state.bootstrapLogs = action.payload || [];
      })
      .addCase(fetchTenantBootstrapLogs.rejected, (state, action) => {
        state.detailLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { resetAdminTenantState, resetSelectedTenant } =
  adminTenantsSlice.actions;

export default adminTenantsSlice.reducer;
