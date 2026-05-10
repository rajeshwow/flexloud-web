import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { Client } from "../../shared/Utils/api-client";
import { withTenant } from "../../shared/Utils/utils";

export type TallyEmployeeItem = {
  id: string;
  tenant_id?: string;

  tally_guid?: string | null;
  master_id?: string | null;
  alter_id?: string | null;

  name: string;
  employee_number?: string | null;
  designation?: string | null;
  department?: string | null;
  mobile?: string | null;
  email?: string | null;
  address?: string | null;
  pan?: string | null;
  aadhaar?: string | null;

  is_active?: boolean;
  synced_at?: string | null;
  created_at?: string;
  updated_at?: string;
};

export type GetTallyEmployeesParams = {
  search?: string;
  page?: number;
  limit?: number;
};

type TallyEmployeesState = {
  list: TallyEmployeeItem[];
  total: number;
  loading: boolean;
  pulling: boolean;
  error: string | null;
};

const initialState: TallyEmployeesState = {
  list: [],
  total: 0,
  loading: false,
  pulling: false,
  error: null,
};

function cleanParams(params: Record<string, any>) {
  const finalParams: Record<string, any> = {};

  Object.entries(params || {}).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      finalParams[key] = value;
    }
  });

  return finalParams;
}

export const fetchTallyEmployees = createAsyncThunk(
  "tallyEmployees/fetchTallyEmployees",
  async (params: GetTallyEmployeesParams = {}, { rejectWithValue }) => {
    try {
      const res = await Client.get(withTenant("/tally/employees"), {
        params: cleanParams({
          search: params.search,
          page: params.page || 1,
          limit: params.limit || 20,
        }),
      });

      return res.data?.data;
    } catch (error: any) {
      return rejectWithValue(
        error?.response?.data?.message || "Failed to fetch Tally employees",
      );
    }
  },
);

export const pullTallyEmployees = createAsyncThunk(
  "tallyEmployees/pullTallyEmployees",
  async (_, { rejectWithValue }) => {
    try {
      const res = await Client.post(withTenant("/tally/pull/employees"));
      return res.data;
    } catch (error: any) {
      return rejectWithValue(
        error?.response?.data?.message || "Failed to pull Tally employees",
      );
    }
  },
);

const tallyEmployeesSlice = createSlice({
  name: "tallyEmployees",
  initialState,
  reducers: {
    resetTallyEmployeesState: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTallyEmployees.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTallyEmployees.fulfilled, (state, action) => {
        state.loading = false;

        const payload = action.payload;
        // debugger;
        state.list = payload?.data;

        state.total = payload?.data?.total;
      })
      .addCase(fetchTallyEmployees.rejected, (state, action) => {
        state.loading = false;
        state.error = String(
          action.payload || "Failed to fetch Tally employees",
        );
      })

      .addCase(pullTallyEmployees.pending, (state) => {
        state.pulling = true;
        state.error = null;
      })
      .addCase(pullTallyEmployees.fulfilled, (state) => {
        state.pulling = false;
      })
      .addCase(pullTallyEmployees.rejected, (state, action) => {
        state.pulling = false;
        state.error = String(
          action.payload || "Failed to pull Tally employees",
        );
      });
  },
});

export const { resetTallyEmployeesState } = tallyEmployeesSlice.actions;

export default tallyEmployeesSlice.reducer;
