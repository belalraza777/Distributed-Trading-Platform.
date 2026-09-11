# Auth Service

This service is responsible for user authentication and authorization.

## API Endpoints

### `POST /register`

Registers a new user.

**Request Body:**

```json
{
  "name": "John Doe",
  "email": "john.doe@example.com",
  "password": "password123",
  "phone": "1234567890"
}
```

**Response:**

```json
{
  "accessToken": "...",
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "john.doe@example.com",
    "role": "USER",
    "phone": "1234567890",
    "created_at": "..."
  }
}
```

### `POST /login`

Logs in an existing user.

**Request Body:**

```json
{
  "email": "john.doe@example.com",
  "password": "password123"
}
```

**Response:**

Sets a `refreshToken` cookie and returns an `accessToken`.

```json
{
  "accessToken": "...",
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "john.doe@example.com",
    "role": "USER",
    "phone": "1234567890",
    "created_at": "..."
  }
}
```

### `POST /logout`

Logs out a user by invalidating their refresh token.

**Request Body:**

```json
{
  "refreshToken": "..."
}
```

**Response:**

```json
{
  "message": "User logged out successfully"
}
```

### `POST /refresh`

Refreshes an access token using a refresh token.

**Request:**

The refresh token is sent as an `httpOnly` cookie.

**Response:**

```json
{
  "accessToken": "..."
}
```

### `GET /profile`

Retrieves the profile of the currently authenticated user.

**Headers:**

- `Authorization`: `Bearer <accessToken>`

**Response:**

```json
{
  "id": 1,
  "name": "John Doe",
  "email": "john.doe@example.com",
  "role": "USER",
  "phone": "1234567890",
  "created_at": "..."
}
```

### `PATCH /profile`

Updates the authenticated user's profile. The request is JWT-protected and validated by the service.

### `PATCH /change-password`

Changes the authenticated user's password. The request is JWT-protected.

### `GET /health`

Checks the service's PostgreSQL connection. The default port is `3001`.

## Configuration

```env
PORT=3001
DATABASE_URL=postgresql://postgres:password@localhost:5432/trading_auth_service?schema=public
JWT_SECRET=shared-jwt-secret
RABBIT_URL=amqp://localhost
INTERNAL_SECRET=shared-internal-secret
```

## Internal endpoints

Trusted services must send the shared `x-internal-secret` header. Missing or invalid values return `403 Forbidden`.

### `GET /internal/users`

Returns all users without password hashes.

### `GET /internal/users/:id`

Retrieves user data by ID.

**Headers:**

- `x-internal-secret`: `<INTERNAL_SECRET>`

**Response:**

```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "John Doe",
    "email": "john.doe@example.com",
    "role": "USER",
    "phone": "1234567890",
    "created_at": "..."
  }
}
```

### `GET /internal/stats`

Returns `{ "totalUsers": number }` for dashboard aggregation.
