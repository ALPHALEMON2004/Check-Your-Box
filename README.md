# One Milion Check Box

An interactive checkbox app where users can view the board publicly, register or log in, and then use authenticated WebSocket actions to tick boxes. The project combines Express, Socket.IO, Drizzle ORM, PostgreSQL, and Redis/Valkey.

## Project Overview

This project is a real-time checkbox board backed by a database and a Redis-based state layer. Users can open the page without logging in, but ticking a checkbox is protected by authentication. If a user is not signed in, the app redirects them to the login page before allowing interaction.

## Tech Stack

- Node.js
- Express
- Socket.IO
- Drizzle ORM
- PostgreSQL
- Redis / Valkey
- JWT
- ioredis
- dotenv

## Features Implemented

- Public checkbox page
- User registration
- User login
- JWT-based authentication
- WebSocket-based checkbox updates
- Redis-backed checkbox state sharing
- Rate limiting per socket connection
- OIDC-style discovery, JWKS, and userinfo endpoints
- Auth-gated checkbox interaction

## How to Run Locally

1. Install dependencies:

```bash
pnpm install
```

2. Start Redis, Valkey, and PostgreSQL:

```bash
docker compose up -d
```

3. Generate and apply database migrations:

```bash
pnpm db:generate
pnpm db:migrate
```

4. Start the app:

```bash
pnpm start
```

5. Open the app in your browser:

```text
http://localhost:4000
```

## Environment Variables Required

Create a `.env` file in the project root with:

```env
DATABASE_URL=postgresql://admin:admin@localhost:5432/oidc_auth
PORT=4000
```

Notes:
- `DATABASE_URL` is required for Drizzle and PostgreSQL access.
- `PORT` is optional; the app defaults to `4000`.

## Redis Setup Instructions

Redis is used through a local Valkey container. The app connects to:

- Host: `localhost`
- Port: `6379`

Run the services with:

```bash
docker compose up -d
```

This starts:

- `valkey` on port `6379`
- `postgres` on port `5432`

If you want to use a standalone Redis server instead of Valkey, keep the same host and port configuration unless you also update `redis-connection.js`.

## Auth Flow Explanation

1. A user opens the login page and submits email and password.
2. The server checks the user in PostgreSQL.
3. If the credentials are valid, the server signs a JWT.
4. The browser stores the token in `localStorage`.
5. The checkbox page loads and sends the token during the Socket.IO handshake when available.
6. If the user is not logged in, the page still loads, but clicking a checkbox sends the user to the login page.

## WebSocket Flow Explanation

1. The browser connects to Socket.IO.
2. If a token exists, it is sent in the socket auth payload.
3. The server reads the token and attaches user details to the socket when valid.
4. Checkbox changes are emitted from the browser as `client:check:clicked`.
5. The server updates Redis, publishes the change, and broadcasts it back to all connected clients.

## Rate Limiting Logic Explanation

To prevent rapid repeated clicks, the server stores a timestamp in Redis using a key derived from the socket id.

- Each socket can trigger a checkbox update only once every 4 seconds.
- If a click arrives too soon, the server returns an error and rejects the update.
- This keeps the UI stable and reduces spammy updates.

## Screenshots or Demo Link

Demo video link: 

Screenshots:

- 
- 
- 

