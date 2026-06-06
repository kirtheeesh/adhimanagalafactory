# Project Structure Details

This repository is a monorepo-style collection of a Node.js backend, multiple React Native (Expo) mobile applications, and a React-based web application.

## 1. `factoryoperator-main/` (Operator App)
Provides the interface and local logic for factory operators to interact with machinery and report production data.
- **Logic**: Machine status monitoring (running/idle), production reporting (material used, quantity, cycle times, cavity counts), and real-time logging of production runs.
- **Framework**: React Native (Expo) with TypeScript and Expo Router.
- **Path Aliases**: Uses `@shared` for core business components.

## 2. `factorymanagement-main/` (Management App)
A multi-module application for factory supervisors and department heads to oversee operations.
- **Logic**:
  - **Production Head**: Real-time production monitoring and shift management.
  - **Sales**: Order tracking, customer management, and sales history.
  - **Purchase**: Vendor management and raw material procurement.
  - **Quality (QA)**: Product inspection, rejection logging, and quality standards enforcement.
- **Framework**: React Native (Expo) with TypeScript and Expo Router.

## 3. `frontend-accounts/` (Accounts App)
Dedicated frontend for financial and administrative record-keeping.
- **Logic**: Financial transaction tracking, ledger management, and integration with sales/purchase data for accounting reconciliations.
- **Framework**: React Native (Expo) with TypeScript.

## 4. `backend/` (Mobile API Backend)
The central API hub that serves all three mobile applications (`factoryoperator-main`, `factorymanagement-main`, and `frontend-accounts`).
- **Logic**:
  - **Modules**: Attendance tracking, inventory management, sales processing, and packing coordination.
  - **Security**: Authentication and role-based access control (RBAC).
  - **Database Integration**: Direct interaction with the primary PostgreSQL database using CommonJS (`require`).
  - **Process Management**: Managed via PM2 (Process Name: `backend`).

## 5. `factoryadmin-main/` (Admin Web Suite)
A standalone web-based administrative dashboard for high-level oversight and system configuration.
- **Frontend (`/frontend`)**: A React/Vite dashboard for visualizing factory-wide metrics, managing users, and generating reports.
- **Backend (`/backend`)**: A specialized TypeScript-based Node.js backend for the admin portal (Process Name: `admin-backend`).
- **Logic**: Database seeding, administrative user management, and global system settings.

## Shared Infrastructure
- **Database**: All services connect to a unified **PostgreSQL** database for real-time data consistency across APKs and the Web app.
- **Static Assets**: Backend handles PDF generation (reports) and QR code storage in `/uploads`.
