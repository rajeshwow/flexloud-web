import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { Client } from "../../shared/Utils/api-client";
import { withTenant } from "../../shared/Utils/utils";

export type TallyCompany = {
  id: string;
  tenant_id: string;
  tally_guid?: string | null;
  name: string;
  formal_name?: string | null;
  country?: string | null;
  state?: string | null;
  is_active: boolean;
  cost_center_count?: number;
  ledger_count?: number;
  outstanding_count?: number;
  sales_order_count?: number;
  purchase_order_count?: number;
  created_at?: string;
  updated_at?: string;
};

export type TallyCompanyCostCenter = {
  id: string;
  tenant_id: string;
  tally_guid?: string | null;
  name: string;
  parent_name?: string | null;
  description?: string | null;
  status?: string | null;
  checked: boolean;
  access_id?: string | null;
};

type FetchCompaniesParams = {
  page?: number;
  limit?: number;
  search?: string;
  is_active?: boolean;
};

type UpdateAccessPayload = {
  companyId: string;
  cost_center_ids: string[];
};

type TallyCompaniesState = {
  items: TallyCompany[];
  total: number;
  page: number;
  limit: number;
  loading: boolean;

  accessLoading: boolean;
  savingAccess: boolean;
  selectedCompany: TallyCompany | null;
  accessCostCenters: TallyCompanyCostCenter[];

  users: TenantUser[];
  usersLoading: boolean;

  selectedUserId: string | null;
  userCostCenters: UserCostCenter[];
  userCostCentersLoading: boolean;
  savingUserCostCenters: boolean;

  error: string | null;
};

export type TenantUser = {
  id: string;
  email: string;
  name: string;
  role?: string;
  designation?: string | null;
  department?: string | null;
  is_active?: boolean;
};

export type UserCostCenter = {
  id: string;
  tenant_id: string;
  tally_guid?: string | null;
  name: string;
  parent_name?: string | null;
  description?: string | null;
  status?: string | null;
  checked: boolean;
  assignment_id?: string | null;
};

const initialState: TallyCompaniesState = {
  items: [],
  total: 0,
  page: 1,
  limit: 20,
  loading: false,

  accessLoading: false,
  savingAccess: false,
  selectedCompany: null,
  accessCostCenters: [],

  users: [],
  usersLoading: false,

  selectedUserId: null,
  userCostCenters: [],
  userCostCentersLoading: false,
  savingUserCostCenters: false,

  error: null,
};

export const fetchTenantUsers = createAsyncThunk(
  "tallyCompanies/fetchTenantUsers",
  async (_, { rejectWithValue }) => {
    try {
      const response = await Client.get(withTenant("/users"), {
        params: {
          page: 1,
          limit: 200,
        },
      });

      return response.data?.data || [];
    } catch (error: any) {
      return rejectWithValue(
        error?.response?.data?.message || "Failed to fetch users",
      );
    }
  },
);

export const fetchUserCostCenters = createAsyncThunk(
  "tallyCompanies/fetchUserCostCenters",
  async (userId: string, { rejectWithValue }) => {
    try {
      const response = await Client.get(
        withTenant(`/user-cost-centers/${userId}/cost-centers`),
      );

      return response.data?.data;
    } catch (error: any) {
      return rejectWithValue(
        error?.response?.data?.message || "Failed to fetch user cost centers",
      );
    }
  },
);

export const updateUserCostCenters = createAsyncThunk(
  "tallyCompanies/updateUserCostCenters",
  async (
    payload: {
      userId: string;
      cost_center_ids: string[];
    },
    { rejectWithValue },
  ) => {
    try {
      const response = await Client.put(
        withTenant(`/user-cost-centers/${payload.userId}/cost-centers`),
        {
          cost_center_ids: payload.cost_center_ids,
        },
      );

      return response.data?.data;
    } catch (error: any) {
      return rejectWithValue(
        error?.response?.data?.message || "Failed to update user cost centers",
      );
    }
  },
);

export const fetchTallyCompanies = createAsyncThunk(
  "tallyCompanies/fetchTallyCompanies",
  async (params: FetchCompaniesParams = {}, { rejectWithValue }) => {
    try {
      const response = await Client.get(withTenant("/tally-companies"), {
        params,
      });

      return response.data?.data;
    } catch (error: any) {
      return rejectWithValue(
        error?.response?.data?.message || "Failed to fetch Tally companies",
      );
    }
  },
);

export const fetchTallyCompanyCostCenterAccess = createAsyncThunk(
  "tallyCompanies/fetchTallyCompanyCostCenterAccess",
  async (companyId: string, { rejectWithValue }) => {
    try {
      const response = await Client.get(
        withTenant(`/tally-companies/${companyId}/cost-center-access`),
      );

      return response.data?.data;
    } catch (error: any) {
      return rejectWithValue(
        error?.response?.data?.message ||
          "Failed to fetch company cost center access",
      );
    }
  },
);

export const updateTallyCompanyCostCenterAccess = createAsyncThunk(
  "tallyCompanies/updateTallyCompanyCostCenterAccess",
  async (payload: UpdateAccessPayload, { rejectWithValue }) => {
    try {
      const response = await Client.put(
        withTenant(`/tally-companies/${payload.companyId}/cost-center-access`),
        {
          cost_center_ids: payload.cost_center_ids,
        },
      );

      return response.data?.data;
    } catch (error: any) {
      return rejectWithValue(
        error?.response?.data?.message ||
          "Failed to update company cost center access",
      );
    }
  },
);

const tallyCompaniesSlice = createSlice({
  name: "tallyCompanies",
  initialState,
  reducers: {
    resetTallyCompanyAccessState(state) {
      state.selectedCompany = null;
      state.accessCostCenters = [];
      state.accessLoading = false;
      state.savingAccess = false;
    },
    setSelectedUserId(state, action) {
      state.selectedUserId = action.payload;
      state.userCostCenters = [];
    },
    resetUserCostCenterState(state) {
      state.selectedUserId = null;
      state.userCostCenters = [];
      state.userCostCentersLoading = false;
      state.savingUserCostCenters = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTallyCompanies.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTallyCompanies.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload?.items || [];
        state.total = action.payload?.pagination?.total || 0;
        state.page = action.payload?.pagination?.page || 1;
        state.limit = action.payload?.pagination?.limit || 20;
      })
      .addCase(fetchTallyCompanies.rejected, (state, action) => {
        state.loading = false;
        state.error = String(
          action.payload || "Failed to fetch Tally companies",
        );
      })

      .addCase(fetchTallyCompanyCostCenterAccess.pending, (state) => {
        state.accessLoading = true;
        state.error = null;
      })
      .addCase(fetchTallyCompanyCostCenterAccess.fulfilled, (state, action) => {
        state.accessLoading = false;
        state.selectedCompany = action.payload?.company || null;
        state.accessCostCenters = action.payload?.cost_centers || [];
      })
      .addCase(fetchTallyCompanyCostCenterAccess.rejected, (state, action) => {
        state.accessLoading = false;
        state.error = String(
          action.payload || "Failed to fetch company cost center access",
        );
      })
      .addCase(fetchTenantUsers.pending, (state) => {
        state.usersLoading = true;
      })
      .addCase(fetchTenantUsers.fulfilled, (state, action) => {
        state.usersLoading = false;
        state.users = action.payload || [];
      })
      .addCase(fetchTenantUsers.rejected, (state, action) => {
        state.usersLoading = false;
        state.error = String(action.payload || "Failed to fetch users");
      })

      .addCase(fetchUserCostCenters.pending, (state) => {
        state.userCostCentersLoading = true;
      })
      .addCase(fetchUserCostCenters.fulfilled, (state, action) => {
        state.userCostCentersLoading = false;
        state.userCostCenters = (action.payload?.cost_centers || []).map(
          (item: UserCostCenter) => ({
            ...item,
            checked: Boolean(item.checked || item.assignment_id),
          }),
        );
      })
      .addCase(fetchUserCostCenters.rejected, (state, action) => {
        state.userCostCentersLoading = false;
        state.error = String(
          action.payload || "Failed to fetch user cost centers",
        );
      })

      .addCase(updateUserCostCenters.pending, (state) => {
        state.savingUserCostCenters = true;
      })
      .addCase(updateUserCostCenters.fulfilled, (state) => {
        state.savingUserCostCenters = false;
      })
      .addCase(updateUserCostCenters.rejected, (state, action) => {
        state.savingUserCostCenters = false;
        state.error = String(
          action.payload || "Failed to update user cost centers",
        );
      })

      .addCase(updateTallyCompanyCostCenterAccess.pending, (state) => {
        state.savingAccess = true;
        state.error = null;
      })
      .addCase(updateTallyCompanyCostCenterAccess.fulfilled, (state) => {
        state.savingAccess = false;
      })
      .addCase(updateTallyCompanyCostCenterAccess.rejected, (state, action) => {
        state.savingAccess = false;
        state.error = String(
          action.payload || "Failed to update company cost center access",
        );
      });
  },
});

export const {
  resetTallyCompanyAccessState,
  setSelectedUserId,
  resetUserCostCenterState,
} = tallyCompaniesSlice.actions;

export default tallyCompaniesSlice.reducer;
