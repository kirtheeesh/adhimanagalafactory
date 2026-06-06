# Hostinger Deployment Guide - Factory Management System

This guide provides step-by-step instructions to deploy the migrated MySQL-based application to Hostinger Node.js hosting.

## 1. Database Migration
1. **Export Local Database**:
   - Open phpMyAdmin on your local machine.
   - Select the `factory` database.
   - Click on **Export** and save the `.sql` file.
2. **Create Database on Hostinger**:
   - Log in to Hostinger hPanel.
   - Go to **Databases** > **MySQL Databases**.
   - Create a new database named `factory` (or similar). Note down the **Database Name**, **Username**, and **Password**.
3. **Import SQL to Hostinger**:
   - Open phpMyAdmin for the newly created database in Hostinger.
   - Click on **Import** and upload your local `.sql` file.

## 2. Backend Deployment (Two separate apps)
Hostinger Node.js hosting allows you to run Node.js applications. You will need to set up two separate applications if you want them on different ports or domains.

### App A: Mobile Backend (Port 3000)
1. **Upload Files**: Upload the contents of the `backend/` folder to a directory on your server (e.g., `/home/username/mobile-api`).
2. **Configure Environment**:
   - Edit the `.env` file in that folder.
   - Comment out the **LOCAL** section and uncomment the **PRODUCTION** section.
   - Fill in your Hostinger MySQL credentials.
3. **Setup Node.js App**:
   - In Hostinger hPanel, go to **Advanced** > **Node.js**.
   - Create a new app:
     - **App Directory**: `/mobile-api`
     - **Node.js Version**: 18 or higher.
     - **Application Startup File**: `server.js`
   - Click **Run npm install** and then **Restart**.

### App B: Web Admin Backend (Port 5001)
1. **Upload Files**: Upload the contents of `factoryadmin-main/backend/` to another directory (e.g., `/home/username/admin-api`).
2. **Configure Environment**:
   - Edit the `.env` file.
   - Switch to **PRODUCTION** mode.
   - Update `ALLOWED_ORIGINS` to include your production frontend domain.
3. **Setup Node.js App**:
   - Create another Node.js app in Hostinger hPanel pointing to this directory.
   - **Application Startup File**: `src/index.ts` (Hostinger's Node.js manager handles `package.json` scripts, so `npm start` will run `npx tsx src/index.ts`).

## 3. Frontend Deployment

### Web Admin Frontend
1. **Update API URL**: In `factoryadmin-main/frontend/.env`, set `VITE_API_URL` to your production admin API URL (e.g., `https://api.yourdomain.com/api`).
2. **Build**: Run `npm run build` in `factoryadmin-main/frontend`.
3. **Upload**: Upload the contents of the `dist/` folder to your public directory (e.g., `public_html/admin`).

### Mobile Apps (Android/iOS)
1. **Update API URL**: Update the `.env` file in each mobile app folder with your production mobile API URL.
2. **Build APK**: Run your Expo build command (e.g., `eas build -p android`).

## 4. Important Notes
- **CORS**: Ensure `ALLOWED_ORIGINS` in the backends includes your production domains.
- **Ports**: Hostinger usually manages ports automatically. You might need to use a reverse proxy or specify the port provided by Hostinger in your frontend `.env`.
- **Paths**: Ensure all file upload paths (like `backend/uploads`) have proper write permissions on the Linux server.
