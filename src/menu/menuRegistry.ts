export type MenuItemConfig = {
  key: string;
  label: string;
  icon?: string;
  path?: string; // leaf only
  requiresAny?: string[]; // permissions
  children?: MenuItemConfig[];
};

/**
 * Permission naming convention (suggested):
 *  - ORG.CREATE, ORG.VIEW, ORG.IMPORT, ORG.RECENT
 *  - CONTACTS.CREATE, CONTACTS.VIEW, CONTACTS.IMPORT, CONTACTS.RECENT
 *  - LEADS.CREATE, LEADS.VIEW, LEADS.IMPORT, LEADS.RECENT
 *  - ...etc
 *
 * Backend later me simply permissions[] return karega, and UI auto hide/show.
 */
export const MENU_REGISTRY: MenuItemConfig[] = [
  // ---------------- Core ----------------
  {
    key: "core",
    label: "Core",
    icon: "HomeOutlined",
    children: [
      {
        key: "home",
        label: "Home",
        path: "/home",
        icon: "HomeOutlined",
        requiresAny: ["HOME.VIEW"],
      },
      {
        key: "calendar",
        label: "Calendar",
        path: "/calendar",
        icon: "CalendarOutlined",
        requiresAny: ["CALENDAR.VIEW"],
      },
    ],
  },

  // ---------------- Organization & Masters ----------------
  {
    key: "org_masters",
    label: "Organization",
    icon: "BankOutlined",
    children: [
      {
        key: "organization.create",
        label: "Create Organization",
        path: "/organization/create",
        icon: "PlusOutlined",
        requiresAny: ["org.create"],
      },
      {
        key: "organization.view",
        label: "View Organization",
        path: "/organization/view",
        icon: "EyeOutlined",
        requiresAny: ["ORG.VIEW"],
      },
      {
        key: "organization.import",
        label: "Import Organization",
        path: "/organization/import",
        icon: "ImportOutlined",
        requiresAny: ["ORG.IMPORT"],
      },
      {
        key: "organization.recent",
        label: "Recently Viewed",
        path: "/organization/recent",
        icon: "HistoryOutlined",
        requiresAny: ["ORG.RECENT"],
      },

      // Attendance (screenshots me org section ke paas hi hai)
      {
        key: "attendance.create",
        label: "Create Attendance",
        path: "/attendance/create",
        icon: "PlusOutlined",
        requiresAny: ["ATTENDANCE.CREATE"],
      },
      {
        key: "attendance.view",
        label: "View Attendance",
        path: "/attendance",
        icon: "EyeOutlined",
        requiresAny: ["ATTENDANCE.VIEW"],
      },

      // Tags
      {
        key: "tag.create",
        label: "Create Tag",
        path: "/tags/create",
        icon: "PlusOutlined",
        requiresAny: ["TAG.CREATE"],
      },
      {
        key: "tag.view",
        label: "View Tag",
        path: "/tags",
        icon: "EyeOutlined",
        requiresAny: ["TAG.VIEW"],
      },

      // Product Catalog (Item Master)
      {
        key: "productCatalog.create",
        label: "Create Item Master",
        path: "/product-catalog/create",
        icon: "PlusOutlined",
        requiresAny: ["PRODUCT_CATALOG.CREATE"],
      },
      {
        key: "productCatalog.view",
        label: "View Item Master",
        path: "/product-catalog",
        icon: "EyeOutlined",
        requiresAny: ["PRODUCT_CATALOG.VIEW"],
      },
      {
        key: "productCatalog.import",
        label: "Import",
        path: "/product-catalog/import",
        icon: "ImportOutlined",
        requiresAny: ["PRODUCT_CATALOG.IMPORT"],
      },
    ],
  },

  // ---------------- Sales ----------------
  {
    key: "sales",
    label: "Sales",
    icon: "TeamOutlined",
    children: [
      // Contacts
      {
        key: "contacts.create",
        label: "Create Contact",
        path: "/contacts/create",
        icon: "PlusOutlined",
        requiresAny: ["CONTACTS.CREATE"],
      },
      {
        key: "contacts.createFromVCard",
        label: "Create Contact From vCard",
        path: "/contacts/create-from-vcard",
        icon: "PlusOutlined",
        requiresAny: ["CONTACTS.CREATE_FROM_VCARD"],
      },
      {
        key: "contacts.view",
        label: "View Contacts",
        path: "/contacts",
        icon: "EyeOutlined",
        requiresAny: ["CONTACTS.VIEW"],
      },
      {
        key: "contacts.import",
        label: "Import Contacts",
        path: "/contacts/import",
        icon: "ImportOutlined",
        requiresAny: ["CONTACTS.IMPORT"],
      },
      {
        key: "contacts.recent",
        label: "Recently Viewed",
        path: "/contacts/recent",
        icon: "HistoryOutlined",
        requiresAny: ["CONTACTS.RECENT"],
      },

      // Leads
      {
        key: "leads.create",
        label: "Create Lead",
        path: "/leads/create",
        icon: "PlusOutlined",
        requiresAny: ["LEADS.CREATE"],
      },
      {
        key: "leads.createFromCard",
        label: "Create Lead From Card",
        path: "/leads/create-from-card",
        icon: "PlusOutlined",
        requiresAny: ["LEADS.CREATE_FROM_CARD"],
      },
      {
        key: "leads.view",
        label: "View Leads",
        path: "/leads",
        icon: "EyeOutlined",
        requiresAny: ["LEADS.VIEW"],
      },
      {
        key: "leads.import",
        label: "Import Leads",
        path: "/leads/import",
        icon: "ImportOutlined",
        requiresAny: ["LEADS.IMPORT"],
      },
      {
        key: "leads.recent",
        label: "Recently Viewed",
        path: "/leads/recent",
        icon: "HistoryOutlined",
        requiresAny: ["LEADS.RECENT"],
      },

      // Opportunities
      {
        key: "opportunities.create",
        label: "Create Opportunity",
        path: "/opportunities/create",
        icon: "PlusOutlined",
        requiresAny: ["OPPORTUNITIES.CREATE"],
      },
      {
        key: "opportunities.view",
        label: "View Opportunities",
        path: "/opportunities",
        icon: "EyeOutlined",
        requiresAny: ["OPPORTUNITIES.VIEW"],
      },
      {
        key: "opportunities.import",
        label: "Import Opportunities",
        path: "/opportunities/import",
        icon: "ImportOutlined",
        requiresAny: ["OPPORTUNITIES.IMPORT"],
      },

      // Quotes
      {
        key: "quotes.view",
        label: "View Quotes",
        path: "/quotes",
        icon: "EyeOutlined",
        requiresAny: ["QUOTES.VIEW"],
      },
      {
        key: "quotes.import",
        label: "Import",
        path: "/quotes/import",
        icon: "ImportOutlined",
        requiresAny: ["QUOTES.IMPORT"],
      },
      {
        key: "quotes.importLineItems",
        label: "Import Line Items",
        path: "/quotes/import-line-items",
        icon: "ImportOutlined",
        requiresAny: ["QUOTES.IMPORT_LINE_ITEMS"],
      },
    ],
  },

  // ---------------- Operations ----------------
  {
    key: "operations",
    label: "Operations",
    icon: "ScheduleOutlined",
    children: [
      // Emails
      {
        key: "emails.compose",
        label: "Compose",
        path: "/emails/compose",
        icon: "PlusOutlined",
        requiresAny: ["EMAILS.COMPOSE"],
      },
      {
        key: "emails.view",
        label: "View Email",
        path: "/emails",
        icon: "EyeOutlined",
        requiresAny: ["EMAILS.VIEW"],
      },

      // Calls
      {
        key: "calls.log",
        label: "Log Call",
        path: "/calls/log",
        icon: "PlusOutlined",
        requiresAny: ["CALLS.LOG"],
      },
      {
        key: "calls.view",
        label: "View Calls",
        path: "/calls",
        icon: "EyeOutlined",
        requiresAny: ["CALLS.VIEW"],
      },
      {
        key: "calls.import",
        label: "Import Calls",
        path: "/calls/import",
        icon: "ImportOutlined",
        requiresAny: ["CALLS.IMPORT"],
      },

      // Meetings
      {
        key: "meetings.schedule",
        label: "Schedule Meeting",
        path: "/meetings/schedule",
        icon: "PlusOutlined",
        requiresAny: ["MEETINGS.SCHEDULE"],
      },
      {
        key: "meetings.view",
        label: "View Meetings",
        path: "/meetings",
        icon: "EyeOutlined",
        requiresAny: ["MEETINGS.VIEW"],
      },
      {
        key: "meetings.import",
        label: "Import Meetings",
        path: "/meetings/import",
        icon: "ImportOutlined",
        requiresAny: ["MEETINGS.IMPORT"],
      },

      // Tasks
      {
        key: "tasks.create",
        label: "Create Task",
        path: "/tasks/create",
        icon: "PlusOutlined",
        requiresAny: ["TASKS.CREATE"],
      },
      {
        key: "tasks.view",
        label: "View Tasks",
        path: "/tasks",
        icon: "EyeOutlined",
        requiresAny: ["TASKS.VIEW"],
      },
      {
        key: "tasks.import",
        label: "Import Tasks",
        path: "/tasks/import",
        icon: "ImportOutlined",
        requiresAny: ["TASKS.IMPORT"],
      },

      // Notes
      {
        key: "notes.create",
        label: "Create Note or Attachment",
        path: "/notes/create",
        icon: "PlusOutlined",
        requiresAny: ["NOTES.CREATE"],
      },
      {
        key: "notes.view",
        label: "View Notes",
        path: "/notes",
        icon: "EyeOutlined",
        requiresAny: ["NOTES.VIEW"],
      },
      {
        key: "notes.import",
        label: "Import Notes",
        path: "/notes/import",
        icon: "ImportOutlined",
        requiresAny: ["NOTES.IMPORT"],
      },

      // Cases
      {
        key: "cases.create",
        label: "Create Case",
        path: "/cases/create",
        icon: "PlusOutlined",
        requiresAny: ["CASES.CREATE"],
      },
      {
        key: "cases.view",
        label: "View Cases",
        path: "/cases",
        icon: "EyeOutlined",
        requiresAny: ["CASES.VIEW"],
      },
      {
        key: "cases.import",
        label: "Import Cases",
        path: "/cases/import",
        icon: "ImportOutlined",
        requiresAny: ["CASES.IMPORT"],
      },

      // Visit
      {
        key: "visit.create",
        label: "Create Visit",
        path: "/visit/create",
        icon: "PlusOutlined",
        requiresAny: ["VISIT.CREATE"],
      },
      {
        key: "visit.view",
        label: "View Visit",
        path: "/visit",
        icon: "EyeOutlined",
        requiresAny: ["VISIT.VIEW"],
      },
      {
        key: "visit.import",
        label: "Import",
        path: "/visit/import",
        icon: "ImportOutlined",
        requiresAny: ["VISIT.IMPORT"],
      },

      // Visit Summary
      {
        key: "visitSummary.create",
        label: "Create VisitSummary",
        path: "/visit-summary/create",
        icon: "PlusOutlined",
        requiresAny: ["VISIT_SUMMARY.CREATE"],
      },
      {
        key: "visitSummary.view",
        label: "View VisitSummary",
        path: "/visit-summary",
        icon: "EyeOutlined",
        requiresAny: ["VISIT_SUMMARY.VIEW"],
      },
    ],
  },

  // ---------------- Reports & Templates ----------------
  {
    key: "reports_templates",
    label: "Reports & Templates",
    icon: "BarChartOutlined",
    children: [
      // PDF Templates
      {
        key: "pdfTemplates.create",
        label: "Create PDF Template",
        path: "/pdf-templates/create",
        icon: "PlusOutlined",
        requiresAny: ["PDF_TEMPLATES.CREATE"],
      },
      {
        key: "pdfTemplates.view",
        label: "View PDF Templates",
        path: "/pdf-templates",
        icon: "EyeOutlined",
        requiresAny: ["PDF_TEMPLATES.VIEW"],
      },
      {
        key: "pdfTemplates.import",
        label: "Import",
        path: "/pdf-templates/import",
        icon: "ImportOutlined",
        requiresAny: ["PDF_TEMPLATES.IMPORT"],
      },

      // Dream Reports
      {
        key: "dreamReports.create",
        label: "Create Reports",
        path: "/dream-reports/create",
        icon: "PlusOutlined",
        requiresAny: ["DREAM_REPORTS.CREATE"],
      },
      {
        key: "dreamReports.view",
        label: "View Reports",
        path: "/dream-reports",
        icon: "EyeOutlined",
        requiresAny: ["DREAM_REPORTS.VIEW"],
      },

      // Email Templates
      {
        key: "emailTemplates.create",
        label: "Create Email Template",
        path: "/email-templates/create",
        icon: "PlusOutlined",
        requiresAny: ["EMAIL_TEMPLATES.CREATE"],
      },
      {
        key: "emailTemplates.view",
        label: "View Email Templates",
        path: "/email-templates",
        icon: "EyeOutlined",
        requiresAny: ["EMAIL_TEMPLATES.VIEW"],
      },

      // Holidays (screenshot me left list me hai, submenu nahi dikhaya — abhi simple)
      {
        key: "holidays",
        label: "Holidays",
        path: "/holidays",
        icon: "GiftOutlined",
        requiresAny: ["HOLIDAYS.VIEW"],
      },

      // Sub Task (left list me hai — details missing)
      {
        key: "subTask",
        label: "Sub Task",
        path: "/sub-task",
        icon: "PartitionOutlined",
        requiresAny: ["SUB_TASK.VIEW"],
      },
    ],
  },
  // ---------------- Settings ----------------
  {
    key: "settings",
    label: "Settings",
    icon: "SettingOutlined",
    children: [
      // Users
      {
        key: "users.create",
        label: "Create User",
        path: "/users/create",
        icon: "PlusOutlined",
        requiresAny: ["USERS.CREATE"],
      },
      {
        key: "users.view",
        label: "View Users",
        path: "/users",
        icon: "EyeOutlined",
        requiresAny: ["USERS.VIEW"],
      },
      {
        key: "users.import",
        label: "Import",
        path: "/users/import",
        icon: "ImportOutlined",
        requiresAny: ["USERS.IMPORT"],
      },

      // Roles
      {
        key: "roles.create",
        label: "Create Role",
        path: "/roles/create",
        icon: "PlusOutlined",
        requiresAny: ["ROLES.CREATE"],
      },
      {
        key: "roles.view",
        label: "View Roles",
        path: "/roles",
        icon: "EyeOutlined",
        requiresAny: ["ROLES.VIEW"],
      },
      {
        key: "roles.import",
        label: "Import",
        path: "/roles/import",
        icon: "ImportOutlined",
        requiresAny: ["ROLES.IMPORT"],
      },

      // Departments
      {
        key: "departments.create",
        label: "Create Department",
        path: "/departments/create",
        icon: "PlusOutlined",
        requiresAny: ["DEPARTMENTS.CREATE"],
      },
      {
        key: "departments.view",
        label: "View Departments",
        path: "/departments",
        icon: "EyeOutlined",
        requiresAny: ["DEPARTMENTS.VIEW"],
      },
      {
        key: "departments.import",
        label: "Import",
        path: "/departments/import",
        icon: "ImportOutlined",
        requiresAny: ["DEPARTMENTS.IMPORT"],
      },

      // Locations
      {
        key: "locations.create",
        label: "Create Location",
        path: "/locations/create",
        icon: "PlusOutlined",
        requiresAny: ["LOCATIONS.CREATE"],
      },
      {
        key: "locations.view",
        label: "View Locations",
        path: "/locations",
        icon: "EyeOutlined",
        requiresAny: ["LOCATIONS.VIEW"],
      },
      {
        key: "locations.import",
        label: "Import",
        path: "/locations/import",
        icon: "ImportOutlined",
        requiresAny: ["LOCATIONS.IMPORT"],
      },

      // Product Categories
      {
        key: "productCategories.create",
        label: "Create Product Category",
        path: "/product-categories/create",
        icon: "PlusOutlined",
        requiresAny: ["PRODUCT_CATEGORIES.CREATE"],
      },
      {
        key: "productCategories.view",
        label: "View Product Categories",
        path: "/product-categories",
        icon: "EyeOutlined",
        requiresAny: ["PRODUCT_CATEGORIES.VIEW"],
      },
      {
        key: "productCategories.import",
        label: "Import",
        path: "/product-categories/import",
        icon: "ImportOutlined",
        requiresAny: ["PRODUCT_CATEGORIES.IMPORT"],
      },

      // Product Groups
      {
        key: "productGroups.create",
        label: "Create Product Group",
        path: "/product-groups/create",
        icon: "PlusOutlined",
        requiresAny: ["PRODUCT_GROUPS.CREATE"],
      },
      {
        key: "productGroups.view",
        label: "View Product Groups",
        path: "/product-groups",
        icon: "EyeOutlined",
        requiresAny: ["PRODUCT_GROUPS.VIEW"],
      },
      {
        key: "productGroups.import",
        label: "Import",
        path: "/product-groups/import",
        icon: "ImportOutlined",
        requiresAny: ["PRODUCT_GROUPS.IMPORT"],
      },

      // Product Sub-Categories
      {
        key: "productSubCategories.create",
        label: "Create Product Sub-Category",
        path: "/product-sub-categories/create",
        icon: "PlusOutlined",
        requiresAny: ["PRODUCT_SUB_CATEGORIES.CREATE"],
      },
      {
        key: "productSubCategories.view",
        label: "View Product Sub-Categories",
        path: "/product-sub-categories",
        icon: "EyeOutlined",
        requiresAny: ["PRODUCT_SUB_CATEGORIES.VIEW"],
      },
      {
        key: "productSubCategories.import",
        label: "Import",
        path: "/product-sub-categories/import",
        icon: "ImportOutlined",
        requiresAny: ["PRODUCT_SUB_CATEGORIES.IMPORT"],
      },

      // Product Types
      {
        key: "productTypes.create",
        label: "Create Product Type",
        path: "/product-types/create",
        icon: "PlusOutlined",
        requiresAny: ["PRODUCT_TYPES.CREATE"],
      },
      {
        key: "productTypes.view",
        label: "View Product Types",
        path: "/product-types",
        icon: "EyeOutlined",
        requiresAny: ["PRODUCT_TYPES.VIEW"],
      },
      {
        key: "productTypes.import",
        label: "Import",
        path: "/product-types/import",
        icon: "ImportOutlined",
        requiresAny: ["PRODUCT_TYPES.IMPORT"],
      },
    ],
  },
];
