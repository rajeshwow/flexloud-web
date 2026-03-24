import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { Client } from "../../shared/Utils/api-client";
import { withTenant } from "../../shared/Utils/utils";

export type MasterTypeItem = {
  id: string;
  tenant_id: string;
  code: string;
  name: string;
  description: string | null;
  module_name: string | null;
  is_system: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type MasterValueItem = {
  id: string;
  tenant_id: string;
  master_type_id: string;
  label: string;
  value: string;
  description: string | null;
  color: string | null;
  parent_id: string | null;
  parent_label?: string | null;
  parent_value?: string | null;
  master_type_code?: string;
  master_type_name?: string;
  is_default: boolean;
  is_system: boolean;
  is_active: boolean;
  sort_order: number;
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
};

export type GetMasterTypesParams = {
  search?: string;
  module_name?: string;
  is_active?: boolean;
};

export type CreateMasterTypePayload = {
  code: string;
  name: string;
  description?: string | null;
  module_name?: string | null;
  is_active?: boolean;
};

export type UpdateMasterTypePayload = {
  id: string;
  data: {
    name?: string;
    description?: string | null;
    module_name?: string | null;
    is_active?: boolean;
  };
};

export type GetMasterValuesParams = {
  type_code?: string;
  master_type_id?: string;
  search?: string;
  parent_id?: string;
  parent_value?: string;
  is_active?: boolean;
  page?: number;
  limit?: number;
};

export type CreateMasterValuePayload = {
  master_type_id?: string;
  type_code?: string;
  label: string;
  value: string;
  description?: string | null;
  color?: string | null;
  parent_id?: string | null;
  is_default?: boolean;
  is_active?: boolean;
  sort_order?: number;
  metadata?: Record<string, any>;
};

export type UpdateMasterValuePayload = {
  id: string;
  data: {
    label?: string;
    value?: string;
    description?: string | null;
    color?: string | null;
    parent_id?: string | null;
    is_default?: boolean;
    is_active?: boolean;
    sort_order?: number;
    metadata?: Record<string, any>;
  };
};

type MastersState = {
  masterTypes: MasterTypeItem[];
  masterValues: Record<string, MasterValueItem[]>;

  masterTypesLoading: boolean;
  masterValuesLoading: boolean;

  createMasterTypeLoading: boolean;
  updateMasterTypeLoading: boolean;

  createMasterValueLoading: boolean;
  updateMasterValueLoading: boolean;
  deleteMasterValueLoading: boolean;

  lastFetchedTypeCode: string | null;
  lastFetchedMasterTypeId: string | null;

  error: string | null;
  success: string | null;
};

const initialState: MastersState = {
  masterTypes: [],
  masterValues: {},

  masterTypesLoading: false,
  masterValuesLoading: false,

  createMasterTypeLoading: false,
  updateMasterTypeLoading: false,

  createMasterValueLoading: false,
  updateMasterValueLoading: false,
  deleteMasterValueLoading: false,

  lastFetchedTypeCode: null,
  lastFetchedMasterTypeId: null,

  error: null,
  success: null,
};

function buildQueryParams(params?: Record<string, any>) {
  const searchParams = new URLSearchParams();

  if (!params) return searchParams.toString();

  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") {
      return;
    }

    if (typeof value === "boolean") {
      searchParams.append(key, String(value));
      return;
    }

    searchParams.append(key, String(value));
  });

  return searchParams.toString();
}

function extractErrorMessage(error: any) {
  return (
    error?.response?.data?.message || error?.message || "Something went wrong."
  );
}

function sortMasterValues(values: MasterValueItem[]) {
  return [...values].sort((a, b) => {
    if (a.sort_order !== b.sort_order) {
      return a.sort_order - b.sort_order;
    }
    return a.label.localeCompare(b.label);
  });
}

export const fetchMasterTypes = createAsyncThunk<
  { data: MasterTypeItem[]; params?: GetMasterTypesParams },
  GetMasterTypesParams | undefined,
  { rejectValue: string }
>("masters/fetchMasterTypes", async (params, { rejectWithValue }) => {
  try {
    const query = buildQueryParams(params);
    const url = query
      ? withTenant(`/masters/types?${query}`)
      : withTenant("/masters/types");

    const res = await Client.get(url);

    return {
      data: res?.data?.data ?? [],
      params,
    };
  } catch (error: any) {
    return rejectWithValue(extractErrorMessage(error));
  }
});

export const createMasterType = createAsyncThunk<
  MasterTypeItem,
  CreateMasterTypePayload,
  { rejectValue: string }
>("masters/createMasterType", async (payload, { rejectWithValue }) => {
  try {
    const res = await Client.post(withTenant("/masters/types"), payload);
    return res?.data?.data;
  } catch (error: any) {
    return rejectWithValue(extractErrorMessage(error));
  }
});

export const updateMasterType = createAsyncThunk<
  MasterTypeItem,
  UpdateMasterTypePayload,
  { rejectValue: string }
>("masters/updateMasterType", async ({ id, data }, { rejectWithValue }) => {
  try {
    const res = await Client.patch(withTenant(`/masters/types/${id}`), data);
    return res?.data?.data;
  } catch (error: any) {
    return rejectWithValue(extractErrorMessage(error));
  }
});

export const fetchMasterValues = createAsyncThunk<
  {
    data: MasterValueItem[];
    params?: GetMasterValuesParams;
  },
  GetMasterValuesParams,
  { rejectValue: string }
>("masters/fetchMasterValues", async (params, { rejectWithValue }) => {
  try {
    const query = buildQueryParams(params);
    const url = query
      ? withTenant(`/masters/values?${query}`)
      : withTenant("/masters/values");

    const res = await Client.get(url);

    return {
      data: res?.data?.data ?? [],
      params,
    };
  } catch (error: any) {
    return rejectWithValue(extractErrorMessage(error));
  }
});

export const createMasterValue = createAsyncThunk<
  MasterValueItem,
  CreateMasterValuePayload,
  { rejectValue: string }
>("masters/createMasterValue", async (payload, { rejectWithValue }) => {
  try {
    const res = await Client.post(withTenant("/masters/values"), payload);
    return res?.data?.data;
  } catch (error: any) {
    return rejectWithValue(extractErrorMessage(error));
  }
});

export const updateMasterValue = createAsyncThunk<
  MasterValueItem,
  UpdateMasterValuePayload,
  { rejectValue: string }
>("masters/updateMasterValue", async ({ id, data }, { rejectWithValue }) => {
  try {
    const res = await Client.patch(withTenant(`/masters/values/${id}`), data);
    return res?.data?.data;
  } catch (error: any) {
    return rejectWithValue(extractErrorMessage(error));
  }
});

export const deleteMasterValue = createAsyncThunk<
  { id: string },
  string,
  { rejectValue: string }
>("masters/deleteMasterValue", async (id, { rejectWithValue }) => {
  try {
    await Client.delete(withTenant(`/masters/values/${id}`));
    return { id };
  } catch (error: any) {
    return rejectWithValue(extractErrorMessage(error));
  }
});

const mastersSlice = createSlice({
  name: "masters",
  initialState,
  reducers: {
    resetMastersState: (state) => {
      state.error = null;
      state.success = null;

      state.createMasterTypeLoading = false;
      state.updateMasterTypeLoading = false;
      state.createMasterValueLoading = false;
      state.updateMasterValueLoading = false;
      state.deleteMasterValueLoading = false;
    },

    resetMasterTypesListState: (state) => {
      state.masterTypes = [];
      state.masterTypesLoading = false;
      state.error = null;
    },

    resetMasterValuesListState: (state) => {
      state.masterValues = {};
      state.masterValuesLoading = false;
      state.lastFetchedTypeCode = null;
      state.lastFetchedMasterTypeId = null;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMasterTypes.pending, (state) => {
        state.masterTypesLoading = true;
        state.error = null;
      })
      .addCase(fetchMasterTypes.fulfilled, (state, action) => {
        state.masterTypesLoading = false;
        state.masterTypes = action.payload.data ?? [];
      })
      .addCase(fetchMasterTypes.rejected, (state, action) => {
        state.masterTypesLoading = false;
        state.error = action.payload ?? "Failed to fetch master types.";
      })

      .addCase(createMasterType.pending, (state) => {
        state.createMasterTypeLoading = true;
        state.error = null;
        state.success = null;
      })
      .addCase(createMasterType.fulfilled, (state, action) => {
        state.createMasterTypeLoading = false;
        state.success = "Master type created successfully.";

        const exists = state.masterTypes.some(
          (item) => item.id === action.payload.id,
        );

        if (!exists) {
          state.masterTypes.push(action.payload);
          state.masterTypes.sort((a, b) => a.name.localeCompare(b.name));
        }
      })
      .addCase(createMasterType.rejected, (state, action) => {
        state.createMasterTypeLoading = false;
        state.error = action.payload ?? "Failed to create master type.";
      })

      .addCase(updateMasterType.pending, (state) => {
        state.updateMasterTypeLoading = true;
        state.error = null;
        state.success = null;
      })
      .addCase(updateMasterType.fulfilled, (state, action) => {
        state.updateMasterTypeLoading = false;
        state.success = "Master type updated successfully.";

        state.masterTypes = state.masterTypes
          .map((item) =>
            item.id === action.payload.id ? action.payload : item,
          )
          .sort((a, b) => a.name.localeCompare(b.name));
      })
      .addCase(updateMasterType.rejected, (state, action) => {
        state.updateMasterTypeLoading = false;
        state.error = action.payload ?? "Failed to update master type.";
      })

      .addCase(fetchMasterValues.pending, (state) => {
        state.masterValuesLoading = true;
        state.error = null;
      })
      .addCase(fetchMasterValues.fulfilled, (state, action) => {
        state.masterValuesLoading = false;

        const typeCode = action.payload.params?.type_code;

        if (typeCode) {
          state.masterValues[typeCode] = sortMasterValues(
            action.payload.data ?? [],
          );
        }

        state.lastFetchedTypeCode = typeCode ?? null;
        state.lastFetchedMasterTypeId =
          action.payload.params?.master_type_id ?? null;
      })
      .addCase(fetchMasterValues.rejected, (state, action) => {
        state.masterValuesLoading = false;
        state.error = action.payload ?? "Failed to fetch master values.";
      })

      .addCase(createMasterValue.pending, (state) => {
        state.createMasterValueLoading = true;
        state.error = null;
        state.success = null;
      })
      .addCase(createMasterValue.fulfilled, (state, action) => {
        state.createMasterValueLoading = false;
        state.success = "Master value created successfully.";

        const typeCode = action.payload.master_type_code;

        if (!typeCode) return;

        const existingList = state.masterValues[typeCode] || [];
        const exists = existingList.some(
          (item) => item.id === action.payload.id,
        );

        if (!exists) {
          state.masterValues[typeCode] = sortMasterValues([
            ...existingList,
            action.payload,
          ]);
        }
      })
      .addCase(createMasterValue.rejected, (state, action) => {
        state.createMasterValueLoading = false;
        state.error = action.payload ?? "Failed to create master value.";
      })

      .addCase(updateMasterValue.pending, (state) => {
        state.updateMasterValueLoading = true;
        state.error = null;
        state.success = null;
      })
      .addCase(updateMasterValue.fulfilled, (state, action) => {
        state.updateMasterValueLoading = false;
        state.success = "Master value updated successfully.";

        const typeCode = action.payload.master_type_code;

        if (!typeCode) return;

        const existingList = state.masterValues[typeCode] || [];

        state.masterValues[typeCode] = sortMasterValues(
          existingList.map((item) =>
            item.id === action.payload.id ? action.payload : item,
          ),
        );
      })
      .addCase(updateMasterValue.rejected, (state, action) => {
        state.updateMasterValueLoading = false;
        state.error = action.payload ?? "Failed to update master value.";
      })

      .addCase(deleteMasterValue.pending, (state) => {
        state.deleteMasterValueLoading = true;
        state.error = null;
        state.success = null;
      })
      .addCase(deleteMasterValue.fulfilled, (state, action) => {
        state.deleteMasterValueLoading = false;
        state.success = "Master value deleted successfully.";

        Object.keys(state.masterValues).forEach((typeCode) => {
          state.masterValues[typeCode] = state.masterValues[typeCode].filter(
            (item) => item.id !== action.payload.id,
          );
        });
      })
      .addCase(deleteMasterValue.rejected, (state, action) => {
        state.deleteMasterValueLoading = false;
        state.error = action.payload ?? "Failed to delete master value.";
      });
  },
});

export const {
  resetMastersState,
  resetMasterTypesListState,
  resetMasterValuesListState,
} = mastersSlice.actions;

export default mastersSlice.reducer;
