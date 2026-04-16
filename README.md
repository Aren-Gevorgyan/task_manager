# Task Manager with Live Activity Feed

Small full-stack task manager:
- Backend: Node.js, Express, MongoDB, WebSocket (`ws`)
- Frontend: React (Vite), simple admin UI
- Features: JWT auth, task CRUD, outbound callbacks, inbound payment webhook with HMAC verification + idempotency, real-time event feed

## 1) Prerequisites

- Node.js 20+
- MongoDB running locally (`mongodb://127.0.0.1:27017`)

## 2) Install

From project root:

```bash
cd backend && npm install
cd ../frontend && npm install
```

## 3) Backend setup

```bash
cd backend
cp .env.example .env
npm run dev
```

Backend runs on `http://localhost:3000`.

Hardcoded test user (can be changed via `.env`):
- username: `admin`
- password: `password123`

## 4) Frontend setup

In a second terminal:

```bash
cd frontend
npm run dev
```

Frontend runs on `http://localhost:5173`.

## 5) API Summary

### Auth
- `POST /auth/login` -> `{ token }`

### Tasks
- `GET /tasks` (public), optional filter `?status=pending|done|cancelled`
- `POST /tasks` (JWT required)
- `PATCH /tasks/:id` (JWT required)
- `DELETE /tasks/:id` (JWT required)

When task status changes to `done`:
- server broadcasts `task_updated` via WebSocket
- server dispatches non-blocking callbacks to registered URLs

### Callbacks
- `POST /callbacks/register` (JWT required)
```json
{
  "url": "https://webhook.site/your-id",
  "event": "task.completed"
}
```

Dispatch behavior:
- 5-second timeout
- retry once on non-2xx or request failure
- errors are logged, never crash the server

### Incoming webhook
- `POST /webhooks/payment` (public)
```json
{
  "taskId": "TASK_ID",
  "status": "paid",
  "webhookId": "unique-event-id"
}
```

Requirements implemented:
- verifies HMAC SHA-256 signature from `x-signature`
- idempotent by `webhookId` (duplicates ignored)
- responds `200 OK` immediately
- processes asynchronously
- broadcasts `webhook_received` after processing

## 6) WebSocket

Connect with JWT query param:

`ws://localhost:3000?token=YOUR_JWT`

Events:
- `task_updated`
- `webhook_received`

## 7) Testing quickly with curl

### Login
```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"password123"}'
```

### Create task
```bash
curl -X POST http://localhost:3000/tasks \
  -H "Authorization: Bearer YOUR_JWT" \
  -H "Content-Type: application/json" \
  -d '{"title":"Ship release","assignee":"Alex","dueDate":"2026-04-20"}'
```

### Register callback
```bash
curl -X POST http://localhost:3000/callbacks/register \
  -H "Authorization: Bearer YOUR_JWT" \
  -H "Content-Type: application/json" \
  -d '{"url":"https://webhook.site/your-id","event":"task.completed"}'
```

### Send payment webhook
Generate a signature using your `WEBHOOK_SECRET` and exact JSON body.

Example body:
```json
{"taskId":"TASK_ID","status":"paid","webhookId":"evt-1"}
```

Node one-liner to generate signature:
```bash
node -e "const c=require('crypto');const b='{\"taskId\":\"TASK_ID\",\"status\":\"paid\",\"webhookId\":\"evt-1\"}';console.log(c.createHmac('sha256','dev_webhook_secret').update(b).digest('hex'))"
```

Then call webhook:
```bash
curl -X POST http://localhost:3000/webhooks/payment \
  -H "Content-Type: application/json" \
  -H "x-signature: sha256=YOUR_SIGNATURE" \
  -d '{"taskId":"TASK_ID","status":"paid","webhookId":"evt-1"}'
```
