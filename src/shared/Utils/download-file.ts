export function cleanExportParams(params?: Record<string, any>) {
  const cleaned: Record<string, any> = {};

  Object.entries(params || {}).forEach(([key, value]) => {
    if (
      value === undefined ||
      value === null ||
      value === "" ||
      key === "page" ||
      key === "pageSize" ||
      key === "perPage" ||
      key === "limit"
    ) {
      return;
    }

    cleaned[key] = value;
  });

  return cleaned;
}

function getFilenameFromDisposition(disposition?: string) {
  if (!disposition) return null;

  const match = disposition.match(/filename="?([^"]+)"?/i);

  return match?.[1] || null;
}

export function downloadBlobResponse(response: any, fallbackFileName: string) {
  const blobData = response?.data || response;

  const contentDisposition =
    response?.headers?.["content-disposition"] ||
    response?.headers?.["Content-Disposition"];

  const filename =
    getFilenameFromDisposition(contentDisposition) || fallbackFileName;

  const blob =
    blobData instanceof Blob
      ? blobData
      : new Blob([blobData], {
          type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        });

  const url = window.URL.createObjectURL(blob);

  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();

  anchor.remove();
  window.URL.revokeObjectURL(url);
}
