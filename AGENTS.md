# Repository Guidelines

## Project Structure & Module Organization
This repository is a monorepo-style collection of a Node.js backend and three React Native (Expo) mobile applications.

- **`backend/`**: Node.js/Express server using CommonJS (`require`/`module.exports`). Follows a router-controller pattern (`server.js`, `/sales`, `packing_routes.js`).
- **`factorymanagement-main/`**: Management-focused Expo app using TypeScript and Expo Router.
- **`factoryoperator-main/`**: Operator-focused Expo app.
- **`frontend-accounts/`**: Accounting-focused Expo app.
- **`shared/`**: (Inside each app) Contains core business logic, reusable components, and context providers, aliased as `@shared`.

## Build, Test, and Development Commands
Each directory maintains its own dependencies and scripts.

### Backend
- **Start Server**: `npm start` (runs `node server.js`)
- **Database Utilities**: Root `check_*.js` scripts for database validation and `setup_*.js` for data seeding.

### Mobile Apps (`factorymanagement-main`, `factoryoperator-main`, `frontend-accounts`)
- **Start Development Server**: `npm start` (runs `expo start --lan`)
- **Android Development**: `npm run android`
- **iOS Development**: `npm run ios`
- **Web Development**: `npm run web`
- **Tunneling**: `npm run tunnel`

## Coding Style & Naming Conventions
- **Backend**:
  - Module System: Strictly **CommonJS**.
  - File Naming: Lowercase (e.g., `inventorycontroller.js`, `packing_routes.js`).
  - Logging: Uses console emojis for status updates (e.g., `✅`, `❌`).
- **Frontend Apps**:
  - Language: **TypeScript** (Strict mode preferred).
  - Framework: **Expo Router** for file-based routing.
  - Path Aliases: Use `@shared/*` for imports from the shared directory.
  - Linting: Uses `eslint-config-expo/flat`.

## Database & Filesystem
- **MySQL**: Primary data store using the `mysql2` pool in `backend/db.js`.
- **Schema**: SQL definitions for `machine_status`, `production_reports`, and `attendance` are maintained in `Database/u755069701_factory.sql`.
- **Static Files**: Uploaded PDFs and QRCodes are stored in `backend/uploads/` and served via static routes.

## Testing Guidelines
There is currently no formal testing framework (e.g., Jest) configured. Verification is performed manually via `backend/check_*.js` utility scripts and Expo's development server.
