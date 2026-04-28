import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { Client } from "../../shared/Utils/api-client";
import { withTenant } from "../../shared/Utils/utils";

export type PurchaseOrderStatus = "draft" | "approved" | "cancelled" | string;

export type PurchaseOrderItem = {
  id?: string;
  product_id?: string;
  product_name?: string;
  quantity?: number;
  rate?: number;
  discount?: number;
  amount?: number;
};

export type PurchaseOrder = {
  items_count: any;
  expected_delivery_date: any;
  assigned_to_name: any;
  assigned_to: any;
  id: string;
  tenant_id?: string;

  tally_guid?: string;
  voucher_number?: string;
  po_number?: string;

  voucher_date?: string;
  supplier_name?: string;
  supplier_gst?: string;
  reference_number?: string;

  total_amount?: number;
  status?: PurchaseOrderStatus;

  raw_tally_data?: any;

  created_at?: string;
  updated_at?: string;
  deleted_at?: string | null;

  items?: PurchaseOrderItem[];
};

export type GetPurchaseOrdersParams = {
  search?: string;
  status?: string;
  offset?: number;
  limit?: number;
};

export type CreatePurchaseOrderPayload = {
  voucher_number: string;
  voucher_date: string;
  supplier_name: string;
  supplier_gst?: string;
  reference_number?: string;
  total_amount: number;
  status?: PurchaseOrderStatus;
  raw_tally_data?: any;
  items?: PurchaseOrderItem[];
};

export type UpdatePurchaseOrderPayload = Partial<CreatePurchaseOrderPayload> & {
  id: string;
};

type PurchaseOrdersState = {
  list: PurchaseOrder[];
  selected: PurchaseOrder | null;

  loading: boolean;
  detailLoading: boolean;
  createLoading: boolean;
  updateLoading: boolean;
  deleteLoading: boolean;

  total: number;
  offset: number;
  limit: number;

  error: string | null;
};

const initialState: PurchaseOrdersState = {
  list: [],
  selected: null,

  loading: false,
  detailLoading: false,
  createLoading: false,
  updateLoading: false,
  deleteLoading: false,

  total: 0,
  offset: 0,
  limit: 10,

  error: null,
};

export const fetchPurchaseOrders = createAsyncThunk(
  "purchaseOrders/fetchPurchaseOrders",
  async (params: GetPurchaseOrdersParams = {}, { rejectWithValue }) => {
    try {
      const res = await Client.get(withTenant("/purchase-orders"), {
        params,
      });

      return res.data;
    } catch (error: any) {
      return rejectWithValue(
        error?.response?.data?.message || "Failed to fetch purchase orders",
      );
    }
  },
);

export const getPurchaseOrderById = createAsyncThunk(
  "purchaseOrders/getPurchaseOrderById",
  async (id: string, { rejectWithValue }) => {
    try {
      const res = await Client.get(withTenant(`/purchase-orders/${id}`));
      return res.data?.data;
    } catch (error: any) {
      return rejectWithValue(
        error?.response?.data?.message || "Failed to fetch purchase order",
      );
    }
  },
);

export const createPurchaseOrder = createAsyncThunk(
  "purchaseOrders/createPurchaseOrder",
  async (payload: CreatePurchaseOrderPayload, { rejectWithValue }) => {
    try {
      const res = await Client.post(withTenant("/purchase-orders"), payload);
      return res.data;
    } catch (error: any) {
      return rejectWithValue(
        error?.response?.data?.message || "Failed to create purchase order",
      );
    }
  },
);

export const updatePurchaseOrder = createAsyncThunk(
  "purchaseOrders/updatePurchaseOrder",
  async (
    { id, ...payload }: UpdatePurchaseOrderPayload,
    { rejectWithValue },
  ) => {
    try {
      const res = await Client.patch(
        withTenant(`/purchase-orders/${id}`),
        payload,
      );

      return res.data?.data;
    } catch (error: any) {
      return rejectWithValue(
        error?.response?.data?.message || "Failed to update purchase order",
      );
    }
  },
);

export const deletePurchaseOrder = createAsyncThunk(
  "purchaseOrders/deletePurchaseOrder",
  async (id: string, { rejectWithValue }) => {
    try {
      await Client.delete(withTenant(`/purchase-orders/${id}`));
      return id;
    } catch (error: any) {
      return rejectWithValue(
        error?.response?.data?.message || "Failed to delete purchase order",
      );
    }
  },
);

const purchaseOrdersSlice = createSlice({
  name: "purchaseOrders",
  initialState,
  reducers: {
    resetPurchaseOrdersState: () => initialState,

    resetPurchaseOrdersListState: (state) => {
      state.list = [];
      state.total = 0;
      state.offset = 0;
      state.limit = 10;
      state.error = null;
    },

    resetSelectedPurchaseOrder: (state) => {
      state.selected = null;
      state.detailLoading = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // LIST
      .addCase(fetchPurchaseOrders.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPurchaseOrders.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload?.data || [];
        state.total = action.payload?.total || 0;
        state.offset = action.payload?.offset || 0;
        state.limit = action.payload?.limit || 10;
      })
      .addCase(fetchPurchaseOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // DETAILS
      .addCase(getPurchaseOrderById.pending, (state) => {
        state.detailLoading = true;
        state.error = null;
      })
      .addCase(getPurchaseOrderById.fulfilled, (state, action) => {
        state.detailLoading = false;
        state.selected = action.payload || null;
      })
      .addCase(getPurchaseOrderById.rejected, (state, action) => {
        state.detailLoading = false;
        state.error = action.payload as string;
      })

      // CREATE
      .addCase(createPurchaseOrder.pending, (state) => {
        state.createLoading = true;
        state.error = null;
      })
      .addCase(createPurchaseOrder.fulfilled, (state, action) => {
        state.createLoading = false;

        if (action.payload) {
          state.list = [action.payload, ...state.list];
          state.total += 1;
        }
      })
      .addCase(createPurchaseOrder.rejected, (state, action) => {
        state.createLoading = false;
        state.error = action.payload as string;
      })

      // UPDATE
      .addCase(updatePurchaseOrder.pending, (state) => {
        state.updateLoading = true;
        state.error = null;
      })
      .addCase(updatePurchaseOrder.fulfilled, (state, action) => {
        state.updateLoading = false;

        const updated = action.payload;

        if (updated?.id) {
          state.list = state.list.map((item) =>
            item.id === updated.id ? { ...item, ...updated } : item,
          );

          if (state.selected?.id === updated.id) {
            state.selected = {
              ...state.selected,
              ...updated,
            };
          }
        }
      })
      .addCase(updatePurchaseOrder.rejected, (state, action) => {
        state.updateLoading = false;
        state.error = action.payload as string;
      })

      // DELETE
      .addCase(deletePurchaseOrder.pending, (state) => {
        state.deleteLoading = true;
        state.error = null;
      })
      .addCase(deletePurchaseOrder.fulfilled, (state, action) => {
        state.deleteLoading = false;
        state.list = state.list.filter((item) => item.id !== action.payload);
        state.total = Math.max(0, state.total - 1);

        if (state.selected?.id === action.payload) {
          state.selected = null;
        }
      })
      .addCase(deletePurchaseOrder.rejected, (state, action) => {
        state.deleteLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const {
  resetPurchaseOrdersState,
  resetPurchaseOrdersListState,
  resetSelectedPurchaseOrder,
} = purchaseOrdersSlice.actions;

export default purchaseOrdersSlice.reducer;
