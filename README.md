# Invoice Details Module

A full-stack Invoice Details application built with React, Node.js, Express, and MongoDB.

## Features
- **Invoice Details**: View comprehensive invoice information including customer details, dates, and line items.
- **Payments**: Record payments against invoices with real-time balance updates.
- **Status Tracking**: Automatically updates invoice status (DRAFT -> PAID) based on balance.
- **clean UI**: Modern, responsive interface built with TailwindCSS.

## Project Structure
- `client/`: React frontend with Vite and TailwindCSS.
- `server/`: Node.js Express backend with Mongoose.

## Setup Instructions

### Prerequisites
- Node.js (v14 or higher)
- MongoDB Atlas URI (connection string)

### 1. Backend Setup
Navigate to the `server` directory:
```bash
cd server
```

Install dependencies:
```bash
npm install
```

Configure Environment Variables:
1. Copy the example file:
   ```bash
   cp .env.example .env
   ```
2. Open `.env` and paste your MongoDB Connection String.

Run the Seed Script (Optional, to populate initial data):
```bash
node seed.js
```
*Note: Make sure to replace `your_mongodb_connection_string_here` with your actual MongoDB Atlas URI before running.*

Start the Server:
```bash
npm run dev
```
The server will start on `http://localhost:5000`.

### 2. Frontend Setup
Navigate to the `client` directory:
```bash
cd client
```

Install dependencies:
```bash
npm install
```

Configure Environment Variables:
1. Copy the example file:
   ```bash
   cp .env.example .env
   ```
2. (Optional) Update `VITE_API_URL` if your backend is not running on localhost:5000.

Start the Development Server:
```bash
npm run dev
```
The application will open at `http://localhost:5173`.

## Usage
1. Open the frontend URL.
2. You will be redirected to the details page of the seeded invoice (e.g., `INV-001`).
3. Use the **Add Payment** button to record payments.
4. Observe the Balance Due and Status updates.

## API Endpoints
- `GET /api/invoices/:id` - Get invoice details
- `POST /api/invoices/:id/payments` - Add a payment
- `POST /api/invoices/archive` - Archive an invoice
- `POST /api/invoices/restore` - Restore an invoice

## Deployment

For detailed deployment instructions (Render + Vercel), see [DEPLOYMENT.md](./DEPLOYMENT.md).
