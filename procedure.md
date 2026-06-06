# Hostinger Node.js Hosting Procedure

This document provides a complete guide for hosting the **factorywhole-main** backend and configuring the mobile apps for production on Hostinger Shared Hosting (Node.js Plan).

---

## 1. Database Configuration (MySQL)

Since you are moving to Hostinger's MySQL, follow these steps:

1.  **Create MySQL Database**:
    - Log in to Hostinger **hPanel**.
    - Go to **Databases** > **MySQL Databases**.
    - Create a new database (e.g., `u123456789_factory`).
    - Create a database user and assign it to the database with a strong password.
2.  **Import Data**:
    - Open **phpMyAdmin** for the new database.
    - Export your local database as a `.sql` file and import it here.
3.  **Update Backend Configuration**:
    - Your `backend/db.js` is already configured to use environment variables.
    - Create or edit the `.env` file in the `backend/` directory on Hostinger:
      ```env
      PORT=3000
      DB_HOST=localhost
      DB_USER=u123456789_user
      DB_PASSWORD=your_strong_password
      DB_NAME=u123456789_factory
      DB_PORT=3306
      ```

---

## 2. Hostinger Node.js App Setup

1.  **Go to Node.js Section**:
    - In hPanel, click on the **Node.js** dashboard.
2.  **Create Application**:
    - **Application Root**: `public_html/backend` (This is where your code will live).
    - **Application URL**: `https://yourdomain.com` (The URL your apps will connect to).
    - **Startup File**: `server.js`.
3.  **Install Dependencies**:
    - Once the app is created, use the **Terminal** in hPanel or SSH to go to the `backend` folder and run:
      ```bash
      npm install
      ```
    - Ensure `mysql2` is installed (it should be in `package.json`).

---

## 3. Git Push & Deployment

1.  **Prepare your Local Repo**:
    - Create a `.gitignore` in the root folder:
      ```text
      node_modules/
      .env
      *.log
      dist/
      ```
2.  **Push to GitHub**:
    - Create a repository on GitHub.
    - `git add .`
    - `git commit -m "Deployment ready"`
    - `git push origin main`
3.  **Connect to Hostinger**:
    - In hPanel, go to **Advanced** > **Git**.
    - Link your GitHub repo.
    - Set the **Install Directory** to `public_html`.
    - Click **Deploy** whenever you push new changes.

---

## 4. Frontend API Configuration (APK & Web)

For the APK to connect to your hosted backend, you **MUST** update the API URL.

### File to change: `shared/constants/ApiConfig.tsx`
Change the `SERVER_URL` in these locations:
- `factorymanagement-main/shared/constants/ApiConfig.tsx`
- `factoryoperator-main/shared/constants/ApiConfig.tsx`
- `frontend-accounts/shared/constants/ApiConfig.tsx`

**Change this:**
```typescript
const DEFAULT_URL = Platform.OS === 'android' ? 'http://10.0.2.2:3000' : 'http://localhost:3000';
export const SERVER_URL = process.env.EXPO_PUBLIC_API_URL || DEFAULT_URL;
```

**To this (Production URL):**
```typescript
// Replace with your actual Hostinger Domain
export const SERVER_URL = 'https://yourdomain.com'; 
```

---

## 5. Important Notes

- **Same Database**: The Web Frontend and the Mobile APK both connect to the **same Node.js API**, which in turn connects to the **same MySQL Database**. Any change made in the APK will reflect on the Web and vice-versa.
- **Rebuilding APK**: After changing the `SERVER_URL`, you must rebuild your APK using `npx expo build:android` or `eas build`.
- **Static Files**: If your app uploads images/QR codes, ensure the `backend/uploads` directory has write permissions on Hostinger.

---

## 6. Summary Checklist

| Action | File/Location | Done? |
| :--- | :--- | :---: |
| Create MySQL DB | hPanel > MySQL Databases | [ ] |
| Update `.env` | `backend/.env` | [ ] |
| Change API URL | `shared/constants/ApiConfig.tsx` | [ ] |
| Push to Git | GitHub / hPanel Git | [ ] |
| Install NPM | Hostinger Terminal | [ ] |
| Start Node.js | hPanel Node.js Manager | [ ] |
