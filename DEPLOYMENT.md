# Deployment Guide

This guide outlines the steps to deploy the **Invoice Manager** application: the API on Render and the client on Vercel.

## Before you start

- Both services need **Node.js 20.19 or newer**. If a platform's default Node version is older, select a newer one in its settings.
- The API needs a MongoDB connection string, for example from MongoDB Atlas.
- The API has no authentication. Restrict who can reach it, or add authentication before publishing it.

## 1. Backend Deployment (Render.com)

We will deploy the Node.js/Express server to Render.

1.  **Push your code to GitHub/GitLab**.
2.  Log in to [Render.com](https://render.com).
3.  Click **New +** -> **Web Service**.
4.  Connect your repository.
5.  **Settings**:
    - **Name**: `invoice-manager-backend` (or similar)
    - **Root Directory**: `server` (Important! This tells Render the backend is in the server folder)
    - **Environment**: `Node`
    - **Build Command**: `npm install`
    - **Start Command**: `node index.js`
6.  **Environment Variables** (Scroll down to "Advanced" or "Environment"):
    - Add `MONGODB_URI`: Paste your MongoDB Connection String (from Atlas). The server exits at start-up if this is missing.
    - Add `CORS_ORIGIN`: Paste your Vercel URL from Step 2, for example `https://your-app.vercel.app`. Leave it unset only if you accept requests from any origin. You can list several origins separated by commas.
    - Add `PORT`: `10000` (Render usually sets this, but good to be safe. The server reads `process.env.PORT`).
7.  Click **Create Web Service**.
8.  **Wait** for the deployment to finish.
9.  **Copy the Backend URL** provided by Render. You will need this for the Frontend.

## 2. Frontend Deployment (Vercel)

We will deploy the React/Vite client to Vercel.

1.  Log in to [Vercel](https://vercel.com).
2.  Click **Add New...** -> **Project**.
3.  Import your repository.
4.  **Configure Project**:
    - **Framework Preset**: `Vite`
    - **Root Directory**: Click the `Edit` button and select `client`.
5.  **Environment Variables**:
    - Add `VITE_API_URL`: Paste the **Render Backend URL** from Step 1.
      - _Note: Do NOT add a trailing slash `/` at the end._
6.  Click **Deploy**.
7.  Vercel will build and deploy your site.

## 3. Loading Data (Optional)

The sample data script replaces every invoice, line and payment in the database it points to. Use it only on a database you intend to fill with sample data.

- To load the sample invoices into an empty database, run `npm run seed` from the repository root, with `MONGODB_URI` pointing at that database.
- The script refuses to run when invoices already exist. Adding `-- --force` replaces them. Do not use `--force` against a database that holds real invoices.

## 4. Post-Deployment Verification

1.  Open your new Vercel URL.
2.  The Home Page should load.
3.  The Dashboard counters might be `0` initially if the DB is empty or if the backend is "sleeping" (Render free tier sleeps after inactivity).
4.  Open the Browser Console (F12) to check for any CORS errors if data doesn't load.
    - _Note: If `CORS_ORIGIN` is set to your Vercel URL, the browser will only accept responses for that origin. A CORS error usually means the value does not match the URL exactly, including `https://` and without a trailing slash._
