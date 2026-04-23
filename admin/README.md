# Sabipath Admin Portal

A separate Next.js application for administrative management of the Sabipath platform.

## Features

- **5 Admin Role Types**: Super Admin, Teacher, Admin Staff, Accounts Team, Support
- **Role-Based Dashboards**: Each role has access to relevant features
- **Super Admin**: Analytics, user management, course oversight, payment tracking
- **Teachers**: Course creation and management, student progress tracking
- **Admin Staff**: Student management, complaint handling
- **Accounts Team**: Payment and invoice management
- **Support**: Ticket and issue management

## Installation

```bash
npm install
```

## Development

Run the development server on port 3002 (separate from main frontend on port 3001):

```bash
npm run dev
# Runs on http://localhost:3002
```

## Building

```bash
npm run build
npm start
```

## Architecture

- `/context` - AdminAuthContext for authentication state management
- `/components` - Reusable components like AdminLayout sidebar
- `/pages` - Next.js page routes organized by role
- `/styles` - Global CSS with Tailwind
- `/services` - API client services (can be added for data fetching)

## Environment Variables

Required API endpoint:
- Backend API: `http://localhost:8000` (configured in code, can be made configurable)

## Admin Access Flow

1. Navigate to `http://localhost:3002/login`
2. Authenticate with admin credentials
3. Backend verifies admin status via `/api/admin/dashboard-stats`
4. Token stored in localStorage for subsequent requests
5. Role-based navigation rendered in sidebar layout

## Pages Structure

```
/login                          - Admin login page
/dashboard                      - Role-specific dashboard
/super-admin/
  - analytics                   - System analytics and metrics
  - users                       - Admin user management
  - courses                     - Course oversight
  - payments                    - Payment tracking
/teacher/
  - my-courses                  - Teacher's course management
  - assignments                 - Student progress supervision
/staff/
  - students                    - Student management
  - complaints                  - Support complaints handling
/accounts/
  - payments                    - Payment management
  - invoices                    - Invoice management
```

## Deployment

This admin app runs as a separate service. Deploy independently from the main frontend:

```bash
# Build for production
npm run build

# Start production server (default port 3000, or 3002 if configured)
npm start
```

## Styling

- Dark theme: `#0a0a0a` background, `#1a1a1a` cards
- Primary color: `#00d4ff` (cyan accents)
- Tailwind CSS v4 with custom theme
- Responsive design (mobile, tablet, desktop)

---

**Note**: Admin must be deployed and run separately from the main frontend application for proper isolation and scalability.
