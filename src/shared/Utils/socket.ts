import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;

const getApiOrigin = () => {
  const baseUrl = import.meta.env.VITE_BASE_URL || "";

  return baseUrl.replace(/\/v1\/?$/, "").replace(/\/$/, "");
};

const getAuthToken = () => {
  return (
    localStorage.getItem("token") ||
    localStorage.getItem("authToken") ||
    localStorage.getItem("crm_token") ||
    ""
  );
};

export const getRealtimeSocket = (slug: string) => {
  const token = getAuthToken();
  const apiOrigin = getApiOrigin();

  if (!apiOrigin || !token || !slug) {
    return null;
  }

  if (socket?.connected) {
    return socket;
  }

  socket = io(apiOrigin, {
    transports: ["websocket"],
    auth: {
      token,
      slug,
    },
    reconnection: true,
    reconnectionAttempts: Infinity,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
  });

  return socket;
};

export const disconnectRealtimeSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};
