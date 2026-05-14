import { message } from "antd";
import dayjs from "dayjs";

export const getTenantSlug = () => {
  const pathSlug = window.location.pathname.split("/")[1];
  return pathSlug || localStorage.getItem("tenantSlug") || "";
};

export const withTenant = (path: string) => `/v1/${getTenantSlug()}${path}`;

export const getTenantId = () => localStorage.getItem("tenantId") || "";

export const withTenantId = (path: string) => `/v1/${getTenantId()}${path}`;

export const withTenantIdAndSlug = (path: string) =>
  `/v1/${getTenantId()}/${getTenantSlug()}${path}`;

export const formatDateTime = (value?: string | null) => {
  if (!value) return "-";
  const parsed = dayjs(value);
  return parsed.isValid() ? parsed.format("DD MMM YYYY, hh:mm A") : "-";
};

export const toTitleCase = (str: string = ""): string => {
  if (!str) return "";

  return str
    .toLowerCase()
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

  // const lower = str.toLowerCase().trim();

  // return lower.charAt(0).toUpperCase() + lower.slice(1);
};

export const organizationTypeOptions = [
  { label: "End User", value: "end_user" },
  { label: "Government", value: "government" },
  { label: "Hotel", value: "hotel" },
  { label: "Partner", value: "partner" },
  { label: "Corporate", value: "corporate" },
  { label: "Dealer", value: "dealer" },
  { label: "Education", value: "education" },
  { label: "Supplier", value: "supplier" },
  { label: "Other", value: "other" },
];

export const companyNames = [
  { label: "Atvi", value: "atvi" },
  { label: "Bispl", value: "bispl" },
];

export const getPurchaseOrderStatusOptions = () => [
  {
    label: "Draft",
    value: "draft",
  },
  {
    label: "Sent",
    value: "sent",
  },
  {
    label: "Partially Received",
    value: "partially_received",
  },
  {
    label: "Received",
    value: "received",
  },
  {
    label: "Cancelled",
    value: "cancelled",
  },
];

export const getSalesOrderStatusOptions = () => [
  {
    label: "Draft",
    value: "draft",
  },
  {
    label: "Confirmed",
    value: "confirmed",
  },
  {
    label: "Partially Dispatched",
    value: "partially_dispatched",
  },
  {
    label: "Dispatched",
    value: "dispatched",
  },
  {
    label: "Delivered",
    value: "delivered",
  },
  {
    label: "Cancelled",
    value: "cancelled",
  },
];

export const numberToIndianWords = (amount: number) => {
  const ones = [
    "",
    "One",
    "Two",
    "Three",
    "Four",
    "Five",
    "Six",
    "Seven",
    "Eight",
    "Nine",
    "Ten",
    "Eleven",
    "Twelve",
    "Thirteen",
    "Fourteen",
    "Fifteen",
    "Sixteen",
    "Seventeen",
    "Eighteen",
    "Nineteen",
  ];

  const tens = [
    "",
    "",
    "Twenty",
    "Thirty",
    "Forty",
    "Fifty",
    "Sixty",
    "Seventy",
    "Eighty",
    "Ninety",
  ];

  const wordsBelowHundred = (num: number) => {
    if (num < 20) return ones[num];
    return `${tens[Math.floor(num / 10)]} ${ones[num % 10]}`.trim();
  };

  const wordsBelowThousand = (num: number) => {
    if (num < 100) return wordsBelowHundred(num);
    return `${ones[Math.floor(num / 100)]} Hundred ${wordsBelowHundred(num % 100)}`.trim();
  };

  if (!amount) return "Zero";

  let num = Math.floor(amount);
  const parts: string[] = [];

  const crore = Math.floor(num / 10000000);
  if (crore) {
    parts.push(`${wordsBelowThousand(crore)} Crore`);
    num %= 10000000;
  }

  const lakh = Math.floor(num / 100000);
  if (lakh) {
    parts.push(`${wordsBelowThousand(lakh)} Lakh`);
    num %= 100000;
  }

  const thousand = Math.floor(num / 1000);
  if (thousand) {
    parts.push(`${wordsBelowThousand(thousand)} Thousand`);
    num %= 1000;
  }

  if (num) parts.push(wordsBelowThousand(num));

  return parts.join(" ").replace(/\s+/g, " ").trim();
};

export const getQuoteStatusColor = (status?: string) => {
  if (!status) return "default";
  const value = String(status).toLowerCase();

  if (value === "draft") return "orange";
  if (value === "sent") return "blue";
  if (value === "approved") return "green";
  if (value === "rejected") return "red";

  return "default";
};

export const quoteStatusOptions = [
  { label: "Draft", value: "draft" },
  { label: "Sent", value: "sent" },
  { label: "Approved", value: "approved" },
  { label: "Rejected", value: "rejected" },
];

export const getQuoteStageOptions = () => [
  { label: "Draft", value: "draft" },
  { label: "Sent", value: "sent" },
  { label: "Approved", value: "approved" },
  { label: "Rejected", value: "rejected" },
];

export function getPurchaseOrderStatusColor(status?: string) {
  switch (status) {
    case "draft":
      return "default";

    case "sent":
      return "orange";

    case "partially_received":
      return "blue";

    case "received":
      return "green";

    case "cancelled":
      return "red";

    default:
      return "default";
  }
}

//create sales order status color
export function getSalesOrderStatusColor(status?: string) {
  switch (status) {
    case "draft":
      return "default";

    case "confirmed":
      return "orange";

    case "partially_dispatched":
      return "blue";

    case "dispatched":
      return "green";

    case "delivered":
      return "green";

    case "cancelled":
      return "red";

    default:
      return "default";
  }
}

export const handlePrintDeliveryChallan = (details: any) => {
  if (!details) {
    message.error("No delivery challan details available");
    return;
  }
  const challanItems = details?.items || [];
  const totalAmount = Number(details?.total || 0);

  const taxAmount =
    Number(details?.tax_amount || details?.tax || 0) ||
    challanItems.reduce((sum: number, item: any) => {
      return sum + Number(item.cgst || 0) + Number(item.sgst || 0);
    }, 0);

  const printWindow = window.open("", "_blank", "width=900,height=1100");

  if (!printWindow) {
    message.error("Please allow popup to print delivery challan");
    return;
  }

  const html = `
<!DOCTYPE html>
<html>
<head>
    <title>${details?.challan_number || "Delivery Challan"}</title>
    <style>
        * {
            box-sizing: border-box;
        }

        body {
            margin: 0;
            padding: 24px;
            font-family: Arial, Helvetica, sans-serif;
            color: #111827;
            background: #ffffff;
        }

        .print-page {
            width: 794px;
            min-height: 1123px;
            margin: 0 auto;
            padding: 34px 38px;
            border: 1px solid #e5e7eb;
            background: #ffffff;
        }

        .top {
            display: flex;
            justify-content: space-between;
            gap: 24px;
            margin-bottom: 28px;
        }

        .company {
            max-width: 45%;
            line-height: 1.55;
            font-size: 13px;
            color: #374151;
        }

        .company-name {
            font-size: 22px;
            font-weight: 800;
            color: #111827;
            margin-bottom: 6px;
        }

        .title-box {
            text-align: right;
        }

        .doc-title {
            font-size: 34px;
            letter-spacing: 1px;
            font-weight: 800;
            color: #111827;
            line-height: 1.05;
        }

        .doc-number {
            margin-top: 12px;
            font-size: 14px;
            color: #374151;
        }

        .doc-number strong {
            color: #111827;
        }

        .info-row {
            display: flex;
            justify-content: space-between;
            gap: 24px;
            margin-bottom: 26px;
        }

        .deliver-box {
            width: 45%;
        }

        .meta-box {
            width: 45%;
            font-size: 13px;
        }

        .section-label {
            font-size: 12px;
            text-transform: uppercase;
            letter-spacing: .6px;
            color: #6b7280;
            font-weight: 700;
            margin-bottom: 8px;
        }

        .customer-name {
            font-size: 16px;
            font-weight: 700;
            color: #111827;
        }

        .muted {
            color: #6b7280;
            font-size: 13px;
            margin-top: 4px;
        }

        .meta-line {
            display: flex;
            justify-content: space-between;
            border-bottom: 1px solid #f3f4f6;
            padding: 7px 0;
        }

        .meta-line span:first-child {
            color: #6b7280;
        }

        table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 8px;
        }

        thead th {
            background: #111827;
            color: #ffffff;
            font-size: 12px;
            text-align: left;
            padding: 11px 10px;
            border: 1px solid #111827;
        }

        tbody td {
            font-size: 13px;
            padding: 12px 10px;
            border: 1px solid #e5e7eb;
            vertical-align: top;
        }

        .text-right {
            text-align: right;
        }

        .text-center {
            text-align: center;
        }

        .item-name {
            font-weight: 700;
            color: #111827;
        }

        .item-sku {
            color: #6b7280;
            font-size: 11px;
            margin-top: 3px;
        }

        .summary-wrap {
            display: flex;
            justify-content: space-between;
            gap: 28px;
            margin-top: 28px;
        }

        .words {
            width: 56%;
            font-size: 13px;
            line-height: 1.6;
        }

        .summary {
            width: 36%;
            font-size: 13px;
        }

        .summary-line {
            display: flex;
            justify-content: space-between;
            padding: 8px 0;
            border-bottom: 1px solid #f3f4f6;
        }

        .grand-total {
            display: flex;
            justify-content: space-between;
            padding: 12px 0;
            margin-top: 6px;
            border-top: 2px solid #111827;
            font-size: 17px;
            font-weight: 800;
        }

        .signature {
            margin-top: 80px;
            display: flex;
            justify-content: flex-end;
        }

        .signature-box {
            width: 220px;
            text-align: center;
            border-top: 1px solid #111827;
            padding-top: 10px;
            font-size: 13px;
            font-weight: 700;
        }

        @page {
            size: A4;
            margin: 12mm;
        }

        @media print {
            body {
                padding: 0;
            }

            .print-page {
                width: auto;
                min-height: auto;
                border: none;
                padding: 0;
            }
        }
    </style>
</head>
<body>
    <div class="print-page">
        <div class="top">
            <div class="company">
                <div class="company-name">FlexLoud</div>
                <div>Rajasthan</div>
                <div>India</div>
                <div>rajesh007prajapati@gmail.com</div>
            </div>

            <div class="title-box">
                <div class="doc-title">DELIVERY<br/>CHALLAN</div>
                <div class="doc-number">
                    Delivery Challan# <strong>${details?.challan_number || "-"}</strong>
                </div>
            </div>
        </div>

        <div class="info-row">
            <div class="deliver-box">
                <div class="section-label">Deliver To</div>
                <div class="customer-name">${details?.customer_name || "-"}</div>
                ${
                  details?.customer_email
                    ? `<div class="muted">${details?.customer_email}</div>`
                    : ""
                }
                ${
                  details?.customer_phone
                    ? `<div class="muted">${details?.customer_phone}</div>`
                    : ""
                }
            </div>

            <div class="meta-box">
                <div class="meta-line">
                    <span>Challan Date :</span>
                    <strong>${details?.challan_date ? dayjs(details?.challan_date).format("DD/MM/YYYY") : "-"}</strong>
                </div>
                <div class="meta-line">
                    <span>Challan Type :</span>
                    <strong>${details?.challan_type || "-"}</strong>
                </div>
                <div class="meta-line">
                    <span>Reference :</span>
                    <strong>${details?.reference_no || "-"}</strong>
                </div>
            </div>
        </div>

        <table>
            <thead>
                <tr>
                    <th style="width: 50px;" class="text-center">#</th>
                    <th>Item & Description</th>
                    <th style="width: 90px;" class="text-right">Qty</th>
                    <th style="width: 110px;" class="text-right">Rate</th>
                    <th style="width: 120px;" class="text-right">Amount</th>
                </tr>
            </thead>
            <tbody>
                ${
                  challanItems.length
                    ? challanItems
                        .map(
                          (item: any, index: number) => `
                                    <tr>
                                        <td class="text-center">${index + 1}</td>
                                        <td>
                                            <div class="item-name">${item.item_name || "-"}</div>
                                            ${
                                              item.sku
                                                ? `<div class="item-sku">SKU: ${item.sku}</div>`
                                                : ""
                                            }
                                        </td>
                                        <td class="text-right">
                                            ${Number(item.quantity || 0).toFixed(2)}
                                            ${item.unit ? `<br/><span class="muted">${item.unit}</span>` : ""}
                                        </td>
                                        <td class="text-right">${Number(item.rate || 0).toFixed(2)}</td>
                                        <td class="text-right">${Number(item.amount || 0).toFixed(2)}</td>
                                    </tr>
                                `,
                        )
                        .join("")
                    : `
                            <tr>
                                <td colspan="5" class="text-center">No items added</td>
                            </tr>
                        `
                }
            </tbody>
        </table>

        <div class="summary-wrap">
            <div class="words">
                <strong>Total In Words:</strong>
                Indian Rupee ${numberToIndianWords(totalAmount)} Only
            </div>

            <div class="summary">
                <div class="summary-line">
                    <span>Sub Total</span>
                    <strong>₹ ${Number(details?.subtotal || 0).toFixed(2)}</strong>
                </div>

                ${
                  taxAmount > 0
                    ? `
            <div class="summary-line">
                <span>Tax</span>
                <strong> ${`(+)`} ₹ ${taxAmount.toFixed(2)}</strong>
            </div>
        `
                    : ""
                } 

                ${
                  Number(details?.discount_amount || 0) > 0
                    ? `
                            <div class="summary-line">
                                <span>Discount</span>
                                <strong> ${`(-)`} ₹ ${Number(details?.discount_amount || 0).toFixed(2)}</strong>
                            </div>
                        `
                    : ""
                }

                ${
                  Number(details?.adjustment || 0) !== 0
                    ? `
                            <div class="summary-line">
                                <span>Adjustment</span>
                                <strong>${Number(details?.adjustment || 0).toFixed(2)}</strong>
                            </div>
                        `
                    : ""
                }

                <div class="grand-total">
                    <span>Total</span>
                    <span>₹${totalAmount.toFixed(2)}</span>
                </div>
            </div>
        </div>

        <div class="signature">
            <div class="signature-box">Authorized Signature</div>
        </div>
    </div>

    <script>
        window.onload = function () {
            window.focus();
            window.print();
        };
    </script>
</body>
</html>
    `;

  printWindow.document.open();
  printWindow.document.write(html);
  printWindow.document.close();
};
