# Sabipath

A modern full-stack application with Next.js frontend, FastAPI backend, and PostgreSQL database.

## Project Structure

```
sabipath/
├── frontend/          # Next.js + TypeScript + Tailwind CSS
├── backend/           # Python + FastAPI
├── docker-compose.yml # Docker configuration
└── README.md         # This file
```

## Getting Started

### Prerequisites
- Node.js 18+ (for frontend)
- Python 3.11+ (for backend)
- Docker & Docker Compose (optional)

### Quick Start

#### Option 1: Using Docker Compose

```bash
docker-compose up
```

The application will be available at:
- Frontend: http://localhost:3000
- API: http://localhost:8000
- API Docs: http://localhost:8000/docs

#### Option 2: Manual Setup

**Frontend:**
```bash
cd frontend
npm install
npm run dev
```

**Backend:**
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
python main.py
```

## Development

### Frontend Development
- Navigate to `frontend/` directory
- Make changes to pages in `pages/` or components
- Hot reload is enabled by default

### Backend Development
- Navigate to `backend/` directory
- Make changes to `main.py` or create new modules
- API documentation available at http://localhost:8000/docs

## API Documentation

Once the backend is running, visit http://localhost:8000/docs for interactive API documentation.

## Environment Variables

Create a `.env` file in the `backend/` directory:

```
DATABASE_URL=postgresql://user:password@localhost:5432/sabipath
DEBUG=True
```

## Technologies Used

- **Frontend:** Next.js, TypeScript, Tailwind CSS
- **Backend:** FastAPI, Python
- **Database:** PostgreSQL
- **Containerization:** Docker

## License

MIT
