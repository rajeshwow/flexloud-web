import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { Client } from "../../shared/Utils/api-client";
import { withTenant } from "../../shared/Utils/utils";

export interface CostCenterPerformanceParams {
  from_date?: string;
  to_date?: string;
  cost_center_name?: string;
  ledger_name?: string;
  bill_type?: string;
  min_amount?: string | number;
  max_amount?: string | number;
  page?: number;
  limit?: number;
}

export const fetchCostCenterPerformance = createAsyncThunk(
  "costCenterPerformance/fetch",
  async (params: CostCenterPerformanceParams = {}, { rejectWithValue }) => {
    try {
      const response = await Client.get(
        withTenant("/cost-centers/performance"),
        { params },
      );
      return response.data?.data;
    } catch (error: any) {
      return rejectWithValue(
        error?.response?.data?.message ||
          "Failed to fetch cost center performance",
      );
    }
  },
);

export const fetchCostCenterPerformanceLedgers = createAsyncThunk(
  "costCenters/fetchCostCenterPerformanceLedgers",
  async (params: any, { rejectWithValue }) => {
    try {
      const { id, ...query } = params;

      const response = await Client.get(
        withTenant(`/cost-centers/${id}/performance-ledgers`),
        {
          params: query,
        },
      );

      return {
        id,
        data: response.data?.data || [],
      };
    } catch (error: any) {
      return rejectWithValue(
        error?.response?.data?.message ||
          "Cost center performance ledgers fetch failed",
      );
    }
  },
);

export const fetchCostCenterPerformanceFilters = createAsyncThunk(
  "costCenterPerformance/fetchFilters",
  async (_, { rejectWithValue }) => {
    try {
      const response = await Client.get(
        withTenant("/cost-centers/performance/filters"),
      );
      return response.data?.data;
    } catch (error: any) {
      return rejectWithValue(
        error?.response?.data?.message || "Failed to fetch filters",
      );
    }
  },
);

const initialState = {
  loading: false,
  filtersLoading: false,
  rows: [] as any[],
  cards: null as any,
  filters: {
    cost_centers: [],
    ledgers: [],
    bill_types: [],
  } as any,
  pagination: {
    page: 1,
    limit: 20,
    total: 0,
  },
  error: null as string | null,
};

const costCenterPerformanceSlice = createSlice({
  name: "costCenterPerformance",
  initialState,
  reducers: {
    resetCostCenterPerformanceState: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCostCenterPerformance.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCostCenterPerformance.fulfilled, (state, action) => {
        state.loading = false;
        state.rows = action.payload?.rows || [];
        state.cards = action.payload?.cards || null;
        state.pagination =
          action.payload?.pagination || initialState.pagination;
      })
      .addCase(fetchCostCenterPerformance.rejected, (state, action: any) => {
        state.loading = false;
        state.error = action.payload || "Something went wrong";
      })

      .addCase(fetchCostCenterPerformanceFilters.pending, (state) => {
        state.filtersLoading = true;
      })
      .addCase(fetchCostCenterPerformanceFilters.fulfilled, (state, action) => {
        state.filtersLoading = false;
        state.filters = action.payload || initialState.filters;
      })
      .addCase(fetchCostCenterPerformanceFilters.rejected, (state) => {
        state.filtersLoading = false;
      });
  },
});

export const { resetCostCenterPerformanceState } =
  costCenterPerformanceSlice.actions;

export default costCenterPerformanceSlice.reducer;
