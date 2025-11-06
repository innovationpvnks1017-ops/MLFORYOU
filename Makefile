.PHONY: install-backend install-frontend start-backend start-frontend build-frontend docker-build docker-up docker-down test-backend test-frontend lint-backend lint-frontend format-backend format-frontend

install-backend:
	pip install -r backend/requirements.txt

install-frontend:
	cd frontend && npm install

start-backend:
	cd backend && uvicorn main:app --reload --host 0.0.0.0 --port 8000

start-frontend:
	cd frontend && npm run dev

build-frontend:
	cd frontend && npm run build

docker-build:
	docker-compose build

docker-up:
	docker-compose up

docker-down:
	docker-compose down

test-backend:
	pytest backend/tests/backend

test-frontend:
	cd frontend && npm run test

lint-backend:
	flake8 backend

lint-frontend:
	cd frontend && npx eslint src

format-backend:
	black backend

format-frontend:
	cd frontend && npx prettier --write src
