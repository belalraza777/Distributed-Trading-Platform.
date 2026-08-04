# ============================================================
# Trading Microservices - Docker Commands
# ============================================================

# Build all Docker images
build:
	docker compose build

# Start all containers
up:
	docker compose up

# Start all containers in background
up-bg:
	docker compose up -d

# Stop all containers
down:
	docker compose down

# Stop containers and remove volumes (fresh database)
reset:
	docker compose down -v

# View logs of all services
logs:
	docker compose logs -f

# View logs of a single service
# Usage: make logs-service s=auth-service
logs-service:
	docker compose logs -f $(s)

# Show running containers
ps:
	docker compose ps

# Restart all containers
restart:
	docker compose restart

# Open a shell inside a container
# Usage: make shell s=auth-service
shell:
	docker compose exec $(s) sh

# ============================================================
# Prisma
# ============================================================

migrate:
	docker compose exec auth-service npx prisma migrate deploy
	docker compose exec market-data-service npx prisma migrate deploy
	docker compose exec order-service npx prisma migrate deploy
	docker compose exec portfolio-service npx prisma migrate deploy
	docker compose exec wallet-service npx prisma migrate deploy
	docker compose exec admin-service npx prisma migrate deploy
	docker compose exec notification-service npx prisma db push

generate:
	docker compose exec auth-service npx prisma generate
	docker compose exec market-data-service npx prisma generate
	docker compose exec order-service npx prisma generate
	docker compose exec portfolio-service npx prisma generate
	docker compose exec wallet-service npx prisma generate
	docker compose exec admin-service npx prisma generate
	docker compose exec notification-service npx prisma generate