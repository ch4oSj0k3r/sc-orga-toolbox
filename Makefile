.PHONY: help dev up down restart db-migrate db-studio db-push lint format

# Standard-Target: Zeigt die Hilfe an
.DEFAULT_GOAL := help

help:
	@echo "========================================================================"
	@echo "    SC ORGA TOOLBOX - AVAILABLE COMMANDS"
	@echo "========================================================================"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-15s\033[0m %s\n", $$1, $$2}'

dev: ## Startet den Next.js Entwicklungsserver
	npm run dev

up: ## Startet die Docker-Container (MariaDB) im Hintergrund
	docker compose up -d

down: ## Stoppt die Docker-Container
	docker compose down

restart: ## Startet die Docker-Container neu
	docker compose down && docker compose up -d

db-migrate: ## Erstellt und feuert eine neue Prisma-Migration ab (z.B. make db-migrate NAME=add_roles)
	npx prisma migrate dev --name $(NAME)

db-push: ## Drückt das Prisma-Schema direkt in die DB (ohne Migrations-Historie)
	npx prisma db push

db-studio: ## Startet Prisma Studio auf Port 5555
	npx prisma studio --port 5555

lint: ## Überprüft den Code mit ESLint
	npm run lint

format: ## Formatiert das gesamte Projekt mit Prettier
	npx prettier --write .