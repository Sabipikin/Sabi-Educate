from backend.database import SessionLocal
from backend.models import User, AdminUser, Role

db = SessionLocal()
admin_users = db.query(AdminUser).all()
print(f'Total admin users: {len(admin_users)}')
for admin in admin_users:
    user = db.query(User).filter(User.id == admin.user_id).first()
    role = db.query(Role).filter(Role.id == admin.role_id).first()
    print(f'  - {user.email} | Role: {role.name if role else "N/A"}')
db.close()
