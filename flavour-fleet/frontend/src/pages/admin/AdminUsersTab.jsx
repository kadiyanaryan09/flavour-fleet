import { useEffect, useState } from 'react';
import api from '../../api/client.js';

export default function AdminUsersTab() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    api.get('/admin/users').then(({ data }) => setUsers(data.users)).finally(() => setLoading(false));
  };
  useEffect(load, []);

  const toggleActive = async (id, isActive) => {
    await api.patch(`/admin/users/${id}/active`, { isActive: !isActive });
    setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, is_active: !isActive } : u)));
  };

  if (loading) return <p className="text-gray-500">Loading…</p>;

  return (
    <div className="bg-white rounded-2xl shadow-card overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-gray-50 text-left text-gray-500">
          <tr><th className="p-3">Name</th><th className="p-3">Email</th><th className="p-3">Orders</th><th className="p-3">Status</th><th className="p-3"></th></tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr key={u.id} className="border-t border-gray-100">
              <td className="p-3">{u.name}{u.is_admin ? ' (admin)' : ''}</td>
              <td className="p-3">{u.email}</td>
              <td className="p-3">{u.order_count}</td>
              <td className="p-3">{u.is_active ? 'Active' : 'Deactivated'}</td>
              <td className="p-3">
                {!u.is_admin && (
                  <button onClick={() => toggleActive(u.id, u.is_active)} className="text-fleet-600 underline">
                    {u.is_active ? 'Deactivate' : 'Reactivate'}
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
