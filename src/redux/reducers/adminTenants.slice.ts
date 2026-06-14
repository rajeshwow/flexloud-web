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
  allowed_permission_count?: number;
};

export type AdminPermissionItem = {
  code: string;
  description?: string | null;
  module_key?: string | null;
  action_key?: string | null;
  is_active?: boolean;
  is_allowed?: boolean;
};

export type AdminPermissionGroup = {
  moduleKey?: string;
  module_key?: string;
  module_label?: string;
  permissions: AdminPermissionItem[];
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

export type UpdateTenantPermissionsPayload = {
  tenantId: string;
  permissionCodes: string[];
};

type AdminTenantsState = {
  items: AdminTenant[];
  selectedTenant: AdminTenant | null;
  bootstrapLogs: any[];

  permissionCatalog: AdminPermissionItem[];
  permissionCatalogGroups: AdminPermissionGroup[];

  tenantPermissionItems: AdminPermissionItem[];
  tenantPermissionGroups: AdminPermissionGroup[];
  allowedPermissionCodes: string[];

  loading: boolean;
  detailLoading: boolean;
  actionLoading: boolean;
  permissionsLoading: boolean;
  permissionsSaving: boolean;

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

  permissionCatalog: [],
  permissionCatalogGroups: [],

  tenantPermissionItems: [],
  tenantPermissionGroups: [],
  allowedPermissionCodes: [],

  loading: false,
  detailLoading: false,
  actionLoading: false,
  permissionsLoading: false,
  permissionsSaving: false,

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
  const message =
    error?.response?.data?.message ||
    error?.response?.data?.error ||
    error?.message ||
    fallback;

  const invalidCodes = error?.response?.data?.details?.invalidPermissionCodes;

  if (Array.isArray(invalidCodes) && invalidCodes.length) {
    return `${message}: ${invalidCodes.join(", ")}`;
  }

  return message;
};

const getPayloadData = (payload: any) => payload?.data || payload || {};

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

export const fetchAdminPermissionCatalog = createAsyncThunk(
  "adminTenants/fetchAdminPermissionCatalog",
  async (_, { rejectWithValue }) => {
    try {
      const res = await Client.get(`/v1/admin/tenants/permissions/catalog`, {
        headers: getAdminAuthHeaders(),
      });

      return res.data.data;
    } catch (error: any) {
      return rejectWithValue(
        getErrorMessage(error, "Failed to fetch permission catalog"),
      );
    }
  },
);

export const fetchAdminTenantPermissions = createAsyncThunk(
  "adminTenants/fetchAdminTenantPermissions",
  async (tenantId: string, { rejectWithValue }) => {
    try {
      const res = await Client.get(
        `/v1/admin/tenants/${tenantId}/permissions`,
        {
          headers: getAdminAuthHeaders(),
        },
      );

      return res.data.data;
    } catch (error: any) {
      return rejectWithValue(
        getErrorMessage(error, "Failed to fetch tenant permissions"),
      );
    }
  },
);

export const updateAdminTenantPermissions = createAsyncThunk(
  "adminTenants/updateAdminTenantPermissions",
  async (payload: UpdateTenantPermissionsPayload, { rejectWithValue }) => {
    try {
      const res = await Client.put(
        `/v1/admin/tenants/${payload.tenantId}/permissions`,
        {
          permissionCodes: payload.permissionCodes || [],
        },
        {
          headers: getAdminAuthHeaders(),
        },
      );

      return res.data.data;
    } catch (error: any) {
      return rejectWithValue(
        getErrorMessage(error, "Failed to update tenant permissions"),
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
      state.tenantPermissionItems = [];
      state.tenantPermissionGroups = [];
      state.allowedPermissionCodes = [];
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
      })

      .addCase(fetchAdminPermissionCatalog.pending, (state) => {
        state.permissionsLoading = true;
        state.error = null;
      })
      .addCase(fetchAdminPermissionCatalog.fulfilled, (state, action) => {
        state.permissionsLoading = false;

        const payload = getPayloadData(action.payload);

        state.permissionCatalog = payload?.items || [];
        state.permissionCatalogGroups = payload?.grouped || [];
      })
      .addCase(fetchAdminPermissionCatalog.rejected, (state, action) => {
        state.permissionsLoading = false;
        state.error = action.payload as string;
      })

      .addCase(fetchAdminTenantPermissions.pending, (state) => {
        state.permissionsLoading = true;
        state.error = null;
      })
      .addCase(fetchAdminTenantPermissions.fulfilled, (state, action) => {
        state.permissionsLoading = false;

        const payload = getPayloadData(action.payload);

        state.tenantPermissionItems = payload?.items || [];
        state.tenantPermissionGroups = payload?.grouped || [];
        state.allowedPermissionCodes = payload?.allowedPermissionCodes || [];

        if (
          state.selectedTenant &&
          payload?.allowedPermissionCount !== undefined
        ) {
          state.selectedTenant.allowed_permission_count =
            payload.allowedPermissionCount;
        }
      })
      .addCase(fetchAdminTenantPermissions.rejected, (state, action) => {
        state.permissionsLoading = false;
        state.error = action.payload as string;
      })

      .addCase(updateAdminTenantPermissions.pending, (state) => {
        state.permissionsSaving = true;
        state.error = null;
      })
      .addCase(updateAdminTenantPermissions.fulfilled, (state, action) => {
        state.permissionsSaving = false;

        const payload = getPayloadData(action.payload);

        state.allowedPermissionCodes = payload?.allowedPermissionCodes || [];

        if (state.selectedTenant) {
          state.selectedTenant.allowed_permission_count =
            payload?.allowedPermissionCount || 0;
        }

        state.items = state.items.map((tenant) =>
          tenant.id === payload?.tenant?.id
            ? {
                ...tenant,
                allowed_permission_count: payload?.allowedPermissionCount || 0,
              }
            : tenant,
        );
      })
      .addCase(updateAdminTenantPermissions.rejected, (state, action) => {
        state.permissionsSaving = false;
        state.error = action.payload as string;
      });
  },
});

export const { resetAdminTenantState, resetSelectedTenant } =
  adminTenantsSlice.actions;

export default adminTenantsSlice.reducer;
