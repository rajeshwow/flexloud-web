# Project rules

## Frontend

- Use React + TypeScript
- Use Ant Design
- Listing pages must use generic search input and Create button on right
- Avoid per-column search
- All routes must be slug-based: /:slug/...
- Use withTenant(...) for API routes
- Follow existing Redux thunk + unwrap + message.success/error pattern
- Keep components theme-friendly

## Backend

- Use Express + PostgreSQL
- Keep routers slim
- Put business logic in \*.service.ts
- Always scope queries by tenant_id
- Prefer created_by_id and updated_by_id where applicable

## Commands

- Give CMD-friendly folder/file creation commands
- Do not use touch or bash-style mkdir -p in suggested commands

## Response style

- Give full replaceable code
- Mention exact file name and where code should go
