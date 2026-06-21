import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { Client } from "../../shared/Utils/api-client";
import {
  cleanExportParams,
  downloadBlobResponse,
} from "../../shared/Utils/download-file";
import { withTenant } from "../../shared/Utils/utils";

export type ExportModuleKey =
  | "leads"
  | "contacts"
  | "organizations"
  | "quotes"
  | "visits";

type ExportPayload = {
  moduleKey: ExportModuleKey;
  params?: Record<string, any>;
};

type TableExportState = {
  loadingByModule: Partial<Record<ExportModuleKey, boolean>>;
};

const initialState: TableExportState = {
  loadingByModule: {},
};

const filenameMap: Record<ExportModuleKey, string> = {
  leads: "leads.xlsx",
  contacts: "contacts.xlsx",
  organizations: "organizations.xlsx",
  quotes: "quotes.xlsx",
  visits: "visits.xlsx",
};

export const exportTableToExcel = createAsyncThunk(
  "tableExport/exportTableToExcel",
  async (payload: ExportPayload) => {
    const response = await Client.get(
      withTenant(`/${payload.moduleKey}/export`),
      {
        params: cleanExportParams(payload.params),
        responseType: "blob",
      },
    );

    downloadBlobResponse(response, filenameMap[payload.moduleKey]);

    return payload.moduleKey;
  },
);

const tableExportSlice = createSlice({
  name: "tableExport",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(exportTableToExcel.pending, (state, action) => {
        state.loadingByModule[action.meta.arg.moduleKey] = true;
      })
      .addCase(exportTableToExcel.fulfilled, (state, action) => {
        state.loadingByModule[action.payload] = false;
      })
      .addCase(exportTableToExcel.rejected, (state, action) => {
        state.loadingByModule[action.meta.arg.moduleKey] = false;
      });
  },
});

export default tableExportSlice.reducer;
