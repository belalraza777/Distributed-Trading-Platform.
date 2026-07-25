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

### `GET /:id`

Retrieves user data by ID. This endpoint is intended for internal service-to-service communication and requires an internal auth key.

**Headers:**

- `x-internal-auth-key`: `<internal_auth_key>`

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
