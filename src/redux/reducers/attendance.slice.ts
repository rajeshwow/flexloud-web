import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { Client } from "../../shared/Utils/api-client";
import { withTenant } from "../../shared/Utils/utils";

export type AttendanceSource = "web" | "mobile" | "admin";
export type AttendanceSessionStatus =
  | "clocked_in"
  | "clocked_out"
  | "missed_clock_out";

export type AttendanceSession = {
  id: string;
  tenant_id: string;
  user_id: string;
  attendance_date: string;
  session_no: number;
  clock_in_at: string;
  clock_out_at: string | null;
  shift_start_time: string | null;
  shift_end_time: string | null;
  worked_minutes: number;
  break_minutes: number;
  status: AttendanceSessionStatus;
  source: AttendanceSource;
  remarks: string | null;
  created_at: string;
  updated_at: string;
};

export type GetTodayAttendanceResponse = {
  is_clocked_in: boolean;
  active_session: AttendanceSession | null;
  today_sessions: AttendanceSession[];
  total_worked_minutes_today: number;
};

export type ClockInPayload = {
  remarks?: string;
  source?: AttendanceSource;
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

export type AttendanceHistoryResponse = {
  data: AttendanceSession[];
  pagination: {
    page: number;
    limit: number;
    total: number;
  };
};

type AttendanceState = {
  todayAttendance: GetTodayAttendanceResponse | null;
  todayAttendanceLoading: boolean;
  todayAttendanceSuccess: boolean;
  todayAttendanceError: string | null;

  clockInLoading: boolean;
  clockInSuccess: boolean;
  clockInError: string | null;

  clockOutLoading: boolean;
  clockOutSuccess: boolean;
  clockOutError: string | null;

  attendanceHistory: AttendanceSession[];
  attendanceHistoryPagination: {
    page: number;
    limit: number;
    total: number;
  };
  attendanceHistoryLoading: boolean;
  attendanceHistorySuccess: boolean;
  attendanceHistoryError: string | null;
};

const initialState: AttendanceState = {
  todayAttendance: null,
  todayAttendanceLoading: false,
  todayAttendanceSuccess: false,
  todayAttendanceError: null,

  clockInLoading: false,
  clockInSuccess: false,
  clockInError: null,

  clockOutLoading: false,
  clockOutSuccess: false,
  clockOutError: null,

  attendanceHistory: [],
  attendanceHistoryPagination: {
    page: 1,
    limit: 10,
    total: 0,
  },
  attendanceHistoryLoading: false,
  attendanceHistorySuccess: false,
  attendanceHistoryError: null,
};

const getErrorMessage = (error: any) =>
  error?.response?.data?.message || error?.message || "Something went wrong";

export const getTodayAttendance = createAsyncThunk<
  GetTodayAttendanceResponse,
  void,
  { rejectValue: string }
>("attendance/getTodayAttendance", async (_, thunkAPI) => {
  try {
    const res = await Client.get(withTenant("/attendance/me/today"));
    return res?.data?.data;
  } catch (error: any) {
    return thunkAPI.rejectWithValue(getErrorMessage(error));
  }
});

export const clockInAttendance = createAsyncThunk<
  AttendanceSession,
  ClockInPayload | undefined,
  { rejectValue: string }
>("attendance/clockInAttendance", async (payload, thunkAPI) => {
  try {
    const res = await Client.post(
      withTenant("/attendance/me/clock-in"),
      payload || {},
    );
    return res?.data?.data;
  } catch (error: any) {
    return thunkAPI.rejectWithValue(getErrorMessage(error));
  }
});

export const clockOutAttendance = createAsyncThunk<
  AttendanceSession,
  ClockOutPayload | undefined,
  { rejectValue: string }
>("attendance/clockOutAttendance", async (payload, thunkAPI) => {
  try {
    const res = await Client.post(
      withTenant("/attendance/me/clock-out"),
      payload || {},
    );
    return res?.data?.data;
  } catch (error: any) {
    return thunkAPI.rejectWithValue(getErrorMessage(error));
  }
});

export const getAttendanceHistory = createAsyncThunk<
  AttendanceHistoryResponse,
  GetAttendanceHistoryParams | undefined,
  { rejectValue: string }
>("attendance/getAttendanceHistory", async (params, thunkAPI) => {
  try {
    const searchParams = new URLSearchParams();

    if (params?.page) searchParams.append("page", String(params.page));
    if (params?.limit) searchParams.append("limit", String(params.limit));
    if (params?.from) searchParams.append("from", params.from);
    if (params?.to) searchParams.append("to", params.to);

    const query = searchParams.toString();
    const url = query
      ? withTenant(`/attendance/me/history?${query}`)
      : withTenant("/attendance/me/history");

    const res = await Client.get(url);

    return {
      data: res?.data?.data || [],
      pagination: res?.data?.pagination || {
        page: params?.page || 1,
        limit: params?.limit || 10,
        total: 0,
      },
    };
  } catch (error: any) {
    return thunkAPI.rejectWithValue(getErrorMessage(error));
  }
});

const attendanceSlice = createSlice({
  name: "attendance",
  initialState,
  reducers: {
    resetAttendanceState: (state) => {
      state.todayAttendanceLoading = false;
      state.todayAttendanceSuccess = false;
      state.todayAttendanceError = null;

      state.clockInLoading = false;
      state.clockInSuccess = false;
      state.clockInError = null;

      state.clockOutLoading = false;
      state.clockOutSuccess = false;
      state.clockOutError = null;

      state.attendanceHistoryLoading = false;
      state.attendanceHistorySuccess = false;
      state.attendanceHistoryError = null;
    },

    resetAttendanceListState: (state) => {
      state.attendanceHistory = [];
      state.attendanceHistoryPagination = {
        page: 1,
        limit: 10,
        total: 0,
      };
      state.attendanceHistoryLoading = false;
      state.attendanceHistorySuccess = false;
      state.attendanceHistoryError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // getTodayAttendance
      .addCase(getTodayAttendance.pending, (state) => {
        state.todayAttendanceLoading = true;
        state.todayAttendanceSuccess = false;
        state.todayAttendanceError = null;
      })
      .addCase(getTodayAttendance.fulfilled, (state, action) => {
        state.todayAttendanceLoading = false;
        state.todayAttendanceSuccess = true;
        state.todayAttendanceError = null;
        state.todayAttendance = action.payload;
      })
      .addCase(getTodayAttendance.rejected, (state, action) => {
        state.todayAttendanceLoading = false;
        state.todayAttendanceSuccess = false;
        state.todayAttendanceError =
          action.payload || "Failed to fetch today attendance";
      })

      // clockInAttendance
      .addCase(clockInAttendance.pending, (state) => {
        state.clockInLoading = true;
        state.clockInSuccess = false;
        state.clockInError = null;
      })
      .addCase(clockInAttendance.fulfilled, (state, action) => {
        state.clockInLoading = false;
        state.clockInSuccess = true;
        state.clockInError = null;

        const newSession = action.payload;

        state.todayAttendance = {
          is_clocked_in: true,
          active_session: newSession,
          today_sessions: state.todayAttendance?.today_sessions
            ? [newSession, ...state.todayAttendance.today_sessions]
            : [newSession],
          total_worked_minutes_today:
            state.todayAttendance?.total_worked_minutes_today || 0,
        };
      })
      .addCase(clockInAttendance.rejected, (state, action) => {
        state.clockInLoading = false;
        state.clockInSuccess = false;
        state.clockInError = action.payload || "Failed to clock in";
      })

      // clockOutAttendance
      .addCase(clockOutAttendance.pending, (state) => {
        state.clockOutLoading = true;
        state.clockOutSuccess = false;
        state.clockOutError = null;
      })
      .addCase(clockOutAttendance.fulfilled, (state, action) => {
        state.clockOutLoading = false;
        state.clockOutSuccess = true;
        state.clockOutError = null;

        const updatedSession = action.payload;

        const existingSessions = state.todayAttendance?.today_sessions || [];
        const updatedSessions = existingSessions.map((item) =>
          item.id === updatedSession.id ? updatedSession : item,
        );

        const totalWorkedMinutesToday = updatedSessions.reduce(
          (sum, session) => sum + Number(session.worked_minutes || 0),
          0,
        );

        state.todayAttendance = {
          is_clocked_in: false,
          active_session: null,
          today_sessions: updatedSessions,
          total_worked_minutes_today: totalWorkedMinutesToday,
        };
      })
      .addCase(clockOutAttendance.rejected, (state, action) => {
        state.clockOutLoading = false;
        state.clockOutSuccess = false;
        state.clockOutError = action.payload || "Failed to clock out";
      })

      // getAttendanceHistory
      .addCase(getAttendanceHistory.pending, (state) => {
        state.attendanceHistoryLoading = true;
        state.attendanceHistorySuccess = false;
        state.attendanceHistoryError = null;
      })
      .addCase(getAttendanceHistory.fulfilled, (state, action) => {
        state.attendanceHistoryLoading = false;
        state.attendanceHistorySuccess = true;
        state.attendanceHistoryError = null;
        state.attendanceHistory = action.payload.data;
        state.attendanceHistoryPagination = action.payload.pagination;
      })
      .addCase(getAttendanceHistory.rejected, (state, action) => {
        state.attendanceHistoryLoading = false;
        state.attendanceHistorySuccess = false;
        state.attendanceHistoryError =
          action.payload || "Failed to fetch attendance history";
      });
  },
});

export const { resetAttendanceState, resetAttendanceListState } =
  attendanceSlice.actions;

export default attendanceSlice.reducer;
