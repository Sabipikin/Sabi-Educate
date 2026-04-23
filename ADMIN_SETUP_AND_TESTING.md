# Admin Management System - Setup & Testing Guide

## Quick Start

### 1. Prerequisites
- Docker and Docker Compose installed
- Backend and Frontend Next.js apps configured
- Admin portal configured (at `./admin/`)

### 2. Start Services

```bash
# From the sabipath root directory
docker-compose up --build

# This will start:
# - PostgreSQL database (port 5432)
# - FastAPI backend (port 8000)
# - Frontend app (port 3000)
# - Admin portal (port 3002)
```

Or run services locally:

**Backend:**
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
python main.py
# Backend runs at http://localhost:8000
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev
# Frontend runs at http://localhost:3000
```

**Admin Portal:**
```bash
cd admin
npm install
npm run dev
# Admin runs at http://localhost:3002
```

## Testing Workflow

### Phase 1: Bootstrap Super Admin

**Endpoint:** `POST /api/admin/bootstrap-super-admin`

Only works if no super admin exists yet.

```bash
curl -X POST http://localhost:8000/api/admin/bootstrap-super-admin \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "full_name": "Super Admin",
    "username": "superadmin",
    "password": "AdminPassword123",
    "role_name": "super_admin",
    "department": "Management"
  }'
```

**Expected Response:**
```json
{
  "id": 1,
  "user_id": 1,
  "role_id": 1,
  "username": "superadmin",
  "department": "Management",
  "theme_preference": "dark",
  "is_verified": true,
  "created_at": "2026-04-21T10:00:00",
  "updated_at": "2026-04-21T10:00:00"
}
```

### Phase 2: Login at Frontend

1. Visit **http://localhost:3000/login**
2. Enter credentials:
   - Email: `admin@example.com`
   - Password: `AdminPassword123`
3. Click "Login"

**Expected Behavior:**
- Frontend detects admin user
- Automatically redirects to **http://localhost:3002/dashboard**
- Admin token and theme preference stored in localStorage
- Dashboard loads with Super Admin menu options

### Phase 3: Create Additional Admin Users

**Via API:**
```bash
ADMIN_TOKEN="<token_from_login>"

curl -X POST http://localhost:8000/api/admin/register \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -d '{
    "email": "staff@example.com",
    "full_name": "Admin Staff Member",
    "username": "staff_member",
    "password": "StaffPass123",
    "role_name": "admin_staff",
    "department": "Support"
  }'
```

**Via Admin Portal:**
1. Log in to **http://localhost:3002** as super admin
2. Navigate to **Users** (Super Admin menu)
3. Click **+ New Admin User**
4. Fill form:
   - Email: `staff@example.com`
   - Full Name: `Admin Staff Member`
   - Username: `staff_member`
   - Password: `StaffPass123`
   - Role: `Admin Staff`
   - Department: `Support`
5. Click **Create User**

### Phase 4: Test Admin Settings

1. Click **⚙️ Settings** in sidebar or user section
2. Update profile:
   - Change username
   - Toggle theme (Dark/Light mode)
   - Click **Update Profile**
3. Change password:
   - Enter current password
   - Enter new password
   - Confirm new password
   - Click **Change Password**
4. Verify theme persists on page reload

### Phase 5: Test User Management (Super Admin Only)

Navigate to **Users** page:
1. View all admin users in table
2. **Create User** - Add new admin
3. **Edit User** - Update username, department, role
4. **Delete User** - Remove admin (confirm with modal)

### Phase 6: Test Role-Based Access

Create users with different roles and test endpoints:

#### Teacher Role
```bash
# Create teacher
curl -X POST http://localhost:8000/api/admin/register \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -d '{
    "email": "teacher@example.com",
    "full_name": "Jane Teacher",
    "username": "jane_teacher",
    "password": "TeacherPass123",
    "role_name": "teacher"
  }'

# Login as teacher (creates their token)
TEACHER_TOKEN="<token_from_login>"

# Teacher can view their courses
curl -X GET http://localhost:8000/api/admin/my-courses \
  -H "Authorization: Bearer $TEACHER_TOKEN"

# Teacher cannot view all courses (super admin only)
curl -X GET http://localhost:8000/api/admin/courses \
  -H "Authorization: Bearer $TEACHER_TOKEN"
# Expected: 403 Forbidden
```

#### Accounts Role
```bash
# Create accounts user
curl -X POST http://localhost:8000/api/admin/register \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -d '{
    "email": "accounts@example.com",
    "full_name": "Accounts Manager",
    "username": "accounts_mgr",
    "password": "AccountsPass123",
    "role_name": "accounts"
  }'

# Accounts can view payments
curl -X GET http://localhost:8000/api/admin/payments \
  -H "Authorization: Bearer $ACCOUNTS_TOKEN"

# Accounts cannot view courses analytics
curl -X GET http://localhost:8000/api/admin/analytics \
  -H "Authorization: Bearer $ACCOUNTS_TOKEN"
# Expected: 403 Forbidden
```

### Phase 7: API Reference

#### Personal Settings Endpoints
All authenticated admins can use these:

**Get Current Admin Info**
```bash
GET /api/admin/me
Authorization: Bearer <token>
```

**Update Personal Settings**
```bash
PUT /api/admin/me/settings
Authorization: Bearer <token>
Content-Type: application/json

{
  "username": "new_username",
  "theme_preference": "white",
  "password": "optional_new_password"
}
```

**Change Own Password**
```bash
PUT /api/admin/me/password
Authorization: Bearer <token>
Content-Type: application/json

{
  "old_password": "current_password",
  "new_password": "new_password"
}
```

#### Super Admin User Management
Super admin only:

**Get All Admin Users**
```bash
GET /api/admin/users
Authorization: Bearer <token>
```

**Update Admin User**
```bash
PUT /api/admin/users/{user_id}
Authorization: Bearer <token>
Content-Type: application/json

{
  "username": "new_username",
  "email": "new@example.com",
  "full_name": "Full Name",
  "department": "Department",
  "role_name": "admin_staff"
}
```

**Delete Admin User**
```bash
DELETE /api/admin/users/{user_id}
Authorization: Bearer <token>
```

**Change Admin User Password**
```bash
PUT /api/admin/users/{user_id}/password
Authorization: Bearer <token>
Content-Type: application/json

{
  "old_password": "dummy",
  "new_password": "new_password"
}
```

#### Dashboard Stats
```bash
GET /api/admin/dashboard-stats
Authorization: Bearer <token>

# Response based on role:
# Super Admin: total_users, total_courses, total_complaints, total_revenue
# Teacher: my_courses, total_students
# Admin Staff: total_complaints, open_complaints
# Accounts: total_payments, pending_payments, total_revenue
```

## Troubleshooting

### Issue: "Super admin already exists"
**Solution:** Bootstrap endpoint only works once. If you need to reset, delete the AdminUser records from the database.

### Issue: "Not an admin user" error
**Solution:** Ensure user was created as an admin via bootstrap or register endpoints. Regular users cannot access admin endpoints.

### Issue: Theme not persisting
**Solution:** Check browser's localStorage. Settings should show `adminTheme` key with value `dark` or `white`.

### Issue: CORS errors
**Solution:** Verify in `backend/main.py` that all frontend ports are included in CORS allowed_origins:
```python
allow_origins=[
    "http://localhost:3000",  # Frontend
    "http://localhost:3002",  # Admin
    "http://localhost:8000",  # Backend
]
```

### Issue: Token invalid after login redirect
**Solution:** Ensure frontend is storing token correctly in localStorage and passing in Authorization header. Check that token is being validated in backend.

## Architecture Notes

### Database Schema Changes
- **AdminUser** model: Added `username`, `theme_preference`, `updated_at`
- **User** model: Linked to AdminUser via `user_id`

### Authentication Flow
1. User logs in at `/login`
2. Credentials validated against User table
3. JWT token generated
4. Frontend checks if user has AdminUser record
5. If admin, token and role stored in localStorage
6. Redirect to `/dashboard` (regular) or admin dashboard (admin)

### Role-Based Access Control (RBAC)
- **super_admin**: Full system access, user management
- **admin_staff**: Support tickets, complaints management
- **accounts**: Payment processing and tracking
- **teacher**: Course creation and student management
- **support**: Ticket handling

### Data Storage
- **Tokens**: localStorage `adminToken`
- **Admin Role**: localStorage `adminRole`
- **Theme**: localStorage `adminTheme`
- **User Token**: localStorage `userToken` (shared with main app)

## Next Steps

1. Complete testing of all role-based access controls
2. Set up analytics page for super admin
3. Implement complaint management system for admin staff
4. Add payment processing dashboard for accounts team
5. Create audit logs for admin actions
6. Set up email notifications for admin events
