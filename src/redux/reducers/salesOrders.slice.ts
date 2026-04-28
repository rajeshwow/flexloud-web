import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { Client } from "../../shared/Utils/api-client";
import { withTenant } from "../../shared/Utils/utils";

export type SalesOrderItem = {
  product_id: string;
  sku?: string;
  product_name?: string;
  quantity: number;
  price: number;
  discount: number;
  tax: number;
  amount?: number;
};

export type SalesOrderPayload = {
  so_date?: string;
  expected_delivery_date?: string | null;
  customer_id: string;
  contact_id?: string | null;
  assigned_to?: string | null;
  currency?: string;
  status?: string;
  subtotal?: number;
  discount?: number;
  tax?: number;
  shipping?: number;
  grand_total?: number;
  notes?: string | null;
  terms?: string | null;
  items: SalesOrderItem[];
};

type State = {
  list: any[];
  detail: any | null;
  total: number;
  loading: boolean;
  detailLoading: boolean;
};

const initialState: State = {
  list: [],
  detail: null,
  total: 0,
  loading: false,
  detailLoading: false,
};

export const fetchSalesOrders = createAsyncThunk(
  "salesOrders/fetch",
  async (params: any = {}) => {
    const res = await Client.get(withTenant("/sales-orders"), { params });
    return res.data;
  },
);

export const fetchSalesOrderById = createAsyncThunk(
  "salesOrders/fetchById",
  async (id: any) => {
    const res = await Client.get(withTenant(`/sales-orders/${id}`));
    return res.data;
  },
);

export const createSalesOrder = createAsyncThunk(
  "salesOrders/create",
  async (payload: SalesOrderPayload) => {
    const res = await Client.post(withTenant("/sales-orders"), payload);
    return res.data;
  },
);

export const updateSalesOrder = createAsyncThunk(
  "salesOrders/update",
  async ({
    id,
    payload,
  }: {
    id: string;
    payload: Partial<SalesOrderPayload>;
  }) => {
    const res = await Client.patch(withTenant(`/sales-orders/${id}`), payload);
    return res.data;
  },
);

export const deleteSalesOrder = createAsyncThunk(
  "salesOrders/delete",
  async (id: string) => {
    const res = await Client.delete(withTenant(`/sales-orders/${id}`));
    return res.data;
  },
);

const salesOrdersSlice = createSlice({
  name: "salesOrders",
  initialState,
  reducers: {
    resetSalesOrderDetail: (state) => {
      state.detail = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchSalesOrders.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchSalesOrders.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload?.data || [];
        state.total = action.payload?.total || 0;
      })
      .addCase(fetchSalesOrders.rejected, (state) => {
        state.loading = false;
      })

      .addCase(fetchSalesOrderById.pending, (state) => {
        state.detailLoading = true;
      })
      .addCase(fetchSalesOrderById.fulfilled, (state, action) => {
        state.detailLoading = false;
        state.detail = action.payload?.data || null;
      })
      .addCase(fetchSalesOrderById.rejected, (state) => {
        state.detailLoading = false;
      });
  },
});

export const { resetSalesOrderDetail } = salesOrdersSlice.actions;
export default salesOrdersSlice.reducer;
