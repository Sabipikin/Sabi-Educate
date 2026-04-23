import { useEffect, useState } from 'react';
import { AdminLayout } from '@/components/AdminLayout';
import { useAdminAuth } from '@/context/AdminAuthContext';

interface AdminUser {
  id: number;
  user_id: number;
  role_id: number;
  username: string;
  email?: string;
  full_name?: string;
  role_name?: string;
  is_active?: boolean;
  department?: string;
  theme_preference: string;
  is_verified: boolean;
  created_at: string;
  updated_at?: string;
  last_login?: string;
}

interface FormData {
  email: string;
  full_name: string;
  username: string;
  password: string;
  role_name: string;
  department: string;
  is_active: boolean;
}

export default function AdminUsers() {
  const { token } = useAdminAuth();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openModal, setOpenModal] = useState(false);
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);
  const [formData, setFormData] = useState<FormData>({
    email: '',
    full_name: '',
    username: '',
    password: '',
    role_name: 'admin_staff',
    department: '',
    is_active: true,
  });

  useEffect(() => {
    if (!token) return;
    fetchUsers();
  }, [token]);

  const fetchUsers = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/admin/users', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error('Failed to fetch users');
      const data = await response.json();
      setUsers(Array.isArray(data) ? data : []);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };
  const handleOpenModal = (user?: AdminUser) => {
    if (user) {
      setEditingUser(user);
      setFormData({
        email: user.email || '',
        full_name: user.full_name || '',
        username: user.username,
        password: '',
        role_name: user.role_name || getRoleName(user.role_id).toLowerCase().replace(' ', '_'),
        department: user.department || '',
        is_active: user.is_active ?? true,
      });
    } else {
      setEditingUser(null);
      setFormData({
        email: '',
        full_name: '',
        username: '',
        password: '',
        role_name: 'admin_staff',
        department: '',
        is_active: true,
      });
    }
    setOpenModal(true);
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const response = await fetch('http://localhost:8000/api/admin/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          email: formData.email,
          full_name: formData.full_name,
          username: formData.username,
          password: formData.password,
          role_name: formData.role_name,
          department: formData.department || null,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.detail || 'Failed to create user');
      }

      setOpenModal(false);
      await fetchUsers();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Creation failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;

    setSubmitting(true);
    setError(null);

    try {
      const response = await fetch(
        `http://localhost:8000/api/admin/users/${editingUser.id}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            email: formData.email,
            full_name: formData.full_name,
            username: formData.username,
            department: formData.department || null,
            role_name: formData.role_name,
            is_active: formData.is_active,
          }),
        }
      );

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.detail || 'Failed to update user');
      }

      if (formData.password) {
        const passwordResponse = await fetch(
          `http://localhost:8000/api/admin/users/${editingUser.id}/password`,
          {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ new_password: formData.password }),
          }
        );
        if (!passwordResponse.ok) {
          const data = await passwordResponse.json();
          throw new Error(data.detail || 'Failed to update password');
        }
      }

      setOpenModal(false);
      await fetchUsers();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Update failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteUser = async (userId: number) => {
    setSubmitting(true);
    setError(null);

    try {
      const response = await fetch(
        `http://localhost:8000/api/admin/users/${userId}`,
        {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.detail || 'Failed to delete user');
      }

      setDeleteConfirm(null);
      await fetchUsers();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Delete failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleAdminActive = async (user: AdminUser) => {
    setSubmitting(true);
    setError(null);

    try {
      const response = await fetch(`http://localhost:8000/api/admin/users/${user.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          email: user.email,
          full_name: user.full_name,
          username: user.username,
          department: user.department || null,
          role_name: user.role_name || getRoleName(user.role_id).toLowerCase().replace(' ', '_'),
          is_active: !user.is_active,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.detail || 'Failed to update status');
      }

      await fetchUsers();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Update failed');
    } finally {
      setSubmitting(false);
    }
  };

  const getRoleName = (roleId: number) => {
    const roleNames: { [key: number]: string } = {
      1: 'Super Admin',
      2: 'Teacher',
      3: 'Admin Staff',
      4: 'Accounts',
      5: 'Support',
    };
    return roleNames[roleId] || 'Unknown';
  };

  if (loading) {
    return (
      <AdminLayout>
        <p className="text-gray-400">Loading admin users...</p>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-white">Admin Users Management</h1>
          <button
            onClick={() => handleOpenModal()}
            className="bg-cyan-600 hover:bg-cyan-700 text-white px-4 py-2 rounded-lg font-semibold transition"
          >
            + Create Admin User
          </button>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-3">
            <p className="text-red-400">{error}</p>
          </div>
        )}

        {users.length > 0 ? (
          <div className="bg-gray-800 rounded-lg overflow-hidden border border-gray-700">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-900 border-b border-gray-700">
                  <th className="px-6 py-3 text-left text-gray-300 font-semibold">Username</th>
                  <th className="px-6 py-3 text-left text-gray-300 font-semibold">Role</th>
                  <th className="px-6 py-3 text-left text-gray-300 font-semibold">Department</th>
                  <th className="px-6 py-3 text-left text-gray-300 font-semibold">Status</th>
                  <th className="px-6 py-3 text-left text-gray-300 font-semibold">Created</th>
                  <th className="px-6 py-3 text-left text-gray-300 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} className="border-b border-gray-700 hover:bg-gray-750 transition">
                    <td className="px-6 py-3 text-white font-medium">{user.username}</td>
                    <td className="px-6 py-3 text-white">{getRoleName(user.role_id)}</td>
                    <td className="px-6 py-3 text-gray-400">{user.department || '—'}</td>
                    <td className="px-6 py-3">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          user.is_verified
                            ? 'bg-green-500/20 text-green-400'
                            : 'bg-yellow-500/20 text-yellow-400'
                        }`}
                      >
                        {user.is_verified ? 'Verified' : 'Pending'}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-gray-400 text-sm">
                      {new Date(user.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-3 text-sm space-x-2">
                      <button
                        onClick={() => handleOpenModal(user)}
                        className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => setDeleteConfirm(user.id)}
                        className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded-lg transition"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          !loading && (
            <div className="bg-gray-800 rounded-lg border border-gray-700 p-6 text-center">
              <p className="text-gray-400">No admin users found. Create one to get started!</p>
            </div>
          )
        )}
      </div>

      {/* Create/Edit Modal */}
      {openModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-800 rounded-lg border border-gray-700 p-6 w-full max-w-md">
            <h2 className="text-2xl font-bold text-white mb-6">
              {editingUser ? 'Edit Admin User' : 'Create Admin User'}
            </h2>

            <form
              onSubmit={editingUser ? handleUpdateUser : handleCreateUser}
              className="space-y-4"
            >
              {!editingUser && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                      placeholder="admin@example.com"
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-cyan-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={formData.full_name}
                      onChange={(e) =>
                        setFormData({ ...formData, full_name: e.target.value })
                      }
                      placeholder="John Doe"
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-cyan-500"
                      required
                    />
                  </div>
                </>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Username
                </label>
                <input
                  type="text"
                  value={formData.username}
                  onChange={(e) =>
                    setFormData({ ...formData, username: e.target.value })
                  }
                  placeholder="johndoe"
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-cyan-500"
                  required
                />
              </div>

              {!editingUser && (
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Password
                  </label>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) =>
                      setFormData({ ...formData, password: e.target.value })
                    }
                    placeholder="••••••••"
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-cyan-500"
                    required
                  />
                </div>
              )}

              {!editingUser && (
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Role
                  </label>
                  <select
                    value={formData.role_name}
                    onChange={(e) =>
                      setFormData({ ...formData, role_name: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-cyan-500"
                  >
                    <option value="teacher">Teacher</option>
                    <option value="admin_staff">Admin Staff</option>
                    <option value="accounts">Accounts</option>
                    <option value="support">Support</option>
                  </select>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Department (Optional)
                </label>
                <input
                  type="text"
                  value={formData.department}
                  onChange={(e) =>
                    setFormData({ ...formData, department: e.target.value })
                  }
                  placeholder="Engineering, Support, etc."
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setOpenModal(false)}
                  className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg disabled:opacity-50 transition font-semibold"
                >
                  {submitting ? 'Saving...' : editingUser ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm !== null && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-800 rounded-lg border border-gray-700 p-6 w-full max-w-sm">
            <h2 className="text-xl font-bold text-white mb-4">Delete Admin User?</h2>
            <p className="text-gray-400 mb-6">
              Are you sure you want to delete this user? This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteUser(deleteConfirm)}
                disabled={submitting}
                className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg disabled:opacity-50 transition font-semibold"
              >
                {submitting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
