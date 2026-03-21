import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { Client } from "../../shared/Utils/api-client";
import { withTenant } from "../../shared/Utils/utils";

export type ImportModule = "contacts" | "leads";
export type DuplicateMode = "skip" | "update" | "allow";

export type ImportTemplateField = {
  key: string;
  label: string;
  required: boolean;
  type: string;
  enumValues?: string[];
  sampleValue?: string | number | boolean;
};

export type ImportTemplateMeta = {
  module: string;
  label: string;
  sampleFileName: string;
  uniqueBy: string[];
  requiredAtLeastOneOf: string[];
  fields: ImportTemplateField[];
};

export type ImportRowError = {
  rowNumber: number;
  field?: string;
  message: string;
  rawData?: Record<string, any>;
};

export type ValidateImportResponse = {
  module: string;
  fileName: string;
  totalRows: number;
  validRows: number;
  invalidRows: number;
  foundHeaders: string[];
  missingHeaders: string[];
  extraHeaders: string[];
  errors: ImportRowError[];
};

export type ExecuteImportResponse = {
  importJobId: string;
  module: string;
  totalRows: number;
  validRows: number;
  importedRows: number;
  skippedRows: number;
  failedRows: number;
  foundHeaders: string[];
  missingHeaders: string[];
  extraHeaders: string[];
  validationErrors: ImportRowError[];
  duplicateErrors: ImportRowError[];
  runtimeErrors: ImportRowError[];
};

type DownloadSamplePayload = {
  module: ImportModule;
};

type GetTemplatePayload = {
  module: ImportModule;
};

type ValidateImportPayload = {
  module: ImportModule;
  file: File | Blob;
  duplicateMode: DuplicateMode;
};

type ExecuteImportPayload = {
  module: ImportModule;
  file: File | Blob;
  duplicateMode: DuplicateMode;
};

type ImportsState = {
  templateMeta: ImportTemplateMeta | null;
  validationResult: ValidateImportResponse | null;
  executeResult: ExecuteImportResponse | null;

  loadingTemplate: boolean;
  downloadingSample: boolean;
  validatingImport: boolean;
  executingImport: boolean;

  error: string | null;
};

const initialState: ImportsState = {
  templateMeta: null,
  validationResult: null,
  executeResult: null,

  loadingTemplate: false,
  downloadingSample: false,
  validatingImport: false,
  executingImport: false,

  error: null,
};

export const getImportTemplateMeta = createAsyncThunk(
  "imports/getImportTemplateMeta",
  async ({ module }: GetTemplatePayload, { rejectWithValue }) => {
    try {
      const res = await Client.get(withTenant(`/imports/${module}/template`));
      return res?.data;
    } catch (error: any) {
      return rejectWithValue(
        error?.response?.data?.message || "Failed to load template info",
      );
    }
  },
);

export const downloadImportSampleFile = createAsyncThunk(
  "imports/downloadImportSampleFile",
  async ({ module }: { module: string }, thunkAPI) => {
    try {
      const response = await Client.get(
        withTenant(`/imports/${module}/sample-file?ts=${Date.now()}`),
        {
          responseType: "blob",
          headers: {
            Accept: "text/csv",
            "Cache-Control": "no-cache",
            Pragma: "no-cache",
          },
        },
      );

      return {
        blob: response.data,
        fileName: `${module}_import_sample.csv`,
        contentType:
          response.headers.get("content-type") || "text/csv;charset=utf-8;",
      };
    } catch (error: any) {
      return thunkAPI.rejectWithValue(
        error?.data || {
          message: error?.message || "Failed to download sample file",
        },
      );
    }
  },
);

export const validateImportFile = createAsyncThunk(
  "imports/validateImportFile",
  async (
    { module, file, duplicateMode }: ValidateImportPayload,
    { rejectWithValue },
  ) => {
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("duplicateMode", duplicateMode);

      const res = await Client.post(
        withTenant(`/imports/${module}/validate`),
        formData,
        {
          isFormData: true,
        },
      );

      return res?.data;
    } catch (error: any) {
      return rejectWithValue(
        error?.response?.data?.message || "Validation failed",
      );
    }
  },
);

export const executeImportFile = createAsyncThunk(
  "imports/executeImportFile",
  async (
    { module, file, duplicateMode }: ExecuteImportPayload,
    { rejectWithValue },
  ) => {
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("duplicateMode", duplicateMode);

      const res = await Client.post(
        withTenant(`/imports/${module}/execute`),
        formData,
        {
          isFormData: true,
        },
      );

      return res?.data;
    } catch (error: any) {
      return rejectWithValue(error?.response?.data?.message || "Import failed");
    }
  },
);

const importsSlice = createSlice({
  name: "imports",
  initialState,
  reducers: {
    resetImportsState: () => initialState,
    resetImportTemplateState: (state) => {
      state.templateMeta = null;
      state.loadingTemplate = false;
      state.downloadingSample = false;
      state.error = null;
    },
    resetImportValidationState: (state) => {
      state.validationResult = null;
      state.validatingImport = false;
      state.error = null;
    },
    resetImportExecuteState: (state) => {
      state.executeResult = null;
      state.executingImport = false;
      state.error = null;
    },
    clearImportsError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getImportTemplateMeta.pending, (state) => {
        state.loadingTemplate = true;
        state.error = null;
      })
      .addCase(getImportTemplateMeta.fulfilled, (state, action) => {
        state.loadingTemplate = false;
        state.templateMeta = action.payload;
      })
      .addCase(getImportTemplateMeta.rejected, (state, action) => {
        state.loadingTemplate = false;
        state.error = action.payload as string;
      });

    builder
      .addCase(downloadImportSampleFile.pending, (state) => {
        state.downloadingSample = true;
        state.error = null;
      })
      .addCase(downloadImportSampleFile.fulfilled, (state) => {
        state.downloadingSample = false;
      })
      .addCase(downloadImportSampleFile.rejected, (state, action) => {
        state.downloadingSample = false;
        state.error = action.payload as string;
      });

    builder
      .addCase(validateImportFile.pending, (state) => {
        state.validatingImport = true;
        state.validationResult = null;
        state.executeResult = null;
        state.error = null;
      })
      .addCase(validateImportFile.fulfilled, (state, action) => {
        state.validatingImport = false;
        state.validationResult = action.payload;
      })
      .addCase(validateImportFile.rejected, (state, action) => {
        state.validatingImport = false;
        state.validationResult = null;
        state.error = action.payload as string;
      });

    builder
      .addCase(executeImportFile.pending, (state) => {
        state.executingImport = true;
        state.error = null;
      })
      .addCase(executeImportFile.fulfilled, (state, action) => {
        state.executingImport = false;
        state.executeResult = action.payload;
      })
      .addCase(executeImportFile.rejected, (state, action) => {
        state.executingImport = false;
        state.error = action.payload as string;
      });
  },
});

export const {
  resetImportsState,
  resetImportTemplateState,
  resetImportValidationState,
  resetImportExecuteState,
  clearImportsError,
} = importsSlice.actions;

export default importsSlice.reducer;
