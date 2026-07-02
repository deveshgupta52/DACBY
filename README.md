# Full-Stack Order Management System

## Project Overview
This is a full-stack Order Management System built with React, Express, and MongoDB. It supports order creation, automated status updates using a scheduler, status history tracking, and a dashboard for viewing and filtering orders.

---

## Tech Stack

### Frontend
- **React**: Core UI framework for component building.
- **Axios**: HTTP client for interfacing with the Backend APIs.
- **Tailwind CSS**: Utility-first CSS styling for responsive layout design.

### Backend
- **Node.js**: Server runtime environment.
- **Express.js**: REST API framework.
- **MongoDB**: NoSQL database for document persistence.
- **Mongoose**: Object Data Modeling (ODM) for database schema enforcement.
- **node-cron**: Background job scheduler scheduling cron automation.

---

## Folder Structure

```
├── Backend/
│   ├── server.js                 # Backend server entrypoint
│   └── src/
│       ├── app.js                # Express app setup and middleware configuration
│       ├── config/               # App configuration, constants, and DB connections
│       ├── controllers/          # HTTP request handlers (Orders & Scheduler controllers)
│       ├── jobs/                 # Cron task registration
│       ├── middleware/           # Middleware (Auth token / secret key verification)
│       ├── models/               # MongoDB Mongoose Schemas (Order, History, Logs)
│       ├── routes/               # API route definitions
│       └── services/             # Core business logic (Scheduler state transitions)
├── frontend/
│   ├── index.html                # Vite HTML template
│   ├── package.json              # Client dependencies and npm scripts
│   └── src/
│       ├── App.css               # Global styles and custom scrollbar definitions
│       ├── App.jsx               # Navigation layout and page router state
│       ├── main.jsx              # React mounting entrypoint
│       ├── pages/                # Views (CreateOrder form and Dashboard table pages)
│       └── services/             # Axios API service client
└── README.md                     # Project documentation
```

---

## Database Design

### Why MongoDB
- **Flexible Schema**: Document storing allows order payloads to accommodate varying product types, shipping metadata, or customer address adjustments over time.
- **ACID Transactions**: Supported via Mongoose/MongoDB sessions, allowing multi-document writes (such as updating an order status and inserting a transition history row) to be committed atomically.

### Collections

#### 1. Order Collection (`orders`)
- **Purpose**: Acts as the single source of truth for the current state of any customer order.
- **Schema**:
  - `orderId`: Unique index matching `ORD-UUID` for external reference.
  - `customerName`: String, required.
  - `phoneNumber`: String, required.
  - `productName`: String, required.
  - `amount`: Number, required.
  - `paymentStatus`: Enum (`PENDING`, `PAID`, `FAILED`). Defaults to `PENDING`.
  - `status`: Enum (`PLACED`, `PROCESSING`, `READY_TO_SHIP`). Defaults to `PLACED`.
  - `lastStatusUpdatedAt`: Date, indexed. Updated whenever order status is transitioned.

#### 2. OrderHistory Collection (`orderhistories`)
- **Purpose**: Records audits of all status changes. Enables tracking who (e.g. system, admin, scheduler) changed the status and when.
- **Schema**:
  - `order`: Reference (`ObjectId`) to the Order document.
  - `fromStatus`: String enum (or `null` for initial creations).
  - `toStatus`: String enum, required.
  - `changedBy`: Enum (`SYSTEM`, `SCHEDULER`, `ADMIN`).
  - `changedAt`: Date timestamp.

#### 3. SchedulerLog Collection (`schedulerlogs`)
- **Purpose**: Provides visibility into background job executions. Logs success, failure, duration, and processed metrics.
- **Schema**:
  - `startedAt`: Date, required.
  - `finishedAt`: Date.
  - `ordersProcessed`: Number.
  - `placedToProcessing`: Number.
  - `processingToReadyToShip`: Number.
  - `executionTime`: Number (milliseconds).
  - `status`: Enum (`RUNNING`, `SUCCESS`, `FAILED`).
  - `message`: String error message or status summary.

---

## API Documentation

### Orders API

#### 1. POST `/api/order/create`
- **Description**: Creates a new order. The database generates unique `orderId`, sets default status to `PLACED`, and registers the initial `OrderHistory` transition.
- **Request Body**:
  ```json
  {
    "customerName": "John Doe",
    "phoneNumber": "9876543210",
    "productName": "Wireless Headphones",
    "amount": 1299
  }
  ```
- **Response** (`201 Created`):
  ```json
  {
    "success": true,
    "message": "Order created successfully",
    "data": { ... }
  }
  ```

#### 2. GET `/api/order`
- **Description**: Retrieves all orders, sorted by newest creation time first.
- **Query Parameters**:
  - `status` (Optional): Filter orders by status enum (`PLACED`, `PROCESSING`, `READY_TO_SHIP`).
- **Response** (`200 OK`):
  ```json
  {
    "success": true,
    "count": 12,
    "data": [ ... ]
  }
  ```

---

### Scheduler API

#### 1. POST `/api/scheduler/run`
- **Description**: Manually triggers the status update transition job. Updates eligible orders and writes execution logs.
- **Headers**:
  - `x-scheduler-key`: Secret auth key to authenticate requests.
- **Response** (`200 OK`):
  ```json
  {
    "success": true,
    "message": "Scheduler execution triggered manually.",
    "log": { ... }
  }
  ```

---

## Environment Variables

The following environment variables must be defined for the Backend server:

```env
PORT=
MONGO_URI=
SCHEDULER_SECRET_KEY=
```

*(Create a `.env` file in the `Backend/` directory based on the names above.)*

---

## Installation

### 1. Clone Repository
```bash
git clone https://github.com/deveshgupta52/DACBY.git
cd DACBY
```

### 2. Backend Setup
```bash
cd Backend
npm install
```
Configure `.env` file containing the environment variables listed above, then start development server:
```bash
npm run dev
```

### 3. Frontend Setup
```bash
cd ../frontend
npm install
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## Scheduler Setup
- **Cron Jobs**: Background job execution is managed using `node-cron` inside `Backend/src/jobs/cron.js`.
- **Interval**: Scheduled to run **every 5 minutes** (`*/5 * * * *`). It finds orders created over 5 minutes ago and transitions their states:
  - `PLACED` -> `PROCESSING`
  - `PROCESSING` -> `READY_TO_SHIP`
- **Manual Control**: Exposes a POST endpoint at `/api/scheduler/run` for force triggering. It is protected by custom middleware requiring the `x-scheduler-key` request header.

---

## System Design Decisions

### Why OrderHistory?
An order schema that only stores the current status doesn't explain *how* it got there. Storing status transitions separately creates a robust audit trail, allowing dashboards to show a timeline and enabling analytics on operational bottlenecks (e.g. tracking how long orders sit in `PROCESSING` status).

### Why SchedulerLog?
Background cron processes run silently. Storing scheduler runs in a dedicated `SchedulerLog` collection ensures operations teams can monitor success rates, execution speeds, and quickly diagnose cron failures by reviewing error messages in the log document.

### Why UUID orderId?
Sequential auto-incrementing integer IDs leak commercial volume details (a competitor could place two orders a day apart and count how many orders you shipped). UUIDs are non-sequential, cryptographically secure, and globally unique.

### How duplicates are prevented?
The `orderId` is indexed with a `unique: true` property in the MongoDB collection schema. If a concurrent database write attempts to insert an identical orderId, MongoDB throws a duplicate key exception.

### How race conditions are handled?
ACID transactions are initiated via `mongoose.startSession()` on order updates. By using transactional sessions, we guarantee that multiple database alterations (such as updating an order record and inserting a history audit log) either succeed together or fail together without leaving orphan states.

### Why lastStatusUpdatedAt?
Instead of querying the history log collection and sorting timestamps to find when an order was last changed, storing `lastStatusUpdatedAt` directly on the `Order` document indexes transitions. The scheduler queries this timestamp directly, boosting search speeds.
