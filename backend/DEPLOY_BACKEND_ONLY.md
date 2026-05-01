# Backend-Only Deploy (Standalone)

This backend folder is now standalone.

You can copy only `backend/` to your server and run it with Docker Compose.

## 1) Copy folder

Upload/copy the `backend` folder to the server.

## 2) Create env file

Inside server `backend/` directory:

```bash
cp .env.example .env
```

Edit `.env` and set production values:

- `JWT_SECRET`
- `WEBHOOK_SECRET`
- `CORS_ORIGIN`
- `TEST_USER`
- `TEST_PASSWORD`

## 3) Run backend stack

From `backend/`:

```bash
docker compose up -d --build
```

This starts:

- `mongo` on `27017`
- `backend` API on `3000`
- backend UDP listener on `4000/udp`

## 4) Useful commands

Logs:

```bash
docker compose logs -f backend mongo
```

Status:

```bash
docker compose ps
```

Stop:

```bash
docker compose down
```

Stop and delete DB volume:

```bash
docker compose down -v
```
