# Repository Guidelines

## Project Structure & Module Organization
This is a React Native application built with **Expo** and **Expo Router**. The project follows a modular architecture with route-based navigation and shared utilities.

- **app/**: Contains the application's file-based routing system (Expo Router).
- **shared/**: Core business logic, reusable components, constants, and context providers. This directory is aliased as `@shared` in the TypeScript configuration.
- **accounts_frontend/**: Specific functional components for the accounting module.
- **services/**: Data fetching and external service integrations.
- **assets/**: Static resources including images and fonts.

## Build, Test, and Development Commands
Development is managed through the Expo CLI.

- **Development Server**: `npm start` (Runs `expo start --lan`)
- **Android Development**: `npm run android` (Runs `expo run:android`)
- **iOS Development**: `npm run ios` (Runs `expo run:ios`)
- **Web Development**: `npm run web` (Runs `expo start --web`)
- **Tunneling**: `npm run tunnel` (Runs `expo start --tunnel` for remote testing)

## Coding Style & Naming Conventions
The repository enforces code quality through TypeScript and ESLint.

- **TypeScript**: Extends `expo/tsconfig.base`. Strict type checking is preferred. Use the `@shared/*` path alias for imports from the shared directory.
- **ESLint**: Uses the `eslint-config-expo/flat` configuration.
- **Formatting**: Code should follow standard React Native and TypeScript conventions.

## Database & Backend
The root `README.md` contains the SQL schema definitions (PostgreSQL) for the backend database, including tables for `machine_status`, `production_reports`, `production_logs`, and `attendance`.
