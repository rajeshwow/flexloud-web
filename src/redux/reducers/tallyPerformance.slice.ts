import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { Client } from "../../shared/Utils/api-client";
import { withTenant } from "../../shared/Utils/utils";

export type TallySummary = {
  total_receivable: string;
  total_payable: string;
  overdue_receivable: string;
  critical_receivable: string;
  receivable_bills: string;
  payable_bills: string;
  mapped_ledgers_with_outstanding: string;
  unmapped_ledgers: string;
  unassigned_organizations: string;
};

export type EmployeeTallyPerformance = {
  employee_id: string;
  employee_name: string;
  employee_email: string;
  employee_code?: string | null;
  designation?: string | null;
  department?: string | null;
  assigned_organizations: string;
  receivable_bills: string;
  payable_bills: string;
  total_receivable: string;
  total_payable: string;
  overdue_receivable: string;
  critical_receivable: string;
  overdue_bills: string;
  performance_score: string;
  performance_status: string;
};

export type EmployeeOutstanding = {
  id: string;
  ledger_guid: string;
  ledger_name: string;
  organization_id: string;
  organization_name: string;
  organization_email?: string | null;
  organization_gst_number?: string | null;
  voucher_guid?: string | null;
  voucher_number?: string | null;
  voucher_type?: string | null;
  voucher_date?: string | null;
  due_date?: string | null;
  bill_ref?: string | null;
  bill_type: string;
  bill_amount: string;
  pending_amount: string;
  overdue_days: string;
  ageing_bucket: string;
};

export type TallyAgeingRow = {
  employee_id: string;
  employee_name: string;
  no_due_date: string;
  not_due: string;
  bucket_1_30: string;
  bucket_31_60: string;
  bucket_61_90: string;
  bucket_above_90: string;
  total_pending: string;
};

export type RiskyCustomer = {
  organization_id: string;
  organization_name: string;
  organization_email?: string | null;
  organization_gst_number?: string | null;
  assigned_to?: string | null;
  assigned_to_name?: string | null;
  overdue_bills: string;
  overdue_amount: string;
  max_overdue_days: string;
  risk_level: string;
};

type TallyPerformanceState = {
  summary: TallySummary | null;
  employees: EmployeeTallyPerformance[];
  employeeOutstandings: EmployeeOutstanding[];
  ageing: TallyAgeingRow[];
  riskyCustomers: RiskyCustomer[];

  summaryLoading: boolean;
  employeesLoading: boolean;
  outstandingsLoading: boolean;
  ageingLoading: boolean;
  riskyCustomersLoading: boolean;

  error: string | null;
};

const initialState: TallyPerformanceState = {
  summary: null,
  employees: [],
  employeeOutstandings: [],
  ageing: [],
  riskyCustomers: [],

  summaryLoading: false,
  employeesLoading: false,
  outstandingsLoading: false,
  ageingLoading: false,
  riskyCustomersLoading: false,

  error: null,
};

export const fetchTallyPerformanceSummary = createAsyncThunk(
  "tallyPerformance/fetchTallyPerformanceSummary",
  async (_, { rejectWithValue }) => {
    try {
      const res = await Client.get(withTenant("/tally-performance/summary"));
      return res?.data?.data || null;
    } catch (error: any) {
      return rejectWithValue(
        error?.response?.data?.message ||
          "Failed to fetch Tally performance summary",
      );
    }
  },
);

export const fetchEmployeeTallyPerformance = createAsyncThunk(
  "tallyPerformance/fetchEmployeeTallyPerformance",
  async (_, { rejectWithValue }) => {
    try {
      const res = await Client.get(withTenant("/tally-performance/employees"));
      return res?.data?.data || [];
    } catch (error: any) {
      return rejectWithValue(
        error?.response?.data?.message ||
          "Failed to fetch employee performance",
      );
    }
  },
);

export const fetchEmployeeTallyOutstandings = createAsyncThunk(
  "tallyPerformance/fetchEmployeeTallyOutstandings",
  async (userId: string, { rejectWithValue }) => {
    try {
      const res = await Client.get(
        withTenant(`/tally-performance/employees/${userId}/outstandings`),
      );
      return res?.data?.data || [];
    } catch (error: any) {
      return rejectWithValue(
        error?.response?.data?.message ||
          "Failed to fetch employee outstandings",
      );
    }
  },
);

export const fetchTallyAgeingReport = createAsyncThunk(
  "tallyPerformance/fetchTallyAgeingReport",
  async (_, { rejectWithValue }) => {
    try {
      const res = await Client.get(withTenant("/tally-performance/ageing"));
      return res?.data?.data || [];
    } catch (error: any) {
      return rejectWithValue(
        error?.response?.data?.message || "Failed to fetch ageing report",
      );
    }
  },
);

export const fetchRiskyCustomers = createAsyncThunk(
  "tallyPerformance/fetchRiskyCustomers",
  async (_, { rejectWithValue }) => {
    try {
      const res = await Client.get(
        withTenant("/tally-performance/risky-customers"),
      );
      return res?.data?.data || [];
    } catch (error: any) {
      return rejectWithValue(
        error?.response?.data?.message || "Failed to fetch risky customers",
      );
    }
  },
);

const tallyPerformanceSlice = createSlice({
  name: "tallyPerformance",
  initialState,
  reducers: {
    resetTallyPerformanceState: () => initialState,
    resetEmployeeOutstandings: (state) => {
      state.employeeOutstandings = [];
      state.outstandingsLoading = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTallyPerformanceSummary.pending, (state) => {
        state.summaryLoading = true;
        state.error = null;
      })
      .addCase(fetchTallyPerformanceSummary.fulfilled, (state, action) => {
        state.summaryLoading = false;
        state.summary = action.payload;
      })
      .addCase(fetchTallyPerformanceSummary.rejected, (state, action) => {
        state.summaryLoading = false;
        state.error = action.payload as string;
      })

      .addCase(fetchEmployeeTallyPerformance.pending, (state) => {
        state.employeesLoading = true;
        state.error = null;
      })
      .addCase(fetchEmployeeTallyPerformance.fulfilled, (state, action) => {
        state.employeesLoading = false;
        state.employees = action.payload;
      })
      .addCase(fetchEmployeeTallyPerformance.rejected, (state, action) => {
        state.employeesLoading = false;
        state.error = action.payload as string;
      })

      .addCase(fetchEmployeeTallyOutstandings.pending, (state) => {
        state.outstandingsLoading = true;
        state.error = null;
      })
      .addCase(fetchEmployeeTallyOutstandings.fulfilled, (state, action) => {
        state.outstandingsLoading = false;
        state.employeeOutstandings = action.payload;
      })
      .addCase(fetchEmployeeTallyOutstandings.rejected, (state, action) => {
        state.outstandingsLoading = false;
        state.error = action.payload as string;
      })

      .addCase(fetchTallyAgeingReport.pending, (state) => {
        state.ageingLoading = true;
        state.error = null;
      })
      .addCase(fetchTallyAgeingReport.fulfilled, (state, action) => {
        state.ageingLoading = false;
        state.ageing = action.payload;
      })
      .addCase(fetchTallyAgeingReport.rejected, (state, action) => {
        state.ageingLoading = false;
        state.error = action.payload as string;
      })

      .addCase(fetchRiskyCustomers.pending, (state) => {
        state.riskyCustomersLoading = true;
        state.error = null;
      })
      .addCase(fetchRiskyCustomers.fulfilled, (state, action) => {
        state.riskyCustomersLoading = false;
        state.riskyCustomers = action.payload;
      })
      .addCase(fetchRiskyCustomers.rejected, (state, action) => {
        state.riskyCustomersLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { resetTallyPerformanceState, resetEmployeeOutstandings } =
  tallyPerformanceSlice.actions;

export default tallyPerformanceSlice.reducer;
