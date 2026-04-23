<!-- Use this file to provide workspace-specific custom instructions to Copilot. -->

# Sabipath Project Setup

## Project Description
Sabipath is a full-stack web application with:
- **Frontend**: Next.js 15+ with TypeScript and Tailwind CSS
- **Backend**: Python FastAPI with PostgreSQL
- **Database**: PostgreSQL 16
- **Containerization**: Docker & Docker Compose

## Development Workflow
- Frontend development: `cd frontend && npm run dev` (runs on http://localhost:3000)
- Backend development: `cd backend && python main.py` (runs on http://localhost:8000)
- Full stack with Docker: `docker-compose up`

## Key Files
- `/frontend/` - Next.js application
- `/backend/main.py` - FastAPI application entry point
- `/docker-compose.yml` - Container orchestration
- `/README.md` - Project documentation

## Coding Guidelines
- Use TypeScript for frontend code
- Use Python type hints for backend code
- Follow PEP 8 for Python code
- Maintain consistent code style across the project

## Testing & Debugging
- API documentation: http://localhost:8000/docs (Swagger UI)
- Frontend development: `npm run dev` with hot reload
- Backend: Use `--reload` flag for auto-reload during development
