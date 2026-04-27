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

Backend runs on `http://localhost:3000` (direct) and via Nginx at `http://localhost/api`.

Hardcoded test user (can be changed via `.env`):
- username: `admin`
- password: `password123`

## 4) Frontend setup

In a second terminal:

```bash
cd frontend
npm run dev
```

Frontend runs on `http://localhost:5173` (direct Vite) and through Nginx at `http://localhost`.

## Telegram Bot App

To run this project from Telegram as a Web App launcher:

1. Create your bot via [@BotFather](https://t.me/BotFather) and copy the token.
2. Use a public HTTPS URL for your app (for example, an ngrok tunnel to `http://localhost`).
3. Create bot env file:

```bash
cp telegram-bot/.env.example telegram-bot/.env
```

Then set:
- `TELEGRAM_BOT_TOKEN=...`
- `TELEGRAM_WEB_APP_URL=https://your-public-https-url`

4. Start all services:

```bash
docker compose up --build
```

5. Open your bot in Telegram and send `/start`, then tap **Open Task Manager**.

## Docker (Compose + Volumes)

From project root:

```bash
docker compose up --build
```

What this does:
- starts `mongo`, `backend`, and `frontend`
- starts `nginx` as a reverse proxy (`http://localhost`)
- keeps MongoDB data in named volume `mongo_data`
- mounts `./backend` and `./frontend` into containers for live code reload
- keeps container `node_modules` in named volumes so host and container deps do not conflict
- routes `/api/*` to backend and `/ws` websocket traffic to backend

Stop containers:

```bash
docker compose down
```

Stop and remove volumes too:

```bash
docker compose down -v
```

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

### UI helper for payment simulation
If you prefer not to compute signatures manually, use the frontend section **Payment webhook simulator**.
It calls an authenticated helper endpoint:

- `POST /webhooks/payment/simulate` (JWT required)
- payload: `{ "taskId": "...", "status": "paid" | "failed" }`

This helper immediately queues webhook processing and still triggers the same websocket event flow used by the real webhook handler.
