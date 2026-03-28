import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { Client } from "../../shared/Utils/api-client";
import { withTenant } from "../../shared/Utils/utils";

export type AIInsightData = {
  summary: string;
  priority: "hot" | "warm" | "cold";
  sentiment: "positive" | "neutral" | "negative";
  confidence: number;
  risk_flags: string[];
  next_best_actions: string[];
  suggested_task: {
    title: string;
    due_in_days: number;
    note: string;
  } | null;
  generated_at?: string;
  is_cached?: boolean;
};

export type AIFollowupData = {
  subject: string;
  message: string;
  channel: "email" | "whatsapp";
};

export type AIActivitySummaryData = {
  summary: string;
  key_points: string[];
  recommended_next_step: string;
};

type AIAssistantState = {
  insightsByKey: Record<string, AIInsightData>;
  followupDraft: AIFollowupData | null;
  activitySummary: AIActivitySummaryData | null;
  insightsLoading: boolean;
  followupLoading: boolean;
  summaryLoading: boolean;
  error: string | null;
};

const initialState: AIAssistantState = {
  insightsByKey: {},
  followupDraft: null,
  activitySummary: null,
  insightsLoading: false,
  followupLoading: false,
  summaryLoading: false,
  error: null,
};

const makeKey = (entityType: string, entityId: string) =>
  `${entityType}:${entityId}`;

export const fetchAIInsights = createAsyncThunk(
  "aiAssistant/fetchAIInsights",
  async (payload: {
    entityType: string;
    entityId: string;
    forceRefresh?: boolean;
  }) => {
    const response = await Client.get(withTenant("/ai-assistant/insights"), {
      params: {
        entity_type: payload.entityType,
        entity_id: payload.entityId,
        force_refresh: payload.forceRefresh || false,
      },
    });
    return {
      key: makeKey(payload.entityType, payload.entityId),
      data: response.data.data as AIInsightData,
    };
  },
);

export const generateAIFollowup = createAsyncThunk(
  "aiAssistant/generateAIFollowup",
  async (payload: {
    entityType: string;
    entityId: string;
    channel: "email" | "whatsapp";
  }) => {
    const response = await Client.post(
      withTenant("/ai-assistant/generate-followup"),
      {
        entity_type: payload.entityType,
        entity_id: payload.entityId,
        channel: payload.channel,
      },
    );
    return response.data.data as AIFollowupData;
  },
);

export const summarizeAIActivities = createAsyncThunk(
  "aiAssistant/summarizeAIActivities",
  async (payload: { entityType: string; entityId: string }) => {
    const response = await Client.post(
      withTenant("/ai-assistant/summarize-activities"),
      {
        entity_type: payload.entityType,
        entity_id: payload.entityId,
      },
    );
    return response.data.data as AIActivitySummaryData;
  },
);

const aiAssistantSlice = createSlice({
  name: "aiAssistant",
  initialState,
  reducers: {
    resetAIFollowupState(state) {
      state.followupDraft = null;
    },
    resetAIActivitySummaryState(state) {
      state.activitySummary = null;
    },
    resetAIErrorState(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAIInsights.pending, (state) => {
        state.insightsLoading = true;
        state.error = null;
      })
      .addCase(fetchAIInsights.fulfilled, (state, action) => {
        state.insightsLoading = false;
        state.insightsByKey[action.payload.key] = action.payload.data;
      })
      .addCase(fetchAIInsights.rejected, (state, action) => {
        state.insightsLoading = false;
        state.error = action.error.message || "Failed to fetch AI insights";
      })

      .addCase(generateAIFollowup.pending, (state) => {
        state.followupLoading = true;
        state.error = null;
      })
      .addCase(generateAIFollowup.fulfilled, (state, action) => {
        state.followupLoading = false;
        state.followupDraft = action.payload;
      })
      .addCase(generateAIFollowup.rejected, (state, action) => {
        state.followupLoading = false;
        state.error = action.error.message || "Failed to generate follow-up";
      })

      .addCase(summarizeAIActivities.pending, (state) => {
        state.summaryLoading = true;
        state.error = null;
      })
      .addCase(summarizeAIActivities.fulfilled, (state, action) => {
        state.summaryLoading = false;
        state.activitySummary = action.payload;
      })
      .addCase(summarizeAIActivities.rejected, (state, action) => {
        state.summaryLoading = false;
        state.error = action.error.message || "Failed to summarize activities";
      });
  },
});

export const {
  resetAIFollowupState,
  resetAIActivitySummaryState,
  resetAIErrorState,
} = aiAssistantSlice.actions;

export default aiAssistantSlice.reducer;
