# 🐳 Docker Guide - Trading Microservices

This document explains how Docker is used in this project.

The goal is to understand **what each Docker file does**, **where it belongs**, and **how to run the entire project**.

---

# What is Docker?

Docker lets us package our application with everything it needs.

Instead of installing Node.js, PostgreSQL, and other software manually, Docker creates isolated **containers** that run everything for us.

Think of a container as a **small computer** that runs only one application.

---

# Docker in This Project

This project contains:

* API Gateway
* Auth Service
* Market Data Service
* Notification Service
* Order Service
* Portfolio Service
* Wallet Service
* Admin Service
* PostgreSQL

Each service runs inside its own Docker container.

```
                 Docker

        ┌─────────────────────┐
        │   API Gateway       │
        ├─────────────────────┤
        │   Auth Service      │
        ├─────────────────────┤
        │ Market Data Service │
        ├─────────────────────┤
        │ Notification Service│
        ├─────────────────────┤
        │   Order Service     │
        ├─────────────────────┤
        │ Portfolio Service   │
        ├─────────────────────┤
        │   Wallet Service    │
        ├─────────────────────┤
        │   Admin Service     │
        ├─────────────────────┤
        │    PostgreSQL       │
        └─────────────────────┘
```

---

# Docker File Structure

```
Trading-Microservices/
│
├── docker-compose.yml
├── Makefile
│
├── docker/
│   └── init.sql
│
├── api-gateway/
│   ├── Dockerfile
│   ├── .dockerignore
│   └── .env
│
├── auth-service/
│   ├── Dockerfile
│   ├── .dockerignore
│   └── .env
│
├── market-data-service/
│   ├── Dockerfile
│   ├── .dockerignore
│   └── .env
│
├── notification-service/
│   ├── Dockerfile
│   ├── .dockerignore
│   └── .env
│
├── order-service/
│   ├── Dockerfile
│   ├── .dockerignore
│   └── .env
│
├── portfolio-service/
│   ├── Dockerfile
│   ├── .dockerignore
│   └── .env
│
├── wallet-service/
│   ├── Dockerfile
│   ├── .dockerignore
│   └── .env
│
└── admin-service/
    ├── Dockerfile
    ├── .dockerignore
    └── .env
```

---

# Docker Files

## 1. Dockerfile

Location:

```
Every service/
    Dockerfile
```

Purpose:

Builds one service.

The same Dockerfile is used in all services because every service is built with TypeScript.

It performs these steps:

* Uses Node.js
* Installs dependencies
* Generates Prisma Client
* Builds TypeScript
* Creates a small production image
* Starts the application

One Dockerfile = One Service

---

## 2. .dockerignore

Location:

```
Every service/
    .dockerignore
```

Purpose:

Prevents unnecessary files from being copied into Docker images.

Ignored files include:

* node_modules
* dist
* .git
* .env
* coverage

This makes Docker builds faster and images smaller.

---

## 3. docker-compose.yml

Location:

```
Project Root
```

Purpose:

Starts the entire project.

Instead of starting every service one by one, Docker Compose starts everything together.

It starts:

* PostgreSQL
* API Gateway
* Auth Service
* Market Data Service
* Notification Service
* Order Service
* Portfolio Service
* Wallet Service
* Admin Service

One command:

```bash
docker compose up
```

---

## 4. docker/init.sql

Location:

```
docker/
    init.sql
```

Purpose:

Automatically creates all PostgreSQL databases.

Databases created:

* trading_auth_service
* trading_market_data_service
* trading_notification_service
* trading_order_service
* trading_portfolio_service
* trading_wallet_service
* trading_admin_service

This file runs only the first time PostgreSQL starts.

---

## 5. Makefile

Location:

```
Project Root
```

Purpose:

Provides short commands for Docker.

Instead of writing long Docker commands, use simple commands like:

```bash
make build
make up
make down
make logs
make migrate
```

---

# Environment Files

Each service has its own `.env` file.

Example:

```
auth-service/.env
wallet-service/.env
order-service/.env
```

Docker Compose loads the correct `.env` for each service.

There is **no root `.env` file** in this project.

---

# Project Flow

## Step 1

Docker builds every service.

```
Dockerfile
      │
      ▼
Docker Image
```

---

## Step 2

Docker Compose starts PostgreSQL.

```
PostgreSQL Container
```

---

## Step 3

PostgreSQL automatically runs:

```
docker/init.sql
```

This creates all databases.

---

## Step 4

Docker starts every microservice.

```
Auth

Market

Order

Portfolio

Wallet

Notification

Admin
```

---

## Step 5

Finally, Docker starts the API Gateway.

The Gateway communicates with all services.

Clients only access:

```
http://localhost:3000
```

---

# Complete Startup Flow

```
docker compose up
        │
        ▼
Build Images
        │
        ▼
Start PostgreSQL
        │
        ▼
Run init.sql
        │
        ▼
Create Databases
        │
        ▼
Start Microservices
        │
        ▼
Start API Gateway
        │
        ▼
Application Ready
```

---

# Daily Workflow

## Build Images

```bash
make build
```

---

## Start Project

```bash
make up
```

---

## Run Database Migrations

```bash
make migrate
```

---

## View Logs

```bash
make logs
```

---

## View One Service Logs

```bash
make logs-service s=auth-service
```

---

## Stop Project

```bash
make down
```

---

## Reset Everything

```bash
make reset
```

This removes containers and the PostgreSQL volume.

The next time the project starts, `init.sql` creates fresh databases again.

---

# Docker Commands Summary

| Command                            | Purpose                               |
| ---------------------------------- | ------------------------------------- |
| `make build`                       | Build all Docker images               |
| `make up`                          | Start all containers                  |
| `make up-bg`                       | Start containers in background        |
| `make down`                        | Stop all containers                   |
| `make reset`                       | Delete containers and database volume |
| `make logs`                        | View logs of all services             |
| `make logs-service s=auth-service` | View logs of one service              |
| `make migrate`                     | Run Prisma migrations                 |
| `make generate`                    | Generate Prisma Client                |
| `make ps`                          | Show running containers               |
| `make restart`                     | Restart all containers                |
| `make shell s=auth-service`        | Open a shell inside a container       |

---

# Quick Recap

* **Dockerfile** → Builds one service.
* **.dockerignore** → Excludes unnecessary files.
* **docker-compose.yml** → Runs the complete project.
* **init.sql** → Creates PostgreSQL databases.
* **Makefile** → Provides easy Docker commands.
* **Each service has its own `.env`**.
* **One PostgreSQL container serves all services**, with a separate database for each service.

# 🚀 Getting Started

Follow these steps to run the project on your local machine.

## Prerequisites

Make sure you have installed:

* Git
* Docker Desktop (Windows/macOS) or Docker Engine (Linux)
* Docker Compose (comes with Docker Desktop)

Verify the installation:

```bash
git --version
docker --version
docker compose version
```

---

# 1. Clone the Repository

```bash
git clone <repository-url>
cd Trading-Microservices
```

---

# 2. Configure Environment Variables

Each microservice has its own `.env` file.

Open every service's `.env` file and update the required values if needed.

Example:

```text
api-gateway/.env
auth-service/.env
market-data-service/.env
notification-service/.env
order-service/.env
portfolio-service/.env
wallet-service/.env
admin-service/.env
```

Make sure database URLs use:

```env
postgres
```

instead of

```env
localhost
```

Example:

```env
DATABASE_URL=postgresql://postgres:password@postgres:5432/trading_auth_service?schema=public
```

If you use external services such as CloudAMQP or Upstash Redis, update their URLs in the corresponding `.env` files.

---

# 3. Build Docker Images

```bash
make build
```

This command builds Docker images for all microservices.

---

# 4. Start the Project

```bash
make up
```

Docker will:

* Start PostgreSQL
* Create all databases automatically
* Start all microservices
* Start the API Gateway

The first startup may take a few minutes.

---

# 5. Run Database Migrations

After all containers are running:

```bash
make migrate
```

This creates the required database tables.

---

# 6. Verify Everything

Check running containers:

```bash
make ps
```

View logs:

```bash
make logs
```

Open the application:

```text
http://localhost:3000
```

---

# Daily Development

Start the project:

```bash
make up
```

Stop the project:

```bash
make down
```

View logs:

```bash
make logs
```

Restart everything:

```bash
make restart
```

---

# Fresh Database

If you want a completely fresh setup:

```bash
make reset
make up
make migrate
```

This removes all PostgreSQL data and recreates the databases.

---

# Useful Commands

| Command                            | Description                           |
| ---------------------------------- | ------------------------------------- |
| `make build`                       | Build all Docker images               |
| `make up`                          | Start all containers                  |
| `make up-bg`                       | Start containers in the background    |
| `make down`                        | Stop all containers                   |
| `make reset`                       | Remove containers and database volume |
| `make logs`                        | View logs of all services             |
| `make logs-service s=auth-service` | View logs of one service              |
| `make migrate`                     | Run Prisma migrations                 |
| `make generate`                    | Generate Prisma Client                |
| `make restart`                     | Restart all containers                |
| `make ps`                          | Show running containers               |
| `make shell s=auth-service`        | Open a shell inside a container       |

---

# Common Issues

### PostgreSQL connection failed

* Make sure PostgreSQL container is running:

  ```bash
  make ps
  ```
* Verify `DATABASE_URL` uses `postgres` as the hostname, not `localhost`.

---

### Build failed

Rebuild images:

```bash
make build
```

---

### Prisma migration failed

Ensure all containers are running before executing:

```bash
make migrate
```

---

### Port already in use

Check if another application is using ports such as `3000` or `5432`, then stop that application or change the port mapping in `docker-compose.yml`.
