.PHONY: help install dev build test docker-up docker-down docker-build docker-test clean

help: ## Show this help message
	@echo 'Usage: make [target]'
	@echo ''
	@echo 'Available targets:'
	@awk 'BEGIN {FS = ":.*?## "} /^[a-zA-Z_-]+:.*?## / {printf "  %-15s %s\n", $$1, $$2}' $(MAKEFILE_LIST)

install: ## Install all dependencies
	cd backend && npm install
	cd frontend && npm install

dev: ## Start development servers
	docker-compose up

build: ## Build all services
	cd backend && npm run build
	cd frontend && npm run build

test: ## Run all tests
	cd backend && npm test && npm run test:e2e

docker-up: ## Start Docker containers
	docker-compose up -d

docker-down: ## Stop Docker containers
	docker-compose down

docker-build: ## Build Docker images
	docker-compose build

docker-test: ## Test Docker setup
	docker-compose up -d
	@echo "Waiting for services to be ready..."
	@sleep 10
	@curl -f http://localhost:3001/health || (docker-compose logs && exit 1)
	@curl -f http://localhost:3000 || (docker-compose logs && exit 1)
	@echo "All services are healthy!"

clean: ## Clean up generated files
	cd backend && rm -rf dist node_modules coverage
	cd frontend && rm -rf .next node_modules out
	docker-compose down -v


