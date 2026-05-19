import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { Client } from "../../shared/Utils/api-client";
import { withTenant } from "../../shared/Utils/utils";

export type OutstandingType = "all" | "receivable" | "payable";

export type OutstandingItem = {
  id: string;
  tenant_id: string;
  tally_guid?: string | null;
  ledger_guid?: string | null;
  ledger_name?: string | null;
  voucher_guid?: string | null;
  voucher_number?: string | null;
  voucher_type?: string | null;
  voucher_date?: string | null;
  due_date?: string | null;
  bill_ref?: string | null;
  bill_type?: string | null;
  bill_amount: number | string;
  pending_amount: number | string;
  pending_amount_abs?: number | string;
  synced_at?: string | null;
  organization_id?: string | null;
  organization_name?: string | null;
  cost_center_id?: string | null;
  cost_center_name?: string | null;
  ageing_days?: number;
};

export type OutstandingSummary = {
  total_receivable: number;
  total_payable: number;
  net_outstanding: number;
  total_bills: number;
  total_ledgers: number;
  total_cost_centers: number;
};

export type OutstandingCostCenter = {
  id: string;
  name: string;
  outstanding_count: number;
  receivable: number;
  payable: number;
};

export type GetOutstandingsParams = {
  page?: number;
  limit?: number;
  type?: OutstandingType;
  cost_center_id?: string;
  date_from?: string;
  date_to?: string;
  search?: string;
  sort_by?: string;
  sort_order?: "asc" | "desc";
};

type OutstandingsState = {
  loading: boolean;
  summaryLoading: boolean;
  costCentersLoading: boolean;
  error: string | null;
  rows: OutstandingItem[];
  summary: OutstandingSummary;
  costCenters: OutstandingCostCenter[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
  };
};

const initialState: OutstandingsState = {
  loading: false,
  summaryLoading: false,
  costCentersLoading: false,
  error: null,
  rows: [],
  summary: {
    total_receivable: 0,
    total_payable: 0,
    net_outstanding: 0,
    total_bills: 0,
    total_ledgers: 0,
    total_cost_centers: 0,
  },
  costCenters: [],
  pagination: {
    page: 1,
    limit: 20,
    total: 0,
    total_pages: 0,
  },
};

function cleanParams(params: Record<string, any>) {
  const cleaned: Record<string, any> = {};

  Object.entries(params || {}).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      cleaned[key] = value;
    }
  });

  return cleaned;
}

export const fetchOutstandings = createAsyncThunk(
  "outstandings/fetchOutstandings",
  async (params: GetOutstandingsParams = {}, { rejectWithValue }) => {
    try {
      const response = await Client.get(withTenant("/outstandings"), {
        params: cleanParams({
          page: params.page || 1,
          limit: params.limit || 20,
          type: params.type || "receivable",
          cost_center_id: params.cost_center_id,
          date_from: params.date_from,
          date_to: params.date_to,
          search: params.search,
          sort_by: params.sort_by || "pending_amount",
          sort_order: params.sort_order || "desc",
        }),
      });

      return response.data?.data || response.data;
    } catch (error: any) {
      return rejectWithValue(
        error?.response?.data?.message || "Failed to fetch outstandings",
      );
    }
  },
);

export const fetchOutstandingsSummary = createAsyncThunk(
  "outstandings/fetchOutstandingsSummary",
  async (params: GetOutstandingsParams = {}, { rejectWithValue }) => {
    try {
      const response = await Client.get(withTenant("/outstandings/summary"), {
        params: cleanParams({
          type: params.type || "receivable",
          cost_center_id: params.cost_center_id,
          date_from: params.date_from,
          date_to: params.date_to,
          search: params.search,
        }),
      });

      return response.data?.data || response.data;
    } catch (error: any) {
      return rejectWithValue(
        error?.response?.data?.message || "Failed to fetch outstanding summary",
      );
    }
  },
);

export const fetchOutstandingCostCenters = createAsyncThunk(
  "outstandings/fetchOutstandingCostCenters",
  async (_, { rejectWithValue }) => {
    try {
      const response = await Client.get(
        withTenant("/outstandings/cost-centers"),
      );

      return response.data?.data || response.data;
    } catch (error: any) {
      return rejectWithValue(
        error?.response?.data?.message ||
          "Failed to fetch outstanding cost centers",
      );
    }
  },
);

const outstandingsSlice = createSlice({
  name: "outstandings",
  initialState,
  reducers: {
    resetOutstandingsState: () => initialState,
    resetOutstandingsListState: (state) => {
      state.rows = [];
      state.pagination = initialState.pagination;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchOutstandings.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchOutstandings.fulfilled, (state, action) => {
        state.loading = false;
        state.rows = action.payload?.rows || [];
        state.pagination =
          action.payload?.pagination || initialState.pagination;
      })
      .addCase(fetchOutstandings.rejected, (state, action) => {
        state.loading = false;
        state.error = String(action.payload || "Failed to fetch outstandings");
      })

      .addCase(fetchOutstandingsSummary.pending, (state) => {
        state.summaryLoading = true;
      })
      .addCase(fetchOutstandingsSummary.fulfilled, (state, action) => {
        state.summaryLoading = false;
        state.summary = {
          ...initialState.summary,
          ...(action.payload || {}),
        };
      })
      .addCase(fetchOutstandingsSummary.rejected, (state) => {
        state.summaryLoading = false;
      })

      .addCase(fetchOutstandingCostCenters.pending, (state) => {
        state.costCentersLoading = true;
      })
      .addCase(fetchOutstandingCostCenters.fulfilled, (state, action) => {
        state.costCentersLoading = false;
        state.costCenters = action.payload || [];
      })
      .addCase(fetchOutstandingCostCenters.rejected, (state) => {
        state.costCentersLoading = false;
      });
  },
});

export const { resetOutstandingsState, resetOutstandingsListState } =
  outstandingsSlice.actions;

export default outstandingsSlice.reducer;
