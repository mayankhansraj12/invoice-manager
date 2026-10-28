# Invoice Manager

A full-stack invoice details and payment tracking app. Browse invoices, review line items and payment history, record payments against an invoice, and archive or restore invoices. Built with React, Express and MongoDB.

- **Live demo:** https://invoice-manager-super.vercel.app/
- **Repository:** https://github.com/mayankhansraj12/invoice-manager

## Features

- **Dashboard:** total revenue, amount collected and amount pending across active invoices, with a list of every invoice and its status.
- **Archived invoices:** hidden from the dashboard list and totals by default. A "Show archived" toggle reveals them.
- **Invoice details:** issuer and customer details, issue and due dates, line items, totals, payment terms and a print-friendly layout.
- **Payments:** record a payment from a dialog. Amounts must be positive, have at most two decimal places and not exceed the balance. Payments are refused on archived invoices.
- **Safe under concurrency:** simultaneous payments cannot push an invoice past its balance.
- **Status tracking:** invoices move from `DRAFT` to `PARTIALLY_PAID` to `PAID` as payments are recorded.
- **Archive and restore:** toggle an invoice's archived state from its details page.
- **Sample data:** a seed script loads four example invoices and refuses to overwrite existing data unless told to.

## Tech stack

- **Client:** React 18, Vite 6, React Router 7, Tailwind CSS 3, Axios, date-fns, lucide-react
- **Server:** Node.js, Express 5, Mongoose 8, MongoDB
- **Tooling:** Vitest and React Testing Library, Node's built-in test runner with `mongodb-memory-server`, ESLint 9, Prettier 3

## Prerequisites

- Node.js 20.19 or newer, with npm
- A MongoDB database: a MongoDB Atlas connection string, or a local MongoDB server
- Internet access the first time you run the server tests, which download a MongoDB binary for an in-memory database

## Getting started

1. Clone the repository and enter it:

   ```bash
   git clone https://github.com/mayankhansraj12/invoice-manager.git
   cd invoice-manager
   ```

2. Install dependencies for the root, the server and the client:

   ```bash
   npm run setup
   ```

3. Configure the server. Copy the example file and set `MONGODB_URI` to your database:

   ```bash
   cp server/.env.example server/.env
   ```

   On Windows, use `copy server\.env.example server\.env` instead.

4. Load the sample invoices (optional):

   ```bash
   npm run seed
   ```

5. Start the API and the client together:

   ```bash
   npm run dev
   ```

   The API runs on `http://localhost:5000` and the client on `http://localhost:5173`. Open the client URL in a browser.

## Configuration

### Server (`server/.env`)

| Variable      | Required | Default | Description                                                                                       |
| ------------- | -------- | ------- | ------------------------------------------------------------------------------------------------- |
| `MONGODB_URI` | Yes      | none    | MongoDB connection string. The server exits at start-up if it is missing.                         |
| `PORT`        | No       | `5000`  | Port the API listens on. Must be a whole number from 0 to 65535.                                  |
| `CORS_ORIGIN` | No       | any     | Comma-separated list of browser origins allowed to call the API. Leave unset to allow any origin. |

### Client (`client/.env`)

| Variable       | Required | Default                 | Description                                                                      |
| -------------- | -------- | ----------------------- | -------------------------------------------------------------------------------- |
| `VITE_API_URL` | No       | `http://localhost:5000` | Base URL of the API, without a trailing slash. Set it when the API is elsewhere. |

The issuer name, address, GSTIN and payee shown on invoices live in `client/src/config/company.js`.

## Usage

1. Open the client. The dashboard lists every active invoice, newest first.
2. Select an invoice to open its details.
3. Select **Add Payment**, enter an amount and confirm. The balance, status and payment history update when the payment is saved. A message appears inside the dialog if the payment is refused.
4. Select **Archive** to archive an invoice, or **Restore** to bring it back. Archived invoices leave the dashboard totals.
5. Select **Print** to print the invoice.

The same operations are available over HTTP. The examples below assume the default port:

```bash
# Fetch an invoice by its invoice number
curl http://localhost:5000/api/invoices/INV-2024-002

# Record a payment of 1000
curl -X POST http://localhost:5000/api/invoices/INV-2024-002/payments \
  -H "Content-Type: application/json" \
  -d '{"amount": 1000}'

# Archive an invoice
curl -X POST http://localhost:5000/api/invoices/archive \
  -H "Content-Type: application/json" \
  -d '{"id": "INV-2024-004"}'
```

## API

Every error response has the shape `{ "message": "..." }`.

| Method | Path                         | Body         | Responses                                                                                         |
| ------ | ---------------------------- | ------------ | ------------------------------------------------------------------------------------------------- |
| GET    | `/`                          | none         | `200` health text                                                                                 |
| GET    | `/api/invoices`              | none         | `200` all invoices, including archived ones, newest issue date first                              |
| GET    | `/api/invoices/:id`          | none         | `200` `{ invoice, lines, payments }`; `404` if not found                                          |
| POST   | `/api/invoices/:id/payments` | `{ amount }` | `201` `{ payment, invoice }`; `400` invalid amount or amount above balance; `404`; `409` archived |
| POST   | `/api/invoices/archive`      | `{ id }`     | `200` `{ message, invoice }`; `400` missing or non-string id; `404`                               |
| POST   | `/api/invoices/restore`      | `{ id }`     | `200` `{ message, invoice }`; `400` missing or non-string id; `404`                               |

`:id` and `id` accept either the invoice number (for example `INV-2024-002`) or the MongoDB ObjectId. `amount` is a positive number or a decimal string with at most two decimal places.

The API has no authentication. See [Known limitations](#known-limitations).

## Project structure

```
invoice-manager/
├── client/                      React frontend (Vite)
│   ├── src/
│   │   ├── components/          Invoice header, line items, totals, payments, dialog, list
│   │   ├── config/              Issuer details printed on invoices
│   │   ├── pages/               Invoice details page
│   │   ├── services/            API client
│   │   ├── test/                Vitest setup
│   │   └── utils/               Money and date formatting
│   ├── eslint.config.js
│   └── vite.config.js           Build and test configuration
├── server/
│   ├── index.js                 Entry point: reads config, connects to MongoDB, listens
│   ├── src/
│   │   ├── app.js               Express app: middleware, routes, error handling
│   │   ├── config.js            Environment variable parsing and validation
│   │   ├── db.js                MongoDB connection
│   │   ├── middleware/          JSON 404 and error responses
│   │   ├── models/              Mongoose schemas for invoices, lines and payments
│   │   ├── routes/              Invoice API routes
│   │   └── services/            Payment rules and the atomic payment update
│   ├── scripts/seed.js          Sample data loader
│   ├── test/                    Test suites for the server
│   └── eslint.config.js
├── .prettierrc.json             Shared formatting rules
├── DEPLOYMENT.md                Hosting on Render and Vercel
└── package.json                 Root scripts that run both packages
```

## Scripts

Run these from the repository root.

| Command                | What it does                                                                     |
| ---------------------- | -------------------------------------------------------------------------------- |
| `npm run setup`        | Installs root, server and client dependencies                                    |
| `npm run dev`          | Starts the API (with auto-restart) and the client dev server                     |
| `npm run seed`         | Loads sample invoices. Fails if invoices exist; add `-- --force` to replace them |
| `npm test`             | Runs the server and client test suites                                           |
| `npm run lint`         | Lints the server and the client                                                  |
| `npm run format`       | Formats client, server and documentation files with Prettier                     |
| `npm run format:check` | Checks formatting without changing files                                         |
| `npm run build`        | Builds the client for production into `client/dist`                              |

The server has its own `start` script (`node index.js`), which production hosts use.

## Testing and linting

- **Server:** `npm test` runs the server suites with Node's built-in test runner. They start an in-memory MongoDB, so they never touch your configured database. Suites cover payment rules, concurrent payments, archiving, read routes, error responses, configuration, CORS, indexes and seeding.
- **Client:** `npm test` runs Vitest in a jsdom environment. Suites cover the payment dialog, the invoice list and details pages, the header, formatting helpers and API paths.
- **Linting:** `npm run lint` runs ESLint in both packages. `npm run format:check` verifies Prettier formatting.

## Known limitations

- **No authentication or authorization.** Anyone who can reach the API can record payments and archive or restore invoices. Put the API behind an authenticating layer before exposing it.
- **No API for creating invoices or lines.** Invoices and line items come from the database or the seed script.
- **Totals are stored, not calculated from lines.** `total`, `amountPaid` and `balanceDue` are saved as data. Changing a line item directly in the database does not update them.
- **`OVERDUE` is never derived.** The status appears only in sample data. Invoices do not become overdue when their due date passes.
- **Overpayments are rejected.** There is no credit or refund model.
- **Tax is shown as 0%.** Invoices have no tax field.
- **No rate limiting.**
- **Dashboard totals are computed in the browser** from the full invoice list, which is fine at this size but will not scale to thousands of invoices.
- **Printing** uses the browser's print dialog. The print layout has not been checked on paper or PDF output.

## Future improvements

- Authentication, and per-user access to invoices.
- Endpoints for creating invoices and line items, with totals derived from lines.
- Derived overdue status and reminders.
- A credit model for overpayments and write-offs.
- Tax fields and per-invoice tax rates.
- A CI workflow that runs the lint, test and build scripts on each push.

## Deployment

See [DEPLOYMENT.md](DEPLOYMENT.md) for hosting the API on Render and the client on Vercel.
