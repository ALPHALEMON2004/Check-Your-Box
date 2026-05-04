# One Milion Check Box with Location Tracker

An interactive checkbox app where users can view the board publicly, register or log in, and then use authenticated WebSocket actions to tick boxes. The project combines Express, Socket.IO, Drizzle ORM, PostgreSQL, and Redis/Valkey.

## Project Overview

This project is a real-time checkbox board backed by a database and a Redis-based state layer. Users can open the page without logging in, but ticking a checkbox is protected by authentication. If a user is not signed in, the app redirects them to the login page before allowing interaction.

Additionally, the app includes a **real-time location tracking feature** where authenticated users can view the live locations of all connected peers on an interactive map. The location page is protected by server-side middleware that verifies JWT tokens—unauthenticated access is automatically redirected to sign in.

## Tech Stack

- Node.js
- Express
- Socket.IO
- Drizzle ORM
- PostgreSQL
- Redis / Valkey
- Kafka
- JWT
- ioredis
- Leaflet.js (for interactive maps)
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
- **Auth-protected location page** with server-side middleware
- **Real-time location tracking** via Kafka and WebSocket broadcasts
- **Interactive map** (Leaflet.js) for viewing peer locations

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

## Location Page Authentication Flow

The location page is protected using **server-side middleware** similar to the checkbox interaction pattern:

1. A user clicks **"See Everyone's Location"** on the main page.
2. The browser checks if an `authToken` exists in localStorage.
3. If no token exists, the user is redirected to the sign-in page with a redirect parameter.
4. After successful login, the token is stored in both localStorage and a secure HTTP cookie.
5. The user is redirected back to the location page (`/location`).
6. The Express server middleware (`requireLocationAuth`) validates the JWT from the request.
7. If the token is valid, the user sees the Leaflet.js map.
8. If the token is invalid or missing, the user is automatically redirected to sign in.

## Real-Time Location Tracking Flow

1. When authenticated, the user's browser requests geolocation every 10 seconds.
2. The browser emits the coordinates via Socket.IO: `client-location-update`.
3. The server receives the location and publishes it to a **Kafka topic** (`location-updates`).
4. A **Kafka consumer** running in the main server listens for location updates.
5. On each update, the server broadcasts `server:location-update` to all connected clients via Socket.IO.
6. The client-side map (Leaflet.js) receives the update and displays/updates markers for each peer.
7. The user's own location is displayed with a distinct marker labeled **"You are here!!!"**.
8. All peer locations are displayed with markers labeled by their socket IDs.

## Kafka Integration

Kafka is used to decouple location updates and ensure real-time broadcasting across all server instances:

- **Producer:** Publishes location data to the `location-updates` topic.
- **Consumer:** Subscribes to the topic and broadcasts updates to all Socket.IO clients.
- This architecture supports horizontal scaling—multiple server instances can consume from the same Kafka topic.

## Screenshots or Demo Link

Demo video link: https://www.youtube.com/watch?v=agqUKGBd3YA



