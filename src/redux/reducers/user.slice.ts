import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { Client } from "../../shared/Utils/api-client";
import { withTenant } from "../../shared/Utils/utils";

export type UserRole = "ADMIN" | "MANAGER" | "AGENT";

export type CreateUserPayload = {
  email: string;
  name: string;
  role: UserRole;

  display_name?: string | null;
  first_name?: string | null;
  last_name?: string | null;

  phone_country_code?: string | null;
  phone?: string | null;

  city?: string | null;
  district?: string | null;
  state?: string | null;
  country?: string | null;
  postal_code?: string | null;

  address_line_1?: string | null;
  address_line_2?: string | null;
  landmark?: string | null;

  designation?: string | null;
  department?: string | null;
  employee_code?: string | null;

  timezone?: string | null;
  language?: string | null;

  tempPassword?: string;
  metadata?: Record<string, any> | null;
};

export type UserItem = {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  is_active: boolean;

  display_name?: string | null;
  first_name?: string | null;
  last_name?: string | null;

  phone_country_code?: string | null;
  phone?: string | null;

  city?: string | null;
  district?: string | null;
  state?: string | null;
  country?: string | null;
  postal_code?: string | null;

  address_line_1?: string | null;
  address_line_2?: string | null;
  landmark?: string | null;

  designation?: string | null;
  department?: string | null;
  employee_code?: string | null;

  timezone?: string | null;
  language?: string | null;

  is_owner?: boolean;
  created_at: string;
  updated_at: string;
};

export type GetUsersParams = {
  page?: number;
  limit?: number;
  search?: string;
  role?: string;
  active?: "true" | "false" | "";
};

type PaginationState = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

type UserState = {
  createLoading: boolean;
  createError: string | null;
  createdUser: (UserItem & { tempPassword?: string }) | null;

  listLoading: boolean;
  listError: string | null;
  list: UserItem[];
  pagination: PaginationState;
};

const initialState: UserState = {
  createLoading: false,
  createError: null,
  createdUser: null,

  listLoading: false,
  listError: null,
  list: [],
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  },
};

export const createUser = createAsyncThunk<
  { user: UserItem; tempPassword?: string },
  CreateUserPayload,
  { rejectValue: string }
>("users/createUser", async (payload, thunkAPI) => {
  try {
    const response = await Client.post(withTenant("/users"), payload);

    return {
      user: response.data?.data,
      tempPassword: response.data?.tempPassword,
    };
  } catch (error: any) {
    return thunkAPI.rejectWithValue(
      error?.data?.message || error?.message || "Failed to create user",
    );
  }
});

export const getUsers = createAsyncThunk<
  { data: UserItem[]; pagination: PaginationState },
  GetUsersParams | undefined,
  { rejectValue: string }
>("users/getUsers", async (params, thunkAPI) => {
  try {
    const response = await Client.get(withTenant("/users"), {
      params: {
        page: params?.page || 1,
        limit: params?.limit || 10,
        search: params?.search || "",
        role: params?.role || "",
        active: params?.active || "",
      },
    });

    return {
      data: response.data?.data || [],
      pagination: response.data?.pagination || {
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0,
      },
    };
  } catch (error: any) {
    return thunkAPI.rejectWithValue(
      error?.data?.message || error?.message || "Failed to fetch users",
    );
  }
});

const userSlice = createSlice({
  name: "users",
  initialState,
  reducers: {
    resetUsersState: (state) => {
      state.createLoading = false;
      state.createError = null;
      state.createdUser = null;
    },
    resetUsersListState: (state) => {
      state.listLoading = false;
      state.listError = null;
      state.list = [];
      state.pagination = {
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0,
      };
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createUser.pending, (state) => {
        state.createLoading = true;
        state.createError = null;
      })
      .addCase(createUser.fulfilled, (state, action) => {
        state.createLoading = false;
        state.createdUser = {
          ...action.payload.user,
          tempPassword: action.payload.tempPassword,
        };
      })
      .addCase(createUser.rejected, (state, action) => {
        state.createLoading = false;
        state.createError = action.payload || "Failed to create user";
      })

      .addCase(getUsers.pending, (state) => {
        state.listLoading = true;
        state.listError = null;
      })
      .addCase(getUsers.fulfilled, (state, action) => {
        state.listLoading = false;
        state.list = action.payload.data;
        state.pagination = action.payload.pagination;
      })
      .addCase(getUsers.rejected, (state, action) => {
        state.listLoading = false;
        state.listError = action.payload || "Failed to fetch users";
      });
  },
});

export const { resetUsersState, resetUsersListState } = userSlice.actions;
export default userSlice.reducer;
