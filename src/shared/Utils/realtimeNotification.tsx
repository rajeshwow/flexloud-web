import { Button, notification } from "antd";

type RealtimePayload = {
  reason?: string;
  entity_type?: string;
  entity_id?: string;
  title?: string;
  // ✅ NEW
  task_number?: string;
  lead_display_id?: string;
};

type ShowRealtimeNotificationOptions = {
  slug: string;
  navigate: (path: string) => void;
  fallbackOnClick?: () => void;
};

const titleMap: Record<string, string> = {
  lead_assigned: "New lead assigned",
  lead_reassigned_from: "Lead reassigned",
  task_assigned: "New task assigned",
  task_reassigned_from: "Task reassigned",
  task_due: "Task due",
  task_overdue: "Task overdue",
};

const routeMap: Record<string, string> = {
  lead: "leads",
  task: "tasks",
  opportunity: "opportunities",
  organization: "organizations",
  quote: "quotes",
};

let realtimeAudioContext: AudioContext | null = null;

async function playRealtimeBeep() {
  try {
    const isMuted = localStorage.getItem("fl_realtime_sound_muted") === "true";
    if (isMuted) return;

    const AudioContextClass =
      window.AudioContext || (window as any).webkitAudioContext;

    if (!AudioContextClass) return;

    if (!realtimeAudioContext) {
      realtimeAudioContext = new AudioContextClass();
    }

    if (realtimeAudioContext.state === "suspended") {
      await realtimeAudioContext.resume();
    }

    const oscillator = realtimeAudioContext.createOscillator();
    const gain = realtimeAudioContext.createGain();

    oscillator.type = "sine";
    oscillator.frequency.setValueAtTime(760, realtimeAudioContext.currentTime);

    gain.gain.setValueAtTime(0.0001, realtimeAudioContext.currentTime);
    gain.gain.exponentialRampToValueAtTime(
      0.12,
      realtimeAudioContext.currentTime + 0.02,
    );
    gain.gain.exponentialRampToValueAtTime(
      0.0001,
      realtimeAudioContext.currentTime + 0.22,
    );

    oscillator.connect(gain);
    gain.connect(realtimeAudioContext.destination);

    oscillator.start();
    oscillator.stop(realtimeAudioContext.currentTime + 0.24);
  } catch (error) {
    // Sound should never break realtime notification
  }
}

function getEntityUrl(slug: string, payload: RealtimePayload) {
  const entityType = payload?.entity_type;
  const entityId = payload?.entity_id;

  if (!slug || !entityType || !entityId) return null;

  const route = routeMap[entityType];

  if (!route) return null;

  return `/${slug}/${route}/${entityId}`;
}

function getEntityDisplayNumber(payload: RealtimePayload) {
  if (payload?.entity_type === "task") {
    return payload?.task_number;
  }

  if (payload?.entity_type === "lead") {
    return payload?.lead_display_id;
  }

  return null;
}

export function showRealtimeNotification(
  payload: RealtimePayload,
  options: ShowRealtimeNotificationOptions,
) {
  const notificationKey = `${payload?.reason || "update"}-${payload?.entity_id || Date.now()}`;
  const entityUrl = getEntityUrl(options.slug, payload);
  const displayNumber = getEntityDisplayNumber(payload);

  void playRealtimeBeep();

  const handleOpen = () => {
    if (entityUrl) {
      notification.destroy(notificationKey);
      options.navigate(entityUrl);
      return;
    }

    options.fallbackOnClick?.();
  };



  notification.open({
    key: notificationKey,
    placement: "topRight",
    duration: 10,
    style: {
      background: "#08245c",
      border: "1px solid rgba(255,255,255,0.14)",
      borderRadius: 14,
      boxShadow: "0 14px 36px rgba(0,0,0,0.28)",
      cursor: entityUrl ? "pointer" : "default",
    },
    closeIcon: <span style={{ color: "#ffffff", fontSize: 16 }}>×</span>,
    message: (
      <span style={{ color: "#ffffff", fontWeight: 800 }}>
        {titleMap[payload?.reason || ""] || "New update"}
      </span>
    ),
    description: (
      <div style={{ color: "rgba(255,255,255,0.88)" }}>
        <div style={{ marginBottom: entityUrl ? 8 : 0 }}>
          {displayNumber ? (
            <span style={{ fontWeight: 800, color: "#ffffff" }}>
              {displayNumber}
              {" - "}
            </span>
          ) : null}

          {payload?.title || "Your work queue has been updated."}
        </div>

        {entityUrl ? (
          <Button
            type="link"
            size="small"
            onClick={(event) => {
              event.stopPropagation();
              handleOpen();
            }}
            style={{
              padding: 0,
              height: "auto",
              color: "#ffffff",
              fontWeight: 700,
            }}
          >
            View details
          </Button>
        ) : null}
      </div>
    ),
    onClick: handleOpen,
  });
}