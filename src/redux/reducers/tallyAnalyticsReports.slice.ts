import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { Client } from "../../shared/Utils/api-client";
import { withTenant } from "../../shared/Utils/utils";

export type TallyAnalyticsFilters = {
  from_date?: string;
  to_date?: string;
  user_id?: string;
  party_id?: string;
  category?: string;
  cost_center_guid?: string;
  cost_center_name?: string;
  quarter?: string;
  financial_year?: number | string;
  page?: number;
  limit?: number;
};

export type ReportRow = Record<string, any>;

type ReportsState = {
  loading: boolean;
  userCategoryMonthlySales: ReportRow[];
  companyQuarterlySales: ReportRow[];
  userCategoryTargets: ReportRow[];
  partyCategorySales: ReportRow[];
  costCenterCategorySales: ReportRow[];
  error: string | null;
};

const initialState: ReportsState = {
  loading: false,
  userCategoryMonthlySales: [],
  companyQuarterlySales: [],
  userCategoryTargets: [],
  partyCategorySales: [],
  costCenterCategorySales: [],
  error: null,
};

function buildQuery(params?: TallyAnalyticsFilters) {
  const search = new URLSearchParams();

  Object.entries(params || {}).forEach(([key, value]) => {
    if (value !== undefined && value !== null && String(value).trim() !== "") {
      search.append(key, String(value));
    }
  });

  return search.toString();
}

function getRows(response: any) {
  return response?.data?.data?.rows || response?.data?.rows || [];
}

export const fetchUserCategoryMonthlySales = createAsyncThunk(
  "tallyAnalyticsReports/fetchUserCategoryMonthlySales",
  async (params: TallyAnalyticsFilters = {}, { rejectWithValue }) => {
    try {
      const query = buildQuery(params);
      const response = await Client.get(
        withTenant(
          `/reports/tally-analytics/user-category-monthly-sales${query ? `?${query}` : ""}`,
        ),
      );
      return getRows(response);
    } catch (error: any) {
      return rejectWithValue(
        error?.response?.data?.message ||
          "Failed to fetch user category monthly sales",
      );
    }
  },
);

export const fetchCompanyQuarterlySales = createAsyncThunk(
  "tallyAnalyticsReports/fetchCompanyQuarterlySales",
  async (params: TallyAnalyticsFilters = {}, { rejectWithValue }) => {
    try {
      const query = buildQuery(params);
      const response = await Client.get(
        withTenant(
          `/reports/tally-analytics/company-quarterly-sales${query ? `?${query}` : ""}`,
        ),
      );
      return getRows(response);
    } catch (error: any) {
      return rejectWithValue(
        error?.response?.data?.message ||
          "Failed to fetch company quarterly sales",
      );
    }
  },
);

export const fetchUserCategoryTargets = createAsyncThunk(
  "tallyAnalyticsReports/fetchUserCategoryTargets",
  async (params: TallyAnalyticsFilters = {}, { rejectWithValue }) => {
    try {
      const query = buildQuery(params);
      const response = await Client.get(
        withTenant(
          `/reports/tally-analytics/user-category-targets${query ? `?${query}` : ""}`,
        ),
      );
      return getRows(response);
    } catch (error: any) {
      return rejectWithValue(
        error?.response?.data?.message ||
          "Failed to fetch user category targets",
      );
    }
  },
);

export const fetchPartyCategorySales = createAsyncThunk(
  "tallyAnalyticsReports/fetchPartyCategorySales",
  async (params: TallyAnalyticsFilters = {}, { rejectWithValue }) => {
    try {
      const query = buildQuery(params);
      const response = await Client.get(
        withTenant(
          `/reports/tally-analytics/party-category-sales${query ? `?${query}` : ""}`,
        ),
      );
      return getRows(response);
    } catch (error: any) {
      return rejectWithValue(
        error?.response?.data?.message ||
          "Failed to fetch party category sales",
      );
    }
  },
);

export const fetchCostCenterCategorySales = createAsyncThunk(
  "tallyAnalyticsReports/fetchCostCenterCategorySales",
  async (params: TallyAnalyticsFilters = {}, { rejectWithValue }) => {
    try {
      const query = buildQuery(params);
      const response = await Client.get(
        withTenant(
          `/reports/tally-analytics/cost-center-category-sales${query ? `?${query}` : ""}`,
        ),
      );
      return getRows(response);
    } catch (error: any) {
      return rejectWithValue(
        error?.response?.data?.message ||
          "Failed to fetch cost center category sales",
      );
    }
  },
);

const tallyAnalyticsReportsSlice = createSlice({
  name: "tallyAnalyticsReports",
  initialState,
  reducers: {
    resetTallyAnalyticsReportsState: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUserCategoryMonthlySales.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserCategoryMonthlySales.fulfilled, (state, action) => {
        state.loading = false;
        state.userCategoryMonthlySales = action.payload;
      })
      .addCase(fetchUserCategoryMonthlySales.rejected, (state, action) => {
        state.loading = false;
        state.error = String(action.payload || "Failed");
      })

      .addCase(fetchCompanyQuarterlySales.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCompanyQuarterlySales.fulfilled, (state, action) => {
        state.loading = false;
        state.companyQuarterlySales = action.payload;
      })
      .addCase(fetchCompanyQuarterlySales.rejected, (state, action) => {
        state.loading = false;
        state.error = String(action.payload || "Failed");
      })

      .addCase(fetchUserCategoryTargets.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserCategoryTargets.fulfilled, (state, action) => {
        state.loading = false;
        state.userCategoryTargets = action.payload;
      })
      .addCase(fetchUserCategoryTargets.rejected, (state, action) => {
        state.loading = false;
        state.error = String(action.payload || "Failed");
      })

      .addCase(fetchPartyCategorySales.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPartyCategorySales.fulfilled, (state, action) => {
        state.loading = false;
        state.partyCategorySales = action.payload;
      })
      .addCase(fetchPartyCategorySales.rejected, (state, action) => {
        state.loading = false;
        state.error = String(action.payload || "Failed");
      })

      .addCase(fetchCostCenterCategorySales.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCostCenterCategorySales.fulfilled, (state, action) => {
        state.loading = false;
        state.costCenterCategorySales = action.payload;
      })
      .addCase(fetchCostCenterCategorySales.rejected, (state, action) => {
        state.loading = false;
        state.error = String(action.payload || "Failed");
      });
  },
});

export const { resetTallyAnalyticsReportsState } =
  tallyAnalyticsReportsSlice.actions;

export default tallyAnalyticsReportsSlice.reducer;
