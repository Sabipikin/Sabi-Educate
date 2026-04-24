# Sabipath

A comprehensive learning management system (LMS) built with modern web technologies. Features course enrollment, program management, diploma pathways, portfolio building, and gamification.

## 🚀 Features

### Core Learning Platform
- **Course Management**: Create and manage courses with modules, lessons, and assessments
- **Program Pathways**: Structured learning programs with multiple courses
- **Diploma Systems**: Complete diploma pathways with program hierarchies
- **Progress Tracking**: Detailed progress tracking for courses, programs, and diplomas
- **Assessments & Quizzes**: Interactive assessments with scoring and feedback

### User Management
- **Multi-Role System**: Students, Teachers, Admins, and Super Admins
- **Authentication**: Secure JWT-based authentication
- **Public Browsing**: Guest users can explore courses without registration
- **Enrollment System**: Flexible enrollment with payment integration

### Advanced Features
- **Portfolio Builder**: Create professional portfolios with projects and CV
- **Gamification**: Points, streaks, and achievements system
- **Admin Dashboard**: Comprehensive admin panel for content management (separate repository)
- **Subscription Management**: Handle user subscriptions and payments
- **AI-Powered Career Guidance**: Smart career recommendations

### Technical Features
- **Responsive Design**: Mobile-first design with Tailwind CSS
- **Real-time Progress**: Live progress updates and notifications
- **API Documentation**: Interactive API docs with Swagger/OpenAPI
- **Docker Support**: Containerized deployment with Docker Compose

## 🏗️ Project Structure

```
sabipath/
├── frontend/           # Student/Teacher frontend (Next.js)
│   ├── components/     # Reusable components
│   ├── pages/          # Application pages
│   ├── services/       # API services
│   └── context/        # React context providers
├── backend/            # FastAPI backend
│   ├── routes/         # API route handlers
│   ├── models/         # SQLAlchemy models
│   ├── schemas/         # Pydantic schemas
│   └── main.py         # Application entry point
├── docker-compose.yml  # Docker configuration
└── README.md           # This file
```

## 🛠️ Tech Stack

### Frontend
- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State Management**: React Context + Hooks
- **Icons**: Custom SVG icons

### Backend
- **Framework**: FastAPI
- **Language**: Python 3.11+
- **Database**: PostgreSQL with SQLAlchemy
- **Authentication**: JWT tokens
- **Documentation**: Auto-generated OpenAPI/Swagger

### DevOps
- **Containerization**: Docker & Docker Compose
- **Database**: PostgreSQL
- **Environment**: Python virtual environments

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ (for frontend)
- Python 3.11+ (for backend)
- Docker & Docker Compose (optional)
- PostgreSQL (if not using Docker)

### Quick Start with Docker

```bash
# Clone the repository
git clone <repository-url>
cd sabipath

# Start all services
docker-compose up -d

# Access the applications
# Frontend: http://localhost:3000
# API: http://localhost:8000
# API Docs: http://localhost:8000/docs
```

### Manual Setup

#### 1. Backend Setup
```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Set up environment variables
cp .env.example .env
# Edit .env with your database credentials

# Run the backend
python main.py
```

#### 2. Cloud Database Setup
For cloud deployment, use a managed PostgreSQL provider and point `DATABASE_URL` to your hosted database.

- **Supabase**: create a project, copy the `DATABASE_URL`, and set it in `.env`
- **Neon**: create a database and use the generated connection string
- **Railway / Heroku Postgres**: use the provided Postgres URL

Example `.env` for cloud deployment:

```env
DATABASE_URL=postgresql://user:password@db-host:5432/sabipath
DEBUG=False
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-supabase-service-key
```

### Recommended web-based database options
- **Supabase**: managed Postgres, realtime APIs, auth, storage, and easy migrations
- **Neon**: serverless Postgres with connection pooling
- **Railway**: easy database provisioning and URL-based config
- **Heroku Postgres**: reliable managed Postgres with simple deployment

The backend already supports cloud Postgres by reading `DATABASE_URL` from environment variables, so deployment can use any managed Postgres service.

### Neon Postgres Setup
Neon is a great choice for cloud testing and deployment. To use Neon with this app:

1. Create a Neon project at https://neon.tech
2. Create a database branch (usually `main` or `dev`)
3. Copy the connection string from the Neon dashboard
4. Set `DATABASE_URL` in `backend/.env` to the Neon URL

Example Neon `.env` entry:
```env
DATABASE_URL=postgresql://<username>:<password>@<host>:5432/<database>?sslmode=require
DEBUG=False
```

> If your Neon URL does not already include `sslmode=require`, add it manually.

#### Getting Your Neon Connection String
1. Visit [Neon Console](https://console.neon.tech)
2. Select your project (should be named something like "Sabipikin/Sabi-Educate")
3. Go to **Dashboard** → **Connection Details**
4. Copy the full connection string
5. Update `backend/.env` with this string

Your connection string should look like:
```
postgresql://neondb_owner:AbCdEfGhIjKl@ep-cool-mode-123456.us-east-1.aws.neon.tech/neondb?sslmode=require
```

#### Testing Your Neon Connection
After setting up your `.env` file, test the connection:

```bash
cd backend
python3 test_neon.py
```

This script will:
- Test your database connection
- Create all required tables
- Verify everything is working

If the test passes, you can start your backend server.

### GitHub Actions Integration with Neon
This repository includes a GitHub Actions workflow (`.github/workflows/neon_workflow.yml`) that automatically creates database branches for pull requests and deletes them when PRs are closed.

#### Setup GitHub Actions for Neon
To enable the Neon GitHub Actions workflow:

1. **Get your Neon Project ID**:
   - Go to your Neon project dashboard
   - Copy the Project ID from the project settings

2. **Create a Neon API Key**:
   - Go to Neon Console → Account → Developer Settings
   - Generate a new API key

3. **Configure GitHub Repository Secrets**:
   - Go to your GitHub repository → Settings → Secrets and variables → Actions
   - Add these secrets:
     - `NEON_API_KEY`: Your Neon API key
   - Add these variables (Repository variables):
     - `NEON_PROJECT_ID`: Your Neon project ID

4. **Optional: Enable Schema Diff Comments**:
   - If you want PR comments showing database schema changes, uncomment the schema diff section in `neon_workflow.yml`
   - Add these permissions to the workflow:
   ```yaml
   permissions:
     contents: read
     pull-requests: write
   ```
#### GitHub Actions Enhancements
The Neon workflow now includes these advanced features:

- **Database Setup**: Automatically creates all tables on new branches
- **Database Testing**: Runs comprehensive database tests
- **API Testing**: Starts the API server and tests endpoints
- **Schema Diff Comments**: Posts database schema changes as PR comments

#### Workflow Permissions
The workflow requires these GitHub permissions:
```yaml
permissions:
  contents: read
  pull-requests: write
```

These are automatically configured in the workflow file.
#### How the Neon Workflow Works
- **On PR Open/Reopen/Sync**: Creates a new database branch named `preview/pr-{number}-{branch}`
- **On PR Close**: Automatically deletes the associated database branch
- **Branch Expiration**: Branches expire after 14 days automatically
- **Database URLs**: Available as workflow outputs for use in other jobs (migrations, tests, etc.)

### Using Neon with Docker Compose
If you're deploying only the backend and want to use Neon instead of local Postgres, set the cloud `DATABASE_URL` in `backend/.env` and omit the `postgres` service in your deployment environment. The app will connect directly to Neon.

This repository does not need any code changes to use Neon, because `backend/database.py` reads `DATABASE_URL` from environment variables and starts SQLAlchemy accordingly.

#### 2. Frontend Setup
```bash
cd frontend

# Install dependencies
npm install

# Set up environment variables
cp .env.local.example .env.local

# Run the frontend
npm run dev
```

#### 3. Admin Setup
The admin panel is hosted in a separate repository: `Sabi-Admin`. Clone and deploy it independently.

## 📚 API Documentation

When the backend is running, visit:
- **API Documentation**: http://localhost:8000/docs
- **Alternative Docs**: http://localhost:8000/redoc

## 🔧 Environment Variables

### Backend (.env)
```env
DATABASE_URL=postgresql://user:password@localhost:5432/sabipath
DEBUG=True
SECRET_KEY=your-secret-key-here
```

### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

## 🎯 User Roles & Permissions

### Student
- Browse and enroll in courses/programs/diplomas
- Track learning progress
- Build portfolio
- Access gamification features

### Teacher
- Create and manage courses
- View student progress
- Access teaching analytics

### Admin
- Full content management
- User management
- System configuration
- Analytics dashboard

### Super Admin
- All admin permissions
- Create/manage programs and diplomas
- System-wide settings

## 📊 Database Schema

The application uses PostgreSQL with the following main entities:
- **Users**: Authentication and profile data
- **Courses**: Learning content with modules and lessons
- **Programs**: Collections of courses
- **Diplomas**: Complete qualification pathways
- **Enrollments**: User progress tracking
- **Assessments**: Quizzes and evaluations
- **Portfolio**: User projects and CV data
- **Gamification**: Points, streaks, achievements

## 🔒 Security Features

- JWT-based authentication
- Password hashing with bcrypt
- CORS protection
- Input validation with Pydantic
- SQL injection prevention
- XSS protection

## 🚀 Deployment

### Production Deployment

1. **Build the applications:**
```bash
# Frontend
cd frontend && npm run build
```

2. **Use production Docker setup:**
```bash
docker-compose -f docker-compose.prod.yml up -d
```

3. **Set up reverse proxy** (nginx recommended) for domain routing

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 📞 Support

For support and questions:
- Create an issue in the repository
- Check the API documentation
- Review the codebase comments

## 🎉 Acknowledgments

- Built with modern web technologies
- Inspired by leading LMS platforms
- Community-driven development
