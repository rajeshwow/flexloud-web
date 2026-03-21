import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { Client } from "../../shared/Utils/api-client";
import { withTenant } from "../../shared/Utils/utils";

export type AttendanceSession = {
  id: string;
  attendance_date: string;
  session_no?: number;
  clock_in_at: string | null;
  clock_out_at: string | null;
  worked_minutes: number;
  late_by_minutes?: number;
  status?: string;
  source?: string | null;
  remarks?: string | null;
};

export type TodayAttendanceResponse = {
  is_clocked_in: boolean;
  active_session: AttendanceSession | null;
  today_sessions: AttendanceSession[];
  total_worked_minutes_today: number;
};

export type AttendanceCalendarDay = {
  date: string;
  status: "present" | "absent" | "leave" | "holiday" | "weekly_off" | "pending";
  shift_label: string | null;
  clock_in_at: string | null;
  clock_out_at: string | null;
  worked_minutes: number;
  late_by_minutes: number;
  request_label: string | null;
  request_status: string | null;
};

export type AttendanceCalendarResponse = {
  month: number;
  year: number;
  days: AttendanceCalendarDay[];
};

export type AttendanceMetrics = {
  avg_work_duration_minutes: number;
  avg_late_by_minutes: number;
  present_days?: number;
};

export type AttendanceRequestItem = {
  id: string;
  request_type:
    | "leave"
    | "adjustment"
    | "out_duty"
    | "shift_change"
    | "clockin";
  leave_type?: "casual" | "sick" | "earned" | "unpaid" | null;
  from_date: string;
  to_date: string;
  reason: string;
  status: "pending" | "approved" | "rejected" | "cancelled";
  admin_remark?: string | null;
  created_at?: string;
};

export type ClockInPayload = {
  remarks?: string;
  source?: "web" | "mobile" | "admin";
};

export type ClockOutPayload = {
  remarks?: string;
};

export type GetAttendanceHistoryParams = {
  page?: number;
  limit?: number;
  from?: string;
  to?: string;
};

export type GetAttendanceCalendarParams = {
  month: number;
  year: number;
};

export type GetAttendanceMetricsParams = {
  month: number;
  year: number;
};

export type CreateAttendanceRequestPayload = {
  request_type:
    | "leave"
    | "adjustment"
    | "out_duty"
    | "shift_change"
    | "clockin";
  leave_type?: "casual" | "sick" | "earned" | "unpaid";
  from_date: string;
  to_date: string;
  reason: string;
};

type AttendanceState = {
  todayAttendance: TodayAttendanceResponse | null;
  todayAttendanceLoading: boolean;

  clockInLoading: boolean;
  clockOutLoading: boolean;
  refreshKey: number;

  historyList: AttendanceSession[];
  historyLoading: boolean;
  historyPagination: {
    page: number;
    limit: number;
    total: number;
  };

  calendarData: AttendanceCalendarResponse | null;
  calendarLoading: boolean;

  metrics: AttendanceMetrics | null;
  metricsLoading: boolean;

  requestCreateLoading: boolean;
  createdRequest: AttendanceRequestItem | null;

  error: string | null;
};

const initialState: AttendanceState = {
  todayAttendance: null,
  todayAttendanceLoading: false,

  clockInLoading: false,
  clockOutLoading: false,
  refreshKey: 0,

  historyList: [],
  historyLoading: false,
  historyPagination: {
    page: 1,
    limit: 10,
    total: 0,
  },

  calendarData: null,
  calendarLoading: false,

  metrics: null,
  metricsLoading: false,

  requestCreateLoading: false,
  createdRequest: null,

  error: null,
};

const getErrorMessage = (error: any) =>
  error?.response?.data?.message || error?.message || "Something went wrong";

export const getTodayAttendance = createAsyncThunk<
  TodayAttendanceResponse,
  void,
  { rejectValue: string }
>("attendance/getTodayAttendance", async (_, { rejectWithValue }) => {
  try {
    const res = await Client.get(withTenant("/attendance/me/today"));
    return res.data.data;
  } catch (error: any) {
    return rejectWithValue(getErrorMessage(error));
  }
});

export const clockInAttendance = createAsyncThunk<
  AttendanceSession,
  ClockInPayload,
  { rejectValue: string }
>("attendance/clockInAttendance", async (payload, { rejectWithValue }) => {
  try {
    const res = await Client.post(
      withTenant("/attendance/me/clock-in"),
      payload,
    );
    return res.data.data;
  } catch (error: any) {
    return rejectWithValue(getErrorMessage(error));
  }
});

export const clockOutAttendance = createAsyncThunk<
  AttendanceSession,
  ClockOutPayload,
  { rejectValue: string }
>("attendance/clockOutAttendance", async (payload, { rejectWithValue }) => {
  try {
    const res = await Client.post(
      withTenant("/attendance/me/clock-out"),
      payload,
    );
    return res.data.data;
  } catch (error: any) {
    return rejectWithValue(getErrorMessage(error));
  }
});

export const getAttendanceHistory = createAsyncThunk<
  {
    data: AttendanceSession[];
    pagination: { page: number; limit: number; total: number };
  },
  GetAttendanceHistoryParams | void,
  { rejectValue: string }
>(
  "attendance/getAttendanceHistory",
  async (params: any, { rejectWithValue }) => {
    try {
      const res = await Client.get(withTenant("/attendance/me/history"), {
        params,
      });

      return {
        data: res.data.data || [],
        pagination: res.data.pagination || { page: 1, limit: 10, total: 0 },
      };
    } catch (error: any) {
      return rejectWithValue(getErrorMessage(error));
    }
  },
);

export const getAttendanceCalendar = createAsyncThunk<
  AttendanceCalendarResponse,
  GetAttendanceCalendarParams,
  { rejectValue: string }
>("attendance/getAttendanceCalendar", async (params, { rejectWithValue }) => {
  try {
    const res = await Client.get(withTenant("/attendance/me/calendar"), {
      params,
    });
    return res.data.data;
  } catch (error: any) {
    return rejectWithValue(getErrorMessage(error));
  }
});

export const getAttendanceMetrics = createAsyncThunk<
  AttendanceMetrics,
  GetAttendanceMetricsParams,
  { rejectValue: string }
>("attendance/getAttendanceMetrics", async (params, { rejectWithValue }) => {
  try {
    const res = await Client.get(withTenant("/attendance/me/metrics"), {
      params,
    });
    return res.data.data;
  } catch (error: any) {
    return rejectWithValue(getErrorMessage(error));
  }
});

export const createAttendanceRequest = createAsyncThunk<
  AttendanceRequestItem,
  CreateAttendanceRequestPayload,
  { rejectValue: string }
>(
  "attendance/createAttendanceRequest",
  async (payload, { rejectWithValue }) => {
    try {
      const res = await Client.post(
        withTenant("/attendance/me/requests"),
        payload,
      );
      return res.data.data;
    } catch (error: any) {
      return rejectWithValue(getErrorMessage(error));
    }
  },
);

const attendanceSlice = createSlice({
  name: "attendance",
  initialState,
  reducers: {
    resetAttendanceState: () => initialState,
    resetAttendanceCalendarState: (state) => {
      state.calendarData = null;
      state.calendarLoading = false;
      state.metrics = null;
      state.metricsLoading = false;
    },
    resetAttendanceRequestState: (state) => {
      state.requestCreateLoading = false;
      state.createdRequest = null;
    },
    resetAttendanceHistoryState: (state) => {
      state.historyList = [];
      state.historyLoading = false;
      state.historyPagination = { page: 1, limit: 10, total: 0 };
    },
    clearAttendanceError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // today
      .addCase(getTodayAttendance.pending, (state) => {
        state.todayAttendanceLoading = true;
        state.error = null;
      })
      .addCase(getTodayAttendance.fulfilled, (state, action) => {
        state.todayAttendanceLoading = false;
        state.todayAttendance = action.payload;
      })
      .addCase(getTodayAttendance.rejected, (state, action) => {
        state.todayAttendanceLoading = false;
        state.error = action.payload || "Failed to fetch today's attendance";
      })

      // clock in
      .addCase(clockInAttendance.pending, (state) => {
        state.clockInLoading = true;
        state.error = null;
      })
      .addCase(clockInAttendance.fulfilled, (state) => {
        state.clockInLoading = false;
        state.refreshKey = Date.now();
      })
      .addCase(clockInAttendance.rejected, (state, action) => {
        state.clockInLoading = false;
        state.error = action.payload || "Clock-in failed";
      })

      // clock out
      .addCase(clockOutAttendance.pending, (state) => {
        state.clockOutLoading = true;
        state.error = null;
      })
      .addCase(clockOutAttendance.fulfilled, (state) => {
        state.clockOutLoading = false;
        state.refreshKey = Date.now();
      })
      .addCase(clockOutAttendance.rejected, (state, action) => {
        state.clockOutLoading = false;
        state.error = action.payload || "Clock-out failed";
      })

      // history
      .addCase(getAttendanceHistory.pending, (state) => {
        state.historyLoading = true;
        state.error = null;
      })
      .addCase(getAttendanceHistory.fulfilled, (state, action) => {
        state.historyLoading = false;
        state.historyList = action.payload.data;
        state.historyPagination = action.payload.pagination;
      })
      .addCase(getAttendanceHistory.rejected, (state, action) => {
        state.historyLoading = false;
        state.error = action.payload || "Failed to fetch attendance history";
      })

      // calendar
      .addCase(getAttendanceCalendar.pending, (state) => {
        state.calendarLoading = true;
        state.error = null;
      })
      .addCase(getAttendanceCalendar.fulfilled, (state, action) => {
        state.calendarLoading = false;
        state.calendarData = action.payload;
      })
      .addCase(getAttendanceCalendar.rejected, (state, action) => {
        state.calendarLoading = false;
        state.error = action.payload || "Failed to fetch attendance calendar";
      })

      // metrics
      .addCase(getAttendanceMetrics.pending, (state) => {
        state.metricsLoading = true;
        state.error = null;
      })
      .addCase(getAttendanceMetrics.fulfilled, (state, action) => {
        state.metricsLoading = false;
        state.metrics = action.payload;
      })
      .addCase(getAttendanceMetrics.rejected, (state, action) => {
        state.metricsLoading = false;
        state.error = action.payload || "Failed to fetch attendance metrics";
      })

      // create request
      .addCase(createAttendanceRequest.pending, (state) => {
        state.requestCreateLoading = true;
        state.error = null;
      })
      .addCase(createAttendanceRequest.fulfilled, (state, action) => {
        state.requestCreateLoading = false;
        state.createdRequest = action.payload;
      })
      .addCase(createAttendanceRequest.rejected, (state, action) => {
        state.requestCreateLoading = false;
        state.error = action.payload || "Failed to create attendance request";
      });
  },
});

export const {
  resetAttendanceState,
  resetAttendanceCalendarState,
  resetAttendanceRequestState,
  resetAttendanceHistoryState,
  clearAttendanceError,
} = attendanceSlice.actions;

export default attendanceSlice.reducer;
