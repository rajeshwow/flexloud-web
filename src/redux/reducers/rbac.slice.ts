import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { Client } from "../../shared/Utils/api-client";
import { withTenant } from "../../shared/Utils/utils";

export type PermissionItem = {
  code: string;
  description?: string | null;
  group?: string | null;
};

export type RoleItem = {
  id: string;
  name: string;
  code: string;
  description?: string | null;
  is_system?: boolean;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
  permissions_count?: number;
  users_count?: number;
};

export type RoleDetails = RoleItem & {
  permissions: string[];
  users?: Array<{
    id: string;
    first_name?: string | null;
    last_name?: string | null;
    name?: string | null;
    email?: string | null;
  }>;
};

export type AssignableUserItem = {
  id: string;
  first_name?: string | null;
  last_name?: string | null;
  name?: string | null;
  email?: string | null;
};

export type GetRolesParams = {
  page?: number;
  limit?: number;
  search?: string;
};

export type CreateRolePayload = {
  name: string;
  code: string;
  description?: string;
  permission_codes: string[];
};

export type UpdateRolePayload = {
  id: string;
  name: string;
  code: string;
  description?: string;
  permission_codes: string[];
};

export type AssignUsersPayload = {
  roleId: string;
  user_ids: string[];
};

type RbacState = {
  list: RoleItem[];
  total: number;
  loading: boolean;
  listError: string | null;

  permissions: PermissionItem[];
  permissionsLoading: boolean;

  currentRole: RoleDetails | null;
  currentRoleLoading: boolean;
  currentRoleError: string | null;

  submitting: boolean;

  assignableUsers: AssignableUserItem[];
  assignableUsersLoading: boolean;
};

const initialState: RbacState = {
  list: [],
  total: 0,
  loading: false,
  listError: null,

  permissions: [],
  permissionsLoading: false,

  currentRole: null,
  currentRoleLoading: false,
  currentRoleError: null,

  submitting: false,

  assignableUsers: [],
  assignableUsersLoading: false,
};

export const fetchRoles = createAsyncThunk(
  "rbac/fetchRoles",
  async (params: GetRolesParams | undefined, { rejectWithValue }) => {
    try {
      const response = await Client.get(withTenant("/rbac/roles"), {
        params: {
          page: params?.page || 1,
          limit: params?.limit || 10,
          search: params?.search || "",
        },
      });

      return response?.data;
    } catch (error: any) {
      return rejectWithValue(
        error?.response?.data?.message || "Failed to fetch roles",
      );
    }
  },
);

export const fetchPermissions = createAsyncThunk(
  "rbac/fetchPermissions",
  async (_, { rejectWithValue }) => {
    try {
      const response = await Client.get(withTenant("/rbac/permission-groups"));
      return response?.data;
    } catch (error: any) {
      return rejectWithValue(
        error?.response?.data?.message || "Failed to fetch permissions",
      );
    }
  },
);

export const fetchRoleById = createAsyncThunk(
  "rbac/fetchRoleById",
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await Client.get(withTenant(`/rbac/roles/${id}`));
      return response?.data;
    } catch (error: any) {
      return rejectWithValue(
        error?.response?.data?.message || "Failed to fetch role details",
      );
    }
  },
);

export const createRole = createAsyncThunk(
  "rbac/createRole",
  async (payload: CreateRolePayload, { rejectWithValue }) => {
    try {
      const apiPayload = {
        name: payload.name,
        code: payload.code,
        description: payload.description,
        permissions: payload.permission_codes || [],
      };

      const response = await Client.post(withTenant("/rbac/roles"), apiPayload);
      return response?.data;
    } catch (error: any) {
      return rejectWithValue(
        error?.response?.data?.message || "Failed to create role",
      );
    }
  },
);

export const updateRole = createAsyncThunk(
  "rbac/updateRole",
  async (payload: UpdateRolePayload, { rejectWithValue }) => {
    try {
      const { id, permission_codes, ...rest } = payload;

      const apiPayload = {
        ...rest,
        permissions: permission_codes || [],
      };

      const response = await Client.patch(
        withTenant(`/rbac/roles/${id}`),
        apiPayload,
      );
      return response?.data;
    } catch (error: any) {
      return rejectWithValue(
        error?.response?.data?.message || "Failed to update role",
      );
    }
  },
);

export const fetchAssignableUsers = createAsyncThunk(
  "rbac/fetchAssignableUsers",
  async (search: string | undefined, { rejectWithValue }) => {
    try {
      const response = await Client.get(withTenant("/rbac/users"), {
        params: {
          limit: 1000,
          search: search || "",
        },
      });
      return response?.data;
    } catch (error: any) {
      return rejectWithValue(
        error?.response?.data?.message || "Failed to fetch users",
      );
    }
  },
);

export const assignUsersToRole = createAsyncThunk(
  "rbac/assignUsersToRole",
  async (payload: AssignUsersPayload, { rejectWithValue }) => {
    try {
      const response = await Client.put(
        withTenant(`/rbac/roles/${payload.roleId}/users`),
        { user_ids: payload.user_ids },
      );
      return response?.data;
    } catch (error: any) {
      return rejectWithValue(
        error?.response?.data?.message || "Failed to assign users",
      );
    }
  },
);

const normalizePermissions = (payload: any): PermissionItem[] => {
  const result = new Map<string, PermissionItem>();

  const addPermission = (item: any, groupName?: string) => {
    const code =
      typeof item === "string"
        ? item
        : item?.code || item?.permission_code || item?.value || "";

    if (!code) return;

    result.set(code, {
      code,
      description:
        typeof item === "string"
          ? item
          : item?.description || item?.label || item?.name || null,
      group:
        item?.group ||
        item?.module ||
        item?.category ||
        groupName ||
        code.split(".")?.[0] ||
        "General",
    });
  };

  const raw =
    payload?.data ||
    payload?.permissions ||
    payload?.items ||
    payload?.rows ||
    payload ||
    [];

  if (!Array.isArray(raw)) return [];

  raw.forEach((entry: any) => {
    // grouped array from backend
    if (Array.isArray(entry?.permissions)) {
      const groupName =
        entry?.module_label || entry?.module_key || entry?.group || "General";

      entry.permissions.forEach((permission: any) => {
        addPermission(permission, groupName);
      });
      return;
    }

    // flat permission item
    addPermission(entry);
  });

  return Array.from(result.values()).sort((a, b) => {
    const groupCompare = String(a.group || "").localeCompare(
      String(b.group || ""),
    );
    if (groupCompare !== 0) return groupCompare;
    return a.code.localeCompare(b.code);
  });
};

const normalizeRoles = (payload: any) => {
  const rows = payload?.data || payload?.roles || payload?.items || [];
  const total =
    payload?.total ||
    payload?.pagination?.total ||
    payload?.meta?.total ||
    rows.length ||
    0;

  return {
    rows,
    total,
  };
};

const normalizeRoleDetails = (payload: any): RoleDetails | null => {
  const role = payload?.data || payload?.role || payload;
  if (!role) return null;

  const rawPermissions =
    role?.permissions || role?.permission_codes || role?.role_permissions || [];

  const permissionCodes = Array.isArray(rawPermissions)
    ? rawPermissions
        .map((item: any) =>
          typeof item === "string"
            ? item
            : item?.code || item?.permission_code || item?.value,
        )
        .filter(Boolean)
    : [];

  const rawUsers = role?.users || role?.assigned_users || [];

  return {
    ...role,
    permissions: permissionCodes,
    users: Array.isArray(rawUsers) ? rawUsers : [],
  };
};

const normalizeUsers = (payload: any): AssignableUserItem[] => {
  const raw = payload?.data || payload?.users || payload?.items || [];
  if (!Array.isArray(raw)) return [];

  return raw.map((user: any) => ({
    id: user?.id,
    first_name: user?.first_name,
    last_name: user?.last_name,
    name:
      user?.name || `${user?.first_name || ""} ${user?.last_name || ""}`.trim(),
    email: user?.email,
  }));
};

const rbacSlice = createSlice({
  name: "rbac",
  initialState,
  reducers: {
    resetRbacState: () => initialState,
    resetCurrentRoleState: (state) => {
      state.currentRole = null;
      state.currentRoleLoading = false;
      state.currentRoleError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchRoles.pending, (state) => {
        state.loading = true;
        state.listError = null;
      })
      .addCase(fetchRoles.fulfilled, (state, action) => {
        state.loading = false;
        const normalized = normalizeRoles(action.payload);
        state.list = normalized.rows || [];
        state.total = normalized.total || 0;
      })
      .addCase(fetchRoles.rejected, (state, action) => {
        state.loading = false;
        state.listError = (action.payload as string) || "Failed to fetch roles";
      });

    builder
      .addCase(fetchPermissions.pending, (state) => {
        state.permissionsLoading = true;
      })
      .addCase(fetchPermissions.fulfilled, (state, action) => {
        state.permissionsLoading = false;
        state.permissions = normalizePermissions(action.payload);
      })
      .addCase(fetchPermissions.rejected, (state) => {
        state.permissionsLoading = false;
        state.permissions = [];
      });

    builder
      .addCase(fetchRoleById.pending, (state) => {
        state.currentRoleLoading = true;
        state.currentRoleError = null;
      })
      .addCase(fetchRoleById.fulfilled, (state, action) => {
        state.currentRoleLoading = false;
        state.currentRole = normalizeRoleDetails(action.payload);
      })
      .addCase(fetchRoleById.rejected, (state, action) => {
        state.currentRoleLoading = false;
        state.currentRoleError =
          (action.payload as string) || "Failed to fetch role details";
      });

    builder
      .addCase(createRole.pending, (state) => {
        state.submitting = true;
      })
      .addCase(createRole.fulfilled, (state) => {
        state.submitting = false;
      })
      .addCase(createRole.rejected, (state) => {
        state.submitting = false;
      });

    builder
      .addCase(updateRole.pending, (state) => {
        state.submitting = true;
      })
      .addCase(updateRole.fulfilled, (state) => {
        state.submitting = false;
      })
      .addCase(updateRole.rejected, (state) => {
        state.submitting = false;
      });

    builder
      .addCase(fetchAssignableUsers.pending, (state) => {
        state.assignableUsersLoading = true;
      })
      .addCase(fetchAssignableUsers.fulfilled, (state, action) => {
        state.assignableUsersLoading = false;
        state.assignableUsers = normalizeUsers(action.payload);
      })
      .addCase(fetchAssignableUsers.rejected, (state) => {
        state.assignableUsersLoading = false;
      });

    builder
      .addCase(assignUsersToRole.pending, (state) => {
        state.submitting = true;
      })
      .addCase(assignUsersToRole.fulfilled, (state) => {
        state.submitting = false;
      })
      .addCase(assignUsersToRole.rejected, (state) => {
        state.submitting = false;
      });
  },
});

export const { resetRbacState, resetCurrentRoleState } = rbacSlice.actions;
export default rbacSlice.reducer;
