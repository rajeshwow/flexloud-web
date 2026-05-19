import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { Client } from "../../shared/Utils/api-client";
import { withTenant } from "../../shared/Utils/utils";

export const fetchCostCenters = createAsyncThunk(
  "costCenters/fetchCostCenters",
  async (_, { rejectWithValue }) => {
    try {
      const res = await Client.get(withTenant("/cost-centers"));
      return res.data?.data || [];
    } catch (error: any) {
      return rejectWithValue(
        error?.response?.data?.message || "Failed to fetch cost centers",
      );
    }
  },
);

export const fetchCostCenterSummary = createAsyncThunk(
  "costCenters/fetchCostCenterSummary",
  async (_, { rejectWithValue }) => {
    try {
      const res = await Client.get(withTenant("/cost-centers/summary"));
      return res.data?.data || { totals: {}, rows: [] };
    } catch (error: any) {
      return rejectWithValue(
        error?.response?.data?.message || "Failed to fetch cost center summary",
      );
    }
  },
);

export const fetchCostCenterOutstandings = createAsyncThunk(
  "costCenters/fetchCostCenterOutstandings",
  async (id: string, { rejectWithValue }) => {
    try {
      const res = await Client.get(
        withTenant(`/cost-centers/${id}/outstandings`),
      );
      return res.data?.data || [];
    } catch (error: any) {
      return rejectWithValue(
        error?.response?.data?.message ||
          "Failed to fetch cost center outstandings",
      );
    }
  },
);

const initialState = {
  list: [],
  summary: {
    totals: {},
    rows: [],
  },
  outstandings: [],
  loading: false,
  summaryLoading: false,
  outstandingsLoading: false,
  error: null as string | null,
};

const costCentersSlice = createSlice({
  name: "costCenters",
  initialState,
  reducers: {
    resetCostCenterOutstandings(state) {
      state.outstandings = [];
      state.outstandingsLoading = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCostCenters.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchCostCenters.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload;
      })
      .addCase(fetchCostCenters.rejected, (state, action: any) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(fetchCostCenterSummary.pending, (state) => {
        state.summaryLoading = true;
      })
      .addCase(fetchCostCenterSummary.fulfilled, (state, action) => {
        state.summaryLoading = false;
        state.summary = action.payload;
      })
      .addCase(fetchCostCenterSummary.rejected, (state, action: any) => {
        state.summaryLoading = false;
        state.error = action.payload;
      })

      .addCase(fetchCostCenterOutstandings.pending, (state) => {
        state.outstandingsLoading = true;
      })
      .addCase(fetchCostCenterOutstandings.fulfilled, (state, action) => {
        state.outstandingsLoading = false;
        state.outstandings = action.payload;
      })
      .addCase(fetchCostCenterOutstandings.rejected, (state, action: any) => {
        state.outstandingsLoading = false;
        state.error = action.payload;
      });
  },
});

export const { resetCostCenterOutstandings } = costCentersSlice.actions;
export default costCentersSlice.reducer;
