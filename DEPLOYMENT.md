# Deployment Guide

This guide outlines the steps to deploy the **Invoice Manager** application.

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
    - Add `MONGODB_URI`: Paste your MongoDB Connection String (from Atlas).
    - Add `PORT`: `10000` (Render usually sets this, but good to be safe. Your code uses `process.env.PORT`).
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

## 3. Post-Deployment Verification

1.  Open your new Vercel URL.
2.  The Home Page should load.
3.  The Dashboard counters might be `0` initially if the DB is empty or if the backend is "sleeping" (Render free tier sleeps after inactivity).
4.  Open the Browser Console (F12) to check for any CORS errors if data doesn't load.
    - _Note: The backend is configured to allow CORS from any origin (`*`), so it should work immediately._
