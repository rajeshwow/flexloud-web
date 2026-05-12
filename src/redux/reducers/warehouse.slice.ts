import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { Client } from "../../shared/Utils/api-client";
import { withTenant } from "../../shared/Utils/utils";

export type WarehouseType = "po" | "so";

export type WarehouseItem = {
  id: string;
  type: WarehouseType;
  number: string;
  status: string;
  party_name?: string;
  ref_number?: string;
  action_at?: string;
  created_at?: string;
};

type WarehouseState = {
  list: WarehouseItem[];
  total: number;
  loading: boolean;
  detailLoading: boolean;
  saving: boolean;
  selected: any;
  error: string | null;
};

export type WarehouseSalesOrderItem = {
  id: string;
  so_number?: string;
  customer_name?: string;
  status?: string;
  so_date?: string;
  expected_delivery_date?: string;
  grand_total?: number;
  items_count?: number;
  items_summary?: string;
  assigned_to_name?: string;
  courier_name?: string;
  awb_number?: string;
};

export type WarehousePurchaseOrderItem = {
  id: string;
  po_number?: string;
  vendor_name?: string;
  status?: string;
  po_date?: string;
  expected_delivery_date?: string;
  grand_total?: number;
  items_count?: number;
  items_summary?: string;
  assigned_to_name?: string;
  courier_name?: string;
  awb_number?: string;
};

const initialState: WarehouseState = {
  list: [],
  total: 0,
  loading: false,
  detailLoading: false,
  saving: false,
  selected: null,
  error: null,
};

export const fetchWarehouseSalesOrders = createAsyncThunk(
  "warehouse/fetchWarehouseSalesOrders",
  async (params: any = {}) => {
    const res = await Client.get(withTenant("/warehouse/sales-orders"), {
      params,
    });
    return res.data;
  },
);

export const fetchWarehousePurchaseOrders = createAsyncThunk(
  "warehouse/fetchWarehousePurchaseOrders",
  async (params: any = {}) => {
    const res = await Client.get(withTenant("/warehouse/purchase-orders"), {
      params,
    });
    return res.data;
  },
);

export const fetchWarehouseList = createAsyncThunk(
  "warehouse/fetchWarehouseList",
  async (params: any = {}) => {
    const res = await Client.get(withTenant("/warehouse"), { params });
    return res.data;
  },
);

export const fetchPoForReceiving = createAsyncThunk(
  "warehouse/fetchPoForReceiving",
  async (id: string) => {
    const res = await Client.get(withTenant(`/warehouse/po/${id}/receive`));
    return res.data;
  },
);

export const fetchSoForDispatch = createAsyncThunk(
  "warehouse/fetchSoForDispatch",
  async (id: string) => {
    const res = await Client.get(withTenant(`/warehouse/so/${id}/dispatch`));
    return res.data;
  },
);

export const createPoReceipt = createAsyncThunk(
  "warehouse/createPoReceipt",
  async (payload: any) => {
    const res = await Client.post(withTenant("/warehouse/po/receive"), payload);
    return res.data;
  },
);

export const createSoDispatch = createAsyncThunk(
  "warehouse/createSoDispatch",
  async (payload: any) => {
    const res = await Client.post(
      withTenant("/warehouse/so/dispatch"),
      payload,
    );
    return res.data;
  },
);

export const updateWarehouseReceiptStatus = createAsyncThunk(
  "warehouse/updateWarehouseReceiptStatus",
  async ({ id, body }: { id: string; body: any }) => {
    const res = await Client.patch(
      withTenant(`/warehouse/po/receipts/${id}/status`),
      body,
    );
    return res.data;
  },
);

export const updateWarehouseDispatchStatus = createAsyncThunk(
  "warehouse/updateWarehouseDispatchStatus",
  async ({ id, body }: { id: string; body: any }) => {
    const res = await Client.patch(
      withTenant(`/warehouse/so/dispatches/${id}/status`),
      body,
    );
    return res.data;
  },
);

const warehouseSlice = createSlice({
  name: "warehouse",
  initialState: {
    ...initialState,
    salesOrders: [] as WarehouseSalesOrderItem[],
    purchaseOrders: [] as WarehousePurchaseOrderItem[],
    salesOrdersTotal: 0,
    purchaseOrdersTotal: 0,
  },

  reducers: {
    resetWarehouseSelected(state) {
      state.selected = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchWarehouseList.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchWarehouseList.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload?.data || [];
        state.total = action.payload?.total || 0;
      })
      .addCase(fetchWarehouseList.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to fetch warehouse list";
      })

      .addCase(fetchPoForReceiving.pending, (state) => {
        state.detailLoading = true;
      })
      .addCase(fetchPoForReceiving.fulfilled, (state, action) => {
        state.detailLoading = false;
        state.selected = action.payload;
      })
      .addCase(fetchPoForReceiving.rejected, (state, action) => {
        state.detailLoading = false;
        state.error = action.error.message || "Failed to fetch PO";
      })

      .addCase(fetchWarehouseSalesOrders.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchWarehouseSalesOrders.fulfilled, (state, action) => {
        state.loading = false;
        state.salesOrders = action.payload?.data || [];
        state.salesOrdersTotal = action.payload?.total || 0;
      })
      .addCase(fetchWarehouseSalesOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to fetch sales orders";
      })

      .addCase(fetchWarehousePurchaseOrders.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchWarehousePurchaseOrders.fulfilled, (state, action) => {
        state.loading = false;
        state.purchaseOrders = action.payload?.data || [];
        state.purchaseOrdersTotal = action.payload?.total || 0;
      })
      .addCase(fetchWarehousePurchaseOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to fetch purchase orders";
      })

      .addCase(fetchSoForDispatch.pending, (state) => {
        state.detailLoading = true;
      })
      .addCase(fetchSoForDispatch.fulfilled, (state, action) => {
        state.detailLoading = false;
        state.selected = action.payload;
      })
      .addCase(fetchSoForDispatch.rejected, (state, action) => {
        state.detailLoading = false;
        state.error = action.error.message || "Failed to fetch SO";
      })

      .addCase(createPoReceipt.pending, (state) => {
        state.saving = true;
      })
      .addCase(createPoReceipt.fulfilled, (state) => {
        state.saving = false;
      })
      .addCase(createPoReceipt.rejected, (state) => {
        state.saving = false;
      })

      .addCase(createSoDispatch.pending, (state) => {
        state.saving = true;
      })
      .addCase(createSoDispatch.fulfilled, (state) => {
        state.saving = false;
      })
      .addCase(createSoDispatch.rejected, (state) => {
        state.saving = false;
      });
  },
});

export const { resetWarehouseSelected } = warehouseSlice.actions;
export default warehouseSlice.reducer;
