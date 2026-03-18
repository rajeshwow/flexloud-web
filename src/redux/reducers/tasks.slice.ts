import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { Client } from "../../shared/Utils/api-client";
import { withTenant } from "../../shared/Utils/utils";

type TaskState = {
  loading: boolean;
  taskListLoading: boolean;
  error: string | null;
  taskList: any[];
  currentTask: any | null;
  total: number;
};

const initialState: TaskState = {
  loading: false,
  taskListLoading: false,
  error: null,
  taskList: [],
  currentTask: null,
  total: 0,
};

export const createTask = createAsyncThunk(
  "tasks/createTask",
  async (body: any, thunkAPI) => {
    try {
      const res = await Client.post(withTenant(`/tasks`), body);
      return res.data;
    } catch (error: any) {
      return thunkAPI.rejectWithValue(
        error?.response?.data || { message: "Failed to create task" },
      );
    }
  },
);

export const getTaskById = createAsyncThunk(
  "tasks/getTaskById",
  async (id: string, thunkAPI) => {
    try {
      const res = await Client.get(withTenant(`/tasks/${id}`));
      return res.data;
    } catch (error: any) {
      return thunkAPI.rejectWithValue(
        error?.response?.data || { message: "Failed to fetch task" },
      );
    }
  },
);

export const updateTask = createAsyncThunk(
  "tasks/updateTask",
  async ({ id, body }: { id: string; body: any }, thunkAPI) => {
    try {
      const res = await Client.patch(withTenant(`/tasks/${id}`), body);
      return res.data;
    } catch (error: any) {
      return thunkAPI.rejectWithValue(
        error?.response?.data || { message: "Failed to update task" },
      );
    }
  },
);

export const getTasks = createAsyncThunk(
  "tasks/getTasks",
  async (params: any) => {
    try {
      const res = await Client.get(withTenant(`/tasks`), { params });
      return res.data;
    } catch (error: any) {
      return error?.response?.data;
    }
  },
);

const tasksSlice = createSlice({
  name: "tasks",
  initialState,
  reducers: {
    resetTasksState: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      .addCase(getTasks.pending, (state) => {
        state.taskListLoading = true;
        state.error = null;
      })
      .addCase(getTasks.fulfilled, (state, action) => {
        state.taskListLoading = false;
        state.taskList = action.payload.data;
        state.total = action.payload.total;
      })
      .addCase(getTasks.rejected, (state, action: any) => {
        state.taskListLoading = false;
        state.error = action?.payload?.message || "Failed to fetch tasks";
      })
      .addCase(createTask.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createTask.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(createTask.rejected, (state, action: any) => {
        state.loading = false;
        state.error = action?.payload?.message || "Failed to create task";
      })

      .addCase(getTaskById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getTaskById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentTask = action.payload;
      })
      .addCase(getTaskById.rejected, (state, action: any) => {
        state.loading = false;
        state.error = action?.payload?.message || "Failed to fetch task";
      })

      .addCase(updateTask.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateTask.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(updateTask.rejected, (state, action: any) => {
        state.loading = false;
        state.error = action?.payload?.message || "Failed to update task";
      });
  },
});

export const { resetTasksState } = tasksSlice.actions;
export default tasksSlice.reducer;
